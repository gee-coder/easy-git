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

### Requirement: 扩展停用清理
当扩展被禁用或卸载时，系统 MUST 立即清理所有 UI 元素和状态。

#### Scenario: 清理上下文键
- **WHEN** 扩展的 `deactivate()` 函数被调用
- **THEN** 系统 SHALL 设置 `gitBlms.enabled` 上下文键为 `false`
- **AND** 系统 SHALL 设置 `gitBlms.annotationEnabled` 上下文键为 `false`
- **AND** 系统 SHALL 设置 `gitBlms.gutterEnabled` 上下文键为 `false`

#### Scenario: 清除装饰效果
- **WHEN** 扩展的 `deactivate()` 函数被调用
- **THEN** 系统 SHALL 清除所有可见编辑器中的行内 blame 注释装饰
- **AND** 系统 SHALL 清除所有可见编辑器中的 gutter 颜色指示器装饰

#### Scenario: 菜单消失
- **WHEN** 上下文键被设置为 `false`
- **THEN** 右键菜单中的 GitBlms 相关菜单项 SHALL 立即消失
- **AND** 行号上下文菜单中的 GitBlms 相关菜单项 SHALL 立即消失

### Requirement: 重新激活兼容性
扩展在停用后重新启用时 MUST 能够正常工作。

#### Scenario: 重新启用后正常显示
- **WHEN** 扩展被停用后重新启用
- **THEN** 系统 SHALL 能够正常显示 blame 注释
- **AND** 系统 SHALL 能够正常显示 gutter 颜色指示器
- **AND** 系统 SHALL 正确响应命令

#### Scenario: 不需要重启 VS Code
- **WHEN** 用户禁用然后重新启用扩展
- **THEN** 扩展 SHALL 在重新启用后立即工作
- **AND** 用户 SHALL 不需要重启 VS Code

### Requirement: 停用函数实现
扩展 MUST 实现 `deactivate()` 函数来处理清理逻辑。

#### Scenario: 同步执行
- **WHEN** `deactivate()` 函数被调用
- **THEN** 系统 SHALL 同步执行清理操作
- **AND** 清理操作 SHALL 在函数返回前完成

#### Scenario: 无返回值
- **WHEN** `deactivate()` 函数执行完毕
- **THEN** 函数 SHALL 不返回任何值（返回 `void`）
