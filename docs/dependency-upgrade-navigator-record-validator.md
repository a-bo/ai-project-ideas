# Dependency Upgrade Navigator：升级证据记录校验器

> 一个零依赖、离线的 Node.js 18+ 校验边界：先验证升级记录是否足以被审阅，再谈扫描、安装或执行升级。

对应项目方案：[AI Dependency Upgrade Navigator](../ideas/ai-dependency-upgrade-navigator.md)。可运行示例位于 [`examples/dependency-upgrade-navigator`](../examples/dependency-upgrade-navigator/README.md)。

## 适用与不适用

适合正在设计依赖升级工作流、希望把“看到了什么”和“还没有验证什么”分开的开发者。它只处理单包 npm 升级的一份 JSON 记录。

它不读取仓库、不下载 release note、不调用 LLM、不执行 `npm install` 或 `npm test`，也不改 manifest、锁文件、源码或 GitHub。通过校验只代表记录结构自洽，**不代表升级兼容、测试通过或可以合并**。

## 最小记录

记录包含：

- `intent`：包名、源/目标版本和生态；两版本必须不同。
- `evidence`：唯一 ID、类型、相对路径、SHA-256 和观察时间；可选使用点行号与符号。
- `claims`：每个结论引用已有 `evidence_ids`，并标记 `observed`、`review` 或 `unknown`。
- `checks`：`not_run`、`passed`、`failed`；运行后的检查必须带退出码和相对日志路径。
- `decision`：`needs_human_review`、`ready_for_execution` 或 `blocked`。

合成样例的决策是 `needs_human_review`：它有一个待人工确认的导入命中，且 `npm test` 仍为 `not_run`。这正是准备执行升级前应如实保留的状态。

## 运行与验收

```bash
cd examples/dependency-upgrade-navigator
node test.mjs
```

本次实际运行了上述离线测试，输出为 `10 acceptance tests passed`。测试覆盖：

| 编号 | 拒绝/接受场景 | 校验器结果 |
| --- | --- | --- |
| A01–A03 | 缺包名、非法版本、版本相同 | 拒绝，不产生升级结论 |
| A04 | `../.env` 路径 | 拒绝路径穿越 |
| A05 | 重复证据 ID | 拒绝，防止结论指向歧义证据 |
| A06–A07 | 未知/空证据引用 | 拒绝无来源结论 |
| A08 | `not_run` 却附运行日志 | 拒绝伪造运行状态 |
| A09 | `passed` 搭配非零退出码 | 拒绝状态与原始结果冲突 |
| A10 | 额外未识别字段 | 拒绝，避免不可信文本扩展契约 |

## 接到真实扫描器之前

真实采集器应在允许目录内读取 manifest、锁文件、CI 与使用点，并把每个文件的路径、哈希和读取时间写入此记录。官方 release note 无法取得时，应增加明确的未知项；不要从网页标题或模型推断生成 breaking-change 结论。

真实运行后的日志也应由人工导入：保存命令、退出码和相对日志路径即可。只有在独立环境确实运行过命令、并留有原始证据时，才可把对应检查从 `not_run` 改为 `passed` 或 `failed`。

## 限制与下一步

- 当前只接受 npm、单依赖、单份记录；未支持 pnpm、Go、Python、monorepo 或 transitive dependency 分析。
- 正则版本检查不是完整 semver 解释器；真实 CLI 需要更严格的包管理器适配器。
- SHA-256 仅检查格式，不在此离线边界重新计算文件哈希。

下一步是为采集器加入固定 fixture，再把“采集结果”与本校验器串接；仍需把安装、测试、提交和合并留给显式的人类决策。
