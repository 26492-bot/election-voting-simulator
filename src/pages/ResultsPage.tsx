// ==========================================
// Results Page — 2×2 Comparison Dashboard
// ==========================================

import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  Trophy,
  Users,
  FileCheck,
  FileX,
  BarChart2,
  Printer,
  Download,
  Award,
  Scale,
  Zap,
  GitCompare,
} from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import { computePlurality } from '../algorithms/plurality';
import { computeBorda } from '../algorithms/borda';
import { computeIRV } from '../algorithms/irv';
import { computeCopeland } from '../algorithms/copeland';
import type { PluralityOutput } from '../algorithms/plurality';
import type { BordaOutput } from '../algorithms/borda';
import type { IRVOutput } from '../algorithms/irv';
import type { CopelandOutput } from '../algorithms/copeland';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

// System colors
const SYSTEM_COLORS = {
  plurality: { primary: '#6366f1', bg: '#eef2ff', border: '#c7d2fe', light: '#e0e7ff', text: '#4338ca', label: 'Plurality' },
  borda: { primary: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', light: '#d1fae5', text: '#065f46', label: 'Borda Count' },
  irv: { primary: '#f59e0b', bg: '#fffbeb', border: '#fde68a', light: '#fef3c7', text: '#92400e', label: 'IRV' },
  copeland: { primary: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', light: '#dbeafe', text: '#1e40af', label: "Condorcet / Copeland" },
};

const CHART_COLORS = {
  plurality: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff', '#eef2ff'],
  borda: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
  irv: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb'],
  copeland: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'],
};

export default function ResultsPage() {
  const navigate = useNavigate();
  const { election } = useElection();
  const printRef = useRef<HTMLDivElement>(null);

  // Compute all 4 methods
  const pluralityOutput = useMemo(() => {
    if (!election) return null;
    return computePlurality(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  const bordaOutput = useMemo(() => {
    if (!election) return null;
    return computeBorda(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  const irvOutput = useMemo(() => {
    if (!election) return null;
    return computeIRV(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  const copelandOutput = useMemo(() => {
    if (!election) return null;
    return computeCopeland(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  // Get winners for summary
  const winners = useMemo(() => {
    if (!pluralityOutput || !bordaOutput || !irvOutput || !copelandOutput) return null;
    
    const candidateMap = new Map(election?.candidates.map(c => [c.id, c.name]) ?? []);

    const getWinnerName = (winnerId: string | null, isTie: boolean, tiedIds: string[]): string => {
      if (isTie) return tiedIds.map(id => candidateMap.get(id) ?? id).join(' & ');
      return winnerId ? (candidateMap.get(winnerId) ?? winnerId) : '—';
    };

    return {
      plurality: getWinnerName(pluralityOutput.winner, pluralityOutput.isTie, pluralityOutput.tiedCandidates),
      borda: getWinnerName(bordaOutput.winner, bordaOutput.isTie, bordaOutput.tiedCandidates),
      irv: getWinnerName(irvOutput.winner, irvOutput.isTie, irvOutput.tiedCandidates),
      copeland: getWinnerName(
        copelandOutput.winners[0] ?? null,
        copelandOutput.status === 'tie',
        copelandOutput.winners
      ),
      pluralityTie: pluralityOutput.isTie,
      bordaTie: bordaOutput.isTie,
      irvTie: irvOutput.isTie,
      copelandTie: copelandOutput.status === 'tie',
    };
  }, [pluralityOutput, bordaOutput, irvOutput, copelandOutput, election]);

  // Auto-generated comparison summary text
  const summaryText = useMemo(() => {
    if (!winners) return '';
    
    const allWinners = [winners.plurality, winners.borda, winners.irv, winners.copeland];
    const uniqueWinners = [...new Set(allWinners)];
    
    if (uniqueWinners.length === 1) {
      return `ระบบการเลือกตั้งทั้ง 4 วิธีให้ผู้ชนะคนเดียวกัน คือ ${uniqueWinners[0]}`;
    }
    
    if (uniqueWinners.length === 4) {
      return 'พบว่าระบบการเลือกตั้งทั้ง 4 วิธีให้ผลลัพธ์แตกต่างกันทั้งหมด — แต่ละระบบเลือกผู้ชนะคนละคน';
    }

    // Some match, some different
    const systems = [
      { name: 'Plurality', winner: winners.plurality },
      { name: 'Borda Count', winner: winners.borda },
      { name: 'IRV', winner: winners.irv },
      { name: 'Condorcet/Copeland', winner: winners.copeland },
    ];

    const groups: Record<string, string[]> = {};
    for (const s of systems) {
      if (!groups[s.winner]) groups[s.winner] = [];
      groups[s.winner].push(s.name);
    }

    const parts: string[] = [];
    for (const [winner, systemNames] of Object.entries(groups)) {
      if (systemNames.length > 1) {
        parts.push(`${systemNames.join(' และ ')} ให้ผู้ชนะคนเดียวกัน คือ ${winner}`);
      } else {
        parts.push(`${systemNames[0]} ให้ผู้ชนะเป็น ${winner}`);
      }
    }
    return `พบว่าผลลัพธ์แตกต่างกัน — ${parts.join(' ในขณะที่ ')}`;
  }, [winners]);

  // Print/Export
  const handlePrint = () => {
    window.print();
  };

  if (!election) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-8">
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-primary-800)] mb-2"> เปรียบเทียบผล</h1>
          <p className="text-slate-500 mb-4">กรุณาตั้งค่าการเลือกตั้งก่อน</p>
          <button
            onClick={() => navigate('/setup')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] bg-[var(--color-primary-600)] text-white font-medium text-sm hover:bg-[var(--color-primary-700)] transition-colors"
          >
            <ArrowLeft size={16} />
            ไปตั้งค่า
          </button>
        </div>
      </div>
    );
  }

  const candidateMap = new Map(election.candidates.map(c => [c.id, c.name]));

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm print:shadow-none print:border-b-2 print:border-slate-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors print:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary-950)]">
              เปรียบเทียบผลการเลือกตั้ง
            </h1>
            <p className="text-xs text-slate-500">Comparison Dashboard — ระบบทั้ง 4 วิธี</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors print:hidden"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">พิมพ์ / Export</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors shadow-sm print:hidden"
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </header>

      {/* Main Content — printable area */}
      <main ref={printRef} className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
        {/* ============================== */}
        {/* Summary Panel */}
        {/* ============================== */}
        <div className="mb-6 animate-fade-in">
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ผู้ลงคะแนน</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{election.voterCount}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Users size={14} className="text-slate-400" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">ผู้สมัคร</span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{election.candidates.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ballot สมบูรณ์</span>
              </div>
              <p className="text-2xl font-extrabold text-emerald-600">{pluralityOutput?.totalValidBallots ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <FileX size={14} className="text-amber-500" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ballot ไม่สมบูรณ์</span>
              </div>
              <p className="text-2xl font-extrabold text-amber-600">{pluralityOutput?.invalidBallots ?? 0}</p>
            </div>
          </div>

          {/* Winner Comparison Summary */}
          {winners && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Scale size={18} className="text-[var(--color-primary-600)]" />
                <h2 className="font-bold text-slate-800 text-base">สรุปผลการเปรียบเทียบ</h2>
              </div>

              {/* Winner Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { key: 'plurality' as const, label: 'Plurality', winner: winners.plurality, isTie: winners.pluralityTie },
                  { key: 'borda' as const, label: 'Borda Count', winner: winners.borda, isTie: winners.bordaTie },
                  { key: 'irv' as const, label: 'IRV', winner: winners.irv, isTie: winners.irvTie },
                  { key: 'copeland' as const, label: 'Condorcet', winner: winners.copeland, isTie: winners.copelandTie },
                ].map(item => (
                  <div
                    key={item.key}
                    className="rounded-lg p-3 text-center"
                    style={{ backgroundColor: SYSTEM_COLORS[item.key].bg, border: `1px solid ${SYSTEM_COLORS[item.key].border}` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: SYSTEM_COLORS[item.key].text }}>
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400 mb-1">ผู้ชนะ →</p>
                    <p className="font-bold text-sm text-slate-900 leading-tight">
                      {item.isTie ? `⚠ ${item.winner}` : item.winner}
                    </p>
                  </div>
                ))}
              </div>

              {/* Auto-generated summary text */}
              <div className="bg-slate-50 rounded-lg px-4 py-3 flex items-start gap-2">
                <Zap size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {summaryText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ============================== */}
        {/* 2×2 Grid */}
        {/* ============================== */}
        <div className="comparison-grid grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Card 1: Plurality */}
          <ComparisonCard
            systemKey="plurality"
            title="Plurality Voting"
            subtitle="ระบบเสียงข้างมาก"
            description="นับเฉพาะอันดับ 1 ของแต่ละคน"
            output={pluralityOutput}
            candidateMap={candidateMap}
            renderChart={(output) => {
              const data = output.scores.slice(0, 6);
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={90} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value) => [`${value} เสียง`, 'คะแนน']}
                    />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.plurality[index % CHART_COLORS.plurality.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            }}
            renderRanking={(output) => (
              output.scores.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 py-1">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">{c.rank}</span>
                  <span className="flex-1 text-xs font-medium text-slate-700 truncate">{c.name}</span>
                  <span className="text-xs font-bold text-indigo-600">{c.votes}</span>
                  <span className="text-[10px] text-slate-400 w-12 text-right">{c.percent.toFixed(1)}%</span>
                </div>
              ))
            )}
            getWinnerName={(output) => output.winnerName}
            isTie={(output) => output.isTie}
            getTiedNames={(output) => output.tiedCandidateNames}
          />

          {/* Card 2: Borda Count */}
          <ComparisonCard
            systemKey="borda"
            title="Borda Count"
            subtitle="ระบบรวมคะแนนตามอันดับ"
            description="ให้คะแนนตามลำดับความชอบ"
            output={bordaOutput}
            candidateMap={candidateMap}
            renderChart={(output) => {
              const data = output.scores.slice(0, 6);
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={90} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value) => [`${value} คะแนน`, 'Borda Score']}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                      {data.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.borda[index % CHART_COLORS.borda.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            }}
            renderRanking={(output) => (
              output.scores.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 py-1">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">{c.rank}</span>
                  <span className="flex-1 text-xs font-medium text-slate-700 truncate">{c.name}</span>
                  <span className="text-xs font-bold text-emerald-600">{c.score} คะแนน</span>
                </div>
              ))
            )}
            getWinnerName={(output) => output.winnerName}
            isTie={(output) => output.isTie}
            getTiedNames={(output) => output.tiedCandidateNames}
          />

          {/* Card 3: IRV */}
          <ComparisonCard
            systemKey="irv"
            title="Instant Runoff Voting"
            subtitle="ระบบคัดออกและโอนคะแนน"
            description="คัดผู้ได้คะแนนน้อยสุดออกทีละรอบ"
            output={irvOutput}
            candidateMap={candidateMap}
            renderChart={(output) => {
              if (!output.result || output.result.rounds.length === 0) return null;
              const lastRound = output.result.rounds[output.result.rounds.length - 1].votes;
              const irvData = Object.entries(lastRound)
                .map(([id, votes]) => ({ id, name: candidateMap.get(id) || id, votes: votes as number }))
                .sort((a, b) => b.votes - a.votes);
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={irvData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={90} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      formatter={(value) => [`${value} เสียง`, 'รอบตัดสิน']}
                    />
                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={20}>
                      {irvData.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS.irv[index % CHART_COLORS.irv.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            }}
            renderRanking={(output) => {
              if (!output.result || output.result.rounds.length === 0) return null;
              const lastRound = output.result.rounds[output.result.rounds.length - 1].votes;
              const irvData = Object.entries(lastRound)
                .map(([id, votes]) => ({ id, name: candidateMap.get(id) || id, votes: votes as number }))
                .sort((a, b) => b.votes - a.votes);
              return (
                <>
                  {irvData.map((c, i) => (
                    <div key={c.id} className="flex items-center gap-2 py-1">
                      <span className="w-5 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                      <span className="flex-1 text-xs font-medium text-slate-700 truncate">{c.name}</span>
                      <span className="text-xs font-bold text-amber-600">{c.votes} เสียง</span>
                    </div>
                  ))}
                  <p className="text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-100">
                    ผ่านทั้งหมด {output.result.rounds.length} รอบ
                  </p>
                </>
              );
            }}
            getWinnerName={(output) => output.winnerName}
            isTie={(output) => output.isTie}
            getTiedNames={(output) => output.tiedCandidateNames}
          />

          {/* Card 4: Condorcet / Copeland */}
          <ComparisonCard
            systemKey="copeland"
            title="Condorcet / Copeland's Rule"
            subtitle="ระบบเปรียบเทียบคู่"
            description="เปรียบเทียบตัวต่อตัวทุกคู่"
            output={copelandOutput}
            candidateMap={candidateMap}
            renderChart={(output) => {
              const data = output.scores.slice(0, 6);
              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={90} />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="wins" name="ชนะ" fill="#10b981" stackId="a" barSize={20} />
                    <Bar dataKey="ties" name="เสมอ" fill="#cbd5e1" stackId="a" barSize={20} />
                    <Bar dataKey="losses" name="แพ้" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              );
            }}
            renderRanking={(output) => (
              output.scores.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 py-1">
                  <span className="w-5 text-center text-xs font-bold text-slate-400">{c.rank}</span>
                  <span className="flex-1 text-xs font-medium text-slate-700 truncate">{c.name}</span>
                  <span className="text-[10px] text-emerald-600">{c.wins}W</span>
                  <span className="text-[10px] text-slate-400">{c.ties}D</span>
                  <span className="text-[10px] text-red-500">{c.losses}L</span>
                  <span className="text-xs font-bold text-blue-600">{c.score > 0 ? `+${c.score}` : c.score}</span>
                </div>
              ))
            )}
            getWinnerName={(output) => output.winnerNames[0] ?? null}
            isTie={(output) => output.status === 'tie'}
            getTiedNames={(output) => output.winnerNames}
          />
        </div>

        {/* Print footer */}
        <div className="hidden print:block text-center text-xs text-slate-400 mt-4 pt-4 border-t border-slate-200">
          <p>Election Voting Method Simulator — ระบบจำลองการเลือกตั้งและเปรียบเทียบวิธีการนับคะแนน</p>
          <p className="mt-0.5">⚠ ข้อมูลจำลองสำหรับการศึกษา — ไม่ใช่ข้อมูลการเลือกตั้งจริง</p>
        </div>
      </main>
    </div>
  );
}


// ==========================================
// ComparisonCard — Reusable card for each voting system
// ==========================================

interface ComparisonCardProps<T> {
  systemKey: 'plurality' | 'borda' | 'irv' | 'copeland';
  title: string;
  subtitle: string;
  description: string;
  output: T | null;
  candidateMap: Map<string, string>;
  renderChart: (output: T) => React.ReactNode;
  renderRanking: (output: T) => React.ReactNode;
  getWinnerName: (output: T) => string | null;
  isTie: (output: T) => boolean;
  getTiedNames: (output: T) => string[];
}

function ComparisonCard<T>({
  systemKey,
  title,
  subtitle,
  description,
  output,
  candidateMap,
  renderChart,
  renderRanking,
  getWinnerName,
  isTie,
  getTiedNames,
}: ComparisonCardProps<T>) {
  const colors = SYSTEM_COLORS[systemKey];

  if (!output) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-slate-400">ยังไม่มีข้อมูล</p>
      </div>
    );
  }

  const winnerName = getWinnerName(output);
  const tie = isTie(output);
  const tiedNames = getTiedNames(output);

  return (
    <div
      className="bg-white rounded-xl border shadow-sm overflow-hidden animate-fade-in comparison-card"
      style={{ borderColor: colors.border }}
    >
      {/* Card Header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: colors.bg }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.primary }}
        >
          {systemKey === 'plurality' && <Users size={16} className="text-white" />}
          {systemKey === 'borda' && <BarChart2 size={16} className="text-white" />}
          {systemKey === 'irv' && <Zap size={16} className="text-white" />}
          {systemKey === 'copeland' && <GitCompare size={16} className="text-white" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-slate-900 leading-tight">{title}</h3>
          <p className="text-[10px] text-slate-500">{subtitle} — {description}</p>
        </div>
      </div>

      {/* Winner Banner */}
      <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
        {tie ? (
          <div className="flex items-center gap-2">
            <span className="text-amber-500 text-lg">⚠</span>
            <div>
              <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">ผลเสมอ</p>
              <p className="font-bold text-sm text-slate-900">{tiedNames.join(' & ')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.light }}
            >
              <Trophy size={14} style={{ color: colors.primary }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.text }}>ผู้ชนะ</p>
              <p className="font-bold text-base text-slate-900">{winnerName ?? '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">คะแนน</p>
        <div className="h-[140px] w-full comparison-chart">
          {renderChart(output)}
        </div>
      </div>

      {/* Ranking */}
      <div className="px-4 pb-4 pt-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">อันดับ</p>
        <div className="space-y-0">
          {renderRanking(output)}
        </div>
      </div>
    </div>
  );
}
