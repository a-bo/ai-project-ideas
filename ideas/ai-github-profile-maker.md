# AI GitHub Profile Maker

## 一句话

输入 GitHub 用户名，AI 自动生成 Profile README、个人定位、Pinned 仓库建议和涨粉计划。

## 目标用户

- 想打造 GitHub 主页的开发者
- 准备求职的学生和工程师
- 想做开源个人品牌的技术博主
- GitHub 仓库多但不会包装的人

## 痛点

很多人的 GitHub 主页只有默认信息、空 Bio、模板化 README，Pinned 仓库也没有突出代表作。访客点进来后，不知道这个人擅长什么、有什么值得关注。

## MVP 功能

- 输入 GitHub username
- 拉取用户公开资料
- 拉取公开仓库列表
- 分析主要技术栈和仓库质量
- 生成个人定位建议
- 生成 Profile README
- 推荐 Pinned 仓库
- 生成 30 天涨粉改造计划

## 推荐技术栈

- Frontend: Next.js / Vue
- Backend: Node.js / Go
- AI: OpenAI / Claude / Gemini
- API: GitHub REST API
- Storage: SQLite / PostgreSQL
- Deployment: Vercel / Docker

## 页面 / 模块结构

```text
github-profile-maker-ai
├── pages
│   ├── home
│   ├── analyze
│   └── result
├── services
│   ├── github-api
│   ├── profile-analyzer
│   └── readme-generator
├── prompts
│   ├── positioning.md
│   ├── profile-readme.md
│   └── growth-plan.md
└── examples
```

## 实现步骤

1. 用 GitHub API 获取用户基本资料和仓库列表。
2. 统计语言、Star、Fork、更新时间、是否 fork。
3. 生成一个结构化分析 JSON。
4. 把 JSON 交给 LLM 生成定位和 README。
5. 在页面展示可复制的 Markdown。
6. 增加导出功能。

## 可扩展方向

- 头像生成建议
- 多语言 README
- 一键生成仓库 README
- GitHub Actions 定期更新 Profile
- 和 GitHub OAuth 集成，一键提交 PR

## 简历包装

可以写成：

```text
开发 AI GitHub Profile Maker，基于 GitHub API 和 LLM 自动分析开发者公开仓库，生成个人定位、Profile README 和开源增长建议，帮助开发者提升 GitHub 主页转化率。
```

## 开源传播标题

```text
我做了一个 AI 工具：输入 GitHub 用户名，自动生成个人主页和涨粉计划
```
