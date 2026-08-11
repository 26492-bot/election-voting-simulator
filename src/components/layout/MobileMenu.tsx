// ==========================================
// MobileMenu — Hamburger menu for mobile/tablet
// ==========================================

import { useState } from 'react';
import {
  Menu,
  X,
  BarChart3,
  ListOrdered,
  IterationCcw,
  GitCompareArrows,
  Settings,
  FileSpreadsheet,
  Trophy,
} from 'lucide-react';
import type { VotingMethod } from '../../types';

interface MobileMenuProps {
  currentMethod: VotingMethod;
  onMethodChange: (method: VotingMethod) => void;
  onNavigate: (path: string) => void;
}

interface MethodItem {
  id: VotingMethod;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

const METHODS: MethodItem[] = [
  { id: 'plurality', title: 'Plurality Voting', subtitle: 'ระบบเสียงข้างมาก', icon: <BarChart3 size={18} /> },
  { id: 'borda', title: 'Borda Count', subtitle: 'ระบบรวมคะแนนตามอันดับ', icon: <ListOrdered size={18} /> },
  { id: 'irv', title: 'IRV', subtitle: 'ระบบคัดออกและโอนคะแนน', icon: <IterationCcw size={18} /> },
  { id: 'condorcet', title: 'Condorcet', subtitle: 'ระบบเปรียบเทียบคู่', icon: <GitCompareArrows size={18} /> },
];

export default function MobileMenu({ currentMethod, onMethodChange, onNavigate }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMethodChange = (method: VotingMethod) => {
    onMethodChange(method);
    setIsOpen(false);
  };

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[var(--color-surface-dark)] text-white px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🗳</span>
          <div>
            <h1 className="text-sm font-bold tracking-wide">ELECTION SIMULATOR</h1>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 w-72 h-full bg-[var(--color-surface-dark)] text-white shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🗳</span>
            <div>
              <h1 className="text-sm font-bold">ELECTION SIMULATOR</h1>
              <p className="text-[10px] text-slate-500">ระบบจำลองการเลือกตั้ง</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mx-4 border-t border-white/10 my-2" />

        {/* Methods */}
        <div className="px-3 py-2">
          <p className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
            วิธีการนับคะแนน
          </p>
          <nav className="space-y-1">
            {METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => handleMethodChange(m.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  currentMethod === m.id
                    ? 'bg-[var(--color-primary-600)] text-white'
                    : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  currentMethod === m.id ? 'bg-white/20' : 'bg-white/5'
                }`}>
                  {m.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-[11px] opacity-60">{m.subtitle}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="mx-4 border-t border-white/10 my-2" />

        {/* Navigation */}
        <div className="px-3 py-2 space-y-1">
          <button onClick={() => handleNavigate('/results')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <Trophy size={16} /><span className="text-sm">เปรียบเทียบผล</span>
          </button>
          <button onClick={() => handleNavigate('/ballots/all')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <FileSpreadsheet size={16} /><span className="text-sm">ข้อมูล Ballot</span>
          </button>
          <button onClick={() => handleNavigate('/setup')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/8 transition-all">
            <Settings size={16} /><span className="text-sm">ตั้งค่า</span>
          </button>
        </div>
      </div>
    </>
  );
}
