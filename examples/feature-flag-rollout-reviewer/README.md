# Feature Flag Rollout Reviewer：离线校验器

这是 [AI Feature Flag Rollout Reviewer](../ai-project-ideas/ideas/ai-feature-flag-rollout-reviewer.md) 的一个零依赖 Node.js 20+ 结构校验示例。它只验证操作者显式导入的**合成或已脱敏** review 记录，输出也只表示“可交给人工 review”。

```bash
node validate-rollout-review.mjs feature-flag.synthetic.json
node test.mjs
```

校验器要求单一环境、递增阶段、明确的观察窗/停止条件/回滚角色、64 位小写 SHA-256 evidence ID，以及可关联的阶段。它拒绝环境混用、敏感文本、无证据字段和“发布成功/可以全量”措辞。

这不是 flag SDK、厂商 API、监控或发布工具：不读取或修改远程开关，不查询生产指标，不放量、不回滚、不审批，也不宣告发布成功。测试仅使用随附合成 fixture。
