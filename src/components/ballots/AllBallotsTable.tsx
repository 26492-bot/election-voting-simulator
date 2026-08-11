// ==========================================
// AllBallotsTable — Table view of all voters' ballots
// ==========================================

import { Users, UserCheck, AlertTriangle } from 'lucide-react';
import type { Ballot, Candidate } from '../../types';

interface AllBallotsTableProps {
  voterCount: number;
  candidates: Candidate[];
  ballots: Ballot[];
  onSelectVoter: (voterId: number) => void;
}

export default function AllBallotsTable({ voterCount, candidates, ballots, onSelectVoter }: AllBallotsTableProps) {
  const voters = Array.from({ length: voterCount }, (_, i) => i + 1);
  const completedCount = ballots.length;

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary-900)] flex items-center gap-2">
            📊 ตารางคะแนนรวม
          </h3>
          <p className="text-xs text-slate-500 mt-1">คะแนนความชอบของผู้มีสิทธิเลือกตั้งทั้งหมด</p>
        </div>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Users size={14} className="text-slate-500" />
            <span className="text-xs font-medium text-slate-600">ผู้มีสิทธิเลือกตั้ง: {voterCount} คน</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--color-primary-50)] px-3 py-1.5 rounded-lg border border-[var(--color-primary-100)]">
            <UserCheck size={14} className="text-[var(--color-primary-600)]" />
            <span className="text-xs font-medium text-[var(--color-primary-700)]">กรอกแล้ว: {completedCount} คน</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto relative p-4">
        <div className="inline-block min-w-full rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200 sticky left-0 bg-slate-50 z-20 min-w-[140px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                  ผู้มีสิทธิเลือกตั้ง
                </th>
                {candidates.map(candidate => (
                  <th key={candidate.id} className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200 text-center min-w-[100px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className="w-5 h-5 rounded bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center text-xs">
                        {candidate.id}
                      </span>
                      <span className="text-xs">{candidate.name}</span>
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200 text-center min-w-[100px]">
                  สถานะ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {voters.map(voterId => {
                const ballot = ballots.find(b => b.voterId === voterId);
                const isComplete = !!ballot && ballot.ranking.length === candidates.length;

                return (
                  <tr 
                    key={voterId} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onSelectVoter(voterId)}
                    title={`คลิกเพื่อแก้ไขคะแนนของคนที่ ${voterId}`}
                  >
                    <td className="py-3 px-4 font-semibold text-slate-700 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)] transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">
                          {voterId}
                        </span>
                        คนที่ {voterId}
                      </div>
                    </td>
                    
                    {candidates.map(candidate => {
                      let score: number | string = '-';
                      let scoreClass = 'text-slate-300';
                      let bgClass = '';
                      
                      if (isComplete && ballot) {
                        const rankIndex = ballot.ranking.indexOf(candidate.id);
                        if (rankIndex !== -1) {
                          score = candidates.length - rankIndex;
                          
                          // Styling based on score relative to max score
                          if (score === candidates.length) {
                            scoreClass = 'text-[var(--color-primary-700)] font-bold';
                            bgClass = 'bg-[var(--color-primary-50)]';
                          } else if (score > candidates.length / 2) {
                            scoreClass = 'text-[var(--color-primary-600)] font-semibold';
                            bgClass = 'bg-slate-50';
                          } else {
                            scoreClass = 'text-slate-600 font-medium';
                          }
                        }
                      }

                      return (
                        <td key={candidate.id} className={`py-3 px-4 text-center ${bgClass}`}>
                          <span className={scoreClass}>{score}</span>
                        </td>
                      );
                    })}
                    
                    <td className="py-3 px-4 text-center">
                      {isComplete ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                          <UserCheck size={14} />
                          ✓
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                          <AlertTriangle size={14} />
                          ⚠️
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex items-center justify-between">
        <p>💡 ตัวเลขคือคะแนนความชอบ ({candidates.length} = ชอบมากที่สุด, 1 = ชอบน้อยที่สุด)</p>
        <p>คลิกที่แถวเพื่อกลับไปแก้ไขข้อมูลรายบุคคล</p>
      </div>
    </div>
  );
}
