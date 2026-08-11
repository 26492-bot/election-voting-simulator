import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { BordaCandidateScore } from '../../algorithms/borda';

interface BordaChartProps {
  scores: BordaCandidateScore[];
  isTie: boolean;
  tiedCandidateNames: string[];
  totalValidBallots: number;
}

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5', '#059669', '#3b82f6', '#8b5cf6'];

export default function BordaChart({ scores, isTie, tiedCandidateNames, totalValidBallots }: BordaChartProps) {
  if (scores.length === 0) {
    return (
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center animate-fade-in">
        <p className="text-slate-500">ยังไม่มีข้อมูล Ballot สำหรับคำนวณ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณากรอกหรือสุ่มคะแนนก่อน</p>
      </div>
    );
  }

  const chartData = scores.map(s => ({
    name: s.name,
    ...s.breakdown,
    totalScore: s.score,
  }));

  const numRanks = Object.keys(scores[0]?.breakdown || {}).length;
  const ranks = Array.from({ length: numRanks }, (_, i) => `rank${i + 1}`);

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800"> คะแนนรวมตามอันดับ</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Borda Score — Borda Count</p>
      </div>

      {/* Tie Warning */}
      {isTie && (
        <div className="mx-5 mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            ⚠ ผลเสมอ — <span className="font-semibold">{tiedCandidateNames.join(' และ ')}</span> ได้คะแนนเท่ากัน
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="p-4" style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
              formatter={(value, name) => [`${value} คะแนน`, name]}
            />
            <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
            {ranks.map((rank, idx) => (
              <Bar
                key={rank}
                dataKey={rank}
                stackId="a"
                fill={COLORS[idx % COLORS.length]}
                name={`อันดับ ${idx + 1}`}
                maxBarSize={40}
              >
                {/* Only show the total label on the very first bar but positioned at the end of the stack. Recharts doesn't natively support total labels on stacked bars easily without custom shape, but we can just let Tooltip show breakdown. */}
              </Bar>
            ))}
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
                <th className="text-right py-2 px-3 text-slate-500 font-medium">Borda Score</th>
                <th className="text-right py-2 px-3 text-slate-500 font-medium">เปอร์เซ็นต์</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((candidate, idx) => {
                const isWinner = idx === 0 && !isTie;
                const isTiedWinner = isTie && candidate.score === scores[0].score;
                return (
                  <tr key={candidate.id} className={`border-b border-slate-50 ${isWinner ? 'bg-emerald-50/50' : isTiedWinner ? 'bg-amber-50/50' : ''}`}>
                    <td className="py-2.5 px-3 font-semibold text-slate-600">{candidate.rank}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className={isWinner ? 'font-bold text-emerald-700' : isTiedWinner ? 'font-bold text-amber-700' : 'text-slate-700'}>
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
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{candidate.score}</td>
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
