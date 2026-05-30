<div align="center">

![header](https://capsule-render.vercel.app/api?type=waving&color=0:0a0d14,50:1a2035,100:00d4aa&height=220&section=header&text=Moyenne%20Master&fontSize=60&fontColor=00d4aa&animation=fadeIn&fontAlignY=38&desc=Grade%20Calculator%20for%20Master%20Year%201%20%F0%9F%87%A9%F0%9F%87%BF&descAlignY=60&descSize=18&descColor=8a97b8)

<img src="https://media.giphy.com/media/JWuBH9rCO2uZuHBFpm/giphy.gif" width="480" alt="pixel art autumn fall" />

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-00d4aa?style=for-the-badge)](https://moyenne-rds.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made in Algeria](https://img.shields.io/badge/Made%20in-Algeria%20🇩🇿-green?style=for-the-badge)](https://github.com/amine2077)

</div>

---

## ✨ Features

- 📥 **Enter your S1 average** directly — no re-calculation needed
- 📝 **Enter CC & Exam grades** for each S2 subject
- 🧮 **Auto-calculates** S2 average, annual average, and pass/fail/resit status
- 📊 **Subject ranking** — see your best and worst subjects at a glance
- 🌐 **Bilingual** — full English & Arabic (RTL) support, switch instantly
- 🌙 **Dark / Light theme** — toggleable
- 📱 **Responsive** — works on mobile, tablet, and desktop
- ✅ **Input validation** — grades clamped between 0–20 with visual color feedback
- 💾 **Auto-save** — grades saved to LocalStorage, never lose your work
- 🎉 **Celebration animation** — confetti when you pass!

---

<div align="center">
<img src="https://media.giphy.com/media/l4FGnW5bFRHCk6Sm4/giphy.gif" width="480" alt="pixel art mario coder" />
</div>

---

## 📐 Calculation Formula

```
Subject Average  =  (CC × CC%) + (Exam × Exam%)
S2 Average       =  Σ(Subject_avg × Coeff) / Σ(Coeff)
Annual Average   =  (S1_Average + S2_Average) / 2
```

| Status | Condition |
|--------|-----------|
| ✅ Passed | Average ≥ 10.00 |
| ⚠️ Resit | 8.00 ≤ Average < 10.00 |
| ❌ Failed | Average < 8.00 |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [pnpm](https://pnpm.io) ≥ 8

### Installation

```bash
# Clone the repo
git clone https://github.com/amine2077/moyenne-rds.git
cd moyenne-rds

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
moyenne-rds/
├── app/                  # Next.js app router (layout, page)
├── components/           # React components
│   └── grade-calculator/ # Main calculator component
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions & calculator logic
├── public/
│   └── index.html        # Main calculator app
└── styles/               # Global CSS
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org) | Framework & routing |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Vercel](https://vercel.com) | Deployment |
| Vanilla HTML/CSS/JS | Calculator core (zero dependencies) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add something'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

<div align="center">

![footer](https://capsule-render.vercel.app/api?type=waving&color=0:00d4aa,50:1a2035,100:0a0d14&height=120&section=footer)

Made with ❤️ for Algerian students 🇩🇿

⭐ **If this helped you, leave a star!**

</div>
