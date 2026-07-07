# AI Compliance Doc Diff Checker

## 一句话

自动比对制度、合同、合规文档的新旧版本，定位关键变化并解释潜在风险。

## 目标用户

- 法务协作团队
- 合规团队
- B2B SaaS 团队
- 需要频繁处理制度更新的运营人员

## 痛点

很多合规或制度文件一改就是几十页。普通 diff 工具只能告诉你哪里变了，但不能解释“这次变化意味着什么”“哪些条款值得优先确认”，人工复核成本很高。

## MVP 功能

- 上传两版 PDF / Word / Markdown 文档
- 识别新增、删除、修改条款
- 标记高风险变更
- 生成通俗解释
- 输出复核清单
- 支持中文和英文文档

## 推荐技术栈

- Frontend: Next.js / Vue
- Backend: Python
- AI: OpenAI / Claude / Gemini
- Parsing: pdfplumber / docx parser
- Storage: PostgreSQL / S3
- Deployment: Docker / Railway

## 页面 / 模块结构

```text
ai-compliance-doc-diff-checker
├── pages
│   ├── upload
│   ├── diff-report
│   └── review-checklist
├── services
│   ├── document-parser
│   ├── clause-aligner
│   ├── risk-detector
│   └── explanation-generator
├── prompts
│   ├── clause-summary.md
│   ├── risk-explain.md
│   └── reviewer-checklist.md
└── samples
```

## 实现步骤

1. 支持上传两版文档并提取文本。
2. 对齐条款和章节结构。
3. 找出新增、删除和修改内容。
4. 让 LLM 输出风险解释和复核建议。
5. 用表格展示变更摘要。
6. 导出审阅报告。

## 可扩展方向

- 按行业预置风险规则
- 合同条款库
- 邮件通知关键变更
- 多人协作审阅
- 审批记录和审阅意见沉淀

## 简历包装

可以写成：

```text
开发 AI Compliance Doc Diff Checker，结合文档解析、结构比对和大模型解释能力，自动识别合规文档关键条款变化并生成复核清单。
```

## 开源传播标题

```text
我做了一个 AI 文档比对工具：两版制度文件一键找差异，还能解释风险
```
