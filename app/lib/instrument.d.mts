export type Mode = 'full' | 'quick';
export interface Metadata {
  model?: string; provider?: string; modelVersion?: string;
  temperature?: number | null; topP?: number | null;
  systemPrompt?: string; runLabel?: string; administration?: string;
  contextNotes?: string; promptVersion?: string; language?: string; answerSource?: string;
}
export interface Answer { id: string; value: number | null; }
export interface AssessmentInput {
 instrument: string; version: string; mode: Mode; seed: string;
 metadata?: Metadata; answers: Answer[];
}
export interface Questionnaire {
 instrument: string; version: string; scoringVersion: string; mode: Mode; seed: string;
 language: string; instructions: string; scale: {value: number; label: string}[];
 questions: {id: string; text: string}[]; answerTemplate: AssessmentInput;
}
export interface AxisResult {
 id: 'EI'|'SN'|'TF'|'JP'|'AT'; left: string; right: string; title: string;
 leftLabel: string; rightLabel: string; description: string; color: string;
 score: number | null; leftPercent: number | null; rightPercent: number | null;
 letter: string; status: 'clear'|'borderline'|'insufficient'; answered: number; total: number;
}
export interface AssessmentResult extends AssessmentInput {
 id: string; createdAt: string; scoringVersion: string; metadata: Metadata;
 answered: number; total: number; complete: boolean; type: string; identity: string;
 displayType: string; provisionalType: string; axes: AxisResult[];
 quality: {neutralCount: number; skippedCount: number; missingCount: number; straightLining: boolean;
 pairConsistency: number|null; pairsCompared: number; warnings: string[]}; disclaimer: string;
}
export const INSTRUMENT: string;
export const VERSION: string;
export const SCORING_VERSION: string;
export const DEFAULT_SEED: string;
export const DISCLAIMER: string;
export const INSTRUCTIONS: string;
export const SCALE: {value:number;label:string}[];
export class AssessmentError extends Error { code: string; }
export function getQuestionnaire(options?: {mode?: Mode; seed?: string}): Questionnaire;
export function scoreAssessment(payload: unknown): AssessmentResult;
export function getMethodology(): Record<string, unknown>;
