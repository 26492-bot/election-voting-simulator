// ==========================================
// Instant Runoff Voting (IRV) Algorithm
// ==========================================

import type { Ballot, Candidate, IRVRound, IRVResult } from '../types';

export interface IRVOutput {
  result: IRVResult;
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
 * Compute Instant Runoff Voting results.
 */
export function computeIRV(
  ballots: Ballot[],
  candidates: Candidate[],
  voterCount: number,
): IRVOutput {
  const N = candidates.length;
  const candidateIds = new Set(candidates.map(c => c.id));
  const candidateMap = new Map(candidates.map(c => [c.id, c.name]));

  // Filter valid ballots
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

  const activeCandidates = new Set(candidateIds);
  const rounds: IRVRound[] = [];
  
  let winner: string | null = null;
  let isTie = false;
  let tiedCandidates: string[] = [];
  let roundNumber = 1;

  // If no valid ballots, return early
  if (validBallots.length === 0) {
    return {
      result: {
        method: 'irv',
        rounds: [],
        winner: null,
        winningRound: 0,
        isTie: false,
        tiedCandidates: [],
      },
      winner: null,
      winnerName: null,
      isTie: false,
      tiedCandidates: [],
      tiedCandidateNames: [],
      totalValidBallots: 0,
      totalVoters: voterCount,
      invalidBallots: ballots.length,
    };
  }

  const majorityThreshold = Math.floor(validBallots.length / 2) + 1;

  while (activeCandidates.size > 0 && winner === null && !isTie) {
    const votes: Record<string, number> = {};
    for (const c of activeCandidates) {
      votes[c] = 0;
    }

    // Count first preferences among active candidates
    for (const ballot of validBallots) {
      for (const candidateId of ballot.ranking) {
        if (activeCandidates.has(candidateId)) {
          votes[candidateId]++;
          break; // Stop at highest active preference
        }
      }
    }

    // Check for a winner
    let maxVotes = -1;
    for (const c of activeCandidates) {
      if (votes[c] > maxVotes) {
        maxVotes = votes[c];
      }
      if (votes[c] >= majorityThreshold) {
        winner = c;
      }
    }

    if (winner) {
      // Record final round
      rounds.push({
        roundNumber,
        votes: { ...votes },
        eliminated: null,
        isTie: false,
        tiedCandidates: [],
      });
      break;
    }

    // No winner yet, find candidates to eliminate
    let minVotes = Infinity;
    for (const c of activeCandidates) {
      if (votes[c] < minVotes) {
        minVotes = votes[c];
      }
    }

    const losers = Array.from(activeCandidates).filter(c => votes[c] === minVotes);

    if (losers.length === activeCandidates.size) {
      // All remaining candidates are tied for last place. It's an unresolvable tie.
      isTie = true;
      tiedCandidates = [...losers];
      rounds.push({
        roundNumber,
        votes: { ...votes },
        eliminated: null,
        isTie: true,
        tiedCandidates: [...tiedCandidates],
      });
      break;
    } else {
      // Eliminate losers (even if multiple tied for last, eliminate them all for simplicity)
      // Usually IRV eliminates the single lowest, but multiple elimination is fine if their total votes < next lowest
      for (const loser of losers) {
        activeCandidates.delete(loser);
      }
      
      rounds.push({
        roundNumber,
        votes: { ...votes },
        eliminated: losers.join(', '), // Just for display
        isTie: false,
        tiedCandidates: [],
      });
    }

    roundNumber++;
  }

  const result: IRVResult = {
    method: 'irv',
    rounds,
    winner,
    winningRound: winner ? roundNumber : 0,
    isTie,
    tiedCandidates,
  };

  return {
    result,
    winner,
    winnerName: winner ? (candidateMap.get(winner) ?? null) : null,
    isTie,
    tiedCandidates,
    tiedCandidateNames: tiedCandidates.map(id => candidateMap.get(id) ?? id),
    totalValidBallots: validBallots.length,
    totalVoters: voterCount,
    invalidBallots: ballots.length - validBallots.length,
  };
}
