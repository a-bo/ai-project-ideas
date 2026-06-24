# Agent Tools Lab

## 一句话

用真实代码讲清楚 AI Agent 如何安全、可控、可扩展地调用工具，并接入 MCP。

## 目标用户

- 想学习 AI Agent 的开发者
- 想理解 MCP 的工程师
- 想给内部系统接入 AI 的团队
- 做 AI 应用工程化的人

## 痛点

很多 Agent Demo 只展示“模型会调用工具”，但没有讲清楚工具权限、安全边界、参数校验、执行审计和 MCP 接入。真正落地时，团队最担心的不是 Agent 不够聪明，而是 Agent 会不会乱读文件、乱执行命令、乱调接口。

## MVP 功能

- 最小 Agent 示例
- Tool Calling 示例
- 文件读取工具
- 目录扫描工具
- HTTP 请求工具
- 命令预览工具
- 工具权限配置
- 最小 MCP Server 示例

## 推荐技术栈

- Runtime: Node.js / Go
- AI: OpenAI / Claude / Gemini
- Protocol: MCP
- CLI: Commander / Cobra
- Docs: Markdown

## 页面 / 模块结构

```text
agent-tools-lab
├── examples
│   ├── 01-basic-agent
│   ├── 02-tool-calling
│   ├── 03-file-tools
│   ├── 04-http-tools
│   ├── 05-command-sandbox
│   └── 06-mcp-server
├── packages
│   ├── tool-registry
│   ├── permission
│   └── audit-log
└── docs
```

## 实现步骤

1. 写一个最小 Agent。
2. 增加工具注册表。
3. 实现文件读取和目录扫描工具。
4. 给工具增加权限声明。
5. 对高风险工具只生成执行计划，不直接执行。
6. 增加审计日志。
7. 包装成 MCP Server。

## 可扩展方向

- Web UI 调试工具
- MCP Inspector 集成
- 工具市场
- 沙箱执行
- 企业权限模型

## 简历包装

可以写成：

```text
开发 Agent Tools Lab，通过可运行示例展示 AI Agent 工具调用、权限控制、审计日志和 MCP 接入，帮助开发者理解 Agent 工程化落地中的安全边界。
```

## 开源传播标题

```text
AI Agent 不是越权越好：我做了一个工具调用安全实验室
```
