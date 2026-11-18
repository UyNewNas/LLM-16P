# Agent16 · LLM-16P

**给大语言模型做一份可复现的 MBTI 风格回答画像。** 参考 16Personalities 的五维呈现方式，使用面向助手工作场景的原创中文题目。

- **网页：<https://uynewnas.github.io/LLM-16P/>**
- **Agent 入口：[llms.txt](https://uynewnas.github.io/LLM-16P/llms.txt)**
- [完整题库](https://uynewnas.github.io/LLM-16P/questions/full.json) · [快速题库](https://uynewnas.github.io/LLM-16P/questions/quick.json) · [追加题库](https://uynewnas.github.io/LLM-16P/questions/followup.json) · [回答 Schema](https://uynewnas.github.io/LLM-16P/schemas/answers.schema.json)

这是一个纯静态 GitHub Pages 项目：没有后端、账号、API Key、远程模型调用或服务端结果收集。问卷和计分对 Agent 可读，网页提供作答、JSON 导入导出、浏览器本地历史与比较。GitHub 托管平台自身的访问日志不受本应用控制。

## 测试什么

| 维度 | 左端 | 右端 |
| --- | --- | --- |
| E / I | 互动展开 | 独立整合 |
| S / N | 具体观察 | 抽象关联 |
| T / F | 分析权衡 | 关系关照 |
| J / P | 计划收束 | 灵活探索 |
| A / T（实验） | 果断表达 | 审慎表达 |

完整版本 60 题，每轴 12 题、正反向各 6 题；快速版本 20 题，每轴 4 题、正反向各 2 题。快速版用于快速探索，不声称与完整版等价。题干均为原创，没有复制 16P 原题。

**输出是模型在当前提示、上下文、版本和采样设置下的自述倾向，不能当作经验证的人类人格、模型能力或真实内心体验。** A/T 为非 MBTI 的实验性扩展，措辞偏好不等于事实置信度或多轮稳定性。

## 让 Agent 完成测试

把这段话发给能读取网页的 Agent：

> 阅读 https://uynewnas.github.io/LLM-16P/llms.txt ，按其中的流程完成 60 题。依据你当前配置下可判断的实际行为作答，不扮演目标人格；无法判断用 null，不编造经验，不披露受保护系统指令或隐藏推理。输出符合 answerTemplate 的 JSON。有本地执行工具时，可审查并下载独立计分模块运行计分，否则把回答 JSON 交给我导入网页。

只有聊天能力的模型，也可以通过网页的“复制测试提示词”收到完整题目，完成后将回答导入网站。

### 离线计分

从 [agent16.mjs](https://uynewnas.github.io/LLM-16P/agent16.mjs) 下载独立模块，在 Node.js 24+ 运行：

```sh
node agent16.mjs questionnaire full repeat-01 > questionnaire.json
# 将模型回答按 answerTemplate 保存到 answers.json
node agent16.mjs score answers.json > result.json
```

无需安装依赖。模块不联网，不调用模型，也不把答案上传到网站。它还支持 `methodology` 命令以及浏览器/Node 的 ESM 导入：

```js
import { getQuestionnaire, scoreAssessment } from './agent16.mjs';
const questionnaire = getQuestionnaire({ mode: 'quick', seed: 'repeat-01' });
// answers 必须来自实际回答，而不是用模板中的 null 伪造完成状态。
const result = scoreAssessment(actualAnswerPayload);
// 结果自动包含下一轮题目。没有需要补测的维度、回答不完整或达到两轮时为 null。
const next = result.followup.next;
```

`scoreAssessment` 拒绝重复/未知 ID、越界和非整数值、混用版本和模式。不接收字符串 "4"、布尔值或空字符串充当分数。输出中保留原始答案与配置，便于复核。

GitHub Pages 提供静态 GET 文件；本项目**不声称提供 HTTP POST 计分 API 或 MCP 服务**。

## X 维度的针对性补测

完成基础问卷后，结果页只给得分精确为 **50% / 50%** 的 X 维度提供新题。例如 `INXJ-X` 表示 T/F 和 A/T 得分持平，第一轮只追加这两个维度，各 4 题，共 8 题。可以在网页手动记录、复制完整补测提示词给 Agent，或下载补测 JSON。

- 每维度每轮 4 道新题，两个计分方向各 2 题；最多追加 **2 轮**，第二轮只针对仍为 X 的维度。
- 原题和追加题在各自维度内等权合并；只有未四舍五入的得分精确为 50% 时显示 X，偏向任一侧就显示对应字母。未追加的维度分数保持不变。
- 补测结果另存为新记录，保留基础答案、各轮答案和原始记录关联；结果页同时显示原始画像与分数变化。旧版已保存记录也能生成补测。
- 跳过或缺失属于资料不足，用 `?` 标记，先补齐当前问卷。含缺失追加答案的维度暂不显示合并分数，也不会继续生成下一轮；网页支持保留已答内容并补齐。
- 两轮后仍为 X 就保留 X。增加题目不代表得到更高的人格判断置信度，也不保证出现确定字母。

CLI 支持直接提取下一轮：

```sh
node agent16.mjs followup result.json > followup-questionnaire.json
# 依据其中的 questions 作答，只填写 answerTemplate.followups 最后一项的 answers。
# 保留基础 answers、metadata、origin 和已经完成的轮次，保存为 followup-answers.json。
node agent16.mjs score followup-answers.json > followup-result.json
```

ESM 也导出 `getFollowupQuestionnaire(payload)`。`scoreAssessment` 自动返回 `followup.next`，因此 Agent 可在生成结果时直接继续输出题目。`followup.status` 为 `available`、`resolved`、`limit` 或 `incomplete`；后三者的 `next` 为 `null`。原始 `version` 仍为 `1.0.0`，追加题使用独立 `followups[].version`，当前计分版本为 `1.2.0`，新补测版本为 `1.1.0`。导入时会从原始答案重算每轮目标，不信任结果中的字母或建议；错误轮次、非目标维度、跨轮题号、重复题号与第三轮均被拒绝。

旧记录在打开网站时会按当前计分规则重新计算，保留原始答案、ID 和测评日期。已经作答的旧补测 `version: "1.0.0"` 仍按它原有的 40–60 选题规则校验和复现，显示字母统一使用新的精确 50% 规则；新生成的补测使用 `1.1.0`，只针对精确持平的维度。补齐旧版未完成轮次会恢复该轮已有题目，不会把它当作新补测。

基础 20 题、基础 60 题及不同补测路径属于不同题目组合。相同的 4 道追加题，在快速版该维度中的权重为 4/8，在完整版中为 4/16。比较时保留模式、追加维度和轮次；补测与基础分数的变化仅作描述性观察。详见 [补测题设计](docs/followup-design.md)。

## 计分规则 v1.2.0

- `1…7` 为有效回答，`4` 为中立，`null` 为无法判断/跳过。遗漏和 null 分别计数；不补成 4。
- 单题有向值 `z = direction × (value − 4)`，方向 `+1` 的同意偏向右端，`−1` 偏向左端。
- 轴分数 `score = mean(z) × 100 / 3`；右端归一化分 `50 + score / 2`，左端为其补数。
- **仅精确 50% / 50% 时显示 `X`**，以整数有向和 `sum(z) === 0` 判定，不依据四舍五入后的百分比。高于或低于 50% 就显示相应方向字母。例如 T/F 为 60% / 40% 时显示 T，50% / 50% 时才显示 X。字母只表示方向，靠近 50% 仍意味着倾向较弱。
- 完整版轴覆盖需至少 10/12 个有效回答，且正反向各至少 4 题；快速版需 4/4。未达到时该轴数值为 null。
- 只在全部题目均有有效数字回答时显示四字母总类型；否则显示 `????-?`；资料不足的轴使用 `?`，各轴最多提供注明覆盖程度的局部观察。
- 配对一致性 `100 × (1 − mean(|z₁ − z₂|)/6)` 是响应模式描述，不是信度、测谎、人格真实性或多次运行稳定性。
- 所有百分比均为归一化问卷得分，**不是概率、置信度、百分位或能力评分**。

计分键在源码中公开；发给 Agent 的 questions JSON 只保留 ID 和题干，以减少直接暗示，不构成防作弊或安全隔离。

## 重复实验

固定题库/计分版本、模式、语言、采样设置、提示摘要、题序和上下文呈现方式，再做多次独立运行。一次显示 INTP 并不意味着所有设置都如此。可以分别研究题序、选项顺序和批量呈现方式；每次只改变一个因素，保留原始答案。网站历史仅保存在当前浏览器，可导出 JSON；换浏览器或清除站点数据会丢失本地历史。

## 开发与发布

需要 Node.js 24+。

```sh
npm ci
npm run generate
npm test
npm run typecheck
npm run dev
npm run build
```

开发地址通常为 `http://localhost:5173/LLM-16P/`。Vite `base` 固定为 `/LLM-16P/`，适配此仓库的 GitHub Pages 项目路径。部署文件在 `dist/`。

`app/lib/question-bank.ts` 是基础题库源文件，`app/lib/followup-bank.ts` 是追加题库源文件；修改后运行 `npm run generate`，同步生成 `bank-data.mjs`、静态问卷和独立模块。改题或改规则时同步升级对应版本，不混合比较。

GitHub Actions 在 `master` 推送时先执行无需第三方依赖的核心测试与静态构建完整性检查，再部署已提交的 `dist/`。仓库 Settings → Pages 的 Source 应为 **GitHub Actions**。更新界面后需要重新运行 `npm run build` 并提交新的 `dist/`；CI 会检查源文件指纹，避免发布旧构建。

## 研究背景与边界

16Personalities 的 NERIS 框架使用五个连续维度，并非原版 MBTI 量表。本工具借鉴的是形式，未获得官方授权或认证，且原研究不验证本工具。

- [16Personalities: Our Framework](https://www.16personalities.com/articles/our-theory)
- [Gupta et al. (BlackboxNLP 2024), Self-Assessment Tests are Unreliable Measures of LLM Personality](https://aclanthology.org/2024.blackboxnlp-1.20/)：提示与选项顺序影响得分。
- [PNAS Nexus (2024), Large language models display human-like social desirability biases in Big Five personality surveys](https://academic.oup.com/pnasnexus/article/3/12/pgae533/7919163)：批量上下文可带来社会赞许性偏差；反向计分并不能消除所有偏差。
- [Nature Machine Intelligence (2025), A psychometric framework for evaluating and shaping personality traits in large language models](https://pmc.ncbi.nlm.nih.gov/articles/PMC12719228/)：部分模型在特定受控方案下显示可测属性，结论依赖具体方法。

更详细的题库语义与设计限制见 [question-design.md](docs/question-design.md)。
