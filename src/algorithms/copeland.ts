// ==========================================
// Condorcet Method — Copeland's Rule Algorithm
// ==========================================

import type { Ballot, Candidate } from '../types';

export interface PairwiseResult {
  candidateA: string;
  candidateB: string;
  aVotes: number;
  bVotes: number;
  result: 'A_WIN' | 'B_WIN' | 'TIE';
}

export interface CopelandScore {
  id: string;
  name: string;
  wins: number;
  losses: number;
  ties: number;
  score: number;
  rank: number;
}

export interface CopelandOutput {
  method: 'copeland';
  pairwiseMatrix: Record<string, Record<string, number>>; // matrix[A][B] = voters preferring A over B
  pairwiseResults: PairwiseResult[];
  scores: CopelandScore[];
  status: 'winner' | 'tie' | 'no_data';
  winners: string[]; // List of winner IDs
  winnerNames: string[]; // List of winner names
  totalValidBallots: number;
  totalInvalidBallots: number;
  totalVoters: number;
  totalPairwiseMatches: number;
}

/**
 * Compute Condorcet Method (Copeland's Rule).
 */
export function computeCopeland(
  ballots: Ballot[],
  candidates: Candidate[],
  voterCount: number
): CopelandOutput {
  const N = candidates.length;
  const candidateIds = new Set(candidates.map((c) => c.id));
  const candidateMap = new Map(candidates.map((c) => [c.id, c.name]));

  // 1. Filter valid ballots
  const validBallots: Ballot[] = [];
  for (const ballot of ballots) {
    if (ballot.ranking.length !== N) continue;

    let isValid = true;
    for (const rank of ballot.ranking) {
      if (!candidateIds.has(rank)) {
        isValid = false;
        break;
      }
    }

    const uniqueRanks = new Set(ballot.ranking);
    if (uniqueRanks.size !== N) isValid = false;

    if (isValid) {
      validBallots.push(ballot);
    }
  }

  const totalInvalidBallots = ballots.length - validBallots.length;
  const totalPairwiseMatches = (N * (N - 1)) / 2;

  if (validBallots.length === 0 || N < 2) {
    return {
      method: 'copeland',
      pairwiseMatrix: {},
      pairwiseResults: [],
      scores: [],
      status: 'no_data',
      winners: [],
      winnerNames: [],
      totalValidBallots: 0,
      totalInvalidBallots,
      totalVoters: voterCount,
      totalPairwiseMatches,
    };
  }

  // 2. Initialize Pairwise Matrix
  const matrix: Record<string, Record<string, number>> = {};
  const winsCount: Record<string, number> = {};
  const lossesCount: Record<string, number> = {};
  const tiesCount: Record<string, number> = {};

  for (const c of candidates) {
    matrix[c.id] = {};
    winsCount[c.id] = 0;
    lossesCount[c.id] = 0;
    tiesCount[c.id] = 0;
    for (const other of candidates) {
      matrix[c.id][other.id] = 0;
    }
  }

  // 3. Count preferences
  for (const ballot of validBallots) {
    // ranking is ordered highest preference to lowest
    for (let i = 0; i < ballot.ranking.length; i++) {
      const higher = ballot.ranking[i];
      for (let j = i + 1; j < ballot.ranking.length; j++) {
        const lower = ballot.ranking[j];
        matrix[higher][lower]++;
      }
    }
  }

  // 4. Calculate Pairwise Results and Scores
  const pairwiseResults: PairwiseResult[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const idA = candidates[i].id;
    for (let j = i + 1; j < candidates.length; j++) {
      const idB = candidates[j].id;

      const aVotes = matrix[idA][idB];
      const bVotes = matrix[idB][idA];

      let result: 'A_WIN' | 'B_WIN' | 'TIE';

      if (aVotes > bVotes) {
        result = 'A_WIN';
        winsCount[idA]++;
        lossesCount[idB]++;
      } else if (bVotes > aVotes) {
        result = 'B_WIN';
        winsCount[idB]++;
        lossesCount[idA]++;
      } else {
        result = 'TIE';
        tiesCount[idA]++;
        tiesCount[idB]++;
      }

      pairwiseResults.push({
        candidateA: idA,
        candidateB: idB,
        aVotes,
        bVotes,
        result,
      });
    }
  }

  // 5. Aggregate Copeland Scores
  let scores: CopelandScore[] = candidates.map((c) => {
    const wins = winsCount[c.id];
    const losses = lossesCount[c.id];
    const ties = tiesCount[c.id];
    const score = wins - losses; // Copeland score formula

    return {
      id: c.id,
      name: c.name,
      wins,
      losses,
      ties,
      score,
      rank: 0,
    };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Assign ranks
  let currentRank = 1;
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].score < scores[i - 1].score) {
      currentRank = i + 1;
    }
    scores[i].rank = currentRank;
  }

  // 6. Determine Winners
  const maxScore = scores[0].score;
  const winners = scores.filter((s) => s.score === maxScore).map((s) => s.id);
  const winnerNames = winners.map((id) => candidateMap.get(id)!);

  let status: 'winner' | 'tie' = winners.length > 1 ? 'tie' : 'winner';

  return {
    method: 'copeland',
    pairwiseMatrix: matrix,
    pairwiseResults,
    scores,
    status,
    winners,
    winnerNames,
    totalValidBallots: validBallots.length,
    totalInvalidBallots,
    totalVoters: voterCount,
    totalPairwiseMatches,
  };
}
