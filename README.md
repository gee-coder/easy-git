# Easy Git

Easy Git 是一个面向 VS Code 的 Git 追溯注解扩展，目标体验参考 GoLand 的 annotate / blame 视图：

- 在每一行代码前展示 `作者缩写 + 时间`
- 使用整行浅色渐变标识代码的新旧程度
- 右键菜单和快捷键可快速开启或关闭
- 悬浮时查看完整提交信息，并直接跳到提交详情

## 功能概览

- 行内追溯注解：默认关闭，启用后会为当前编辑器中的每一行显示精简的 blame 信息
- 提交年龄渐变：最近提交更深，较旧提交更浅
- 悬浮详情：显示作者、邮箱、时间、提交哈希和提交标题
- 查看提交详情：悬浮提示中的链接，以及命令面板中的 `Git: 查看当前行提交详情`
- 大文件保护：超过 `easy-git.maxLineCount` 自动跳过
- 缓存优化：`easy-git.cacheTimeout` 控制 blame 结果缓存
- 未保存文件支持：优先使用当前编辑器内容，通过 `git blame --contents -` 尽量保持注解与未保存内容同步

## 命令

- `Git: 切换行内追溯注解`
- `Git: 显示行内追溯注解`
- `Git: 隐藏行内追溯注解`
- `Git: 查看当前行提交详情`

默认快捷键：

- Windows / Linux: `Ctrl+Alt+B`
- macOS: `Cmd+Alt+B`

## 配置

| 配置项 | 默认值 | 说明 |
| --- | --- | --- |
| `easy-git.enabled` | `false` | 是否启用行内追溯注解 |
| `easy-git.colorScheme` | `"blue"` | 注解颜色主题，可选 `blue` / `green` / `purple` |
| `easy-git.dateFormat` | `"relative"` | 时间显示格式，可选 `relative` / `absolute` |
| `easy-git.maxLineCount` | `5000` | 最大处理行数 |
| `easy-git.cacheTimeout` | `60000` | blame 缓存时长，单位毫秒 |

## 体验说明

VS Code 扩展 API 当前可以通过装饰器在代码前插入文本并提供悬浮信息，但不能像 GoLand 那样在 gutter 中渲染“可直接点击”的文本按钮。因此，Easy Git 采用了最接近 GoLand 的方案：

- 注解文本显示在行内容前方，形成稳定的左侧信息带
- 整行背景会带有轻量颜色渐变
- 点击动作通过悬浮提示中的命令链接和命令面板提供

## 开发

```bash
npm install
npm run compile
npm test
```

按 `F5` 启动扩展开发宿主。
