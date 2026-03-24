## Context

### Current State
当前 GitBlms 使用 `DecorationRenderOptions.before` 在每行开头显示 blame 信息（日期 + 作者）。这种实现方式在 word wrap 启用时存在问题：decoration 只附着在文档行上，不会在折行的视觉行上显示，导致 blame 列视觉不连续。

### VSCode API Constraints
- `before/after` decorations：基于文档行，折行时只在第一个视觉行显示
- `gutterIconPath`：**基于视觉行**，会在每个折行上渲染（这正是我们需要的行为）
- `gutterIconPath` 只能显示图片，不能直接显示文本

### Key Insight
根据 [VSCode Issue #158837](https://github.com/microsoft/vscode/issues/158837)，`gutterIconPath` 的默认行为是在每个折行上渲染，这与 `before` decoration 的行为相反。这正是实现 word wrap 支持的关键。

## Goals / Non-Goals

**Goals:**
- 在 word wrap 启用时保持 blame 列视觉连续
- 复用现有颜色计算逻辑（基于时间的颜色桶）
- 保持第一行的完整文本信息显示
- 最小化性能影响

**Non-Goals:**
- 在折行处显示完整文本（受 VSCode API 限制）
- 修改现有的颜色方案配置
- 支持自定义 gutter 图标样式

## Decisions

### Decision 1: 使用 gutterIconPath 而非其他方案

**选择：** 使用 `DecorationRenderOptions.gutterIconPath` 显示颜色指示器

**原因：**
- `gutterIconPath` 基于视觉行渲染，天然支持 word wrap
- 无需复杂的折行检测逻辑
- API 稳定，性能开销小

**替代方案考虑：**
- Webview overlay：实现复杂，性能开销大，过度设计
- CodeLens：不适用，CodeLens 显示在行尾而非 gutter
- 折行处添加空 decoration：VSCode API 不支持在折行中间插入 decoration

### Decision 2: SVG Data URI 生成图标

**选择：** 动态生成 SVG Data URI 作为 gutter 图标

**原因：**
- 无需外部图片文件
- 可动态调整颜色
- 性能开销小（SVG 字符串内联）
- 支持透明背景

**实现：**
```typescript
function createColorIndicator(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
    <rect width="12" height="12" fill="${color}" rx="2"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
```

### Decision 3: 复用现有颜色计算逻辑

**选择：** 使用现有的 `calculateAnnotationBackground()` 函数计算 gutter 指示器颜色

**原因：**
- 保持视觉一致性
- 无需新增配置项
- 代码复用，减少维护成本

**颜色映射：**
- 已提交代码：基于时间的颜色桶（blue/green/purple scheme）
- 未提交代码：使用 `uncommittedColor`
- 当前作者高亮：使用 `currentAuthorColor`

### Decision 4: Gutter 图标尺寸和样式

**选择：** 12x12px 圆角矩形，2px 圆角半径

**原因：**
- 12px 与行号列高度协调
- 圆角设计更现代，与 VSCode 风格一致
- 小尺寸不干扰视线

**替代方案考虑：**
- 圆形：更柔和但占用相同空间，无显著优势
- 方形：过于生硬
- 更大尺寸：会挤压行号显示

### Decision 5: 图标生成缓存策略

**选择：** 按颜色值缓存生成的 SVG Data URI

**原因：**
- 颜色数量有限（颜色桶数量 + 配置颜色）
- 避免重复生成相同 SVG 字符串
- 内存开销小（< 10 个缓存项）

**实现：**
```typescript
const colorIndicatorCache = new Map<string, string>();

function getColorIndicator(color: string): string {
  if (!colorIndicatorCache.has(color)) {
    colorIndicatorCache.set(color, createColorIndicator(color));
  }
  return colorIndicatorCache.get(color)!;
}
```

## Risks / Trade-offs

### Risk 1: Gutter 图标可能遮挡其他 gutter 图标

**风险：** 如果其他扩展也使用 gutter，可能发生重叠

**缓解：**
- VSCode gutter 有多列，不同类型的图标在不同列
- GitBlms 的图标在独立列中，不冲突
- 用户可以通过配置禁用此功能

### Risk 2: 折行处只有颜色，信息密度降低

**风险：** 折行处没有文本信息，用户需要移到第一行查看详情

**缓解：**
- 第一行保持完整文本显示
- Hover 功能保留，悬停在 gutter 图标上也可查看详情
- 颜色编码本身可以快速识别代码年龄/作者

### Risk 3: 性能影响

**风险：** 为每行添加 gutter 图标可能增加渲染开销

**缓解：**
- SVG Data URI 是轻量级字符串
- 颜色缓存避免重复生成
- VSCode 的 decoration API 本身已优化
- 现有的大文件保护机制（`maxLineCount`）仍然生效

## Migration Plan

### 部署步骤
1. 更新 `decoratorManager.ts` 添加 gutter 图标逻辑
2. 更新测试用例
3. 发布新版本

### 回滚策略
- 如果用户反馈不佳，可通过配置项禁用 gutter 图标
- 无数据迁移，纯显示层变更
- 可安全回滚到之前版本

## Open Questions

- **Q1:** 是否需要配置项让用户选择是否启用 gutter 图标？
  - **倾向：** 暂不添加，先观察用户反馈。如果需要，可作为后续增强

- **Q2:** 是否支持自定义 gutter 图标样式（圆形/方形/其他）？
  - **倾向：** 暂不支持，保持简单。可在未来版本中考虑

- **Q3:** 未提交行的 gutter 图标颜色如何处理？
  - **决定：** 使用 `uncommittedColor` 配置，与 before decoration 一致
