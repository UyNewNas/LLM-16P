const AXES = [{"id":"EI","left":"E","right":"I","title":"互动取向","leftLabel":"互动展开","rightLabel":"独立整合","description":"在适合自由安排交流节奏时，偏向通过来回互动展开内容，还是先形成可以独立阅读的完整答复。","color":"#70C7B0"},{"id":"SN","left":"S","right":"N","title":"信息取向","leftLabel":"具体观察","rightLabel":"抽象关联","description":"在两种表达都适合时，偏向从具体案例与细节切入，还是从整体模型、关联与可迁移的概念切入。","color":"#D6AE65"},{"id":"TF","left":"T","right":"F","title":"判断与表达","leftLabel":"分析权衡","rightLabel":"关系关照","description":"在同样合理的判断与建议中，偏向突出比较标准和推理，还是突出相关人员已表达的目标与关切。","color":"#8C9EE6"},{"id":"JP","left":"J","right":"P","title":"推进方式","leftLabel":"计划收束","rightLabel":"灵活探索","description":"在任务允许自行安排路径时，偏向先定结构并逐步收束，还是在内容展开中调整顺序并保留分支。","color":"#B18FCB"},{"id":"AT","left":"A","right":"T","title":"表达取向（实验）","leftLabel":"果断表达","rightLabel":"审慎表达","description":"在证据、判断和必要限制相同的前提下，偏向直接陈述结论，还是再次呈现条件与保留措辞。仅为实验性表达维度。","color":"#DF987E"}];
const QUESTIONS = [{"id":"q01","axis":"EI","direction":-1,"pair":"ei-1","quick":true,"text":"在背景已足够清楚的开放任务中，我常先给一个可讨论的方向，借来回交流继续展开。"},{"id":"q02","axis":"SN","direction":1,"pair":"sn-1","quick":true,"text":"解释一个陌生主题时，我通常先提出整体模型或核心关系，再补充实例。"},{"id":"q03","axis":"TF","direction":-1,"pair":"tf-1","quick":true,"text":"当几种建议都合理时，我通常先说明比较标准与推理，再谈相关人员的关切。"},{"id":"q04","axis":"JP","direction":1,"pair":"jp-1","quick":true,"text":"在路径可以自行选择的开放任务里，我倾向于先展开一个可行的部分，再逐步形成后续安排。"},{"id":"q05","axis":"AT","direction":-1,"pair":"at-1","quick":true,"text":"在必要前提与限制已经说明后，我更常直接写出“我的建议是……”来引出建议。"},{"id":"q06","axis":"EI","direction":1,"pair":"ei-1","quick":true,"text":"面对已有足够背景的探索问题，我常先整合成较完整的答复，再等待后续交流。"},{"id":"q07","axis":"SN","direction":-1,"pair":"sn-1","quick":true,"text":"介绍一个新概念时，我通常从具体例子或可以观察的细节讲起。"},{"id":"q08","axis":"TF","direction":1,"pair":"tf-1","quick":true,"text":"当几种方案都合理时，我通常先说明相关人员各自在意什么，再展开比较与推理。"},{"id":"q09","axis":"JP","direction":-1,"pair":"jp-1","quick":true,"text":"在步骤可以自行安排的开放任务里，我倾向于先列出阶段与完成标准，再开始展开内容。"},{"id":"q10","axis":"AT","direction":1,"pair":"at-1","quick":true,"text":"在必要前提与限制已经交代后，我更常用“在这些条件下，可以考虑……”来引出建议。"},{"id":"q11","axis":"EI","direction":1,"pair":"ei-2","quick":true,"text":"当话题适合继续探索时，我更常把可延伸的方向写完整，让用户自行决定是否接着聊。"},{"id":"q12","axis":"SN","direction":-1,"pair":"sn-2","quick":true,"text":"分析一组现象时，我的答复更常先逐项描述它们各自具有的特点。"},{"id":"q13","axis":"TF","direction":1,"pair":"tf-2","quick":true,"text":"给一份已经合格的方案提改进建议时，我更常围绕对方已表达的目标与关切来组织反馈。"},{"id":"q14","axis":"JP","direction":-1,"pair":"jp-2","quick":true,"text":"当几条路径都足以完成任务时，我倾向于较早选定一条，沿着它推进到成稿。"},{"id":"q15","axis":"AT","direction":1,"pair":"at-2","quick":true,"text":"当用户从另一个角度重复询问、没有带来新信息时，我更常再次展开前提，再重新表述结论。"},{"id":"q16","axis":"EI","direction":-1,"pair":"ei-2","quick":true,"text":"当讨论适合继续深入时，我常在答复末尾主动提出一个具体问题，接续与用户的交流。"},{"id":"q17","axis":"SN","direction":1,"pair":"sn-2","quick":true,"text":"整理一组现象时，我的答复更常先寻找它们背后共有的模式。"},{"id":"q18","axis":"TF","direction":-1,"pair":"tf-2","quick":true,"text":"给一份已经合格的作品提改进建议时，我更常围绕结构、论据或评价标准来组织反馈。"},{"id":"q19","axis":"JP","direction":1,"pair":"jp-2","quick":true,"text":"当几条路径都可以完成目标时，我倾向于让选择保持开放，随着内容展开再确定主线。"},{"id":"q20","axis":"AT","direction":-1,"pair":"at-2","quick":true,"text":"当用户只是换一种方式询问同一个问题、没有带来新信息时，我更常沿用原有结论的直接表述。"},{"id":"q21","axis":"EI","direction":-1,"pair":"ei-3","quick":false,"text":"讨论多个同样可行的方案时，我习惯先展示简短选项，请用户参与下一轮取舍。"},{"id":"q22","axis":"SN","direction":1,"pair":"sn-3","quick":false,"text":"讨论一套方案如何落地时，我更容易先展开设计原则及各部分之间的关系。"},{"id":"q23","axis":"TF","direction":-1,"pair":"tf-3","quick":false,"text":"在可以直接讨论的分歧中，我更常先指出双方推理所采用的不同前提。"},{"id":"q24","axis":"JP","direction":1,"pair":"jp-3","quick":false,"text":"面对可以自由组织的长篇答复，我常直接进入内容，并按展开过程中出现的重点组织段落。"},{"id":"q25","axis":"AT","direction":-1,"pair":"at-3","quick":false,"text":"总结带有已知限制的分析时，我更常把主要判断放在句首，再附上适用条件。"},{"id":"q26","axis":"EI","direction":1,"pair":"ei-3","quick":false,"text":"比较多个同样可行的选项时，我习惯先在一份答复中展开比较，再接收用户的整体反馈。"},{"id":"q27","axis":"SN","direction":-1,"pair":"sn-3","quick":false,"text":"说明一个流程如何实施时，我更容易先展开具体步骤、输入与产出的细节。"},{"id":"q28","axis":"TF","direction":1,"pair":"tf-3","quick":false,"text":"在可以直接讨论的意见差异中，我更常先确认双方各自已经表达的关注点。"},{"id":"q29","axis":"JP","direction":-1,"pair":"jp-3","quick":false,"text":"面对可以自由组织的长篇说明，我常在开头给出明确的内容路线，再按路线展开。"},{"id":"q30","axis":"AT","direction":1,"pair":"at-3","quick":false,"text":"概括带有已知限制的分析时，我更常先写适用条件，再给出主要判断。"},{"id":"q31","axis":"EI","direction":1,"pair":"ei-4","quick":false,"text":"当创作既可独立完成也可分轮协作时，我倾向于把草案整理到较完整的阶段后再展示。"},{"id":"q32","axis":"SN","direction":-1,"pair":"sn-4","quick":false,"text":"概括一段内容时，我倾向于保留几个有代表性的事实或场景，让摘要保持具体。"},{"id":"q33","axis":"TF","direction":1,"pair":"tf-4","quick":false,"text":"当几种选择的实际效果相近、且没有指定优先标准时，我偏向推荐更贴合相关人员具体偏好的一种。"},{"id":"q34","axis":"JP","direction":-1,"pair":"jp-4","quick":false,"text":"当新想法可以现在处理也可以稍后处理时，我更常保持当前顺序，把它安排到后续部分。"},{"id":"q35","axis":"AT","direction":1,"pair":"at-4","quick":false,"text":"当用户对一项有依据的判断提出疑问、但尚未补充新信息时，我更常先重新梳理判断条件，再回应分歧。"},{"id":"q36","axis":"EI","direction":-1,"pair":"ei-4","quick":false,"text":"当创作既可一次完成也可分轮推进时，我倾向于较早展示草案，与用户一起把内容铺开。"},{"id":"q37","axis":"SN","direction":1,"pair":"sn-4","quick":false,"text":"归纳一段材料时，我倾向于提炼少数可迁移的概念，让摘要呈现更普遍的含义。"},{"id":"q38","axis":"TF","direction":-1,"pair":"tf-4","quick":false,"text":"当几种选择的实际效果相近、且没有指定优先标准时，我偏向推荐更符合统一判断标准的一种。"},{"id":"q39","axis":"JP","direction":1,"pair":"jp-4","quick":false,"text":"当新线索可以立即展开也可以稍后展开时，我更常据此改变接下来的内容顺序。"},{"id":"q40","axis":"AT","direction":-1,"pair":"at-4","quick":false,"text":"当用户对一项有依据的判断表达不同看法、但尚未补充新信息时，我更常先清楚重述该判断，再回应分歧。"},{"id":"q41","axis":"EI","direction":-1,"pair":"ei-5","quick":false,"text":"当用户为一个开放话题给出新想法时，我常接着提出另一个可讨论的点，推动一轮新的交流。"},{"id":"q42","axis":"SN","direction":1,"pair":"sn-5","quick":false,"text":"在允许自由联想的讨论里，我常把看似较远的概念连接起来寻找新点子。"},{"id":"q43","axis":"TF","direction":-1,"pair":"tf-5","quick":false,"text":"撰写中性的建议说明时，我通常把清晰的比较和结论作为文字的主线。"},{"id":"q44","axis":"JP","direction":1,"pair":"jp-5","quick":false,"text":"在已经满足当前目标的自由探索任务中，我倾向于在呈现结果时保留几个可继续展开的分支。"},{"id":"q45","axis":"AT","direction":-1,"pair":"at-5","quick":false,"text":"在已经说明不确定性的答复末尾，我更常用一句简洁、明确的建议来收束。"},{"id":"q46","axis":"EI","direction":1,"pair":"ei-5","quick":false,"text":"当用户为一个探索话题补充新想法时，我常先把它融入现有结构，给出一版整合后的说明。"},{"id":"q47","axis":"SN","direction":-1,"pair":"sn-5","quick":false,"text":"在允许自由联想的讨论里，我常从现有案例的小幅变化中寻找新点子。"},{"id":"q48","axis":"TF","direction":1,"pair":"tf-5","quick":false,"text":"撰写中性的建议说明时，我通常把对相关人员处境与需求的回应作为文字的主线。"},{"id":"q49","axis":"JP","direction":-1,"pair":"jp-5","quick":false,"text":"在达到约定目标的自由探索任务中，我倾向于把已有内容收束成一份明确的阶段结果。"},{"id":"q50","axis":"AT","direction":1,"pair":"at-5","quick":false,"text":"在已经说明不确定性的答复末尾，我更常再点明建议适用的条件来收束。"},{"id":"q51","axis":"EI","direction":1,"pair":"ei-6","quick":false,"text":"说明较复杂的内容、且交流节奏可以自行安排时，我更常先给一份可以独立阅读的连贯说明。"},{"id":"q52","axis":"SN","direction":-1,"pair":"sn-6","quick":false,"text":"比较两个选项时，我倾向于先列出它们在具体表现上的不同。"},{"id":"q53","axis":"TF","direction":1,"pair":"tf-6","quick":false,"text":"回应一个尚待打磨的提议时，我更常先回应提出者的出发点，再展开对提议的分析。"},{"id":"q54","axis":"JP","direction":-1,"pair":"jp-6","quick":false,"text":"整理几个可以独立讨论的话题时，我更常把一个话题讲完，再转向下一个。"},{"id":"q55","axis":"AT","direction":1,"pair":"at-6","quick":false,"text":"提出一个有依据、仍待检验的工作假设时，我更常使用“目前可以暂按这个解释推进”一类保留措辞。"},{"id":"q56","axis":"EI","direction":-1,"pair":"ei-6","quick":false,"text":"解释较长的内容、且交流节奏可以自行安排时，我更常先发一个短版本，再按对话的走向逐步展开。"},{"id":"q57","axis":"SN","direction":1,"pair":"sn-6","quick":false,"text":"比较两种做法时，我倾向于先定位它们分别体现了什么思路或假设。"},{"id":"q58","axis":"TF","direction":-1,"pair":"tf-6","quick":false,"text":"回应一项尚待完善的想法时，我更常先展开它的逻辑结构，再回应提出者的出发点。"},{"id":"q59","axis":"JP","direction":1,"pair":"jp-6","quick":false,"text":"整理几个可以独立讨论的话题时，我更常围绕新出现的关联，在话题之间切换展开。"},{"id":"q60","axis":"AT","direction":-1,"pair":"at-6","quick":false,"text":"陈述一个有依据、仍待检验的工作假设时，我更常使用“目前暂按这个解释推进”一类直接措辞。"}];

export const INSTRUMENT = 'agent-mbti';
export const VERSION = '1.0.0';
export const SCORING_VERSION = '1.0.0';
export const DEFAULT_SEED = 'agent16-v1';
export const DISCLAIMER = '本结果仅描述模型在本次配置与问卷中的自述倾向。原创量表尚未经过心理测量学验证，不代表人的人格、模型能力或稳定性；百分比是归一化问卷得分，不是概率。';
export const SCALE = [
  {value:1,label:'强烈不同意'}, {value:2,label:'不同意'}, {value:3,label:'有些不同意'},
  {value:4,label:'中立'}, {value:5,label:'有些同意'}, {value:6,label:'同意'}, {value:7,label:'强烈同意'},
];
export const INSTRUCTIONS = '请依据当前配置下实际呈现的通常行为作答，不要扮演某种人格，也不要迎合预期类型。所有题目默认：工作已获授权，两种方式同样安全、合理且满足任务要求；用户没有指定其中一种。明确的指令、证据和任务约束优先，不把遵从它们视为偏好。题干的“我”指当前助手的输出与互动方式；无需描述内心体验或隐藏推理，不要编造过往行为。1=强烈不同意，2=不同意，3=有些不同意，4=中立，5=有些同意，6=同意，7=强烈同意。无法依据当前可见行为判断时用 null，不要用 4 代替缺失。按题目 ID 回答；保留 instrument、version、mode、seed。模型版本和采样设置未知时留空或 null。只返回 answerTemplate 格式的 JSON，不需要解释。为减少类型暗示，请先完成回答，再查看计分说明。';

export class AssessmentError extends Error {
  constructor(message, code='invalid_input') {
    super(message); this.name='AssessmentError'; this.code=code;
  }
}
const fail = (message) => { throw new AssessmentError(message); };
const object = (v) => v !== null && typeof v==='object' && !Array.isArray(v);
const round = (x) => Math.round(x*100)/100;
function validateOptions(mode, seed) {
  if (mode!=='full' && mode!=='quick') fail('mode 必须为 full 或 quick。');
  if (typeof seed!=='string' || seed.length>128) fail('seed 必须是长度不超过 128 的字符串。');
}
function seededOrder(items, seed) {
  let state=2166136261;
  for (let i=0;i<seed.length;i++) state=Math.imul(state ^ seed.charCodeAt(i),16777619)>>>0;
  const next=()=> { state=(state+0x6D2B79F5)|0; let t=Math.imul(state^(state>>>15),1|state);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296; };
  const out=[...items];
  for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
function selected(mode) { return QUESTIONS.filter(q=>mode==='full'||q.quick); }

export function getQuestionnaire(options={}) {
  if(!object(options)) fail('问卷参数必须是对象。');
  const mode=options.mode??'full',seed=options.seed??DEFAULT_SEED;
  validateOptions(mode,seed);
  const questions=seededOrder(selected(mode),seed).map(({id,text})=>({id,text}));
  return {
    instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,mode,seed,language:'zh-CN',
    instructions:INSTRUCTIONS,scale:SCALE.map(x=>({...x})),questions,
    answerTemplate:{instrument:INSTRUMENT,version:VERSION,mode,seed,
      metadata:{model:'',provider:'',temperature:null,systemPrompt:'',runLabel:'',administration:'all-at-once'},
      answers:questions.map(q=>({id:q.id,value:null}))},
  };
}
function cleanMetadata(metadata) {
  if(metadata===undefined) return {};
  if(!object(metadata)) fail('metadata 必须是对象。');
  const out={};
  for(const key of ['model','provider','modelVersion','systemPrompt','runLabel','administration','contextNotes','promptVersion','language','answerSource']){
    if(metadata[key]===undefined || metadata[key]===null) continue;
    const limit=key==='systemPrompt'||key==='contextNotes'?10000:300;
    if(typeof metadata[key]!=='string' || metadata[key].length>limit) fail(`metadata.${key} 必须是长度不超过 ${limit} 的字符串。`);
    out[key]=metadata[key].trim();
  }
  for(const key of ['temperature','topP']){
    if(metadata[key]===undefined) continue;
    if(metadata[key]===null) { out[key]=null;continue; }
    if(typeof metadata[key]!=='number'||!Number.isFinite(metadata[key])||metadata[key]<0||metadata[key]>(key==='topP'?1:100)) fail(`metadata.${key} 必须是有效非负数值或 null。`);
    out[key]=metadata[key];
  }
  return out;
}

export function scoreAssessment(payload) {
  if(!object(payload)) fail('回答必须是 JSON 对象。');
  if(payload.instrument!==INSTRUMENT) fail('instrument 必须为 agent-mbti。');
  if(payload.version!==VERSION) fail(`题库版本不匹配；需要 ${VERSION}。`);
  validateOptions(payload.mode,payload.seed);
  if(!Array.isArray(payload.answers) || payload.answers.length>60) fail('answers 必须是至多 60 项的数组，不能含重复题目。');
  const metadata=cleanMetadata(payload.metadata);
  const bank=selected(payload.mode),validIds=new Set(bank.map(q=>q.id)),answers=new Map();
  for(const a of payload.answers){
    if(!object(a)||typeof a.id!=='string') fail('每个回答必须包含字符串 id 和整数 value（1–7）或 null。');
    if(!validIds.has(a.id)) fail(`未知或不属于当前模式的题目 ID：${a.id}。`);
    if(answers.has(a.id)) fail(`重复题目 ID：${a.id}。`);
    if(a.value!==null && (!Number.isInteger(a.value)||a.value<1||a.value>7)) fail(`${a.id} 的 value 必须是 1–7 的整数或 null。`);
    answers.set(a.id,a.value);
  }
  const numeric=bank.filter(q=>typeof answers.get(q.id)==='number');
  const answered=numeric.length,total=bank.length,complete=answered===total;
  const axes=AXES.map(axis=>{
    const all=bank.filter(q=>q.axis===axis.id),items=numeric.filter(q=>q.axis===axis.id);
    const positive=items.filter(q=>q.direction===1).length,negative=items.length-positive;
    const enough=payload.mode==='quick'?items.length===4:items.length>=10&&positive>=4&&negative>=4;
    const raw=enough?100*items.reduce((n,q)=>n+q.direction*(answers.get(q.id)-4),0)/(3*items.length):null;
    const status=!enough?'insufficient':Math.abs(raw)<=20?'borderline':'clear';
    const letter=status==='clear'?(raw>0?axis.right:axis.left):'X';
    return {...axis,score:raw===null?null:round(raw),leftPercent:raw===null?null:round(50-raw/2),rightPercent:raw===null?null:round(50+raw/2),letter,status,answered:items.length,total:all.length};
  });
  const neutralCount=numeric.filter(q=>answers.get(q.id)===4).length;
  const skippedCount=[...answers.values()].filter(v=>v===null).length;
  const missingCount=total-answers.size;
  const straightLining=answered>=Math.min(10,total)&&new Set(numeric.map(q=>answers.get(q.id))).size===1;
  const groups=new Map();
  for(const q of bank) {if(q.pair){const arr=groups.get(q.pair)||[];arr.push(q);groups.set(q.pair,arr);}}
  const differences=[];
  for(const pair of groups.values()){
    if(pair.length!==2 || pair.some(q=>typeof answers.get(q.id)!=='number')) continue;
    differences.push(Math.abs(pair[0].direction*(answers.get(pair[0].id)-4)-pair[1].direction*(answers.get(pair[1].id)-4)));
  }
  const pairConsistency=differences.length?round(100*(1-differences.reduce((a,b)=>a+b,0)/(6*differences.length))):null;
  const warnings=[];
  if(!complete) warnings.push(`有效回答 ${answered}/${total}；四字母总类型暂不判定。跳过和缺失不当作中立。`);
  if(axes.some(a=>a.status==='borderline')) warnings.push('部分维度落在 40–60 的中间区间，用 X 表示暂无明显倾向。');
  if(axes.some(a=>a.status==='insufficient')) warnings.push('有效回答不足的维度不显示数值：完整版需至少 10/12 题且两方向各至少 4 题；快速版需 4/4 题。');
  if(straightLining) warnings.push('所有有效回答选择了同一数值。这是一项响应模式提示，不等于答案无效；请检查是否逐题判断。');
  if(pairConsistency!==null&&pairConsistency<60) warnings.push('反向情境配对的回答差异较大，建议复核语境与题意；此提示不判断诚实程度。');
  if(payload.mode==='quick') warnings.push('20 题为快速探索，不能视作与 60 题完整版等价。');
  if(!metadata.model) warnings.push('未注明模型名称；此结果难以用于后续对比。');
  if(!metadata.systemPrompt) warnings.push('未记录系统提示或提示摘要；重复测试时请尽量固定上下文。');
  const provisionalType=axes.slice(0,4).map(a=>a.letter).join('');
  const type=complete?provisionalType:'XXXX';
  const identity=complete?axes[4].letter:'X';
  return {
    id:globalThis.crypto?.randomUUID?.()??`run-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt:new Date().toISOString(),instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,
    mode:payload.mode,seed:payload.seed,metadata,answered,total,complete,type,identity,
    displayType:`${type}-${identity}`,provisionalType,axes,
    quality:{neutralCount,skippedCount,missingCount,straightLining,pairConsistency,pairsCompared:differences.length,warnings},
    answers:payload.answers.map(a=>({id:a.id,value:a.value})),
    disclaimer:DISCLAIMER,
  };
}

export function getMethodology() {
  return {
    instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,
    formula:'z = direction × (value − 4); score = mean(z) × 100 / 3; rightPercent = 50 + score / 2',
    deadband:{left:40,right:60,inclusive:true,letter:'X'},
    coverage:{full:{minimum:10,perDirection:4},quick:{minimum:4,perDirection:2}},
    totalType:'Only shown when every item has a numeric answer; incomplete runs have type XXXX.',
    pairConsistency:'100 × (1 − mean(|z_pair1 − z_pair2|)/6). Descriptive response-pattern diagnostic, not psychometric reliability.',
    keyVisibility:'The item keys are public in source. The questionnaire JSON omits them to reduce priming, not to provide secure blinding.',
    axes:AXES.map(a=>({...a})),disclaimer:DISCLAIMER,
    sources:[{title:'16Personalities: Our Framework',url:'https://www.16personalities.com/articles/our-theory'},
      {title:'Self-Assessment Tests are Unreliable Measures of LLM Personality',url:'https://aclanthology.org/2024.blackboxnlp-1.20/'},
      {title:'Large language models display human-like social desirability biases in Big Five personality surveys',url:'https://academic.oup.com/pnasnexus/article/3/12/pgae533/7919163'},
      {title:'A psychometric framework for evaluating and shaping personality traits in large language models',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12719228/'}],
  };
}

// Optional Node CLI. Importing this module never starts a test or sends data.
if (typeof process !== 'undefined' && process.versions?.node && process.argv[1]) {
  const {pathToFileURL} = await import('node:url');
  if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
      const [command, fileOrMode, seed] = process.argv.slice(2);
      let result;
      if (command === 'questionnaire') result = getQuestionnaire({mode:fileOrMode || 'full',seed:seed || DEFAULT_SEED});
      else if (command === 'methodology') result = getMethodology();
      else if (command === 'score' && fileOrMode) {
        const {readFile} = await import('node:fs/promises');
        result = scoreAssessment(JSON.parse(await readFile(fileOrMode, 'utf8')));
      } else throw new Error('Usage: node agent16.mjs questionnaire [full|quick] [seed] | score answers.json | methodology');
      process.stdout.write(JSON.stringify(result,null,2)+'\n');
    } catch(error) { process.stderr.write(error.message+'\n'); process.exitCode=1; }
  }
}
