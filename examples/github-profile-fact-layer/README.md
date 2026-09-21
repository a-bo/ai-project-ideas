# GitHub Profile Fact Layer

`AI GitHub Profile Maker` 的零依赖、只读事实层示例。它先把公开 GitHub 数据收集、分页、归一化和标记冲突，再把稳定 JSON 交给后续的推荐或生成模块。

## 已实现

- 校验 GitHub 用户名，错误输入不会发起请求。
- 获取公开用户资料和全部公开仓库，支持每页 100 个仓库的分页。
- 排除 fork、归档和空仓库，按可解释的元数据规则预筛选最多 8 个 README。
- 对 README 截断、清理 HTML 注释，并把疑似提示注入记录为安全事件。
- 区分用户不存在、README 缺失和 API 限流；限流时不自动重试。
- 检测仓库描述与 README 中的 `N+` 数量冲突，建议生成层省略争议数字。
- 明确标记 Pinned 数据未获取，不从仓库顺序猜测当前 Pinned。

## 运行

要求 Node.js 18 或更高版本，不需要安装依赖。

```bash
cd examples/github-profile-fact-layer
npm test
node src/cli.mjs a-bo
```

可选使用 `GITHUB_TOKEN` 提高 GitHub API 请求限额：

```bash
GITHUB_TOKEN=your_token node src/cli.mjs a-bo
```

命令只向标准输出写 JSON，不会修改 GitHub 账号、仓库、Bio、Pinned 项或 README。

## 输出边界

当前输出包含：

- `profile`：公开账号事实。
- `repositories`：归一化的本人公开仓库事实。
- `candidates`：最多 8 个候选仓库及分数明细。
- `conflicts`：描述与 README 的数量冲突。
- `security_events`：README 中疑似提示注入文本的记录。
- `warnings`：README 缺失等可降级问题。
- `collection_limits`：本次请求范围和 Pinned 可用状态。

当前不包含 LLM、定位文案、README 生成、GraphQL Pinned 查询、缓存、网页界面或部署。因此这只是可运行的事实层，不是完整 Profile Maker MVP。

## 验收覆盖

`fixtures/acceptance-matrix.json` 映射原设计中的 A01–A10。自动化测试覆盖事实层负责的 A01–A07、A09 和 A10；A08 属于尚未接入的模型输出校验，明确保持 `deferred`，避免把未实现能力写成通过。

## 已知限制

- 匿名请求受 GitHub API 每小时 60 次主限额约束。
- 相关性关键词和分数是确定性起点，不代表仓库质量结论。
- `N+` 冲突检测只处理公开文案中最常见的数量表达，不是通用语义核验器。
- README 只作为不可信文本读取，不执行其中任何指令或代码。
