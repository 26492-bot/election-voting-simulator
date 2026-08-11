// ==========================================
// Unit Tests — Condorcet Method (Copeland's Rule)
// ==========================================

import { describe, it, expect } from 'vitest';
import { computeCopeland } from './copeland';
import type { Ballot, Candidate } from '../types';

function makeCandidates(ids: string[]): Candidate[] {
  return ids.map(id => ({ id, name: `Candidate ${id}` }));
}

describe("Condorcet Method (Copeland's Rule)", () => {
  it('Test 1 & 6 — Pairwise Winner & Overall Winner', () => {
    // A should beat B and C
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['A', 'C', 'B'] },
      { voterId: 3, ranking: ['B', 'A', 'C'] },
    ];
    // A vs B: A gets 2, B gets 1 => A wins
    // A vs C: A gets 3, C gets 0 => A wins
    // B vs C: B gets 2, C gets 1 => B wins
    
    // A: 2 wins, 0 loss => score 2
    // B: 1 win, 1 loss => score 0
    // C: 0 win, 2 loss => score -2
    
    const output = computeCopeland(ballots, candidates, 3);
    
    expect(output.status).toBe('winner');
    expect(output.winners).toEqual(['A']);
    expect(output.scores.find(s => s.id === 'A')?.score).toBe(2);
    expect(output.scores.find(s => s.id === 'B')?.score).toBe(0);
    expect(output.scores.find(s => s.id === 'C')?.score).toBe(-2);
    
    // Verify pairwise result A vs B
    const aVsB = output.pairwiseResults.find(p => (p.candidateA === 'A' && p.candidateB === 'B') || (p.candidateA === 'B' && p.candidateB === 'A'));
    expect(aVsB).toBeDefined();
    if (aVsB?.candidateA === 'A') {
      expect(aVsB.aVotes).toBe(2);
      expect(aVsB.bVotes).toBe(1);
      expect(aVsB.result).toBe('A_WIN');
    }
  });

  it('Test 2 — Pairwise Reverse', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['B', 'C', 'A'] },
      { voterId: 2, ranking: ['C', 'B', 'A'] },
      { voterId: 3, ranking: ['B', 'A', 'C'] },
    ];
    // B > A in 3 ballots
    const output = computeCopeland(ballots, candidates, 3);
    const aVsB = output.pairwiseResults.find(p => (p.candidateA === 'A' && p.candidateB === 'B'));
    expect(aVsB?.bVotes).toBe(3);
    expect(aVsB?.aVotes).toBe(0);
    expect(aVsB?.result).toBe('B_WIN');
  });

  it('Test 3 — Pairwise Tie', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['B', 'A', 'C'] },
    ];
    // A vs B: 1 vs 1 => TIE
    const output = computeCopeland(ballots, candidates, 2);
    const aVsB = output.pairwiseResults.find(p => p.candidateA === 'A' && p.candidateB === 'B');
    expect(aVsB?.result).toBe('TIE');
    
    // Score calculation check
    const aScore = output.scores.find(s => s.id === 'A');
    expect(aScore?.ties).toBe(1);
    // A vs C: A gets 2, C gets 0 => A wins
    expect(aScore?.wins).toBe(1);
    expect(aScore?.score).toBe(1); // 1 win - 0 loss = 1
  });

  it('Test 4 — Copeland Score details', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D']);
    // Construct a specific scenario
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C', 'D'] },
      { voterId: 2, ranking: ['B', 'A', 'D', 'C'] },
    ];
    // A vs B: 1-1 (Tie)
    // A vs C: 2-0 (A Win)
    // A vs D: 2-0 (A Win)
    // Score A: 2 Wins, 0 Loss, 1 Tie => 2
    
    // B vs A: 1-1 (Tie)
    // B vs C: 2-0 (B Win)
    // B vs D: 2-0 (B Win)
    // Score B: 2 Wins, 0 Loss, 1 Tie => 2
    
    // C vs D: 1-1 (Tie)
    // Score C: 0 Wins, 2 Losses, 1 Tie => -2
    // Score D: 0 Wins, 2 Losses, 1 Tie => -2
    
    const output = computeCopeland(ballots, candidates, 2);
    const aScore = output.scores.find(s => s.id === 'A')!;
    expect(aScore.wins).toBe(2);
    expect(aScore.losses).toBe(0);
    expect(aScore.ties).toBe(1);
    expect(aScore.score).toBe(2);
  });

  it('Test 5 — Multiple Candidates Pairwise Matches Count', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D']); // 4 candidates
    // Pairwise matches should be 4 * 3 / 2 = 6
    const ballots: Ballot[] = [{ voterId: 1, ranking: ['A', 'B', 'C', 'D'] }];
    const output = computeCopeland(ballots, candidates, 1);
    expect(output.totalPairwiseMatches).toBe(6);
    expect(output.pairwiseResults.length).toBe(6);
  });

  it('Test 7 — Overall Tie', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['B', 'A', 'C'] },
    ];
    const output = computeCopeland(ballots, candidates, 2);
    expect(output.status).toBe('tie');
    expect(output.winners.sort()).toEqual(['A', 'B']);
  });

  it('Test 8 — Invalid Ballot (Incomplete Ranking)', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] }, // Valid
      { voterId: 2, ranking: ['A', 'B'] },      // Invalid, missing C
    ];
    const output = computeCopeland(ballots, candidates, 2);
    expect(output.totalValidBallots).toBe(1);
    expect(output.totalInvalidBallots).toBe(1);
  });

  it('Test 9 — Duplicate Candidate', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'A'] }, // Invalid
    ];
    const output = computeCopeland(ballots, candidates, 1);
    expect(output.totalValidBallots).toBe(0);
    expect(output.totalInvalidBallots).toBe(1);
  });

  it('Test 10 — Unknown Candidate', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'X'] }, // Invalid, X doesn't exist
    ];
    const output = computeCopeland(ballots, candidates, 1);
    expect(output.totalValidBallots).toBe(0);
    expect(output.totalInvalidBallots).toBe(1);
  });
});
