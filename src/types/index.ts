// ==========================================
// Election Voting Simulator — Type Definitions
// ==========================================

export interface Candidate {
  id: string;
  name: string;
}

export interface Ballot {
  voterId: number;
  ranking: string[]; // Array of candidate IDs ordered by preference (index 0 = most preferred)
}

export interface Election {
  voterCount: number;
  candidates: Candidate[];
  ballots: Ballot[];
}

export type VotingMethod = 'plurality' | 'borda' | 'irv' | 'condorcet';

export type DataEntryMode = 'manual' | 'auto' | 'demo';

export type AutoGenerateMode = 'uniform' | 'realistic' | 'custom';

// ==========================================
// Preset Case Type — สำหรับชุดข้อมูลตัวอย่างการสาธิต
// ==========================================

export interface PresetCase {
  id: string;
  name: string;
  description: string;
  highlightText: string;       // สรุปว่ากรณีนี้แสดงอะไร
  voterCount: number;
  candidates: Candidate[];
  ballots: Ballot[];
}

// ==========================================
// Algorithm Result Types
// ==========================================

export interface PluralityResult {
  method: 'plurality';
  scores: Record<string, number>;
  winner: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  totalVotes: number;
}

export interface BordaResult {
  method: 'borda';
  scores: Record<string, number>;
  rankDistribution: Record<string, number[]>; // candidateId -> [count at rank 1, count at rank 2, ...]
  winner: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  totalPoints: number;
}

export interface IRVRound {
  roundNumber: number;
  votes: Record<string, number>;
  eliminated: string | null;
  isTie: boolean;
  tiedCandidates: string[];
}

export interface IRVResult {
  method: 'irv';
  rounds: IRVRound[];
  winner: string | null;
  winningRound: number;
  isTie: boolean;
  tiedCandidates: string[];
}

export interface PairwiseMatrix {
  [candidateA: string]: {
    [candidateB: string]: number;
  };
}

export interface CondorcetResult {
  method: 'condorcet';
  pairwiseMatrix: PairwiseMatrix;
  condorcetWinner: string | null;
  copelandScores: Record<string, number>;
  copelandWinner: string | null;
  winner: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  pairwiseResults: PairwiseComparison[];
}

export interface PairwiseComparison {
  candidateA: string;
  candidateB: string;
  votesA: number;
  votesB: number;
  winner: string | null;
}

export interface CopelandResult {
  scores: Record<string, number>;
  winner: string | null;
  isTie: boolean;
  tiedCandidates: string[];
}

// ==========================================
// UI State Types
// ==========================================

export interface SetupFormState {
  voterCount: number;
  candidateCount: number;
  candidateNames: string[];
  dataEntryMode: DataEntryMode;
  autoGenerateMode: AutoGenerateMode;
}
