# AI API Contract Drift Reviewer

## 一句话

导入两份有明确来源的 API 契约与已有调用/测试清单，生成一份**待人工确认**的变更证据包：哪些字段、枚举、参数和响应形状发生了可定位的变化，哪些调用方或测试证据需要复查。

> 它不是自动升级 SDK、修改客户端代码、运行线上请求或宣布兼容性的工具。第一版只处理用户导入的文本与文件清单。

## 目标用户

- 维护 OpenAPI / JSON Schema / protobuf 边界的后端或平台团队
- 升级第三方 API 或内部服务版本的应用开发者
- 需要把“接口改了什么”交接给测试、文档和发布负责人的技术负责人
- 想做开发者工具作品集、但不想把 AI 直接放进生产改动链路的个人开发者

## 痛点

一次 API 升级常被压缩成“换个版本号”，但真正的风险分散在必填字段、枚举、默认值、响应结构、SDK 包装和调用方假设中。纯文本 diff 很难回答：

- 变更来自哪一份已固定的契约？
- 哪些变化是机器可见的事实，哪些只是“可能有影响”的推断？
- 哪个调用或测试记录与哪条变更相关？
- 哪些结论尚缺测试、发布说明或服务端确认？
- 如何交接而不让 AI 的猜测伪装成兼容性结论？

## MVP 边界

### 输入

1. 两份由操作者导入的契约快照：旧版与新版（JSON/YAML 文本或已解析的规范化对象）
2. 每份快照的来源、版本/提交、采集时间和可选 SHA-256
3. 可选的调用/测试清单：文件相对路径、端点/消息标识、人工维护的关联说明
4. 操作者选择的比较范围和忽略规则

### 输出

- 字段级、参数级、枚举级、操作级的**观察结果**
- 每条观察结果回链到 old/new JSON Pointer（或等价路径）与输入证据 ID
- 按确定规则生成的“需要复查”候选项；候选项不是兼容性判定
- 缺失证据、解析错误、未覆盖调用方与人工动作清单
- 可导出的 Markdown/JSON review 包

### 不做

- 不拉取私有仓库、密钥、线上流量、API 响应或 CI 日志
- 不调用真实 API、不生成或提交代码、不创建 PR、不发布 SDK
- 不自动认定“breaking change”“安全”或“测试已覆盖”
- 不把自然语言模型输出写回契约；若以后接入模型，只能为已有证据生成草稿，且必须经过 Schema 与人工 review

## MVP 模块

| 模块 | 责任 | 关键约束 |
| --- | --- | --- |
| intake | 校验导入包、来源、大小与版本标识 | 未知来源只能标记为未核验 |
| normalizer | 将 OpenAPI/JSON Schema/protobuf 映射为统一节点表 | 保留原始路径，不丢失解析错误 |
| diff-engine | 比较节点存在性、必填、类型、枚举、约束与操作参数 | 只输出可定位观察，不输出兼容性结论 |
| coverage-linker | 将人工调用/测试清单连到稳定 operation/message ID | 无匹配必须显示为未覆盖 |
| review-builder | 生成事实、候选影响、未知项和人工动作 | 四层内容不可混写 |
| export-gate | 输出前做 Schema、证据回链与敏感字段检查 | 失败时拒绝导出“结论”段落 |

## 数据结构

~~~json
{
  "comparison_id": "cmp_2026_11_09_payments_v2",
  "snapshots": [
    {
      "evidence_id": "E-OLD",
      "role": "old",
      "format": "openapi",
      "source_label": "release-2026.10",
      "version": "2026.10",
      "sha256": "optional-64-hex",
      "captured_at": "2026-11-09T09:00:00Z"
    }
  ],
  "observations": [
    {
      "observation_id": "O-014",
      "kind": "enum_value_removed",
      "subject_id": "GET /v1/orders -> status",
      "old_pointer": "#/paths/~1v1~1orders/get/responses/200",
      "new_pointer": "#/paths/~1v1~1orders/get/responses/200",
      "evidence_ids": ["E-OLD", "E-NEW"],
      "claim_level": "observed"
    }
  ],
  "review_items": [
    {
      "review_id": "R-006",
      "observation_ids": ["O-014"],
      "linked_inventory_ids": ["I-021"],
      "status": "needs_human_review",
      "question": "调用方是否仍假设该枚举值可返回？"
    }
  ]
}
~~~

约束：claim_level=observed 必须有 old/new 证据；needs_human_review 不能被序列化为“已不兼容”；所有路径只允许相对路径；解析失败也必须保留为可见事实。

## 页面 / CLI 流程

1. **导入**：选择两份快照，显示格式、来源、版本与哈希是否完整。
2. **规范化预览**：显示可解析节点数、忽略项和失败项，不静默修复。
3. **差异清单**：按操作/消息查看可定位观察结果。
4. **覆盖关联**：导入调用/测试清单，展示匹配、未匹配和多对一关联。
5. **Review 包**：分开呈现事实、待确认问题、未覆盖项和建议的人工动作。
6. **导出门禁**：检查证据、Schema、敏感字段与免责声明，再输出 Markdown/JSON。

## 推荐技术栈

- Node.js 20+、TypeScript
- OpenAPI/JSON Schema/protobuf 的受限解析器（先支持一个格式）
- JSON Schema（输入、观察结果、review 包）
- 纯函数 diff 引擎与固定 fixtures
- 可选本地 CLI；不需要数据库或模型 API 才能交付第一版

## 实现步骤

1. 只选定 OpenAPI 3.1 JSON 作为首个输入格式，定义导入与输出 Schema。
2. 实现快照元数据和稳定节点 ID，拒绝缺失 role、来源或重复 evidence ID 的记录。
3. 先比较 operation、参数、请求字段与响应字段的存在性/必填/类型/枚举变化。
4. 为每条观察结果写入 old/new pointer 和证据 ID，不生成“breaking”标签。
5. 接入人工维护的调用/测试 inventory，输出匹配与未覆盖事实。
6. 用固定规则生成 needs_human_review 问题，而非由模型直接判定风险。
7. 增加导出门禁：未知证据、绝对路径、混合 claim 层级或敏感字段命中时失败。
8. 用合成 fixture 跑 A01–A10；通过后再考虑只读本地目录导入。

## 验收标准

| 编号 | 场景 | 通过条件 |
| --- | --- | --- |
| A01 | 两份合法快照 | 输出每条观察的 old/new pointer 与证据 ID |
| A02 | 新增可选字段 | 标为观察结果，不声称兼容或不兼容 |
| A03 | 删除必填参数 | 产生待人工复查项，并保留来源路径 |
| A04 | 枚举值删除 | 关联命中的调用 inventory；未命中项仍显示未知 |
| A05 | 快照解析失败 | 导出失败原因，不静默跳过输入 |
| A06 | 重复 evidence ID | 在 intake 阶段拒绝 |
| A07 | 绝对文件路径 | 在 export-gate 阶段拒绝 |
| A08 | 证据缺失的模型草稿 | 不得进入 observed 层或导出结论 |
| A09 | 忽略规则命中 | 显示规则 ID 与被忽略节点，不能完全隐藏 |
| A10 | 无调用/测试清单 | 输出“覆盖未知”，不能写成“无影响” |

## 可扩展方向

- 支持 protobuf、AsyncAPI 与 SDK 公共类型的规范化适配器
- 对接只读 Git diff，仍要求操作者显式选择快照
- 生成迁移文档草稿，但保留每条句子的 evidence ID
- 为测试生成候选清单，禁止自动创建或修改测试
- 增加团队 review、签名与发布前归档

## 简历 / 作品集包装

> 设计并实现面向 API 升级的证据化契约差异审查工具：将版本快照、字段级观察、调用清单和人工复查项分层关联，避免把模型推断误写成兼容性结论。

展示时优先录制“导入两份合成规范 → 查看有指针的观察结果 → 发现未覆盖调用 → 导出 review 包”的闭环；不要把合成 fixture 描述为生产兼容性验证。

## 开源传播标题

- API 升级不是一段 diff：我把“契约变化”和“待确认影响”拆开了
- 不让 AI 替你宣布兼容：一个证据化 API Contract Drift Reviewer 的 MVP
- 从 OpenAPI diff 到 review 包：先把每个结论绑回来源
