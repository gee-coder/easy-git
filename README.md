# Easy Git

Easy Git is a VS Code extension that brings a GoLand-style inline Git blame experience into the editor.
Easy Git 是一个面向 VS Code 的 Git 追溯注解扩展，目标体验参考 GoLand 的 annotate / blame 视图。

## Home / 主页

- Repository / 仓库主页: [https://github.com/gee-coder/easy-git.git](https://github.com/gee-coder/easy-git.git)
- Issues / 问题反馈: [https://github.com/gee-coder/easy-git/issues](https://github.com/gee-coder/easy-git/issues)

## 1.0.0 Highlights / 1.0.0 版本亮点

- GoLand-inspired left-side blame column with stable layout
- Age-based color buckets that make new and old code easy to scan at a glance
- Hover details for author, commit time, hash, and summary
- `git blame --contents -` support for unsaved editor content
- Dedicated configurable style for uncommitted lines
- Built-in Chinese and English runtime text, plus a custom extension icon

- 参考 GoLand 的左侧 blame 信息栏，布局稳定不顶代码
- 按代码年龄分层的颜色色阶，便于快速识别新旧代码
- 悬浮查看作者、提交时间、哈希和提交摘要
- 支持未保存文件，优先基于当前编辑器内容执行 `git blame --contents -`
- 未提交代码有单独的可配置样式
- 内置中英文运行时文案，并提供自定义插件图标

## Features / 功能概览

- Stable left-side blame column that shows date and author per line
- Bucketed age colors that emphasize visual contrast instead of a simple alpha fade
- Hover-only commit details on the blame area to avoid blocking the code editor
- Large-file guardrails and blame caching to reduce performance cost
- Configurable maximum annotation width for compact blame layout

- 稳定的左侧 blame 信息栏，按行显示日期和作者
- 采用时间桶色阶，而不是简单透明度叠加，视觉层次更清晰
- 悬浮信息只附着在 blame 区域，尽量避免遮挡代码编辑区
- 提供大文件保护和 blame 缓存，降低性能开销
- 支持配置 blame 栏最大宽度，避免无意义留白

## Install / 安装

1. Install the extension from the packaged `.vsix` file or your release artifact.
2. Open a Git-managed workspace in VS Code.
3. Run `Git: Toggle Inline Git Blame` from the command palette.

1. 通过打包好的 `.vsix` 文件或 release 附件安装扩展。
2. 用 VS Code 打开一个受 Git 管理的项目。
3. 在命令面板执行 `Git: Toggle Inline Git Blame`。

Default keybinding / 默认快捷键:

- Windows / Linux: `Ctrl+Alt+B`
- macOS: `Cmd+Alt+B`

## Commands / 命令

- `Git: Toggle Inline Git Blame`
- `Git: Show Inline Git Blame`
- `Git: Hide Inline Git Blame`
- `Git: Open Commit Details`

## Configuration / 配置项

| Setting | Default | Description |
| --- | --- | --- |
| `easy-git.enabled` | `false` | Enables inline blame annotations globally / 全局启用或关闭行内追溯注解 |
| `easy-git.colorScheme` | `"blue"` | Annotation palette: `blue`, `green`, `purple` / 注解主色调 |
| `easy-git.dateFormat` | `"absolute"` | `relative` or `absolute` timestamp display / 时间显示格式 |
| `easy-git.maxLineCount` | `5000` | Skip blame rendering for very large files / 大文件保护阈值 |
| `easy-git.cacheTimeout` | `60000` | Blame cache lifetime in milliseconds / blame 缓存时长（毫秒） |
| `easy-git.maxAnnotationWidth` | `22` | Maximum width of the blame column in `ch` / 左侧 blame 信息栏最大宽度 |
| `easy-git.uncommittedColor` | `"46,160,67"` | Color for uncommitted lines. Supports CSV, `rgb(...)`, and hex / 未提交行颜色，支持 CSV、`rgb(...)` 和十六进制 |
| `easy-git.language` | `"auto"` | UI language: `auto`, `zh-CN`, `en` / 插件显示语言 |

## Notes / 体验说明

VS Code decorations can render a stable info column before code and provide hover details, but they cannot fully reproduce GoLand's clickable gutter text. Easy Git therefore takes the closest practical approach:

- A fixed blame column before code
- Time-bucketed colors with stronger contrast
- Commit actions through hover links and the command palette

VS Code 的装饰器能力可以在代码前渲染稳定信息栏并提供悬浮信息，但不能完全复刻 GoLand gutter 中的可点击文本。Easy Git 采用的是目前最接近的实现：

- 在代码左侧渲染固定 blame 栏
- 使用更有对比度的时间桶色阶
- 通过悬浮链接和命令面板承接提交详情操作

## Development / 开发

```bash
npm install
npm run compile
npm test
```

Press `F5` to launch the extension development host.
按 `F5` 启动扩展开发宿主。
