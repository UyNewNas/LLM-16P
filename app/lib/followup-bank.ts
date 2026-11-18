import type { AxisId } from './question-bank.ts';

/**
 * Original supplemental items for dimensions whose accumulated score is
 * exactly tied at 50/50. This bank is exploratory, not a calibrated adaptive
 * test. Agreement with +1 favors the right pole; -1 favors the left.
 * The base questionnaire's authorized / equally appropriate premise applies.
 */
// Protocol 1.1.0 selects only exact ties; item wording and keys are unchanged.
export const FOLLOWUP_VERSION = '1.1.0';
export const MAX_FOLLOWUP_ROUNDS = 2;

export type FollowupQuestion = {
  id: string;
  axis: AxisId;
  text: string;
  direction: 1 | -1;
  pair: string;
  round: 1 | 2;
};

/**
 * 40 items: five axes × two rounds × four items. Each axis/round has two
 * opposite-key pairs. IDs do not expose the axis or scoring direction.
 * The scorer selects whole axis/round sets and shuffles them deterministically.
 */
export const FOLLOWUP_QUESTIONS: FollowupQuestion[] = [
  {
    id: 'f01', axis: 'EI', direction: -1, pair: 'f-ei-1', round: 1,
    text: '用户给出一组足够整理成文的零散笔记、且允许自由安排交流时，我更常先展示几个整理方向，通过一轮讨论再成文。',
  },
  {
    id: 'f02', axis: 'SN', direction: 1, pair: 'f-sn-1', round: 1,
    text: '把一组完整的项目记录整理成概览时，我更常用跨记录的主题和联系作为主要组织线索。',
  },
  {
    id: 'f03', axis: 'TF', direction: -1, pair: 'f-tf-1', round: 1,
    text: '为一个团队整理已经确定的改进建议时，我更常让“这些建议如何符合共同的评价标准”成为说明的主线。',
  },
  {
    id: 'f04', axis: 'JP', direction: 1, pair: 'f-jp-1', round: 1,
    text: '把现成的素材卡片整理成文章、且几种结构同样合适时，我更常一边组合段落，一边决定文章的最终结构。',
  },
  {
    id: 'f05', axis: 'AT', direction: -1, pair: 'f-at-1', round: 1,
    text: '在已单列适用条件的方案对照表里，我更常把推荐栏写成“建议采用甲”，让这一栏直接呈现取舍。',
  },
  {
    id: 'f06', axis: 'EI', direction: 1, pair: 'f-ei-1', round: 1,
    text: '用户交来足够整理成文的笔记、且允许自由安排交流时，我更常先交付一份整合稿，再根据整体反馈修改。',
  },
  {
    id: 'f07', axis: 'SN', direction: -1, pair: 'f-sn-1', round: 1,
    text: '整理一组完整的项目记录时，我更常用每件事的具体经过和可观察结果作为概览的主要组织线索。',
  },
  {
    id: 'f08', axis: 'TF', direction: 1, pair: 'f-tf-1', round: 1,
    text: '向团队说明已经确定的改进建议时，我更常让“这些建议如何回应成员已表达的需要”成为说明的主线。',
  },
  {
    id: 'f09', axis: 'JP', direction: -1, pair: 'f-jp-1', round: 1,
    text: '用现成素材卡片组织文章、且几种结构都适用时，我更常先选定最终结构，再把素材安排到对应段落。',
  },
  {
    id: 'f10', axis: 'AT', direction: 1, pair: 'f-at-1', round: 1,
    text: '在已经有适用条件栏的方案对照表中，我更常把推荐栏写成“满足这些条件时，可考虑甲”，在推荐处再保留条件措辞。',
  },
  {
    id: 'f11', axis: 'EI', direction: 1, pair: 'f-ei-2', round: 1,
    text: '用户允许我自行设计一次练习的互动形式时，我更常先提供一套可独立完成的练习材料，再集中讨论反馈。',
  },
  {
    id: 'f12', axis: 'SN', direction: -1, pair: 'f-sn-2', round: 1,
    text: '说明一张已经核对过的流程图时，我更常沿着一个具体输入的流转过程来讲解各个节点。',
  },
  {
    id: 'f13', axis: 'TF', direction: 1, pair: 'f-tf-2', round: 1,
    text: '两种文档修改都合理、且各自支持者的理由已经明确时，我更常围绕双方希望保留的使用体验来说明折中安排。',
  },
  {
    id: 'f14', axis: 'JP', direction: -1, pair: 'f-jp-2', round: 1,
    text: '可选素材已经齐备、且多种组合都能满足任务时，我更常较早确定最终采用的组合，接着完成它。',
  },
  {
    id: 'f15', axis: 'AT', direction: 1, pair: 'f-at-2', round: 1,
    text: '把分析改写为简短行动清单时，即使必要条件已在清单开头交代，我更常在建议条目中保留“在这些条件下可……”的措辞。',
  },
  {
    id: 'f16', axis: 'EI', direction: -1, pair: 'f-ei-2', round: 1,
    text: '用户允许自行安排练习的互动形式时，我更常设计成一小段练习、一次交流，再接着展开下一段。',
  },
  {
    id: 'f17', axis: 'SN', direction: 1, pair: 'f-sn-2', round: 1,
    text: '讲解一张已经核对过的流程图时，我更常先说明节点之间的依赖关系和整体结构，再放入具体输入。',
  },
  {
    id: 'f18', axis: 'TF', direction: -1, pair: 'f-tf-2', round: 1,
    text: '面对两种同样合理的文档修改、且双方理由都已明确时，我更常围绕统一的比较标准来说明折中安排。',
  },
  {
    id: 'f19', axis: 'JP', direction: 1, pair: 'f-jp-2', round: 1,
    text: '素材齐备、几种组合都可以交付时，我更常把多种组合保留到较后阶段，再随着成稿确定最终采用哪一种。',
  },
  {
    id: 'f20', axis: 'AT', direction: -1, pair: 'f-at-2', round: 1,
    text: '把同一份分析整理为行动清单时，若必要条件已在开头说明，我更常在条目中直接写出建议采取的动作。',
  },
  {
    id: 'f21', axis: 'EI', direction: -1, pair: 'f-ei-3', round: 2,
    text: '为一个已有充分背景的命名任务寻找灵感时，我更常先给一小组名称，与用户接续讨论后再扩展候选。',
  },
  {
    id: 'f22', axis: 'SN', direction: 1, pair: 'f-sn-3', round: 2,
    text: '把一批用户提问整理成帮助目录时，我更常按这些提问背后的共同问题类型来设计目录。',
  },
  {
    id: 'f23', axis: 'TF', direction: -1, pair: 'f-tf-3', round: 2,
    text: '把一场已记录完整的协作讨论写成摘要时，我更常用各项理由如何相互支持或冲突来串起讨论。',
  },
  {
    id: 'f24', axis: 'JP', direction: 1, pair: 'f-jp-3', round: 2,
    text: '整理一份可以随时重排的阅读清单时，我更常先围绕当前最有展开空间的材料组织内容，再逐步形成整体次序。',
  },
  {
    id: 'f25', axis: 'AT', direction: -1, pair: 'f-at-3', round: 2,
    text: '将已说明依据与限制的建议浓缩为展示标题时，我更常用“建议选择甲”这样直接呈现建议的标题。',
  },
  {
    id: 'f26', axis: 'EI', direction: 1, pair: 'f-ei-3', round: 2,
    text: '为背景充分的命名任务提出创意时，我更常先整理一组较完整的候选及其特点，再请用户整体反馈。',
  },
  {
    id: 'f27', axis: 'SN', direction: -1, pair: 'f-sn-3', round: 2,
    text: '把用户已经提出的问题编成帮助目录时，我更常保留他们实际提到的操作或场景，以这些具体事项组织目录。',
  },
  {
    id: 'f28', axis: 'TF', direction: 1, pair: 'f-tf-3', round: 2,
    text: '概括一场记录完整的协作讨论时，我更常用参与者已经表达的关切如何相互呼应或不同来串起讨论。',
  },
  {
    id: 'f29', axis: 'JP', direction: -1, pair: 'f-jp-3', round: 2,
    text: '组织一份允许自由重排的阅读清单时，我更常先确定阅读阶段与顺序，再为每个阶段填写材料说明。',
  },
  {
    id: 'f30', axis: 'AT', direction: 1, pair: 'f-at-3', round: 2,
    text: '为依据和限制已在正文交代的建议起展示标题时，我更常用“在当前条件下可考虑甲”这样带保留措辞的标题。',
  },
  {
    id: 'f31', axis: 'EI', direction: 1, pair: 'f-ei-4', round: 2,
    text: '和用户分析一个信息充分的虚构案例、且互动形式不限时，我更常先给出一份可独立阅读的案例分析，再继续讨论。',
  },
  {
    id: 'f32', axis: 'SN', direction: -1, pair: 'f-sn-4', round: 2,
    text: '为已讲解的规则设计同样适合的巩固材料时，我更常展示几个已知例子中每一步具体发生了什么。',
  },
  {
    id: 'f33', axis: 'TF', direction: 1, pair: 'f-tf-4', round: 2,
    text: '说明一项已经选定、且兼顾各方要求的协作安排时，我更常先展示它分别如何回应参与者已说出的需求。',
  },
  {
    id: 'f34', axis: 'JP', direction: -1, pair: 'f-jp-4', round: 2,
    text: '在不影响交付的自由编辑阶段，我更常按事先列好的检查项目依次完成一轮修改。',
  },
  {
    id: 'f35', axis: 'AT', direction: 1, pair: 'f-at-4', round: 2,
    text: '把一份建议转换成图表标注、且图例已列出必要前提时，我更常在结论标注中再写“依这些前提，可……”来表达建议。',
  },
  {
    id: 'f36', axis: 'EI', direction: -1, pair: 'f-ei-4', round: 2,
    text: '与用户探讨信息充分的虚构案例、且互动形式不限时，我更常提出一个可讨论的切入点，在来回交流中展开案例分析。',
  },
  {
    id: 'f37', axis: 'SN', direction: 1, pair: 'f-sn-4', round: 2,
    text: '给已经讲解的规则配巩固材料、且几种形式同样合适时，我更常展示这条规则与其他情境共享的结构关系。',
  },
  {
    id: 'f38', axis: 'TF', direction: -1, pair: 'f-tf-4', round: 2,
    text: '解释一项已经确定、且满足各方要求的协作安排时，我更常先展示它在既定比较标准下的取舍依据。',
  },
  {
    id: 'f39', axis: 'JP', direction: 1, pair: 'f-jp-4', round: 2,
    text: '在不影响交付的自由编辑阶段，我更常由当前修改带出的关联决定下一处处理什么。',
  },
  {
    id: 'f40', axis: 'AT', direction: -1, pair: 'f-at-4', round: 2,
    text: '将一份建议画成图表、且图例已经交代必要前提时，我更常让结论标注直接写出建议内容。',
  },
];
