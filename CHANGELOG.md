# Changelog

All notable changes to this project will be documented in this file.
本项目的重要变更会记录在这里。

## [1.1.0] - TBD

### Breaking

- **Gutter color indicators now default to hidden** on extension activation
  - Previously: When `git-blms.enabled=true`, both gutter indicators and inline annotations were shown
  - Now: When `git-blms.enabled=true`, only inline annotations are shown by default; gutter must be enabled via right-click menu
- **Right-click menu commands no longer modify `git-blms.enabled` setting**
  - Previously: Clicking "Show Inline Git Blame" or "Show Git Gutter" would automatically set `git-blms.enabled=true` in settings.json
  - Now: These commands only work when `git-blms.enabled=true`; they no longer change the setting

### Changed

- `git-blms.enabled` now only controls inline annotation display state on startup, not gutter
- Gutter display state is not persisted; each session starts with gutter hidden

### 重大变更

- **Gutter 颜色指示器现在默认隐藏**
  - 之前：当 `git-blms.enabled=true` 时，gutter 指示器和行内注释都会显示
  - 现在：当 `git-blms.enabled=true` 时，只有行内注释默认显示；gutter 需要通过右键菜单启用
- **右键菜单命令不再修改 `git-blms.enabled` 设置**
  - 之前：点击 "Show Inline Git Blame" 或 "Show Git Gutter" 会自动将 settings.json 中的 `git-blms.enabled` 设为 `true`
  - 现在：这些命令仅在 `git-blms.enabled=true` 时生效；不再修改该设置

### 变更

- `git-blms.enabled` 现在只控制启动时行内注释的显示状态，不影响 gutter
- Gutter 显示状态不持久化；每次会话启动时 gutter 默认隐藏

### Migration / 迁移

To restore previous behavior:
1. Set `"git-blms.enabled": true` in settings.json
2. Right-click in editor → "Show Git Gutter" to enable color indicators

恢复之前行为的方法：
1. 在 settings.json 中设置 `"git-blms.enabled": true`
2. 右键点击编辑器 → "Show Git Gutter" 启用颜色指示器

## [1.0.2] - 2026-03-23

### Added

- **Gutter color indicators** for word wrap support: Color-coded markers in the gutter area that appear on each wrapped line, providing visual continuity when word wrap is enabled
- Colors match the existing age-based annotation scheme for consistency

### 新增

- **Gutter 颜色指示器**支持 word wrap：在 gutter 区域显示基于 blame 信息的颜色标记，当启用 word wrap 时在每个折行上显示，提供视觉连续性
- 颜色与现有的基于年龄的注解颜色方案保持一致

## [1.0.1] - 2026-03-20

### Changed

- Improved structural edit handling for inline blame so Enter is stable and delete-path flashing is reduced
- Split committed and uncommitted decorations to lower full-editor repainting during line merges
- Added hex-based color settings with picker-friendly configuration metadata
- Added a dedicated current-author highlight toggle and refreshed related setting descriptions

## [1.0.0] - 2026-03-20

### Added

- GitBlms 1.0.0: GoLand-style inline Git blame column for VS Code
- Age-bucketed annotation colors with stronger visual contrast
- Hover commit details with author, timestamp, hash, and summary
- Unsaved file support via `git blame --contents -`
- Configurable uncommitted-line color and blame column max width
- Chinese and English runtime language support
- Custom extension icon and refreshed marketplace metadata

### 新增

- GitBlms 1.0.0：面向 VS Code 的 GoLand 风格行内 Git blame 信息栏
- 更有视觉对比度的按代码年龄分层色阶
- 作者、时间、哈希和摘要的悬浮提交详情
- 基于 `git blame --contents -` 的未保存文件支持
- 未提交代码颜色和 blame 栏最大宽度配置
- 中英文运行时语言支持
- 自定义插件图标和更新后的插件说明页元数据
