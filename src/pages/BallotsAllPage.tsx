// Placeholder — Ballots All Page
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function BallotsAllPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex items-center justify-center p-8">
      <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-8 text-center max-w-md">
        <h1 className="text-2xl font-bold text-[var(--color-primary-800)] mb-2">📋 ข้อมูลทั้งหมด</h1>
        <p className="text-slate-500 mb-4">หน้านี้อยู่ระหว่างพัฒนา</p>
        <button
          onClick={() => navigate('/setup')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-button)] bg-[var(--color-primary-600)] text-white font-medium text-sm hover:bg-[var(--color-primary-700)] transition-colors"
        >
          <ArrowLeft size={16} />
          กลับไปตั้งค่า
        </button>
      </div>
    </div>
  );
}
