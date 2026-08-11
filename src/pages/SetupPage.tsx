// ==========================================
// Election Setup Page — /setup
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Vote,
  Users,
  UserPlus,
  ChevronRight,
  Sparkles,
  Shuffle,
  PenLine,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Info,
  Dices,
  Settings2,
  Trash2,
} from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import type { Candidate, DataEntryMode, AutoGenerateMode } from '../types';
import {
  generateCandidateId,
  generateCandidateName,
  generateUniformBallots,
  generateRealisticBallots,
} from '../utils/ballotGenerator';

export default function SetupPage() {
  const navigate = useNavigate();
  const { createElection, election, resetElection } = useElection();

  // Form state
  const [voterCount, setVoterCount] = useState<number>(10);
  const [candidateCount, setCandidateCount] = useState<number>(5);
  const [candidateNames, setCandidateNames] = useState<string[]>([]);
  const [dataEntryMode, setDataEntryMode] = useState<DataEntryMode>('auto');
  const [autoGenerateMode, setAutoGenerateMode] = useState<AutoGenerateMode>('realistic');

  // Validation state
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Generate candidate names when candidate count changes
  useEffect(() => {
    setCandidateNames(prev => {
      const newNames: string[] = [];
      for (let i = 0; i < candidateCount; i++) {
        newNames.push(prev[i] || generateCandidateName(i));
      }
      return newNames;
    });
  }, [candidateCount]);

  // Prefill from existing election if available
  useEffect(() => {
    if (election) {
      setVoterCount(election.voterCount);
      setCandidateCount(election.candidates.length);
      setCandidateNames(election.candidates.map(c => c.name));
    }
  }, [election]);

  // Validation
  const validate = useCallback((): string[] => {
    const errs: string[] = [];

    if (voterCount < 2) {
      errs.push('จำนวนผู้มีสิทธิเลือกตั้งต้องมีอย่างน้อย 2 คน');
    }
    if (voterCount > 100000) {
      errs.push('จำนวนผู้มีสิทธิเลือกตั้งไม่ควรเกิน 100,000 คน');
    }
    if (candidateCount < 2) {
      errs.push('จำนวนผู้สมัครต้องมีอย่างน้อย 2 คน');
    }
    if (candidateCount > 26) {
      errs.push('จำนวนผู้สมัครไม่ควรเกิน 26 คน');
    }

    // Check for empty or duplicate names
    const trimmedNames = candidateNames.map(n => n.trim());
    const hasEmpty = trimmedNames.some(n => n === '');
    if (hasEmpty) {
      errs.push('กรุณากรอกชื่อผู้สมัครให้ครบทุกคน');
    }

    const nameSet = new Set(trimmedNames.filter(n => n !== ''));
    if (nameSet.size < trimmedNames.filter(n => n !== '').length) {
      errs.push('ชื่อผู้สมัครห้ามซ้ำกัน');
    }

    return errs;
  }, [voterCount, candidateCount, candidateNames]);

  useEffect(() => {
    if (touched) {
      setErrors(validate());
    }
  }, [touched, validate]);

  const handleCandidateNameChange = (index: number, name: string) => {
    setCandidateNames(prev => {
      const updated = [...prev];
      updated[index] = name;
      return updated;
    });
    if (!touched) setTouched(true);
  };

  const handleSubmit = () => {
    setTouched(true);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (validationErrors.length > 0) return;

    // Build candidates
    const candidates: Candidate[] = candidateNames.map((name, i) => ({
      id: generateCandidateId(i),
      name: name.trim(),
    }));

    if (dataEntryMode === 'auto') {
      // Generate ballots automatically
      const ballots =
        autoGenerateMode === 'uniform'
          ? generateUniformBallots(voterCount, candidates)
          : generateRealisticBallots(voterCount, candidates);

      createElection(voterCount, candidates, ballots);
      navigate('/dashboard');
    } else {
      // Manual entry — go to ballots page
      createElection(voterCount, candidates, []);
      navigate('/ballots');
    }
  };

  const handleReset = () => {
    resetElection();
    setVoterCount(10);
    setCandidateCount(5);
    setCandidateNames([]);
    setDataEntryMode('auto');
    setAutoGenerateMode('realistic');
    setErrors([]);
    setTouched(false);
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--color-primary-200)] opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[var(--color-accent-200)] opacity-15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--color-primary-100)] opacity-10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-3xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-sm font-medium mb-4">
            <BarChart3 size={16} />
            <span>โครงงานคณิตศาสตร์</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary-950)] mb-2">
            🗳️ ตั้งค่าการเลือกตั้ง
          </h1>
          <p className="text-[var(--color-primary-600)] font-medium text-lg">
            Election Setup
          </p>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            กำหนดจำนวนผู้มีสิทธิเลือกตั้ง ผู้สมัคร และวิธีการกรอกข้อมูลคะแนนเสียง
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-800)] px-6 py-4">
            <div className="flex items-center gap-3 text-white">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Settings2 size={20} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">ข้อมูลพื้นฐาน</h2>
                <p className="text-primary-200 text-sm opacity-80">
                  Basic Configuration
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Error Messages */}
            {touched && errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-[var(--radius-input)] p-4 animate-fade-in">
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

            {/* Voter Count */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users size={16} className="text-[var(--color-primary-500)]" />
                จำนวนผู้มีสิทธิเลือกตั้ง
                <span className="text-slate-400 font-normal">— Number of Voters</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={2}
                  max={100000}
                  value={voterCount}
                  onChange={e => {
                    setVoterCount(Math.max(0, parseInt(e.target.value) || 0));
                    if (!touched) setTouched(true);
                  }}
                  className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-slate-300 bg-white text-slate-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-[var(--color-primary-400)] transition-all duration-200 hover:border-slate-400"
                  placeholder="เช่น 10, 50, 100"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  คน
                </div>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info size={12} />
                ขั้นต่ำ 2 คน สูงสุด 100,000 คน
              </p>
            </div>

            {/* Candidate Count */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <UserPlus size={16} className="text-[var(--color-primary-500)]" />
                จำนวนผู้สมัคร
                <span className="text-slate-400 font-normal">— Number of Candidates</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={2}
                  max={26}
                  value={candidateCount}
                  onChange={e => {
                    setCandidateCount(Math.max(0, parseInt(e.target.value) || 0));
                    if (!touched) setTouched(true);
                  }}
                  className="w-full px-4 py-3 rounded-[var(--radius-input)] border border-slate-300 bg-white text-slate-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-[var(--color-primary-400)] transition-all duration-200 hover:border-slate-400"
                  placeholder="เช่น 3, 5, 8"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                  คน
                </div>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Info size={12} />
                ขั้นต่ำ 2 คน สูงสุด 26 คน (A–Z)
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 pt-2" />

            {/* Candidate Names */}
            {candidateCount >= 2 && candidateCount <= 26 && (
              <div className="space-y-3 animate-fade-in">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <PenLine size={16} className="text-[var(--color-primary-500)]" />
                  ชื่อผู้สมัคร
                  <span className="text-slate-400 font-normal">— Candidate Names</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger-children">
                  {Array.from({ length: candidateCount }, (_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-700)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {generateCandidateId(i)}
                      </div>
                      <input
                        type="text"
                        value={candidateNames[i] || ''}
                        onChange={e => handleCandidateNameChange(i, e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-[var(--radius-input)] border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-[var(--color-primary-400)] transition-all duration-200 hover:border-slate-400"
                        placeholder={generateCandidateName(i)}
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Info size={12} />
                  สามารถเปลี่ยนชื่อผู้สมัครได้ตามต้องการ
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200 pt-2" />

            {/* Data Entry Mode */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Vote size={16} className="text-[var(--color-primary-500)]" />
                วิธีการกรอกข้อมูลคะแนน
                <span className="text-slate-400 font-normal">— Data Entry Mode</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Auto Generate */}
                <button
                  onClick={() => setDataEntryMode('auto')}
                  className={`relative p-4 rounded-[var(--radius-card)] border-2 transition-all duration-200 text-left group ${
                    dataEntryMode === 'auto'
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] shadow-[var(--shadow-glow)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {dataEntryMode === 'auto' && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle2 size={18} className="text-[var(--color-primary-500)]" />
                    </div>
                  )}
                  <div className={`p-2 rounded-lg w-fit mb-2 ${
                    dataEntryMode === 'auto'
                      ? 'bg-[var(--color-primary-100)]'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  } transition-colors`}>
                    <Sparkles size={20} className={
                      dataEntryMode === 'auto'
                        ? 'text-[var(--color-primary-600)]'
                        : 'text-slate-500'
                    } />
                  </div>
                  <h3 className={`font-semibold text-sm ${
                    dataEntryMode === 'auto'
                      ? 'text-[var(--color-primary-800)]'
                      : 'text-slate-700'
                  }`}>
                    สร้างข้อมูลจำลองอัตโนมัติ
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Auto Generate Ballots
                  </p>
                </button>

                {/* Manual Entry */}
                <button
                  onClick={() => setDataEntryMode('manual')}
                  className={`relative p-4 rounded-[var(--radius-card)] border-2 transition-all duration-200 text-left group ${
                    dataEntryMode === 'manual'
                      ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] shadow-[var(--shadow-glow)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {dataEntryMode === 'manual' && (
                    <div className="absolute top-2.5 right-2.5">
                      <CheckCircle2 size={18} className="text-[var(--color-primary-500)]" />
                    </div>
                  )}
                  <div className={`p-2 rounded-lg w-fit mb-2 ${
                    dataEntryMode === 'manual'
                      ? 'bg-[var(--color-primary-100)]'
                      : 'bg-slate-100 group-hover:bg-slate-200'
                  } transition-colors`}>
                    <PenLine size={20} className={
                      dataEntryMode === 'manual'
                        ? 'text-[var(--color-primary-600)]'
                        : 'text-slate-500'
                    } />
                  </div>
                  <h3 className={`font-semibold text-sm ${
                    dataEntryMode === 'manual'
                      ? 'text-[var(--color-primary-800)]'
                      : 'text-slate-700'
                  }`}>
                    กรอกข้อมูลด้วยตนเอง
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manual Ballot Entry
                  </p>
                </button>
              </div>
            </div>

            {/* Removed Auto Generate Options UI as requested */}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-button)] bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-primary-700)] text-white font-semibold text-base shadow-[var(--shadow-button)] hover:from-[var(--color-primary-700)] hover:to-[var(--color-primary-800)] hover:shadow-md active:scale-[0.98] transition-all duration-200"
              >
                <Vote size={20} />
                สร้างการเลือกตั้ง
                <ChevronRight size={18} />
              </button>

              {election && (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-[var(--radius-button)] border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 active:scale-[0.98] transition-all duration-200"
                >
                  <Trash2 size={16} />
                  ล้างข้อมูล
                </button>
              )}
            </div>

            {/* Existing Election Info */}
            {election && election.ballots.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-[var(--radius-input)] p-4 animate-fade-in">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="text-[var(--color-success)] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      มีข้อมูลการเลือกตั้งอยู่แล้ว
                    </p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      ผู้มีสิทธิเลือกตั้ง {election.voterCount} คน •
                      ผู้สมัคร {election.candidates.length} คน •
                      บัตรลงคะแนน {election.ballots.length} ใบ
                    </p>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-900 underline underline-offset-2"
                    >
                      ไปยัง Dashboard
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle size={24} className="text-[var(--color-error)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">🗑️ ล้างข้อมูลการเลือกตั้ง</h3>
                  <p className="text-sm text-slate-500">Clear Election Data</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                คุณแน่ใจหรือไม่? ข้อมูลการเลือกตั้งทั้งหมดจะถูกลบ รวมถึงบัตรลงคะแนนที่กรอกไว้แล้ว
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
                  ลบข้อมูลทั้งหมด
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-400">
          <p>Election Voting Method Simulator</p>
          <p className="mt-0.5">ระบบจำลองการเลือกตั้งและเปรียบเทียบวิธีการนับคะแนน</p>
        </div>
      </div>
    </div>
  );
}
