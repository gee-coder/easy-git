## Context

### 当前实现

当前 `git-blms.enabled` 配置有双重语义，既控制扩展是否工作，又影响默认显示状态。代码实现中存在以下问题：

1. **命令修改设置**: `extension.ts` 中的 `showBlame` 和 `showGutter` 命令会检查 `config.enabled`，如果为 false 则调用 `setEnabled(true)` 修改 settings.json
2. **初始化耦合**: `initialize()` 函数在 `enabled=true` 时同时设置 `gutterEnabled=true` 和 `annotationEnabled=true`
3. **状态关系不清**: `enabled`、`gutterEnabled`、`annotationEnabled` 三者的关系和优先级不明确

### 架构约束

- VS Code 扩展 API 限制: 运行时状态不自动持久化
- 用户体验: 右键菜单应该是临时操作，不应该修改全局设置
- 配置语义: `enabled` 应该是简单的布尔开关，不应承载过多含义

## Goals / Non-Goals

**Goals:**
- 重新定义 `git-blms.enabled` 为仅控制 Blame (inline annotations) 的启动状态
- Gutter 默认隐藏，由用户通过右键菜单按需启用
- 右键菜单命令只控制运行时状态，不修改 settings.json
- 每次重启根据 `enabled` 重新初始化，不保存运行时状态

**Non-Goals:**
- 不添加新的持久化状态存储 (workspaceState/globalStorage)
- 不改变 `showGutter`/`hideGutter`/`showBlame`/`hideBlame` 命令的基本功能
- 不修改 Gutter 和 Blame 的渲染逻辑

## Decisions

### Decision 1: 启动时 Gutter 默认隐藏

**选择**: 初始化时 `gutterEnabled` 始终为 `false`

**理由**:
- Gutter 颜色指示器是辅助功能，不是核心功能
- 减少视觉干扰，用户可以按需启用
- 与 `enabled` 配置解耦

**替代方案**:
- 添加单独的 `gutterEnabled` 配置项 → 拒绝，增加配置复杂度
- 保存上次运行时状态 → 拒绝，用户要求每次重新初始化

### Decision 2: `enabled` 仅控制 Blame 启动状态

**选择**: `annotationEnabled` 初始值 = `enabled`，`gutterEnabled` 初始值 = `false`

**理由**:
- Blame (inline annotations) 是扩展的核心功能
- 用户习惯通过 `enabled` 控制主要功能的开关
- 保持配置语义简单清晰

**状态关系图**:
```
启动时:
  enabled=true  → annotationEnabled=true, gutterEnabled=false
  enabled=false → annotationEnabled=false, gutterEnabled=false

运行时:
  showBlame/hideBlame → 只改变 annotationEnabled
  showGutter/hideGutter → 只改变 gutterEnabled
  都不修改 enabled
```

### Decision 3: 右键菜单命令不修改 settings

**选择**: 移除 `setEnabled()` 调用，命令直接设置运行时状态

**当前行为** (extension.ts:44-67):
```typescript
registerCommand(COMMAND_SHOW_BLAME, async () => {
  const config = getExtensionConfig();
  if (!config.enabled) {
    await setEnabled(true);  // ← 修改 settings
  }
  dm.setAnnotationEnabled(true);
  await updateAnnotationEnabledContext(true);
});
```

**新行为**:
```typescript
registerCommand(COMMAND_SHOW_BLAME, async () => {
  const config = getExtensionConfig();
  if (!config.enabled) {
    return;  // 不显示，但不修改设置
  }
  dm.setAnnotationEnabled(true);
  await updateAnnotationEnabledContext(true);
});
```

**理由**:
- 用户期望右键菜单是临时操作
- 避免意外修改配置文件
- 简化命令逻辑

### Decision 4: 不使用 workspaceState 保存运行时状态

**选择**: 每次重启根据 `enabled` 重新初始化

**理由**:
- 用户明确要求不保存状态
- 减少状态管理的复杂度
- `enabled` 配置已足够控制启动行为

## Risks / Trade-offs

### Risk 1: 用户期望状态持久化

**描述**: 用户可能期望运行时的 show/hide 操作在重启后保持

**缓解**:
- 发布说明中明确说明行为变更
- `enabled` 配置提供足够控制能力

### Risk 2: enabled=false 时命令无响应

**描述**: 当 `enabled=false` 时，右键菜单命令可能无任何效果，用户困惑

**缓解**:
- 当 `enabled=false` 时，相关菜单项通过 `when` 子句自动隐藏
- 当前 `package.json` 已有 `when: "gitBlms.enabled"` 控制

### Risk 3: BREAKING 变更影响现有用户

**描述**: Gutter 默认从显示变为隐藏

**缓解**:
- 发布说明中明确告知
- 用户可以通过右键菜单重新启用 Gutter

## Migration Plan

### 代码变更

1. **修改 `extension.ts` 初始化逻辑**:
   ```typescript
   // 旧代码 (line 161-165)
   decoratorManager.setGutterEnabled(true);
   decoratorManager.setAnnotationEnabled(true);

   // 新代码
   decoratorManager.setGutterEnabled(false);
   decoratorManager.setAnnotationEnabled(enabled);
   ```

2. **修改右键菜单命令**:
   - `COMMAND_SHOW_BLAME`: 移除 `setEnabled(true)` 调用
   - `COMMAND_SHOW_GUTTER`: 移除 `setEnabled(true)` 调用

3. **更新 spec 文档**:
   - 修改 `openspec/specs/display-mode-control/spec.md` 中的默认状态场景

### 发布说明

```
BREAKING: Gutter 颜色指示器现在默认隐藏

- 之前: 启用扩展时 Gutter 和 Blame 都显示
- 之后: 启用扩展时只有 Blame 显示，Gutter 需要通过右键菜单启用

右键菜单命令不再修改 git-blms.enabled 设置

- 之前: 点击 "Show Inline Git Blame" 会自动启用扩展
- 之后: 只有当 git-blms.enabled=true 时命令才生效

如需恢复之前的行为:
1. 在 settings.json 中设置 "git-blms.enabled": true
2. 使用右键菜单 → "Show Git Gutter" 启用颜色指示器
```

### 回滚策略

如果出现问题，可以通过 git revert 回退到变更前的 commit
