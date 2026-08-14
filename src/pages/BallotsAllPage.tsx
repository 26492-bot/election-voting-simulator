// ==========================================
// Ballots All Page — Manage all ballots data
// ==========================================

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LayoutDashboard,
  FileSpreadsheet,
  Trash2,
  Edit,
  Plus,
  Upload,
  Download,
  Dices,
  AlertCircle,
  Users
} from 'lucide-react';
import { useElection } from '../context/ElectionContext';
import { exportBallotsToCSV, importBallotsFromCSV } from '../utils/csv';
import { generateRandomBallots } from '../utils/ballotGenerator';

export default function BallotsAllPage() {
  const navigate = useNavigate();
  const { election, updateBallots, clearBallots, removeBallot, updateVoterCount } = useElection();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If no election data, redirect to setup
  useEffect(() => {
    if (!election) {
      navigate('/setup');
    }
  }, [election, navigate]);

  if (!election) return null;

  const { voterCount, candidates, ballots } = election;

  const handleAddBallot = () => {
    // Find the next available voterId
    const maxVoterId = Math.max(0, ...ballots.map(b => b.voterId));
    const nextVoterId = Math.max(maxVoterId + 1, voterCount + 1);
    
    // Automatically increment voter count if needed
    if (nextVoterId > voterCount) {
      updateVoterCount(nextVoterId);
    }
    
    navigate('/ballots', { state: { selectedVoterId: nextVoterId } });
  };

  const handleEditBallot = (voterId: number) => {
    // Note: To make BallotsPage select this voter, you'd typically use URL params or React Router state.
    // For now, we'll navigate and the user might need to select them, or we can update BallotsPage later if needed.
    // Alternatively, setting it in context or local storage. But let's assume we can pass state.
    navigate('/ballots', { state: { selectedVoterId: voterId } });
  };

  const handleDeleteBallot = (voterId: number) => {
    removeBallot(voterId);
    setShowDeleteConfirm(null);
  };

  const handleClearAll = () => {
    clearBallots();
    setShowClearConfirm(false);
  };

  const handleRandomizeAll = () => {
    const newBallots = generateRandomBallots(voterCount, candidates);
    updateBallots(newBallots);
  };

  const handleExportCSV = () => {
    const csvContent = exportBallotsToCSV(ballots, candidates);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'election_ballots.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvContent = event.target?.result as string;
      const { ballots: importedBallots, errors } = importBallotsFromCSV(csvContent, candidates);
      
      if (errors.length > 0) {
        setImportErrors(errors);
      } else {
        updateBallots(importedBallots);
        
        // Update voterCount if necessary to match the highest voter ID imported
        const maxVoterId = Math.max(0, ...importedBallots.map(b => b.voterId));
        if (maxVoterId > voterCount) {
          updateVoterCount(maxVoterId);
        }
        
        setImportErrors([]);
        alert('นำเข้าข้อมูลสำเร็จ');
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const stats = [
    { label: 'ผู้มีสิทธิเลือกตั้ง', value: voterCount, icon: <Users size={18} /> },
    { label: 'กรอก Ballot แล้ว', value: ballots.length, icon: <FileSpreadsheet size={18} /> },
    { label: 'จำนวนผู้สมัคร', value: candidates.length, icon: <LayoutDashboard size={18} /> },
    { label: 'อันดับต่อ Ballot', value: candidates.length, icon: <Dices size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-surface)] flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[var(--color-primary-950)] flex items-center gap-2">
              ข้อมูล Ballot
            </h1>
            <p className="text-xs text-slate-500">ตารางแสดงอันดับที่ผู้ลงคะแนนเลือกให้ผู้สมัคร</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-primary-600)] text-white rounded-lg text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors shadow-sm shrink-0"
          >
            <LayoutDashboard size={16} className="hidden sm:block" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">กลับ</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col h-full max-w-7xl mx-auto w-full">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-[var(--radius-card)] shadow-sm border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-600)] flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {importErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-[var(--radius-card)] p-4 animate-fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-[var(--color-error)] mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold text-red-800 text-sm">พบข้อผิดพลาดในการนำเข้าข้อมูล (Import Errors):</p>
                <ul className="list-disc pl-5 text-sm text-red-700">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={() => setImportErrors([])}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ปิด
              </button>
            </div>
          </div>
        )}

        {/* Table & Actions Card */}
        <div className="bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] border border-slate-200 flex flex-col flex-1 min-h-0">
          
          {/* Action Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between bg-slate-50 rounded-t-[var(--radius-card)]">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleAddBallot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
              >
                <Plus size={16} />
                เพิ่ม Ballot
              </button>
              
              <button
                onClick={handleRandomizeAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <Dices size={16} />
                สุ่ม Ballot ทั้งหมด
              </button>
              
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={ballots.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
                ล้างทั้งหมด
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <div>
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImportCSV}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  <Upload size={16} />
                  Import CSV
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                disabled={ballots.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto relative p-4">
            {ballots.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
                <FileSpreadsheet size={48} className="opacity-20" />
                <p>ยังไม่มีข้อมูล Ballot</p>
              </div>
            ) : (
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm rounded-t-lg">
                  <tr>
                    <th className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200">
                      Voter
                    </th>
                    {Array.from({ length: candidates.length }, (_, i) => (
                      <th key={i} className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200 text-center">
                        อันดับ {i + 1}
                      </th>
                    ))}
                    <th className="py-3 px-4 font-bold text-slate-700 border-b border-slate-200 text-center min-w-[120px]">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ballots.map(ballot => (
                    <tr key={ballot.voterId} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        คนที่ {ballot.voterId}
                      </td>
                      {Array.from({ length: candidates.length }, (_, i) => {
                        const candidateId = ballot.ranking[i];
                        const candidate = candidates.find(c => c.id === candidateId);
                        return (
                          <td key={i} className="py-3 px-4 text-center">
                            {candidate ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="w-6 h-6 rounded bg-[var(--color-primary-100)] text-[var(--color-primary-700)] flex items-center justify-center text-xs font-bold">
                                  {candidate.id}
                                </span>
                                <span className="text-[10px] text-slate-500 truncate w-16" title={candidate.name}>
                                  {candidate.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditBallot(ballot.voterId)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                            title="แก้ไข"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(ballot.voterId)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="ลบ"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={24} className="text-[var(--color-error)]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">ล้างข้อมูล Ballot ทั้งหมด</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              คุณแน่ใจหรือไม่? ข้อมูลการลงคะแนน (Ballots) ทั้งหมด {ballots.length} ใบจะถูกลบ ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-error)] text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                ล้างข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Ballot Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[var(--radius-card)] shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={24} className="text-[var(--color-error)]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">ลบข้อมูล Ballot</h3>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              คุณแน่ใจหรือไม่ที่จะลบข้อมูล Ballot ของ คนที่ {showDeleteConfirm}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteBallot(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-[var(--radius-button)] bg-[var(--color-error)] text-white font-medium text-sm hover:bg-red-600 transition-colors"
              >
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
