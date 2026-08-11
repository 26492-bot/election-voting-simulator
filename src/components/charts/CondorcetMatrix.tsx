// ==========================================
// CondorcetMatrix — Pairwise comparison matrix + Copeland scores
// ==========================================

import { useMemo } from 'react';
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
  ReferenceLine,
} from 'recharts';
import { CheckCircle2, AlertTriangle, Scale } from 'lucide-react';
import type { CopelandOutput } from '../../algorithms/copeland';
import { useElection } from '../../context/ElectionContext';

interface CondorcetMatrixProps {
  output: CopelandOutput;
}

const COLORS_POS = '#6366f1';
const COLORS_NEG = '#ef4444';
const COLORS_ZERO = '#94a3b8';

export default function CondorcetMatrix({ output }: CondorcetMatrixProps) {
  const { election } = useElection();

  const candidateMap = useMemo(() => {
    const map = new Map<string, string>();
    if (election) {
      election.candidates.forEach((c) => {
        map.set(c.id, c.name);
      });
    }
    return map;
  }, [election]);

  if (output.totalValidBallots === 0) {
    return (
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 p-8 text-center animate-fade-in">
        <p className="text-slate-500">ยังไม่มีข้อมูล Ballot สำหรับคำนวณ</p>
        <p className="text-xs text-slate-400 mt-1">กรุณากรอกหรือสุ่มคะแนนก่อน</p>
      </div>
    );
  }

  // Sorted candidates by score
  const sortedCopeland = [...output.scores].sort((a, b) => b.score - a.score);
  
  const isOverallTie = output.status === 'tie';

  // For the matrix, we need to order candidates nicely. Let's use the sorted order or original order. 
  // Let's use original candidate order for the matrix
  const matrixCandidates = election?.candidates || [];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Condorcet Winner / Tie Notice */}
      <div className={`rounded-[var(--radius-card)] border p-4 ${
        isOverallTie
          ? 'bg-amber-50 border-amber-200'
          : 'bg-indigo-50 border-indigo-200'
      }`}>
        {isOverallTie ? (
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                ⚠️ ผลเสมอ (Overall Tie)
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                <span className="font-bold">{output.winnerNames.join(' และ ')}</span> มี Copeland Score สูงสุดเท่ากัน
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-indigo-600" />
            <p className="text-sm text-indigo-800">
              <span className="font-bold">{output.winnerNames[0]}</span> ชนะแบบ Copeland's Rule ด้วยคะแนน {output.scores.find(s => s.id === output.winners[0])?.score} คะแนน
            </p>
          </div>
        )}
      </div>

      {/* Pairwise Matrix */}
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">🔢 ตาราง Pairwise Comparison</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Head-to-Head Comparison Matrix</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr>
                <th className="py-2.5 px-3 text-left text-slate-500 font-medium">↓ ชนะ →</th>
                {matrixCandidates.map(c => (
                  <th key={c.id} className="py-2.5 px-3 text-slate-700 font-bold">{c.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixCandidates.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="py-3 px-3 text-left font-bold text-slate-700">{row.name}</td>
                  {matrixCandidates.map((col) => {
                    const isDiag = row.id === col.id;
                    const numVal = isDiag ? 0 : (output.pairwiseMatrix[row.id]?.[col.id] || 0);
                    const oppositeVal = isDiag ? 0 : (output.pairwiseMatrix[col.id]?.[row.id] || 0);
                    
                    const isWin = !isDiag && numVal > oppositeVal;
                    const isLose = !isDiag && numVal < oppositeVal;

                    return (
                      <td
                        key={col.id}
                        className={`py-3 px-3 font-semibold transition-colors ${
                          isDiag
                            ? 'bg-slate-100 text-slate-400'
                            : isWin
                            ? 'bg-emerald-50 text-emerald-700'
                            : isLose
                            ? 'bg-red-50 text-red-600'
                            : 'text-slate-600' // Tie
                        }`}
                      >
                        {isDiag ? '—' : numVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-slate-400 mt-3 px-1">
            ตัวเลขแสดงจำนวนผู้มีสิทธิเลือกตั้งที่ชอบผู้สมัครแถวมากกว่าผู้สมัครคอลัมน์ •
            <span className="text-emerald-600"> สีเขียว</span> = ชนะ •
            <span className="text-red-500"> สีแดง</span> = แพ้
          </p>
        </div>
      </div>

      {/* Copeland Scores Bar Chart */}
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">📊 Copeland Score</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">ชนะ = +1 / เสมอ = 0 / แพ้ = -1</p>
        </div>

        <div className="p-4" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedCopeland} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
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
              />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                }}
                formatter={(value: any) => [`${Number(value) > 0 ? '+' : ''}${value}`, 'Copeland Score']}
              />
              <ReferenceLine y={0} stroke="#cbd5e1" />
              <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={60}>
                {sortedCopeland.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.score > 0 ? COLORS_POS : entry.score < 0 ? COLORS_NEG : COLORS_ZERO}
                  />
                ))}
                <LabelList
                  dataKey="score"
                  content={(props: any) => {
                    const { x, y, width, height, value } = props;
                    const numValue = Number(value);
                    const isNegative = numValue < 0;
                    // For negative bars, y is the top (zero line) and y+height is the bottom tip
                    // For positive bars, y is the top tip
                    const yPos = isNegative ? y + height + 15 : y - 10;
                    return (
                      <text
                        x={x + width / 2}
                        y={yPos}
                        fill="#475569"
                        textAnchor="middle"
                        fontSize={12}
                        fontWeight={600}
                      >
                        {numValue > 0 ? `+${numValue}` : `${numValue}`}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pairwise Results */}
      <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">⚔️ ผลการเปรียบเทียบคู่</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Pairwise Results</p>
        </div>
        <div className="p-4 overflow-x-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {output.pairwiseResults.map((p, idx) => {
              const nameA = candidateMap.get(p.candidateA) ?? p.candidateA;
              const nameB = candidateMap.get(p.candidateB) ?? p.candidateB;
              
              return (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className={`text-sm font-bold ${p.result === 'A_WIN' ? 'text-[var(--color-primary-600)]' : 'text-slate-500'}`}>
                    {nameA}
                  </span>
                  <div className="flex-1 flex items-center gap-1.5 justify-center">
                    <span className="text-xs text-slate-500">{p.aVotes}</span>
                    <span className="text-[10px] text-slate-300">vs</span>
                    <span className="text-xs text-slate-500">{p.bVotes}</span>
                  </div>
                  <span className={`text-sm font-bold ${p.result === 'B_WIN' ? 'text-[var(--color-primary-600)]' : 'text-slate-500'}`}>
                    {nameB}
                  </span>
                  {p.result === 'A_WIN' && (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  )}
                  {p.result === 'B_WIN' && (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                  )}
                  {p.result === 'TIE' && (
                    <Scale size={14} className="text-amber-500 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
