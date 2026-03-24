## Why

当 VSCode 启用 word wrap（自动换行）时，一行过长的文本会在视觉上折行显示。当前实现使用 `before` decoration 在每行开头显示 blame 信息，但 decoration 只附着在文档行上，不会在折行处显示，导致 blame 列在视觉上不连续。

这在 Markdown 等经常有长行的文件中尤为明显，影响用户阅读体验。

## What Changes

- 添加 gutter 颜色指示器功能：在编辑器 gutter 区域（行号左侧）显示基于提交时间的颜色方块
- gutter 指示器会在每个视觉行上显示，包括折行部分，确保 word wrap 时 blame 列视觉连续
- 第一行保持当前的 `[日期  作者]` 文本显示
- 折行处只显示颜色指示器（与第一行颜色一致），不显示文本

视觉效果：
```
┌─────────────────────────────────────────────────────────────────┐
│ ███  [2025/03/23  alice] this is a very long line of markdown  │
│ ███                      text that continues on wrapped visual │
│ ███                      and wraps again for long paragraphs   │
│ ███  [2025/03/22  bob]   next line with different author       │
└─────────────────────────────────────────────────────────────────┘
```

## Capabilities

### New Capabilities
- `word-wrap-gutter-indicator`: 使用 gutter 颜色指示器支持 word wrap 时的连续 blame 显示

### Modified Capabilities
- 无现有规格需要修改，此为纯新增功能

## Impact

- **代码修改**: 主要修改 `decoratorManager.ts`，添加 gutter 图标生成和设置逻辑
- **API 变更**: 使用 VSCode 的 `DecorationRenderOptions.gutterIconPath` 和 `DecorationRenderOptions.gutterIconSize`
- **配置变更**: 无需新增配置项，复用现有颜色方案配置
- **性能影响**: gutter 图标使用 SVG Data URI，性能开销可忽略
