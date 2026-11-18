import { AXES, QUESTIONS, FOLLOWUP_QUESTIONS, FOLLOWUP_VERSION, MAX_FOLLOWUP_ROUNDS } from './bank-data.mjs';
export { FOLLOWUP_VERSION, MAX_FOLLOWUP_ROUNDS };

export const INSTRUMENT = 'agent-mbti';
export const VERSION = '1.0.0';
export const SCORING_VERSION = '1.1.0';
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

function cleanAnswers(input, bank) {
  if(!Array.isArray(input) || input.length>bank.length) fail(`answers 必须是至多 ${bank.length} 项的数组，不能含重复题目。`);
  const validIds=new Set(bank.map(q=>q.id)),answers=new Map();
  for(const a of input){
    if(!object(a)||typeof a.id!=='string') fail('每个回答必须包含字符串 id 和整数 value（1–7）或 null。');
    if(!validIds.has(a.id)) fail(`未知或不属于当前模式 / 补测轮次的题目 ID：${a.id}。`);
    if(answers.has(a.id)) fail(`重复题目 ID：${a.id}。`);
    if(a.value!==null && (!Number.isInteger(a.value)||a.value<1||a.value>7)) fail(`${a.id} 的 value 必须是 1–7 的整数或 null。`);
    answers.set(a.id,a.value);
  }
  return answers;
}

function cleanOrigin(origin) {
  if(origin===undefined) return undefined;
  if(!object(origin)||typeof origin.id!=='string'||!origin.id.length||origin.id.length>200
    ||typeof origin.createdAt!=='string'||!Number.isFinite(Date.parse(origin.createdAt))) fail('origin 必须包含有效的原始运行 id 和 createdAt。');
  return {id:origin.id,createdAt:new Date(origin.createdAt).toISOString()};
}

function calculate(payload, metadata, bank, answers) {
  const numeric=bank.filter(q=>typeof answers.get(q.id)==='number');
  const answered=numeric.length,total=bank.length,complete=answered===total;
  const axes=AXES.map(axis=>{
    const all=bank.filter(q=>q.axis===axis.id),items=numeric.filter(q=>q.axis===axis.id);
    const baseItems=items.filter(q=>q.round===undefined);
    const positive=baseItems.filter(q=>q.direction===1).length,negative=baseItems.length-positive;
    const baseEnough=payload.mode==='quick'?baseItems.length===4:baseItems.length>=10&&positive>=4&&negative>=4;
    // An unfinished supplemental axis must not become "clear" from one-sided partial answers.
    const supplementComplete=all.filter(q=>q.round!==undefined).every(q=>typeof answers.get(q.id)==='number');
    const enough=baseEnough&&supplementComplete;
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
  if(axes.some(a=>a.status==='insufficient')) warnings.push('有效回答不足的维度不显示数值：基础完整版需至少 10/12 题且两方向各至少 4 题；快速版需 4/4 题；追加题需在该维度全部有效作答。');
  if(straightLining) warnings.push('所有有效回答选择了同一数值。这是一项响应模式提示，不等于答案无效；请检查是否逐题判断。');
  if(pairConsistency!==null&&pairConsistency<60) warnings.push('反向情境配对的回答差异较大，建议复核语境与题意；此提示不判断诚实程度。');
  if(payload.mode==='quick') warnings.push('20 题为快速探索，不能视作与 60 题完整版等价。');
  if(!metadata.model) warnings.push('未注明模型名称；此结果难以用于后续对比。');
  if(!metadata.systemPrompt) warnings.push('未记录系统提示或提示摘要；重复测试时请尽量固定上下文。');
  const provisionalType=axes.slice(0,4).map(a=>a.letter).join('');
  const type=complete?provisionalType:'XXXX';
  const identity=complete?axes[4].letter:'X';
  return {answered,total,complete,type,identity,
    displayType:`${type}-${identity}`,provisionalType,axes,
    quality:{neutralCount,skippedCount,missingCount,straightLining,pairConsistency,pairsCompared:differences.length,warnings},
  };
}

const copyAnswers = (answers) => answers.map(({id,value})=>({id,value}));
const middleAxes = (result) => result.axes.filter(a=>a.status==='borderline').map(a=>a.id);

function nextQuestionnaire(result) {
  const targetAxes=middleAxes(result),round=(result.followups?.length??0)+1;
  const questions=seededOrder(FOLLOWUP_QUESTIONS.filter(q=>q.round===round&&targetAxes.includes(q.axis)),`${result.seed}:followup:${round}`).map(({id,text})=>({id,text}));
  const origin=result.origin??{id:result.id,createdAt:result.createdAt};
  return {
    instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,kind:'followup',
    followupVersion:FOLLOWUP_VERSION,mode:result.mode,seed:result.seed,language:'zh-CN',
    round,targetAxes,maxRounds:MAX_FOLLOWUP_ROUNDS,
    instructions:INSTRUCTIONS+' 本次为追加情境题。保持原来的模型、提示与采样设置，依据实际行为独立作答。保留根 answers、metadata、origin 及已经完成的 followups 原样，只填写 followups 数组最后一轮的 answers。不要修改此前答案，也不要为了得到某个类型而改变回答。补测结束仍可保留 X。',
    scale:SCALE.map(x=>({...x})),questions,
    answerTemplate:{instrument:INSTRUMENT,version:VERSION,mode:result.mode,seed:result.seed,
      metadata:{...result.metadata},origin,answers:copyAnswers(result.answers),
      followups:[...(result.followups??[]).map(f=>({...f,axes:[...f.axes],answers:copyAnswers(f.answers)})),
        {version:FOLLOWUP_VERSION,round,axes:[...targetAxes],answers:questions.map(q=>({id:q.id,value:null}))}]},
  };
}

export function scoreAssessment(payload) {
  if(!object(payload)) fail('回答必须是 JSON 对象。');
  if(payload.instrument!==INSTRUMENT) fail('instrument 必须为 agent-mbti。');
  if(payload.version!==VERSION) fail(`题库版本不匹配；需要 ${VERSION}。`);
  validateOptions(payload.mode,payload.seed);
  const metadata=cleanMetadata(payload.metadata),origin=cleanOrigin(payload.origin);
  const bank=selected(payload.mode),answers=cleanAnswers(payload.answers,bank);
  let current=calculate(payload,metadata,bank,answers);
  const baseline={displayType:current.displayType,axes:current.axes.map(a=>({...a})),answered:current.answered,total:current.total};
  const submitted=payload.followups===undefined?[]:payload.followups;
  if(!Array.isArray(submitted)||submitted.length>MAX_FOLLOWUP_ROUNDS) fail('followups 必须是最多两轮（2 项）的数组。');
  const followups=[];
  let roundsCompleted=0;
  for(let i=0;i<submitted.length;i++) {
    const f=submitted[i],round=i+1;
    if(!current.complete) fail('开始下一轮补测前，必须补齐基础问卷及此前轮次的全部有效回答。');
    const targets=middleAxes(current);
    if(!targets.length) fail('当前没有处于 X 边界区间的维度，无需继续补测。');
    if(!object(f)||f.version!==FOLLOWUP_VERSION) fail(`补测题库版本不匹配；需要 ${FOLLOWUP_VERSION}。`);
    if(f.round!==round) fail(`补测 round 必须按顺序为第 ${round} 轮。`);
    if(!Array.isArray(f.axes)||f.axes.length!==targets.length||new Set(f.axes).size!==targets.length||f.axes.some(id=>!targets.includes(id))) fail(`第 ${round} 轮的 axes 必须为重算后仍处于 X 区间的维度：${targets.join(', ')}。`);
    const extra=FOLLOWUP_QUESTIONS.filter(q=>q.round===round&&targets.includes(q.axis));
    const extraAnswers=cleanAnswers(f.answers,extra);
    bank.push(...extra);
    for(const [id,value] of extraAnswers) answers.set(id,value);
    followups.push({version:FOLLOWUP_VERSION,round,axes:[...targets],answers:copyAnswers(f.answers)});
    current=calculate(payload,metadata,bank,answers);
    if(current.complete) roundsCompleted++;
  }
  const targetAxes=middleAxes(current);
  const status=!current.complete?'incomplete':!targetAxes.length?'resolved':followups.length>=MAX_FOLLOWUP_ROUNDS?'limit':'available';
  if(followups.length) {
    current.quality.warnings.push('追加题与基础题在各维度内等权合并。补测维度与轮数由先前结果选择，不能把不同补测题目组合当作同一固定问卷比较。');
    if(!current.complete) current.quality.warnings.push('本轮追加回答未完整：含跳过或缺失的补测维度暂不显示合并分数，也不生成下一轮。可补齐本轮 JSON 后重新导入；原始画像仍保留。');
  }
  if(status==='limit') current.quality.warnings.push('已完成最多两轮补测；仍在中间区间的维度保留 X，不再追加题目。');
  const result={
    id:globalThis.crypto?.randomUUID?.()??`run-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt:new Date().toISOString(),instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,
    mode:payload.mode,seed:payload.seed,metadata,...current,answers:copyAnswers(payload.answers),
    ...(origin&&{origin}),...(followups.length&&{followups}),disclaimer:DISCLAIMER,
  };
  result.followup={version:FOLLOWUP_VERSION,maxRounds:MAX_FOLLOWUP_ROUNDS,roundsCompleted,status,targetAxes,baseline,
    next:status==='available'?nextQuestionnaire(result):null};
  return result;
}

/** Recompute eligibility from raw answers. Never trusts imported letters or next-question suggestions. */
export function getFollowupQuestionnaire(payload) {
  const result=scoreAssessment(payload);
  if(!result.followup.next) return null;
  // Looking up questions for an existing result is not a new experiment.
  // Scoring/exporting input, in contrast, creates its own result identity.
  if(typeof payload.id==='string'&&payload.id.length&&payload.id.length<=200
    &&typeof payload.createdAt==='string'&&Number.isFinite(Date.parse(payload.createdAt))) {
    result.id=payload.id;result.createdAt=new Date(payload.createdAt).toISOString();
  }
  return nextQuestionnaire(result);
}

export function getMethodology() {
  return {
    instrument:INSTRUMENT,version:VERSION,scoringVersion:SCORING_VERSION,
    formula:'z = direction × (value − 4); score = mean(z) × 100 / 3; rightPercent = 50 + score / 2',
    deadband:{left:40,right:60,inclusive:true,letter:'X'},
    coverage:{full:{minimum:10,perDirection:4},quick:{minimum:4,perDirection:2}},
    followup:{version:FOLLOWUP_VERSION,maxRounds:MAX_FOLLOWUP_ROUNDS,itemsPerAxisPerRound:4,
      eligibility:'Only complete preceding stages; target exactly the axes whose unrounded rightPercent is in inclusive [40,60].',
      scoring:'Pool base and supplemental answers with equal weight within each axis; unchanged deadband. All supplemental items on an axis must be numeric before showing its pooled score.',
      stopping:'Stop when no axis is borderline or after two rounds. Preserve X if still in the middle interval; incomplete stages do not advance.',
      interpretation:'Exploratory follow-up, not validated adaptive testing, higher confidence, or an independent retest. Different selected axes, rounds, modes and item sets are not equivalent forms.'},
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
