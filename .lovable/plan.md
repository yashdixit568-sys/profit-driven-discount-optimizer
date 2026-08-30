## Goal

Produce a polished synopsis document for **"Retail Sales Analysis and Discount Optimization Web Application"** that follows the exact same structural format as the uploaded PhishGuard PDF — same numbered sections, same sub-section depth (4.1–4.x, 6.1–6.x, 8.1–8.x), same tone, same use of bullet checkmarks and step-by-step flowchart blocks, and similar length (~15–18 pages of content).

## Format to mirror (from PhishGuard PDF)

```text
1. INTRODUCTION                          (~1.5 pages, multi-paragraph narrative)
2. NEED OF WORK / REASON FOR SELECTION   (~2 pages, with bulleted aims)
3. PROBLEM STATEMENT                     (~2 pages, bulleted attack/limitation list,
                                          ends with a boxed core problem statement)
4. PROPOSED TECHNIQUES OR METHODS        (~5 pages, broken into 4.1 – 4.8)
   4.1 System Overview / Architecture
   4.2 Module 1 (CSV Ingestion & Schema Discovery)
   4.3 Module 2 (Dynamic Feature Engineering)
   4.4 Module 3 (ML Model Training — Linear / RF / Gradient Boosting)
   4.5 Module 4 (Discount Optimization Engine)
   4.6 Combined Decision / Recommendation Engine
   4.7 Frontend & Backend Integration (React + Vite client-side)
   4.8 Explainable Output System (KPIs, charts, metrics, warnings)
5. PROJECT FLOWCHART                     (Step 1 → Step N, with ✅/✔/🔲 markers)
6. SOFTWARE                              (6.1 – 6.6: Language, Frameworks, Libraries,
                                          OS, Browser, Server Environment)
7. HARDWARE REQUIREMENTS                 (Minimum + Recommended)
8. OTHER RESOURCES                       (8.1 – 8.7: Datasets, Internet, Pre-built
                                          assets, Documentation, Testing, Browser tools)
```

## Content I will write (mapped to the project)

- **Introduction** — retail data explosion, importance of pricing/discount decisions, why a privacy-first browser-based ML tool matters, brief intro of the app's three pillars (auto analysis, ML profit prediction, discount optimization).
- **Need of Work** — limitations of intuition-based pricing, cost/complexity of BI tools (Tableau/PowerBI), privacy issues with cloud upload, schema rigidity of existing dashboards, educational value. Ends with bulleted project aims.
- **Problem Statement** — schema heterogeneity, dynamic feature extraction, leak-free training, profit-maximizing discount search, usability for non-technical users. Closes with a highlighted core problem statement.
- **Proposed Techniques (4.1–4.8)** — full technical methodology: CSV alias/heuristic parsing, `discoverSchema()`, target encoding with smoothing, Z-score standardization, Linear Regression, Random Forest, Gradient Boosting, R²/RMSE/MAE evaluation, discount sweep optimizer, recommendation engine, React/Vite/Tailwind/shadcn/Recharts frontend, explainable KPIs and warnings.
- **Project Flowchart** — Step 1 Upload CSV → Step 2 Parse & Alias Map → Step 3 Schema Discovery → Step 4 Analytics + Feature Engineering → Step 5 Train Models → Step 6 Pick Best Model → Step 7 Discount Sweep → Step 8 Recommend Optimal Discount → Step 9 Render Dashboard.
- **Software (6.1–6.6)** — Languages (TypeScript, HTML, CSS), Frameworks (React 18, Vite 5, Tailwind v3), Libraries (shadcn/ui, Recharts, lucide-react, Vitest), Custom modules (`csv.ts`, `ml.ts`, `analytics.ts`), OS, Browsers, Hosting (Vercel/Netlify/static).
- **Hardware** — Minimum (i3, 4 GB RAM, 1 GB storage) and Recommended (i5/Ryzen 5, 8 GB RAM, SSD).
- **Other Resources (8.1–8.7)** — Sample Superstore dataset, internet (only for install/deploy), pre-built UI components, documentation references, testing resources (sample CSVs), browser dev tools, deployment platforms.

## Technical execution

1. Use the **docx skill** with `docx-js` (Node) to generate a clean `.docx` file at `/mnt/documents/Retail_Discount_Optimization_Synopsis.docx`.
2. Document setup:
   - US Letter, 1" margins.
   - Default font Arial 12pt; H1 = 16pt bold, H2 = 14pt bold, H3 = 12pt bold.
   - Title page with project name + underline (mirroring `<u>Phishguard…</u>`).
   - Numbered section headings exactly as in the PhishGuard layout.
   - Real bullet lists via `LevelFormat.BULLET` (no unicode •).
   - "Step N" blocks for the flowchart section.
   - Highlighted/bordered paragraph for the boxed core problem statement.
3. Validate the generated `.docx` with the skill's validator, then convert to PDF via LibreOffice and `pdftoppm` to visually QA every page (check overflow, spacing, heading hierarchy, list rendering).
4. Fix any rendering issues (overflow, broken bullets, missing headings) and re-render until clean.
5. Deliver the final `.docx` as a `<lov-artifact>` so you can download it. Optionally also produce a `.pdf` version alongside it.

## Deliverables

- `/mnt/documents/Retail_Discount_Optimization_Synopsis.docx` — main synopsis (mirrors PhishGuard format).
- `/mnt/documents/Retail_Discount_Optimization_Synopsis.pdf` — PDF copy for quick viewing.
- A short summary in chat listing what each section contains and confirming visual QA results.

No code in the React app will be modified — this is a documentation deliverable only.

Approve this and I'll generate the document.