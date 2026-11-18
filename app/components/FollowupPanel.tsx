import { ArrowRight, Check, ChevronDown, Copy, Download, FileJson, HelpCircle, Plus, Sparkles, Terminal } from 'lucide-react';

type Axis = { id: string; title: string; left: string; right: string; rightPercent: number | null; letter: string; status: string };
type NextQuestionnaire = { round?: number; maxRounds?: number; targetAxes?: string[]; questions: { id: string; text: string }[] };
type Summary = {
  roundsCompleted: number; maxRounds: number; status: 'available' | 'resolved' | 'limit' | 'incomplete'; targetAxes: string[];
  baseline: { displayType: string; axes: Axis[]; answered: number; total: number };
};
type Props = {
  next: NextQuestionnaire | null; summary?: Summary; axes: Axis[]; roundsSubmitted: number; error: string;
  onManual: () => void; onAgent: () => void; onCopy: () => void; onDownload: () => void;
  onTemplate: () => void; onOriginal: () => void; onResume: () => void; onExport: () => void;
};
const pct = (value: number | null) => value === null ? '—' : `${Number(value.toFixed(2))}%`;

export default function FollowupPanel({ next, summary, axes, roundsSubmitted, error, onManual, onAgent, onCopy, onDownload, onTemplate, onOriginal, onResume, onExport }: Props) {
  const targets = axes.filter(axis => next?.targetAxes?.includes(axis.id));
  const hasFollowup = roundsSubmitted > 0;
  const changedAxes = hasFollowup ? axes.filter(axis => {
    const base = summary?.baseline.axes.find(item => item.id === axis.id);
    return base && (base.rightPercent !== axis.rightPercent || base.letter !== axis.letter);
  }) : [];

  return <section className={`panel followup-panel ${next ? 'followup-available' : 'followup-finished'}`} aria-labelledby="followup-title">
    <div className="followup-heading">
      <span className="followup-icon">{next ? <Sparkles size={22} strokeWidth={1.6} /> : summary?.status === 'resolved' ? <Check size={22} /> : <HelpCircle size={22} strokeWidth={1.6} />}</span>
      <div>
        <div className="eyebrow">A FEW MORE QUESTIONS · 针对性补测</div>
        <h2 id="followup-title">{next ? '再问几题，让 X 更具体。' : error ? '暂时无法生成补测题目' : summary?.status === 'limit' ? '两轮之后，X 也可以是答案。' : summary?.status === 'incomplete' ? '先补齐回答，再继续探索。' : '每个维度已有明确倾向。'}</h2>
      </div>
      {next && <span className="followup-round">第 {next.round} / {next.maxRounds || 2} 轮</span>}
    </div>

    {hasFollowup && summary && <div className="followup-baseline">
      <div><span>原始画像</span><strong>{summary.baseline.displayType}</strong><ArrowRight size={15} /><span>{summary.status === 'incomplete' ? `第 ${roundsSubmitted} 轮未完整` : `累计补测 ${roundsSubmitted} 轮`}</span><button className="text-link" onClick={onOriginal}>查看原始记录 <ArrowRight size={13} /></button></div>
      {changedAxes.length ? <p>{changedAxes.map(axis => {
        const base = summary.baseline.axes.find(item => item.id === axis.id)!;
        return `${axis.left}/${axis.right}：${pct(base.rightPercent)} → ${pct(axis.rightPercent)} ${axis.right}`;
      }).join('　·　')}<small>右侧倾向分数；原题与补测题等权合并。</small></p> : <p>本轮未改变各维度的倾向分数。原始答案仍完整保留。</p>}
    </div>}

    {next ? <>
      <p className="followup-description">已为仍处于中间区间的维度生成 <strong>{next.questions.length} 道新题</strong>。每个维度 4 题，只补充尚未分明的部分。</p>
      <div className="followup-targets" aria-label="本轮补测维度">{targets.map(axis => <span key={axis.id}><b>{axis.left} / {axis.right}</b>{axis.title}<small>X</small></span>)}</div>
      <div className="followup-actions">
        <button className="button primary" onClick={onManual}>开始第 {next.round} 轮补测 <ArrowRight size={16} /></button>
        <button className="button secondary" onClick={onCopy}><Copy size={16} /> 复制补测提示词</button>
        <button className="text-link" onClick={onAgent}><Terminal size={15} /> 交给 Agent 回答 <ArrowRight size={14} /></button>
      </div>
      <details className="followup-questions" open>
        <summary><Plus size={15} /><span>本轮 {next.questions.length} 道追加情境题</span><ChevronDown size={16} /></summary>
        <ol>{next.questions.map(question => <li key={question.id}><span>{question.text}</span><code>{question.id}</code></li>)}</ol>
      </details>
      <div className="followup-downloads"><button className="text-link" onClick={onDownload}><Download size={14} /> 下载补测题目 JSON</button><button className="text-link" onClick={onTemplate}><FileJson size={14} /> 下载回答模板</button></div>
      <p className="followup-limit">最多追加 2 轮。保持相同模型和运行条件；补测后仍在 40–60 中间区间，就保留 X。追加题目用于进一步观察，不保证得到确定字母。</p>
    </> : <div className="followup-stop">
      {error ? <p>这份记录的原始回答无法通过校验：{error}。可以导出 JSON 检查，或重新导入包含原始 answers 的完整结果。</p>
        : summary?.status === 'incomplete' ? <><p>{hasFollowup ? '本轮补测还有跳过或缺失的回答。补齐当前轮次后，才能生成下一轮题目；原始测评记录仍保留。' : 'X 可能来自跳过或缺失，不能直接作为加题依据。请先补齐原问卷，再判断哪些维度需要补测。'}</p><p>可以返回当前问卷继续填写，已有回答会保留。也可导出 JSON 补齐后重新导入；无法判断时，保留跳过和当前结果即可。</p></>
        : summary?.status === 'limit' ? <p>已达到两轮补测上限。仍为 X 的维度表示本次回答暂未呈现明显倾向，结果会如实保留，不再为了得到某个字母继续加题。</p>
        : <p>{hasFollowup ? '补测后所有维度均已离开中间区间，本次无需继续加题。' : '当前没有落在 40–60 中间区间的维度，无需追加题目。'}这仍是本次上下文中的回答快照。</p>}
      {!error && summary?.status === 'incomplete' && <button className="button secondary compact" onClick={onResume}>补齐当前问卷 <ArrowRight size={14} /></button>}
      {(error || summary?.status === 'incomplete') && <button className="text-link" onClick={onExport}><Download size={14} /> 导出当前回答</button>}
    </div>}
  </section>;
}
