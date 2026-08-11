// ==========================================
// IRVChart — Line chart + round-by-round for IRV (Real Data)
// ==========================================

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { AlertCircle, ChevronRight, XCircle, AlertTriangle } from 'lucide-react';
import type { IRVOutput } from '../../algorithms/irv';
import { useElection } from '../../context/ElectionContext';

interface IRVChartProps {
  output: IRVOutput;
}

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

export default function IRVChart({ output }: IRVChartProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const { election } = useElection();

  const candidateMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    if (election) {
      election.candidates.forEach((c, idx) => {
        map.set(c.id, { name: c.name, color: COLORS[idx % COLORS.length] });
      });
    }
    return map;
  }, [election]);

  // Transform rounds into Recharts format
  const lineData = useMemo(() => {
    return output.result.rounds.map((r) => {
      const dataPoint: any = { round: `Round ${r.roundNumber}` };
      for (const [candId, votes] of Object.entries(r.votes)) {
        dataPoint[candId] = votes;
      }
      return dataPoint;
    });
  }, [output]);

  const candidateIds = useMemo(() => {
    if (output.result.rounds.length > 0) {
      return Object.keys(output.result.rounds[0].votes);
    }
    return [];
  }, [output]);

  if (output.totalValidBallots === 0) {
    return (
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center animate-fade-in">
        <p className="text-slate-500">ยังไม่มีข้อมูล Ballot สำหรับคำนวณ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณากรอกหรือสุ่มคะแนนก่อน</p>
      </div>
    );
  }

  const majorityLine = Math.floor(output.totalValidBallots / 2) + 1;
  const finalRound = output.result.rounds[output.result.rounds.length - 1];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Line Chart */}
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">📈 คะแนนตามรอบ</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Vote Progression — Instant Runoff Voting</p>
        </div>

        {output.isTie && (
          <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700">
              ⚠️ ไม่สามารถหาผู้ชนะได้ (เสมอกันในการคัดออก): <span className="font-semibold">{output.tiedCandidateNames.join(', ')}</span>
            </p>
          </div>
        )}

        <div className="p-4" style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="round"
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                domain={[0, Math.max(output.totalValidBallots, majorityLine + 2)]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: any, name: any) => {
                  const candInfo = candidateMap.get(String(name));
                  return [`${value} เสียง`, candInfo?.name ?? String(name)];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                formatter={(value: any) => candidateMap.get(String(value))?.name ?? String(value)}
              />
              <ReferenceLine
                y={majorityLine}
                stroke="#ef4444"
                strokeDasharray="6 4"
                label={{
                  value: `${majorityLine} เสียง (เกณฑ์ชนะ)`,
                  position: 'right',
                  style: { fontSize: 11, fill: '#ef4444', fontWeight: 600 },
                }}
              />
              {candidateIds.map((id) => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={candidateMap.get(id)?.color ?? '#94a3b8'}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: candidateMap.get(id)?.color ?? '#94a3b8', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                  name={id}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Round Selector */}
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">🔄 รายละเอียดแต่ละรอบ</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Round Details</p>
        </div>

        {/* Round Tabs */}
        <div className="px-5 py-3 flex gap-2 overflow-x-auto border-b border-slate-100">
          {output.result.rounds.map((r, idx) => {
            const isFinal = idx === output.result.rounds.length - 1;
            const isActive = selectedRound === idx || (selectedRound === null && isFinal);
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedRound(idx)}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-600)] text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isFinal ? `รอบตัดสิน (Round ${r.roundNumber})` : `รอบที่ ${r.roundNumber}`}
              </button>
            );
          })}
        </div>

        {/* Round Detail */}
        <div className="p-5">
          {(() => {
            const idxToShow = selectedRound !== null ? selectedRound : output.result.rounds.length - 1;
            const roundToShow = output.result.rounds[idxToShow];
            return (
              <RoundDetail 
                round={roundToShow} 
                totalVoters={output.totalValidBallots} 
                candidateMap={candidateMap}
                isTie={roundToShow.isTie}
              />
            );
          })()}
        </div>
      </div>

      {/* Result Summary */}
      {output.winner && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-[var(--radius-card)] border border-emerald-200 p-4">
          <p className="text-sm text-emerald-800">
            <span className="font-bold">🏆 {output.winnerName}</span> ชนะการเลือกตั้งในรอบที่ {output.result.winningRound} ด้วยคะแนน{' '}
            <span className="font-bold">{finalRound.votes[output.winner]}</span> เสียง
            จากทั้งหมด {output.totalValidBallots} เสียง ({((finalRound.votes[output.winner] / output.totalValidBallots) * 100).toFixed(1)}%)
          </p>
        </div>
      )}
    </div>
  );
}

function RoundDetail({
  round,
  totalVoters,
  candidateMap,
  isTie
}: {
  round: IRVOutput['result']['rounds'][number];
  totalVoters: number;
  candidateMap: Map<string, { name: string; color: string }>;
  isTie: boolean;
}) {
  // Sort candidates by votes descending
  const sortedCandidates = Object.entries(round.votes)
    .map(([id, votes]) => ({ id, votes: votes as number }))
    .sort((a, b) => b.votes - a.votes);

  const eliminatedIds = round.eliminated ? round.eliminated.split(', ') : [];

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Elimination Notice */}
      {eliminatedIds.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl">
          <XCircle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">
              {eliminatedIds.map((id: string) => candidateMap.get(id)?.name ?? id).join(', ')}
            </span> ถูกคัดออกในรอบนี้ เนื่องจากได้คะแนนน้อยที่สุด
          </p>
        </div>
      )}

      {isTie && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            เกิดการเสมอที่ไม่สามารถตัดสินได้ในรอบนี้
          </p>
        </div>
      )}

      {/* Votes table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 text-slate-500 font-medium">ผู้สมัคร</th>
            <th className="text-right py-2 px-3 text-slate-500 font-medium">คะแนน</th>
            <th className="text-right py-2 px-3 text-slate-500 font-medium">เปอร์เซ็นต์</th>
            <th className="text-left py-2 px-3 text-slate-500 font-medium w-32">สัดส่วน</th>
          </tr>
        </thead>
        <tbody>
          {sortedCandidates.map((c) => {
            const pct = totalVoters > 0 ? (c.votes / totalVoters) * 100 : 0;
            const isEliminated = eliminatedIds.includes(c.id);
            const candInfo = candidateMap.get(c.id);
            const color = candInfo?.color ?? '#94a3b8';
            
            return (
              <tr key={c.id} className={`border-b border-slate-50 ${isEliminated ? 'bg-red-50/30 opacity-75' : ''}`}>
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className={`font-medium ${isEliminated ? 'text-red-700' : 'text-slate-700'}`}>
                      {candInfo?.name ?? c.id}
                    </span>
                    {isEliminated && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                        คัดออก
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{c.votes}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">{pct.toFixed(1)}%</td>
                <td className="py-2.5 px-3">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${isEliminated ? 'bg-red-400' : ''}`}
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isEliminated ? undefined : color,
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
  );
}
