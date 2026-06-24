# AI Code Reviewer

## 一句话

读取 Git diff 或 Pull Request，AI 自动生成代码审查报告，指出风险、坏味道和可改进点。

## 目标用户

- 小团队开发者
- 开源项目维护者
- 想提高代码质量的个人开发者
- 需要自动化 Review 的团队

## 痛点

很多团队没有足够时间做认真 Code Review。普通 lint 只能发现格式或规则问题，难以发现业务风险、可维护性问题、安全隐患和边界条件遗漏。

## MVP 功能

- 读取本地 `git diff`
- 按文件拆分变更
- 调用 LLM 分析风险
- 输出 Markdown Review 报告
- 支持自定义 Review 规则
- 支持 GitHub Actions 中运行

## 推荐技术栈

- CLI: Node.js / Go
- AI: OpenAI / Claude / Gemini
- CI: GitHub Actions
- Output: Markdown / GitHub PR Comment

## 页面 / 模块结构

```text
ai-code-reviewer
├── cli
├── rules
│   ├── security.md
│   ├── maintainability.md
│   └── performance.md
├── prompts
├── github-action
└── examples
```

## 实现步骤

1. 实现 CLI，读取 `git diff`。
2. 过滤 lock 文件、构建产物和大文件。
3. 按文件生成 review prompt。
4. 输出统一 Markdown。
5. 支持 rules 目录自定义规范。
6. 增加 GitHub Actions 示例。

## 可扩展方向

- PR 自动评论
- 多语言规则集
- 安全扫描模式
- 变更影响分析
- 和团队代码规范结合

## 简历包装

可以写成：

```text
开发 AI Code Reviewer，基于 Git diff 和大模型自动生成代码审查报告，支持自定义规则和 GitHub Actions 集成，提升小团队代码审查效率。
```

## 开源传播标题

```text
我做了一个 AI Code Reviewer，提交 PR 前自动帮你审代码
```
