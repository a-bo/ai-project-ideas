# AI Agent

Agent 类项目热度高，但容易撞车。更好的做法是选具体场景，不做泛框架。

## 1. Agent Tools Lab

用真实代码讲清楚 AI Agent 如何安全、可控、可扩展地调用工具，并接入 MCP。

详情：[agent-tools-lab.md](agent-tools-lab.md)

## 2. MCP Practice CN

面向中文开发者的 MCP 实战教程和可运行示例库。

MVP:

- 最小 MCP Server
- 文件系统 MCP
- HTTP API MCP
- 数据库查询 MCP
- MCP 权限和安全说明

传播标题：

```text
从 0 写一个 MCP Server：中文开发者可运行教程
```

## 3. AI Browser Task Assistant

让 AI 在浏览器里执行可控任务，例如填写表单、采集页面信息、检查网页问题。

MVP:

- 输入任务
- 浏览器打开页面
- AI 识别页面结构
- 生成操作计划
- 用户确认后执行

## 4. Local File Agent

本地文件整理、重命名、分类、摘要和检索 Agent。

MVP:

- 扫描目录
- 识别文件类型
- 批量重命名建议
- 文档摘要
- 操作前确认

## 5. API Agent Builder

根据 OpenAPI 文档生成 AI 可调用工具，让 Agent 能安全调用业务接口。

MVP:

- 上传 OpenAPI schema
- 解析 endpoints
- 生成 tool schema
- 生成调用示例
- 生成权限说明
