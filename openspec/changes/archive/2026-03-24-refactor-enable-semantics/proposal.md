## Why

当前 `git-blms.enabled` 配置的语义不清晰，右键菜单命令会修改全局设置，导致用户体验混乱。

**问题 1: 右键菜单修改全局设置**
- 点击 "Show Inline Git Blame" 或 "Show Git Gutter" 会自动调用 `setEnabled(true)` 修改 settings.json
- 用户只想临时显示某个功能，不需要持久化修改配置

**问题 2: `enabled` 语义不清**
- 当前实现中 `enabled` 同时控制扩展是否工作以及默认显示状态
- Gutter 和 Blame (inline annotations) 都受 `enabled` 影响，但用户希望独立控制

**问题 3: 启动默认行为不符合预期**
- 用户希望: Gutter 默认隐藏，`enabled` 只控制 Blame 的启动状态
- 当前实现: `enabled=true` 时同时启用 Gutter 和 Blame

## What Changes

1. **重新定义 `git-blms.enabled` 语义**
   - `enabled` 仅控制重启时 Blame (inline annotations) 的默认显示状态
   - 不控制 Gutter 颜色指示器

2. **修改启动默认行为**
   - Gutter 默认隐藏 (`gutterEnabled = false`)
   - Blame 默认状态由 `enabled` 配置决定 (`annotationEnabled = enabled`)

3. **右键菜单命令不修改 settings**
   - `showBlame`/`hideBlame` 只设置运行时状态，不调用 `setEnabled()`
   - `showGutter`/`hideGutter` 只设置运行时状态，不调用 `setEnabled()`

4. **运行时状态不持久化**
   - 每次重启根据 `enabled` 重新初始化
   - 运行时的 show/hide 不保存到配置

## Capabilities

### New Capabilities
无新功能

### Modified Capabilities

- **`display-mode-control`**: 修改默认启动行为和命令执行逻辑
  - **旧**: 默认同时启用 Gutter 和 Blame；命令可能修改 `enabled` 设置
  - **新**: Gutter 默认隐藏，Blame 默认由 `enabled` 控制；命令不修改设置

- **`extension-lifecycle`**: 修改初始化逻辑
  - **旧**: 初始化时如果 `enabled=true`，同时启用 Gutter 和 Blame
  - **新**: 初始化时 Gutter 永远默认隐藏，Blame 由 `enabled` 决定

## Impact

- **修改文件**:
  - `src/extension.ts`: 修改命令注册和初始化逻辑
  - `openspec/specs/display-mode-control/spec.md`: 更新默认行为场景

- **行为变更** (BREAKING):
  - 用户升级后，Gutter 将默认隐藏（之前是默认显示）
  - 右键菜单命令不再自动启用扩展并保存设置

- **用户体验改进**:
  - 右键菜单行为更符合直觉：只控制显示/隐藏
  - `enabled` 配置语义更清晰：仅控制 Blame 启动状态
