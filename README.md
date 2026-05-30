<div align="center">

# 📊 Moyenne Master

### Grade Calculator for Master Year 1 — Algeria

**Calculate your S1 & S2 averages, annual average, and subject ranking in seconds.**  
Bilingual 🇬🇧 English / 🇩🇿 Arabic · Dark & Light mode · Mobile friendly

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-00d4aa?style=for-the-badge&logo=vercel)](https://moyenne-rds.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

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

## 🖥️ Preview

> Dark mode · English

| S1 & Annual Average | S2 Subjects | Subject Ranking |
|---|---|---|
| Enter your S1 grade and see your annual average update in real time | Enter CC and Exam for each of the 8 S2 subjects | Subjects ranked from best to worst grade |

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

### Build for Production

```bash
pnpm build
pnpm start
```

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
│   └── index.html        # Main calculator app (standalone)
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

## 🌍 Deployment

This project is deployed on **Vercel**. Every push to `main` triggers an automatic deployment.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amine2077/moyenne-rds)

---

## 🤝 Contributing

Contributions are welcome! If you're a student and want to add your specialty's subjects or improve the app:

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add something'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ for Algerian students 🇩🇿

⭐ If this helped you, give it a star!

</div>
