// ==========================================
// CSV Utilities for Import / Export
// ==========================================

import type { Ballot, Candidate } from '../types';

export function exportBallotsToCSV(ballots: Ballot[], candidates: Candidate[]): string {
  if (candidates.length === 0) return '';

  const header = ['Voter ID', ...candidates.map((_, i) => `Rank ${i + 1}`)].join(',');
  const rows = ballots.map(ballot => {
    return [
      ballot.voterId,
      ...ballot.ranking
    ].join(',');
  });

  return [header, ...rows].join('\n');
}

export function importBallotsFromCSV(
  csvContent: string,
  candidates: Candidate[]
): { ballots: Ballot[], errors: string[] } {
  const errors: string[] = [];
  const ballots: Ballot[] = [];
  
  if (!csvContent.trim()) {
    return { ballots, errors: ['ไฟล์ว่างเปล่า (Empty file)'] };
  }

  const lines = csvContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length < 2) {
    return { ballots, errors: ['ไม่พบข้อมูล Ballot ในไฟล์ (No ballot data found)'] };
  }

  const candidateIds = candidates.map(c => c.id);
  const expectedRanks = candidates.length;

  // Skip header, process rows
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(',').map(col => col.trim());
    
    if (columns.length !== expectedRanks + 1) {
      errors.push(`แถวที่ ${i + 1}: จำนวนคอลัมน์ไม่ถูกต้อง (Expected ${expectedRanks + 1}, got ${columns.length})`);
      continue;
    }

    const voterId = parseInt(columns[0], 10);
    if (isNaN(voterId)) {
      errors.push(`แถวที่ ${i + 1}: Voter ID ไม่ใช่ตัวเลข (${columns[0]})`);
      continue;
    }

    const ranking = columns.slice(1);
    
    // Check if any rank is missing or invalid candidate
    let isValid = true;
    for (let r = 0; r < ranking.length; r++) {
      if (!candidateIds.includes(ranking[r])) {
        errors.push(`แถวที่ ${i + 1}: พบผู้สมัครที่ไม่ถูกต้อง '${ranking[r]}'`);
        isValid = false;
        break;
      }
    }

    // Check for duplicates in ranking
    if (isValid) {
      const uniqueRanks = new Set(ranking);
      if (uniqueRanks.size !== ranking.length) {
        errors.push(`แถวที่ ${i + 1}: มีการเลือกผู้สมัครซ้ำใน Ballot เดียวกัน`);
        isValid = false;
      }
    }

    if (isValid) {
      ballots.push({
        voterId,
        ranking
      });
    }
  }

  // Check for duplicate Voter IDs
  const voterIds = ballots.map(b => b.voterId);
  const uniqueVoterIds = new Set(voterIds);
  if (voterIds.length !== uniqueVoterIds.size) {
    errors.push('มี Voter ID ซ้ำซ้อนกันในไฟล์');
    // Keep only unique voter IDs (last one wins or first one wins, let's just deduplicate)
    const dedupedBallots: Ballot[] = [];
    const seen = new Set<number>();
    for (const b of ballots) {
      if (!seen.has(b.voterId)) {
        seen.add(b.voterId);
        dedupedBallots.push(b);
      }
    }
    return { ballots: dedupedBallots, errors };
  }

  return { ballots, errors };
}
