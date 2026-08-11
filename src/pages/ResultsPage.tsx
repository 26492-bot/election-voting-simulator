// ==========================================
// Results Page — Plurality, Borda, IRV & Copeland results (real data)
// ==========================================

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Trophy } from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import { computePlurality } from '../algorithms/plurality';
import { computeBorda } from '../algorithms/borda';
import { computeIRV } from '../algorithms/irv';
import { computeCopeland } from '../algorithms/copeland';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e0e7ff', '#818cf8'];
const BORDA_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#059669'];
const IRV_COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb', '#d97706'];
const COPELAND_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#2563eb'];

export default function ResultsPage() {
  const navigate = useNavigate();
  const { election } = useElection();

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
    <div className="min-h-screen bg-[var(--color-surface)]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary-950)]">
               ผลการเลือกตั้ง
            </h1>
            <p className="text-xs text-slate-500">Election Results</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors shadow-sm"
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-[var(--color-primary-700)]">{election.voterCount}</p>
            <p className="text-xs text-slate-500">ผู้มีสิทธิเลือกตั้ง</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-[var(--color-primary-700)]">{election.candidates.length}</p>
            <p className="text-xs text-slate-500">ผู้สมัคร</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-emerald-600">{pluralityOutput?.totalValidBallots ?? 0}</p>
            <p className="text-xs text-slate-500">Ballot สมบูรณ์</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
            <p className="text-2xl font-bold text-amber-600">{pluralityOutput?.invalidBallots ?? 0}</p>
            <p className="text-xs text-slate-500">Ballot ไม่สมบูรณ์</p>
          </div>
        </div>

        {/* Plurality Section */}
        <section className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-lg font-bold text-[var(--color-primary-900)]">
               Plurality Voting — ระบบเสียงข้างมาก
            </h2>
            <p className="text-xs text-slate-500 mt-1">นับเฉพาะผู้สมัครอันดับ 1 ของผู้มีสิทธิเลือกตั้งแต่ละคน</p>
          </div>

          {pluralityOutput && pluralityOutput.totalValidBallots > 0 ? (
            <div className="p-6 space-y-6">
              {/* Winner Card */}
              <div className={`rounded-xl p-5 ${
                pluralityOutput.isTie
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    pluralityOutput.isTie
                      ? 'bg-amber-100'
                      : 'bg-indigo-100'
                  }`}>
                    {pluralityOutput.isTie ? '⚠' : ''}
                  </div>
                  <div className="flex-1">
                    {pluralityOutput.isTie ? (
                      <>
                        <p className="text-sm text-amber-600 font-medium">ผลเสมอ</p>
                        <p className="text-xl font-bold text-amber-800">
                          {pluralityOutput.tiedCandidateNames.join(' และ ')}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">
                          ได้คะแนนเท่ากัน — {pluralityOutput.scores[0].votes} คะแนน
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-[var(--color-primary-500)] font-medium">ผู้ชนะ</p>
                        <p className="text-xl font-bold text-[var(--color-primary-900)]">
                          {pluralityOutput.winnerName}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {pluralityOutput.scores[0].votes} / {pluralityOutput.totalValidBallots} คะแนน
                          ({pluralityOutput.scores[0].percent.toFixed(1)}%)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">อันดับ</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">ผู้สมัคร</th>
                      <th className="text-right py-3 px-4 text-slate-600 font-bold">คะแนน</th>
                      <th className="text-right py-3 px-4 text-slate-600 font-bold">เปอร์เซ็นต์</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-bold w-40">สัดส่วน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pluralityOutput.scores.map((candidate, idx) => {
                      const isWinner = idx === 0 && !pluralityOutput.isTie;
                      const isTiedWinner = pluralityOutput.isTie && candidate.votes === pluralityOutput.scores[0].votes;

                      return (
                        <tr
                          key={candidate.id}
                          className={`border-b border-slate-100 ${
                            isWinner ? 'bg-indigo-50/60' : isTiedWinner ? 'bg-amber-50/60' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-600">{candidate.rank}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                              <span className={`font-semibold ${isWinner ? 'text-[var(--color-primary-700)]' : isTiedWinner ? 'text-amber-700' : 'text-slate-700'}`}>
                                {candidate.name}
                              </span>
                              {isWinner && (
                                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  ผู้ชนะ
                                </span>
                              )}
                              {isTiedWinner && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  เสมอ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-700">{candidate.votes}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{candidate.percent.toFixed(1)}%</td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${candidate.percent}%`,
                                  backgroundColor: COLORS[idx % COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 font-medium">ยังไม่มี Ballot ที่สมบูรณ์</p>
            </div>
          )}
        </section>

        {/* Borda Count Section */}
        <section className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <h2 className="text-lg font-bold text-emerald-900">
               Borda Count — ระบบรวมคะแนนตามอันดับ
            </h2>
            <p className="text-xs text-slate-500 mt-1">ให้คะแนนตามลำดับความชอบ (อันดับ 1 ได้ N คะแนน, อันดับสุดท้ายได้ 1 คะแนน)</p>
          </div>

          {bordaOutput && bordaOutput.totalValidBallots > 0 ? (
            <div className="p-6 space-y-6">
              {/* Winner Card */}
              <div className={`rounded-xl p-5 ${
                bordaOutput.isTie
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    bordaOutput.isTie
                      ? 'bg-amber-100'
                      : 'bg-emerald-100'
                  }`}>
                    {bordaOutput.isTie ? '⚠' : ''}
                  </div>
                  <div className="flex-1">
                    {bordaOutput.isTie ? (
                      <>
                        <p className="text-sm text-amber-600 font-medium">ผลเสมอ</p>
                        <p className="text-xl font-bold text-amber-800">
                          {bordaOutput.tiedCandidateNames.join(' และ ')}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">
                          ได้คะแนนเท่ากัน — {bordaOutput.scores[0].score} คะแนน
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-emerald-600 font-medium">ผู้ชนะ</p>
                        <p className="text-xl font-bold text-emerald-900">
                          {bordaOutput.winnerName}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {bordaOutput.scores[0].score} คะแนน
                          ({bordaOutput.scores[0].percent.toFixed(1)}% จากคะแนนเต็ม {bordaOutput.maxPossibleScore})
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">อันดับ</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">ผู้สมัคร</th>
                      <th className="text-right py-3 px-4 text-slate-600 font-bold">Borda Score</th>
                      <th className="text-right py-3 px-4 text-slate-600 font-bold">เปอร์เซ็นต์</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-bold w-40">สัดส่วน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bordaOutput.scores.map((candidate, idx) => {
                      const isWinner = idx === 0 && !bordaOutput.isTie;
                      const isTiedWinner = bordaOutput.isTie && candidate.score === bordaOutput.scores[0].score;

                      return (
                        <tr
                          key={candidate.id}
                          className={`border-b border-slate-100 ${
                            isWinner ? 'bg-emerald-50/60' : isTiedWinner ? 'bg-amber-50/60' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-600">{candidate.rank}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: BORDA_COLORS[idx % BORDA_COLORS.length] }} />
                              <span className={`font-semibold ${isWinner ? 'text-emerald-700' : isTiedWinner ? 'text-amber-700' : 'text-slate-700'}`}>
                                {candidate.name}
                              </span>
                              {isWinner && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  ผู้ชนะ
                                </span>
                              )}
                              {isTiedWinner && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  เสมอ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-700">{candidate.score}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{candidate.percent.toFixed(1)}%</td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-slate-100 rounded-full h-2.5">
                              <div
                                className="h-2.5 rounded-full transition-all duration-500"
                                style={{
                                  width: `${candidate.percent}%`,
                                  backgroundColor: BORDA_COLORS[idx % BORDA_COLORS.length],
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 font-medium">ยังไม่มี Ballot ที่สมบูรณ์</p>
            </div>
          )}
        </section>

        {/* IRV Section */}
        <section className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-amber-50">
            <h2 className="text-lg font-bold text-orange-900">
               Instant Runoff Voting (IRV) — ระบบคัดออกและโอนคะแนน
            </h2>
            <p className="text-xs text-slate-500 mt-1">คัดผู้สมัครที่ได้คะแนนน้อยสุดออกทีละรอบ จนกว่าจะมีผู้ชนะด้วยคะแนนเกิน 50%</p>
          </div>

          {irvOutput && irvOutput.totalValidBallots > 0 && irvOutput.result.rounds.length > 0 ? (
            <div className="p-6 space-y-6">
              {/* Winner Card */}
              <div className={`rounded-xl p-5 ${
                irvOutput.isTie
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
                  : 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    irvOutput.isTie
                      ? 'bg-red-100'
                      : 'bg-orange-100'
                  }`}>
                    {irvOutput.isTie ? '⚠' : ''}
                  </div>
                  <div className="flex-1">
                    {irvOutput.isTie ? (
                      <>
                        <p className="text-sm text-red-600 font-medium">ไม่สามารถหาผู้ชนะได้ (เสมอ)</p>
                        <p className="text-xl font-bold text-red-800">
                          {irvOutput.tiedCandidateNames.join(' และ ')}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          เหลือผู้สมัครที่มีคะแนนเท่ากันในรอบสุดท้าย
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-orange-600 font-medium">ผู้ชนะในรอบที่ {irvOutput.result.winningRound}</p>
                        <p className="text-xl font-bold text-orange-900">
                          {irvOutput.winnerName}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          คะแนนรอบตัดสิน: {irvOutput.result.rounds[irvOutput.result.rounds.length - 1].votes[irvOutput.winner!]} เสียง
                          ({((irvOutput.result.rounds[irvOutput.result.rounds.length - 1].votes[irvOutput.winner!] / irvOutput.totalValidBallots) * 100).toFixed(1)}%)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Rounds Detail Table */}
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700">สรุปคะแนนในรอบตัดสิน (Round {irvOutput.result.rounds.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 px-4 text-slate-600 font-bold">ผู้สมัคร</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-bold">คะแนน</th>
                        <th className="text-right py-3 px-4 text-slate-600 font-bold">เปอร์เซ็นต์</th>
                        <th className="text-left py-3 px-4 text-slate-600 font-bold w-40">สัดส่วน</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(irvOutput.result.rounds[irvOutput.result.rounds.length - 1].votes)
                        .sort((a, b) => b[1] - a[1])
                        .map(([candidateId, votes], idx) => {
                          const isWinner = candidateId === irvOutput.winner;
                          const pct = (votes / irvOutput.totalValidBallots) * 100;

                          return (
                            <tr
                              key={candidateId}
                              className={`border-b border-slate-100 ${
                                isWinner ? 'bg-orange-50/60' : ''
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: IRV_COLORS[idx % IRV_COLORS.length] }} />
                                  <span className={`font-semibold ${isWinner ? 'text-orange-700' : 'text-slate-700'}`}>
                                    {candidateMap.get(candidateId) ?? candidateId}
                                  </span>
                                  {isWinner && (
                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-semibold">
                                      ผู้ชนะ
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-700">{votes}</td>
                              <td className="py-3 px-4 text-right text-slate-600">{pct.toFixed(1)}%</td>
                              <td className="py-3 px-4">
                                <div className="w-full bg-slate-100 rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${pct}%`,
                                      backgroundColor: IRV_COLORS[idx % IRV_COLORS.length],
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 font-medium">ยังไม่มี Ballot ที่สมบูรณ์</p>
            </div>
          )}
        </section>

        {/* Copeland Section */}
        <section className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
          <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-lg font-bold text-blue-900">
              ⚔ Copeland's Rule — ระบบเปรียบเทียบคู่
            </h2>
            <p className="text-xs text-slate-500 mt-1">เปรียบเทียบผู้สมัครแบบตัวต่อตัวทุดคู่ (ชนะ +1, เสมอ 0, แพ้ -1)</p>
          </div>

          {copelandOutput && copelandOutput.totalValidBallots > 0 ? (
            <div className="p-6 space-y-6">
              {/* Winner Card */}
              <div className={`rounded-xl p-5 ${
                copelandOutput.status === 'tie'
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                    copelandOutput.status === 'tie'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}>
                    {copelandOutput.status === 'tie' ? '⚠' : ''}
                  </div>
                  <div className="flex-1">
                    {copelandOutput.status === 'tie' ? (
                      <>
                        <p className="text-sm text-amber-600 font-medium">ผลเสมอ (Overall Tie)</p>
                        <p className="text-xl font-bold text-amber-800">
                          {copelandOutput.winnerNames.join(' และ ')}
                        </p>
                        <p className="text-sm text-amber-600 mt-1">
                          ได้ Copeland Score เท่ากัน — {copelandOutput.scores[0].score} คะแนน
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-blue-600 font-medium">ผู้ชนะ</p>
                        <p className="text-xl font-bold text-blue-900">
                          {copelandOutput.winnerNames[0]}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Copeland Score: {copelandOutput.scores[0].score}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">อันดับ</th>
                      <th className="text-left py-3 px-4 text-slate-600 font-bold">ผู้สมัคร</th>
                      <th className="text-center py-3 px-4 text-emerald-600 font-bold">ชนะ</th>
                      <th className="text-center py-3 px-4 text-red-600 font-bold">แพ้</th>
                      <th className="text-center py-3 px-4 text-slate-400 font-bold">เสมอ</th>
                      <th className="text-right py-3 px-4 text-slate-600 font-bold">คะแนนรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {copelandOutput.scores.map((candidate, idx) => {
                      const isWinner = copelandOutput.winners.includes(candidate.id);
                      const isTied = copelandOutput.status === 'tie' && isWinner;

                      return (
                        <tr
                          key={candidate.id}
                          className={`border-b border-slate-100 ${
                            isWinner && !isTied ? 'bg-blue-50/60' : isTied ? 'bg-amber-50/60' : ''
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-600">{candidate.rank}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: COPELAND_COLORS[idx % COPELAND_COLORS.length] }} />
                              <span className={`font-semibold ${isWinner && !isTied ? 'text-blue-700' : isTied ? 'text-amber-700' : 'text-slate-700'}`}>
                                {candidate.name}
                              </span>
                              {isWinner && !isTied && (
                                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  ผู้ชนะ
                                </span>
                              )}
                              {isTied && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-semibold">
                                  เสมอ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-emerald-600">{candidate.wins}</td>
                          <td className="py-3 px-4 text-center font-bold text-red-600">{candidate.losses}</td>
                          <td className="py-3 px-4 text-center font-medium text-slate-400">{candidate.ties}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800 text-base">{candidate.score > 0 ? `+${candidate.score}` : candidate.score}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-500 font-medium">ยังไม่มี Ballot ที่สมบูรณ์</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
