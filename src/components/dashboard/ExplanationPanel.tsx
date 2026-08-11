// ==========================================
// ExplanationPanel — Method description card
// ==========================================

import { Lightbulb } from 'lucide-react';
import type { VotingMethod } from '../../types';

const EXPLANATIONS: Record<VotingMethod, { title: string; titleEn: string; text: string }> = {
  plurality: {
    title: 'ระบบเสียงข้างมาก',
    titleEn: 'Plurality Voting',
    text: 'Plurality Voting เลือกผู้สมัครที่ได้รับคะแนนเสียงอันดับที่ 1 มากที่สุด โดยไม่ได้พิจารณาอันดับอื่น ระบบนี้เป็นวิธีที่ง่ายที่สุดและใช้กันอย่างแพร่หลาย แต่อาจทำให้ผู้สมัครที่ได้รับการสนับสนุนจากคนส่วนน้อยเป็นผู้ชนะได้',
  },
  borda: {
    title: 'ระบบรวมคะแนนตามอันดับ',
    titleEn: 'Borda Count',
    text: 'Borda Count ให้คะแนนตามอันดับของผู้สมัคร ผู้สมัครที่ได้รับการจัดอันดับสูงจากผู้มีสิทธิเลือกตั้งจำนวนมากจะมีคะแนนรวมสูง ระบบนี้พิจารณาความชอบทุกอันดับ ไม่ใช่แค่อันดับ 1',
  },
  irv: {
    title: 'ระบบคัดออกและโอนคะแนน',
    titleEn: 'Instant Runoff Voting (IRV)',
    text: 'IRV จะตัดผู้สมัครที่มีคะแนนน้อยที่สุดออกทีละรอบ และโอนคะแนนไปยังผู้สมัครอันดับถัดไปจนกว่าจะมีผู้สมัครได้คะแนนเกิน 50% ระบบนี้ช่วยให้ผู้ชนะมีเสียงสนับสนุนจากคนส่วนใหญ่',
  },
  condorcet: {
    title: 'ระบบเปรียบเทียบคู่',
    titleEn: 'Condorcet Method (Copeland\'s Rule)',
    text: 'Condorcet เปรียบเทียบผู้สมัครแบบตัวต่อตัว ผู้สมัครที่สามารถเอาชนะผู้สมัครอื่นทุกคนจะเป็น Condorcet Winner หากไม่มี Condorcet Winner จะใช้ Copeland\'s Rule ซึ่งนับจำนวนชนะ-แพ้ ในทุกคู่แข่ง',
  },
};

interface ExplanationPanelProps {
  method: VotingMethod;
}

export default function ExplanationPanel({ method }: ExplanationPanelProps) {
  const info = EXPLANATIONS[method];

  return (
    <div className="bg-[var(--color-surface-card)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200/60 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
        <div className="p-1.5 bg-amber-100 rounded-lg">
          <Lightbulb size={16} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-amber-900">💡 หลักการทำงาน</h3>
          <p className="text-[11px] text-amber-600">How it works</p>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-2">
          <span className="text-sm font-bold text-[var(--color-primary-800)]">{info.title}</span>
          <span className="text-xs text-slate-400 ml-2">{info.titleEn}</span>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">{info.text}</p>
      </div>
    </div>
  );
}
