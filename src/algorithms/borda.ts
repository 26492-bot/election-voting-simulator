// ==========================================
// Borda Count Voting Algorithm
// Assigns scores based on rank: 1st gets N, 2nd gets N-1, etc.
// ==========================================

import type { Ballot, Candidate, BordaResult } from '../types';

export interface BordaCandidateScore {
  id: string;
  name: string;
  score: number;
  percent: number;
  rank: number;
}

export interface BordaOutput {
  result: BordaResult;
  scores: BordaCandidateScore[];
  winner: string | null;
  winnerName: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  tiedCandidateNames: string[];
  totalValidBallots: number;
  totalVoters: number;
  invalidBallots: number;
  maxPossibleScore: number;
}

/**
 * Compute Borda Count Voting results.
 *
 * For N candidates, 1st rank gets N points, 2nd gets N-1 points, etc.
 * Last rank gets 1 point.
 */
export function computeBorda(
  ballots: Ballot[],
  candidates: Candidate[],
  voterCount: number,
): BordaOutput {
  const N = candidates.length;
  const candidateIds = new Set(candidates.map(c => c.id));
  const candidateMap = new Map(candidates.map(c => [c.id, c.name]));

  // Initialise scores to 0 for every candidate
  const scoresMap: Record<string, number> = {};
  // Track distribution of ranks for each candidate
  const rankDistribution: Record<string, number[]> = {};
  
  for (const c of candidates) {
    scoresMap[c.id] = 0;
    rankDistribution[c.id] = new Array(N).fill(0);
  }

  let validBallots = 0;
  for (const ballot of ballots) {
    // A ballot is valid only when its ranking is complete
    if (ballot.ranking.length !== N) continue;
    
    // Check if all ranked candidates exist
    let isValid = true;
    for (const rank of ballot.ranking) {
      if (!candidateIds.has(rank)) {
        isValid = false;
        break;
      }
    }
    
    // Also check for duplicates in ranking
    const uniqueRanks = new Set(ballot.ranking);
    if (uniqueRanks.size !== N) isValid = false;

    if (!isValid) continue;

    validBallots++;

    // Calculate score
    for (let i = 0; i < N; i++) {
      const candidateId = ballot.ranking[i];
      const points = N - i;
      scoresMap[candidateId] += points;
      rankDistribution[candidateId][i]++;
    }
  }

  // Calculate total points given
  let totalPoints = 0;
  for (const score of Object.values(scoresMap)) {
    totalPoints += score;
  }

  // Maximum possible score for a single candidate = total valid ballots * N
  const maxPossibleScore = validBallots * N;

  // Build scored entries and sort descending by score
  const scores: BordaCandidateScore[] = candidates
    .map(c => ({
      id: c.id,
      name: c.name,
      score: scoresMap[c.id],
      percent: maxPossibleScore > 0 ? (scoresMap[c.id] / maxPossibleScore) * 100 : 0,
      rank: 0, // will assign after sorting
    }))
    .sort((a, b) => b.score - a.score);

  // Assign ranks (1-indexed)
  scores.forEach((s, i) => {
    s.rank = i + 1;
  });

  // Determine winner / tie
  const maxScore = scores.length > 0 ? scores[0].score : 0;
  const topCandidates = scores.filter(s => s.score === maxScore);
  const isTie = topCandidates.length > 1 && maxScore > 0;
  const winner = isTie ? null : (topCandidates.length === 1 && maxScore > 0 ? topCandidates[0].id : null);
  const tiedCandidates = isTie ? topCandidates.map(c => c.id) : [];

  // Build the BordaResult (matching types/index.ts)
  const result: BordaResult = {
    method: 'borda',
    scores: scoresMap,
    rankDistribution,
    winner,
    isTie,
    tiedCandidates,
    totalPoints,
  };

  return {
    result,
    scores,
    winner,
    winnerName: winner ? (candidateMap.get(winner) ?? null) : null,
    isTie,
    tiedCandidates,
    tiedCandidateNames: tiedCandidates.map(id => candidateMap.get(id) ?? id),
    totalValidBallots: validBallots,
    totalVoters: voterCount,
    invalidBallots: ballots.length - validBallots,
    maxPossibleScore,
  };
}
