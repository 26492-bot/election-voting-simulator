// ==========================================
// BallotEditor — Radio button matrix for ranking
// ==========================================

import { useEffect, useState } from 'react';
import { Shuffle, Info, AlertTriangle } from 'lucide-react';
import type { Candidate } from '../../types';

interface BallotEditorProps {
  voterId: number;
  candidates: Candidate[];
  initialRanking: string[] | null;
  onRankingChange: (ranking: string[] | null) => void;
  onRandomizeSelf: () => void;
}

export default function BallotEditor({
  voterId,
  candidates,
  initialRanking,
  onRankingChange,
  onRandomizeSelf
}: BallotEditorProps) {
  const numCandidates = candidates.length;
  // State: Candidate ID -> Rank (number, where numCandidates is rank 1 (highest preference))
  const [ranks, setRanks] = useState<Record<string, number>>({});

  // Initialize ranks from initialRanking when voter changes or ranking resets
  useEffect(() => {
    if (initialRanking && initialRanking.length === numCandidates) {
      const newRanks: Record<string, number> = {};
      initialRanking.forEach((candidateId, idx) => {
        // Rank 1 gets score N, Rank 2 gets N-1, etc.
        newRanks[candidateId] = numCandidates - idx;
      });
      setRanks(newRanks);
    } else {
      setRanks({});
    }
  }, [voterId, initialRanking, numCandidates]);

  const handleRadioChange = (candidateId: string, rankValue: number) => {
    const newRanks = { ...ranks };
    
    // If this rankValue is already assigned to someone else, clear it there
    for (const cid in newRanks) {
      if (newRanks[cid] === rankValue && cid !== candidateId) {
        delete newRanks[cid];
      }
    }
    
    newRanks[candidateId] = rankValue;
    setRanks(newRanks);

    // If fully filled and valid, emit ranking array
    const rankValues = Object.values(newRanks);
    if (
      Object.keys(newRanks).length === numCandidates && 
      new Set(rankValues).size === numCandidates
    ) {
      // Create ordered ranking array based on rank values (highest value = rank 1)
      const ordered = Object.entries(newRanks)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      onRankingChange(ordered);
    } else {
      onRankingChange(null);
    }
  };

  const isComplete = Object.keys(ranks).length === numCandidates && new Set(Object.values(ranks)).size === numCandidates;
  const rankOptions = Array.from({ length: numCandidates }, (_, i) => numCandidates - i); // e.g., 5, 4, 3, 2, 1

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-primary-900)]">ตารางคะแนนคนที่ {voterId}</h3>
          <p className="text-xs text-slate-500 mt-1">จัดอันดับผู้สมัคร ({numCandidates} = ชอบที่สุด, 1 = ชอบน้อยที่สุด)</p>
        </div>
        <button
          onClick={onRandomizeSelf}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors shrink-0"
        >
          <Shuffle size={14} />
          สุ่มคนนี้
        </button>
      </div>

      <div className="p-5 flex-1 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-slate-600 border-b border-slate-200 min-w-[120px]">
                ผู้สมัคร
              </th>
              {rankOptions.map(val => (
                <th key={val} className="py-3 px-2 text-center font-semibold text-[var(--color-primary-700)] border-b border-slate-200">
                  <div className="flex flex-col items-center">
                    <span className="text-base">{val}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {val === numCandidates ? 'อันดับ 1' : `อันดับ ${numCandidates - val + 1}`}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map(candidate => (
              <tr key={candidate.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center text-xs font-bold shrink-0">
                      {candidate.id}
                    </div>
                    <span className="truncate">{candidate.name}</span>
                  </div>
                </td>
                {rankOptions.map(val => {
                  const isChecked = ranks[candidate.id] === val;
                  const isValueUsed = Object.values(ranks).includes(val);
                  // Disabled if value used by someone else, to guide user (optional but nice UI), but requirement says user can select and it handles.
                  // We'll let them select and it unchecks the other one automatically in handleRadioChange.
                  return (
                    <td key={val} className="py-3 px-2 text-center">
                      <label className="inline-flex items-center justify-center w-full h-full cursor-pointer">
                        <input
                          type="radio"
                          name={`candidate-${candidate.id}`}
                          value={val}
                          checked={isChecked}
                          onChange={() => handleRadioChange(candidate.id, val)}
                          className="w-4 h-4 text-[var(--color-primary-600)] bg-slate-100 border-slate-300 focus:ring-[var(--color-primary-500)] cursor-pointer"
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Validation Messages */}
        <div className="mt-6">
          {!isComplete && Object.keys(ranks).length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm">
              <AlertTriangle size={16} />
              <span>⚠ กรุณาจัดอันดับผู้สมัครให้ครบทุกคน และอันดับต้องไม่ซ้ำกัน</span>
            </div>
          )}
          {Object.keys(ranks).length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 text-slate-500 rounded-lg text-sm">
              <Info size={16} />
              <span>เลือกระดับคะแนนให้ผู้สมัครแต่ละคน (1 ผู้สมัคร ต่อ 1 คะแนนเท่านั้น)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
