import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarCheck2,
  ClockCheck,
  Coffee,
  Fingerprint,
  Layers,
  ListChecks,
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

const HEADLINE = "Automated Presence & Shift Enforcement for Modern Workplaces";

const HERO_POINTS = [
  "Zero-hardware setup — runs in any standard browser",
  "Automated break tracking with categorized time-off",
  "Idle detection and hourly desk verification",
];

const FEATURES = [
  {
    icon: TimerReset,
    title: "Dynamic Shift Lock",
    body: "8:30 AM – 5:00 PM automated shift gating with an early check-in grace window. Late starts surface instantly instead of hiding in a spreadsheet.",
    metric: "08:30",
    metricLabel: "Shift opens",
  },
  {
    icon: Radar,
    title: "Proof-of-Presence Watchdog",
    body: "A 30-second heartbeat plus hourly desk verification keeps sessions honest — and pauses cleanly when the tab closes.",
    metric: "30s",
    metricLabel: "Heartbeat",
  },
  {
    icon: Coffee,
    title: "Automated Break & Gap Management",
    body: "Categorized Lunch, Tea / Coffee, and Personal Gap time is tracked and netted out automatically, so productive hours stay accurate.",
    metric: "3",
    metricLabel: "Break types",
  },
  {
    icon: MonitorSmartphone,
    title: "Zero-Friction Setup",
    body: "No complex biometrics, no kiosk hardware, no installs. Employees activate with a password and click Start Work.",
    metric: "0",
    metricLabel: "Hardware required",
  },
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

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function MockClock() {
  const now = useNow(1000);
  return (
    <span className="tabular">
      {now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </span>
  );
}

function WeekdayBars() {
  const now = useNow(60000);
  const heights = [46, 72, 58, 88];
  return (
    <div className="grid grid-cols-4 gap-2">
      {["Mon", "Tue", "Wed", "Thu"].map((day, index) => (
        <div
          key={day}
          className="flex flex-col items-center gap-1.5"
        >
          <div className="flex h-14 w-full items-end rounded-lg bg-canvas p-0.5">
            <div
              className={cn(
                "w-full rounded-md transition-all duration-300",
                index === 1 ? "bg-primary" : "bg-primary/15",
              )}
              style={{ height: `${heights[index]}%` }}
              aria-hidden="true"
            />
          </div>
          <span className="text-[10px] font-medium text-muted">
            {day}
          </span>
        </div>
      ))}
      <span className="sr-only" aria-live="off">
        {`Weekday activity preview, refreshed ${now.toLocaleTimeString()}`}
      </span>
    </div>
  );
}

function MockDashboard() {
  const now = useNow(30000);
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      <div className="flex items-center gap-2 border-b border-line bg-surface-raised px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-danger/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" aria-hidden="true" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" aria-hidden="true" />
        <span className="ml-3 flex-1 truncate rounded-md bg-canvas px-3 py-1 text-[11px] text-muted">
          app.trackwise.io/dashboard
        </span>
        <Badge tone="success" className="shrink-0">
          <Wifi className="h-3 w-3" aria-hidden="true" />
          Live
        </Badge>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-3">
        {[
          { label: "Status", value: "Working", tone: "success" },
          { label: "Check in", value: "08:41 AM", tone: "neutral" },
          { label: "Productive", value: "5.2 hrs", tone: "primary" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-line bg-surface-raised p-3.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              {stat.label}
            </p>
            <p
              className={cn(
                "mt-1 text-lg font-bold tracking-tight",
                stat.tone === "success" && "text-success",
                stat.tone === "primary" && "text-primary",
                stat.tone === "neutral" && "text-ink",
              )}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-4 py-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Session monitor
          </p>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" aria-hidden="true" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" aria-hidden="true" />
            </span>
            Presence heartbeat
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl border border-line bg-canvas px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
              <ClockCheck className="h-4.5 w-4.5" aria-hidden="true" />
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
            <p className="text-sm font-bold tabular text-ink">
              <MockClock />
            </p>
          </div>
        </div>

        <div className="mt-3">
          <WeekdayBars />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-sidebar">
      <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="text-center lg:text-left">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-secondary" aria-hidden="true" />
              Employee attendance management
            </p>
            <h1 className="mx-auto mt-6 max-w-2xl animate-fade-up font-display text-4xl font-bold leading-[1.06] tracking-tight text-white [animation-delay:80ms] sm:text-5xl lg:mx-0 lg:text-[3.4rem]">
              {HEADLINE}
            </h1>
            <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-slate-400 [animation-delay:160ms] sm:text-lg lg:mx-0">
              Zero-hardware setup, automated break tracking, and idle
              detection — the entire presence workflow runs in one
              clean browser session.
            </p>

            <ul className="mx-auto mt-7 max-w-xl animate-fade-up space-y-2.5 text-sm text-slate-300 [animation-delay:220ms] lg:mx-0">
              {HERO_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                    aria-hidden="true"
                  />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:300ms] sm:flex-row lg:justify-start">
              <Link
                to="/login"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-pop transition-all duration-150 hover:bg-primary-strong active:scale-[0.98] sm:w-auto"
              >
                Sign In to Portal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/activate"
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white/5 px-6 text-sm font-semibold text-white ring-1 ring-white/15 transition-all duration-150 hover:bg-white/10 active:scale-[0.98] sm:w-auto"
              >
                <Fingerprint className="h-4 w-4" aria-hidden="true" />
                Activate Employee Account
              </Link>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:380ms]">
            <ErrorBoundary>
              <MockDashboard />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <Card
      hover
      className="group relative animate-fade-up p-6"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="text-right">
          <p className="text-xl font-bold tabular tracking-tight text-ink">
            {feature.metric}
          </p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-faint">
            {feature.metricLabel}
          </p>
        </div>
      </div>
      <h3 className="mt-5 text-[15px] font-semibold text-ink">
        {feature.title}
      </h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        {feature.body}
      </p>
    </Card>
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
          Four systems working in concert so managers never chase a
          timesheet again.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        <div className="md:col-span-2 md:row-span-2">
          <FeatureCard feature={FEATURES[0]} index={0} />
        </div>
        <FeatureCard feature={FEATURES[1]} index={1} />
        <FeatureCard feature={FEATURES[2]} index={2} />
        <div className="md:col-span-2 md:row-span-1">
          <FeatureCard feature={FEATURES[3]} index={3} />
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
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

        <ol className="mt-14 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative animate-fade-up rounded-2xl border border-line bg-surface p-6 shadow-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-line bg-canvas px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
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
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-sidebar px-8 py-14 text-center">
        <div className="relative">
          <CalendarCheck2
            className="mx-auto h-10 w-10 text-secondary"
            aria-hidden="true"
          />
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to clock in?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
            Sign in to see your day, or activate your account to get
            started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-slate-100 active:scale-[0.98] sm:w-auto"
            >
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/activate"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-white/5 px-6 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/10 active:scale-[0.98] sm:w-auto"
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
            Presence watchdog · 30s heartbeat
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
