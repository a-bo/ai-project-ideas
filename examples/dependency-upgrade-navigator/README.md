# Dependency Upgrade Navigator：离线记录校验器

这是 [AI Dependency Upgrade Navigator](../../ideas/ai-dependency-upgrade-navigator.md) 的第一个可运行边界：它只校验一份人工/采集器生成的升级证据记录，不读取仓库、不联网、不执行命令，也不会修改依赖。

## 运行

需要 Node.js 18+：

```bash
node test.mjs
```

预期输出：`10 acceptance tests passed`。

## 记录约束

- 仅接受 `npm` 的单包升级意图；`from` 与 `to` 必须不同。
- 证据必须带唯一 ID、相对路径、SHA-256 与观察时间；路径拒绝绝对路径和 `..`。
- 每个可见结论必须引用已有证据 ID；`review` 不是兼容性结论。
- `not_run` 的检查不能带退出码或日志；已运行检查必须带相对日志路径，且 `passed` 只允许退出码为 0。
- 未识别字段（包括来自 README、LLM 或外部文本的指令）会被拒绝，避免其改变范围。

`fixtures/valid-upgrade-record.json` 是合成样例：它表示“发现一个待审阅的导入、测试尚未运行”，不代表任何真实包、项目或 CI 成功。
