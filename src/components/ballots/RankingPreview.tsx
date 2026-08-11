// ==========================================
// RankingPreview — Live preview of a single ballot's ranking
// ==========================================

import { Trophy } from 'lucide-react';
import type { Candidate } from '../../types';

interface RankingPreviewProps {
  ranking: string[] | null;
  candidates: Candidate[];
}

const RANK_ICONS = ['', '', ''];

export default function RankingPreview({ ranking, candidates }: RankingPreviewProps) {
  if (!ranking || ranking.length !== candidates.length) {
    return (
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-6 flex flex-col items-center justify-center text-center h-full animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
          <Trophy size={32} />
        </div>
        <p className="text-slate-500 font-medium">ยังจัดอันดับไม่ครบ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณากรอกคะแนนในตารางให้สมบูรณ์</p>
      </div>
    );
  }

  // Map ranking IDs back to Candidate objects
  const rankedCandidates = ranking.map(id => candidates.find(c => c.id === id)!);
  const numCandidates = candidates.length;

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden flex flex-col h-full animate-fade-in">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <h3 className="font-bold text-amber-900">สรุปการจัดอันดับของคนปัจจุบัน</h3>
        <p className="text-xs text-amber-700 mt-0.5">Ranking Preview</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-2">
        <h4 className="text-sm font-semibold text-slate-700 mb-3 border-b pb-2">ลำดับการเลือก:</h4>
        
        {rankedCandidates.map((candidate, idx) => {
          const isTop3 = idx < 3;
          const icon = isTop3 ? RANK_ICONS[idx] : null;
          const score = numCandidates - idx;
          
          return (
            <div key={candidate.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${
              idx === 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="w-6 text-center shrink-0">
                {icon ? (
                  <span className="text-lg">{icon}</span>
                ) : (
                  <span className="text-sm font-bold text-slate-400">{idx + 1}.</span>
                )}
              </div>
              <div className="flex-1 font-medium text-slate-700 text-sm truncate">
                {candidate.name}
              </div>
              <div className="text-xs font-semibold text-[var(--color-primary-600)] shrink-0 bg-[var(--color-primary-100)] px-2 py-0.5 rounded-md">
                {score} คะแนน
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
        <p className="text-xs text-slate-500 font-medium mb-1">ข้อมูล Ballot:</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {ranking.map((id, idx) => (
            <span key={id} className="inline-flex items-center">
              <span className="w-6 h-6 rounded bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center text-xs font-bold border border-[var(--color-primary-200)]">
                {id}
              </span>
              {idx < ranking.length - 1 && (
                <span className="text-slate-400 mx-1 text-xs font-bold">→</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
