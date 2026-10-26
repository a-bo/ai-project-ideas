# AI Dependency Upgrade Navigator

> 把一次依赖升级拆成可审计的「候选变更 → 影响证据 → 人工确认 → 可回滚执行单」；它不替代测试，也不自动改代码。

## 一句话

输入一个仓库和计划升级的依赖版本，工具读取锁文件、清单、CI 与仓库内使用点，输出一份**证据可追溯、带未知项的升级准备包**，帮助维护者先决定“要不要升级、先验证什么、失败后怎么撤回”。

## 目标用户

- 维护 JavaScript / TypeScript、Python 或 Go 服务的开发者
- 负责多个依赖与发布节奏的小团队技术负责人
- 想把依赖维护写成可展示工程项目的学生或求职者

## 痛点

依赖升级经常被压缩成一条“bump version”提交，但真正困难的是：

1. 不知道仓库实际是否用了受影响 API，或只用了 transitive dependency。
2. release note、迁移说明、锁文件变动和 CI 结果分散，审阅者无法看全。
3. 升级失败后只剩“回滚”，却没有记录失败发生在哪个验证门。
4. LLM 容易把未读取到的 release note 或代码行为补写成确定结论。

因此，MVP 的首要产物不是“自动修复”，而是一份可审阅、可拒绝、可复跑的升级决策包。

## MVP 边界

第一版只支持一个仓库、一次直接依赖升级、一个生态适配器（建议从 Node.js 的 `package.json + package-lock.json` 或 `pnpm-lock.yaml` 开始）。

### 必须做

- 接收仓库路径、包名、当前版本与目标版本；拒绝缺失或格式非法的输入。
- 读取 manifest、锁文件和指定 CI 配置，生成文件哈希与读取时间。
- 在已读取的仓库文件中搜索依赖导入、配置键和显式 API 符号，记录命中位置与未覆盖目录。
- 接收人工提供的官方 release note URL；没有可读一手来源时标记 `release_notes_unverified`，而不是编造 breaking change。
- 生成 Markdown 升级单：变更范围、证据、未知项、验证清单、回滚指令和人工确认栏。
- 将每次扫描保存为本地 JSON，供 diff 两次升级准备结果。

### 明确不做

- 不自动执行 `npm install`、升级锁文件、修改代码、创建 PR 或发布。
- 不抓取私有 registry、付费漏洞库，亦不把搜索命中等同于“必然受影响”。
- 不声称兼容、通过测试或已修复，除非用户把相应命令与原始日志作为证据导入。
- 不支持 monorepo 全量解析、transitive dependency 根因分析或多个包管理器混用；这些留到后续版本。

## 用户流程

```text
填写升级意图
  → 静态采集（manifest / lock / CI / 使用点）
  → 导入官方 release note 证据
  → 规则归类：已知影响 / 待确认 / 无法判定
  → 生成升级准备包
  → 人工确认后在独立分支执行升级与测试
  → 把真实命令日志附回结果，决定合并或回滚
```

“生成准备包”与“执行升级”必须是两个动作：前者只读，后者由人控制。

## 模块与页面

| 模块 | 输入 | 输出 | 不应做的事 |
| --- | --- | --- | --- |
| Upgrade Intent | 包名、版本、生态 | 标准化请求 ID | 猜测目标版本 |
| Evidence Collector | 仓库路径、允许读取路径 | 文件快照、哈希、命中位置 | 读取 `.env`、凭据或未授权目录 |
| Source Register | 官方 URL、摘录、取得时间 | 来源条目与可用性 | 将第三方博客当作官方迁移事实 |
| Impact Classifier | 规则、命中和来源 | `known / review / unknown` 项 | 将文本匹配升级为确定 bug |
| Plan Renderer | 以上结构化数据 | Markdown/JSON 升级单 | 自动修改依赖或提交 |
| Evidence Import | 人工粘贴的命令、退出码、日志路径 | 验证事件 | 执行任意命令 |

最小界面可以只有三页：创建升级单、检查证据、导出/签核。CLI 则对应 `init`、`scan`、`report`、`attach-run` 四个子命令。

## 数据结构建议

```json
{
  "upgrade_id": "upg_20261026_001",
  "intent": {
    "package": "example-lib",
    "from": "1.4.2",
    "to": "2.0.0",
    "ecosystem": "npm"
  },
  "evidence": [
    {
      "id": "E01",
      "kind": "manifest",
      "path": "package.json",
      "sha256": "…",
      "observed_at": "2026-10-26T09:00:00Z"
    },
    {
      "id": "E02",
      "kind": "usage_match",
      "path": "src/client.ts",
      "line": 18,
      "symbol": "createClient",
      "confidence": "review"
    }
  ],
  "claims": [
    {
      "id": "C01",
      "statement": "仓库中发现 1 处显式导入。",
      "evidence_ids": ["E02"],
      "status": "observed"
    }
  ],
  "checks": [
    {
      "id": "V01",
      "command": "npm test",
      "status": "not_run",
      "required_for_merge": true
    }
  ],
  "decision": "needs_human_review"
}
```

约束：每个结论必须引用至少一个 `evidence_id`；`not_run` 不能渲染成“通过”；日志路径只记录相对路径；任何原始源码片段都按不可信内容展示。

## 实现步骤

1. **固定输入契约**：定义版本、包名、允许读取目录和最大文件数；为错误输入写 5 个 fixture。
2. **完成只读采集器**：先实现一个包管理器，输出稳定排序的 JSON 与每个文件哈希。
3. **加入使用点扫描**：基于可配置的 import / symbol 规则返回位置；对二进制、大文件和忽略目录输出跳过原因。
4. **建立来源登记册**：只接受手工确认的官方 URL；抓取失败或来源缺失都保留为未知。
5. **生成升级准备包**：把事实、推断、待确认和验证命令分区展示，并让每条结论回链证据。
6. **导入真实验证事件**：仅保存用户执行后的命令、退出码、日志路径和时间，不负责执行。
7. **最后再接 LLM**：让模型只提出待确认问题；所有可发布结论仍需通过证据校验器。

## 验收标准

| 编号 | 场景 | 通过条件 |
| --- | --- | --- |
| A01 | 缺少包名或版本 | 拒绝并显示具体字段，不扫描仓库 |
| A02 | 发现 manifest 与 lock | 两个文件均有哈希、路径和读取时间 |
| A03 | 锁文件不存在 | 报告 `lockfile_missing`，不假装已解析 |
| A04 | 扫描到导入 | 报告包含相对路径、行号、规则 ID，不称必然破坏 |
| A05 | 未提供官方 release note | 升级单显示 `release_notes_unverified` |
| A06 | 来源 URL 读取失败 | 保留 URL 与失败状态，不能生成 breaking-change 结论 |
| A07 | 验证未运行 | 所有必需检查显示 `not_run` |
| A08 | 导入失败测试日志 | 结果保留退出码与日志路径，决策保持 `needs_human_review` |
| A09 | 导出报告 | 每个 claim 至少有一个证据 ID，未知项单独列出 |
| A10 | 包含提示注入式 README 文本 | 文本只作为不可信输入，不能改变扫描范围或执行命令 |

## 技术栈

- Node.js 20+、TypeScript、`zod` 或 JSON Schema
- 包管理器适配器：先 npm，再 pnpm / Poetry / Go modules
- `ripgrep` 或 AST 解析（按语言分层）；不要把正则命中当作语义证明
- Markdown 模板 + JSON Schema 校验
- 可选：SQLite 保存本地历史快照

## 可扩展方向

- 比较两次扫描，显示新增/消失的影响证据。
- 支持 Renovate/Dependabot PR 的只读导入与评论草稿。
- 为 Go、Python 增加适配器；每个适配器独立声明覆盖边界。
- 引入 SBOM 与 CVE 信息，但分开呈现“安全建议”和“本仓库真实受影响证据”。
- 将验证事件接入 CI artifact，但只读取已完成任务的固定日志链接。

## 简历 / 作品集表达

> 设计并实现依赖升级决策工具的只读证据层：将 manifest、锁文件、CI 配置和代码使用点归一化为可追溯 JSON，并以“已观测 / 待人工确认 / 未运行”状态生成可回滚升级单，避免把 LLM 推断包装成测试结论。

## 开源传播标题

- 依赖升级不是改一个版本号：我把它拆成了 10 个可验收的证据门
- 做升级助手前，先让它学会说“我不知道”
- 从 lockfile 到回滚单：一个不会自动改代码的 AI 开发者工具方案

## 内容标题

**《别让 AI 直接 bump 版本：依赖升级助手该先交出哪些证据？》**

## 下一步

先为 A01–A10 写固定 fixture 与纯离线测试，再接真实仓库扫描。未完成这些测试前，不应宣称工具能判断升级兼容性。