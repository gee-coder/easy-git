## MODIFIED Requirements

### Requirement: 独立显示状态管理
系统 MUST 在内存中维护两个独立的布尔状态，分别控制 Gutter 颜色指示器和行内注释。

#### Scenario: 默认状态
- **WHEN** 扩展首次启用或用户重启 VS Code 后
- **THEN** 系统 SHALL 默认禁用 Gutter 颜色指示器
- **AND** `gutterEnabled` SHALL 为 `false`
- **AND** 系统 SHALL 根据 `git-blms.enabled` 配置决定行内注释状态
- **AND** `annotationEnabled` SHALL 等于 `git-blms.enabled` 的值

#### Scenario: 状态存储
- **WHEN** 显示状态发生变化
- **THEN** 系统 SHALL 在 DecoratorManager 实例的内存中存储当前状态
- **AND** 状态 SHALL 不持久化到配置文件

### Requirement: Gutter 颜色指示器独立控制
系统 MUST 允许用户独立控制 Gutter 颜色指示器的显示，不影响行内注释。

#### Scenario: 启用 Gutter 颜色指示器
- **GIVEN** `git-blms.enabled` 为 `true`
- **WHEN** 用户执行 `git-blms.showGutter` 命令
- **THEN** 系统 SHALL 设置 `gutterEnabled` 为 `true`
- **AND** 系统 SHALL 在 gutter 区域显示颜色指示器
- **AND** 系统 SHALL 不改变行内注释的状态
- **AND** 系统 SHALL 不修改 `git-blms.enabled` 配置

#### Scenario: 禁用 Gutter 颜色指示器
- **WHEN** 用户执行 `git-blms.hideGutter` 命令
- **THEN** 系统 SHALL 设置 `gutterEnabled` 为 `false`
- **AND** 系统 SHALL 清除所有 gutter 区域的颜色指示器
- **AND** 系统 SHALL 不改变行内注释的状态
- **AND** 系统 SHALL 不修改 `git-blms.enabled` 配置

#### Scenario: Gutter 关闭时的渲染
- **WHEN** `gutterEnabled` 为 `false`
- **THEN** 系统 SHALL 不在 gutter 区域显示任何颜色指示器
- **AND** 系统 SHALL 清除所有已有的 gutter 装饰

### Requirement: 行内注释独立控制
系统 MUST 允许用户独立控制行内注释的显示，不影响 Gutter 颜色指示器。

#### Scenario: 启用行内注释
- **GIVEN** `git-blms.enabled` 为 `true`
- **WHEN** 用户执行 `git-blms.showBlame` 命令
- **THEN** 系统 SHALL 设置 `annotationEnabled` 为 `true`
- **AND** 系统 SHALL 在代码行首显示日期和用户名注释
- **AND** 系统 SHALL 不改变 Gutter 颜色指示器的状态
- **AND** 系统 SHALL 不修改 `git-blms.enabled` 配置

#### Scenario: 禁用行内注释
- **WHEN** 用户执行 `git-blms.hideBlame` 命令
- **THEN** 系统 SHALL 设置 `annotationEnabled` 为 `false`
- **AND** 系统 SHALL 清除所有行内注释装饰
- **AND** 系统 SHALL 不改变 Gutter 颜色指示器的状态
- **AND** 系统 SHALL 不修改 `git-blms.enabled` 配置

#### Scenario: 行内注释关闭时的渲染
- **WHEN** `annotationEnabled` 为 `false`
- **THEN** 系统 SHALL 不显示任何行内注释（日期和用户名）
- **AND** 系统 SHALL 清除所有已有的行内注释装饰
