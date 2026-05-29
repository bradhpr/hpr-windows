# HPR Window Pricing App — Setup

## One-Time Setup

1. **Install Node.js** (if not installed):
   - Download from https://nodejs.org → install the LTS version
   - Restart your terminal/PowerShell after installing

2. **Install dependencies** (run once in this folder):
   ```
   cd "C:\Users\brad\OneDrive\Documents\claudeproject\hpr-windows"
   npm install
   ```

## Running the App

```
npm run dev
```

Then open your browser to: **http://localhost:5173**

## Building for Production

```
npm run build
npm run preview
```

The built files go to `/dist` — you can deploy them to any static web host (Netlify, Vercel, GitHub Pages).

---

## App Flow

1. **Field Measure** (phone) — Walk the house, enter each window's side/width/height/style. Use Quick Entry mode for speed (`F 36 84 SH 2` = Front, 36×84, Single Hung, qty 2).

2. **Options & Pricing** (iPad/laptop) — Set global options (series, glass, color, grids, etc.), adjust margin slider, apply discounts. Tap the pencil on any window for per-window overrides.

3. **Proposal** — Enter homeowner info, preview the proposal, download as PDF or print.

## Key Features

- All Anlin pricing baked in (no internet required)
- 50% margin default, slider from 20–70%
- Internal view shows cost/profit (hidden from homeowner)
- Save/load multiple jobs via localStorage
- Quick entry mode for fast field data entry
- Professional PDF with HPR branding
- Print-ready CSS

## Pricing Notes

- **HPR cost = Anlin list × 0.48**
- **Labor = $125 per window unit**
- **Sell price = Total cost ÷ (1 - margin)**
- Infinit-e glass adder is included by default
- Color upcharge: Adobe/Tan = ×1.04 on full list price
