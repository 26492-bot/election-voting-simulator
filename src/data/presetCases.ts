// ==========================================
// Preset Cases — ชุดข้อมูลตัวอย่างสำหรับการสาธิต
// ==========================================
//
// ข้อมูลจำลองที่ออกแบบไว้ล่วงหน้าเพื่อสาธิตความแตกต่าง
// ของระบบการเลือกตั้งแต่ละวิธี
//
// ⚠ ห้ามสุ่ม — Preference Profile ของแต่ละ Case คงที่
// ==========================================

import type { PresetCase } from '../types';

// ==========================================
// Case 1: ทั้ง 4 ระบบให้ผลตรงกัน (Dominant Candidate)
// ==========================================
// Candidate A ได้คะแนนสูงสุดทุกมิติ:
// - มีคนเลือกเป็นอันดับ 1 มากที่สุด (Plurality)
// - มี Borda Score สูงสุด (Borda)
// - ชนะ majority ในรอบแรก (IRV)
// - ชนะ head-to-head ทุกคู่ (Condorcet winner)
const case1: PresetCase = {
  id: 'case-1-unanimous',
  name: 'กรณีที่ 1: ทั้ง 4 ระบบให้ผลตรงกัน',
  description: 'ผู้สมัคร A ได้รับความนิยมสูงสุดในทุกมิติ ทำให้ทุกระบบเลือก A เป็นผู้ชนะ',
  highlightText: 'แสดงว่าเมื่อมีผู้สมัครที่โดดเด่นชัดเจน ระบบทุกวิธีจะให้ผลตรงกัน',
  voterCount: 15,
  candidates: [
    { id: 'A', name: 'Candidate A' },
    { id: 'B', name: 'Candidate B' },
    { id: 'C', name: 'Candidate C' },
  ],
  ballots: [
    // 8 คนเลือก A > B > C (majority เลือก A อันดับ 1)
    { voterId: 1, ranking: ['A', 'B', 'C'] },
    { voterId: 2, ranking: ['A', 'B', 'C'] },
    { voterId: 3, ranking: ['A', 'B', 'C'] },
    { voterId: 4, ranking: ['A', 'B', 'C'] },
    { voterId: 5, ranking: ['A', 'B', 'C'] },
    { voterId: 6, ranking: ['A', 'C', 'B'] },
    { voterId: 7, ranking: ['A', 'C', 'B'] },
    { voterId: 8, ranking: ['A', 'C', 'B'] },
    // 4 คนเลือก B > A > C
    { voterId: 9, ranking: ['B', 'A', 'C'] },
    { voterId: 10, ranking: ['B', 'A', 'C'] },
    { voterId: 11, ranking: ['B', 'A', 'C'] },
    { voterId: 12, ranking: ['B', 'A', 'C'] },
    // 3 คนเลือก C > A > B
    { voterId: 13, ranking: ['C', 'A', 'B'] },
    { voterId: 14, ranking: ['C', 'A', 'B'] },
    { voterId: 15, ranking: ['C', 'A', 'B'] },
  ],
};

// ==========================================
// Case 2: ระบบให้ผู้ชนะแตกต่างกัน
// ==========================================
// ออกแบบให้:
// - Plurality: A ชนะ (มีคนเลือกอันดับ 1 มากสุด)
// - Borda: B ชนะ (ได้คะแนนรวมสูงสุด)
// - IRV: C ชนะ (ชนะหลัง transfer คะแนน)
// - Condorcet/Copeland: D ชนะ (ชนะ head-to-head มากที่สุด)
const case2: PresetCase = {
  id: 'case-2-different-winners',
  name: 'กรณีที่ 2: ระบบให้ผู้ชนะแตกต่างกัน',
  description: 'แต่ละระบบการเลือกตั้งเลือกผู้ชนะคนละคน แสดงให้เห็นว่า Preference Profile ชุดเดียวกันสามารถให้ผลลัพธ์ที่แตกต่างกันได้',
  highlightText: 'แสดงว่าระบบที่แตกต่างกันอาจให้ผู้ชนะคนละคนจาก Preference Profile เดียวกัน',
  voterCount: 21,
  candidates: [
    { id: 'A', name: 'Candidate A' },
    { id: 'B', name: 'Candidate B' },
    { id: 'C', name: 'Candidate C' },
    { id: 'D', name: 'Candidate D' },
  ],
  ballots: [
    // กลุ่ม 1: 7 คนเลือก A > B > C > D (A ได้ plurality สูงสุด)
    { voterId: 1, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 2, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 3, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 4, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 5, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 6, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 7, ranking: ['A', 'B', 'C', 'D'] },
    // กลุ่ม 2: 5 คนเลือก B > D > C > A (B ได้ borda สูง)
    { voterId: 8, ranking: ['B', 'D', 'C', 'A'] },
    { voterId: 9, ranking: ['B', 'D', 'C', 'A'] },
    { voterId: 10, ranking: ['B', 'D', 'C', 'A'] },
    { voterId: 11, ranking: ['B', 'D', 'C', 'A'] },
    { voterId: 12, ranking: ['B', 'D', 'C', 'A'] },
    // กลุ่ม 3: 5 คนเลือก C > D > B > A (C + D ได้ transfer)
    { voterId: 13, ranking: ['C', 'D', 'B', 'A'] },
    { voterId: 14, ranking: ['C', 'D', 'B', 'A'] },
    { voterId: 15, ranking: ['C', 'D', 'B', 'A'] },
    { voterId: 16, ranking: ['C', 'D', 'B', 'A'] },
    { voterId: 17, ranking: ['C', 'D', 'B', 'A'] },
    // กลุ่ม 4: 4 คนเลือก D > C > B > A (D ชนะ pairwise)
    { voterId: 18, ranking: ['D', 'C', 'B', 'A'] },
    { voterId: 19, ranking: ['D', 'C', 'B', 'A'] },
    { voterId: 20, ranking: ['D', 'C', 'B', 'A'] },
    { voterId: 21, ranking: ['D', 'C', 'B', 'A'] },
  ],
};

// ==========================================
// Case 3: ความแตกต่างของ Borda และ Plurality
// ==========================================
// แสดง Borda Count Paradox:
// - Plurality: A ชนะ (มีคนเลือกอันดับ 1 มากสุด แม้คนอื่นไม่ชอบ)
// - Borda: B ชนะ (ได้คะแนนรวมสูงกว่าเพราะอยู่อันดับ 2 บ่อย)
const case3: PresetCase = {
  id: 'case-3-borda-vs-plurality',
  name: 'กรณีที่ 3: ความแตกต่างของ Borda และ Plurality',
  description: 'Candidate A ชนะด้วย Plurality เพราะมีคนเลือกเป็นอันดับ 1 มากสุด แต่ Candidate B ชนะด้วย Borda เพราะเป็นที่ยอมรับในวงกว้างกว่า',
  highlightText: 'แสดง "Borda Count Paradox" — ผู้สมัครที่มีคนเลือกอันดับ 1 มากที่สุดอาจไม่ใช่ผู้ที่ได้รับความนิยมโดยรวมสูงสุด',
  voterCount: 15,
  candidates: [
    { id: 'A', name: 'Candidate A' },
    { id: 'B', name: 'Candidate B' },
    { id: 'C', name: 'Candidate C' },
    { id: 'D', name: 'Candidate D' },
  ],
  ballots: [
    // กลุ่ม 1: 6 คนเลือก A > B > C > D (A ได้ plurality สูงสุด)
    { voterId: 1, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 2, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 3, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 4, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 5, ranking: ['A', 'B', 'C', 'D'] },
    { voterId: 6, ranking: ['A', 'B', 'C', 'D'] },
    // กลุ่ม 2: 5 คนเลือก B > C > D > A (B อันดับ 1, A อันดับสุดท้าย)
    { voterId: 7, ranking: ['B', 'C', 'D', 'A'] },
    { voterId: 8, ranking: ['B', 'C', 'D', 'A'] },
    { voterId: 9, ranking: ['B', 'C', 'D', 'A'] },
    { voterId: 10, ranking: ['B', 'C', 'D', 'A'] },
    { voterId: 11, ranking: ['B', 'C', 'D', 'A'] },
    // กลุ่ม 3: 4 คนเลือก C > B > D > A (B อันดับ 2 เสมอ ได้ Borda สูง)
    { voterId: 12, ranking: ['C', 'B', 'D', 'A'] },
    { voterId: 13, ranking: ['C', 'B', 'D', 'A'] },
    { voterId: 14, ranking: ['C', 'B', 'D', 'A'] },
    { voterId: 15, ranking: ['C', 'B', 'D', 'A'] },
  ],
};

// ==========================================
// Case 4: Condorcet Cycle (ไม่มี Condorcet Winner)
// ==========================================
// แสดง Condorcet Paradox: A > B > C > A (วงจร)
// ทำให้ไม่มีผู้สมัครที่ชนะ head-to-head ทุกคู่
// Copeland Score อาจเสมอกัน
const case4: PresetCase = {
  id: 'case-4-condorcet-cycle',
  name: 'กรณีที่ 4: Condorcet Cycle',
  description: 'ไม่มี Condorcet Winner เนื่องจากเกิดวงจร: A ชนะ B, B ชนะ C, แต่ C ชนะ A แสดงว่าระบบ Condorcet/Copeland ไม่สามารถหาผู้ชนะที่ชัดเจนได้เสมอไป',
  highlightText: 'แสดง "Condorcet Paradox" — การเปรียบเทียบแบบคู่อาจเกิดวงจรที่ไม่มีผู้ชนะที่ชนะทุกคู่',
  voterCount: 9,
  candidates: [
    { id: 'A', name: 'Candidate A' },
    { id: 'B', name: 'Candidate B' },
    { id: 'C', name: 'Candidate C' },
  ],
  ballots: [
    // กลุ่ม 1: 3 คนเลือก A > B > C
    // A ชนะ B (A preferred by group 1+3 = 6 vs 3)
    // ไม่สิ — ต้องคำนวณให้ถูก
    //
    // สำหรับ Condorcet Cycle (A>B, B>C, C>A):
    // 3 คน: A > B > C
    // 3 คน: B > C > A
    // 3 คน: C > A > B
    //
    // A vs B: A preferred by group 1 (3) + group 3 ... 
    //   Group 1: A > B ✓ (3 votes)
    //   Group 2: B > A ✓ (3 votes)
    //   Group 3: C > A > B, so A > B ✓ (3 votes)
    //   A beats B: 6 vs 3 ✓
    //
    // B vs C:
    //   Group 1: A > B > C, so B > C ✓ (3 votes)
    //   Group 2: B > C ✓ (3 votes)
    //   Group 3: C > A > B, so C > B ✓ (3 votes)
    //   B beats C: 6 vs 3 ✓
    //
    // A vs C:
    //   Group 1: A > B > C, so A > C ✓ (3 votes)
    //   Group 2: B > C > A, so C > A ✓ (3 votes)
    //   Group 3: C > A > B, so C > A ✓ (3 votes)
    //   C beats A: 6 vs 3 ✓
    //
    // So: A>B, B>C, C>A → Cycle! ✓

    // Group 1: A > B > C
    { voterId: 1, ranking: ['A', 'B', 'C'] },
    { voterId: 2, ranking: ['A', 'B', 'C'] },
    { voterId: 3, ranking: ['A', 'B', 'C'] },
    // Group 2: B > C > A
    { voterId: 4, ranking: ['B', 'C', 'A'] },
    { voterId: 5, ranking: ['B', 'C', 'A'] },
    { voterId: 6, ranking: ['B', 'C', 'A'] },
    // Group 3: C > A > B
    { voterId: 7, ranking: ['C', 'A', 'B'] },
    { voterId: 8, ranking: ['C', 'A', 'B'] },
    { voterId: 9, ranking: ['C', 'A', 'B'] },
  ],
};

// ==========================================
// Export — รวม Preset Cases ทั้งหมด
// ==========================================

export const PRESET_CASES: PresetCase[] = [case1, case2, case3, case4];

/**
 * ค้นหา Preset Case จาก ID
 */
export function getPresetCaseById(id: string): PresetCase | undefined {
  return PRESET_CASES.find(c => c.id === id);
}
