# Redesign ResultsPage เป็น Professional Academic Dashboard

ปรับหน้า "เปรียบเทียบผล" จากเลย์เอาต์แบบ Stack ยาวเรียงกัน 4 ระบบ (ที่ดูเหมือนรายงาน AI generative) → **Interactive Dashboard แบบ Tab-based** ที่มี Sidebar เลือกระบบนับคะแนน พร้อมยกระดับ Visual, Typography, และ Micro-interactions ทั้งหมด

## Proposed Changes

### ResultsPage Redesign

#### [MODIFY] [ResultsPage.tsx](file:///c:/Election%20Voting%20Simulato/src/pages/ResultsPage.tsx)

**เขียนใหม่ทั้งไฟล์** — เปลี่ยนโครงสร้างทั้งหมดตาม 5 จุดที่วิเคราะห์ไว้:

**1. Layout: Tab-based Sidebar + Content Panel**
- เพิ่ม `useState` สำหรับ `activeTab` เก็บระบบที่เลือก (`'plurality' | 'borda' | 'irv' | 'copeland'`)
- Sidebar ด้านซ้าย (240px) แสดงเมนูระบบ 4 ตัวพร้อม icon + ชื่อ + สถานะผู้ชนะ/เสมอ
- Content Panel ด้านขวาแสดงข้อมูลเฉพาะระบบที่เลือก
- บนมือถือ Sidebar → Horizontal Tab Bar ด้านบน

**2. Card Design & Typography Token**
- Card ใช้ `bg-white rounded-2xl p-6 border border-slate-100 shadow-sm` — ขอบบาง ละมุนตา
- KPI Number: `text-3xl font-extrabold tracking-tight text-slate-900`
- Sub-label: `text-xs font-semibold text-slate-400 uppercase tracking-wider`
- Section title: `text-lg font-bold` พร้อม description `text-xs text-slate-400`

**3. Ranking Visualization ยกระดับ**
- เปลี่ยนจาก HTML table + progress bar เล็กๆ → **Recharts Horizontal BarChart** สำหรับแต่ละระบบ
- เพิ่ม **Ranking Card** แบบ modern: มี rank badge (🥇🥈🥉), gradient background สำหรับผู้ชนะ, hover animation
- Copeland ใช้ Recharts BarChart แสดง wins/losses/ties stack bar

**4. Tie Banner ปรับ Subtle**
- จากสีเหลืองเข้มจนสะดุดตา → `bg-amber-50/60 border border-amber-200/60 rounded-xl` อ่อนโยน
- ขนาดเล็กลง ไม่กินพื้นที่

**5. KPI Stats Panel**
- 4 กล่อง KPI ย้ายไปอยู่ด้านบนของ content panel
- ตัวเลขใหญ่ขึ้น (`text-3xl font-extrabold`), label เล็กลง (`text-[11px] uppercase tracking-wider`)
- เพิ่ม icon สำหรับแต่ละ KPI

---

### CSS Additions

#### [MODIFY] [index.css](file:///c:/Election%20Voting%20Simulato/src/index.css)

- เพิ่ม animation `@keyframes slideInLeft` สำหรับ Sidebar transition
- เพิ่ม animation `@keyframes countUp` สำหรับ KPI number entry
- เพิ่ม `.results-sidebar` utility classes
- เพิ่ม `.tab-active` indicator styles

---

## Verification Plan

### Manual Verification
- รัน `npm run dev` แล้วไปที่ `/results`
- ตรวจสอบว่า Tab Sidebar ทำงาน (คลิกเปลี่ยนระบบแล้ว content เปลี่ยนตาม)
- ตรวจสอบ responsive: บน mobile Tab Bar จะเปลี่ยนเป็น horizontal
- ตรวจสอบ hover effects + transitions
- ตรวจสอบ Recharts render ถูกต้อง
- ตรวจสอบ typography hierarchy ชัดเจน (ตัวเลข KPI โดดเด่น, label เล็กลง)
