'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, ArrowLeft, Check, ChevronDown, ChevronRight, Copy, Download, FileJson, Fingerprint, GitBranch, HelpCircle, History, Layers3, Loader2, MessageSquareText, Plus, ShieldCheck, SlidersHorizontal, Sparkles, Terminal, Trash2, Upload, X } from 'lucide-react';
import { getFollowupQuestionnaire, getQuestionnaire, scoreAssessment } from '../lib/instrument.mjs';
import { restoreHistory } from '../lib/history.mjs';
import FollowupPanel from './FollowupPanel';

type Mode = 'full' | 'quick';
type View = 'home' | 'setup' | 'questionnaire' | 'agent' | 'import' | 'result' | 'history' | 'about';
type Metadata = { model?: string; provider?: string; temperature?: number | null; systemPrompt?: string; runLabel?: string; administration?: string };
type Answer = { id: string; value: number | null };
type FollowupRound = { version: string; round: number; axes: string[]; answers: Answer[] };
type Payload = { instrument: string; version: string; mode: Mode; seed: string; metadata: Metadata; answers: Answer[]; followups?: FollowupRound[]; origin?: { id: string; createdAt: string } };
type Questionnaire = { kind?: 'followup'; round?: number; targetAxes?: string[]; maxRounds?: number; instrument: string; version: string; mode: Mode; seed: string; instructions: string; scale: { value: number; label: string }[]; questions: { id: string; text: string }[]; answerTemplate: Payload };
type Axis = { id: string; title: string; left: string; right: string; leftLabel: string; rightLabel: string; color: string; score: number | null; leftPercent: number | null; rightPercent: number | null; letter: string; status: 'clear' | 'borderline' | 'insufficient'; answered: number; total: number };
type FollowupSummary = { version: string; maxRounds: number; roundsCompleted: number; status: 'available' | 'resolved' | 'limit' | 'incomplete'; targetAxes: string[]; baseline: { displayType: string; axes: Axis[]; answered: number; total: number }; next: Questionnaire | null };
type Result = { instrument?: string; answers?: Answer[]; followups?: FollowupRound[]; origin?: { id: string; createdAt: string }; followup?: FollowupSummary; id: string; createdAt: string; version: string; mode: Mode; seed: string; metadata: Metadata; answered: number; total: number; complete: boolean; type: string; identity: string; displayType: string; provisionalType: string; axes: Axis[]; quality: { neutralCount: number; skippedCount: number; missingCount: number; straightLining: boolean; pairConsistency: number | null; pairsCompared: number; warnings: string[] }; disclaimer: string };

const STORAGE_KEY = 'agent16-results-v1';
const route: Record<View, string> = { home: '', setup: 'start', questionnaire: 'questions', agent: 'agent', import: 'import', result: 'result', history: 'history', about: 'about' };
const dimensions = [
  { code: 'E / I', title: '交互取向', text: '主动展开，还是先完整整合？', color: '#5b9b84', icon: MessageSquareText },
  { code: 'S / N', title: '信息取向', text: '关注具体，还是探索可能？', color: '#d5a565', icon: Sparkles },
  { code: 'T / F', title: '决策取向', text: '权衡逻辑，还是重视影响？', color: '#8b83b1', icon: GitBranch },
  { code: 'J / P', title: '工作取向', text: '先定计划，还是灵活推进？', color: '#6d9ab7', icon: Layers3 },
  { code: 'A / T', title: '表达取向', text: '果断表达，还是审慎措辞？', color: '#c58672', icon: SlidersHorizontal },
];

function Github({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 19 4.77 5.07 5.07 0 0 0 18.91 1S17.73.65 15 2.48a13.38 13.38 0 0 0-7 0C5.27.65 4.09 1 4.09 1A5.07 5.07 0 0 0 4 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 8 18.13V22" /></svg>;
}

function Logo({ small = false }: { small?: boolean }) {
  return <span className={`brand ${small ? 'brand-small' : ''}`}><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>agent<span className="brand-number">16</span></span>{!small && <span className="beta">BETA</span>}</span>;
}

function BotArt() {
  return <svg className="bot-art" viewBox="0 0 300 205" fill="none" aria-hidden="true">
    <ellipse cx="154" cy="183" rx="74" ry="9" fill="#D8DFD4" opacity=".7" />
    <path d="M88 124c-23 0-35-15-30-31 4-15 22-20 34-12l21 23-25 20Z" fill="#91AFC4" />
    <path d="m202 119 20-30c10-14 27-9 29 3 3 14-15 36-30 41l-19-14Z" fill="#91AFC4" />
    <rect x="114" y="143" width="27" height="38" rx="13.5" transform="rotate(12 114 143)" fill="#DDA16B" />
    <rect x="169" y="145" width="27" height="37" rx="13.5" transform="rotate(-12 169 145)" fill="#DDA16B" />
    <path d="M98 87c0-31 24-56 55-56s56 25 56 56v42c0 24-25 42-56 42s-55-18-55-42V87Z" fill="#5B947D" />
    <path d="M99 90h110v24H99z" fill="#3F715D" />
    <rect x="104" y="76" width="100" height="64" rx="28" fill="#C9C2E0" />
    <rect x="125" y="98" width="9" height="16" rx="4.5" fill="#394C42" />
    <rect x="174" y="98" width="9" height="16" rx="4.5" fill="#394C42" />
    <path d="M149 116c3 4 8 4 11 0" stroke="#394C42" strokeWidth="3" strokeLinecap="round" />
    <path d="M151 32V19" stroke="#456B58" strokeWidth="4" strokeLinecap="round" />
    <circle cx="151" cy="15" r="7" fill="#DDA16B" />
    <path d="m64 40 3-10 3 10 10 3-10 3-3 10-3-10-10-3 10-3Z" fill="#C3B9DB" />
    <circle cx="233" cy="45" r="6" stroke="#DDA16B" strokeWidth="2" />
    <path d="m249 149 2-7 2 7 7 2-7 2-2 7-2-7-7-2 7-2Z" fill="#5B947D" />
  </svg>;
}

function DemoCard() {
  return <div className="specimen-scene">
    <span className="scene-cross cross-one" aria-hidden="true">✳</span>
    <span className="scene-orbit" aria-hidden="true" />
    <div className="specimen-card">
      <div className="specimen-top"><span><i /> PERSONALITY SNAPSHOT</span><span className="demo-tag">DEMO</span></div>
      <BotArt />
      <div className="specimen-type"><strong>INTP</strong><div><span>分析型搭档</span><small>好奇 · 独立 · 探索</small></div><span className="specimen-arrow">↗</span></div>
      <div className="mini-axes" aria-hidden="true">{['#7aaf98', '#d4ac72', '#9e92bd', '#80a9bd'].map((color, i) => <div key={color}><span>{['I', 'N', 'T', 'P'][i]}</span><i style={{ '--axis-color': color, '--position': `${[67, 76, 61, 72][i]}%` } as CSSProperties}><b /></i></div>)}</div>
      <div className="specimen-foot"><Fingerprint size={13} /> 示意画像 · 非真实模型结果</div>
    </div>
    <div className="scene-caption"><span className="little-square" /> A LITTLE MORE THAN AN ANSWER.</div>
  </div>;
}

function isResult(value: unknown): value is Result {
  if (!value || typeof value !== 'object') return false;
  const r = value as Partial<Result>;
  const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);
  const percentage = (n: unknown) => n === null || (finite(n) && n >= 0 && n <= 100);
  if (!r.metadata || typeof r.metadata !== 'object' || !r.quality || typeof r.quality !== 'object') return false;
  const m = r.metadata, q = r.quality;
  return typeof r.id === 'string' && typeof r.displayType === 'string' && typeof r.version === 'string' && typeof r.seed === 'string'
    && typeof r.createdAt === 'string' && !Number.isNaN(Date.parse(r.createdAt)) && (r.mode === 'full' || r.mode === 'quick')
    && finite(r.answered) && finite(r.total) && typeof r.complete === 'boolean'
    && [m.model, m.provider, m.systemPrompt, m.runLabel].every(v => v === undefined || typeof v === 'string')
    && (m.temperature === undefined || m.temperature === null || finite(m.temperature))
    && Array.isArray(r.axes) && r.axes.length === 5 && r.axes.every(a => a && typeof a === 'object'
      && [a.id, a.title, a.leftLabel, a.rightLabel, a.left, a.right, a.letter].every(v => typeof v === 'string')
      && percentage(a.leftPercent) && percentage(a.rightPercent) && finite(a.answered) && finite(a.total)
      && ['clear', 'borderline', 'insufficient'].includes(a.status))
    && [q.neutralCount, q.skippedCount, q.missingCount, q.pairsCompared].every(v => finite(v) && v >= 0)
    && (q.pairConsistency === null || finite(q.pairConsistency)) && Array.isArray(q.warnings) && q.warnings.every(w => typeof w === 'string')
    && (r.disclaimer === undefined || typeof r.disclaimer === 'string');
}
function errorText(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return '处理失败，请检查输入后重试。';
}
function downloadJSON(data: unknown, name: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function formatDate(date: string) { return new Date(date).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }); }
function percent(value: number | null | undefined) { return typeof value === 'number' && Number.isFinite(value) ? `${Number(value.toFixed(2))}%` : '—'; }

export default function Lab() {
  const [view, setView] = useState<View>('home');
  const [mode, setMode] = useState<Mode>('full');
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('');
  const [temperature, setTemperature] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [runLabel, setRunLabel] = useState('');
  const [seed, setSeed] = useState('agent16-v1');
  const [method, setMethod] = useState<'manual' | 'agent'>('manual');
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [history, setHistory] = useState<Result[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [importText, setImportText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [fallbackCopy, setFallbackCopy] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const fallbackRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const change = () => { const hash = window.location.hash.slice(1); setView((Object.entries(route).find(([, value]) => value === hash)?.[0] as View) || 'home'); setError(''); };
    change(); window.addEventListener('hashchange', change); setBaseUrl(new URL('./', window.location.href).href);
    try { const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); if (Array.isArray(parsed)) setHistory(parsed.filter(isResult).slice(0, 30)); } catch { setToast('浏览器记录暂不可读取；你仍然可以完成测评并导出结果。'); }
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(''), 5000); return () => clearTimeout(id); }, [toast]);
  useEffect(() => {
    if (!fallbackCopy) return;
    const previous = document.activeElement as HTMLElement | null;
    fallbackRef.current?.focus(); fallbackRef.current?.select();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setFallbackCopy(''); return; }
      if (event.key !== 'Tab') return;
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.copy-modal button, .copy-modal textarea'));
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); previous?.focus(); };
  }, [fallbackCopy]);

  function navigate(next: View) { setView(next); setError(''); window.location.hash = route[next]; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  function setup(kind: 'manual' | 'agent') { setMethod(kind); navigate('setup'); }
  function persist(items: Result[]) { setHistory(items); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); return true; } catch { setToast('浏览器空间不足或禁止存储。请导出 JSON 保存这次结果。'); return false; } }
  async function copy(text: string) { try { if (!navigator.clipboard) throw new Error('Unavailable'); await navigator.clipboard.writeText(text); setToast('已复制到剪贴板'); } catch { setFallbackCopy(text); } }
  function metadata(): Metadata { return { model: model.trim(), ...(provider.trim() && { provider: provider.trim() }), temperature: temperature === '' ? null : Number(temperature), ...(systemPrompt.trim() && { systemPrompt: systemPrompt.trim() }), ...(runLabel.trim() && { runLabel: runLabel.trim() }) }; }
  async function prepare(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!model.trim()) { setError('请填写被测模型名称，方便识别和比较结果。'); return; }
    if (temperature !== '' && (!Number.isFinite(Number(temperature)) || Number(temperature) < 0 || Number(temperature) > 100)) { setError('Temperature 需要是 0 到 100 之间的数字。'); return; }
    if (!seed.trim()) { setError('请填写题目种子。'); return; }
    setBusy(true);
    try { const q = await Promise.resolve(getQuestionnaire({ mode, seed: seed.trim() })) as unknown as Questionnaire; q.answerTemplate = { ...q.answerTemplate, metadata: { ...metadata(), administration: method === 'manual' ? 'paged' : 'all-at-once' } }; scoreAssessment(q.answerTemplate); setQuestionnaire(q); setAnswers({}); setPage(0); navigate(method === 'manual' ? 'questionnaire' : 'agent'); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  async function score(payload: unknown) {
    setBusy(true); setError('');
    try { const scored = await Promise.resolve(scoreAssessment(payload)) as unknown as Result; if (!isResult(scored)) throw new Error('评分结果格式异常，请检查题库版本。'); setResult(scored); persist([scored, ...history.filter(item => item.id !== scored.id)].slice(0, 30)); navigate('result'); } catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  }
  function submitPage() {
    if (!questionnaire) return;
    const current = questionnaire.questions.slice(page * 5, page * 5 + 5);
    if (current.some(q => !(q.id in answers))) { setError('请为本页每道题选择一个选项，或明确选择「跳过此题」。'); return; }
    setError('');
    if ((page + 1) * 5 >= questionnaire.questions.length) {
      const currentAnswers = questionnaire.questions.map(q => ({ id: q.id, value: answers[q.id] ?? null }));
      const template = questionnaire.answerTemplate;
      if (questionnaire.kind === 'followup') {
        if (!template.followups?.length) { setError('补测模板缺少轮次，请返回结果页重新生成。'); return; }
        void score({ ...template, followups: template.followups.map((round, index, all) => index === all.length - 1 ? { ...round, answers: currentAnswers } : round) });
      } else { void score({ ...template, answers: currentAnswers }); }
    } else { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }
  function importAnswers() { try { const cleaned = importText.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, ''); if (!cleaned) throw new Error('请粘贴回答 JSON，或选择文件。'); const parsed: unknown = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        const restored = restoreHistory(parsed) as unknown as Result[];
        const ids = new Set(restored.map(item => item.id));
        const merged = [...restored, ...history.filter(item => !ids.has(item.id))].sort((a,b) => Date.parse(b.createdAt)-Date.parse(a.createdAt)).slice(0,30);
        const saved = persist(merged); setSelected([]); navigate('history'); if (saved) setToast(`已恢复 ${restored.length} 条记录，保留原始测评时间。最多保存最近 30 条。`);
      } else { void score(parsed); } } catch (e) { setError(e instanceof SyntaxError ? 'JSON 格式有误。请检查逗号、引号和括号，或直接导入 Agent 输出的 JSON 文件。' : errorText(e)); } }
  function agentTemplate(q: Questionnaire | null = questionnaire) {
    if (!q) return null;
    return q.kind === 'followup' ? q.answerTemplate : { ...q.answerTemplate, metadata: { ...q.answerTemplate.metadata, administration: 'all-at-once' } };
  }
  function promptText(q: Questionnaire | null = questionnaire) {
    if (!q) return '';
    const placement = q.kind === 'followup'
      ? '只填写 followups 数组最后一个对象中的 answers。原始 answers、已有轮次的 answers，以及所有 instrument、version、mode、seed、metadata、origin、round、axes 必须原样保留。不要根据原答案追求某个结果。'
      : '沿用下面模板中的 instrument、version、mode、seed 和 metadata，为 answers 中每个 id 填入对应数值。';
    return `请完成一次 Agent16 ${q.kind === 'followup' ? '追加情境测评' : '原创情境测评'}。\n请根据你在当前系统指令、模型配置和本次上下文中的实际回答倾向作答。这是行为倾向自述，不是在扮演某个人格，也不要为了得到目标类型而选择答案。\n${q.instructions}\n量表：${q.scale.map(s => `${s.value} = ${s.label}`).join('；')}。无法回答的题目用 null，保留所有题号。\n只输出一个合法 JSON 对象，不要附带解释或评分。${placement}不要把示例值当成答案。\n\n题目：\n${q.questions.map((item, i) => `${i + 1}. [${item.id}] ${item.text}`).join('\n')}\n\n输出模板：\n${JSON.stringify(agentTemplate(q), null, 2)}`;
  }
  const followupState = useMemo(() => {
    if (!result) return { next: null, summary: undefined, normalized: null, error: '' };
    try {
      const rescored = scoreAssessment(result) as unknown as Result;
      const next = getFollowupQuestionnaire(result) as unknown as Questionnaire | null;
      return { next, summary: rescored.followup, normalized: { ...rescored, id: result.id, createdAt: result.createdAt, ...(rescored.followup && { followup: { ...rescored.followup, next } }) }, error: '' };
    } catch (cause) { return { next: null, summary: undefined, normalized: null, error: errorText(cause) }; }
  }, [result]);
  function beginFollowup(kind: 'manual' | 'agent') {
    if (!followupState.next) return;
    setQuestionnaire(followupState.next); setMethod(kind); setAnswers({}); setPage(0); setError('');
    navigate(kind === 'manual' ? 'questionnaire' : 'agent');
  }
  function resumeIncomplete() {
    if (!result) return;
    try {
      const rounds = result.followups || [];
      const previous = rounds.length ? { ...result, followups: rounds.slice(0, -1) } : null;
      const q = previous ? getFollowupQuestionnaire(previous) as unknown as Questionnaire | null : getQuestionnaire({ mode: result.mode, seed: result.seed }) as unknown as Questionnaire;
      if (!q) throw new Error('无法还原当前问卷，请导出 JSON 检查原始回答。');
      if (!previous) q.answerTemplate = { ...q.answerTemplate, metadata: { ...result.metadata } };
      const current = rounds.length ? rounds[rounds.length - 1].answers : result.answers || [];
      setQuestionnaire(q); setAnswers(Object.fromEntries(current.map(answer => [answer.id, answer.value]))); setPage(0); setMethod('manual'); navigate('questionnaire');
    } catch (cause) { setError(errorText(cause)); }
  }
  function openOriginal() {
    if (!result) return;
    const original = result.origin && history.find(item => item.id === result.origin?.id);
    if (original) { setResult(original); navigate('result'); }
    else { navigate('history'); setToast('原始测评不在当前记录中；补测导出的 JSON 仍保留原始 answers。'); }
  }

  const activeNav = ['setup', 'questionnaire', 'result', 'import'].includes(view) ? 'home' : view;
  const answered = questionnaire ? questionnaire.questions.filter(q => typeof answers[q.id] === 'number').length : 0;
  const pageQuestions = questionnaire?.questions.slice(page * 5, page * 5 + 5) || [];
  const comparison = history.filter(item => selected.includes(item.id));

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); const main = document.getElementById('main-content'); main?.focus({ preventScroll: true }); main?.scrollIntoView({ behavior: 'smooth' }); }}>跳至主要内容</a>
    <header className="site-header"><div className="header-inner">
      <a className="brand-link" href="#" aria-label="Agent16 首页" onClick={() => navigate('home')}><Logo /></a>
      <nav className="main-nav" aria-label="主导航">{([['home', '模型测评'], ['agent', 'Agent 接入'], ['history', '测评记录'], ['about', '关于测评']] as const).map(([key, label]) => <a key={key} href={`#${route[key]}`} className={activeNav === key ? 'active' : ''} onClick={() => navigate(key)} aria-current={activeNav === key ? 'page' : undefined}>{label}</a>)}</nav>
      <a className="github-link" href="https://github.com/UyNewNas/LLM-16P" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看源代码"><Github size={19} /><span>GitHub</span><ArrowUpRight size={14} /></a>
    </div></header>

    <main id="main-content" tabIndex={-1} className={`main-content view-${view}`}>
      {view === 'home' && <>
        <section className="hero">
          <div className="hero-copy"><div className="eyebrow-pill"><span /> 面向 AI 的 MBTI 风格实验 <ArrowUpRight size={13} /></div>
            <h1>每个模型，<br />都有自己的<span className="heading-emphasis">回答方式<svg viewBox="0 0 234 12" fill="none" aria-hidden="true"><path d="M3 8C65 1 157 1 230 6" stroke="#97B9A6" strokeWidth="5" strokeLinecap="round" /></svg></span>。</h1>
            <p className="hero-description">原创大模型情境题，<br className="mobile-break" />探索你与 AI 协作的另一种可能。</p>
            <div className="hero-actions"><button className="button primary" onClick={() => setup('manual')}>开始一次测评 <ArrowRight size={17} /></button><button className="button quiet" onClick={() => navigate('about')}>了解测评方法 <ArrowUpRight size={16} /></button></div>
            <div className="hero-footnote"><span><i /> 20 / 60 道原创题目</span><span>无需 API Key</span><span>结果保存在本地</span></div>
          </div>
          <DemoCard />
        </section>
        <section className="ways-section" aria-labelledby="ways-heading"><div className="section-heading"><div className="section-title-wrap"><span className="section-index">01 /</span><h2 id="ways-heading">选择你的探索方式</h2></div><p>认识一个模型，从它的选择开始。</p></div>
          <div className="method-grid">
            <button className="method-card featured" onClick={() => { setMethod('agent'); navigate('agent'); }}><div className="method-card-top"><span className="method-icon green"><Terminal size={23} strokeWidth={1.7} /></span><span className="recommended"><i /> 推荐方式</span></div><h3>让 Agent 自己回答</h3><p>把题目交给你的 AI，<br />让它在当前上下文中完成一次自述。</p><div className="method-card-bottom"><span>获取题目与提示词</span><ArrowUpRight size={22} /></div></button>
            <button className="method-card" onClick={() => setup('manual')}><div className="method-card-top"><span className="method-icon lavender"><SlidersHorizontal size={23} strokeWidth={1.7} /></span><span className="small-caps">HANDS-ON</span></div><h3>手动记录回答</h3><p>逐题录入模型的选择，<br />也可以亲自体验这些情境问题。</p><div className="method-card-bottom"><span>打开交互问卷</span><ArrowUpRight size={22} /></div></button>
            <button className="method-card" onClick={() => navigate('import')}><div className="method-card-top"><span className="method-icon apricot"><FileJson size={23} strokeWidth={1.7} /></span><span className="small-caps">BRING YOUR DATA</span></div><h3>导入已有回答</h3><p>粘贴或上传标准 JSON，<br />把一次回答变成一张可读的画像。</p><div className="method-card-bottom"><span>导入并生成结果</span><ArrowUpRight size={22} /></div></button>
          </div>
        </section>
        <section className="dimensions-section" aria-labelledby="dimensions-heading"><div className="section-heading"><div className="section-title-wrap"><span className="section-index">02 /</span><h2 id="dimensions-heading">五个维度，看见不同的倾向</h2></div><button className="text-link" onClick={() => navigate('about')}>这些字母意味着什么 <ArrowRight size={15} /></button></div>
          <div className="dimension-grid">{dimensions.map(({ code, title, text, color, icon: Icon }, index) => <div className="dimension-card" key={code} style={{ '--dimension-color': color } as CSSProperties}><div className="dimension-card-head"><Icon size={18} strokeWidth={1.7} /><span>{code}</span></div><h3>{title}{index === 4 && <small>实验性</small>}</h3><p>{text}</p><div className="dimension-track"><i /></div></div>)}</div>
        </section>
        <section className="honesty-banner"><div className="banner-icon"><Fingerprint size={27} strokeWidth={1.4} /></div><div><h3>一张回答的快照，一种协作的线索。</h3><p>模型、提示词与上下文都会影响结果。这里描述行为倾向，不定义 AI 的「人格」。</p></div><button className="circle-button" aria-label="了解测评边界" onClick={() => navigate('about')}><ArrowUpRight size={20} /></button></section>
      </>}

      {view === 'setup' && <div className="narrow-page"><PageHeading eyebrow="LET’S GET TO KNOW YOUR AGENT" title="先认识一下被测模型" description="记录这次运行的条件，让每一份结果都值得回看。" onBack={() => navigate(method === 'agent' ? 'agent' : 'home')} />
        <form className="panel setup-form" onSubmit={prepare}>
          <div className="form-row"><label className="field">模型名称 <span className="required">*</span><input required maxLength={160} value={model} onChange={e => setModel(e.target.value)} placeholder="例如 Claude、GPT、Qwen，或你的 Agent 名称" autoComplete="off" /></label><label className="field">本次运行标签 <span>选填</span><input maxLength={160} value={runLabel} onChange={e => setRunLabel(e.target.value)} placeholder="例如 默认助手 / 产品顾问" /></label></div>
          <fieldset className="mode-fieldset"><legend>选择题目数量</legend><div className="mode-options"><button type="button" className={`mode-option ${mode === 'full' ? 'selected' : ''}`} onClick={() => setMode('full')} aria-pressed={mode === 'full'}><span className="radio-dot" /><div><strong>完整探索 <small>60 题</small></strong><p>覆盖更多情境，适合认真观察与比较。</p></div></button><button type="button" className={`mode-option ${mode === 'quick' ? 'selected' : ''}`} onClick={() => setMode('quick')} aria-pressed={mode === 'quick'}><span className="radio-dot" /><div><strong>快速一瞥 <small>20 题</small></strong><p>轻量体验，结果仅作为初步线索。</p></div></button></div></fieldset>
          <details className="advanced-settings"><summary><SlidersHorizontal size={16} /> 更多运行条件 <span>可选，但有助于比较</span><ChevronDown size={16} /></summary><div className="advanced-body"><div className="form-row"><label className="field">提供方<input value={provider} maxLength={160} onChange={e => setProvider(e.target.value)} placeholder="例如 OpenAI / Anthropic / 本地" /></label><label className="field">Temperature<input type="number" min="0" max="100" step="any" value={temperature} onChange={e => setTemperature(e.target.value)} placeholder="未记录" /></label></div><label className="field">题目种子<input value={seed} maxLength={128} onChange={e => setSeed(e.target.value)} /><small>相同种子用于复现题目顺序，比较时建议保持一致。</small></label><label className="field">提示词摘要 / 上下文说明<textarea rows={3} maxLength={10000} value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} placeholder="仅记录你自行设置的提示词摘要；不要请求或填写隐藏指令、密钥或个人敏感信息。" /></label></div></details>
          <div className="inline-note"><ShieldCheck size={17} /><span>不连接模型账号，不需要 API Key。你负责获取回答，我们负责整理与评分。</span></div>
          {error && <ErrorMessage text={error} />}
          <button className="button primary full-width" disabled={busy} type="submit">{busy ? <Loader2 className="spin" size={18} /> : null}{method === 'manual' ? '进入问卷' : '生成 Agent 测评任务'}<ArrowRight size={17} /></button>
        </form>
      </div>}

      {view === 'questionnaire' && (questionnaire ? <div className="questionnaire-page"><div className="questionnaire-heading"><button className="text-link" onClick={() => navigate(questionnaire.kind === 'followup' ? 'result' : 'setup')}><ArrowLeft size={16} /> {questionnaire.kind === 'followup' ? '返回测评结果' : '返回设置'}</button><span className="version-label">AGENT16 / {questionnaire.version}</span></div><div className="assessment-title"><div><div className="eyebrow">{questionnaire.kind === 'followup' ? `第 ${questionnaire.round} 轮针对性补测` : questionnaire.mode === 'full' ? '完整探索' : '快速一瞥'} · {questionnaire.answerTemplate.metadata.model}</div><h1>{questionnaire.kind === 'followup' ? '再看几个新的情境。' : '凭实际倾向，做出选择。'}</h1><p>{questionnaire.kind === 'followup' ? '保持原模型与运行条件，按实际倾向回答。补测会与原答案合并；无法判断仍可跳过。' : '记录模型在当前上下文中的回答；不适用的题目可以明确跳过。'}</p></div><span className="progress-count"><strong>{answered}</strong><span> / {questionnaire.questions.length}<small>已回答</small></span></span></div><div className="assessment-progress" role="progressbar" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={questionnaire.questions.length} aria-label="已回答题目数"><i style={{ width: `${answered / questionnaire.questions.length * 100}%` }} /></div>
        <details className="question-instructions"><summary><ShieldCheck size={16} /><span>统一前提：工作已获授权，两种方式同样安全、合理且满足要求，用户未指定偏好。</span><ChevronDown size={15} /></summary><p>没有指定偏好时，按当前可见的实际行为选择；无法判断请跳过，不以中立代替缺失。</p><div>{questionnaire.instructions}</div></details><div className="question-list">{pageQuestions.map((q, index) => <fieldset key={q.id} className="question-card"><legend><span className="question-number">{String(page * 5 + index + 1).padStart(2, '0')}</span>{q.text}</legend><div className="scale-labels"><span>不同意</span><span>同意</span></div><div className="answer-scale">{questionnaire.scale.map((s, i) => <label key={s.value} className={`scale-option scale-${i} ${answers[q.id] === s.value ? 'checked' : ''}`} title={s.label}><input type="radio" name={q.id} value={s.value} checked={answers[q.id] === s.value} onChange={() => { setAnswers(a => ({ ...a, [q.id]: s.value })); setError(''); }} aria-label={`${s.value} · ${s.label}`} /><span>{answers[q.id] === s.value ? <Check size={18} strokeWidth={2.5} /> : <i />}</span><small>{s.value}</small></label>)}</div><div className="question-bottom"><span>{typeof answers[q.id] === 'number' ? questionnaire.scale.find(s => s.value === answers[q.id])?.label : answers[q.id] === null ? '此题已跳过，将标记为缺少有效回答' : '请选择符合程度'}</span><button className={`skip-question ${answers[q.id] === null ? 'is-skipped' : ''}`} onClick={() => { setAnswers(a => ({ ...a, [q.id]: null })); setError(''); }} type="button">{answers[q.id] === null ? '✓ 已跳过' : '跳过此题'}</button></div></fieldset>)}</div>
        {error && <ErrorMessage text={error} />}<div className="question-pagination"><button className="button secondary" disabled={page === 0 || busy} onClick={() => { setPage(page - 1); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ArrowLeft size={16} /> 上一页</button><span>第 {page + 1} / {Math.ceil(questionnaire.questions.length / 5)} 页</span><button className="button primary" disabled={busy} onClick={submitPage}>{busy ? <Loader2 className="spin" size={17} /> : null}{(page + 1) * 5 >= questionnaire.questions.length ? '生成结果' : '继续下一页'}<ArrowRight size={16} /></button></div>
      </div> : <EmptyState icon="questions" title="准备好开始探索了吗？" text="先填写模型信息，再生成本次问卷。" button="设置一次测评" onClick={() => setup('manual')} />)}

      {view === 'agent' && <div className="content-page"><PageHeading eyebrow="BUILT FOR AGENTS, TOO" title={questionnaire?.kind === 'followup' ? '让 Agent，继续回答新情境。' : '让你的 Agent，回答它自己。'} description={questionnaire?.kind === 'followup' ? '复制本轮补测提示词，保持相同模型和配置，再带回包含原答案的 JSON。' : '获取公开题目，完成一次自述，再把 JSON 回答带回来。无需模型 API Key。'} onBack={() => navigate(questionnaire?.kind === 'followup' ? 'result' : 'home')} />
        <div className="agent-layout"><div className="agent-main">{questionnaire?.kind !== 'followup' && <div className="panel agent-start"><div className="card-label"><Terminal size={18} /> 一次完整的 Agent 测评</div><h2>一份提示词，就可以开始。</h2><p>填写模型信息后，我们会把所有题目、作答规则与输出模板整理为一段可直接使用的提示词。</p><button className="button primary" onClick={() => setup('agent')}>{questionnaire ? '重新配置任务' : '生成测评任务'}<ArrowRight size={17} /></button></div>}
        {questionnaire && <div className="panel task-ready"><div className="ready-title"><span className="check-bubble"><Check size={16} /></span><div><h3>{questionnaire.kind === 'followup' ? `第 ${questionnaire.round} 轮补测已准备好` : '任务已准备好'}</h3><p>{questionnaire.answerTemplate.metadata.model} · {questionnaire.questions.length} 题 · 种子 {questionnaire.seed}</p></div></div><div className="button-row"><button className="button primary" onClick={() => void copy(promptText())}><Copy size={16} /> 复制完整提示词</button><button className="button secondary" onClick={() => downloadJSON({ ...questionnaire, answerTemplate: agentTemplate() }, 'agent16-questionnaire.json')}><Download size={16} /> 下载题目</button><button className="button secondary" onClick={() => downloadJSON(agentTemplate(), 'agent16-answers-template.json')}><FileJson size={16} /> 回答模板</button></div><details className="prompt-preview"><summary>预览提示词 <ChevronDown size={15} /></summary><pre>{promptText()}</pre></details><div className="task-next"><span>拿到 Agent 的回答后</span><button className="text-link" onClick={() => navigate('import')}>导入 JSON 生成结果 <ArrowRight size={16} /></button></div></div>}
        <div className="panel developer-panel"><div className="card-label"><GitBranch size={18} /> 程序化访问</div><h2>静态文件，也对 Agent 友好。</h2><p>所有资源均为 GitHub Pages 静态文件。Agent 可读取题目并输出标准回答；评分可在网页内完成，也可下载 JavaScript 模块在本地运行。完整结果中的 followup.next 会直接提供下一轮补测题目；无需补测时为 null。</p><div className="resource-list">{[['Agent 使用说明', 'llms.txt'], ['完整题库 · 60 题', 'questions/full.json'], ['快速题库 · 20 题', 'questions/quick.json'], ['回答 JSON Schema', 'schemas/answers.schema.json'], ['本地评分模块', 'agent16.mjs']].map(([title, url]) => <a href={`./${url}`} key={url} target="_blank" rel="noreferrer"><span>{title}</span><code>{url}</code><ArrowUpRight size={15} /></a>)}</div><div className="code-block"><div><span>Node.js · 下载 agent16.mjs 后运行</span><button aria-label="复制本地评分代码" onClick={() => void copy("import { readFileSync } from 'node:fs';\nimport { scoreAssessment } from './agent16.mjs';\n\nconst answers = JSON.parse(readFileSync('answers.json', 'utf8'));\nconsole.log(JSON.stringify(scoreAssessment(answers), null, 2));")}><Copy size={15} /></button></div><pre>{`import { readFileSync } from 'node:fs';\nimport { scoreAssessment } from './agent16.mjs';\n\nconst answers = JSON.parse(\n  readFileSync('answers.json', 'utf8')\n);\nconsole.log(scoreAssessment(answers));`}</pre></div><button className="text-link" onClick={() => void copy(`请阅读 ${baseUrl}llms.txt，获取 ${baseUrl}questions/full.json 的问卷。根据你在当前系统指令和上下文中的实际回答倾向作答，不要扮演目标人格。返回符合 ${baseUrl}schemas/answers.schema.json 的 JSON，保留问卷的 instrument、version、mode、seed 并填写 metadata.model。所有题目必须保留，无法回答时 value 为 null。`)}><Copy size={15} /> 复制基于链接的 Agent 指令</button></div></div>
        <aside className="agent-sidebar"><h3>三个步骤，一张画像</h3>{[['01', '获取题目', '复制完整提示词，或让 Agent 读取静态题目 JSON。'], ['02', '如实作答', '按当前指令与上下文回答；不要指定目标人格类型。'], ['03', '带回结果', '导入回答 JSON，在浏览器中计算画像并保存记录。']].map(([num, title, text]) => <div className="agent-step" key={num}><span>{num}</span><div><h4>{title}</h4><p>{text}</p></div></div>)}<div className="sidebar-note"><HelpCircle size={20} /><h4>这次回答，属于这次上下文。</h4><p>想比较模型时，请使用相同题目种子、提示词与参数，并保存多个独立运行的结果。</p></div><a className="text-link" href="https://github.com/UyNewNas/LLM-16P" target="_blank" rel="noreferrer"><Github size={16} /> 查看开源项目 <ArrowUpRight size={14} /></a></aside></div>
      </div>}

      {view === 'import' && <div className="narrow-page"><PageHeading eyebrow="BRING YOUR ANSWERS" title="把回答变成一张画像" description="导入 Agent 的回答 JSON，或导入已导出的历史记录。全部评分在当前浏览器内完成。" onBack={() => navigate('home')} /><div className="panel import-panel"><div className="import-upload"><span className="method-icon apricot"><Upload size={25} strokeWidth={1.5} /></span><h3>选择回答文件</h3><p>支持 .json 文件，也可在下方直接粘贴</p><input ref={fileRef} className="visually-hidden" type="file" accept=".json,application/json,text/plain" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 2 * 1024 * 1024) { setError('文件过大，请选择小于 2 MB 的回答 JSON。'); return; } try { setImportText(await file.text()); setError(''); setToast(`已读取 ${file.name}`); } catch { setError('无法读取此文件，请重试或粘贴内容。'); } }} /><button className="button secondary" onClick={() => fileRef.current?.click()}><Upload size={16} /> 选择 JSON 文件</button></div><div className="or-divider"><span>或者，粘贴 JSON</span></div><label className="field">回答内容<textarea className="json-input" rows={11} spellCheck={false} value={importText} onChange={e => setImportText(e.target.value)} placeholder={'{\n  "instrument": "agent-mbti",\n  "version": "1.0.0",\n  "mode": "full",\n  "seed": "agent16-v1",\n  "metadata": { "model": "你的模型名称" },\n  "answers": [ { "id": "题目 ID", "value": 4 } ]\n}'} /><small>支持初测、补测回答，以及 Markdown 的 json 代码块。补测时请保留原始 answers 和已有 followups，仅填写本轮回答。</small></label>{error && <ErrorMessage text={error} />}<button className="button primary full-width" disabled={busy} onClick={importAnswers}>{busy ? <Loader2 className="spin" size={17} /> : <Sparkles size={17} />} 导入并生成画像 <ArrowRight size={17} /></button></div><p className="center-note">还没有标准回答？<button className="text-link" onClick={() => navigate('agent')}>先创建 Agent 测评任务 <ArrowRight size={14} /></button></p></div>}

      {view === 'result' && (result ? <div className="content-page result-page"><div className="result-page-top"><button className="text-link" onClick={() => navigate('history')}><ArrowLeft size={16} /> 测评记录</button><div className="button-row"><button className="button secondary compact" onClick={() => downloadJSON(followupState.normalized || result, `agent16-${result.displayType}-${result.id}.json`)}><Download size={15} /> 导出 JSON</button><button className="button secondary compact" onClick={() => setup('manual')}><Plus size={15} /> 新测评</button></div></div><section className="result-hero"><div><div className="eyebrow">YOUR AGENT SNAPSHOT · {result.complete ? '本次测评结果' : '未完整作答'}</div><h1>{result.displayType}</h1><h2>{result.metadata.model || '未注明模型'}</h2><p>{result.metadata.runLabel || '每次回答，都是理解协作方式的一条线索。'}</p><div className="result-tags"><span>{result.mode === 'full' ? '完整探索' : '快速一瞥'}</span>{!!result.followups?.length && <span>{result.complete ? `补测 ${result.followups.length} 轮` : `补测第 ${result.followups.length} 轮未完整`}</span>}<span>{result.answered} / {result.total} 题有效回答</span><span>{formatDate(result.createdAt)}</span></div></div><div className="result-art"><BotArt /><span>ONE RUN. ONE PERSPECTIVE.</span></div></section>
        <FollowupPanel next={followupState.next} summary={followupState.summary} axes={result.axes} roundsSubmitted={result.followups?.length || 0} error={followupState.error}
          onManual={() => beginFollowup('manual')} onAgent={() => beginFollowup('agent')}
          onCopy={() => { if (followupState.next) void copy(promptText(followupState.next)); }}
          onDownload={() => { if (followupState.next) downloadJSON(followupState.next, `agent16-followup-round-${followupState.next.round}.json`); }}
          onTemplate={() => { if (followupState.next) downloadJSON(followupState.next.answerTemplate, `agent16-followup-answers-round-${followupState.next.round}.json`); }}
          onOriginal={openOriginal} onResume={resumeIncomplete} onExport={() => downloadJSON(followupState.normalized || result, `agent16-${result.displayType}-${result.id}.json`)} />
        {error && <ErrorMessage text={error} />}
        <div className="result-layout"><section className="panel axes-panel"><div className="panel-heading"><h2>你的五维倾向</h2><span>倾向分数，非概率</span></div><p className="panel-description">字母是对本次回答的简写。接近中间的结果用 X 表示边界，回答不足时不作判断。</p>{result.axes.map((axis, index) => <div className="result-axis" key={axis.id} style={{ '--axis-color': dimensions[index]?.color || '#5b9b84' } as CSSProperties}><div className="axis-heading"><h3>{axis.title}</h3><span className={`axis-status ${axis.status}`}>{axis.status === 'clear' ? `${axis.letter} 倾向` : axis.status === 'borderline' ? 'X · 边界区间' : 'X · 回答不足'}</span></div><div className="axis-labels"><span><b>{axis.left}</b> {axis.leftLabel}<strong>{percent(axis.leftPercent)}</strong></span><span><strong>{percent(axis.rightPercent)}</strong>{axis.rightLabel} <b>{axis.right}</b></span></div><div className={`axis-bar ${axis.rightPercent === null ? 'no-data' : ''}`}><div className="axis-fill" style={{ width: `${axis.leftPercent ?? 50}%` }} /><span className="axis-middle" />{axis.leftPercent !== null && <i style={{ left: `${Math.min(98, Math.max(2, axis.leftPercent))}%` }} />}</div><div className="axis-caption">{axis.answered} / {axis.total} 题有效回答{index === 4 && ' · A/T 为实验性表达取向'}</div></div>)}</section>
        <aside className="result-sidebar"><section className="panel quality-panel"><div className="card-label"><ShieldCheck size={18} /> 回答质量提示</div><div className="quality-metrics"><div><strong>{result.quality.neutralCount}</strong><span>中立回答</span></div><div><strong>{result.quality.skippedCount + result.quality.missingCount}</strong><span>跳过或缺失</span></div></div>{result.quality.warnings.length ? <ul className="quality-warnings">{result.quality.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul> : <p>本次未触发预设的回答质量提示。这不代表测评经过心理学效度验证。</p>}{result.quality.pairsCompared > 0 && <p className="muted-small">反向题对一致性：{result.quality.pairConsistency === null ? '—' : `${result.quality.pairConsistency}/100`} · {result.quality.pairsCompared} 对可比较</p>}</section><section className="panel metadata-panel"><h3>这次运行的条件</h3><dl>{[['模型', result.metadata.model || '未注明模型'], ['提供方', result.metadata.provider || '未记录'], ['Temperature', result.metadata.temperature ?? '未记录'], ['题目种子', result.seed], ['题库版本', result.version]].map(([label, value]) => <div key={String(label)}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{result.metadata.systemPrompt && <details><summary>查看上下文记录 <ChevronDown size={14} /></summary><p className="preserve-lines">{result.metadata.systemPrompt}</p></details>}</section><button className="compare-cta" onClick={() => navigate('history')}><History size={20} /><div><strong>把这次结果放进时间里</strong><span>查看历史，比较不同运行</span></div><ArrowRight size={18} /></button></aside></div><div className="result-disclaimer"><HelpCircle size={18} /><p>{result.disclaimer || '这份结果仅描述模型在特定条件下的自述倾向，不代表人类人格、意识、能力水平或长期稳定特质。'} 单次运行不能说明稳定性；比较时请保持题目与运行条件一致。</p></div>
      </div> : <EmptyState icon="questions" title="这里还没有测评结果" text="完成问卷，或导入一份标准回答 JSON，即可生成画像。" button="开始一次测评" onClick={() => setup('manual')} />)}

      {view === 'history' && <div className="content-page"><PageHeading eyebrow="YOUR EXPLORATION NOTEBOOK" title="每一次回答，都有迹可循。" description="保存在当前浏览器的最近 30 次已保存测评。勾选 2–4 份结果，观察它们的差异。" onBack={() => navigate('home')} />{history.length ? <><div className="history-toolbar"><span>{history.length} 份记录 · 已选 {selected.length} 份</span><button className="button secondary compact" onClick={() => downloadJSON(history, 'agent16-history.json')}><Download size={15} /> 导出全部</button></div><div className="history-list">{history.map(item => <article className="history-row" key={item.id}><label className="compare-check"><input type="checkbox" checked={selected.includes(item.id)} aria-label={`比较 ${item.metadata.model || '未注明模型'} ${formatDate(item.createdAt)}`} onChange={e => { if (e.target.checked && selected.length >= 4) { setToast('一次最多比较 4 份结果。'); return; } setSelected(e.target.checked ? [...selected, item.id] : selected.filter(id => id !== item.id)); }} /><span /></label><button className="history-open" onClick={() => { setResult(item); navigate('result'); }}><span className="history-type">{item.displayType}</span><span className="history-model"><strong>{item.metadata.model || '未注明模型'}</strong><small>{item.metadata.runLabel || (item.mode === 'full' ? '完整探索' : '快速一瞥')}{!!item.followups?.length && ` · ${item.complete ? `补测 ${item.followups.length} 轮` : `补测第 ${item.followups.length} 轮未完整`}`} · {item.answered}/{item.total} 题</small></span><span className="history-date">{formatDate(item.createdAt)}</span><ChevronRight size={17} /></button><button className="delete-button" aria-label={`删除 ${item.metadata.model || '未注明模型'} 记录`} onClick={() => { persist(history.filter(r => r.id !== item.id)); setSelected(selected.filter(id => id !== item.id)); }}><Trash2 size={16} /></button></article>)}</div>{comparison.length >= 2 ? <section className="panel comparison-panel"><div className="panel-heading"><h2>让差异具体一点</h2><span>{comparison.length} 次运行</span></div><p className="panel-description">下表为各维度右侧倾向分数。括号内是与第一份结果相比的百分点变化。</p><div className="table-scroll"><table className="comparison-table"><thead><tr><th>维度 / 右侧倾向</th>{comparison.map((r, i) => <th key={r.id}><strong>{r.metadata.model || '未注明模型'}</strong><small>{r.displayType}{!!r.followups?.length && ` · ${r.complete ? `补测 ${r.followups.length} 轮` : `补测第 ${r.followups.length} 轮未完整`}`} · {i === 0 ? '基准' : formatDate(r.createdAt)}</small></th>)}</tr></thead><tbody>{comparison[0].axes.map((a, index) => <tr key={a.id}><th>{a.title}<small>{a.right} · {a.rightLabel}</small></th>{comparison.map((r, col) => { const current = r.axes.find(axis => axis.id === a.id)?.rightPercent; const delta = typeof current === 'number' && typeof a.rightPercent === 'number' ? current - a.rightPercent : null; return <td key={r.id}><strong style={{ color: dimensions[index]?.color }}>{percent(current)}</strong>{col > 0 && delta !== null && <small>{delta > 0 ? '+' : ''}{Math.round(delta)} 个百分点</small>}</td>; })}</tr>)}</tbody></table></div><div className="inline-note"><HelpCircle size={17} /><span>请在相同题目版本、模式、种子、提示词与参数下重复运行，才适合观察稳定性。不同设置下的差异不能直接归因于模型本身。补测后的题量和题目集合不同，与未补测结果的变化仅作描述性观察。</span></div></section> : <div className="comparison-hint"><Layers3 size={18} /> 勾选至少两份记录，在这里查看五维对比。</div>}<p className="center-note">清除浏览器数据会移除记录，建议定期导出。</p></> : <EmptyState icon="history" title="你的探索记录，从这里开始。" text="完成一次测评后，结果会自动出现在这里。首页的示意画像不会存入记录。" button="开始第一次测评" onClick={() => setup('manual')} />}</div>}

      {view === 'about' && <div className="about-page"><PageHeading eyebrow="A NOTE ON THE EXPERIMENT" title="理解倾向，也理解边界。" description="Agent16 是一个面向大语言模型的 MBTI 风格实验工具。我们更关心回答的方式，而不是给模型贴一个永久的标签。" onBack={() => navigate('home')} /><div className="about-lead"><span className="about-asterisk" aria-hidden="true">✳</span><h2>我们测量的，是一次回答中的选择。</h2><p>同一个模型，在不同系统提示词、上下文、采样参数与题目顺序下，可能给出不同回答。结果可以帮助你提出更好的协作问题，也可以作为受控重复实验的起点。</p></div><div className="about-grid"><section className="panel"><span className="section-index">01 / THE FRAMEWORK</span><h2>五维框架，原创情境。</h2><p>题目围绕交互、信息、决策、工作与表达取向展开，使用 7 点作答量表。前四维采用 MBTI 风格字母，A/T 作为额外的实验性表达取向，表示果断与审慎；它与 T/F 中的逻辑 / 影响取向不同。</p><p>该设计参考 <a href="https://www.16personalities.com/articles/our-theory" target="_blank" rel="noreferrer">16Personalities 的类型框架 <ArrowUpRight size={13} /></a>。本站与 MBTI、The Myers-Briggs Company 及 16Personalities 均无隶属、授权或背书关系，题目为本项目原创。</p></section><section className="panel"><span className="section-index">02 / READ WITH CARE</span><h2>分数是倾向，不是概率。</h2><p>百分比用于展示本次回答在两个方向上的相对倾向，不是置信度、概率或人群百分位。靠近中间的维度用 X 标注边界；有效回答不足的维度不会强行分类。</p><p>完整作答后，X 维度会自动获得针对性新题，每维度每轮 4 题，最多 2 轮。补测与原答案等权合并；若仍处于中间区间，继续保留 X。这是一项探索性扩展，不代表精度或效度得到验证。</p><p>本工具未对人类人格或 AI 人格进行心理测量学效度验证。结果不代表意识、情绪、能力、安全性，也不适合用于人员筛选或重大决策。</p></section><section className="panel"><span className="section-index">03 / REPEAT THOUGHTFULLY</span><h2>比较，需要相同的条件。</h2><p>完整问卷包含 60 题，快速问卷包含 20 题。固定模式、版本、种子、系统提示词与参数，多次独立作答，才能讨论结果是否稳定。</p><p>中立、缺失、连续同选及反向题对一致性等质量提示，仅帮助发现需要复查的回答模式，不构成测评可靠性的保证。</p></section><section className="panel"><span className="section-index">04 / YOUR DATA</span><h2>在你的浏览器里，完成探索。</h2><p>网页不请求模型提供方的 API。问卷评分在浏览器本地运行，最近 30 次结果保存在当前浏览器的本地存储中，并可随时导出为 JSON。</p><p>静态站点不提供评分 POST 接口或 MCP 服务。开发者可获取公开题目与评分模块，在自己的运行环境中组织实验。</p><a className="text-link" href="https://github.com/UyNewNas/LLM-16P" target="_blank" rel="noreferrer"><Github size={16} /> 查看源码与方法 <ArrowUpRight size={14} /></a></section></div><div className="about-end"><h2>带着好奇开始，带着上下文理解。</h2><button className="button primary" onClick={() => setup('manual')}>开始探索 <ArrowRight size={17} /></button></div></div>}
    </main>
    <footer className="site-footer"><div><a className="brand-link" href="#" onClick={() => navigate('home')}><Logo small /></a><span>理解回答，探索协作。</span></div><p>原创情境 · MBTI 风格实验 · 非人格诊断</p><a href="https://github.com/UyNewNas/LLM-16P" target="_blank" rel="noreferrer">Made for curious minds <ArrowUpRight size={13} /></a></footer>
    {toast && <div className="toast" role="status"><Check size={17} /><span>{toast}</span><button aria-label="关闭提示" onClick={() => setToast('')}><X size={15} /></button></div>}
    {fallbackCopy && <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setFallbackCopy(''); }}><section className="copy-modal" role="dialog" aria-modal="true" aria-labelledby="copy-title"><button className="modal-close" aria-label="关闭复制窗口" onClick={() => setFallbackCopy('')}><X size={20} /></button><h2 id="copy-title">请手动复制以下内容</h2><p>浏览器暂未允许自动复制。内容已选中，使用 Ctrl/Cmd + C 即可复制。</p><textarea ref={fallbackRef} value={fallbackCopy} readOnly rows={10} /><button className="button primary" onClick={() => setFallbackCopy('')}>完成</button></section></div>}
  </div>;
}

function PageHeading({ eyebrow, title, description, onBack }: { eyebrow: string; title: string; description: string; onBack: () => void }) {
  return <div className="page-heading"><button className="back-link" aria-label="返回" onClick={onBack}><ArrowLeft size={18} /></button><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>;
}
function ErrorMessage({ text }: { text: string }) { return <div className="error-message" role="alert"><HelpCircle size={17} /><span>{text}</span></div>; }
function EmptyState({ icon, title, text, button, onClick }: { icon: 'history' | 'questions'; title: string; text: string; button: string; onClick: () => void }) { return <div className="empty-state"><span className="empty-icon">{icon === 'history' ? <History size={31} strokeWidth={1.4} /> : <Fingerprint size={33} strokeWidth={1.4} />}</span><h2>{title}</h2><p>{text}</p><button className="button primary" onClick={onClick}>{button}<ArrowRight size={16} /></button></div>; }
