# AI Commit Assistant

## 一句话

读取 `git diff`，自动生成更规范的 Commit Message、变更摘要、PR 描述和 changelog 片段。

## 目标用户

- 经常写提交说明的开发者
- 维护开源项目的作者
- 需要统一提交规范的小团队
- 想提升 Git 历史可读性的工程团队

## 痛点

很多项目代码写得不差，但 Git 历史质量很低。常见问题包括：

- Commit Message 太随意，后面回看几乎没信息
- 改动很多，但 PR 描述写不清楚
- 团队想用 Conventional Commits，却很难稳定执行
- 发布版本时，changelog 需要手工整理，很费时间

## MVP 功能

- 读取本地 `git diff --staged` 或指定 diff
- 识别改动类型：feat / fix / refactor / docs / chore / test
- 生成 3 到 5 个可选 Commit Message
- 生成中文 / 英文变更摘要
- 生成 PR 描述草稿
- 生成 changelog 片段

## 推荐技术栈

- CLI: Node.js / Go
- AI: OpenAI / Claude / Gemini
- Git Integration: git CLI
- Output: terminal / Markdown / PR template
- Optional: GitHub CLI / GitHub Actions

## 页面 / 模块结构

```text
ai-commit-assistant
├── cli
│   ├── commit
│   ├── pr-body
│   └── changelog
├── services
│   ├── diff-loader
│   ├── change-classifier
│   ├── commit-writer
│   └── summary-writer
├── prompts
│   ├── conventional-commit.md
│   ├── pr-summary.md
│   └── changelog-snippet.md
├── config
│   └── rules.json
└── examples
```

## 适合先支持的使用场景

- 单人 side project
- 小团队日常提交规范
- 开源仓库 PR 描述生成
- release 前 changelog 整理

## 输入 Schema

```json
{
  "mode": "commit",
  "diff_source": "staged",
  "language": "zh-CN",
  "style": "conventional",
  "include_scope": true
}
```

## 变更分析 Schema

```json
{
  "files_changed": 4,
  "change_type_candidates": ["feat", "docs"],
  "scope_candidates": ["readme", "ideas"],
  "risk_level": "low",
  "summary_points": [
    "Add a new AI README Generator spec page",
    "Update index and roadmap references"
  ]
}
```

## 输出结构建议

```json
{
  "commit_messages": [
    "feat(ideas): add AI README Generator spec",
    "docs(roadmap): update weekly focus for GitHub toolchain"
  ],
  "pr_title": "Add AI README Generator spec and content plan updates",
  "pr_body_sections": [
    "What changed",
    "Why it matters",
    "Follow-up"
  ],
  "changelog_entry": "Add detailed AI README Generator project spec and July content plan"
}
```

## 页面流转

1. `Input`：读取 staged diff、本地 patch 或 PR diff。
2. `Classify`：先判断改动属于 feat / fix / docs / refactor 等类型。
3. `Draft`：生成多组 commit message 和摘要。
4. `Select`：用户选择或微调最终版本。
5. `Export`：输出 commit、PR body、release note。

## API 设计

### `POST /api/diff/analyze`

```json
{
  "diff_source": "staged",
  "language": "zh-CN"
}
```

返回：

```json
{
  "job_id": "job_commit_001",
  "status": "queued"
}
```

### `GET /api/diff/analyze/:job_id`

返回结构化改动分析结果。

### `POST /api/commit/generate`

```json
{
  "job_id": "job_commit_001",
  "format": "conventional",
  "include_scope": true,
  "language": "en"
}
```

### `POST /api/pr-body/generate`

基于同一份 diff，额外生成 PR 描述和 changelog。

## Prompt 模块

### `conventional-commit.md`

负责生成 commit message。

要求：

- 优先使用 Conventional Commits
- 不夸大改动范围
- 标题长度尽量短，信息密度高

### `pr-summary.md`

负责生成 PR 描述。

要求：

- 先写做了什么
- 再写为什么改
- 最后写后续影响或待确认项

### `changelog-snippet.md`

负责生成 release note 片段。

要求：

- 面向用户或维护者，而不是重复 diff 文本
- 用一句话说明真实变化

## 评估标准

- Commit Message 是否准确概括改动
- 是否能明显提升 Git 历史可读性
- 是否避免把 docs 改动写成 feat
- PR 描述是否能减少人工补充工作
- changelog 是否适合直接用于版本说明

## MVP 实现步骤

1. 读取 staged diff。
2. 过滤 lock 文件和噪音变更。
3. 对改动文件做类型判断。
4. 生成多组 commit message 候选。
5. 基于同一份上下文生成 PR body 和 changelog。
6. 增加 `.rules.json` 支持团队自定义风格。

## 可扩展方向

- 自动执行 `git commit`
- 自动填充 GitHub PR 表单
- 支持 monorepo scope 推断
- 支持 release note 批量汇总
- 支持团队术语和历史 commit 风格学习

## 简历包装

可以写成：

```text
开发 AI Commit Assistant，基于 Git diff 分析和大模型生成能力，自动输出规范 Commit Message、PR 描述和 changelog 片段，帮助团队提升 Git 历史可读性与发布效率。
```

## 开源传播标题

```text
我做了一个 AI Commit Assistant：自动帮你写 Commit Message、PR 描述和 changelog
```

## 为什么值得做

- 几乎所有开发者都能理解这个需求
- CLI 形态简单，容易先做出可用 MVP
- 很适合和 GitHub / PR / release 流程绑定
- 可以和 `AI Code Reviewer`、`AI README Generator` 组成完整的 GitHub 工具链
