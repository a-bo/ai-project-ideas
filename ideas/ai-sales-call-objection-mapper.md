# AI Sales Call Objection Mapper

## 一句话

分析销售通话或跟进记录，自动提炼客户异议、丢单原因和可复用的话术改进建议。

## 目标用户

- 销售团队
- 创始人销售阶段的创业者
- 客服与售前团队
- ToB 产品团队

## 痛点

销售团队每天会接触大量客户异议，但这些信息通常散落在录音、飞书、CRM 跟进记录里。没有结构化沉淀，就很难知道最常见的丢单原因，也无法持续优化话术。

## MVP 功能

- 上传通话转写或销售记录
- 提取异议点和客户关注点
- 分类为价格、功能、时机、信任、竞品等
- 统计高频异议
- 生成建议话术
- 输出周度复盘报告

## 推荐技术栈

- Frontend: Next.js
- Backend: Node.js / Python
- AI: OpenAI / Claude / Gemini
- Speech: Whisper / 第三方转写
- Storage: PostgreSQL
- Deployment: Vercel / Docker

## 页面 / 模块结构

```text
ai-sales-call-objection-mapper
├── app
│   ├── upload
│   ├── objection-dashboard
│   ├── conversation-detail
│   └── weekly-report
├── services
│   ├── transcript-ingest
│   ├── objection-extractor
│   ├── reason-cluster
│   └── script-generator
├── prompts
│   ├── objections.md
│   ├── lost-reasons.md
│   └── follow-up-script.md
└── integrations
```

## 实现步骤

1. 支持导入销售记录和转写文本。
2. 自动提取客户异议和上下文。
3. 聚类高频异议和竞品对比点。
4. 生成不同场景的话术建议。
5. 输出团队周报和训练素材。
6. 对接 CRM 做更长期的数据沉淀。

## 可扩展方向

- 不同行业的异议模板
- 销售新人训练模式
- 跟进邮件自动生成
- 结合成交数据分析有效话术
- 竞品异议监控看板

## 简历包装

可以写成：

```text
开发 AI Sales Call Objection Mapper，自动分析销售通话与跟进记录，提炼高频异议和丢单原因，并生成跟进话术与销售复盘报告。
```

## 开源传播标题

```text
我做了一个 AI 销售复盘助手：自动整理客户异议、丢单原因和跟进话术
```
