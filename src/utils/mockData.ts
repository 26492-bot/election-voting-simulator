// ==========================================
// Mock Data for Dashboard UI Development
// Will be replaced with real algorithm results later
// ==========================================

import type { VotingMethod } from '../types';

export const MOCK_CANDIDATES = [
  { id: 'A', name: 'Candidate A' },
  { id: 'B', name: 'Candidate B' },
  { id: 'C', name: 'Candidate C' },
  { id: 'D', name: 'Candidate D' },
  { id: 'E', name: 'Candidate E' },
];

export const MOCK_STATS = {
  voterCount: 100,
  candidateCount: 5,
  ballotCount: 100,
  turnout: 100,
};

// ---- Plurality Mock Data ----
export const MOCK_PLURALITY = {
  scores: [
    { id: 'A', name: 'Candidate A', votes: 35, percent: 35 },
    { id: 'B', name: 'Candidate B', votes: 25, percent: 25 },
    { id: 'C', name: 'Candidate C', votes: 20, percent: 20 },
    { id: 'D', name: 'Candidate D', votes: 12, percent: 12 },
    { id: 'E', name: 'Candidate E', votes: 8, percent: 8 },
  ],
  winner: 'Candidate A',
};

// ---- Borda Count Mock Data ----
export const MOCK_BORDA = {
  scores: [
    { id: 'A', name: 'Candidate A', score: 310 },
    { id: 'B', name: 'Candidate B', score: 275 },
    { id: 'C', name: 'Candidate C', score: 320 },
    { id: 'D', name: 'Candidate D', score: 198 },
    { id: 'E', name: 'Candidate E', score: 147 },
  ],
  distribution: [
    { name: 'Candidate A', rank1: 35, rank2: 20, rank3: 18, rank4: 15, rank5: 12 },
    { name: 'Candidate B', rank1: 25, rank2: 22, rank3: 20, rank4: 18, rank5: 15 },
    { name: 'Candidate C', rank1: 20, rank2: 30, rank3: 25, rank4: 15, rank5: 10 },
    { name: 'Candidate D', rank1: 12, rank2: 18, rank3: 20, rank4: 28, rank5: 22 },
    { name: 'Candidate E', rank1: 8, rank2: 10, rank3: 17, rank4: 24, rank5: 41 },
  ],
  winner: 'Candidate C',
};

// ---- IRV Mock Data ----
export const MOCK_IRV = {
  rounds: [
    {
      round: 1,
      data: [
        { id: 'A', name: 'Candidate A', votes: 35 },
        { id: 'B', name: 'Candidate B', votes: 25 },
        { id: 'C', name: 'Candidate C', votes: 20 },
        { id: 'D', name: 'Candidate D', votes: 12 },
        { id: 'E', name: 'Candidate E', votes: 8 },
      ],
      eliminated: 'Candidate E',
    },
    {
      round: 2,
      data: [
        { id: 'A', name: 'Candidate A', votes: 38 },
        { id: 'B', name: 'Candidate B', votes: 27 },
        { id: 'C', name: 'Candidate C', votes: 23 },
        { id: 'D', name: 'Candidate D', votes: 12 },
      ],
      eliminated: 'Candidate D',
    },
    {
      round: 3,
      data: [
        { id: 'A', name: 'Candidate A', votes: 42 },
        { id: 'B', name: 'Candidate B', votes: 30 },
        { id: 'C', name: 'Candidate C', votes: 28 },
      ],
      eliminated: 'Candidate C',
    },
    {
      round: 4,
      data: [
        { id: 'A', name: 'Candidate A', votes: 55 },
        { id: 'B', name: 'Candidate B', votes: 45 },
      ],
      eliminated: null,
    },
  ],
  lineData: [
    { round: 'Round 1', A: 35, B: 25, C: 20, D: 12, E: 8 },
    { round: 'Round 2', A: 38, B: 27, C: 23, D: 12 },
    { round: 'Round 3', A: 42, B: 30, C: 28 },
    { round: 'Round 4', A: 55, B: 45 },
  ],
  winner: 'Candidate A',
  winningRound: 4,
};

// ---- Condorcet Mock Data ----
export const MOCK_CONDORCET = {
  matrix: [
    { name: 'A', A: '-', B: '58', C: '45', D: '62', E: '70' },
    { name: 'B', A: '42', B: '-', C: '48', D: '55', E: '65' },
    { name: 'C', A: '55', B: '52', C: '-', D: '60', E: '68' },
    { name: 'D', A: '38', B: '45', C: '40', D: '-', E: '58' },
    { name: 'E', A: '30', B: '35', C: '32', D: '42', E: '-' },
  ],
  pairwise: [
    { a: 'A', b: 'B', winsA: 58, winsB: 42, winner: 'A' },
    { a: 'A', b: 'C', winsA: 45, winsB: 55, winner: 'C' },
    { a: 'A', b: 'D', winsA: 62, winsB: 38, winner: 'A' },
    { a: 'A', b: 'E', winsA: 70, winsB: 30, winner: 'A' },
    { a: 'B', b: 'C', winsA: 48, winsB: 52, winner: 'C' },
    { a: 'B', b: 'D', winsA: 55, winsB: 45, winner: 'B' },
    { a: 'B', b: 'E', winsA: 65, winsB: 35, winner: 'B' },
    { a: 'C', b: 'D', winsA: 60, winsB: 40, winner: 'C' },
    { a: 'C', b: 'E', winsA: 68, winsB: 32, winner: 'C' },
    { a: 'D', b: 'E', winsA: 58, winsB: 42, winner: 'D' },
  ],
  copelandScores: [
    { id: 'A', name: 'Candidate A', score: 2 },
    { id: 'B', name: 'Candidate B', score: 0 },
    { id: 'C', name: 'Candidate C', score: 4 },
    { id: 'D', name: 'Candidate D', score: -2 },
    { id: 'E', name: 'Candidate E', score: -4 },
  ],
  condorcetWinner: null as string | null,
  copelandWinner: 'Candidate C',
  winner: 'Candidate C',
};

// ---- Rankings per Method (Mock) ----
export interface MockRankEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  label: string;
}

export function getMockRanking(method: VotingMethod): MockRankEntry[] {
  switch (method) {
    case 'plurality':
      return MOCK_PLURALITY.scores
        .sort((a, b) => b.votes - a.votes)
        .map((c, i) => ({
          rank: i + 1,
          id: c.id,
          name: c.name,
          score: c.votes,
          label: `${c.votes} votes (${c.percent}%)`,
        }));
    case 'borda':
      return [...MOCK_BORDA.scores]
        .sort((a, b) => b.score - a.score)
        .map((c, i) => ({
          rank: i + 1,
          id: c.id,
          name: c.name,
          score: c.score,
          label: `Borda Score: ${c.score}`,
        }));
    case 'irv': {
      const finalRound = MOCK_IRV.rounds[MOCK_IRV.rounds.length - 1];
      return finalRound.data
        .sort((a, b) => b.votes - a.votes)
        .map((c, i) => ({
          rank: i + 1,
          id: c.id,
          name: c.name,
          score: c.votes,
          label: `Final: ${c.votes} votes`,
        }));
    }
    case 'condorcet':
      return [...MOCK_CONDORCET.copelandScores]
        .sort((a, b) => b.score - a.score)
        .map((c, i) => ({
          rank: i + 1,
          id: c.id,
          name: c.name,
          score: c.score,
          label: `Copeland: ${c.score > 0 ? '+' : ''}${c.score}`,
        }));
  }
}

export function getMockWinner(method: VotingMethod): string {
  switch (method) {
    case 'plurality': return MOCK_PLURALITY.winner;
    case 'borda': return MOCK_BORDA.winner;
    case 'irv': return MOCK_IRV.winner;
    case 'condorcet': return MOCK_CONDORCET.winner;
  }
}

export function getScoreLabel(method: VotingMethod): string {
  switch (method) {
    case 'plurality': return 'First Preference Votes';
    case 'borda': return 'Borda Score';
    case 'irv': return 'Final Round Votes';
    case 'condorcet': return 'Copeland Score';
  }
}
