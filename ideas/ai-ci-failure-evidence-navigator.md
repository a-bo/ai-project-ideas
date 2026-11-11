# AI CI Failure Evidence Navigator

## 一句话

把一次 CI 失败整理为可审阅的证据包：明确失败发生在哪个 job、哪条命令、哪段日志、哪些上下文仍未知，并输出由人执行的复现、修复与回滚检查单。

## 目标用户

- 维护多工作流仓库的开源作者
- 需要交接构建故障的研发团队
- 想把 CI 失败处理写成作品集项目的开发者
- 为 PR 做首轮排障准备、但不能把修复决定交给模型的工程师

## 痛点

CI 失败信息散落在 job、step、日志、PR diff 与运行环境中。直接把日志交给模型，常会把截断日志、旧运行或不可信文本误当成事实，给出“已定位”“可以重试”的过度结论。维护者真正需要的是：一个可回溯、可复查且保留未知项的排障包。

## MVP 功能边界

MVP 只读取用户明确导入的运行元数据、选定 job/step 摘要、日志片段和可选 diff 摘要：

1. 为每条输入记录来源、采集时间、运行 ID、job/step ID 与截断状态。
2. 以确定性规则识别失败信号、取消、超时、缺失日志和跨运行混入。
3. 输出“观察到的事实 / 待确认假设 / 人工动作”三层卡片。
4. 生成最小复现检查单、需补充证据列表与回滚风险提醒。
5. 默认不触发 rerun、不读取密钥、不修改代码、不创建评论或 PR。

不包含 GitHub 授权登录、实时拉取日志、自动修复、自动重跑、合并判断、发布或向外部服务发送日志。

## 推荐技术栈

- Node.js 20+ + TypeScript：导入 CLI、校验与本地报告
- JSON Schema / Zod：窄输入契约和未知字段拒绝
- SQLite 或本地 JSONL：可审计快照与事件时间线
- React + Vite：可选本地审阅界面
- GitHub Actions REST/GraphQL：后续由用户授权接入；MVP 用导入 fixture

## 页面 / 模块结构

| 模块 | 责任 | 关键边界 |
| --- | --- | --- |
| Import | 导入 run、job、step、日志片段与 diff 摘要 | 每份导入有来源和 SHA-256 |
| Normalizer | 统一 run/job/step 时间线 | 不同 run ID 不自动合并 |
| Evidence gate | 检查截断、取消、缺失与版本不一致 | 不足证据只输出“未知” |
| Triage brief | 分层展示事实、假设与人工动作 | 假设必须列出依赖 evidence ID |
| Review queue | 标注需补充的日志、配置或人工确认 | 不执行任何远程动作 |
| Export | 导出 Markdown / JSON 报告 | 隐去令牌、路径中的敏感片段 |

## 数据结构建议

```json
{
  "incident_id": "ci-2026-11-04-001",
  "run": {"provider": "github_actions", "run_id": "123", "head_sha": "abc123", "status": "completed", "conclusion": "failure"},
  "evidence": [
    {"id": "E01", "kind": "step_summary", "run_id": "123", "job_id": "build", "step_id": "test", "captured_at": "2026-11-04T09:00:00Z", "truncated": false, "sha256": "<64-hex>"}
  ],
  "claims": [
    {"id": "C01", "layer": "observed", "text": "test step ended with exit code 1", "evidence_ids": ["E01"]},
    {"id": "H01", "layer": "hypothesis", "text": "dependency resolution may be involved", "evidence_ids": ["E01"], "needs_human_confirmation": true}
  ],
  "actions": [
    {"id": "A01", "kind": "manual_check", "text": "run the documented test command locally", "blocked_by": ["missing_exact_command"]}
  ]
}
```

规则：事实必须至少引用一条同一 run 的证据；假设不得写成已确认原因；日志截断、取消或缺少命令时不得生成“已可复现”结论。

## 实现步骤

1. 定义 fixture 驱动的输入 Schema，覆盖失败、取消、超时和缺失日志。
2. 实现 run/job/step 归一化与跨 run 拒绝规则。
3. 实现证据门禁：时间、SHA、截断与敏感字段检查。
4. 生成三层排障简报与最小人工检查单。
5. 为导入、拒绝、未知项、脱敏和 Markdown 导出写离线验收测试。
6. 再评估授权只读连接器；把远程读取与本地推断隔离。
7. 仅在有人审阅后，再把建议复制到 issue、PR 或 rerun 操作。

## 验收标准

- A01：同一 run 的失败 step 能生成带证据 ID 的“观察到”结论。
- A02：不同 run ID 的日志不能合并为同一原因。
- A03：被截断日志只能生成补证请求，不能断言根因。
- A04：取消或超时必须与失败退出码区分。
- A05：缺少原始命令时，报告明确“不可复现”。
- A06：疑似密钥字段被遮蔽，原文不进入导出。
- A07：每个假设列出依赖证据与人工确认动作。
- A08：未知字段、无效 SHA 或无来源证据被拒绝。
- A09：导出的 Markdown 可追到 incident、run 与 evidence。
- A10：所有测试只用合成 fixture，不访问真实仓库或触发 CI。

## 当前离线实现

已提供零依赖 Node.js 20+ [CI 证据校验器](../examples/ci-failure-evidence-validator/README.md)、合成 incident fixture 与 10 个验收测试。它强制同一 run、来源与 SHA-256、证据回链、假设人工确认，并拒绝跨 run 混入、疑似 token、截断证据的根因断言及自动 rerun/merge 文本。

已执行的测试仅针对合成 fixture；通过不表示真实 CI 已导入、根因已定位、修复已验证，或任何远程动作被授权。

## 可扩展方向

- 可选的只读 GitHub App 导入器与速率限制记录
- 按工作流生成基线，识别相同签名的历史失败
- 人工确认后的 issue/PR 评论草稿，而非自动发送
- 与 Dependency Upgrade Navigator 共用证据格式，但保持故障与升级两个工作流分离

## 简历包装

实现了一个以证据为中心的 CI 故障归档与排障工具：将导入的运行元数据、日志摘要和上下文规范化，强制区分观察、假设和人工动作，并通过 Schema、来源、截断与脱敏门禁避免模型把不完整日志当作根因。

## 开源传播标题

- AI 读 CI 日志之前，先让它交出“证据链”
- 不自动重跑、不碰密钥：一个可审计的 CI 故障助手 MVP
- CI 失败排障，不该从“猜原因”开始
