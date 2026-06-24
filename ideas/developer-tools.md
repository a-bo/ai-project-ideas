# Developer Tools

面向开发者的 AI 工具最适合 GitHub 增长，因为目标用户就在 GitHub 上，传播链路短，容易被 Star 和 Fork。

## 1. AI GitHub Profile Maker

输入 GitHub 用户名，AI 自动生成 Profile README、个人定位、Pinned 仓库建议和涨粉计划。

详情：[ai-github-profile-maker.md](ai-github-profile-maker.md)

## 2. Repo Reader Agent

输入一个 GitHub 仓库地址，AI 帮你读懂项目结构、启动方式、技术栈和核心模块。

详情：[repo-reader-agent.md](repo-reader-agent.md)

## 3. AI Code Reviewer

读取 Git diff 或 Pull Request，AI 自动生成代码审查报告，指出风险、坏味道和可改进点。

详情：[ai-code-reviewer.md](ai-code-reviewer.md)

## 4. AI README Generator

根据仓库代码、目录结构和 package/go.mod 等配置，自动生成高质量 README。

MVP:

- 输入本地路径或 GitHub 仓库地址
- 分析目录结构和关键配置
- 识别项目技术栈
- 生成安装、启动、使用、部署说明
- 输出 Markdown

传播标题：

```text
我做了一个 AI README 生成器，开源项目再也不用空 README
```

## 5. AI Commit Assistant

根据 git diff 自动生成规范 Commit Message、变更摘要和 Release Note。

MVP:

- 读取 git diff
- 支持 Conventional Commits
- 支持中文 / 英文输出
- 生成 PR 描述
- 生成 changelog 片段

传播标题：

```text
一个命令，让 AI 帮你写 Commit Message 和 PR 描述
```
