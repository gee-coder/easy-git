## ADDED Requirements

### Requirement: Gutter 颜色指示器渲染
系统 MUST 在编辑器 gutter 区域为每一行显示基于 blame 信息的颜色指示器。颜色指示器 SHALL 使用 SVG Data URI 格式，在每个视觉行上渲染，包括 word wrap 产生的折行。

#### Scenario: 已提交代码的 gutter 颜色指示器
- **WHEN** 一行代码已被提交且有 blame 信息
- **THEN** 系统 SHALL 在 gutter 区域显示颜色指示器
- **AND** 颜色指示器的颜色 SHALL 基于提交时间使用现有的颜色桶计算（与 before decoration 背景色一致）
- **AND** 颜色指示器 SHALL 为 12x12px 圆角矩形（2px 圆角半径）
- **AND** 颜色指示器 SHALL 在每个视觉行上显示，包括 word wrap 产生的折行

#### Scenario: 未提交代码的 gutter 颜色指示器
- **WHEN** 一行代码未提交（isUncommitted = true）
- **THEN** 系统 SHALL 在 gutter 区域显示颜色指示器
- **AND** 颜色指示器的颜色 SHALL 使用配置的 `uncommittedColor`
- **AND** 颜色指示器 SHALL 在每个视觉行上显示

#### Scenario: 当前作者高亮时的 gutter 颜色指示器
- **WHEN** 用户启用了 `highlightCurrentAuthor` 配置
- **AND** 一行代码的作者是当前 Git 用户
- **THEN** 系统 SHALL 在 gutter 区域显示颜色指示器
- **AND** 颜色指示器的颜色 SHALL 使用配置的 `currentAuthorColor` 并根据时间计算
- **AND** 颜色指示器 SHALL 在每个视觉行上显示

#### Scenario: Word wrap 多行显示
- **WHEN** 一行代码因为 word wrap 而在视觉上占多个显示行
- **THEN** 系统 SHALL 在每个视觉行的 gutter 区域显示颜色指示器
- **AND** 所有折行的颜色指示器颜色 SHALL 相同（与第一行一致）
- **AND** 第一行的 gutter 颜色指示器 SHALL 与 before decoration 的背景色一致

### Requirement: Gutter 图标颜色计算
系统 MUST 复用现有的颜色计算逻辑确定 gutter 颜色指示器的颜色，确保视觉一致性。

#### Scenario: 使用蓝色方案的已提交代码
- **WHEN** 用户配置 `colorScheme` 为 "blue"
- **AND** 代码提交时间在 1 周内
- **THEN** gutter 颜色指示器的颜色 SHALL 与 before decoration 的背景色使用相同的蓝色色调
- **AND** 颜色 SHALL 使用 `calculateAnnotationBackground()` 函数计算

#### Scenario: 使用绿色方案的已提交代码
- **WHEN** 用户配置 `colorScheme` 为 "green"
- **THEN** gutter 颜色指示器的颜色 SHALL 使用绿色方案计算
- **AND** 颜色 SHALL 使用 `calculateAnnotationBackground()` 函数计算

#### Scenario: 使用紫色方案的已提交代码
- **WHEN** 用户配置 `colorScheme` 为 "purple"
- **THEN** gutter 颜色指示器的颜色 SHALL 使用紫色方案计算
- **AND** 颜色 SHALL 使用 `calculateAnnotationBackground()` 函数计算

### Requirement: SVG Data URI 生成
系统 MUST 动态生成 SVG Data URI 作为 gutter 图标，支持任意颜色值。

#### Scenario: 生成基本颜色指示器
- **WHEN** 系统需要为指定颜色生成 gutter 图标
- **THEN** 系统 SHALL 生成一个 SVG Data URI
- **AND** SVG SHALL 为 12x12px 视口
- **AND** SVG SHALL 包含一个填充了指定颜色的圆角矩形
- **AND** 圆角半径 SHALL 为 2px
- **AND** Data URI SHALL 使用 UTF-8 编码

#### Scenario: 颜色缓存
- **WHEN** 系统多次请求相同颜色的 gutter 图标
- **THEN** 系统 SHALL 缓存已生成的 SVG Data URI
- **AND** 系统 SHALL 为相同颜色复用缓存的 Data URI
- **AND** 缓存键 SHALL 为颜色的十六进制字符串值

### Requirement: Decoration 配置
系统 MUST 在现有的 decoration 类型上添加 `gutterIconPath` 和 `gutterIconSize` 配置。

#### Scenario: 已提交代码的 decoration 配置
- **WHEN** 系统为已提交代码创建 decoration
- **THEN** 系统 SHALL 设置 `gutterIconPath` 为计算出的 SVG Data URI
- **AND** 系统 SHALL 设置 `gutterIconSize` 为 "(12px, 12px)"
- **AND** 系统 SHALL 保持现有的 `before` decoration 配置不变

#### Scenario: 未提交代码的 decoration 配置
- **WHEN** 系统为未提交代码创建 decoration
- **THEN** 系统 SHALL 设置 `gutterIconPath` 为未提交颜色的 SVG Data URI
- **AND** 系统 SHALL 设置 `gutterIconSize` 为 "(12px, 12px)"
- **AND** 系统 SHALL 保持现有的 `before` decoration 配置不变

### Requirement: 视觉连续性
系统 MUST 确保 word wrap 情况下 blame 列的视觉连续性。

#### Scenario: 长文本折行时的视觉连续性
- **WHEN** 一行 Markdown 文本因为 word wrap 而折行 3 次
- **THEN** 所有 4 个视觉行的 gutter 区域 SHALL 显示颜色指示器
- **AND** 所有颜色指示器 SHALL 使用相同颜色
- **AND** 第一行 SHALL 同时显示 gutter 图标和 before decoration 文本
- **AND** 后续折行 SHALL 只显示 gutter 图标，不显示 before decoration 文本

#### Scenario: 相邻不同行的视觉区分
- **WHEN** 相邻两行代码有不同的 blame 信息
- **THEN** 每行的 gutter 颜色指示器颜色 SHALL 反映各自的 blame 信息
- **AND** 不同行的 gutter 颜色 SHALL 根据各自的提交时间/作者计算
- **AND** 如果两行提交时间差异大，gutter 颜色 SHALL 明显不同
