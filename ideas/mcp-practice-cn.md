# MCP Practice CN

## 一句话

面向中文开发者的 MCP 实战教程和可运行示例库，帮助大家从“知道 MCP 是什么”走到“真的能写出一个 MCP Server”。

## 目标用户

- 想学 MCP 的中文开发者
- 正在做 Agent 工程化的团队
- 想把本地工具接入 LLM 的独立开发者
- 需要给团队做内部培训的技术负责人

## 痛点

很多人知道 MCP 很重要，但真正上手时会卡在这些地方：

- 文档看完了，还是不知道第一个例子怎么写
- 不清楚 tool schema、resource、permission 应该怎么分
- 只会做 demo，不会做成可维护的 server
- 想讲给中文团队听时，缺少成体系的中文示例

## MVP 功能

- 一个最小可运行的 MCP Server
- 一个文件系统 MCP 示例
- 一个 HTTP API MCP 示例
- 一个数据库查询 MCP 示例
- 一份权限、安全和常见坑说明
- 一组面向中文开发者的逐步教程

## 推荐技术栈

- Runtime: Node.js / TypeScript
- Optional: Python / Go 示例
- Protocol: MCP tool / resource / prompt patterns
- Docs: Markdown + runnable examples
- Demo: local CLI + example client

## 仓库 / 模块结构

```text
mcp-practice-cn
├── docs
│   ├── 01-what-is-mcp.md
│   ├── 02-first-server.md
│   ├── 03-tools-vs-resources.md
│   ├── 04-permission-design.md
│   └── 05-common-pitfalls.md
├── examples
│   ├── minimal-server
│   ├── filesystem-server
│   ├── http-api-server
│   └── db-query-server
├── prompts
│   ├── schema-explainer.md
│   └── permission-review.md
├── templates
│   └── starter-server
└── scripts
```

## 最适合先讲清楚的 5 个问题

1. MCP 和普通 function calling 到底差在哪。
2. 什么时候用 tool，什么时候用 resource。
3. 为什么 permission 设计不是可选项。
4. 一个 server 怎么从 demo 走到能复用。
5. 中文团队落地 MCP 时最容易踩哪些坑。

## 教程分层

### 第一层：先跑起来

- 什么是 MCP
- 最小 server
- 第一个 tool
- 本地调试方法

### 第二层：开始可用

- 文件系统访问
- HTTP API 封装
- 错误处理
- 输入输出 schema

### 第三层：开始工程化

- 权限模型
- 资源与工具拆分
- 多 tool server 组织方式
- 日志、审计和安全边界

## 输入 / 输出 Schema 示例

### Tool 输入 Schema

```json
{
  "name": "read_project_file",
  "description": "Read a text file from the allowed workspace",
  "input_schema": {
    "type": "object",
    "properties": {
      "path": {
        "type": "string",
        "description": "Relative path inside the allowed directory"
      }
    },
    "required": ["path"]
  }
}
```

### Tool 输出结构

```json
{
  "ok": true,
  "path": "README.md",
  "content_preview": "# Project Title",
  "truncated": false
}
```

## 示例路线

### 1. Minimal Server

- 只注册 1 个简单 tool
- 用来解释协议最小闭环

### 2. Filesystem Server

- 限定目录读写
- 演示 permission 和 path 校验

### 3. HTTP API Server

- 把第三方 API 封成 MCP tools
- 演示参数校验、失败重试、限流说明

### 4. DB Query Server

- 演示只读查询
- 演示高风险操作为什么不应默认暴露

## API / Tool 设计重点

- description 要写给模型看，不是写给人类凑字数
- schema 要减少歧义，避免宽松对象
- 输出结构要稳定，方便模型继续推理
- 高风险能力必须先做权限边界，再谈功能完整

## Prompt 模块

### `schema-explainer.md`

负责把 tool schema 解释成中文教程内容。

要求：

- 用例子而不是抽象名词
- 讲清字段为什么这样设计
- 解释“模型会怎么理解这个 schema”

### `permission-review.md`

负责审查 server 的权限边界。

要求：

- 明确哪些操作高风险
- 明确默认允许和默认拒绝
- 给出面向团队的安全提醒

## 评估标准

- 中文开发者能否在 30 分钟内跑起第一个示例
- 是否能看懂 tool / resource / permission 的区别
- 示例代码是否足够短，但仍然真实
- 是否能作为团队内部分享或培训材料使用
- 是否能自然引出更完整的 Agent 工程实践

## MVP 实现步骤

1. 先写一个最小可运行的 MCP Server。
2. 增加文件系统示例，讲清 permission 边界。
3. 增加 HTTP API 示例，讲清 schema 设计。
4. 增加数据库只读示例，讲清风险控制。
5. 写一组中文文档，把 demo 连接成教程。
6. 增加 starter template，方便直接复制。

## 可扩展方向

- 加入浏览器自动化 MCP 示例
- 加入企业内部工具封装示例
- 加入多语言版本对照
- 做成视频脚本 / 培训课件
- 补一份“从 MCP 到 Agent 工程化”的路线图

## 简历包装

可以写成：

```text
设计并实现面向中文开发者的 MCP Practice CN，提供最小可运行示例、文件系统 / HTTP API / 数据库查询 server 以及权限边界说明，帮助团队从概念理解走向可复用的 Agent 工程实践。
```

## 开源传播标题

```text
从 0 写一个 MCP Server：中文开发者可运行教程和示例库
```

## 为什么值得做

- MCP 还在早期，中文高质量实战内容仍然稀缺
- 教程型仓库更容易沉淀信任，而不是只追热点
- 很适合作为 Agent 工程方向的“入口项目”
- 能和 `Agent Tools Lab`、`API Agent Builder` 自然串成一条学习路径
