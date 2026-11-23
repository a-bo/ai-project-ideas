# 灰度 review 的第一段代码：先拒绝“发布成功”

我把 [AI Feature Flag Rollout Reviewer](../ideas/ai-feature-flag-rollout-reviewer.md) 的 A01–A10 做成了一个零依赖 Node.js 离线校验器：

- 只接受单环境、可回链的合成/脱敏记录；
- 检查阶段比例、观察窗、停止条件、回滚角色和观测归属；
- 拒绝敏感文本、环境混用、无效证据 ID，以及“可以全量/发布成功”这类越权结论。

本地执行 `node test.mjs` 已通过 10 个合成验收场景；fixture 的唯一状态是 `recorded_not_decided`。这段代码没有连接任何 flag 平台、监控或生产系统，也不会执行放量、回滚或审批。

完整命令和边界见[实践说明](../docs/feature-flag-rollout-reviewer-validator.md)。
