// ==========================================
// localStorage Utilities
// ==========================================

import type { Election } from '../types';

const STORAGE_KEY = 'election-simulator-data';

export function saveElection(election: Election): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(election));
  } catch (error) {
    console.error('Failed to save election data:', error);
  }
}

export function loadElection(): Election | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as Election;
  } catch (error) {
    console.error('Failed to load election data:', error);
    return null;
  }
}

export function clearElection(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear election data:', error);
  }
}

export function hasElectionData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}
