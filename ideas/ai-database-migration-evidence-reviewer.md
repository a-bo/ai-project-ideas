# AI Database Migration Evidence Reviewer

## 一句话

把操作者导入的迁移计划、schema 摘要、影响清单与演练结果整理成一份可回查的 review 包：**哪些迁移事实已被记录、哪些前置条件缺失、哪些放行与回退决定必须由人确认**。

> 第一版只处理本地导入的合成或脱敏材料；不连接数据库、不执行 SQL、不创建备份、不变更 schema，也不宣布迁移安全或完成。

## 目标用户

- 需要准备表结构或数据迁移 review 的后端、数据库与平台工程师
- 需要在发布前交接影响范围、验证窗口和回退职责的技术负责人
- 想做可审计 AI 开发者工具作品集、但不让模型获得数据库执行权限的个人开发者

## 痛点

一次迁移常散落在 DDL、聊天、工单、验收截图和临时表格里。到评审时，人们会问：

- 目标变更能否回链到哪份 schema 快照与哪条迁移意图？
- 涉及哪些表、索引、数据回填、写入方和下游消费方？
- “已演练”对应哪个环境、哪个版本、哪个检查项，还是仅有人写了一句结论？
- 备份、锁影响、回退窗口和负责人是否真正被记录？
- 哪些未知项不能被 AI 偷换成“风险可控”或“可以执行”？

## MVP 边界

### 输入

1. 操作者导入的迁移意图：变更编号、目标环境、变更窗口、发起角色与目的。
2. 脱敏 schema 摘要：对象类型、对象名、来源快照标识、目标差异和证据 ID；不接收连接串、真实账号或原始生产导出。
3. 影响清单：写入方、读取方、回填任务、索引/锁风险和人工确认状态。
4. 可选演练摘要：环境、开始/结束时间、检查项、记录结果与证据链接。
5. 回退与备份准备：策略摘要、责任角色、触发条件和人工审批引用。

### 输出

- 逐条 evidence ID 可回链的**观察事实**
- 环境混用、对象/快照缺失、无回退角色、演练记录不匹配等**阻断项**
- 由固定规则生成的**待人工确认问题**
- 变更前、窗口内、窗口后的**人工检查清单**
- 可导出的 Markdown / JSON review 包

### 不做

- 不连接 MySQL、PostgreSQL、MongoDB 或任何云数据库
- 不读取真实 schema、日志、备份、慢查询或生产数据
- 不生成、执行、解释或优化可运行 SQL
- 不创建备份、不执行迁移、不发通知、不更新工单
- 不把演练摘要、空白检查项或模型推断写成“迁移安全/已完成”

## MVP 模块

| 模块 | 责任 | 约束 |
| --- | --- | --- |
| intake | 校验导入包、脱敏标记、环境和 evidence ID | 缺来源、混环境或疑似密钥直接阻断 |
| schema-map | 规范化对象、快照和目标差异 | 只保存摘要与指针，不保存可执行 SQL |
| impact-map | 关联读写方、回填和锁风险 | 未证实的消费者必须保持 unknown |
| rehearsal-linker | 把演练摘要关联到目标版本与检查项 | 环境或快照不一致不得作为验证 |
| rollback-check | 检查回退触发、责任角色和审批引用 | 不计算可回退性，不给执行建议 |
| review-builder | 分开事实、阻断项、问题和人工动作 | 四类信息不能混写 |
| export-gate | 拒绝敏感文本与完成性结论 | 不合格时不导出决策性措辞 |

## 数据结构

~~~json
{
  "review_id": "dmr_orders_add_status_20261125",
  "target_environment": "staging",
  "migration_intent": {
    "evidence_id": "E-INTENT-01",
    "change_ref": "CHG-204",
    "window_start": "2026-11-25T09:00:00Z",
    "owner_role": "database-engineer"
  },
  "schema_objects": [
    {
      "evidence_id": "E-SCHEMA-01",
      "object_type": "table",
      "object_name": "orders",
      "source_snapshot": "schema-staging-20261125-a",
      "target_change": "add nullable status field",
      "executable_sql_included": false
    }
  ],
  "rehearsals": [
    {
      "evidence_id": "E-REHEARSAL-01",
      "environment": "staging",
      "source_snapshot": "schema-staging-20261125-a",
      "check_id": "R1",
      "result": "recorded_not_decided"
    }
  ],
  "rollback": {
    "evidence_id": "E-ROLLBACK-01",
    "trigger_rule": "human-defined threshold reference",
    "owner_role": "release-manager",
    "approval_ref": "human-review-required"
  }
}
~~~

约束：一个 review 只能对应一个目标环境；每个 schema 对象都必须有来源快照；演练必须匹配该环境与快照；`recorded_not_decided` 不能被渲染为“已验证”；文本不得包含 password、token、Authorization、连接串、绝对本机路径或原始 SQL。

## 页面 / CLI 流程

1. **导入**：展示变更意图、环境、来源快照、脱敏状态和 evidence 完整性。
2. **对象与影响**：按对象显示差异摘要、读写方、回填任务、锁风险及 unknown 项。
3. **演练关联**：明确每个演练记录是否匹配环境、快照和检查项。
4. **回退准备**：显示已记录的触发条件、责任角色和审批引用；缺失即阻断。
5. **Review 包**：分别导出事实、阻断项、待确认问题和人工动作。
6. **导出门禁**：发现敏感文本、跨环境、缺快照或完成性结论时拒绝导出。

## 推荐技术栈

- Node.js 20+、TypeScript、JSON Schema
- 纯函数规则引擎、固定 JSON fixtures 和 Markdown 渲染
- 可选本地 CLI；第一版不需要数据库驱动、ORM、LLM API 或云凭证
- 后续模型只能为已存在 evidence 起草问题，仍须 Schema 校验与人工 review

## 实现步骤

1. 定义单环境迁移 review Schema、evidence ID 格式与敏感字段拒绝规则。
2. 实现导入校验：缺环境、重复 evidence、可执行 SQL、连接串与绝对路径必须失败。
3. 实现 schema 对象与来源快照校验；没有快照不得标记为可审查。
4. 实现影响清单：读写方、回填和锁风险只接受已记录或 unknown 状态。
5. 实现演练关联：环境/快照/检查项任一不匹配均为未核验。
6. 实现回退准备检查：缺触发条件、责任角色或审批引用时阻断。
7. 渲染四层 review JSON 与 Markdown，禁止输出“安全、完成、可执行”等结论。
8. 编写 A01–A10 合成 fixtures 和零依赖测试。
9. 通过合成测试后，再考虑**本地、显式选择文件、只读**的导入器；真实连接与执行始终由人控制。

## 验收标准

| 编号 | 场景 | 通过条件 |
| --- | --- | --- |
| A01 | 单环境、完整快照输入 | 每条观察均能回链 evidence ID 与来源快照 |
| A02 | 混入第二环境 | intake 阻断，不能生成 review |
| A03 | schema 对象无来源快照 | 标记阻断项，不输出“已比对” |
| A04 | 导入可执行 SQL 或连接串 | export-gate 拒绝 |
| A05 | 影响清单中的消费者无证据 | 保持 unknown，不推断无影响 |
| A06 | 演练快照与目标快照不同 | 标为未核验，不能当作验证 |
| A07 | 演练环境不匹配 | 保留记录并要求人工复查 |
| A08 | 缺回退触发或责任角色 | 阻断，不输出“可迁移” |
| A09 | 仅有 recorded_not_decided | 禁止写成“迁移完成” |
| A10 | 有审批引用但无人工确认范围 | 输出待确认问题，不创建任何远程动作 |

## 可扩展方向

- 为已授权的本地 schema 导出添加解析器，但保留字段白名单与脱敏检查
- 增加迁移工单、备份演练与变更记录的只读附件指针
- 为已通过人工 review 的材料生成变更说明草稿
- 将对象依赖关系可视化，但不提供执行按钮
- 对接不同数据库的对象摘要格式，而不导入连接信息或可执行 SQL

## 简历 / 作品集包装

> 设计 AI Database Migration Evidence Reviewer：将本地导入的迁移意图、schema 摘要、影响清单、演练与回退准备分层为可回查事实、阻断项和人工动作，拒绝无快照、跨环境、敏感文本和无证据的完成结论。

演示应只使用完全合成或脱敏的单环境样例，展示“导入 → 找到快照/回退缺口 → 关联演练 → 导出待人工确认 review 包”。不要把结构校验描述为真实数据库迁移验证。

## 开源传播标题

- 数据库迁移 review，不该只有一段 SQL 和一句“已演练”
- 不让 AI 执行迁移：先把快照、影响和回退证据写清楚
- 把“已记录”和“已验证”拆开：一个迁移 review 工具的 MVP
