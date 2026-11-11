# 短帖：CI 失败助手的第一步，不是“读日志猜根因”

我把 `AI CI Failure Evidence Navigator` 从方案推进到一个零依赖离线校验器：它只接受合成 JSON，并强制把同一次运行、来源、SHA-256、截断状态、观察、假设和人工动作串成证据链。

这次覆盖了 10 个验收门禁：跨运行混入、截断日志断言根因、疑似 token、无效哈希、未知证据引用，以及“自动重跑/合并”动作都会被拒绝。`cancelled` 与 `missing_log` 也不会被伪装成普通失败。

已执行合成 fixture 的 10 个离线验收测试和 CLI 校验。它不读取 GitHub、不导入真实日志、不运行或重跑 CI，也不说明任何真实故障已经定位。完整说明见：[离线校验器指南](../docs/ci-failure-evidence-validator.md)。
