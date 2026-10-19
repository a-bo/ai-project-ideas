# AI 输出通过 Schema 后，为什么还不能直接发布 README？

这周继续推进 `AI GitHub Profile Maker`，我补的不是新模型，而是模型输出之后的确定性 Markdown 渲染层。

上一版已经能拦住缺字段、额外字段和未知证据，也能在第一次失败后只重试一次。但 JSON 合法，不等于内容适合直接发布。真实公开数据里就有一个具体问题：仓库描述写着 `100+`，README 首屏写着 `35+`。如果渲染器照搬描述，前面的 Schema 校验仍然挡不住错误文案进入 Profile README。

这次新增的边界做了四件事：

1. 只接收通过证据 ID 校验的定位推断。
2. 按事实层候选顺序生成最多 3 个项目入口。
3. 遇到数量冲突时省略仓库描述，并把冲突放进发布前 review。
4. Pinned 未通过 GraphQL 核验时，明确写成“候选”，不冒充当前主页配置。

现在可以运行：

```bash
cd examples/github-profile-fact-layer
npm test
npm run render:demo
npm run render:demo -- --review
```

本轮共有 17 个自动化测试通过，其中 4 个专门覆盖 Markdown 草稿、冲突省略、Pinned 未核验声明和未知证据拒绝。

需要强调：这里仍没有真实模型调用，也没有自动写入 GitHub。`render:demo` 使用固定 fixture，只证明从合格结构化输出到可审计 Markdown 的路径可以运行。下一步才是接入一个真实模型适配器，并保留原始响应、Schema 错误和降级结果，方便人工比较。
