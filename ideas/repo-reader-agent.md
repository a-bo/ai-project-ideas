# Repo Reader Agent

## 一句话

输入一个 GitHub 仓库地址，AI 帮你读懂项目结构、启动方式、技术栈和核心模块。

## 目标用户

- 想学习开源项目的开发者
- 接手新项目的工程师
- 做技术调研的团队
- 写项目解析文章的技术博主

## 痛点

很多开源项目文件多、依赖复杂、README 不完整。新手点进项目后不知道从哪里开始看，工程师接手项目也需要花时间理解目录结构、启动方式和核心模块。

## MVP 功能

- 输入 GitHub repo URL
- clone 或读取本地仓库
- 分析目录结构
- 识别语言和框架
- 提取 README、package.json、go.mod、Dockerfile 等关键文件
- 输出项目概览报告
- 输出“从哪里开始读代码”的建议

## 推荐技术栈

- Frontend: Next.js / Vue
- Backend: Node.js / Go
- AI: OpenAI / Claude / Gemini
- Parser: tree-sitter / language-specific parser
- Storage: SQLite
- Deployment: Docker

## 页面 / 模块结构

```text
repo-reader-agent
├── analyzer
│   ├── repo-loader
│   ├── file-indexer
│   ├── tech-detector
│   └── report-generator
├── prompts
│   ├── structure-summary.md
│   ├── startup-guide.md
│   └── code-reading-path.md
├── web
└── examples
```

## 实现步骤

1. 支持输入 GitHub URL。
2. 下载或浅克隆仓库。
3. 忽略 node_modules、vendor、dist、build 等目录。
4. 生成文件树摘要。
5. 读取关键配置文件。
6. 让 LLM 输出结构化分析报告。
7. 展示 Markdown 报告。

## 可扩展方向

- 生成架构图
- 生成学习路线
- 生成贡献指南
- 生成二次开发建议
- 支持私有仓库
- 支持 PR 影响分析

## 简历包装

可以写成：

```text
开发 Repo Reader Agent，支持输入 GitHub 仓库地址并自动分析项目结构、技术栈、启动方式和核心模块，降低开发者理解陌生代码库的成本。
```

## 开源传播标题

```text
输入一个 GitHub 仓库，AI 自动帮你读懂项目结构和核心代码
```
