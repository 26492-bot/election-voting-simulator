// ==========================================
// VoterList — List of voters and their status
// ==========================================

import { UserCheck, User } from 'lucide-react';
import type { Ballot } from '../../types';

interface VoterListProps {
  voterCount: number;
  ballots: Ballot[];
  selectedVoterId: number;
  onSelectVoter: (voterId: number) => void;
}

export default function VoterList({ voterCount, ballots, selectedVoterId, onSelectVoter }: VoterListProps) {
  // Create an array of voters
  const voters = Array.from({ length: voterCount }, (_, i) => i + 1);
  
  // Set of voters who have completed their ballot
  const completedVoters = new Set(ballots.map(b => b.voterId));

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden flex flex-col h-full animate-fade-in">
      <div className="px-4 py-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)] text-white">
        <h3 className="font-semibold text-sm">ผู้มีสิทธิเลือกตั้ง</h3>
        <p className="text-[11px] text-primary-200 opacity-80 mt-0.5">Voter List</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {voters.map(voterId => {
          const isCompleted = completedVoters.has(voterId);
          const isSelected = selectedVoterId === voterId;
          
          return (
            <button
              key={voterId}
              onClick={() => onSelectVoter(voterId)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isSelected 
                  ? 'bg-[var(--color-primary-100)] text-[var(--color-primary-900)] font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isCompleted ? (
                  <UserCheck size={16} className={isSelected ? 'text-[var(--color-primary-600)]' : 'text-emerald-500'} />
                ) : (
                  <User size={16} className={isSelected ? 'text-[var(--color-primary-400)]' : 'text-slate-400'} />
                )}
                <span>คนที่ {voterId}</span>
              </div>
              
              <span className={`text-xs font-medium ${
                isCompleted 
                  ? (isSelected ? 'text-[var(--color-primary-700)]' : 'text-emerald-600')
                  : 'text-amber-500'
              }`}>
                {isCompleted ? '✓ กรอกแล้ว' : '! ยังไม่ได้กรอก'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
