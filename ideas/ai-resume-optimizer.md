# AI Resume Optimizer

## 一句话

上传简历和目标 JD，AI 分析匹配度、优化项目描述、生成面试准备清单。

## 目标用户

- 应届生
- 转行程序员
- 准备跳槽的工程师
- 求职辅导内容创作者

## 痛点

很多求职者并不是没有经历，而是不知道如何把项目写成招聘方能看懂的价值。简历常见问题包括关键词不足、项目描述太虚、没有量化结果、和 JD 不匹配。

## MVP 功能

- 上传或粘贴简历
- 粘贴目标 JD
- 分析匹配度
- 找出缺失关键词
- 优化项目描述
- 生成面试题清单
- 生成 7 天补强计划

## 推荐技术栈

- Frontend: Next.js / Vue
- Backend: Node.js
- AI: OpenAI / Claude / Gemini
- Parser: PDF / DOCX text extraction
- Storage: optional

## 页面 / 模块结构

```text
ai-resume-optimizer
├── upload
├── jd-analyzer
├── resume-analyzer
├── rewrite
└── interview-plan
```

## 实现步骤

1. 支持文本输入简历和 JD。
2. 分析 JD 关键词。
3. 对比简历内容。
4. 输出匹配度和缺口。
5. 生成优化后的项目描述。
6. 生成面试准备清单。

## 可扩展方向

- PDF / Word 上传
- 多岗位版本管理
- 简历模板
- 模拟面试
- 求职进度管理

## 简历包装

可以写成：

```text
开发 AI Resume Optimizer，支持根据目标 JD 自动分析简历匹配度、优化项目经历并生成面试准备清单，帮助求职者提升简历投递转化率。
```

## 开源传播标题

```text
上传简历和 JD，AI 自动帮你改简历并生成面试题
```
