// ==========================================
// Settings Page — /settings
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Users,
  UserPlus,
  Trash2,
  AlertCircle,
  Save,
  CheckCircle2,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import type { Candidate } from '../types';
import { generateCandidateId } from '../utils/ballotGenerator';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { election, updateCandidates, updateVoterCount, clearBallots, resetElection } = useElection();

  // If no election data, redirect to setup
  useEffect(() => {
    if (!election) {
      navigate('/setup');
    }
  }, [election, navigate]);

  // Form state
  const [voterCount, setVoterCount] = useState<number>(election?.voterCount || 10);
  const [candidates, setCandidates] = useState<Candidate[]>(election?.candidates || []);

  // Validation state
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaved, setIsSaved] = useState(false);

  // Modals state
  const [showClearBallotsConfirm, setShowClearBallotsConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (election) {
      setVoterCount(election.voterCount);
      setCandidates(election.candidates);
    }
  }, [election]);

  const validate = useCallback((): string[] => {
    const errs: string[] = [];

    if (voterCount < 2) {
      errs.push('จำนวนผู้มีสิทธิเลือกตั้งต้องมีอย่างน้อย 2 คน');
    }
    if (voterCount > 100000) {
      errs.push('จำนวนผู้มีสิทธิเลือกตั้งไม่ควรเกิน 100,000 คน');
    }
    if (candidates.length < 2) {
      errs.push('จำนวนผู้สมัครต้องมีอย่างน้อย 2 คน');
    }
    if (candidates.length > 26) {
      errs.push('จำนวนผู้สมัครไม่ควรเกิน 26 คน');
    }

    const trimmedNames = candidates.map(c => c.name.trim());
    const hasEmpty = trimmedNames.some(n => n === '');
    if (hasEmpty) {
      errs.push('กรุณากรอกชื่อผู้สมัครให้ครบทุกคน');
    }

    const nameSet = new Set(trimmedNames.filter(n => n !== ''));
    if (nameSet.size < trimmedNames.filter(n => n !== '').length) {
      errs.push('ชื่อผู้สมัครห้ามซ้ำกัน');
    }

    return errs;
  }, [voterCount, candidates]);

  const handleCandidateNameChange = (id: string, name: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, name } : c));
    setIsSaved(false);
  };

  const handleAddCandidate = () => {
    if (candidates.length >= 26) return;
    const existingIds = new Set(candidates.map(c => c.id));
    let nextIndex = 0;
    while (existingIds.has(generateCandidateId(nextIndex))) {
      nextIndex++;
    }
    const newId = generateCandidateId(nextIndex);
    setCandidates(prev => [...prev, { id: newId, name: `Candidate ${newId}` }]);
    setIsSaved(false);
  };

  const handleDeleteCandidate = (id: string) => {
    if (candidates.length <= 2) {
      setErrors(['จำนวนผู้สมัครต้องมีอย่างน้อย 2 คน']);
      return;
    }
    setCandidates(prev => prev.filter(c => c.id !== id));
    setIsSaved(false);
  };

  const handleSave = () => {
    const validationErrors = validate();
    setErrors(validationErrors);

    if (validationErrors.length > 0) return;

    updateVoterCount(voterCount);
    const cleanedCandidates = candidates.map(c => ({ ...c, name: c.name.trim() }));
    updateCandidates(cleanedCandidates);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleClearBallots = () => {
    clearBallots();
    setShowClearBallotsConfirm(false);
  };

  const handleReset = () => {
    resetElection();
    setShowResetConfirm(false);
  };

  if (!election) return null;

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
              ตั้งค่าการเลือกตั้ง
            </h1>
            <p className="text-xs text-slate-500">Election Settings</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-4 animate-fade-in">
              <div className="flex items-start gap-2">
                <AlertCircle size={18} className="text-[var(--color-error)] mt-0.5 shrink-0" />
                <div className="space-y-1">
                  {errors.map((err, i) => (
                    <p key={i} className="text-sm text-red-700">{err}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Election Settings */}
          <section className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Settings size={18} className="text-slate-500" />
                การตั้งค่าการเลือกตั้ง
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-2 max-w-md">
                <label className="block text-sm font-bold text-slate-700">
                  จำนวนผู้มีสิทธิเลือกตั้ง
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={100000}
                    value={voterCount}
                    onChange={e => {
                      setVoterCount(Math.max(0, parseInt(e.target.value) || 0));
                      setIsSaved(false);
                    }}
                    className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-slate-300 bg-white text-slate-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-[var(--color-primary-400)] transition-all duration-200"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    คน
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Candidates Settings */}
          <section className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={18} className="text-slate-500" />
                ผู้สมัคร ({candidates.length})
              </h2>
              <button
                onClick={handleAddCandidate}
                disabled={candidates.length >= 26}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded-lg hover:bg-[var(--color-primary-100)] disabled:opacity-50 transition-colors"
              >
                <UserPlus size={16} />
                เพิ่มผู้สมัคร
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {candidates.map(candidate => (
                  <div key={candidate.id} className="flex items-center gap-2">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-primary-100)] flex items-center justify-center text-[var(--color-primary-700)] font-bold text-sm">
                      {candidate.id}
                    </div>
                    <input
                      type="text"
                      value={candidate.name}
                      onChange={e => handleCandidateNameChange(candidate.id, e.target.value)}
                      className="flex-1 px-3 py-2.5 rounded-[var(--radius-input)] border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] transition-all"
                    />
                    <button
                      onClick={() => handleDeleteCandidate(candidate.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="ลบผู้สมัคร"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--color-primary-600)] text-white font-semibold text-sm hover:bg-[var(--color-primary-700)] transition-colors"
              >
                {isSaved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                {isSaved ? 'บันทึกแล้ว' : 'บันทึกการเปลี่ยนแปลง'}
              </button>
            </div>
          </section>

          {/* Voting Methods Settings */}
          <section className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800">วิธีการเลือกตั้งที่รองรับ</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Plurality Voting', 'Borda Count', 'Instant Runoff Voting', "Condorcet Method (Copeland's)"].map((method, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-emerald-200 bg-emerald-50 rounded-xl">
                    <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-full">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-medium text-emerald-800 text-sm">{method}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 overflow-hidden border-l-4 border-l-red-500">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-red-600 flex items-center gap-2">
                <AlertCircle size={18} />
                การจัดการข้อมูล (Danger Zone)
              </h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowClearBallotsConfirm(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors"
              >
                ล้างข้อมูล Ballot ทั้งหมด
              </button>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                รีเซ็ตการเลือกตั้งทั้งหมด
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Clear Ballots Confirmation Modal */}
      {showClearBallotsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={24} className="text-[var(--color-error)]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">ล้างข้อมูล Ballot</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              คุณแน่ใจหรือไม่? ข้อมูลการลงคะแนน (Ballots) ทั้งหมด {election.ballots.length} ใบจะถูกลบ ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearBallotsConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleClearBallots}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-error)] text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={24} className="text-[var(--color-error)]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">รีเซ็ตการเลือกตั้ง</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              คุณแน่ใจหรือไม่? การตั้งค่าการเลือกตั้งและบัตรลงคะแนนทั้งหมดจะถูกลบ ระบบจะกลับไปยังหน้าเริ่มต้น
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-error)] text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                รีเซ็ตข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
