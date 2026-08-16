// ==========================================
// Election Context — Global State Management
// ==========================================

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Election, Ballot, Candidate, VotingMethod } from '../types';
import { saveElection, loadElection, clearElection } from '../utils/storage';

interface ElectionContextType {
  election: Election | null;
  currentMethod: VotingMethod;
  setCurrentMethod: (method: VotingMethod) => void;
  createElection: (voterCount: number, candidates: Candidate[], ballots?: Ballot[], presetCaseId?: string) => void;
  updateBallot: (ballot: Ballot) => void;
  updateBallots: (ballots: Ballot[]) => void;
  removeBallot: (voterId: number) => void;
  clearBallots: () => void;
  updateCandidates: (candidates: Candidate[]) => void;
  updateVoterCount: (count: number) => void;
  resetElection: () => void;
  isLoaded: boolean;
}

const ElectionContext = createContext<ElectionContextType | null>(null);

export function ElectionProvider({ children }: { children: ReactNode }) {
  const [election, setElection] = useState<Election | null>(null);
  const [currentMethod, setCurrentMethod] = useState<VotingMethod>('plurality');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedElection = loadElection();
    if (savedElection) {
      setElection(savedElection);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever election changes
  useEffect(() => {
    if (election && isLoaded) {
      saveElection(election);
    }
  }, [election, isLoaded]);

  const createElection = (voterCount: number, candidates: Candidate[], ballots: Ballot[] = [], presetCaseId?: string) => {
    const newElection: Election = {
      voterCount,
      candidates,
      ballots,
      presetCaseId,
    };
    setElection(newElection);
    saveElection(newElection);
  };

  const updateBallot = (ballot: Ballot) => {
    if (!election) return;
    const existingIndex = election.ballots.findIndex(b => b.voterId === ballot.voterId);
    const newBallots = [...election.ballots];
    if (existingIndex >= 0) {
      newBallots[existingIndex] = ballot;
    } else {
      newBallots.push(ballot);
    }
    const updatedElection = { ...election, ballots: newBallots };
    setElection(updatedElection);
  };

  const updateBallots = (ballots: Ballot[]) => {
    if (!election) return;
    const updatedElection = { ...election, ballots };
    setElection(updatedElection);
  };

  const removeBallot = (voterId: number) => {
    if (!election) return;
    const newBallots = election.ballots.filter(b => b.voterId !== voterId);
    setElection({ ...election, ballots: newBallots });
  };

  const clearBallots = () => {
    if (!election) return;
    setElection({ ...election, ballots: [] });
  };

  const updateCandidates = (newCandidates: Candidate[]) => {
    if (!election) return;
    // When candidates are updated, ensure ballots only reference valid candidates
    const validCandidateIds = new Set(newCandidates.map(c => c.id));
    const newBallots = election.ballots.map(ballot => {
      // Filter out removed candidates
      const newRanking = ballot.ranking.filter(id => validCandidateIds.has(id));
      
      // Add new candidates to the end of the ranking
      const existingRankingSet = new Set(newRanking);
      newCandidates.forEach(c => {
        if (!existingRankingSet.has(c.id)) {
          newRanking.push(c.id);
        }
      });
      
      return { ...ballot, ranking: newRanking };
    });
    
    setElection({ ...election, candidates: newCandidates, ballots: newBallots });
  };

  const updateVoterCount = (count: number) => {
    if (!election) return;
    setElection({ ...election, voterCount: count });
  };

  const resetElection = () => {
    setElection(null);
    clearElection();
    setCurrentMethod('plurality');
  };

  return (
    <ElectionContext.Provider
      value={{
        election,
        currentMethod,
        setCurrentMethod,
        createElection,
        updateBallot,
        updateBallots,
        removeBallot,
        clearBallots,
        updateCandidates,
        updateVoterCount,
        resetElection,
        isLoaded,
      }}
    >
      {children}
    </ElectionContext.Provider>
  );
}

export function useElection() {
  const context = useContext(ElectionContext);
  if (!context) {
    throw new Error('useElection must be used within an ElectionProvider');
  }
  return context;
}
