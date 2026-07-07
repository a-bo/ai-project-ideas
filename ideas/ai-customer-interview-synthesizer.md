# AI Customer Interview Synthesizer

## 一句话

把用户访谈录音、逐字稿和研究笔记自动整理成痛点、需求、异议和产品机会清单。

## 目标用户

- 独立开发者
- 产品经理
- 用户研究员
- 早期创业团队

## 痛点

很多团队做完用户访谈后，真正难的不是“有没有访谈”，而是“怎么从一堆聊天记录里提炼出可执行结论”。人工整理很耗时，也很容易只记住印象最深的个例。

## MVP 功能

- 上传访谈逐字稿或会议纪要
- 提取高频痛点和用户原话
- 分类需求、异议、使用场景
- 识别付费意愿和优先级信号
- 生成研究总结和产品建议
- 导出 Notion / Markdown 结果

## 推荐技术栈

- Frontend: Next.js
- Backend: Python / Node.js
- AI: OpenAI / Claude / Gemini
- Speech: Whisper / 第三方转写 API
- Storage: PostgreSQL
- Deployment: Vercel / Railway

## 页面 / 模块结构

```text
ai-customer-interview-synthesizer
├── app
│   ├── upload
│   ├── interview-list
│   ├── insight-dashboard
│   └── report
├── services
│   ├── transcript-parser
│   ├── insight-extractor
│   └── quote-cluster
├── prompts
│   ├── pain-points.md
│   ├── objections.md
│   └── opportunities.md
└── exports
```

## 实现步骤

1. 支持导入逐字稿和笔记。
2. 按访谈对象和主题切分内容。
3. 提取痛点、目标、异议和典型原话。
4. 聚类相似观点并排序。
5. 生成适合产品讨论会使用的总结报告。
6. 支持导出到 Notion 或 Markdown。

## 可扩展方向

- 自动生成 persona
- 对比不同用户分组的差异
- 和问卷结果联动
- 生成 feature priority 建议
- 生成给设计和研发的行动列表

## 简历包装

可以写成：

```text
开发 AI Customer Interview Synthesizer，自动分析用户访谈逐字稿并提炼痛点、需求和产品机会，帮助早期团队更快完成用户研究总结与决策。
```

## 开源传播标题

```text
我做了一个 AI 访谈分析工具：30 份用户访谈，10 分钟整理出真实需求
```
