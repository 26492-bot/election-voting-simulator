// ==========================================
// Unit Tests — Plurality Voting Algorithm
// ==========================================

import { describe, it, expect } from 'vitest';
import { computePlurality } from './plurality';
import type { Ballot, Candidate } from '../types';

// Helper to create candidates
function makeCandidates(ids: string[]): Candidate[] {
  return ids.map(id => ({ id, name: `Candidate ${id}` }));
}

describe('Plurality Voting', () => {

  // ----- Test 1: Clear winner -----
  it('should correctly count first-preference votes with a clear winner', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['A', 'C', 'B'] },
      { voterId: 3, ranking: ['B', 'A', 'C'] },
      { voterId: 4, ranking: ['A', 'B', 'C'] },
      { voterId: 5, ranking: ['C', 'A', 'B'] },
    ];

    const output = computePlurality(ballots, candidates, 5);

    // A got 3 first-preference votes, B got 1, C got 1
    expect(output.result.scores['A']).toBe(3);
    expect(output.result.scores['B']).toBe(1);
    expect(output.result.scores['C']).toBe(1);
    expect(output.winner).toBe('A');
    expect(output.winnerName).toBe('Candidate A');
    expect(output.isTie).toBe(false);
    expect(output.tiedCandidates).toEqual([]);
    expect(output.totalValidBallots).toBe(5);

    // Verify sorted scores
    expect(output.scores[0].id).toBe('A');
    expect(output.scores[0].votes).toBe(3);
    expect(output.scores[0].rank).toBe(1);
    expect(output.scores[0].percent).toBeCloseTo(60, 0);
  });

  // ----- Test 2: Tie -----
  it('should handle tied candidates without choosing a winner', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['A', 'C', 'B'] },
      { voterId: 3, ranking: ['B', 'A', 'C'] },
      { voterId: 4, ranking: ['B', 'C', 'A'] },
      { voterId: 5, ranking: ['C', 'A', 'B'] },
    ];

    const output = computePlurality(ballots, candidates, 5);

    // A=2, B=2, C=1
    expect(output.result.scores['A']).toBe(2);
    expect(output.result.scores['B']).toBe(2);
    expect(output.result.scores['C']).toBe(1);
    expect(output.winner).toBeNull();
    expect(output.isTie).toBe(true);
    expect(output.tiedCandidates).toContain('A');
    expect(output.tiedCandidates).toContain('B');
    expect(output.tiedCandidates).not.toContain('C');
  });

  // ----- Test 3: Candidate with zero votes -----
  it('should assign 0 votes to candidates no one chose as first preference', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C', 'D'] },
      { voterId: 2, ranking: ['B', 'A', 'C', 'D'] },
      { voterId: 3, ranking: ['A', 'C', 'B', 'D'] },
    ];

    const output = computePlurality(ballots, candidates, 3);

    expect(output.result.scores['A']).toBe(2);
    expect(output.result.scores['B']).toBe(1);
    expect(output.result.scores['C']).toBe(0);
    expect(output.result.scores['D']).toBe(0);
    expect(output.winner).toBe('A');

    // C and D should be at the bottom
    const cScore = output.scores.find(s => s.id === 'C');
    const dScore = output.scores.find(s => s.id === 'D');
    expect(cScore?.votes).toBe(0);
    expect(dScore?.votes).toBe(0);
    expect(cScore?.percent).toBe(0);
  });

  // ----- Test 4: Incomplete ballots are excluded -----
  it('should not count incomplete ballots', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },       // valid
      { voterId: 2, ranking: ['B', 'A'] },              // incomplete (2 of 3)
      { voterId: 3, ranking: ['C', 'A', 'B'] },        // valid
      { voterId: 4, ranking: [] },                       // empty
      { voterId: 5, ranking: ['A', 'B', 'C'] },        // valid
    ];

    const output = computePlurality(ballots, candidates, 5);

    // Only 3 valid ballots: A=2, C=1
    expect(output.totalValidBallots).toBe(3);
    expect(output.invalidBallots).toBe(2);
    expect(output.result.scores['A']).toBe(2);
    expect(output.result.scores['B']).toBe(0);
    expect(output.result.scores['C']).toBe(1);
    expect(output.result.totalVotes).toBe(3);
  });

  // ----- Test 5: Large number of voters -----
  it('should correctly count with many voters', () => {
    const candidates = makeCandidates(['A', 'B', 'C', 'D', 'E']);
    const ballots: Ballot[] = [];

    // 200 voters: 80 for A, 60 for B, 40 for C, 15 for D, 5 for E
    const distribution = { A: 80, B: 60, C: 40, D: 15, E: 5 };
    let voterId = 1;
    for (const [firstChoice, count] of Object.entries(distribution)) {
      for (let i = 0; i < count; i++) {
        // Create a valid full ranking with firstChoice at index 0
        const others = ['A', 'B', 'C', 'D', 'E'].filter(c => c !== firstChoice);
        ballots.push({
          voterId: voterId++,
          ranking: [firstChoice, ...others],
        });
      }
    }

    const output = computePlurality(ballots, candidates, 200);

    expect(output.totalValidBallots).toBe(200);
    expect(output.result.scores['A']).toBe(80);
    expect(output.result.scores['B']).toBe(60);
    expect(output.result.scores['C']).toBe(40);
    expect(output.result.scores['D']).toBe(15);
    expect(output.result.scores['E']).toBe(5);
    expect(output.winner).toBe('A');
    expect(output.scores[0].percent).toBeCloseTo(40, 0);

    // Verify ranking order
    expect(output.scores.map(s => s.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
  });

  // ----- Test 6: No ballots at all -----
  it('should handle zero ballots gracefully', () => {
    const candidates = makeCandidates(['A', 'B']);
    const output = computePlurality([], candidates, 10);

    expect(output.totalValidBallots).toBe(0);
    expect(output.winner).toBeNull();
    expect(output.isTie).toBe(false);
    expect(output.result.scores['A']).toBe(0);
    expect(output.result.scores['B']).toBe(0);
  });

  // ----- Test 7: Only ranking[0] counts -----
  it('should only count ranking[0] and ignore lower preferences', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    // A appears second in all except voter 1
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['B', 'A', 'C'] },
      { voterId: 3, ranking: ['C', 'A', 'B'] },
    ];

    const output = computePlurality(ballots, candidates, 3);

    // Despite A being second for voters 2 and 3, only first preference counts
    expect(output.result.scores['A']).toBe(1);
    expect(output.result.scores['B']).toBe(1);
    expect(output.result.scores['C']).toBe(1);
    // Three-way tie
    expect(output.isTie).toBe(true);
    expect(output.tiedCandidates.length).toBe(3);
  });

  // ----- Test 8: Percentages sum correctly -----
  it('should produce percentages that sum to approximately 100', () => {
    const candidates = makeCandidates(['A', 'B', 'C']);
    const ballots: Ballot[] = [
      { voterId: 1, ranking: ['A', 'B', 'C'] },
      { voterId: 2, ranking: ['B', 'A', 'C'] },
      { voterId: 3, ranking: ['C', 'A', 'B'] },
    ];

    const output = computePlurality(ballots, candidates, 3);
    const totalPercent = output.scores.reduce((sum, s) => sum + s.percent, 0);
    expect(totalPercent).toBeCloseTo(100, 1);
  });
});
