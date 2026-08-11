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


      <div className="relative w-full max-w-3xl animate-fade-in-up">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">โครงงานคณิตศาสตร์</p>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            ตั้งค่าการเลือกตั้ง
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            กำหนดจำนวนผู้มีสิทธิเลือกตั้ง ผู้สมัคร และวิธีการกรอกข้อมูลคะแนน
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] border border-slate-200 overflow-hidden">
          {/* Card Header - Clean white */}
          <div className="px-6 pt-5 pb-0 flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-slate-800">ข้อมูลพื้นฐาน</h2>
            {election && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                รีเซ็ต
              </button>
            )}
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
              <label className="block text-sm font-bold text-slate-700">
                จำนวนผู้สมัคร
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
                <label className="block text-sm font-bold text-slate-700">
                  ชื่อผู้สมัคร
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
              <label className="block text-sm font-bold text-slate-700">
                วิธีการกรอกข้อมูลคะแนน
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
                    <Shuffle size={20} className={
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
                    สุ่มข้อมูลอัตโนมัติ
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ระบบจะสร้างบัตรลงคะแนนให้
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
                    กรอกอันดับความชอบทีละคน
                  </p>
                </button>
              </div>
            </div>

            {/* Removed Auto Generate Options UI as requested */}

            {/* Action Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[var(--radius-button)] bg-slate-800 text-white font-semibold text-base hover:bg-slate-900 active:scale-[0.98] transition-all duration-200"
              >
                เริ่มจำลองการเลือกตั้ง
                <ChevronRight size={18} />
              </button>
            </div>


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
                  <h3 className="font-semibold text-slate-800">🗑 ล้างข้อมูลการเลือกตั้ง</h3>
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
