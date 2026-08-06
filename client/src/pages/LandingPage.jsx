import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  ClockCheck,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../components/brand/Logo";
import { Card } from "../components/ui/Card";
import { cn } from "../lib/utils";

const FEATURES = [
  {
    icon: ClockCheck,
    title: "One-tap check-in",
    body: "Start and end your day in a single click, with office-hours guardrails baked in.",
  },
  {
    icon: Activity,
    title: "Live workforce view",
    body: "A real-time snapshot of who's working, done, or hasn't started yet.",
  },
  {
    icon: CalendarClock,
    title: "Month-by-month history",
    body: "Every check-in and check-out, grouped by month with automatic hour totals.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    body: "Admins run the team; employees see their own day. Nothing more.",
  },
];

const TRUST = [
  "8-hour secure sessions",
  "Hashed passwords",
  "Role-based access",
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero */}
      <header className="relative overflow-hidden bg-sidebar">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <span className="absolute -left-32 top-16 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-glow-drift" />
          <span className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-violet/20 blur-3xl animate-glow-drift [animation-delay:-3s]" />
        </div>

        <nav className="relative mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 lg:px-8">
          <Logo variant="light" />
          <div className="flex items-center gap-2">
            <Link
              to="/activate"
              className="hidden h-9 items-center rounded-lg px-4 text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline-flex"
            >
              Activate account
            </Link>
            <Link
              to="/login"
              className="inline-flex h-9 items-center rounded-lg bg-white/10 px-4 text-sm font-medium text-white ring-1 ring-white/10 transition-colors hover:bg-white/15"
            >
              Sign in
            </Link>
          </div>
        </nav>

        <div className="relative mx-auto w-full max-w-6xl px-6 pb-24 pt-16 text-center sm:pb-32 sm:pt-24 lg:px-8">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Employee attendance management
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl animate-fade-up font-display text-4xl font-bold leading-[1.08] tracking-tight text-white [animation-delay:80ms] sm:text-6xl">
            Work hours, tracked{" "}
            <span className="bg-gradient-to-r from-secondary to-violet bg-clip-text text-transparent">
              without the paperwork.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-slate-400 [animation-delay:160ms] sm:text-lg">
            Employees tap in and out in seconds. Managers see the whole team
            live. TrackWise does the hours — automatically.
          </p>
          <div className="mt-10 flex animate-fade-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-violet px-6 text-sm font-semibold text-white shadow-pop transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/activate"
              className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-white/5 px-6 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/10 sm:w-auto"
            >
              Activate your account
            </Link>
          </div>
          <ul className="mt-12 flex animate-fade-up flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 [animation-delay:320ms]">
            {TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Why TrackWise
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Attendance that runs itself
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Built for daily reality: a clean check-in, a live team view, and
            records you never have to retype.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Card
              key={feature.title}
              hover
              className={cn("p-6", "animate-fade-up")}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-violet text-white shadow-pop">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-sm font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-sidebar px-8 py-14 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <span className="absolute -left-20 -top-24 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
            <span className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet/25 blur-3xl" />
          </div>
          <div className="relative">
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
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-slate-100 sm:w-auto"
              >
                Sign in
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/activate"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-white/5 px-6 text-sm font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/10 sm:w-auto"
              >
                Activate account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row lg:px-8">
          <Logo variant="dark" />
          <p className="text-xs text-muted">
            Attendance management for modern teams · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
