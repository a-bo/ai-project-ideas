# AI README Generator

## 一句话

输入本地项目路径或 GitHub 仓库地址，AI 自动生成更完整、更可信、更适合开源传播的 README。

## 目标用户

- 刚开源项目但 README 很空的开发者
- 经常做 side project 的独立开发者
- 维护内部工具或 CLI 的工程师
- 想把项目包装成作品集的学生和求职者

## 痛点

很多项目不是代码不能看，而是 README 不会写。常见问题包括：

- 只有一句话介绍，看不出项目价值
- 缺少安装、启动、配置、示例
- 目录很多，但新访客不知道从哪开始
- 项目本身不错，但第一页转化很差

## MVP 功能

- 输入 GitHub 仓库地址或本地目录
- 分析目录结构和关键配置文件
- 识别项目类型和技术栈
- 生成项目介绍、安装步骤、使用示例和目录说明
- 自动补充适合的 FAQ / Roadmap / Contributing 区块
- 输出 Markdown 并支持风格切换

## 推荐技术栈

- Frontend: Next.js / Nuxt
- Backend: Node.js / Python / Go
- AI: OpenAI / Claude / Gemini
- Parsing: tree-sitter / AST / Markdown parser
- Storage: SQLite / PostgreSQL
- Deployment: Vercel / Docker

## 页面 / 模块结构

```text
ai-readme-generator
├── app
│   ├── home
│   ├── analyze
│   ├── result
│   └── templates
├── services
│   ├── repo-loader
│   ├── stack-detector
│   ├── readme-planner
│   ├── section-writer
│   └── example-extractor
├── prompts
│   ├── project-summary.md
│   ├── setup-guide.md
│   └── readme-polish.md
├── schemas
│   ├── repo-context.json
│   └── readme-outline.json
└── examples
```

## 适合先支持的项目类型

- Web 应用
- CLI 工具
- SDK / API 包装库
- 模板仓库
- AI Demo / Agent 项目

## 分析输入

工具至少要读取这些信息：

- 目录结构
- `README` 现有内容
- `package.json` / `go.mod` / `pyproject.toml`
- `Dockerfile` / `docker-compose.yml`
- `.env.example`
- `Makefile`
- `examples` / `cmd` / `src` / `docs`

## 输入 Schema

```json
{
  "source_type": "github",
  "repo_url": "https://github.com/a-bo/ai-project-ideas",
  "language": "zh-CN",
  "style": "pragmatic",
  "target_reader": "developers"
}
```

## 仓库上下文 Schema

```json
{
  "project_name": "ai-project-ideas",
  "project_type": "content-repo",
  "primary_stack": ["Markdown"],
  "entrypoints": ["README.md", "ideas/index.md"],
  "commands": ["None"],
  "key_modules": [
    {
      "name": "ideas",
      "purpose": "Store detailed project idea pages"
    }
  ],
  "existing_docs": true,
  "missing_sections": ["FAQ", "Contributing summary"],
  "confidence": 0.78
}
```

## 输出结构建议

```json
{
  "headline": "35+ practical AI project ideas, MVP specs, and implementation guides",
  "sections": [
    "Overview",
    "Why this project exists",
    "Quick start",
    "Project structure",
    "Use cases",
    "Roadmap",
    "Contributing"
  ],
  "risks": [
    "Could overstate unsupported features",
    "May hallucinate commands if repo context is weak"
  ]
}
```

## 页面流转

1. `Home`：输入仓库地址或上传本地目录。
2. `Analyze`：扫描项目结构、技术栈、脚本、文档完整度。
3. `Outline`：先给出 README 大纲，允许用户删改区块。
4. `Generate`：生成完整 Markdown。
5. `Compare`：对比旧 README 和新 README 的差异。
6. `Export`：复制结果或提交 PR 草稿。

## API 设计

### `POST /api/repo/analyze`

```json
{
  "source_type": "github",
  "repo_url": "https://github.com/a-bo/ai-project-ideas"
}
```

返回：

```json
{
  "job_id": "job_readme_001",
  "status": "queued"
}
```

### `GET /api/repo/analyze/:job_id`

返回仓库结构化上下文、缺失区块和建议大纲。

### `POST /api/readme/generate`

```json
{
  "job_id": "job_readme_001",
  "style": "pragmatic",
  "language": "zh-CN",
  "sections": ["Overview", "Quick start", "Project structure", "Roadmap"]
}
```

### `POST /api/readme/improve`

输入已有 README，做润色、补全和去夸大。

## Prompt 模块

### `project-summary.md`

负责生成项目首页的一句话和价值描述。

要求：

- 不写“powerful”“best”“ultimate”这类空词
- 必须基于仓库实际存在的文件和能力
- 首段要让新访客快速知道项目解决什么问题

### `setup-guide.md`

负责生成安装、启动和配置说明。

要求：

- 只使用仓库中真实存在的命令
- 如果命令不明确，就输出待确认提示而不是编造
- 优先给最短可运行路径

### `readme-polish.md`

负责统一风格、减少重复、提升可读性。

要求：

- 用词具体
- 避免夸大未完成能力
- 让 README 更像维护中的项目，而不是营销页

## 核心评估标准

- 是否基于真实仓库结构输出
- 是否减少 README 的“空白区”
- 是否能让访客更快理解项目
- 是否避免编造安装命令和功能
- 是否适合直接作为 GitHub 首页展示

## MVP 实现步骤

1. 读取仓库目录和关键配置。
2. 检测项目类型、语言和可能的启动方式。
3. 生成一个结构化 README 大纲。
4. 基于大纲生成各 section。
5. 提供 old vs new diff 视图。
6. 支持多风格重写和导出。

## 可扩展方向

- 支持自动生成中英文双语 README
- 支持根据截图生成 UI Showcase 区块
- 支持提交 GitHub PR
- 支持为不同读者生成不同版本
- 支持批量扫描多个仓库并统一风格

## 简历包装

可以写成：

```text
开发 AI README Generator，基于仓库结构分析、配置解析和大模型生成能力，自动输出更完整的项目介绍、安装说明和目录文档，提升开源项目首页转化率与可读性。
```

## 开源传播标题

```text
我做了一个 AI README 生成器：输入仓库地址，自动补全开源项目首页
```

## 为什么值得做

- 目标用户广，几乎所有开发者都能理解
- 很适合用 before / after 效果做传播
- 能和 GitHub、代码分析、Agent 工具自然结合
- 比纯聊天类 AI 工具更容易证明实际价值
