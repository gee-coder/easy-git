## 1. 核心功能实现

- [x] 1.1 在 `decoratorManager.ts` 中添加 `createColorIndicator()` 函数，生成 SVG Data URI
- [x] 1.2 添加 `colorIndicatorCache` 缓存机制，避免重复生成相同颜色的 SVG
- [x] 1.3 创建 `getGutterIconForLine()` 函数，根据 blame 信息计算 gutter 图标颜色并生成 SVG Data URI
- [x] 1.4 修改 `createDecorationOption()` 函数，添加 `gutterIconPath` 和 `gutterIconSize` 配置
- [x] 1.5 修改 `createMaskedUncommittedDecorationOption()` 函数，添加 gutter 图标配置

## 2. 颜色计算集成

- [x] 2.1 在 gutter 图标颜色计算中集成 `calculateAnnotationBackground()` 用于已提交代码
- [x] 2.2 在 gutter 图标颜色计算中集成 `calculateUncommittedAnnotationBackground()` 用于未提交代码
- [x] 2.3 在 gutter 图标颜色计算中集成 `calculateCurrentAuthorAnnotationBackground()` 用于当前作者高亮
- [x] 2.4 确保 gutter 图标颜色与 before decoration 背景色完全一致

## 3. 测试验证

- [ ] 3.1 测试已提交代码的 gutter 图标显示和颜色
- [ ] 3.2 测试未提交代码的 gutter 图标显示和颜色
- [ ] 3.3 测试当前作者高亮时的 gutter 图标显示和颜色
- [ ] 3.4 测试 word wrap 情况下 gutter 图标在每个折行上的显示
- [ ] 3.5 测试不同颜色方案（blue/green/purple）的 gutter 图标颜色
- [ ] 3.6 测试长文本多次折行时的视觉连续性
- [ ] 3.7 验证颜色缓存机制工作正常

## 4. 编译和构建

- [x] 4.1 运行 `npm run compile` 编译 TypeScript 代码
- [x] 4.2 检查编译输出，确保无错误和警告
- [x] 4.3 运行 `npm run lint` 检查代码风格

## 5. 本地测试

- [ ] 5.1 按 F5 启动 VSCode Extension Development Host
- [ ] 5.2 在测试文件中启用 word wrap，验证 gutter 图标显示
- [ ] 5.3 测试 Markdown 文件的长行折行场景
- [ ] 5.4 测试代码文件的各种场景（已提交、未提交、不同作者）

## 6. 文档更新

- [x] 6.1 更新 README.md（如需要，添加新功能说明）
- [x] 6.2 更新 CHANGELOG.md，记录新功能和版本变更
