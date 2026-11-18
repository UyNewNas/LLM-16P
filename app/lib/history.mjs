import {scoreAssessment,AssessmentError} from './instrument.mjs';

/** Restore exported runs atomically, recomputing their scores without inventing a new test date. */
export function restoreHistory(entries) {
  if(!Array.isArray(entries)||entries.length>300) throw new AssessmentError('历史记录必须为最多 300 项的 JSON 数组。');
  const restored=entries.map((entry,index)=>{
    try {
      if(!entry||typeof entry!=='object'||typeof entry.id!=='string'||!entry.id.length||entry.id.length>200) throw new AssessmentError('历史记录缺少有效运行 ID。');
      if(typeof entry.createdAt!=='string'||!Number.isFinite(Date.parse(entry.createdAt))) throw new AssessmentError('历史记录缺少有效时间。');
      const result=scoreAssessment(entry);
      return {...result,id:entry.id,createdAt:new Date(entry.createdAt).toISOString()};
    } catch(error) {throw new AssessmentError(`历史记录第 ${index+1} 条：${error.message}`);}
  });
  return [...new Map(restored.map(r=>[r.id,r])).values()].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
}
