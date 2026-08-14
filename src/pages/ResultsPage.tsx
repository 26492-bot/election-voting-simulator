import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutDashboard, Trophy, Users, FileCheck, FileX, BarChart2, CheckSquare, Square } from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import { computePlurality } from '../algorithms/plurality';
import { computeBorda } from '../algorithms/borda';
import { computeIRV } from '../algorithms/irv';
import { computeCopeland } from '../algorithms/copeland';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e0e7ff', '#818cf8'];
const BORDA_COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#059669'];
const IRV_COLORS = ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a', '#fef3c7', '#fffbeb', '#d97706'];
const COPELAND_COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff', '#2563eb'];

export default function ResultsPage() {
  const navigate = useNavigate();
  const { election } = useElection();
  
  type TabType = 'plurality' | 'borda' | 'irv' | 'copeland';
  const [activeTabs, setActiveTabs] = useState<TabType[]>(['plurality']);

  const toggleTab = (id: TabType) => {
    setActiveTabs((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Prevent deselecting the last one
        return prev.filter((t) => t !== id);
      }
      return [...prev, id];
    });
  };

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

  const tabs = [
    { id: 'plurality', label: 'Plurality', icon: <Users size={18} />, output: pluralityOutput, title: 'Plurality Voting — ระบบเสียงข้างมาก', desc: 'นับเฉพาะผู้สมัครอันดับ 1 ของผู้มีสิทธิเลือกตั้งแต่ละคน', colors: COLORS },
    { id: 'borda', label: 'Borda Count', icon: <BarChart2 size={18} />, output: bordaOutput, title: 'Borda Count — ระบบรวมคะแนนตามอันดับ', desc: 'ให้คะแนนตามลำดับความชอบ (อันดับ 1 ได้ N คะแนน, อันดับสุดท้ายได้ 1 คะแนน)', colors: BORDA_COLORS },
    { id: 'irv', label: 'IRV', icon: <Trophy size={18} />, output: irvOutput, title: 'Instant Runoff Voting (IRV) — ระบบคัดออกและโอนคะแนน', desc: 'คัดผู้สมัครที่ได้คะแนนน้อยสุดออกทีละรอบ จนกว่าจะมีผู้ชนะด้วยคะแนนเกิน 50%', colors: IRV_COLORS },
    { id: 'copeland', label: "Copeland's", icon: <FileCheck size={18} />, output: copelandOutput, title: "Copeland's Rule — ระบบเปรียบเทียบคู่", desc: 'เปรียบเทียบผู้สมัครแบบตัวต่อตัวทุดคู่ (ชนะ +1, เสมอ 0, แพ้ -1)', colors: COPELAND_COLORS },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
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
            <p className="text-xs text-slate-500">Election Results Dashboard (Multi-View)</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors shadow-sm"
        >
          <LayoutDashboard size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar / Top Tab Bar */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 shrink-0 z-20 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto results-sidebar">
          <div className="p-4 hidden md:block">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">เลือกระบบการนับคะแนน</h2>
          </div>
          <div className="flex md:flex-col flex-1 p-2 md:px-3 md:pb-4 gap-1 min-w-max md:min-w-0">
            {tabs.map((tab) => {
              const isActive = activeTabs.includes(tab.id as TabType);
              
              let statusText = '';
              let statusClass = '';
              if (tab.output) {
                  if (tab.id === 'copeland' && (tab.output as any).status === 'tie') {
                      statusText = 'เสมอ'; statusClass = 'text-amber-500 bg-amber-50';
                  } else if (tab.id !== 'copeland' && (tab.output as any).isTie) {
                      statusText = 'เสมอ'; statusClass = 'text-amber-500 bg-amber-50';
                  } else {
                      statusText = 'สำเร็จ'; statusClass = 'text-emerald-500 bg-emerald-50';
                  }
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => toggleTab(tab.id as TabType)}
                  className={`flex items-center gap-3 px-4 py-3 md:py-3.5 rounded-xl transition-all duration-200 text-left relative ${
                    isActive 
                      ? 'bg-slate-50 text-[var(--color-primary-900)] font-semibold shadow-sm md:shadow-none tab-active' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-sm text-[var(--color-primary-600)]' : 'bg-transparent text-slate-400'}`}>
                    {tab.icon}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="text-sm">{tab.label}</div>
                    {isActive ? (
                        <CheckSquare size={14} className="text-[var(--color-primary-600)] hidden md:block opacity-70" />
                    ) : (
                        <Square size={14} className="text-slate-300 hidden md:block" />
                    )}
                  </div>
                  {statusText && (
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusClass} hidden md:block`}>
                      {statusText}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto bg-[var(--color-surface)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6 animate-slide-in-left">
            
            {/* KPI Stats Panel */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-count-up" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Users size={16} /></div>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ผู้มีสิทธิเลือกตั้ง</h3>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{election.voterCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-count-up" style={{ animationDelay: '50ms' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-500"><Users size={16} /></div>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">ผู้สมัคร</h3>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">{election.candidates.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-count-up" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><FileCheck size={16} /></div>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ballot สมบูรณ์</h3>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-emerald-600">{pluralityOutput?.totalValidBallots ?? 0}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-count-up" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><FileX size={16} /></div>
                  <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ballot ไม่สมบูรณ์</h3>
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-amber-600">{pluralityOutput?.invalidBallots ?? 0}</p>
              </div>
            </div>

            {/* Render Active Tab Contents */}
            {tabs.map((tab) => {
              if (!activeTabs.includes(tab.id as TabType)) return null;
              
              const out: any = tab.output;
              const isTie = tab.id === 'copeland' ? out?.status === 'tie' : out?.isTie;
              const isNoData = !out || (out.totalValidBallots ?? 0) === 0;

              return (
                <div key={tab.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 animate-fade-in">
                  {/* Panel Header */}
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900">{tab.title}</h2>
                    <p className="text-sm text-slate-500 mt-1">{tab.desc}</p>
                  </div>

                  {isNoData ? (
                    <div className="p-12 text-center">
                      <p className="text-slate-500 font-medium">ยังไม่มี Ballot ที่สมบูรณ์</p>
                    </div>
                  ) : (
                    <div className="p-6 md:p-8 space-y-8">
                      {/* Winner/Tie Subtle Banner */}
                      {isTie ? (
                        <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                          <div className="bg-amber-100 text-amber-600 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                              ⚠
                          </div>
                          <div>
                              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">ผลเสมอ</p>
                              <p className="text-lg font-bold text-amber-900 mt-0.5">
                                  {(tab.id === 'copeland' ? out.winnerNames : out.tiedCandidateNames).join(' และ ')}
                              </p>
                              <p className="text-sm text-amber-700/80 mt-1">มีคะแนนเท่ากันในระบบนี้</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-200/60 rounded-xl p-4 flex items-start gap-4 shadow-sm">
                           <div className="bg-indigo-50 text-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                              <Trophy size={20} />
                          </div>
                          <div>
                              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">ผู้ชนะ</p>
                              <p className="text-xl font-bold text-slate-900 mt-0.5">
                                  {tab.id === 'copeland' ? out.winnerNames[0] : out.winnerName}
                              </p>
                              {tab.id === 'irv' && out.result && (
                                 <p className="text-sm text-slate-500 mt-1">ชนะในรอบที่ {out.result.winningRound}</p>
                              )}
                          </div>
                        </div>
                      )}

                      {/* Chart Visualization */}
                      <div className="pt-4 pb-2">
                         <h3 className="text-sm font-bold text-slate-800 mb-6">คะแนนที่ได้รับ</h3>
                         <div className="h-72 w-full">
                              {tab.id === 'plurality' && (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={out.scores} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                          <XAxis type="number" hide />
                                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
                                          <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${value} เสียง`, 'คะแนน']}
                                          />
                                          <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={32}>
                                              {out.scores.map((entry: any, index: number) => (
                                                  <Cell key={`cell-${index}`} fill={tab.colors[index % tab.colors.length]} />
                                              ))}
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                              )}
                              {tab.id === 'borda' && (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={out.scores} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                          <XAxis type="number" hide />
                                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
                                          <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => [`${value} คะแนน`, 'Borda Score']}
                                          />
                                          <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={32}>
                                              {out.scores.map((entry: any, index: number) => (
                                                  <Cell key={`cell-${index}`} fill={tab.colors[index % tab.colors.length]} />
                                              ))}
                                          </Bar>
                                      </BarChart>
                                  </ResponsiveContainer>
                              )}
                              {tab.id === 'irv' && out.result && out.result.rounds.length > 0 && (() => {
                                  const lastRound = out.result.rounds[out.result.rounds.length - 1].votes;
                                  const irvData = Object.entries(lastRound)
                                      .map(([id, votes]) => ({ name: candidateMap.get(id) || id, votes }))
                                      .sort((a, b: any) => b.votes - (a.votes as number));
                                  
                                  return (
                                      <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={irvData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                              <XAxis type="number" hide />
                                              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
                                              <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value) => [`${value} เสียง`, 'คะแนนรอบตัดสิน']}
                                              />
                                              <Bar dataKey="votes" radius={[0, 6, 6, 0]} barSize={32}>
                                                  {irvData.map((entry: any, index: number) => (
                                                      <Cell key={`cell-${index}`} fill={tab.colors[index % tab.colors.length]} />
                                                  ))}
                                              </Bar>
                                          </BarChart>
                                      </ResponsiveContainer>
                                  );
                              })()}
                              {tab.id === 'copeland' && (
                                  <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={out.scores} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                          <XAxis type="number" hide />
                                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} width={120} />
                                          <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                          />
                                          <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                                          <Bar dataKey="wins" name="ชนะ (+1)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={32} />
                                          <Bar dataKey="ties" name="เสมอ (0)" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} barSize={32} />
                                          <Bar dataKey="losses" name="แพ้ (-1)" stackId="a" fill="#ef4444" radius={[0, 6, 6, 0]} barSize={32} />
                                      </BarChart>
                                  </ResponsiveContainer>
                              )}
                         </div>
                      </div>

                      {/* Ranking List Custom UI */}
                      <div className="space-y-3 pt-4 border-t border-slate-100">
                         <h3 className="text-sm font-bold text-slate-800 mb-4">ตารางอันดับ</h3>
                         {tab.id === 'copeland' ? (
                              out.scores.map((c: any, i: number) => (
                                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
                                      <div className="w-8 text-center font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{c.rank}</div>
                                      <div className="flex-1 font-semibold text-slate-800">{c.name}</div>
                                      <div className="flex gap-4 text-sm mr-4">
                                          <span className="text-emerald-600 font-semibold">{c.wins} ชนะ</span>
                                          <span className="text-slate-400">{c.ties} เสมอ</span>
                                          <span className="text-red-500 font-semibold">{c.losses} แพ้</span>
                                      </div>
                                      <div className="w-16 text-right font-bold text-lg text-[var(--color-primary-700)]">
                                          {c.score > 0 ? `+${c.score}` : c.score}
                                      </div>
                                  </div>
                              ))
                         ) : tab.id === 'irv' ? (
                              (() => {
                                  const lastRound = out.result.rounds[out.result.rounds.length - 1].votes;
                                  const irvData = Object.entries(lastRound)
                                      .map(([id, votes]) => ({ id, name: candidateMap.get(id) || id, votes: votes as number }))
                                      .sort((a, b) => b.votes - a.votes);
                                  return irvData.map((c: any, i: number) => (
                                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
                                          <div className="w-8 text-center font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{i + 1}</div>
                                          <div className="flex-1 font-semibold text-slate-800">{c.name}</div>
                                          <div className="w-24 text-right font-bold text-lg text-[var(--color-primary-700)]">
                                              {c.votes} เสียง
                                          </div>
                                      </div>
                                  ));
                              })()
                         ) : (
                              out.scores.map((c: any, i: number) => (
                                  <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white group">
                                      <div className="w-8 text-center font-bold text-slate-400 group-hover:text-slate-600 transition-colors">{c.rank}</div>
                                      <div className="flex-1 font-semibold text-slate-800">{c.name}</div>
                                      <div className="w-24 text-right font-bold text-lg text-[var(--color-primary-700)]">
                                          {tab.id === 'borda' ? `${c.score} คะแนน` : `${c.votes} เสียง`}
                                      </div>
                                      <div className="w-16 text-right text-sm text-slate-500 font-medium">
                                          {c.percent.toFixed(1)}%
                                      </div>
                                  </div>
                              ))
                         )}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
            
          </div>
        </main>
      </div>
    </div>
  );
}
