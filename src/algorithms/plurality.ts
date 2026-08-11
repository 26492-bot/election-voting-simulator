// ==========================================
// Plurality Voting Algorithm
// Counts only first-preference votes (ranking[0])
// ==========================================

import type { Ballot, Candidate, PluralityResult } from '../types';

export interface PluralityCandidateScore {
  id: string;
  name: string;
  votes: number;
  percent: number;
  rank: number;
}

export interface PluralityOutput {
  result: PluralityResult;
  scores: PluralityCandidateScore[];
  winner: string | null;
  winnerName: string | null;
  isTie: boolean;
  tiedCandidates: string[];
  tiedCandidateNames: string[];
  totalValidBallots: number;
  totalVoters: number;
  invalidBallots: number;
}

/**
 * Compute Plurality Voting results.
 *
 * Only the first-preference candidate (ranking[0]) of each valid ballot
 * is counted. A ballot is valid if its ranking array has exactly as many
 * entries as there are candidates and the first entry is a recognised
 * candidate ID.
 */
export function computePlurality(
  ballots: Ballot[],
  candidates: Candidate[],
  voterCount: number,
): PluralityOutput {
  const candidateIds = new Set(candidates.map(c => c.id));
  const candidateMap = new Map(candidates.map(c => [c.id, c.name]));

  // Initialise vote counts to 0 for every candidate
  const voteCounts: Record<string, number> = {};
  for (const c of candidates) {
    voteCounts[c.id] = 0;
  }

  // Count first-preference votes from valid ballots only
  let validBallots = 0;
  for (const ballot of ballots) {
    // A ballot is valid only when its ranking is complete
    if (ballot.ranking.length !== candidates.length) continue;
    const firstChoice = ballot.ranking[0];
    if (!candidateIds.has(firstChoice)) continue;
    voteCounts[firstChoice]++;
    validBallots++;
  }

  const totalVotes = validBallots;

  // Build scored entries and sort descending by votes
  const scores: PluralityCandidateScore[] = candidates
    .map(c => ({
      id: c.id,
      name: c.name,
      votes: voteCounts[c.id],
      percent: totalVotes > 0 ? (voteCounts[c.id] / totalVotes) * 100 : 0,
      rank: 0, // will assign after sorting
    }))
    .sort((a, b) => b.votes - a.votes);

  // Assign ranks (1-indexed)
  scores.forEach((s, i) => {
    s.rank = i + 1;
  });

  // Determine winner / tie
  const maxVotes = scores.length > 0 ? scores[0].votes : 0;
  const topCandidates = scores.filter(s => s.votes === maxVotes);
  const isTie = topCandidates.length > 1 && maxVotes > 0;
  const winner = isTie ? null : (topCandidates.length === 1 && maxVotes > 0 ? topCandidates[0].id : null);
  const tiedCandidates = isTie ? topCandidates.map(c => c.id) : [];

  // Build the PluralityResult (matching types/index.ts)
  const result: PluralityResult = {
    method: 'plurality',
    scores: voteCounts,
    winner,
    isTie,
    tiedCandidates,
    totalVotes,
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
  };
}
