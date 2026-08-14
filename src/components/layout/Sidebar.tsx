// ==========================================
// Sidebar — Voting method navigation
// ==========================================

import {
  BarChart3,
  ListOrdered,
  IterationCcw,
  GitCompareArrows,
  Settings,
  FileSpreadsheet,
  Trophy,
  Home,
  LogOut,
} from 'lucide-react';
import type { VotingMethod } from '../../types';

interface SidebarProps {
  currentMethod: VotingMethod;
  onMethodChange: (method: VotingMethod) => void;
  onNavigate: (path: string) => void;
}

interface MethodItem {
  id: VotingMethod;
  number: string;
  title: string;
  subtitle: string;
  color: string;
  activeBg: string;
}

const METHODS: MethodItem[] = [
  {
    id: 'plurality',
    number: '①',
    title: 'Plurality Voting',
    subtitle: 'ระบบเสียงข้างมาก',
    color: 'text-blue-600',
    activeBg: 'from-blue-500 to-blue-600',
  },
  {
    id: 'borda',
    number: '②',
    title: 'Borda Count',
    subtitle: 'ระบบรวมคะแนนตามอันดับ',
    color: 'text-emerald-600',
    activeBg: 'from-emerald-500 to-emerald-600',
  },
  {
    id: 'irv',
    number: '③',
    title: 'Instant Runoff (IRV)',
    subtitle: 'ระบบคัดออกและโอนคะแนน',
    color: 'text-orange-600',
    activeBg: 'from-orange-500 to-orange-600',
  },
  {
    id: 'condorcet',
    number: '④',
    title: 'Condorcet Method',
    subtitle: 'ระบบเปรียบเทียบคู่\nCopeland\'s Rule',
    color: 'text-purple-600',
    activeBg: 'from-purple-500 to-purple-600',
  },
];

export default function Sidebar({ currentMethod, onMethodChange, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[240px] shrink-0 bg-[var(--color-surface-dark)] text-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center shadow-lg">
            <span className="text-lg">🗳</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">ELECTION</h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-widest">SIMULATOR</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Method Menu */}
      <div className="px-3 pt-4 pb-2">
        <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          วิธีการนับคะแนน
        </p>
        <nav className="space-y-1.5">
          {METHODS.map((m) => {
            const isActive = currentMethod === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onMethodChange(m.id)}
                className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? `bg-gradient-to-r ${m.activeBg} shadow-lg shadow-black/20`
                    : 'hover:bg-white/8 active:bg-white/12'
                }`}
              >
                <div className="min-w-0 flex-1 pl-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-base font-serif font-bold ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{m.number}</span>
                    <span className={`text-[13px] font-semibold truncate ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}>
                      {m.title}
                    </span>
                  </div>
                  {m.subtitle.split('\n').map((line, i) => (
                    <p key={i} className={`text-[11px] ${
                      isActive ? 'text-white/70' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {line}
                    </p>
                  ))}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Divider */}
      <div className="mx-4 border-t border-white/10" />

      {/* Bottom Actions */}
      <div className="px-3 py-4 space-y-1">
        <button
          onClick={() => onNavigate('/results')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <Trophy size={16} />
          <span className="text-[13px]">เปรียบเทียบผล</span>
        </button>
        <button
          onClick={() => onNavigate('/ballots/all')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <FileSpreadsheet size={16} />
          <span className="text-[13px]">ข้อมูล Ballot</span>
        </button>
        <button
          onClick={() => onNavigate('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-200"
        >
          <Settings size={16} />
          <span className="text-[13px]">ตั้งค่า</span>
        </button>
      </div>
    </aside>
  );
}
