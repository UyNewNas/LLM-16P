# Targeted follow-up for X dimensions

The result page and machine-readable result should offer fresh questions for dimensions in the inclusive 40–60 middle interval. This is a bounded exploratory extension, not a validated adaptive test or a requirement to produce a definite type.

## Contract

- Keep the original 20/60-item instrument and version 1.0.0 unchanged; scoring version becomes 1.1.0.
- Add 40 original questions in a separately versioned follow-up bank. Five axes × two rounds × four questions, balanced two positive/two negative keys per axis per round. Each round has two opposite-key pairs.
- A complete base result can start follow-up. Each round targets exactly the axes still marked `borderline` after all preceding answers have been scored. Clear axes receive no items. Missing or skipped base answers are not a reason to generate follow-up questions.
- Maximum two rounds in total. A clear result stops early; a middle score after the second round remains X.
- `AssessmentInput.followups` is an optional array of `{version, round, axes, answers}`. Base `answers` and metadata stay intact. Follow-up answers are kept separately. Answers use the existing strict integer 1–7 or null rule.
- Score all accumulated items equally within each affected axis. No change to the 40–60 rule. Prior rounds must be complete before another round may be submitted. A partial round is a valid incomplete result, cannot advance, and preserves the original result separately in browser history.
- Validate every requested round and axis set from recomputed prior scores, never from client-supplied display letters. Reject reused/unknown/out-of-round IDs, duplicate axes/answers, changed round/version, and more than two rounds.
- `getFollowupQuestionnaire(payload)` returns a normal questionnaire with `kind: 'followup'`, round, targetAxes, and a cumulative answerTemplate, or null when no follow-up is available. Questionnaire items omit scoring keys. Source seed determines supplemental ordering.
- Every result has `followup` state with status (`available`, `resolved`, `limit`, or `incomplete`), completed rounds, remaining middle axes, baseline scores/type, and `next` questionnaire or null. `next` contains only input history, not recursively embedded results.
- Preserve original result ID/date as `origin` in the cumulative input when available; create a separate result ID/date on scoring. Export/reimport and history restoration must reproduce all cumulative scores.

## UI and Agent flow

Automatically show a follow-up card on the result page, including targeted dimensions, round/count, preview questions, manual entry, full Agent prompt, and JSON download. Reuse existing question and import flows with cumulative payload construction. Keep old local results compatible by recomputing follow-up availability from their raw answers. Show baseline versus current result and supplemental-round tags in history/comparison.

The static scorer, JSON schema, `llms.txt`, manifest and CLI document the same contract. CLI `score` includes next questions, and `followup result.json` emits only the next questionnaire (or null). No model API calls or backend.

## Verification

Behavior tests cover targeted generation, balanced fresh items, exact deterministic rounds, partial data, inclusive boundaries, unchanged clear axes, honest stopping, invalid requests, old inputs, history restoration, and parity with downloadable module/static resources. Run TypeScript/build integrity checks and browser manual/import flows before GitHub Pages publication.
