# AI API Changelog Translator

## 一句话

把 API 更新日志和文档变更自动翻译成开发者真正看得懂的升级说明、影响范围和迁移步骤。

## 目标用户

- SaaS 平台开发者关系团队
- API 产品经理
- 对接第三方 API 的后端工程师
- 维护 SDK 或开放平台文档的团队

## 痛点

很多 API changelog 写的是“字段新增”“返回结构调整”，但接入方最关心的是到底会不会报错、哪里要改、优先级多高。原始变更日志对业务开发者不够友好。

## MVP 功能

- 输入 changelog 文本或文档 URL
- 识别 breaking changes、new features、deprecations
- 自动生成面向开发者的解释
- 输出迁移步骤和风险提醒
- 生成中英文版本
- 生成适合邮件或文档发布的摘要

## 推荐技术栈

- Frontend: Next.js / Nuxt
- Backend: Node.js / Python
- AI: OpenAI / Claude / Gemini
- Parsing: Markdown / HTML parser
- Storage: SQLite / PostgreSQL
- Deployment: Vercel / Docker

## 页面 / 模块结构

```text
ai-api-changelog-translator
├── pages
│   ├── input
│   ├── analyze
│   └── result
├── services
│   ├── changelog-parser
│   ├── impact-analyzer
│   └── migration-writer
├── prompts
│   ├── summarize.md
│   ├── breaking-change.md
│   └── migration-guide.md
└── examples
```

## 实现步骤

1. 支持粘贴 changelog 或抓取文档页面。
2. 结构化提取接口、字段、状态码和版本信息。
3. 用 LLM 判断变更影响等级。
4. 生成“开发者视角”的迁移说明。
5. 导出 Markdown、邮件正文和发布公告。
6. 加入历史版本对比。

## 可扩展方向

- 对接 OpenAPI 自动比对 schema
- 自动生成 SDK 升级示例
- 对接飞书 / Slack 推送
- 为不同语言栈输出示例代码
- 生成面向产品和客服的非技术解释

## 简历包装

可以写成：

```text
开发 AI API Changelog Translator，将 API 文档和更新日志自动转换为升级说明、风险提示和迁移步骤，降低接入方理解和升级成本。
```

## 开源传播标题

```text
我做了一个 AI 工具：把 API 变更日志翻译成真正能执行的迁移指南
```
