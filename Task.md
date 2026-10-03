Work in:
D:\AbiLabs\TrackWise

Task:
Revamp the landing page typography, top navigation header/buttons, and global color palette using our installed `ui-styling` and `ui-ux-pro-max` skills.

Design Refinement Directives:

1. Typography Upgrade (client/index.html & client/src/index.css):
   - Import Google Fonts: 'Plus Jakarta Sans' (weights 500, 600, 700, 800) and 'Bricolage Grotesque' (weights 700, 800).
   - Ensure the headline font is properly applied in tailwind.config.js / tokens.css:
     - Set font-display: 'Plus Jakarta Sans', sans-serif.
     - Headline styling: `font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400`.
     - Highlight phrase ("for Modern Workplaces"): dynamic gradient `from-indigo-400 via-sky-300 to-emerald-400`.

2. Color Palette & Atmospheric Depth (client/src/pages/LandingPage.jsx & tokens.css):
   - Canvas: Replace flat pitch-black with a deep layered obsidian surface (`#070a12` base).
   - Add ambient lighting orbs behind the hero:
     - Top-left subtle indigo radial bloom: `w-[500px] h-[500px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none absolute -top-20 -left-20`.
     - Right cyan/emerald bloom behind the preview terminal: `w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none absolute top-40 right-10`.
   - Subtle geometric grid overlay with radial vignette mask so it fades seamlessly into the edges.

3. Top Navigation Bar (client/src/components/GlobalHeader.jsx or Header):
   - Redesign into a modern floating glass capsule:
     - Center it in a `max-w-6xl mx-auto px-6 py-3 mt-4` container.
     - Background: `bg-slate-900/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-xl shadow-black/40`.
   - Nav Links ("Home", "Features", "How it works"):
     - High-contrast typography with interactive hover pill background (`hover:bg-slate-800/70 text-slate-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-all`).
     - Active indicator: animated subtle under-glow or pill highlight.
   - Action Buttons:
     - "Activate account": Sleek ghost button with border sheen (`text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-500 px-4 py-2 rounded-xl text-sm font-semibold transition-all`).
     - "Sign In": High-impact gradient button (`bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-semibold px-5 py-2 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm`).

4. Hero Bullet Points & Feature Pill:
   - "Employee attendance management" pill: Add subtle animated green pulse dot + `bg-indigo-950/40 border border-indigo-500/30 text-indigo-300`.
   - Bullet checkmark items: Add subtle emerald gradient badge behind each icon (`bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 rounded-md`).

5. Build & Quality Verification:
   - Confirm fonts load reliably without FOIT/layout shift.
   - Run `npm run build` in `client/` to verify zero errors.
   - Zero inline "#" comments.
   - ZERO AI ATTRIBUTION: No "Co-Authored-By", "Claude", or tool trailers anywhere in commits or code.

Execute the updates and report when the preview is compiled.