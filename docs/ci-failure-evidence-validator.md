# 从 CI 失败文本到可审阅证据：10 个离线门禁

`AI CI Failure Evidence Navigator` 的第一段可运行代码不是 CI 连接器，而是一个离线记录校验器。它把“看起来像故障结论”的文本限制在带来源、同一次运行和可追溯摘要的边界内。

## 适用范围

- 适合希望先约束 CI 故障输入格式的维护者和工具开发者。
- Node.js 20+；无安装依赖、无网络和无 GitHub 凭据。
- 仅校验合成 JSON；不能读取真实 workflow、日志或 PR。

## 记录最小形态

每份记录包含 `run`、`evidence`、`claims` 与 `actions`。`evidence.run_id` 必须与 `run.run_id` 一致；每条证据带 `source`、小写 64 位 `sha256`、`truncated` 与文本摘要。观察与假设都必须引用已有证据 ID，且假设一定保留人工确认。

## 运行与解释

```bash
node test.mjs
node validate-ci-evidence.mjs ci-failure.synthetic.json
```

本次已执行以上两个命令，分别得到 `10 acceptance tests passed` 和 `VALID ci-failure.synthetic.json`。这是离线合成 fixture 的结构测试，不是一次真实 CI 执行、导入、复现、修复或重跑。

## A01–A10 门禁

| 编号 | 门禁 | 结果边界 |
| --- | --- | --- |
| A01 | 同 run 的失败摘要可通过 | 仅说明记录可追溯 |
| A02 | 跨 run 证据被拒绝 | 不合并不同运行 |
| A03 | 截断文本不得断言根因 | 要求补充完整证据 |
| A04 | `cancelled` 可记录 | 不伪装成退出码失败 |
| A05 | `missing_log` 可记录 | 明确不可据此复现 |
| A06 | token 形态文本被拒绝 | 不把疑似凭据写进导出 |
| A07 | 假设必须人工确认 | 不当作已证实事实 |
| A08 | 无效 SHA 被拒绝 | 证据不可追溯即失败 |
| A09 | 未知 evidence ID 被拒绝 | 每条结论可回链 |
| A10 | 自动重跑/合并措辞被拒绝 | 远程动作仍由人决定 |

## 下一步

先增加受控的本地导入与脱敏 fixture；只有在操作者明确授权、并保留速率限制和导入快照时，才评估只读 CI 提供方连接器。校验器不应成为自动重跑、自动修复或自动合并的入口。
