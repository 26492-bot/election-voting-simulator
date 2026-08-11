// ==========================================
// RankingCard — Election results ranking panel
// Plurality uses real data; other methods still use mock
// ==========================================

import { Trophy } from 'lucide-react';
import type { VotingMethod } from '../../types';
import { getMockRanking, getScoreLabel, type MockRankEntry } from '../../utils/mockData';

export interface RankEntry {
  rank: number;
  id: string;
  name: string;
  score: number;
  label: string;
}

interface RankingCardProps {
  method: VotingMethod;
  ranking?: RankEntry[];          // optional — override mock
  scoreLabel?: string;            // optional — override mock
  isTie?: boolean;
  tiedCandidateNames?: string[];
}

const RANK_ICONS = ['', '', ''];

const RANK_BG = [
  'bg-amber-50 border-amber-200',
  'bg-slate-50 border-slate-200',
  'bg-orange-50 border-orange-200',
];

export default function RankingCard({ method, ranking, scoreLabel, isTie, tiedCandidateNames }: RankingCardProps) {
  // Use provided ranking (real data) or fall back to mock
  const entries = ranking ?? getMockRanking(method);
  const label = scoreLabel ?? getScoreLabel(method);

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)]">
        <div className="flex items-center gap-2 text-white">
          <Trophy size={18} />
          <div>
            <h3 className="font-semibold text-sm"> ผลการเลือกตั้ง</h3>
            <p className="text-[11px] text-primary-200 opacity-75">Ranking</p>
          </div>
        </div>
        <div className="mt-2 px-2.5 py-1 bg-white/15 rounded-md inline-block">
          <p className="text-[10px] text-white/80 font-medium">{label}</p>
        </div>
      </div>

      {/* Tie Notice */}
      {isTie && tiedCandidateNames && tiedCandidateNames.length > 0 && (
        <div className="mx-4 mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 font-medium">
            ⚠ เสมอ: {tiedCandidateNames.join(', ')}
          </p>
        </div>
      )}

      {/* Rankings */}
      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">ยังไม่มีข้อมูล</p>
          </div>
        ) : (
          entries.map((entry) => (
            <RankItem key={entry.id} entry={entry} isTiedWinner={isTie === true && entry.rank === 1} />
          ))
        )}
      </div>
    </div>
  );
}

function RankItem({ entry, isTiedWinner }: { entry: RankEntry; isTiedWinner?: boolean }) {
  const isTop3 = entry.rank <= 3;
  const icon = RANK_ICONS[entry.rank - 1];

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm ${
        isTiedWinner
          ? 'bg-amber-50 border-amber-200'
          : isTop3
          ? RANK_BG[entry.rank - 1]
          : 'bg-white border-slate-100 hover:border-slate-200'
      }`}
    >
      {/* Rank Badge */}
      <div className="shrink-0 w-9 h-9 flex items-center justify-center">
        {isTop3 ? (
          <span className="text-xl">{icon}</span>
        ) : (
          <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
            {entry.rank}
          </span>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${
          isTiedWinner ? 'text-amber-800' : entry.rank === 1 ? 'text-amber-800' : 'text-slate-700'
        }`}>
          {entry.name}
        </p>
        <p className="text-[11px] text-slate-400 truncate">{entry.label}</p>
      </div>

      {/* Score */}
      <div className="shrink-0 text-right">
        <span className={`text-sm font-bold ${
          isTiedWinner ? 'text-amber-600' : entry.rank === 1 ? 'text-amber-600' : 'text-slate-600'
        }`}>
          {entry.score}
        </span>
      </div>
    </div>
  );
}
