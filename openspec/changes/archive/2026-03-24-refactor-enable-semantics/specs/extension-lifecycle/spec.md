## ADDED Requirements

### Requirement: 扩展启动初始化
扩展激活时 MUST 根据 `git-blms.enabled` 配置正确初始化显示状态。

#### Scenario: enabled=true 时初始化
- **GIVEN** `git-blms.enabled` 配置为 `true`
- **WHEN** 扩展的 `activate()` 函数执行完成
- **THEN** 系统 SHALL 设置 `annotationEnabled` 为 `true`
- **AND** 系统 SHALL 设置 `gutterEnabled` 为 `false`
- **AND** 系统 SHALL 更新 `gitBlms.annotationEnabled` 上下文键为 `true`
- **AND** 系统 SHALL 更新 `gitBlms.gutterEnabled` 上下文键为 `false`

#### Scenario: enabled=false 时初始化
- **GIVEN** `git-blms.enabled` 配置为 `false`
- **WHEN** 扩展的 `activate()` 函数执行完成
- **THEN** 系统 SHALL 设置 `annotationEnabled` 为 `false`
- **AND** 系统 SHALL 设置 `gutterEnabled` 为 `false`
- **AND** 系统 SHALL 更新 `gitBlms.annotationEnabled` 上下文键为 `false`
- **AND** 系统 SHALL 更新 `gitBlms.gutterEnabled` 上下文键为 `false`

#### Scenario: 不保存运行时状态
- **WHEN** 用户通过右键菜单改变显示状态后重启 VS Code
- **THEN** 系统 SHALL 忽略之前的运行时状态
- **AND** 系统 SHALL 根据 `git-blms.enabled` 配置重新初始化
