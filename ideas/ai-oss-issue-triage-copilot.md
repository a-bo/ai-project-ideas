# AI OSS Issue Triage Copilot

## 一句话

自动分析 GitHub Issues，识别重复问题、建议标签和优先级，并帮维护者起草回复。

## 目标用户

- 开源项目维护者
- 小团队技术负责人
- 内部平台团队
- Issue 数量增长较快的项目作者

## 痛点

很多仓库不是缺功能，而是维护者被重复提问、信息不完整的 bug 报告和低质量 feature request 拖住了时间。Issue 分诊做不好，真正重要的问题会被埋掉。

## MVP 功能

- 连接指定 GitHub 仓库
- 拉取 open issues 和近期 closed issues
- 自动分类 bug / feature / question / duplicate / unclear
- 建议 labels 和 priority
- 检测相似 issue
- 生成维护者回复草稿
- 支持人工确认后再评论或打标

## 推荐技术栈

- Frontend: Next.js
- Backend: Next.js Route Handlers / FastAPI
- AI: OpenAI / Claude / Gemini
- Embedding: text-embedding model + pgvector
- Integration: GitHub App / GitHub REST API
- Deployment: Vercel / Railway

## 页面 / 模块结构

```text
ai-oss-issue-triage-copilot
├── app
│   ├── connect-repo
│   ├── triage-dashboard
│   ├── issue-detail
│   └── settings
├── services
│   ├── github-sync
│   ├── issue-classifier
│   ├── duplicate-detector
│   └── reply-generator
├── prompts
│   ├── classify.md
│   ├── duplicate.md
│   └── maintainer-reply.md
└── db
```

## 实现步骤

1. 用 GitHub API 同步 issue 数据。
2. 建立 issue 存储和向量索引。
3. 实现分类和相似 issue 检索。
4. 生成 label、priority 和回复草稿。
5. 做一个人工确认的 triage 面板。
6. 增加评论和标签回写能力。

## 可扩展方向

- 支持 PR review 请求分类
- 支持 Slack / Discord 通知
- 维护者语气模板
- 周报统计哪些问题最常出现
- 做成 GitHub App 对外发布

## 简历包装

可以写成：

```text
开发 AI OSS Issue Triage Copilot，基于 GitHub API、向量检索和大模型实现 Issue 自动分类、重复问题识别、标签建议和维护者回复草稿，提升开源项目分诊效率。
```

## 开源传播标题

```text
我做了一个 AI 开源助手：自动帮维护者分类 Issue、找重复问题、起草回复
```
