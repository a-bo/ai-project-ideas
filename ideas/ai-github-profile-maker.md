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
- 输出结构化分析 JSON
- 展示 before / after 改造建议

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
├── app
│   ├── home
│   ├── analyze
│   ├── result
│   └── examples
├── services
│   ├── github-api
│   ├── profile-analyzer
│   ├── repo-scorer
│   ├── positioning-writer
│   ├── pinned-repo-selector
│   └── readme-generator
├── prompts
│   ├── positioning.md
│   ├── profile-readme.md
│   └── growth-plan.md
├── schemas
│   ├── profile-analysis.json
│   └── growth-plan.json
└── examples
```

## 页面流转

1. `Home`：输入 GitHub 用户名，展示工具价值和示例结果。
2. `Analyze`：抓取用户资料、仓库、近期开源信号并显示进度。
3. `Result`：分成 5 个区域展示。
   - 当前定位摘要
   - 推荐 Bio / Headline
   - 推荐 Pinned 仓库
   - 自动生成的 Profile README
   - 30 天增长计划
4. `Export`：支持复制 Markdown、导出 JSON、保存分享链接。

## 核心分析维度

- 个人定位是否清楚
- 仓库主题是否集中
- 是否有代表作可做 Pinned
- README 和仓库命名是否利于新访客理解
- 最近 30 天是否有持续更新信号
- 仓库内容是“标题型”还是“成果型”

## 数据结构建议

### 输入 Schema

```json
{
  "username": "a-bo",
  "target_audience": ["recruiters", "developers", "founders"],
  "preferred_language": "zh-CN",
  "goal": "improve-profile-conversion"
}
```

### 分析结果 Schema

```json
{
  "profile": {
    "name": "a-bo",
    "bio": "AI 应用与具身智能实践者",
    "followers": 5,
    "public_repos": 46
  },
  "positioning": {
    "current": "方向较清晰，但代表作证明还不够强",
    "recommended_headline": "AI 应用与具身智能实践者，持续沉淀可落地项目与中文技术内容",
    "confidence": 0.82
  },
  "pinned_repos": [
    {
      "repo": "ai-project-ideas",
      "reason": "覆盖面广，最适合作为流量入口"
    }
  ],
  "content_gaps": [
    "缺少一个真实运行的旗舰项目",
    "Profile README 与仓库最新状态未完全同步"
  ],
  "growth_plan": [
    "同步 profile 文案",
    "补深一个旗舰项目",
    "每周发布一次更新内容"
  ]
}
```

## API 设计

### `POST /api/analyze`

输入用户名并触发分析任务。

```json
{
  "username": "a-bo",
  "goal": "profile-readme-and-growth-plan"
}
```

返回：

```json
{
  "job_id": "job_123",
  "status": "queued"
}
```

### `GET /api/analyze/:job_id`

查询分析进度和结果。

### `POST /api/readme/regenerate`

基于已生成的分析结果，切换不同风格重新生成 README。

```json
{
  "job_id": "job_123",
  "tone": "pragmatic",
  "language": "zh-CN"
}
```

## Prompt 模块

### `positioning.md`

负责把仓库、主题、更新频率和受众整合成一句清晰定位。

要求：

- 不写空泛大词
- 优先突出 1 到 2 条主线
- 定位必须能被仓库内容证明

### `profile-readme.md`

负责生成最终 README。

要求：

- 首屏 5 秒内能看懂这个人做什么
- 必须链接到最值得点开的仓库
- 避免夸大数据或写未完成成果

### `growth-plan.md`

负责生成 30 天行动计划。

要求：

- 每周动作不超过 3 项
- 优先做能增加“可信度”的更新
- 建议必须和现有仓库状态对应

## 结果页模块

- `Profile Snapshot`：显示 followers、public repos、最近活跃时间。
- `Positioning Rewrite`：给出 3 个不同强度版本的 headline。
- `Pinned Repo Picks`：最多推荐 6 个仓库并给出排序理由。
- `README Generator`：输出可直接复制的 Markdown。
- `30-Day Plan`：输出按周拆解的可执行任务。

## MVP 实现步骤

1. 用 GitHub API 获取用户基本资料和仓库列表。
2. 统计语言、Star、Fork、更新时间、是否 fork、README 完整度。
3. 给仓库做一个简单打分，筛选最能代表定位的候选仓库。
4. 生成结构化分析 JSON。
5. 把 JSON 交给 LLM 生成定位、Pinned 推荐、README 和增长计划。
6. 在结果页展示可复制 Markdown 和行动建议。
7. 增加重新生成和多风格切换。

## 评估指标

- 生成的 README 是否与真实仓库状态一致
- 首屏是否能在 5 秒内说明“你是谁、做什么、值得关注什么”
- Pinned 推荐是否能覆盖流量入口和能力证明
- 行动计划是否能在 30 天内执行完成
- 用户是否愿意直接复制使用输出结果

## 可扩展方向

- 头像生成建议
- 多语言 README
- 一键生成仓库 README
- GitHub Actions 定期更新 Profile
- 和 GitHub OAuth 集成，一键提交 PR
- 对比两个开发者主页差异
- 增加“求职导向 / 开源导向 / 技术博主导向”三种模式

## 简历包装

可以写成：

```text
开发 AI GitHub Profile Maker，基于 GitHub API 和 LLM 自动分析开发者公开仓库，生成个人定位、Profile README 和开源增长建议，帮助开发者提升 GitHub 主页转化率。
```

## 开源传播标题

```text
我做了一个 AI 工具：输入 GitHub 用户名，自动生成个人主页和涨粉计划
```

## 为什么值得先做

- 目标用户足够清晰，需求几乎人人能理解
- GitHub API + LLM 的组合容易做出可演示 MVP
- 很适合写成开源项目、文章、短视频和社媒案例
- 可以直接拿你自己的 GitHub 主页做 first demo
