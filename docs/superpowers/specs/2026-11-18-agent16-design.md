# Agent16 design

> Historical design. The X threshold and incomplete-result markers below were superseded by the exact-50% rule in scoring 1.2.0; see `docs/superpowers/plans/2026-11-18-exact50-plan.md`. Legacy follow-up validation remains versioned.

Build a Chinese-language, original LLM response-style questionnaire inspired by the five-spectrum presentation of 16Personalities. The user selected the empty public repository UyNewNas/LLM-16P and GitHub Pages, superseding the initial hosted-service approach.

## Product
- 60 original items, 12 per EI/SN/TF/JP/AT; balanced direction; a distinct balanced 20-item quick form.
- Seven-point self-report, null for unavailable/unjudgeable, strict input validation. No requests for hidden chain of thought.
- Website: overview, assessment, JSON import/export, agent instructions, local history and comparison, methodology.
- Agent artifacts: llms.txt, full/quick JSON questionnaires without scoring-key fields, answer JSON Schema, zero-dependency downloadable JS scoring module and CLI.
- Result unit: this model/configuration/run; five signed tendency scores, four-letter descriptive code with X for uncertain, experimental A/T expression preference, completeness and response-pattern diagnostics.
- Native browser calculations; no remote model API, backend, accounts, secrets or server-side result collection. The public score key is inspectable, not a security boundary.

## Scoring
Direction +1 favors right pole; z=direction*(response-4); mean signed z/3 gives score in [-100,100]. Right tendency=50+score/2. Scores are normalized questionnaire summaries, not probability or population percentiles. Absolute score <=20 returns X (40–60 deadband), an unvalidated product rule. Full axis coverage requires >=10 valid answers with >=4 each direction; quick requires 4. Missing and null distinct; insufficient axis scores null. Final type withheld until every question has a numeric answer; provisional axes may be shown clearly. Paired response agreement is descriptive and is never a validity claim.

## Approaches
Static GitHub Pages selected by user. A hosted API/MCP service was initially considered; it is unnecessary for the chosen hosting. Static ESM supports Node and browser agents with identical deterministic scoring. Stateless rendering needs no external dependencies at runtime.

## Interface
getQuestionnaire({mode:'full'|'quick',seed:string}) returns versioned questions and answerTemplate. scoreAssessment(payload) accepts the template with answer values, rejects malformed data, returns axes, quality warnings, metadata, and original answers for reproducibility. /questions/ artifacts use seed 'agent16-v1'. UI invokes the same module locally.

## Limits
Original exploratory instrument, no psychometric validation; not MBTI/NERIS endorsed. Model self-report can be prompt-, item-order-, context- and sampling-dependent. A/T expression is distinct from actual repeated-run stability. Quick/full not claimed equivalent. Real results are never fabricated for examples.
