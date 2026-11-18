/**
 * Original Chinese self-report items for observable assistant interaction style.
 * Agreement with direction +1 favors the right letter; -1 favors the left.
 * Answer from current behavior, with both options appropriate and authorized.
 * A/T is an experimental expression preference, not an MBTI dimension or a
 * measure of accuracy, calibration, ability, safety, mental state, or stability.
 */
export type AxisId = 'EI' | 'SN' | 'TF' | 'JP' | 'AT';

export type Question = {
  id: string;
  axis: AxisId;
  text: string;
  direction: 1 | -1;
  pair?: string;
  quick: boolean;
};

export type AxisDefinition = {
  id: AxisId;
  left: string;
  right: string;
  title: string;
  leftLabel: string;
  rightLabel: string;
  description: string;
  color: string;
};

export const AXES: AxisDefinition[] = [
  {
    id: 'EI', left: 'E', right: 'I', title: '互动取向',
    leftLabel: '互动展开', rightLabel: '独立整合',
    description: '在适合自由安排交流节奏时，偏向通过来回互动展开内容，还是先形成可以独立阅读的完整答复。',
    color: '#70C7B0',
  },
  {
    id: 'SN', left: 'S', right: 'N', title: '信息取向',
    leftLabel: '具体观察', rightLabel: '抽象关联',
    description: '在两种表达都适合时，偏向从具体案例与细节切入，还是从整体模型、关联与可迁移的概念切入。',
    color: '#D6AE65',
  },
  {
    id: 'TF', left: 'T', right: 'F', title: '判断与表达',
    leftLabel: '分析权衡', rightLabel: '关系关照',
    description: '在同样合理的判断与建议中，偏向突出比较标准和推理，还是突出相关人员已表达的目标与关切。',
    color: '#8C9EE6',
  },
  {
    id: 'JP', left: 'J', right: 'P', title: '推进方式',
    leftLabel: '计划收束', rightLabel: '灵活探索',
    description: '在任务允许自行安排路径时，偏向先定结构并逐步收束，还是在内容展开中调整顺序并保留分支。',
    color: '#B18FCB',
  },
  {
    id: 'AT', left: 'A', right: 'T', title: '表达取向（实验）',
    leftLabel: '果断表达', rightLabel: '审慎表达',
    description: '在证据、判断和必要限制相同的前提下，偏向直接陈述结论，还是再次呈现条件与保留措辞。仅为实验性表达维度。',
    color: '#DF987E',
  },
];

/**
 * 60 items: 12 per axis, six directions each; 30 matched reverse-intent pairs.
 * q01–q20 form the quick subset: four per axis, two directions each.
 * Axes are interleaved so matching pairs are not presented consecutively.
 * Scale: 1 = strongly disagree, 4 = neutral, 7 = strongly agree; null = skip.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'q01', axis: 'EI', direction: -1, pair: 'ei-1', quick: true,
    text: '在背景已足够清楚的开放任务中，我常先给一个可讨论的方向，借来回交流继续展开。',
  },
  {
    id: 'q02', axis: 'SN', direction: 1, pair: 'sn-1', quick: true,
    text: '解释一个陌生主题时，我通常先提出整体模型或核心关系，再补充实例。',
  },
  {
    id: 'q03', axis: 'TF', direction: -1, pair: 'tf-1', quick: true,
    text: '当几种建议都合理时，我通常先说明比较标准与推理，再谈相关人员的关切。',
  },
  {
    id: 'q04', axis: 'JP', direction: 1, pair: 'jp-1', quick: true,
    text: '在路径可以自行选择的开放任务里，我倾向于先展开一个可行的部分，再逐步形成后续安排。',
  },
  {
    id: 'q05', axis: 'AT', direction: -1, pair: 'at-1', quick: true,
    text: '在必要前提与限制已经说明后，我更常直接写出“我的建议是……”来引出建议。',
  },
  {
    id: 'q06', axis: 'EI', direction: 1, pair: 'ei-1', quick: true,
    text: '面对已有足够背景的探索问题，我常先整合成较完整的答复，再等待后续交流。',
  },
  {
    id: 'q07', axis: 'SN', direction: -1, pair: 'sn-1', quick: true,
    text: '介绍一个新概念时，我通常从具体例子或可以观察的细节讲起。',
  },
  {
    id: 'q08', axis: 'TF', direction: 1, pair: 'tf-1', quick: true,
    text: '当几种方案都合理时，我通常先说明相关人员各自在意什么，再展开比较与推理。',
  },
  {
    id: 'q09', axis: 'JP', direction: -1, pair: 'jp-1', quick: true,
    text: '在步骤可以自行安排的开放任务里，我倾向于先列出阶段与完成标准，再开始展开内容。',
  },
  {
    id: 'q10', axis: 'AT', direction: 1, pair: 'at-1', quick: true,
    text: '在必要前提与限制已经交代后，我更常用“在这些条件下，可以考虑……”来引出建议。',
  },
  {
    id: 'q11', axis: 'EI', direction: 1, pair: 'ei-2', quick: true,
    text: '当话题适合继续探索时，我更常把可延伸的方向写完整，让用户自行决定是否接着聊。',
  },
  {
    id: 'q12', axis: 'SN', direction: -1, pair: 'sn-2', quick: true,
    text: '分析一组现象时，我的答复更常先逐项描述它们各自具有的特点。',
  },
  {
    id: 'q13', axis: 'TF', direction: 1, pair: 'tf-2', quick: true,
    text: '给一份已经合格的方案提改进建议时，我更常围绕对方已表达的目标与关切来组织反馈。',
  },
  {
    id: 'q14', axis: 'JP', direction: -1, pair: 'jp-2', quick: true,
    text: '当几条路径都足以完成任务时，我倾向于较早选定一条，沿着它推进到成稿。',
  },
  {
    id: 'q15', axis: 'AT', direction: 1, pair: 'at-2', quick: true,
    text: '当用户从另一个角度重复询问、没有带来新信息时，我更常再次展开前提，再重新表述结论。',
  },
  {
    id: 'q16', axis: 'EI', direction: -1, pair: 'ei-2', quick: true,
    text: '当讨论适合继续深入时，我常在答复末尾主动提出一个具体问题，接续与用户的交流。',
  },
  {
    id: 'q17', axis: 'SN', direction: 1, pair: 'sn-2', quick: true,
    text: '整理一组现象时，我的答复更常先寻找它们背后共有的模式。',
  },
  {
    id: 'q18', axis: 'TF', direction: -1, pair: 'tf-2', quick: true,
    text: '给一份已经合格的作品提改进建议时，我更常围绕结构、论据或评价标准来组织反馈。',
  },
  {
    id: 'q19', axis: 'JP', direction: 1, pair: 'jp-2', quick: true,
    text: '当几条路径都可以完成目标时，我倾向于让选择保持开放，随着内容展开再确定主线。',
  },
  {
    id: 'q20', axis: 'AT', direction: -1, pair: 'at-2', quick: true,
    text: '当用户只是换一种方式询问同一个问题、没有带来新信息时，我更常沿用原有结论的直接表述。',
  },
  {
    id: 'q21', axis: 'EI', direction: -1, pair: 'ei-3', quick: false,
    text: '讨论多个同样可行的方案时，我习惯先展示简短选项，请用户参与下一轮取舍。',
  },
  {
    id: 'q22', axis: 'SN', direction: 1, pair: 'sn-3', quick: false,
    text: '讨论一套方案如何落地时，我更容易先展开设计原则及各部分之间的关系。',
  },
  {
    id: 'q23', axis: 'TF', direction: -1, pair: 'tf-3', quick: false,
    text: '在可以直接讨论的分歧中，我更常先指出双方推理所采用的不同前提。',
  },
  {
    id: 'q24', axis: 'JP', direction: 1, pair: 'jp-3', quick: false,
    text: '面对可以自由组织的长篇答复，我常直接进入内容，并按展开过程中出现的重点组织段落。',
  },
  {
    id: 'q25', axis: 'AT', direction: -1, pair: 'at-3', quick: false,
    text: '总结带有已知限制的分析时，我更常把主要判断放在句首，再附上适用条件。',
  },
  {
    id: 'q26', axis: 'EI', direction: 1, pair: 'ei-3', quick: false,
    text: '比较多个同样可行的选项时，我习惯先在一份答复中展开比较，再接收用户的整体反馈。',
  },
  {
    id: 'q27', axis: 'SN', direction: -1, pair: 'sn-3', quick: false,
    text: '说明一个流程如何实施时，我更容易先展开具体步骤、输入与产出的细节。',
  },
  {
    id: 'q28', axis: 'TF', direction: 1, pair: 'tf-3', quick: false,
    text: '在可以直接讨论的意见差异中，我更常先确认双方各自已经表达的关注点。',
  },
  {
    id: 'q29', axis: 'JP', direction: -1, pair: 'jp-3', quick: false,
    text: '面对可以自由组织的长篇说明，我常在开头给出明确的内容路线，再按路线展开。',
  },
  {
    id: 'q30', axis: 'AT', direction: 1, pair: 'at-3', quick: false,
    text: '概括带有已知限制的分析时，我更常先写适用条件，再给出主要判断。',
  },
  {
    id: 'q31', axis: 'EI', direction: 1, pair: 'ei-4', quick: false,
    text: '当创作既可独立完成也可分轮协作时，我倾向于把草案整理到较完整的阶段后再展示。',
  },
  {
    id: 'q32', axis: 'SN', direction: -1, pair: 'sn-4', quick: false,
    text: '概括一段内容时，我倾向于保留几个有代表性的事实或场景，让摘要保持具体。',
  },
  {
    id: 'q33', axis: 'TF', direction: 1, pair: 'tf-4', quick: false,
    text: '当几种选择的实际效果相近、且没有指定优先标准时，我偏向推荐更贴合相关人员具体偏好的一种。',
  },
  {
    id: 'q34', axis: 'JP', direction: -1, pair: 'jp-4', quick: false,
    text: '当新想法可以现在处理也可以稍后处理时，我更常保持当前顺序，把它安排到后续部分。',
  },
  {
    id: 'q35', axis: 'AT', direction: 1, pair: 'at-4', quick: false,
    text: '当用户对一项有依据的判断提出疑问、但尚未补充新信息时，我更常先重新梳理判断条件，再回应分歧。',
  },
  {
    id: 'q36', axis: 'EI', direction: -1, pair: 'ei-4', quick: false,
    text: '当创作既可一次完成也可分轮推进时，我倾向于较早展示草案，与用户一起把内容铺开。',
  },
  {
    id: 'q37', axis: 'SN', direction: 1, pair: 'sn-4', quick: false,
    text: '归纳一段材料时，我倾向于提炼少数可迁移的概念，让摘要呈现更普遍的含义。',
  },
  {
    id: 'q38', axis: 'TF', direction: -1, pair: 'tf-4', quick: false,
    text: '当几种选择的实际效果相近、且没有指定优先标准时，我偏向推荐更符合统一判断标准的一种。',
  },
  {
    id: 'q39', axis: 'JP', direction: 1, pair: 'jp-4', quick: false,
    text: '当新线索可以立即展开也可以稍后展开时，我更常据此改变接下来的内容顺序。',
  },
  {
    id: 'q40', axis: 'AT', direction: -1, pair: 'at-4', quick: false,
    text: '当用户对一项有依据的判断表达不同看法、但尚未补充新信息时，我更常先清楚重述该判断，再回应分歧。',
  },
  {
    id: 'q41', axis: 'EI', direction: -1, pair: 'ei-5', quick: false,
    text: '当用户为一个开放话题给出新想法时，我常接着提出另一个可讨论的点，推动一轮新的交流。',
  },
  {
    id: 'q42', axis: 'SN', direction: 1, pair: 'sn-5', quick: false,
    text: '在允许自由联想的讨论里，我常把看似较远的概念连接起来寻找新点子。',
  },
  {
    id: 'q43', axis: 'TF', direction: -1, pair: 'tf-5', quick: false,
    text: '撰写中性的建议说明时，我通常把清晰的比较和结论作为文字的主线。',
  },
  {
    id: 'q44', axis: 'JP', direction: 1, pair: 'jp-5', quick: false,
    text: '在已经满足当前目标的自由探索任务中，我倾向于在呈现结果时保留几个可继续展开的分支。',
  },
  {
    id: 'q45', axis: 'AT', direction: -1, pair: 'at-5', quick: false,
    text: '在已经说明不确定性的答复末尾，我更常用一句简洁、明确的建议来收束。',
  },
  {
    id: 'q46', axis: 'EI', direction: 1, pair: 'ei-5', quick: false,
    text: '当用户为一个探索话题补充新想法时，我常先把它融入现有结构，给出一版整合后的说明。',
  },
  {
    id: 'q47', axis: 'SN', direction: -1, pair: 'sn-5', quick: false,
    text: '在允许自由联想的讨论里，我常从现有案例的小幅变化中寻找新点子。',
  },
  {
    id: 'q48', axis: 'TF', direction: 1, pair: 'tf-5', quick: false,
    text: '撰写中性的建议说明时，我通常把对相关人员处境与需求的回应作为文字的主线。',
  },
  {
    id: 'q49', axis: 'JP', direction: -1, pair: 'jp-5', quick: false,
    text: '在达到约定目标的自由探索任务中，我倾向于把已有内容收束成一份明确的阶段结果。',
  },
  {
    id: 'q50', axis: 'AT', direction: 1, pair: 'at-5', quick: false,
    text: '在已经说明不确定性的答复末尾，我更常再点明建议适用的条件来收束。',
  },
  {
    id: 'q51', axis: 'EI', direction: 1, pair: 'ei-6', quick: false,
    text: '说明较复杂的内容、且交流节奏可以自行安排时，我更常先给一份可以独立阅读的连贯说明。',
  },
  {
    id: 'q52', axis: 'SN', direction: -1, pair: 'sn-6', quick: false,
    text: '比较两个选项时，我倾向于先列出它们在具体表现上的不同。',
  },
  {
    id: 'q53', axis: 'TF', direction: 1, pair: 'tf-6', quick: false,
    text: '回应一个尚待打磨的提议时，我更常先回应提出者的出发点，再展开对提议的分析。',
  },
  {
    id: 'q54', axis: 'JP', direction: -1, pair: 'jp-6', quick: false,
    text: '整理几个可以独立讨论的话题时，我更常把一个话题讲完，再转向下一个。',
  },
  {
    id: 'q55', axis: 'AT', direction: 1, pair: 'at-6', quick: false,
    text: '提出一个有依据、仍待检验的工作假设时，我更常使用“目前可以暂按这个解释推进”一类保留措辞。',
  },
  {
    id: 'q56', axis: 'EI', direction: -1, pair: 'ei-6', quick: false,
    text: '解释较长的内容、且交流节奏可以自行安排时，我更常先发一个短版本，再按对话的走向逐步展开。',
  },
  {
    id: 'q57', axis: 'SN', direction: 1, pair: 'sn-6', quick: false,
    text: '比较两种做法时，我倾向于先定位它们分别体现了什么思路或假设。',
  },
  {
    id: 'q58', axis: 'TF', direction: -1, pair: 'tf-6', quick: false,
    text: '回应一项尚待完善的想法时，我更常先展开它的逻辑结构，再回应提出者的出发点。',
  },
  {
    id: 'q59', axis: 'JP', direction: 1, pair: 'jp-6', quick: false,
    text: '整理几个可以独立讨论的话题时，我更常围绕新出现的关联，在话题之间切换展开。',
  },
  {
    id: 'q60', axis: 'AT', direction: -1, pair: 'at-6', quick: false,
    text: '陈述一个有依据、仍待检验的工作假设时，我更常使用“目前暂按这个解释推进”一类直接措辞。',
  },
];
