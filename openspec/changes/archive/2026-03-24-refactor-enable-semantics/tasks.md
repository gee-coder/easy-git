## 1. 修改初始化逻辑

- [x] 1.1 修改 `extension.ts` 中的 `initialize()` 函数，将 `gutterEnabled` 初始值改为 `false`
- [x] 1.2 修改 `extension.ts` 中的 `initialize()` 函数，将 `annotationEnabled` 初始值改为从 `enabled` 配置读取
- [x] 1.3 确保 `enabled=false` 时，两个显示状态都初始化为 `false`

## 2. 修改右键菜单命令

- [x] 2.1 修改 `COMMAND_SHOW_BLAME` 命令，移除 `setEnabled(true)` 调用，改为直接返回
- [x] 2.2 修改 `COMMAND_SHOW_GUTTER` 命令，移除 `setEnabled(true)` 调用，改为直接返回
- [x] 2.3 确保命令在 `enabled=false` 时不执行任何操作（直接 return）

## 3. 更新规格文档

- [x] 3.1 更新 `openspec/specs/display-mode-control/spec.md` 中的 "默认状态" 场景
- [x] 3.2 添加 "启用 Gutter 颜色指示器" 场景的 `GIVEN enabled=true` 前置条件
- [x] 3.3 添加 "启用行内注释" 场景的 `GIVEN enabled=true` 前置条件
- [x] 3.4 在 `openspec/specs/extension-lifecycle/spec.md` 中添加新的 "扩展启动初始化" 需求

## 4. 验证和测试

- [ ] 4.1 测试 `enabled=true` 时启动，验证 Blame 显示、Gutter 隐藏
- [ ] 4.2 测试 `enabled=false` 时启动，验证两者都隐藏
- [ ] 4.3 测试右键菜单 "Show Inline Git Blame" 命令不修改 settings.json
- [ ] 4.4 测试右键菜单 "Show Git Gutter" 命令不修改 settings.json
- [ ] 4.5 测试 `enabled=false` 时右键菜单命令不生效
- [ ] 4.6 测试重启后状态根据 `enabled` 重新初始化，不保存运行时状态

## 5. 文档更新

- [x] 5.1 更新 CHANGELOG.md 添加 BREAKING 变更说明
- [x] 5.2 准备发布说明，解释新的行为和迁移指南
