import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../brand/Logo";
import { cn } from "../../lib/utils";

const RISE = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

const REDUCED_RISE = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

/**
 * Full-screen auth layout on a deep slate canvas with a subtle
 * ambient glow. The frosted glass card carries the form; the
 * brand mark sits in the card header so it never collides with
 * the top-level marketing header.
 */
export function AuthPage({ title, subtitle, children, footer, backTo }) {
  const reduceMotion = useReducedMotion();
  const rise = reduceMotion ? REDUCED_RISE : RISE;

  return (
    <div className="auth-atmosphere relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 sm:px-6">
      <div className="auth-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-32 left-[12%] h-[420px] w-[420px] rounded-full bg-indigo-600/12 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-[8%] h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-[120px]"
        aria-hidden="true"
      />

      <motion.div
        variants={rise}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-10">
          <div className="mb-6 flex items-start justify-between gap-4">
            <Logo variant="light" />
            {backTo && (
              <Link
                to={backTo}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded"
              >
                <ArrowLeft
                  className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
                Back to Home
              </Link>
            )}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>

          {children}

          {footer && (
            <div className="mt-8 border-t border-slate-800/90 pt-6 text-center text-sm">
              <span className="text-slate-400">{footer}</span>
            </div>
          )}
        </div>

        <p className="mt-6 text-center font-mono text-[11px] text-slate-500">
          TrackWise · Presence &amp; shift enforcement
        </p>
      </motion.div>
    </div>
  );
}

export function AuthGlassCard({ className, children, ...rest }) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-slate-800/90 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-10",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
