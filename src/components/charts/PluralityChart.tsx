// ==========================================
// PluralityChart — Bar chart for first preference votes
// Uses real algorithm results passed via props
// ==========================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { PluralityCandidateScore } from '../../algorithms/plurality';

interface PluralityChartProps {
  scores: PluralityCandidateScore[];
  isTie: boolean;
  tiedCandidateNames: string[];
  totalValidBallots: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e0e7ff', '#818cf8'];

export default function PluralityChart({ scores, isTie, tiedCandidateNames, totalValidBallots }: PluralityChartProps) {
  if (scores.length === 0) {
    return (
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center animate-fade-in">
        <p className="text-slate-500">ยังไม่มีข้อมูล Ballot สำหรับคำนวณ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณากรอกหรือสุ่มคะแนนก่อน</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">📊 คะแนนเสียงอันดับที่ 1</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">First Preference Votes — Plurality Voting</p>
      </div>

      {/* Tie Warning */}
      {isTie && (
        <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            ⚠️ ผลเสมอ — <span className="font-semibold">{tiedCandidateNames.join(' และ ')}</span> ได้คะแนนเท่ากัน
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="p-4" style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={scores} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
              formatter={(value) => [`${value} votes`, 'คะแนน']}
            />
            <Bar dataKey="votes" radius={[8, 8, 0, 0]} maxBarSize={60}>
              {scores.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList
                dataKey="votes"
                position="top"
                style={{ fontSize: 12, fontWeight: 600, fill: '#475569' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="px-5 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-slate-500 font-medium">อันดับ</th>
                <th className="text-left py-2 px-3 text-slate-500 font-medium">ผู้สมัคร</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">คะแนน</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">เปอร์เซ็นต์</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((candidate, idx) => {
                const isWinner = idx === 0 && !isTie;
                const isTiedWinner = isTie && candidate.votes === scores[0].votes;
                return (
                  <tr key={candidate.id} className={`border-b border-slate-50 ${isWinner ? 'bg-indigo-50/50' : isTiedWinner ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">{candidate.rank}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className={isWinner ? 'font-bold text-[var(--color-primary-700)]' : isTiedWinner ? 'font-bold text-amber-700' : 'text-slate-700'}>
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
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{candidate.votes}</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{candidate.percent.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Ballot ที่สมบูรณ์ทั้งหมด: {totalValidBallots} ใบ
        </p>
      </div>
    </div>
  );
}
