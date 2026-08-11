// ==========================================
// Dashboard Page — Main election analysis dashboard
// Plurality, Borda, IRV, and Copeland use real algorithms
// ==========================================

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  Percent,
  Settings,
  ClipboardList,
  ChevronRight,
} from 'lucide-react';
import type { VotingMethod } from '../types';
import { useElection } from '../context/ElectionContext';
import { MOCK_STATS, getMockWinner } from '../utils/mockData';
import { computePlurality } from '../algorithms/plurality';
import { computeBorda } from '../algorithms/borda';
import { computeIRV } from '../algorithms/irv';
import { computeCopeland } from '../algorithms/copeland';
import type { RankEntry } from '../components/dashboard/RankingCard';

// Layout
import Sidebar from '../components/layout/Sidebar';
import MobileMenu from '../components/layout/MobileMenu';

// Dashboard components
import StatCard from '../components/dashboard/StatCard';
import ExplanationPanel from '../components/dashboard/ExplanationPanel';
import RankingCard from '../components/dashboard/RankingCard';

// Charts
import PluralityChart from '../components/charts/PluralityChart';
import BordaChart from '../components/charts/BordaChart';
import IRVChart from '../components/charts/IRVChart';
import CondorcetMatrix from '../components/charts/CondorcetMatrix';

const METHOD_TITLES: Record<VotingMethod, { th: string; en: string }> = {
  plurality: { th: 'ระบบเสียงข้างมาก', en: 'Plurality Voting' },
  borda: { th: 'ระบบรวมคะแนนตามอันดับ', en: 'Borda Count' },
  irv: { th: 'ระบบคัดออกและโอนคะแนน', en: 'Instant Runoff Voting (IRV)' },
  condorcet: { th: 'ระบบเปรียบเทียบคู่', en: 'Condorcet Method — Copeland\'s Rule' },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { election, currentMethod, setCurrentMethod } = useElection();
  const [method, setMethod] = useState<VotingMethod>(currentMethod);

  const handleMethodChange = (m: VotingMethod) => {
    setMethod(m);
    setCurrentMethod(m);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  // ---------- Plurality: Real computation ----------
  const pluralityOutput = useMemo(() => {
    if (!election) return null;
    return computePlurality(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  // ---------- Borda: Real computation ----------
  const bordaOutput = useMemo(() => {
    if (!election) return null;
    return computeBorda(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  // ---------- IRV: Real computation ----------
  const irvOutput = useMemo(() => {
    if (!election) return null;
    return computeIRV(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  // ---------- Copeland: Real computation ----------
  const copelandOutput = useMemo(() => {
    if (!election) return null;
    return computeCopeland(election.ballots, election.candidates, election.voterCount);
  }, [election]);

  // ---------- Stats ----------
  const stats = election
    ? {
        voterCount: election.voterCount,
        candidateCount: election.candidates.length,
        ballotCount: election.ballots.length,
        turnout:
          election.voterCount > 0
            ? Math.round((election.ballots.length / election.voterCount) * 100)
            : 0,
      }
    : MOCK_STATS;

  // ---------- Winner text ----------
  const title = METHOD_TITLES[method];

  const getWinnerText = (): string => {
    if (method === 'plurality' && pluralityOutput) {
      if (pluralityOutput.isTie) return `⚠️ เสมอ: ${pluralityOutput.tiedCandidateNames.join(', ')}`;
      return pluralityOutput.winnerName ?? 'ยังไม่มีข้อมูล';
    }
    if (method === 'borda' && bordaOutput) {
      if (bordaOutput.isTie) return `⚠️ เสมอ: ${bordaOutput.tiedCandidateNames.join(', ')}`;
      return bordaOutput.winnerName ?? 'ยังไม่มีข้อมูล';
    }
    if (method === 'irv' && irvOutput) {
      if (irvOutput.isTie) return `⚠️ เสมอ: ${irvOutput.tiedCandidateNames.join(', ')}`;
      return irvOutput.winnerName ?? 'ยังไม่มีข้อมูล';
    }
    if (method === 'condorcet' && copelandOutput) {
      if (copelandOutput.status === 'tie') return `⚠️ เสมอ: ${copelandOutput.winnerNames.join(', ')}`;
      return copelandOutput.winnerNames[0] ?? 'ยังไม่มีข้อมูล';
    }
    // Fallback
    return getMockWinner(method);
  };

  // ---------- Ranking entries ----------
  const currentRanking: RankEntry[] | undefined = useMemo(() => {
    if (method === 'plurality' && pluralityOutput) {
      return pluralityOutput.scores.map(s => ({
        rank: s.rank,
        id: s.id,
        name: s.name,
        score: s.votes,
        label: `${s.votes} votes (${s.percent.toFixed(1)}%)`,
      }));
    }
    if (method === 'borda' && bordaOutput) {
      return bordaOutput.scores.map(s => ({
        rank: s.rank,
        id: s.id,
        name: s.name,
        score: s.score,
        label: `Borda Score: ${s.score}`,
      }));
    }
    if (method === 'irv' && irvOutput && irvOutput.result.rounds.length > 0) {
      const finalRound = irvOutput.result.rounds[irvOutput.result.rounds.length - 1];
      const sorted = Object.entries(finalRound.votes)
        .map(([id, votes]) => ({ id, votes }))
        .sort((a, b) => b.votes - a.votes);
      
      const candidateMap = new Map(election?.candidates.map(c => [c.id, c.name]));
      
      return sorted.map((s, i) => ({
        rank: i + 1,
        id: s.id,
        name: candidateMap.get(s.id) ?? s.id,
        score: s.votes,
        label: `Final Votes: ${s.votes}`,
      }));
    }
    if (method === 'condorcet' && copelandOutput) {
      return copelandOutput.scores.map(s => ({
        rank: s.rank,
        id: s.id,
        name: s.name,
        score: s.score,
        label: `ชนะ ${s.wins} / แพ้ ${s.losses} / เสมอ ${s.ties}`,
      }));
    }
    return undefined;
  }, [method, pluralityOutput, bordaOutput, irvOutput, copelandOutput, election]);

  const isCurrentTie = 
    method === 'plurality' ? pluralityOutput?.isTie : 
    method === 'borda' ? bordaOutput?.isTie : 
    method === 'irv' ? irvOutput?.isTie : 
    method === 'condorcet' ? copelandOutput?.status === 'tie' : undefined;

  const currentTiedCandidates = 
    method === 'plurality' ? pluralityOutput?.tiedCandidateNames : 
    method === 'borda' ? bordaOutput?.tiedCandidateNames : 
    method === 'irv' ? irvOutput?.tiedCandidateNames : 
    method === 'condorcet' && copelandOutput?.status === 'tie' ? copelandOutput?.winnerNames : undefined;

  return (
    <div className="flex min-h-screen bg-[var(--color-surface)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          currentMethod={method}
          onMethodChange={handleMethodChange}
          onNavigate={handleNavigate}
        />
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        currentMethod={method}
        onMethodChange={handleMethodChange}
        onNavigate={handleNavigate}
      />

      {/* Main Content + Ranking Panel */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0">
        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8 overflow-y-auto">
          {/* Page Header */}
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 text-[var(--color-primary-500)] text-sm font-medium mb-1">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse-soft" />
              กำลังแสดงผลลัพธ์
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-primary-950)]">
              📊 {title.th}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{title.en}</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 stagger-children">
            <StatCard
              icon={<Users size={20} />}
              title="ผู้มีสิทธิเลือกตั้ง"
              subtitle="Number of Voters"
              value={stats.voterCount}
              unit="คน"
              color="var(--color-primary-500)"
            />
            <StatCard
              icon={<UserCheck size={20} />}
              title="จำนวนผู้สมัคร"
              subtitle="Candidates"
              value={stats.candidateCount}
              unit="คน"
              color="#8b5cf6"
            />
            <StatCard
              icon={<FileText size={20} />}
              title="จำนวนบัตรลงคะแนน"
              subtitle={method === 'condorcet' ? 'Pairwise Matches' : 'Ballots'}
              value={method === 'condorcet' ? copelandOutput?.totalPairwiseMatches || 0 : stats.ballotCount}
              unit={method === 'condorcet' ? 'คู่' : 'ใบ'}
              color="#10b981"
            />
            <StatCard
              icon={<Percent size={20} />}
              title="อัตราการลงคะแนน"
              subtitle="Turnout"
              value={stats.turnout}
              unit="%"
              color="#f59e0b"
            />
          </div>

          {/* Winner Banner */}
          <div className={`mb-6 rounded-[var(--radius-card)] p-4 text-white shadow-lg animate-fade-in ${
            isCurrentTie
              ? 'bg-gradient-to-r from-amber-500 to-amber-700'
              : 'bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl backdrop-blur-sm">
                {isCurrentTie ? '⚠️' : '🏆'}
              </div>
              <div>
                <p className="text-sm text-white/70">
                  {isCurrentTie
                    ? `ผลการเลือกตั้ง (${title.en})`
                    : `ผู้ชนะการเลือกตั้ง (${title.en})`
                  }
                </p>
                <p className="text-lg font-bold">{getWinnerText()}</p>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="mb-6">
            <ChartView method={method} pluralityOutput={pluralityOutput} bordaOutput={bordaOutput} irvOutput={irvOutput} copelandOutput={copelandOutput} />
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <ExplanationPanel method={method} />
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => navigate('/setup')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-button)] border border-slate-300 text-slate-600 font-medium text-sm hover:bg-white hover:shadow-sm active:scale-[0.98] transition-all"
            >
              <Settings size={16} />
              ⚙️ ตั้งค่าการเลือกตั้ง
            </button>
            <button
              onClick={() => navigate('/ballots')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-button)] bg-[var(--color-primary-600)] text-white font-medium text-sm hover:bg-[var(--color-primary-700)] shadow-[var(--shadow-button)] active:scale-[0.98] transition-all"
            >
              <ClipboardList size={16} />
              📋 ตารางคะแนน
              <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* Ranking Panel (Right Side) */}
        <aside className="w-full lg:w-[280px] shrink-0 p-4 sm:p-6 lg:p-0 lg:pr-6 lg:py-8">
          <div className="lg:sticky lg:top-8">
            <RankingCard
              method={method}
              ranking={currentRanking}
              scoreLabel={
                method === 'plurality' ? 'First Preference Votes' : 
                method === 'borda' ? 'Borda Score' : 
                method === 'irv' ? 'Final Round Votes' : 
                method === 'condorcet' ? 'Copeland Score' : undefined
              }
              isTie={isCurrentTie}
              tiedCandidateNames={currentTiedCandidates}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// Chart View — Renders the appropriate chart based on method
// ==========================================

import type { PluralityOutput } from '../algorithms/plurality';
import type { BordaOutput } from '../algorithms/borda';
import type { IRVOutput } from '../algorithms/irv';
import type { CopelandOutput } from '../algorithms/copeland';

function ChartView({ method, pluralityOutput, bordaOutput, irvOutput, copelandOutput }: { method: VotingMethod; pluralityOutput: PluralityOutput | null, bordaOutput: BordaOutput | null, irvOutput: IRVOutput | null, copelandOutput: CopelandOutput | null }) {
  switch (method) {
    case 'plurality':
      return pluralityOutput ? (
        <PluralityChart
          scores={pluralityOutput.scores}
          isTie={pluralityOutput.isTie}
          tiedCandidateNames={pluralityOutput.tiedCandidateNames}
          totalValidBallots={pluralityOutput.totalValidBallots}
        />
      ) : (
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center">
          <p className="text-slate-500">ยังไม่มีข้อมูล — กรุณาตั้งค่าและกรอก Ballot ก่อน</p>
        </div>
      );
    case 'borda':
      return bordaOutput ? (
        <BordaChart
          scores={bordaOutput.scores}
          isTie={bordaOutput.isTie}
          tiedCandidateNames={bordaOutput.tiedCandidateNames}
          totalValidBallots={bordaOutput.totalValidBallots}
        />
      ) : (
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center">
          <p className="text-slate-500">ยังไม่มีข้อมูล — กรุณาตั้งค่าและกรอก Ballot ก่อน</p>
        </div>
      );
    case 'irv':
      return irvOutput ? (
        <IRVChart output={irvOutput} />
      ) : (
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center">
          <p className="text-slate-500">ยังไม่มีข้อมูล — กรุณาตั้งค่าและกรอก Ballot ก่อน</p>
        </div>
      );
    case 'condorcet':
      return copelandOutput ? (
        <CondorcetMatrix output={copelandOutput} />
      ) : (
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center">
          <p className="text-slate-500">ยังไม่มีข้อมูล — กรุณาตั้งค่าและกรอก Ballot ก่อน</p>
        </div>
      );
  }
}
