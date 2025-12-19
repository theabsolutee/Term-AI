
export interface Definition {
  term: string;
  definition: string;
  context?: string;
}

export type Theme = 'light' | 'dark';

export interface AnalysisResult {
  title: string;
  definitions: Definition[];
  summary: string;
}
