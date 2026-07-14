# API Agent Builder

## 一句话

根据 OpenAPI 文档自动生成 Agent 可调用工具、调用示例和权限说明，让业务 API 更安全地接入 AI。

## 目标用户

- 正在把内部 API 接入 Agent 的团队
- 维护开放平台或中台接口的工程师
- 想做企业 Agent 集成的独立开发者
- 需要快速验证 API Agent 场景的产品团队

## 痛点

很多团队已经有 API，但接入 Agent 时会遇到这些问题：

- OpenAPI 文档很多，手工转 tool schema 很慢
- 参数很多，模型容易调错字段
- 不知道哪些接口该暴露，哪些接口不该直接给 Agent
- 缺少调用示例、权限边界和失败处理说明

## MVP 功能

- 上传或输入 OpenAPI schema
- 自动解析 endpoints、参数和响应结构
- 生成适合 Agent 使用的 tool schema
- 生成调用示例和错误说明
- 生成权限与风险分级建议
- 导出 MCP / function calling 可用配置

## 推荐技术栈

- Runtime: Node.js / TypeScript / Go
- Parser: OpenAPI / JSON Schema parser
- AI: OpenAI / Claude / Gemini
- Output: JSON schema / Markdown / MCP config
- Integration: MCP / tool calling / internal API gateway

## 模块结构

```text
api-agent-builder
├── app
│   ├── import-schema
│   ├── endpoint-review
│   ├── tool-preview
│   └── export
├── services
│   ├── openapi-parser
│   ├── schema-normalizer
│   ├── permission-classifier
│   ├── tool-generator
│   └── example-writer
├── prompts
│   ├── endpoint-risk-review.md
│   ├── tool-description.md
│   └── error-guidance.md
├── templates
│   ├── mcp-tool.json
│   └── function-calling.json
└── examples
```

## 先支持的 API 类型

- 查询型接口
- 创建草稿型接口
- 只读管理后台接口
- 文档 / 知识库查询接口

先不默认支持：

- 删除型接口
- 批量修改型接口
- 资金、权限、审批类高风险接口

## 输入 Schema

```json
{
  "schema_source": "openapi_url",
  "url": "https://example.com/openapi.json",
  "target_runtime": "mcp",
  "language": "zh-CN",
  "risk_mode": "conservative"
}
```

## Endpoint 评估结构

```json
{
  "path": "/tickets/{id}",
  "method": "get",
  "operation_id": "getTicketById",
  "risk_level": "low",
  "agent_suitable": true,
  "reasons": [
    "read-only endpoint",
    "clear input parameters",
    "deterministic response shape"
  ]
}
```

## Tool 输出结构

```json
{
  "name": "get_ticket_by_id",
  "description": "Fetch a ticket by its ID",
  "input_schema": {
    "type": "object",
    "properties": {
      "id": {
        "type": "string",
        "description": "Ticket ID"
      }
    },
    "required": ["id"]
  },
  "safety_notes": [
    "Read-only endpoint",
    "No destructive side effects"
  ]
}
```

## 页面流转

1. `Import`：导入 OpenAPI schema。
2. `Review`：浏览 endpoints，先做风险分级。
3. `Select`：挑选适合暴露给 Agent 的接口。
4. `Generate`：生成 tool schema、说明和示例。
5. `Export`：导出 MCP / function calling 配置。

## 风险分级逻辑

### Low

- 查询类
- 幂等读接口
- 不涉及敏感资源

### Medium

- 创建草稿
- 可回滚修改
- 需要额外确认的业务写操作

### High

- 删除
- 批量操作
- 金融、审批、权限、身份相关接口

## Prompt 模块

### `endpoint-risk-review.md`

负责判断一个 endpoint 是否适合暴露给 Agent。

要求：

- 先看副作用，再看便利性
- 不要因为“能调”就默认“该调”
- 对高风险接口优先建议人工确认

### `tool-description.md`

负责把接口改写成 Agent 更容易理解的工具说明。

要求：

- description 具体
- 参数说明减少歧义
- 明确前置条件和限制

### `error-guidance.md`

负责生成失败处理说明。

要求：

- 指出常见错误码
- 指出参数错误时如何重试
- 对权限失败给出人工接管建议

## 评估标准

- 生成的 tool schema 是否清晰、稳定
- 是否减少手工封装 API 工具的成本
- 是否能提前识别高风险接口
- 是否便于接入 MCP 或 function calling
- 中文团队是否能直接拿来做内部 PoC

## MVP 实现步骤

1. 解析 OpenAPI schema。
2. 抽取 operationId、参数、请求体、响应结构。
3. 给 endpoint 做风险分级。
4. 生成 tool schema 和调用示例。
5. 导出 MCP / function calling 配置。
6. 增加人工审核层，避免高风险接口直接暴露。

## 可扩展方向

- 直接生成 MCP Server 模板
- 对接 API 网关做鉴权
- 支持历史 schema diff
- 为不同模型生成不同风格的 tool description
- 支持企业内部“允许列表”策略

## 简历包装

可以写成：

```text
开发 API Agent Builder，基于 OpenAPI 解析、风险分级和大模型生成能力，自动将业务接口转换为 Agent 可调用工具，并输出权限说明、调用示例和错误处理指引，降低企业 API 接入 Agent 的工程成本。
```

## 开源传播标题

```text
把 OpenAPI 直接变成 Agent 工具：我在做一个 API Agent Builder
```

## 为什么值得做

- 企业 Agent 落地几乎都会遇到“API 怎么接”的问题
- 比泛 Agent 框架更贴近真实工程场景
- 能和 `MCP Practice CN`、`Agent Tools Lab` 形成连续学习路径
- 更容易沉淀成模板、教程和企业内部实践
