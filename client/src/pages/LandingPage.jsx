import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  Coffee,
  Fingerprint,
  FlaskConical,
  Layers,
  ListChecks,
  Lock,
  MonitorSmartphone,
  Radar,
  ShieldCheck,
  TimerReset,
  UserRoundCheck,
  Wifi,
} from "lucide-react";
import { Logo } from "../components/brand/Logo";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { ErrorBoundary } from "../components/ui/ErrorBoundary";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../lib/utils";

const HEADLINE_LEAD = "Automated Presence & Shift Enforcement ";
const HEADLINE_PHRASE = "for Modern Workplaces";

const HERO_POINTS = [
  "Zero-hardware setup — runs in any standard browser",
  "Automated break tracking with categorized time-off",
  "Idle detection and hourly desk verification",
];

const STEPS = [
  {
    icon: Layers,
    step: "Step 1",
    title: "Admin configures",
    body: "Set company shifts and assign employee IDs from one place. Grace windows and strict enforcement are optional per shift.",
  },
  {
    icon: UserRoundCheck,
    step: "Step 2",
    title: "Employee activates",
    body: "Activate with a password, then click Start Work inside the shift window. No cameras, no passkeys, no friction.",
  },
  {
    icon: ListChecks,
    step: "Step 3",
    title: "Presence runs itself",
    body: "A background heartbeat monitors the active session and stops on tab close or shutdown. Breaks and gaps log automatically.",
  },
];

const FOOTER_LINKS = [
  { label: "Product", links: ["Shift Lock", "Break Tracking", "Presence Watchdog", "Admin Console"] },
  { label: "Company", links: ["About", "Careers", "Security", "Contact"] },
  { label: "Resources", links: ["Documentation", "API Reference", "Status", "Support"] },
];

const LEGACY_ROWS = [
  { label: "Hardware kiosk", legacy: "Required", trackwise: "None" },
  { label: "Fingerprint sensor", legacy: "Required", trackwise: "None" },
  { label: "On-site installation", legacy: "Half-day", trackwise: "5 minutes" },
  { label: "Break categorization", legacy: "Manual", trackwise: "Automatic" },
  { label: "Late-arrival alerts", legacy: "End of day", trackwise: "Instant" },
];

const WEEKDAYS = [
  { day: "Mon", hours: 8.2 },
  { day: "Tue", hours: 7.6 },
  { day: "Wed", hours: 8.8 },
  { day: "Thu", hours: 6.9 },
  { day: "Fri", hours: 8.1 },
];

const CONTAINER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const RISE = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const RISE_SOFT = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const SPRING = { type: "spring", stiffness: 320, damping: 24 };

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function useShiftGate(now) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const open = 8 * 60 + 30;
  const close = 17 * 60;
  const isOpen = minutes >= open && minutes < close;
  const countdown = isOpen ? 0 : Math.max(0, open - minutes);
  const progress = isOpen
    ? Math.min(1, (minutes - open) / (close - open))
    : 0;
  return { isOpen, countdown, progress };
}

function formatCountdown(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function AnimateValue({ value, className }) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (value === display) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const timeout = window.setTimeout(() => {
      setDisplay(value);
      setFlash(true);
      const clear = window.setTimeout(() => setFlash(false), 420);
      return () => window.clearTimeout(clear);
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [value, display, reduceMotion]);

  return (
    <motion.span
      className={cn("tabular", className)}
      animate={flash ? { scale: [1, 1.1, 1] } : {}}
      transition={SPRING}
      aria-label={value}
    >
      {display}
    </motion.span>
  );
}

function TelemetryWave() {
  const reduceMotion = useReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const strokeId = `waveStroke${uid}`;
  const fillId = `waveFill${uid}`;
  const path = useMemo(
    () =>
      "M0 26 C 18 26, 22 10, 40 10 S 62 40, 80 40 S 102 6, 120 6 S 142 34, 160 34 S 182 14, 200 14 S 222 38, 240 38 S 262 18, 280 18 S 302 30, 320 30",
    [],
  );

  return (
    <svg
      viewBox="0 0 320 48"
      className="h-12 w-full"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-primary)" />
          <stop offset="55%" stopColor="var(--color-accent)" />
          <stop offset="100%" stopColor="var(--color-primary)" />
        </linearGradient>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L320 48 L0 48 Z`} fill={`url(#${fillId})`} />
      <motion.path
        d={path}
        stroke={`url(#${strokeId})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={reduceMotion ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
      />
      <motion.circle
        cx="318"
        cy="30"
        r="3"
        fill="var(--color-accent)"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

function PresenceRadar() {
  const now = useNow(30000);
  const reduceMotion = useReducedMotion();
  const secondsLeft = 30 - (Math.floor(now.getTime() / 1000) % 30);

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          Presence radar
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="relative grid h-12 w-12 shrink-0 place-items-center">
            {!reduceMotion && (
              <span
                className="absolute inset-0 rounded-full border border-accent/50 animate-ping-ring"
                aria-hidden="true"
              />
            )}
            <span
              className="absolute inset-[6px] rounded-full border border-accent/25"
              aria-hidden="true"
            />
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-soft text-accent">
              <Radar className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
          <div>
            <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <span className="relative flex h-2 w-2">
                {!reduceMotion && (
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-success"
                    animate={{ opacity: [0.7, 0], scale: [1, 2.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                )}
                <span
                  className="relative inline-flex h-2 w-2 rounded-full bg-success"
                  aria-hidden="true"
                />
              </span>
              Heartbeat live
            </p>
            <p className="mt-0.5 font-mono text-[11px] tabular text-muted">
              next ping in{" "}
              <span className="font-semibold text-accent">
                {String(secondsLeft).padStart(2, "0")}s
              </span>
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-line bg-canvas/60 px-3 py-2">
        <p className="font-mono text-[10px] leading-relaxed text-faint">
          30s interval · hourly desk verification · pauses on tab close
        </p>
      </div>
    </div>
  );
}

function BreakGauge() {
  const segments = [
    { label: "Work", value: 6.9, color: "var(--color-primary)" },
    { label: "Lunch", value: 0.75, color: "var(--color-accent)" },
    { label: "Tea", value: 0.3, color: "var(--color-secondary)" },
    { label: "Gap", value: 0.15, color: "var(--color-warning)" },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
          Break & gap breakdown
        </p>
        <p className="mt-2 font-mono text-2xl font-bold tabular tracking-tight text-ink">
          8.10<span className="text-sm font-medium text-muted">h</span>
        </p>
        <p className="mt-0.5 text-[11px] text-muted">Logged today</p>
      </div>
      <div>
        <div
          className="flex h-3 w-full overflow-hidden rounded-full bg-canvas"
          role="img"
          aria-label="Breakdown of 8.1 hours: 6.9 work, 0.75 lunch, 0.3 tea, 0.15 gap"
        >
          {segments.map((segment, index) => (
            <motion.span
              key={segment.label}
              className="h-full"
              style={{ backgroundColor: segment.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(segment.value / total) * 100}%` }}
              transition={{
                type: "spring",
                stiffness: 90,
                damping: 20,
                delay: 0.2 + index * 0.09,
              }}
            />
          ))}
        </div>
        <ul className="mt-3 space-y-1.5">
          {segments.map((segment) => (
            <li key={segment.label} className="flex items-center gap-2 text-[11px]">
              <span
                className="h-2 w-2 shrink-0 rounded-[3px]"
                style={{ backgroundColor: segment.color }}
                aria-hidden="true"
              />
              <span className="text-muted">{segment.label}</span>
              <span className="ml-auto font-mono tabular text-ink-soft">
                {segment.value.toFixed(2)}h
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LegacyTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-left text-[11px]">
        <thead>
          <tr className="border-b border-line bg-surface-raised">
            <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wider text-faint">
              Capability
            </th>
            <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wider text-faint">
              Biometric kiosk
            </th>
            <th scope="col" className="px-3 py-2 font-semibold uppercase tracking-wider text-faint">
              TrackWise
            </th>
          </tr>
        </thead>
        <tbody>
          {LEGACY_ROWS.map((row, index) => (
            <tr
              key={row.label}
              className={cn(
                "border-b border-line/60 transition-colors duration-150 last:border-0 hover:bg-accent-soft/40",
                index % 2 === 0 && "bg-canvas/50",
              )}
            >
              <td className="px-3 py-2 font-medium text-ink-soft">{row.label}</td>
              <td className="px-3 py-2 text-muted">
                <span className="inline-flex items-center gap-1">
                  <Lock className="h-3 w-3 shrink-0 text-faint" aria-hidden="true" />
                  {row.legacy}
                </span>
              </td>
              <td className="px-3 py-2 font-semibold text-accent">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {row.trackwise}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MockClock() {
  const now = useNow(1000);
  return (
    <span className="font-mono text-sm font-semibold tabular text-ink">
      {now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })}
    </span>
  );
}

function ShiftWindowTimeline({ progress }) {
  const marks = [8.5, 10, 12, 14, 16, 17];
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px] tabular text-faint">
        <span>08:30</span>
        <span>12:00</span>
        <span>17:00</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-canvas">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={false}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 18 }}
        />
      </div>
      <div className="relative mt-1 h-3">
        {marks.map((mark) => (
          <span
            key={mark}
            className="absolute h-1.5 w-px bg-line-strong"
            style={{ left: `${((mark - 8.5) / 8.5) * 100}%` }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function ShiftEngineGate() {
  const now = useNow(1000);
  const reduceMotion = useReducedMotion();
  const { isOpen, countdown, progress } = useShiftGate(now);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            Shift engine gate
          </p>
          <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-ink">
            General Shift
          </p>
          <p className="mt-0.5 font-mono text-[11px] tabular text-muted">
            08:30 → 17:00 · grace 15m
          </p>
        </div>
        <motion.div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          animate={
            isOpen
              ? { backgroundColor: "var(--color-success-soft)", scale: [1, 1.07, 1] }
              : { backgroundColor: "var(--color-warning-soft)", scale: 1 }
          }
          transition={reduceMotion ? { duration: 0 } : SPRING}
        >
          {isOpen ? (
            <TimerReset className="h-5 w-5 text-success" aria-hidden="true" />
          ) : (
            <Lock className="h-5 w-5 text-warning" aria-hidden="true" />
          )}
        </motion.div>
      </div>

      <motion.div
        role="status"
        aria-live="polite"
        className={cn(
          "mt-4 rounded-xl border px-4 py-3",
          isOpen ? "border-success/25 bg-success-soft/60" : "border-warning/25 bg-warning-soft/50",
        )}
        animate={isOpen ? { scale: [1, 1.012, 1] } : {}}
        transition={reduceMotion ? { duration: 0 } : SPRING}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-ink-soft">
            {isOpen ? "Gate open — check-ins accepted" : "Gate locked — shift opens in"}
          </span>
          <AnimateValue
            value={isOpen ? "08:30" : formatCountdown(countdown)}
            className={cn(
              "font-mono text-sm font-bold",
              isOpen ? "text-success" : "text-warning",
            )}
          />
        </div>
        {!isOpen && (
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-canvas">
            <motion.div
              className="h-full rounded-full bg-warning"
              initial={false}
              animate={{ width: `${Math.min(100, (countdown / 480) * 100)}%` }}
              transition={{ type: "spring", stiffness: 60, damping: 18 }}
            />
          </div>
        )}
      </motion.div>

      <div className="mt-auto pt-4">
        <ShiftWindowTimeline progress={progress} />
      </div>
    </div>
  );
}

function WeeklyRhythm() {
  const now = useNow(60000);
  const maxHours = Math.max(...WEEKDAYS.map((d) => d.hours));
  const weekTotal = WEEKDAYS.reduce((sum, d) => sum + d.hours, 0);

  return (
    <div className="flex h-full flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
            Weekly presence rhythm
          </p>
          <p className="font-mono text-sm font-bold tabular text-ink">
            {weekTotal.toFixed(1)}
            <span className="text-[11px] font-medium text-muted">h this week</span>
          </p>
        </div>
        <div className="mt-4 flex items-end gap-3">
          {WEEKDAYS.map((entry, index) => (
            <div key={entry.day} className="flex w-full max-w-[72px] flex-col items-center gap-1.5">
              <div className="flex h-16 w-full items-end overflow-hidden rounded-lg bg-canvas p-0.5">
                <motion.div
                  className={cn(
                    "w-full rounded-md",
                    index === new Date().getDay() - 1 ? "bg-accent" : "bg-primary/25",
                  )}
                  initial={{ height: 0 }}
                  animate={{ height: `${(entry.hours / maxHours) * 100}%` }}
                  transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.1 + index * 0.06 }}
                  aria-hidden="true"
                />
              </div>
              <span className="font-mono text-[10px] tabular text-faint">
                {entry.day}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full shrink-0 sm:w-56">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
            Local time
          </p>
          <MockClock />
        </div>
        <div className="mt-2">
          <TelemetryWave />
        </div>
        <p className="sr-only" aria-live="off">
          {`Activity preview refreshed ${now.toLocaleTimeString()}`}
        </p>
      </div>
    </div>
  );
}

function HeroTerminal() {
  const now = useNow(30000);
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/60 bg-surface shadow-2xl shadow-indigo-950/40 transition-colors duration-300 hover:border-indigo-500/40">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[120%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative flex items-center gap-2 border-b border-line bg-glass px-4 py-3 backdrop-blur-md">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden="true" />
        <span className="ml-3 flex-1 truncate rounded-md bg-canvas px-3 py-1 font-mono text-[11px] text-muted">
          app.trackwise.io/dashboard
        </span>
        <Badge tone="success" className="shrink-0">
          <Wifi className="h-3 w-3" aria-hidden="true" />
          Live
        </Badge>
      </div>

      <div className="relative grid gap-4 p-4 sm:grid-cols-3">
        {[
          { label: "Status", value: "Working", tone: "text-success" },
          { label: "Check in", value: "08:41 AM", tone: "text-ink" },
          { label: "Productive", value: "5.2 hrs", tone: "text-primary" },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            className="rounded-xl border border-line bg-surface-raised p-3.5"
            whileHover={{ y: -2, borderColor: "var(--color-line-strong)" }}
            transition={SPRING}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 font-mono text-sm font-bold tabular tracking-tight",
                stat.tone,
              )}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="relative border-t border-line px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Session monitor
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="relative flex h-2 w-2">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-success"
                animate={{ opacity: [0.6, 0], scale: [1, 2.4] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                aria-hidden="true"
              />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            </span>
            Presence heartbeat — Upcoming Feature
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <CalendarCheck2 className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">
                General Shift · 08:30 AM – 05:00 PM
              </p>
              <p className="text-[11px] text-muted">
                {now.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Local time
            </p>
            <MockClock />
          </div>
        </div>

        <div className="mt-3">
          <TelemetryWave />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="hero-atmosphere relative overflow-hidden">
      <div
        className="hero-glow"
        aria-hidden="true"
      />
      <div
        className="hero-grid pointer-events-none absolute inset-0 animate-grid-pan"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] animate-orb-drift rounded-full bg-indigo-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-10 top-40 h-[400px] w-[400px] animate-orb-drift rounded-full bg-emerald-500/10 blur-[100px]"
        style={{ animationDelay: "-7s" }}
        aria-hidden="true"
      />
      <div className="relative mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:px-8">
        <motion.div
          variants={CONTAINER}
          initial="hidden"
          animate="visible"
          className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        >
          <div className="text-center lg:text-left">
            <motion.p
              variants={RISE}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1.5 text-xs font-medium text-indigo-300"
            >
              <span
                className="relative flex h-2 w-2"
                aria-hidden="true"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 animate-dot-pulse rounded-full bg-emerald-400" />
              </span>
              Employee attendance management
            </motion.p>
            <motion.h1
              variants={RISE}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
              className="mx-auto mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-balance sm:text-5xl lg:mx-0 lg:text-[3.4rem]"
            >
              <span className="headline-gradient">{HEADLINE_LEAD}</span>
              <span className="phrase-gradient">{HEADLINE_PHRASE}</span>
            </motion.h1>
            <motion.p
              variants={RISE}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.16 }}
              className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg lg:mx-0"
            >
              Zero-hardware setup, automated break tracking, and idle
              detection — the entire presence workflow runs in one
              clean browser session.
            </motion.p>

            <motion.ul
              variants={RISE}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.22 }}
              className="mx-auto mt-7 max-w-xl space-y-2.5 text-sm text-slate-300 lg:mx-0"
            >
              {HERO_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1 text-emerald-400">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                  </span>
                  {point}
                </li>
              ))}
            </motion.ul>

            <motion.div
              variants={RISE}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.3 }}
              className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start"
            >
              <Link
                to="/login"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-150 hover:-translate-y-0.5 hover:from-indigo-400 hover:to-violet-500 hover:shadow-indigo-500/40 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 sm:w-auto"
              >
                Sign In to Portal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/activate"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 px-6 text-sm font-semibold text-slate-300 transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-500 hover:text-white active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20 sm:w-auto"
              >
                <Fingerprint className="h-4 w-4" aria-hidden="true" />
                Activate Employee Account
              </Link>
              <Link
                to="/dashboard?demo=true"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 text-sm font-semibold text-cyan-300 transition-all duration-150 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-cyan-500/15 hover:text-cyan-200 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-500/20 sm:w-auto"
              >
                <FlaskConical className="h-4 w-4" aria-hidden="true" />
                Explore Live Demo
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={RISE}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.38 }}
          >
            <ErrorBoundary>
              <HeroTerminal />
            </ErrorBoundary>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function BentoGrid() {
  return (
    <motion.div
      variants={CONTAINER}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className="mt-14 grid gap-5 md:grid-cols-4"
    >
      <motion.div variants={RISE_SOFT} className="md:col-span-2 md:row-span-2">
        <Card
          hover
          className="group relative h-full overflow-hidden p-6"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div className="relative h-full">
            <ShiftEngineGate />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-2">
        <Card hover className="group relative h-full p-6">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            aria-hidden="true"
          />
          <PresenceRadar />
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-2">
        <Card hover className="group relative h-full p-6">
          <BreakGauge />
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-4">
        <Card hover className="group relative h-full p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Zero-hardware simplicity
              </p>
              <h3 className="mt-1.5 text-[15px] font-semibold text-ink">
                Legacy biometric kiosk vs. TrackWise
              </h3>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <MonitorSmartphone className="h-5 w-5" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-4">
            <LegacyTable />
          </div>
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-2">
        <Card hover className="group relative h-full p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Break intelligence
              </p>
              <h3 className="mt-1.5 text-[15px] font-semibold text-ink">
                Categorized, netted automatically
              </h3>
            </div>
            <Coffee className="h-5 w-5 text-faint" aria-hidden="true" />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Lunch, Tea / Coffee, and Personal Gap time is tracked and
            netted out of productive hours — no manual timesheet
            corrections at week's end.
          </p>
          <div className="mt-4 flex items-center gap-2">
            {["Lunch", "Tea", "Gap"].map((label) => (
              <span
                key={label}
                className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[10px] font-medium text-muted"
              >
                {label}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-2">
        <Card hover className="group relative h-full p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-faint">
                Zero-friction setup
              </p>
              <h3 className="mt-1.5 text-[15px] font-semibold text-ink">
                Activate and start in one click
              </h3>
            </div>
            <Fingerprint className="h-5 w-5 text-faint" aria-hidden="true" />
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            No cameras, no passkeys, no kiosk hardware. Employees
            activate with a password and click Start Work inside the
            shift window.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Badge tone="primary">Password only</Badge>
            <Badge tone="info">Browser native</Badge>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={RISE_SOFT} className="md:col-span-4">
        <Card hover className="group relative h-full p-6">
          <WeeklyRhythm />
        </Card>
      </motion.div>
    </motion.div>
  );
}

function FeaturesBento() {
  return (
    <section id="features" className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-20 lg:px-8">
      <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Core capabilities
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Attendance that enforces itself
          </h2>
        </div>
        <p className="max-w-sm text-base leading-relaxed text-muted lg:justify-self-end">
          Shift gating, presence radar, break accounting, and weekly
          rhythm — one live surface, no spreadsheet chasing.
        </p>
      </div>

      <ErrorBoundary>
        <BentoGrid />
      </ErrorBoundary>
    </section>
  );
}

function HowItWorks() {
  const reduceMotion = useReducedMotion();
  return (
    <section
      id="how-it-works"
      className="border-y border-line bg-surface-raised/60"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Live in three steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            From admin configuration to a fully monitored session in
            under a minute.
          </p>
        </div>

        <motion.ol
          variants={CONTAINER}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="mt-14 grid gap-5 md:grid-cols-3"
        >
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.title}
                variants={RISE_SOFT}
                transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.08 }}
                className="relative rounded-2xl border border-line bg-surface p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <motion.span
                    className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary"
                    whileHover={reduceMotion ? undefined : { scale: 1.08 }}
                    transition={SPRING}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </motion.span>
                  <span className="rounded-full border border-line bg-canvas px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
                    {step.step}
                  </span>
                </div>
                <h3 className="mt-5 text-[15px] font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  {step.body}
                </p>
                {index < STEPS.length - 1 && (
                  <ArrowRight
                    className="absolute -right-3.5 top-1/2 hidden h-7 w-7 -translate-y-1/2 rounded-full border border-line bg-surface text-primary shadow-card md:block"
                    aria-hidden="true"
                  />
                )}
              </motion.li>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-sidebar px-8 py-14 text-center">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(50%_70%_at_50%_0%,var(--color-primary)/25%,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="relative">
          <div
            className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10"
            aria-hidden="true"
          >
            <CalendarCheck2 className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to clock in?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Sign in to see your day, or activate your account to get
            started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-all duration-150 hover:scale-[1.02] hover:bg-indigo-500 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 sm:w-auto"
            >
              Sign In
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/activate"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-6 py-2.5 text-sm font-medium text-slate-300 transition-all duration-150 hover:scale-[1.02] hover:bg-slate-800 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-400/20 sm:w-auto"
            >
              Activate account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Logo variant={theme === "dark" ? "light" : "dark"} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Automated presence and shift enforcement for modern
              workplaces. No hardware, no friction, no timesheets.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success-soft px-3 py-1.5 text-xs font-medium text-success">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60"
                  aria-hidden="true"
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full bg-success"
                  aria-hidden="true"
                />
              </span>
              All systems operational
            </span>
          </div>

          {FOOTER_LINKS.map((column) => (
            <nav key={column.label} aria-label={column.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                {column.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="text-sm text-muted transition-colors hover:text-primary">
                      {link}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} TrackWise. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Activity className="h-3.5 w-3.5 text-success" aria-hidden="true" />
            Presence watchdog · Upcoming Feature
          </p>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Hero />
      <FeaturesBento />
      <HowItWorks />
      <FinalCta />
      <Footer />
    </div>
  );
}

export default LandingPage;
