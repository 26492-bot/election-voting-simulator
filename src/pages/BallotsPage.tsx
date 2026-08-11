// ==========================================
// Ballots Page — Single voter ballot entry
// ==========================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Dices, ChevronLeft, ChevronRight, Save, LayoutDashboard, User, TableProperties } from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import { generateRandomBallots, generateRandomBallot } from '../utils/ballotGenerator';
import type { Ballot } from '../types';

// Components
import VoterList from '../components/ballots/VoterList';
import BallotEditor from '../components/ballots/BallotEditor';
import RankingPreview from '../components/ballots/RankingPreview';
import AllBallotsTable from '../components/ballots/AllBallotsTable';

type ViewMode = 'individual' | 'all';

export default function BallotsPage() {
  const navigate = useNavigate();
  const { election, updateBallot, updateBallots } = useElection();

  // State
  const [currentVoterId, setCurrentVoterId] = useState<number>(1);
  const [currentRanking, setCurrentRanking] = useState<string[] | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('individual');

  // If no election data, redirect to setup
  useEffect(() => {
    if (!election) {
      navigate('/setup');
    }
  }, [election, navigate]);

  if (!election) return null;

  const { voterCount, candidates, ballots } = election;

  // Load voter's existing ballot when selected voter changes
  useEffect(() => {
    const existingBallot = ballots.find(b => b.voterId === currentVoterId);
    if (existingBallot) {
      setCurrentRanking(existingBallot.ranking);
    } else {
      setCurrentRanking(null);
    }
  }, [currentVoterId, ballots]);

  const handleRankingChange = (ranking: string[] | null) => {
    setCurrentRanking(ranking);
  };

  const handleSave = () => {
    if (currentRanking && currentRanking.length === candidates.length) {
      const newBallot: Ballot = {
        voterId: currentVoterId,
        ranking: currentRanking,
      };
      updateBallot(newBallot);
    }
  };

  const handleRandomizeAll = () => {
    const newBallots = generateRandomBallots(voterCount, candidates);
    updateBallots(newBallots);
  };

  const handleRandomizeSelf = () => {
    const randomBallot = generateRandomBallot(currentVoterId, candidates);
    setCurrentRanking(randomBallot.ranking);
    // Don't auto-save, let user save manually as requested
  };

  const handleNext = () => {
    if (currentVoterId < voterCount) {
      setCurrentVoterId(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentVoterId > 1) {
      setCurrentVoterId(prev => prev - 1);
    }
  };

  const handleSelectVoterFromTable = (voterId: number) => {
    setCurrentVoterId(voterId);
    setViewMode('individual');
  };

  const isSaveEnabled = currentRanking !== null && currentRanking.length === candidates.length;
  const isSaved = ballots.some(b => b.voterId === currentVoterId && JSON.stringify(b.ranking) === JSON.stringify(currentRanking));

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary-950)] flex items-center gap-2">
               ตารางการให้คะแนนของผู้มีสิทธิเลือกตั้ง
            </h1>
            <p className="text-xs text-slate-500">Voter Preference</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-1 sm:mr-2">
            <button
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'individual'
                  ? 'bg-white text-[var(--color-primary-700)] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">รายบุคคล</span>
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                viewMode === 'all'
                  ? 'bg-white text-[var(--color-primary-700)] shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <TableProperties size={16} />
              <span className="hidden sm:inline">ตารางรวม</span>
            </button>
          </div>

          <button
            onClick={handleRandomizeAll}
            className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-sm font-semibold hover:bg-amber-100 transition-colors shadow-sm shrink-0"
          >
            <Dices size={16} />
            สุ่มคะแนนทั้งหมด
          </button>
          <button
            onClick={handleRandomizeAll}
            className="lg:hidden inline-flex items-center justify-center p-2 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-sm shrink-0"
            title="สุ่มคะแนนทั้งหมด"
          >
            <Dices size={18} />
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors shadow-sm shrink-0"
          >
            <LayoutDashboard size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">กลับ</span>
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6 lg:h-[calc(100vh-80px)]">
          
          {viewMode === 'individual' ? (
            <>
              {/* Left Sidebar - Voter List */}
              <aside className="w-full lg:w-64 shrink-0 lg:h-full lg:overflow-hidden order-2 lg:order-1">
                <VoterList 
                  voterCount={voterCount}
                  ballots={ballots}
                  selectedVoterId={currentVoterId}
                  onSelectVoter={setCurrentVoterId}
                />
              </aside>

              {/* Center - Ballot Editor */}
              <section className="flex-1 min-w-0 lg:h-full lg:overflow-hidden order-1 lg:order-2 flex flex-col">
                <div className="flex-1 min-h-[400px]">
                  <BallotEditor
                    voterId={currentVoterId}
                    candidates={candidates}
                    initialRanking={currentRanking}
                    onRankingChange={handleRankingChange}
                    onRandomizeSelf={handleRandomizeSelf}
                  />
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 sm:mt-6 bg-[var(--color-surface-card)] p-4 rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 animate-fade-in-up">
                  <button
                    onClick={handlePrev}
                    disabled={currentVoterId === 1}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                    <span className="hidden sm:inline">คนก่อนหน้า</span>
                    <span className="sm:hidden">ก่อนหน้า</span>
                  </button>

                  <button
                    onClick={handleSave}
                    disabled={!isSaveEnabled || isSaved}
                    className={`inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all ${
                      isSaved
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : isSaveEnabled
                        ? 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)] shadow-[var(--shadow-button)] active:scale-[0.98]'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Save size={16} />
                        บันทึกแล้ว
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        บันทึกคะแนน
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={currentVoterId === voterCount}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="hidden sm:inline">คนถัดไป</span>
                    <span className="sm:hidden">ถัดไป</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </section>

              {/* Right Sidebar - Preview */}
              <aside className="w-full lg:w-[280px] shrink-0 lg:h-full lg:overflow-hidden order-3">
                <RankingPreview 
                  ranking={currentRanking}
                  candidates={candidates}
                />
              </aside>
            </>
          ) : (
            /* All Ballots View */
            <section className="flex-1 min-w-0 lg:h-full lg:overflow-hidden order-1">
              <AllBallotsTable 
                voterCount={voterCount}
                candidates={candidates}
                ballots={ballots}
                onSelectVoter={handleSelectVoterFromTable}
              />
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
