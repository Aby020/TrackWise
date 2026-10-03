import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlarmClock,
  CheckCircle2,
  Coffee,
  CupSoda,
  FlaskConical,
  LogOut,
  MoonStar,
  Play,
  Radar,
  Square,
  Timer,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { playDeskCheckChime } from "../../hooks/useDemoMode";
import { cn } from "../../lib/utils";

const REDUCED_TICK = { type: "spring", stiffness: 120, damping: 20 };

const BREAK_CHOICES = [
  { type: "lunch", label: "Lunch", icon: CupSoda },
  { type: "tea", label: "Tea / Coffee", icon: Coffee },
  { type: "personal_gap", label: "Personal Gap", icon: MoonStar },
];

const SIM_BUTTON_BASE =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold " +
  "transition-all duration-150 ease-out " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60";

/**
 * Banner shown at the top of the dashboard in demo mode, with
 * instant simulation triggers and a live "desk check" chime
 * modal that plays a tone without touching real attendance records.
 */
export function DemoBanner({ demo }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handlePresenceCheck = () => {
    const played = playDeskCheckChime();
    demo.triggerPresenceCheck();
    if (!played) {
      window.setTimeout(() => {
        demo.dismissPresenceChime();
      }, 2400);
    }
  };

  const handleStartWork = () => {
    demo.simulateStartWork();
    demo.clearIdleFlag();
  };

  const handleEndWork = () => {
    demo.endWork();
  };

  const timeLabel = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const isWorking = demo.status === "working";
  const isOnBreak = demo.status === "on_break";
  const isCompleted = demo.status === "completed";

  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-cyan-500/10 px-4 py-3 sm:px-5"
        role="status"
      >
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300">
            <FlaskConical className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cyan-200">
              🚀 You are previewing TrackWise in Interactive Demo Mode.
            </p>
            <p className="mt-0.5 text-xs text-cyan-300/70">
              Simulated session for {demo.profile.firstName}{" "}
              {demo.profile.lastName} ({demo.profile.employeeId}) ·{" "}
              <span className="tabular">{timeLabel}</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isWorking ? (
              <>
                <button
                  type="button"
                  onClick={handleEndWork}
                  className={cn(
                    SIM_BUTTON_BASE,
                    "border-rose-400/40 bg-rose-500/15 text-rose-200 hover:border-rose-300/70 hover:bg-rose-400/25",
                  )}
                >
                  <Square className="h-3.5 w-3.5" aria-hidden="true" />
                  ⏹ End Work
                </button>
                <div className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-slate-900/40 p-1">
                  {BREAK_CHOICES.map((choice) => {
                    const Icon = choice.icon;
                    const active = demo.breakType === choice.type;
                    return (
                      <button
                        key={choice.type}
                        type="button"
                        onClick={() => demo.startBreak(choice.type)}
                        title={`Take ${choice.label}`}
                        className={cn(
                          "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60",
                          active
                            ? "bg-cyan-500/25 text-cyan-100"
                            : "text-cyan-200/80 hover:bg-cyan-500/15 hover:text-cyan-100",
                        )}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {choice.label}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : isOnBreak ? (
              <button
                type="button"
                onClick={demo.resumeWork}
                className={cn(
                  SIM_BUTTON_BASE,
                  "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:border-emerald-300/70 hover:bg-emerald-400/25",
                )}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ▶ Resume Work
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartWork}
                className={cn(
                  SIM_BUTTON_BASE,
                  "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:border-emerald-300/70 hover:bg-emerald-400/25",
                )}
              >
                <Play className="h-3.5 w-3.5" aria-hidden="true" />
                ▶ Start Work
              </button>
            )}

            <button
              type="button"
              onClick={handlePresenceCheck}
              className={cn(
                SIM_BUTTON_BASE,
                "border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:border-cyan-400/60 hover:text-cyan-100",
              )}
              title="Fire the 60-second desk-check chime"
            >
              <AlarmClock className="h-3.5 w-3.5" aria-hidden="true" />
              🔔 Trigger Desk-Check Chime
            </button>

            {isWorking && (
              <button
                type="button"
                onClick={demo.simulateIdleFlag}
                disabled={demo.idleFlagged}
                className={cn(
                  SIM_BUTTON_BASE,
                  demo.idleFlagged
                    ? "cursor-not-allowed border-amber-400/30 bg-amber-500/10 text-amber-300/60"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-200 hover:border-amber-300/70 hover:bg-amber-400/25",
                  "disabled:pointer-events-none disabled:opacity-50",
                )}
                title={
                  demo.idleFlagged
                    ? "Idle flag is already raised"
                    : "Show how an unverified session turns amber"
                }
              >
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                ⚡ Simulate Idle Flag
              </button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                demo.exitDemo();
                navigate("/dashboard", { replace: true });
              }}
              leftIcon={LogOut}
            >
              Exit Demo
            </Button>
          </div>
        </div>

        {demo.idleFlagged && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5"
          >
            <TriangleAlert
              className="h-4 w-4 shrink-0 text-amber-300"
              aria-hidden="true"
            />
            <p className="text-xs font-medium text-amber-200">
              Unverified idle session — presence heartbeat missed at{" "}
              <span className="tabular">
                {demo.idleFlaggedAt
                  ? new Date(demo.idleFlaggedAt).toLocaleTimeString(
                      "en-US",
                      { hour: "2-digit", minute: "2-digit" },
                    )
                  : "--"}
              </span>
              . The status pill above now renders amber until the desk
              check clears the flag.
            </p>
            <button
              type="button"
              onClick={demo.clearIdleFlag}
              className="ml-auto inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-500/15 px-2.5 text-[11px] font-semibold text-amber-200 transition-all duration-150 hover:bg-amber-400/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
            >
              <CheckCircle2
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Clear flag
            </button>
          </motion.div>
        )}
      </motion.div>

      <Modal
        open={demo.presenceChimeOpen}
        onClose={demo.dismissPresenceChime}
        title="Presence check"
        description="Desk verification chime"
        size="sm"
        footer={
          <Button
            variant="primary"
            onClick={demo.dismissPresenceChime}
            leftIcon={CheckCircle2}
          >
            Confirmed
          </Button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <motion.span
            className="grid h-16 w-16 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300"
            animate={
              reduceMotion ? undefined : { scale: [1, 1.08, 1] }
            }
            transition={REDUCED_TICK}
            aria-hidden="true"
          >
            <AlarmClock className="h-8 w-8" />
          </motion.span>
          <p className="mt-4 text-sm font-medium text-ink">
            Presence heartbeat verified
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            The 60-second desk-check chime fired successfully. This is a
            simulated check — no live attendance records were affected.
          </p>
          {demo.chimeCountdown !== null && demo.chimeCountdown > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <Timer className="h-3.5 w-3.5" aria-hidden="true" />
              Auto-dismiss in {demo.chimeCountdown}s
            </p>
          )}
          <p
            className={cn(
              "mt-3 rounded-full border border-success/25 bg-success-soft px-3 py-1 text-xs font-semibold text-success",
            )}
          >
            Chime tone played · 880 Hz + 1174.66 Hz
          </p>
        </div>
      </Modal>
    </>
  );
}
