# 依赖升级前，先验证“证据记录”而不是相信一段结论

本周我把 [AI Dependency Upgrade Navigator](../ideas/ai-dependency-upgrade-navigator.md) 从方案推进到一个很小但可运行的边界：[升级证据记录校验器](../docs/dependency-upgrade-navigator-record-validator.md)。

它不扫描仓库、不执行 `npm install`，更不会自动把版本号提交出去。它只接收一份 JSON 记录，并问几个很基础的问题：

- “发现 API 使用点”的结论有没有回链到真实证据 ID？
- 路径会不会越出仓库，例如 `../.env`？
- 还没运行的测试，是否被伪装成带日志的已运行检查？
- `passed` 是否真的对应退出码 0？
- 来自 README 或模型的额外字段，能否悄悄改变这份记录的范围？

我为这些边界写了 10 个离线验收测试，实际执行 `node test.mjs` 后得到 `10 acceptance tests passed`。合成样例的状态仍是 `needs_human_review`：它只说明有一个待审阅的导入命中，测试尚未运行。

这不是升级兼容性工具，也没有读取、安装、更新任何真实依赖。下一步应把受限目录内的采集结果接入同一契约；至于安装、测试、提交和合并，仍必须是明确的人类操作。
