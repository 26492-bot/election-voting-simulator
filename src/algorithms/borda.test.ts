// ==========================================
// Unit Tests — Borda Count Algorithm
// ==========================================

import { describe, it, expect } from 'vitest';
import { computeBorda } from './borda';
import type { Ballot, Candidate } from '../types';

// Helper to create candidates
function makeCandidates(ids: string[]): Candidate[] {
  return ids.map(id => ({ id, name: `Candidate ${id}` }));
}

describe('Borda Count Voting', () => {

  // ----- Test 1: Basic score calculation -----
  it('should calculate correct basic scores (Test 1)', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
    ];

    const output = computeBorda(ballots, candidates, 1);

    // A=3, B=2, C=1
    expect(output.result.scores['A']).toBe(3);
    expect(output.result.scores['B']).toBe(2);
    expect(output.result.scores['C']).toBe(1);
    expect(output.winner).toBe('A');
    expect(output.isTie).toBe(false);
  });

  // ----- Test 2: Multiple voters -----
  it('should sum scores correctly from multiple voters (Test 2)', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D', 'E']);
    // Voter 1: C (5) A (4) E (3) B (2) D (1)
    // Voter 2: A (5) C (4) B (3) D (2) E (1)
    // Voter 3: C (5) B (4) A (3) E (2) D (1)
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['C', 'A', 'E', 'B', 'D'] },
      { voterId: 2, ranking: ['A', 'C', 'B', 'D', 'E'] },
      { voterId: 3, ranking: ['C', 'B', 'A', 'E', 'D'] },
    ];

    const output = computeBorda(ballots, candidates, 3);

    // A = 4 + 5 + 3 = 12
    // B = 2 + 3 + 4 = 9
    // C = 5 + 4 + 5 = 14
    // D = 1 + 2 + 1 = 4
    // E = 3 + 1 + 2 = 6
    expect(output.result.scores['A']).toBe(12);
    expect(output.result.scores['B']).toBe(9);
    expect(output.result.scores['C']).toBe(14);
    expect(output.result.scores['D']).toBe(4);
    expect(output.result.scores['E']).toBe(6);
    expect(output.winner).toBe('C');
    
    // Check rank Distribution for C: two 1st ranks, one 2nd rank
    expect(output.result.rankDistribution['C']).toEqual([2, 1, 0, 0, 0]);
  });

  // ----- Test 3: Varying candidate counts -----
  it('should assign points based on candidate count (Test 3)', () => {
    // 2 candidates
    const cand2 = makeCandidates(['A', 'B']);
    const bal2 = [{ voterId: 1, ranking: ['A', 'B'] }];
    const out2 = computeBorda(bal2, cand2, 1);
    expect(out2.result.scores['A']).toBe(2);
    expect(out2.result.scores['B']).toBe(1);

    // 4 candidates
    const cand4 = makeCandidates(['A', 'B', 'C', 'D']);
    const bal4 = [{ voterId: 1, ranking: ['A', 'B', 'C', 'D'] }];
    const out4 = computeBorda(bal4, cand4, 1);
    expect(out4.result.scores['A']).toBe(4);
    expect(out4.result.scores['D']).toBe(1);
  });

  // ----- Test 4: Tie handling -----
  it('should handle tied candidates without choosing a winner (Test 4)', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['B', 'A', 'C'] },
    ];
    // A = 3 + 2 = 5
    // B = 2 + 3 = 5
    // C = 1 + 1 = 2

    const output = computeBorda(ballots, candidates, 2);

    expect(output.result.scores['A']).toBe(5);
    expect(output.result.scores['B']).toBe(5);
    expect(output.result.scores['C']).toBe(2);
    expect(output.winner).toBeNull();
    expect(output.isTie).toBe(true);
    expect(output.tiedCandidates).toContain('A');
    expect(output.tiedCandidates).toContain('B');
  });

  // ----- Test 5: Incomplete / invalid ballots -----
  it('should not count incomplete or duplicate ballots (Test 5)', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] }, // valid
      { voterId: 2, ranking: ['A', 'B'] },      // missing 1
      { voterId: 3, ranking: ['A', 'B', 'D'] }, // unknown candidate D
      { voterId: 4, ranking: ['A', 'B', 'A'] }, // duplicate candidate
    ];

    const output = computeBorda(ballots, candidates, 4);

    expect(output.totalValidBallots).toBe(1);
    expect(output.invalidBallots).toBe(3);
    // Only ballot 1 is counted
    expect(output.result.scores['A']).toBe(3);
    expect(output.result.scores['B']).toBe(2);
    expect(output.result.scores['C']).toBe(1);
  });
  
  // ----- Test 6: Percentages -----
  it('should calculate percentages based on max possible score', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D', 'E']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['C', 'A', 'E', 'B', 'D'] }
    ];
    const output = computeBorda(ballots, candidates, 1);
    
    // Max score = 1 voter * 5 points = 5
    // C = 5 => 100%
    // A = 4 => 80%
    expect(output.scores.find(c => c.id === 'C')?.percent).toBe(100);
    expect(output.scores.find(c => c.id === 'A')?.percent).toBe(80);
    expect(output.scores.find(c => c.id === 'B')?.percent).toBe(40);
  });
});
