<div align="center">
  <h1>🗳️ Election Voting Method Simulator</h1>
  <p><b>ระบบจำลองการเลือกตั้งและเปรียบเทียบวิธีการนับคะแนน</b></p>
  <p>โครงงานคณิตศาสตร์ที่จำลองการลงคะแนนเสียง (Ranked-choice voting) และประมวลผลด้วย 4 อัลกอริทึมที่แตกต่างกัน</p>
</div>

<br />

## 🌟 แนะนำโปรเจกต์ (Introduction)

ระบบนี้สร้างขึ้นเพื่อเปรียบเทียบว่า "ในสถานการณ์การเลือกตั้งเดียวกัน หากใช้วิธีการนับคะแนน (Voting Method) ที่แตกต่างกัน จะทำให้ได้ผู้ชนะคนเดียวกันหรือไม่?" 

ผู้ใช้สามารถกำหนดรายชื่อผู้สมัคร สุ่มหรือกรอกคะแนนความชอบ (Ballot) แบบจัดอันดับ (Ranking) และดูผลลัพธ์แบบ Real-time ผ่าน Interactive Dashboard 

## ⚖️ 4 วิธีการนับคะแนน (Voting Methods)

1. **Plurality Voting (ระบบเสียงข้างมาก)**
   - นับคะแนนเฉพาะ "ผู้สมัครที่อยู่ในอันดับ 1" ของแต่ละบัตรลงคะแนนเท่านั้น
   - เป็นระบบที่เข้าใจง่ายที่สุด แต่มักจะเกิดปัญหาเสียงแตก (Vote splitting)

2. **Borda Count (ระบบรวมคะแนนตามอันดับ)**
   - ให้คะแนนตามลำดับความชอบ เช่น มีผู้สมัคร 5 คน อันดับ 1 ได้ 5 คะแนน, อันดับ 2 ได้ 4 คะแนน ไล่ลงไปจนถึงอันดับสุดท้ายได้ 1 คะแนน
   - เป็นระบบที่สะท้อนความชอบโดยรวมได้ดี แต่อาจเกิดปัญหาเรื่องการโหวตเชิงกลยุทธ์

3. **Instant Runoff Voting / IRV (ระบบคัดออกและโอนคะแนน)**
   - หากยังไม่มีผู้ใดได้คะแนนอันดับ 1 เกิน 50% ระบบจะคัดผู้สมัครที่ได้คะแนนน้อยที่สุดออก แล้วโอนคะแนนไปให้อันดับถัดไปในบัตรนั้น
   - วนลูปไปเรื่อย ๆ จนกว่าจะมีผู้ชนะเด็ดขาด

4. **Condorcet Method — Copeland's Rule (ระบบเปรียบเทียบคู่)**
   - นำผู้สมัครทุกคนมาแข่งกันแบบพบกันหมด (Head-to-Head) ในทุกคู่ที่เป็นไปได้
   - ผู้สมัครที่ชนะคู่แข่งจะได้ +1, เสมอ 0, แพ้ -1 นำมารวมเป็น Copeland Score 
   - เป็นระบบที่พิสูจน์ผู้ชนะในทางคณิตศาสตร์ได้อย่างแม่นยำที่สุด แต่ซับซ้อนในการคำนวณ

## 🚀 ฟีเจอร์หลัก (Key Features)

- **Setup Election:** ตั้งค่าผู้มีสิทธิเลือกตั้งและรายชื่อผู้สมัครได้อย่างอิสระ
- **Ballot Input & Randomization:** สามารถกรอกการจัดอันดับได้ด้วยตนเอง หรือใช้ระบบจำลองสุ่มบัตรคะแนนทีละหลายร้อยใบได้อย่างรวดเร็ว
- **Real-time Dashboard:** แดชบอร์ดแสดงผลการเลือกตั้ง พร้อมกราฟิก Visualization ที่เข้าใจง่าย (Bar Charts, Trend Lines, Pairwise Matrices)
- **Detailed Results:** หน้าสรุปผลเปรียบเทียบผู้ชนะและตารางคะแนนเชิงลึกของทุกระบบในที่เดียว
- **Robust Algorithms:** คำนวณรวดเร็ว แม่นยำ และจัดการกรณีผลเสมอ (Ties) รวมถึงบัตรเสีย (Invalid Ballots) ได้อย่างสมบูรณ์

## 💻 Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 + Vanilla CSS (Custom Design System)
- **Routing:** React Router v7
- **Charts:** Recharts
- **Icons:** Lucide React
- **Testing:** Vitest

## 🛠️ วิธีการติดตั้งและรันโปรเจกต์ (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/election-voting-simulator.git
   cd election-voting-simulator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Run Unit Tests:**
   ```bash
   npm run test
   ```

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
src/
├── algorithms/       # ลอจิกการคำนวณทั้ง 4 วิธี (Plurality, Borda, IRV, Copeland) พร้อม Unit tests
├── components/       # UI Components แยกส่วน (Charts, Dashboard, Layout)
├── context/          # Global State Management (ElectionContext)
├── pages/            # หน้าเว็บหลัก (Setup, Ballots, Dashboard, Results)
├── types/            # TypeScript Definitions
└── index.css         # Design System, Colors, and Global Styles
```

## 📜 License

โปรเจกต์นี้ใช้งานภายใต้ลิขสิทธิ์ [MIT License](LICENSE)
