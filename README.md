# Profit-Driven Discount Optimizer (RetailIQ)

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**Profit-Driven Discount Optimizer (RetailIQ)** is a client-side business decision assistant and retail discount optimization engine. It transforms raw sales transaction CSVs into clean executive KPIs, transparent data-driven findings, and actionable discount recommendations that maximize net profitability.

---

## 🌟 Core Highlights

- **3-Step Business Journey**:
  1. **Upload**: Drag-and-drop CSV parser with header mapping and validation.
  2. **Data Check**: Pre-analysis validation checklist (usable rows, duplicate detection, recognized columns).
  3. **Executive Overview**: Answers *"How is my business doing?"*, *"What's going well?"*, *"What needs attention?"*, and *"What should you do?"* in seconds.
- **Strict Analytical Hierarchy**:
  - **Facts**: Confident direct metrics (Sales, Net Profit, Profit Margin, Orders).
  - **Observations**: Grounded historical patterns (e.g. distinguishing highest sales from highest profit).
  - **Recommendations**: Practical business advice with a transparent *"Why?"* reason.
  - **Model Estimates**: Clearly labeled simulation estimates that avoid over-promising.
- **Sample Size Awareness**: Adapts confidence ratings and gracefully handles small datasets ($N \le 10$) without overfitting machine learning models.
- **Smart Adaptive Charts**: Automatically selects daily vs monthly time series grouping to avoid collapsing short date spans.
- **100% Client-Side & Private**: All parsing, statistical computations, and machine learning occur locally in the browser with zero external server dependencies.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Tailwind CSS, Radix UI Primitives, Lucide Icons, Sonner
- **Data & Charts**: Recharts, PapaParse
- **Machine Learning**: Client-side Ridge Regression, Random Forest, and Gradient Boosted Decision Trees with leak-free train/test splitting
- **Testing**: Vitest, React Testing Library

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Local Run

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/profit-driven-discount-optimizer.git
cd profit-driven-discount-optimizer

# Install dependencies
npm install

# Start development server
npm run dev

# Run unit test suite
npm test

# Build for production
npm run build
```

---

## 🔒 Privacy & Security

All calculations, file parsing, and predictive simulations run **100% in your browser memory**. No data is uploaded or sent over any network.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
