// ==========================================
// Unit Tests — Instant Runoff Voting (IRV) Algorithm
// ==========================================

import { describe, it, expect } from 'vitest';
import { computeIRV } from './irv';
import type { Ballot, Candidate } from '../types';

function makeCandidates(ids: string[]): Candidate[] {
  return ids.map(id => ({ id, name: `Candidate ${id}` }));
}

describe('Instant Runoff Voting (IRV)', () => {

  it('should declare a winner in round 1 if they have >50% votes', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['A', 'C', 'B'] },
      { voterId: 3, ranking: ['A', 'B', 'C'] },
      { voterId: 4, ranking: ['B', 'C', 'A'] },
      { voterId: 5, ranking: ['C', 'A', 'B'] },
    ];

    const output = computeIRV(ballots, candidates, 5);

    expect(output.winner).toBe('A');
    expect(output.result.rounds.length).toBe(1);
    expect(output.result.rounds[0].votes['A']).toBe(3);
    expect(output.isTie).toBe(false);
  });

  it('should eliminate lowest candidate and redistribute votes', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D']);
    // Total 10 voters. Threshold = 6
    // Round 1:
    // A: 3 (voters 1, 2, 3)
    // B: 4 (voters 4, 5, 6, 7)
    // C: 2 (voters 8, 9)
    // D: 1 (voter 10)
    
    // Voter 10 (D) second choice is A.
    // Round 2: D eliminated.
    // A: 4 (voters 1, 2, 3, 10)
    // B: 4
    // C: 2
    
    // Round 3: C eliminated.
    // C voters (8, 9) second choice is B.
    // A: 4
    // B: 6 -> Wins!
    
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C', 'D'] },
      { voterId: 2, ranking: ['A', 'B', 'C', 'D'] },
      { voterId: 3, ranking: ['A', 'B', 'C', 'D'] },
      { voterId: 4, ranking: ['B', 'A', 'C', 'D'] },
      { voterId: 5, ranking: ['B', 'A', 'C', 'D'] },
      { voterId: 6, ranking: ['B', 'A', 'C', 'D'] },
      { voterId: 7, ranking: ['B', 'A', 'C', 'D'] },
      { voterId: 8, ranking: ['C', 'B', 'A', 'D'] },
      { voterId: 9, ranking: ['C', 'B', 'A', 'D'] },
      { voterId: 10, ranking: ['D', 'A', 'C', 'B'] },
    ];

    const output = computeIRV(ballots, candidates, 10);

    expect(output.winner).toBe('B');
    expect(output.result.rounds.length).toBe(3);
    
    // Round 1
    expect(output.result.rounds[0].eliminated).toBe('D');
    expect(output.result.rounds[0].votes['D']).toBe(1);
    
    // Round 2
    expect(output.result.rounds[1].eliminated).toBe('C');
    expect(output.result.rounds[1].votes['A']).toBe(4);
    
    // Round 3
    expect(output.result.rounds[2].eliminated).toBeNull();
    expect(output.result.rounds[2].votes['B']).toBe(6);
  });

  it('should handle unresolvable ties', () => {
    const candidates = makeCandidates(['A', 'B']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B'] },
      { voterId: 2, ranking: ['B', 'A'] },
    ];

    const output = computeIRV(ballots, candidates, 2);

    expect(output.winner).toBeNull();
    expect(output.isTie).toBe(true);
    expect(output.tiedCandidates).toContain('A');
    expect(output.tiedCandidates).toContain('B');
  });

  it('should eliminate multiple tied lowest candidates', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['C', 'A', 'B'] },
      { voterId: 2, ranking: ['C', 'A', 'B'] },
      { voterId: 3, ranking: ['C', 'A', 'B'] },
      { voterId: 4, ranking: ['A', 'C', 'B'] },
      { voterId: 5, ranking: ['B', 'C', 'A'] },
    ];
    // Threshold = 3
    // Round 1: C=3, A=1, B=1
    // C wins immediately.
    
    const output = computeIRV(ballots, candidates, 5);
    expect(output.winner).toBe('C');
    expect(output.result.rounds.length).toBe(1);
  });
  
  it('should not count invalid ballots', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['A', 'B'] }, // Invalid
    ];
    
    const output = computeIRV(ballots, candidates, 2);
    expect(output.totalValidBallots).toBe(1);
    expect(output.invalidBallots).toBe(1);
    expect(output.winner).toBe('A');
  });
});
