// ==========================================
// Ballot Generation Utilities
// ==========================================

import type { Ballot, Candidate } from '../types';

/**
 * Fisher-Yates shuffle for creating random permutations
 */
export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate a single random ballot for a given voter
 */
export function generateRandomBallot(voterId: number, candidates: Candidate[]): Ballot {
  return {
    voterId,
    ranking: shuffle(candidates.map(c => c.id))
  };
}

/**
 * Generate random ballots for all voters
 */
export function generateRandomBallots(voterCount: number, candidates: Candidate[]): Ballot[] {
  return generateUniformBallots(voterCount, candidates);
}

/**
 * Generate ballots with uniform random rankings
 * Each voter independently shuffles all candidates randomly
 */
export function generateUniformBallots(
  voterCount: number,
  candidates: Candidate[]
): Ballot[] {
  const candidateIds = candidates.map(c => c.id);
  const ballots: Ballot[] = [];

  for (let i = 0; i < voterCount; i++) {
    ballots.push({
      voterId: i + 1,
      ranking: shuffle(candidateIds),
    });
  }

  return ballots;
}

/**
 * Generate ballots with realistic distribution
 * Creates a "frontrunner" effect where some candidates are more popular
 */
export function generateRealisticBallots(
  voterCount: number,
  candidates: Candidate[]
): Ballot[] {
  const candidateIds = candidates.map(c => c.id);
  const n = candidateIds.length;
  
  // Assign popularity weights — first few candidates are more popular
  const weights = candidateIds.map((_, idx) => {
    return Math.max(1, n - idx + Math.random() * 2);
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const probabilities = weights.map(w => w / totalWeight);

  const ballots: Ballot[] = [];

  for (let i = 0; i < voterCount; i++) {
    // Weighted shuffle: more popular candidates tend to appear earlier
    const ranking = weightedShuffle(candidateIds, probabilities);
    ballots.push({
      voterId: i + 1,
      ranking,
    });
  }

  return ballots;
}

/**
 * Weighted shuffle — candidates with higher weight tend to be ranked higher
 */
function weightedShuffle(items: string[], weights: number[]): string[] {
  const remaining = items.map((item, idx) => ({ item, weight: weights[idx] }));
  const result: string[] = [];

  while (remaining.length > 0) {
    const totalWeight = remaining.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedIdx = 0;
    for (let i = 0; i < remaining.length; i++) {
      random -= remaining[i].weight;
      if (random <= 0) {
        selectedIdx = i;
        break;
      }
    }

    result.push(remaining[selectedIdx].item);
    remaining.splice(selectedIdx, 1);
  }

  return result;
}

/**
 * Generate candidate ID from index (A, B, C, ...)
 */
export function generateCandidateId(index: number): string {
  return String.fromCharCode(65 + index); // A=0, B=1, C=2...
}

/**
 * Generate default candidate name from index
 */
export function generateCandidateName(index: number): string {
  const letter = generateCandidateId(index);
  return `Candidate ${letter}`;
}
