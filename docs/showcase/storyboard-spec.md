# TrackWise — brag plan (cinematic, vertical)

**Output:** `brag-output-trackwise/` · 1080×1920 · 30fps · 21.0s · 630 frames
**Destination:** LinkedIn (vertical native video)

## What it is

TrackWise is a high-assurance workforce presence and administration platform. It connects real-time worker shift cycles with rigorous enterprise security boundaries.

## Who it's for

Engineering teams and IT administrators who need fault-tolerant, idempotent tracking across flaky network connections and fragmented legacy database schemas.

## What sets it apart

The state guarantee. When 5,000 workers clock in at exactly 08:00 AM on a degraded factory network, the Idempotent Shift Session Engine guarantees zero duplicate entries. We also bridge a difficult `public.users` vs `modern.users` identity schema behind an unbreakable 32-byte JWT guard.

## Most impressive claim to show

Zero-Downtime Dual-Schema Resolution mapping an employee in real time, followed by a conflict-free idempotent shift punch, and a web-native 30-minute watchdog chime that requires zero network overhead.

## Visual hook

Industrial Cyber aesthetic — Deep navy ground `#070913`, cool cyan glassmorphism for surface cards `#0e1526`, neon emerald telemetry accents `#10b981`, and raw monospace technical outputs. We show the real `docs/screenshots/admin-console.png` and `docs/screenshots/demo-dashboard.png` with actual data flowing.

## Tone

Tense, precise, and high-velocity. Code-editor pacing—sharp reveals with mechanical sound effects and telemetry grid overlays. 

---

## Storyboard

### Beat 1 — Hook (0.0–3.5s)

| | |
| --- | --- |
| **0.0–0.5** | Deep navy ground `#070913` with a faint neon emerald `#10b981` telemetry grid pulse. |
| **0.5–1.5** | Wordmark **TrackWise** types out in crisp monospace, cursor blinks, then snaps to Sora 800, glowing cyan, resolving upward. |
| **1.5–3.5** | Eyebrow `ID-ENGINE V2.0 · HIGH-ASSURANCE` appears. Subhead: **"Workforce presence, guaranteed."** The `docs/screenshots/landing.png` slides in sharply from the z-axis (depth push), framed in a cool cyan glass card. |

### Beat 2 — Identity & Security (3.5–8.0s)

| | |
| --- | --- |
| **3.5–5.0** | The landing card blurs. A split-screen terminal UI drops down. Left pane: `public.users`. Right pane: `modern.users`. A neon emerald connection line bridges them. Text: **"Dual-Schema Identity Engine"**. |
| **5.0–6.5** | Fast wipe: the 32-byte JWT Guard visual. Red traffic blocked, Green token verified. Text: **"Fail-Fast Security Guard"** / `IDOR Shields · Rate Limited`. |
| **6.5–8.0** | Camera pans down a telemetry view of the `docs/screenshots/admin-console.png` showing the enterprise audit log filling instantly. |

### Beat 3 — The Idempotent Engine (8.0–13.0s)

| | |
| --- | --- |
| **8.0–10.0** | The UI snaps to `docs/screenshots/demo-dashboard.png`. Focus heavily on the "Punch In" interaction. |
| **10.0–11.5** | An explosive network retry simulation triggers: `POST /api/punch` fires perfectly 4 times simultaneously. Text: **"Idempotent Shift Engine"** / `4 concurrent requests · 1 guaranteed state`. |
| **11.5–13.0** | The UI stabilizes perfectly to `Status: Working`. Text: **"Zero state divergence on flaky networks."** |

### Beat 4 — Web Audio Watchdog (13.0–16.0s)

| | |
| --- | --- |
| **13.0–14.5** | UI transitions to a minimal, high-contrast waveform visual. A sleek radial timer fills 30 minutes. |
| **14.5–16.0** | Text: **"Native Web Audio Watchdog"**. Sub-chip: `Zero external assets. 100% native.` A visual ripple represents the high-frequency presence chime. |

### Beat 5 — Call to Action (16.0–21.0s)

| | |
| --- | --- |
| **16.0–18.0** | The entire dashboard pulls back into an isometric perspective. The Deep Navy grid brightens. |
| **18.0–19.5** | Pills fall into place: `FRONTEND` React + Tailwind · `BACKEND` Node + Express · `DATABASE` Drizzle + PostgreSQL. |
| **19.5–21.0** | CTA lockup settles on screen: **TrackWise**. Subtext: `Live Demo / Zero-DB Mode: trackwise-client.onrender.com`. Git Repo tag below. End frame holds. |

---

## Visual Identity

Industrial Cyber Theme (`#070913` base):

| Token | Value | Used for |
| ----- | ----- | -------- |
| `--bg` | `#070913` | deep ground, radar grids |
| `--surface` | `#0e1526` | glass cards, modals |
| `--surface-2` | `#16203a` | inset tracks, inputs |
| `--border` | `#1a2b4c` | crisp technical hairlines |
| `--text-strong` | `#f8fafc` | headlines, heavy numbers |
| `--text-soft` | `#94a3b8` | telemetry labels, paths |
| `--accent` | `#10b981` | neon emerald working states, success |
| `--accent-alt` | `#0ea5e9` | cool cyan highlights |
| `--error` | `#ef4444` | fail-fast blocks |

**Type:** Sora for display headlines (High-Assurance impact), system mono for code snippets, telemetry data, and raw system output, Inter for UI text.

**Motion:** Linear, aggressive snapping with precise decelerations (`cubic-bezier(0.2, 1, 0.2, 1)`). Mechanical feeling, replacing ServiGo's fluid dreaminess with surgical accuracy.

## Sound
- **Bed**: Deep atmospheric drone with mechanical rhythmic ticks simulating a high-performance clock.
- **Pulse**: Heavy sub-kick exactly synced with scene transitions (3.5s, 8.0s, 13.0s).
- **SFX**: Mechanical keyboard keystrokes for type-ons, clean sine wave "blip" for Web Audio watchdog, and a resonant metallic locking sound for the state guarantee.