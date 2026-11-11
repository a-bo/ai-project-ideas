# CI Failure Evidence Validator（离线示例）

这是 `AI CI Failure Evidence Navigator` 的零依赖 Node.js 20+ 示例。它只校验操作者导入的合成 JSON 记录，不连接 GitHub、不读取真实日志、不触发或重跑 CI、不修改代码。

## 运行

```bash
node test.mjs
node validate-ci-evidence.mjs ci-failure.synthetic.json
```

测试只覆盖合成 fixture。`VALID` 只表示记录满足本示例的结构与安全门禁，不表示真实故障已经复现、根因已定位或修复可合并。

## 当前门禁

- 每项 evidence 必须属于同一 `run_id`，带来源、SHA-256 与截断标志。
- 观察和假设都必须回链到 evidence；假设必须要求人工确认。
- 截断证据不能支撑“根因/已定位”断言。
- token 形态文本、未知字段、无效 SHA 与自动 rerun/merge 动作被拒绝。
- `cancelled`、`timed_out` 与 `missing_log` 是与 `failure` 不同的记录结果。

真实导入器、日志脱敏器、Markdown 导出、GitHub 授权和任何远程动作均不在此示例范围内。
