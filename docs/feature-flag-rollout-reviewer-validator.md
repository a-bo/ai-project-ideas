# Feature Flag Rollout Reviewer：把灰度记录先变成可审计输入

[AI Feature Flag Rollout Reviewer](../ideas/ai-feature-flag-rollout-reviewer.md) 的第一段可运行实现是一个**离线结构校验器**。它只处理操作者显式导入的合成或脱敏 JSON，不读取远程 feature flag、监控、CI、Kubernetes 或生产数据库。

## 适合谁

- 需要把灰度交接材料从聊天记录变成可回查 review 包的发布负责人
- 想练习“AI 只能基于证据起草、不能进入生产控制面”的开发者
- 需要在接入任意厂商导出前先固定输入边界的工具作者

环境要求：Node.js 20+；不需要 SDK、账号、网络或任何真实开关。

## 可运行的最小步骤

~~~bash
node examples/feature-flag-rollout-reviewer/validate-rollout-review.mjs examples/feature-flag-rollout-reviewer/feature-flag.synthetic.json
node examples/feature-flag-rollout-reviewer/test.mjs
~~~

随附 fixture 是单一 `staging` 环境的完全合成记录。成功输出仅代表该 JSON 满足结构约束，并显示 `human review only`；它不代表指标健康、可以继续放量或发布成功。

## 记录必须带什么

- 全局唯一的 `review_id` 与单一 `environment`
- 每条 flag、阶段、观测和批准记录各自的 64 位小写 SHA-256 `evidence_id`
- 递增的阶段比例、正数观察窗、停止条件和回滚角色
- 指向已存在阶段、且状态只能为 `recorded_not_decided` 或 `not_observed` 的观测

## 10 个合成验收场景

测试覆盖：合法单环境输入、环境混入、阶段倒退、缺停止条件、缺回滚角色、未知阶段、把观测写成健康、敏感文本、无效 evidence ID，以及把记录写成“可全量”的结论。

这些测试不代表真实的灰度执行；它们只证明校验器会拒绝不合格的**合成**输入。

## 不能做什么

校验器不会读取或修改 remote config，不会查询或判断指标，不会开启/关闭开关，不会发起审批、放量、回滚或通知。后续若接入本地文件导入器，也应要求操作者显式选择、脱敏、保留来源和人工确认。

## 下一步

在任何真实本地导入之前，先增加 JSON Schema 与更细的时间窗一致性 fixture；所有生产动作和风险接受继续保持人工授权。