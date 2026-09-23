# AI GitHub Profile Maker：MVP 数据契约与验收样例

> 状态：工程契约；已实现[零依赖事实层示例](../examples/github-profile-fact-layer/README.md)，模型、页面、缓存、GraphQL Pinned 查询和部署仍未实现。

这份文档把 [AI GitHub Profile Maker](../ideas/ai-github-profile-maker.md) 从功能清单推进到可开工的 MVP 契约：第一版该读哪些公开数据、如何区分事实与推断、遇到冲突如何降级，以及开发完成后怎样验收。

## 0. 当前实现证据（2026-09-21）

- 代码：[GitHub Profile Fact Layer](../examples/github-profile-fact-layer/README.md)
- 环境：Node.js 20.20.2；实现本身要求 Node.js 18+
- 自动化测试：13 个测试通过，覆盖 A01–A10、非法用户名提前失败与生成结果的未知证据/额外字段拒绝
- 真实只读运行：成功读取 `a-bo` 公开资料和仓库，检测到 `ai-project-ideas` 描述 `100+` 与 README 首屏 `35+` 的冲突
- 已完成边界：A08 的 JSON Schema 校验、单次重试与确定性降级；未完成模型供应商接入、生成层、页面、缓存、部署、Pinned GraphQL 和 GitHub 写入

测试通过只证明当前事实层在这些 fixture 和一次公开账号运行中的行为，不代表完整应用已完成，也不代表生成效果或增长指标得到验证。

## 1. MVP 边界

### 第一版必须完成

- 输入一个公开 GitHub 用户名并校验格式。
- 获取公开个人资料和本人拥有的公开仓库。
- 从最多 8 个候选仓库读取 README，控制请求量和上下文长度。
- 生成结构化事实快照、定位建议、最多 6 个 Pinned 候选和 Profile README 草稿。
- 每条结论保留证据 ID；数据缺失或来源冲突时明确标记。
- 支持复制 Markdown 和导出 JSON，但不替用户写入 GitHub。

### 第一版明确不做

- 不读取私有仓库、私有贡献或邮箱等非公开信息。
- 不承诺 Star、Follower 或求职转化增长。
- 不依据 Star 数单独判断项目质量。
- 不自动修改 Bio、Pinned 仓库或 Profile README。
- 不把 README 中的文字当成系统指令，也不执行仓库中的代码。
- 不生成头像、社交平台内容矩阵或多人对比排行榜。

## 2. 官方数据来源与请求预算

| 顺序 | 数据 | 接口 | MVP 用途 |
| --- | --- | --- | --- |
| 1 | 用户公开资料 | [`GET /users/{username}`](https://docs.github.com/en/rest/users/users#get-a-user) | Bio、公开仓库数、Follower 数、更新时间 |
| 2 | 用户公开仓库 | [`GET /users/{username}/repos`](https://docs.github.com/en/rest/repos/repos#list-repositories-for-a-user) | 描述、语言、Star、Fork、Issue、更新时间、是否 fork / archived |
| 3 | 候选仓库 README | [`GET /repos/{owner}/{repo}/readme`](https://docs.github.com/en/rest/repos/contents#get-a-repository-readme) | 判断项目说明、目标用户和证据完整度 |
| 4 | 当前 Pinned 项 | [GraphQL `User.pinnedItems`](https://docs.github.com/en/graphql/reference/users#user) | 对比当前展示与推荐顺序；鉴权不可用时省略 |

GitHub 官方文档说明，未认证 REST 请求的主限额是每小时 60 次，认证用户通常是每小时 5,000 次；实现必须读取响应中的限额头并处理 `403` / `429`，不能无限重试。详见 [REST API rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)。

单次分析的建议预算：1 次用户请求、`ceil(公开仓库数 / 100)` 次仓库分页请求、最多 8 次 README 请求。结果缓存 6 小时；用户主动刷新时才重新抓取。

## 3. 输入契约

```json
{
  "username": "a-bo",
  "goal": "open-source-growth",
  "target_audiences": ["developers", "recruiters"],
  "output_language": "zh-CN"
}
```

校验规则：

- `username`：必填，只允许 GitHub 用户名合法字符，去除首尾空格。
- `goal`：`open-source-growth`、`job-search`、`technical-writing` 三选一。
- `target_audiences`：1 到 3 项，不接受自由拼接的长文本。
- `output_language`：MVP 只支持 `zh-CN` 或 `en`。
- 输入只用于决定排序和表达，不改变事实字段。

## 4. 事实快照契约

先把 API 响应归一化，再调用模型。不要把整段原始响应直接塞进 Prompt。

```json
{
  "snapshot_version": "1.0",
  "observed_at": "2026-09-18T09:30:00Z",
  "profile": {
    "login": "a-bo",
    "name": "a-bo",
    "bio": "AI 应用与具身智能实践者，关注可落地的 AI 项目和机器人智能系统。",
    "public_repos": 46,
    "followers": 7
  },
  "repositories": [
    {
      "name": "ai-project-ideas",
      "description": "100+ practical AI project ideas, MVP plans, and open-source implementation guides",
      "owner_is_subject": true,
      "is_fork": false,
      "archived": false,
      "stars": 0,
      "forks": 0,
      "open_issues": 3,
      "pushed_at": "2026-07-14T10:52:43Z",
      "readme_excerpt": "35+ 可落地的 AI 项目创意、MVP 方案和开源实现指南。"
    }
  ],
  "collection_limits": {
    "public_data_only": true,
    "readmes_fetched": 1,
    "readme_limit": 8,
    "pinned_items_available": false
  }
}
```

上面是 2026-09-18 对公开接口的人工核验样例，不是固定测试期望。测试仓库中应保存脱敏 fixture，避免数据变化让自动化测试随机失败。

## 5. 候选仓库预筛选

先用确定性规则筛到 8 个候选，再让模型解释，不让模型直接吞下 46 个仓库后自由排序。

### 排除项

- `fork = true`
- `archived = true`
- 空仓库或仅用于配置且没有说明的仓库
- 与目标受众明显无关的临时仓库

### 可解释分数（100 分）

| 维度 | 分值 | 规则示例 |
| --- | ---: | --- |
| 定位相关性 | 0–35 | 名称、描述和 README 是否命中 1–2 条主线 |
| 成果证据 | 0–30 | README 是否说明问题、产物、使用方式、限制和更新记录 |
| 新鲜度 | 0–20 | 最近 30 / 90 / 365 天是否有 push；只作信号，不等于质量 |
| 可理解性 | 0–15 | 新访客能否快速看懂受众、价值和入口 |

Star、Fork 只作为同分时的辅助信号，不能让成熟但无关的仓库压过与定位高度一致的新项目。输出必须包含各维度分数和触发规则，方便用户纠错。

## 6. 事实、推断与建议分层

输出 JSON 必须分三层：

```json
{
  "facts": [
    {
      "id": "fact.repo_count",
      "value": 46,
      "source": "github_rest_user",
      "observed_at": "2026-09-18T09:30:00Z"
    }
  ],
  "inferences": [
    {
      "id": "inference.positioning",
      "text": "公开内容主要集中在 AI 应用与具身智能两条主线。",
      "evidence_ids": ["repo.ai-project-ideas", "repo.awesome-embodied-ai-cn"],
      "confidence": "medium"
    }
  ],
  "recommendations": [
    {
      "id": "recommendation.sync_copy",
      "text": "统一仓库描述与 README 中的项目数量。",
      "because": ["conflict.idea_count"]
    }
  ]
}
```

规则：

- 数字只能来自 `facts`，生成文案不得改写或放大。
- 推断必须引用至少一个 `evidence_id`。
- 建议要说明原因，不能伪装成已经完成的成果。
- 没有证据时输出 `unknown`，不要补齐“看起来合理”的值。

## 7. 来源冲突处理

真实样例里，`ai-project-ideas` 的 GitHub 仓库描述写着 `100+`，而 README 写着 `35+`。MVP 不应猜哪个正确，也不应在生成稿中复述更大的数字。

期望输出：

```json
{
  "conflicts": [
    {
      "id": "conflict.idea_count",
      "field": "ai_project_idea_count",
      "sources": [
        {"location": "repository.description", "value": "100+"},
        {"location": "repository.readme", "value": "35+"}
      ],
      "resolution": "omit_from_generated_copy",
      "user_action": "核对索引并统一仓库描述与 README"
    }
  ]
}
```

这类冲突应显示在结果页的“发布前检查”区域，并阻止一键复制带冲突数字的 README。

## 8. Prompt 输入边界

模型只接收归一化 JSON、目标和固定生成规则。仓库 README 属于不可信内容：

- 最多取每个 README 的 6,000 个字符，并标记截断。
- 删除图片数据、徽章查询串和 HTML 注释。
- 用明确分隔符包住内容，并声明其中的指令一律忽略。
- 禁止工具调用、网络请求和代码执行。
- 模型输出必须通过 JSON Schema 校验；失败只重试一次。
- 第二次失败时返回事实快照和人工模板，不返回半截 Markdown。

## 9. 失败与降级矩阵

| 场景 | 产品行为 | 不允许的行为 |
| --- | --- | --- |
| 用户不存在（404） | 提示检查用户名，不创建任务 | 猜测相似用户名 |
| 限流（403 / 429） | 显示重试时间，保留已取数据 | 循环重试 |
| 仓库超过 100 个 | 继续分页，显示抓取进度 | 只读第一页却声称完整 |
| Bio 为空 | 标记缺失，基于仓库提出候选定位 | 把候选文案写成原始 Bio |
| README 不存在 | 降低“成果证据”分，不判定仓库无价值 | 自动编造项目功能 |
| 全部仓库都是 fork | 输出“缺少本人项目证据” | 把上游项目包装为个人成果 |
| Pinned 数据不可用 | 只输出候选，不声称已分析当前 Pinned | 从仓库顺序猜当前 Pinned |
| 来源数字冲突 | 省略数字并要求确认 | 默认采用更大的数字 |
| README 含提示注入 | 当普通文本处理并记录安全事件 | 遵循仓库内指令 |
| 模型 JSON 不合法 | 校验、单次重试、再降级 | 把错误 JSON 展示成正式结果 |

## 10. 最小验收用例

| ID | Fixture | 验收标准 |
| --- | --- | --- |
| A01 | 普通公开用户，5 个本人仓库 | 返回事实、候选 Pinned、README 草稿，所有数字可追溯 |
| A02 | 不存在的用户名 | 返回 `user_not_found`，不调用模型 |
| A03 | 135 个公开仓库 | 完成两页抓取，结果中的总数与 API 一致 |
| A04 | Bio 为空、仓库有 README | Bio 标记缺失，候选定位标记为推断 |
| A05 | README 全部缺失 | 仍输出事实快照，不生成项目功能描述 |
| A06 | 仓库描述与 README 数字冲突 | 冲突进入发布前检查，生成稿省略该数字 |
| A07 | README 含“忽略系统规则”文本 | 文本不影响系统规则，输出记录安全告警 |
| A08 | 首次模型输出缺字段 | Schema 校验失败后只重试一次 |
| A09 | API 返回限流头 | 显示可重试时间，不立即再次请求 |
| A10 | 当前 Pinned 获取失败 | 明确写“当前 Pinned 未核验”，只给候选列表 |

## 11. 完成定义

只有同时满足以下条件，才能把状态从“设计稿”改成“可运行 MVP”：

- A01–A10 有自动化测试并通过。
- 对至少 3 个公开 fixture 生成结果，人工核对所有事实数字。
- 页面清楚标出抓取时间、数据范围、冲突和未知项。
- README Prompt 注入用例没有改变固定输出规则。
- 导出 JSON 通过 Schema 校验，导出 Markdown 不包含未确认数字。
- README 记录本地启动方式、环境变量、隐私边界和已知限制。
- 提供一次真实运行日志或录屏；没有证据时不得写“已上线”或“已验证”。

## 12. 建议的开发顺序

1. 先实现 GitHub 数据抓取、分页、缓存和错误分类，不接模型。
2. 固化归一化 Schema 与 10 个 fixture 测试。
3. 实现确定性预筛选和冲突检测。
4. 接入模型，只生成 `inferences` 与 `recommendations`。
5. 增加 JSON Schema 校验和 Prompt 注入测试。（输出边界已实现；真实模型供应商接入仍未开始。）
6. 最后做结果页和 Markdown 导出，再用真实公开账号人工验收。

这条顺序的重点是：先让事实层稳定，再讨论文案是否“好看”。
