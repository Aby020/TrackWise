import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlarmClock,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  CupSoda,
  History,
  LogIn,
  MoonStar,
  PauseCircle,
  Play,
  Square,
  Timer,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Menu, MenuItem, MenuLabel } from "../../components/ui/Menu";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { DemoBanner } from "../../components/demo/DemoBanner";
import { HoursBars } from "../../components/charts/HoursBars";
import { RadialGauge } from "../../components/charts/RadialGauge";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useDemoMode } from "../../hooks/useDemoMode";
import { playDeskCheckChime } from "../../hooks/useDemoMode";
import {
  endBreak,
  endWork,
  getAttendanceHistory,
  getTodayAttendance,
  startBreak,
  startWork,
} from "../../services/attendance";
import { getActiveShift } from "../../services/shift";
import {
  formatBreakElapsed,
  formatClock,
  formatDateDay,
  formatDateLong,
  formatDateShort,
  formatHours,
  formatTime,
  fullName,
  greeting,
  toHours,
} from "../../lib/format";
import { cn } from "../../lib/utils";

const OFFICE_TARGET_HOURS = 8;

const BREAK_OPTIONS = [
  {
    type: "lunch",
    label: "Lunch",
    hint: "Midday meal break",
    icon: CupSoda,
  },
  {
    type: "tea",
    label: "Tea / Coffee",
    hint: "Short refresh pause",
    icon: Coffee,
  },
  {
    type: "personal_gap",
    label: "Personal Gap",
    hint: "Personal time away",
    icon: MoonStar,
  },
];

/** Re-render on an interval; used for the live clock and elapsed hours. */
function useNow(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Normalise any date value to a local "YYYY-MM-DD" key for grouping. */
function dayKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const d = new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function LiveClock() {
  const now = useNow(1000);
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 shadow-card">
      <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
      <time
        className="text-sm font-semibold tabular text-ink"
        dateTime={now.toISOString()}
      >
        {now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </time>
      <span className="hidden text-sm text-faint sm:inline">
        · {formatDateShort(now)}
      </span>
    </div>
  );
}

/** Countdown to the moment the shift window opens. */
function ShiftCountdown({ minutes }) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const seconds = Math.floor((minutes % 1) * 60);
  return (
    <span className="inline-flex items-baseline gap-1.5 tabular">
      {hours > 0 && (
        <>
          <span className="text-lg font-bold text-ink">{hours}</span>
          <span className="text-[11px] font-medium text-muted">h</span>
        </>
      )}
      <span className="text-lg font-bold text-ink">
        {String(mins).padStart(2, "0")}
      </span>
      <span className="text-[11px] font-medium text-muted">m</span>
      <span className="text-lg font-bold text-ink">
        {String(seconds).padStart(2, "0")}
      </span>
      <span className="text-[11px] font-medium text-muted">s</span>
    </span>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const demo = useDemoMode();

  const [today, setToday] = useState({
    status: "Offline",
    checkIn: null,
    checkOut: null,
    totalHours: 0,
    breakHours: 0,
  });
  const [history, setHistory] = useState([]);
  const [shift, setShift] = useState(null);
  const [shiftError, setShiftError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  const now = useNow(15000);
  const status = demo.isDemo
    ? demo.status
    : today.status ?? "Offline";
  const isWorking = status === "working";
  const isOnBreak = status === "on_break";
  const isComplete = demo.isDemo
    ? status === "completed"
    : Boolean(today.checkOut);
  const hours = demo.isDemo
    ? demo.workSeconds / 3600
    : toHours(today.totalHours);
  const elapsed = demo.isDemo
    ? demo.workSeconds / 3600
    : today.checkIn && isWorking
      ? Math.max(0, (now.getTime() - new Date(today.checkIn).getTime()) / 3.6e6)
      : 0;
  const displayHours = isWorking ? elapsed : hours;
  const gauge = displayHours / OFFICE_TARGET_HOURS;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Demo mode renders the simulated state from useDemoMode — the
    // real attendance endpoints are protected and would 401, which
    // the api client turns into a session-expired redirect.
    if (demo.isDemo) {
      setToday({
        status: "Offline",
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        breakHours: 0,
      });
      setHistory([]);
      setShift(null);
      setShiftError(null);
      setLoading(false);
      return;
    }

    try {
      const [t, h, s] = await Promise.allSettled([
        getTodayAttendance(),
        getAttendanceHistory(),
        getActiveShift(),
      ]);
      setToday((prev) =>
        t.status === "fulfilled" ? t.value.data ?? prev : prev,
      );
      setHistory(
        h.status === "fulfilled" && Array.isArray(h.value.data)
          ? h.value.data
          : [],
      );
      if (s.status === "fulfilled") {
        setShift(s.value.data ?? null);
        setShiftError(null);
      } else {
        setShift(null);
        setShiftError(
          s.reason?.response?.data?.message || "Shift policy unavailable.",
        );
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [demo.isDemo]);

  useEffect(() => {
    load();
  }, [load]);

  const handleBreakStart = async (breakType) => {
    setBusyAction("break");
    try {
      const res = await startBreak(breakType);
      toast.success(res.message || "Break started.");
      addNotification({
        type: "info",
        title: "Break started",
        body: "Enjoy your pause — your session stays active.",
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start break.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleBreakEnd = async () => {
    setBusyAction("resume");
    try {
      const res = await endBreak();
      toast.success(res.message || "Welcome back.");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to resume work.");
    } finally {
      setBusyAction(null);
    }
  };

  const handleStartWork = async () => {
    setBusyAction("start");
    try {
      const res = await startWork();
      toast.success(res.message || "Work started successfully.");
      addNotification({
        type: "success",
        title: "Work started",
        body: `Checked in at ${formatTime(new Date())}.`,
      });
      await load();
    } catch (err) {
      // Only a genuine auth failure belongs on the login page;
      // everything else (including a 404 from a missing route)
      // is an inline error so the user stays signed in.
      toast.error(err.response?.data?.message || "Unable to start work.");
    } finally {
      setBusyAction(null);
    }
  };

  const [deskCheckOpen, setDeskCheckOpen] = useState(false);
  const deskCheckTimer = useRef(null);

  const clearDeskCheckTimer = useCallback(() => {
    if (deskCheckTimer.current) {
      window.clearInterval(deskCheckTimer.current);
      deskCheckTimer.current = null;
    }
  }, []);

  const resetDeskCheckTimer = useCallback(() => {
    clearDeskCheckTimer();
    if (isWorking) {
      deskCheckTimer.current = window.setInterval(() => {
        playDeskCheckChime();
        setDeskCheckOpen(true);
      }, 30 * 60 * 1000);
    }
  }, [isWorking, clearDeskCheckTimer]);

  useEffect(() => {
    resetDeskCheckTimer();
    return clearDeskCheckTimer;
  }, [resetDeskCheckTimer, clearDeskCheckTimer]);

  const handleEndWork = async () => {
    setBusyAction("end");
    try {
      const res = await endWork();
      toast.success(res.message || "Work ended successfully.");
      addNotification({
        type: "success",
        title: "Work ended",
        body: "Your day is complete. See you tomorrow!",
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to end work.");
    } finally {
      setBusyAction(null);
    }
  };

  // In demo mode, intercept the standard controls so they manipulate
  // the simulated state instead of making real API calls.
  const dispatchBreakStart = demo.isDemo
    ? (breakType) => {
        demo.startBreak(breakType);
        toast.success("Break started (simulated).");
      }
    : handleBreakStart;
  const dispatchBreakEnd = demo.isDemo
    ? () => {
        demo.resumeWork();
        toast.success("Work resumed (simulated).");
      }
    : handleBreakEnd;
  const dispatchStartWork = demo.isDemo
    ? () => {
        demo.simulateStartWork();
        toast.success("Work started (simulated).");
      }
    : handleStartWork;
  const dispatchEndWork = demo.isDemo
    ? () => {
        demo.endWork();
        toast.success("Work ended (simulated).");
      }
    : handleEndWork;

  const checkInLabel = demo.isDemo
    ? formatTime(demo.checkIn)
    : today.checkIn
      ? formatTime(today.checkIn)
      : "--";
  const hoursLabel =
    status === "Offline"
      ? "--"
      : displayHours > 0
        ? formatHours(displayHours)
        : "0 hrs";
  const breakLabel =
    demo.isDemo && demo.breakStartedAt
      ? formatBreakElapsed({ activeBreakStartedAt: demo.breakStartedAt }, now)
      : today.breakHours != null && Number(today.breakHours) > 0
        ? formatHours(today.breakHours)
        : "--";

  const shiftStart = useMemo(() => {
    if (!shift?.startTime) return null;
    const [h, m] = shift.startTime.split(":").map(Number);
    return h * 60 + (m || 0);
  }, [shift]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const graceMinutes = Number(shift?.earlyCheckinGraceMinutes ?? 0);
  const earliestMinutes = shiftStart === null ? null : shiftStart - graceMinutes;
  const beforeWindow =
    earliestMinutes !== null && currentMinutes < earliestMinutes;
  const windowOpen =
    earliestMinutes !== null &&
    currentMinutes >= earliestMinutes &&
    (shift?.endTime
      ? currentMinutes <
        Number(shift.endTime.split(":")[0]) * 60 +
          Number(shift.endTime.split(":")[1])
      : true);
  const minutesToOpen =
    beforeWindow && earliestMinutes !== null
      ? (earliestMinutes - currentMinutes) / 60
      : 0;

  const week = useMemo(() => {
    const slots = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      slots.push({
        key: dayKey(d),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        today: i === 0,
      });
    }
    const byDay = new Map();
    for (const record of history) {
      byDay.set(dayKey(record.work_date), toHours(record.total_hours));
    }
    return slots.map((slot) => ({ ...slot, value: byDay.get(slot.key) ?? 0 }));
  }, [history]);

  const weekTotal = useMemo(
    () => week.reduce((sum, d) => sum + d.value, 0),
    [week],
  );
  const daysWorked = week.filter((d) => d.value > 0).length;

  const firstName = demo.isDemo
    ? `${demo.profile.firstName} ${demo.profile.lastName}`
    : fullName(user.firstName, user.lastName, user.employeeId);

  const statusBlurb = isOnBreak
    ? "You're on a break. Resume when you're ready to continue."
    : isWorking
      ? "You're clocked in. Remember to end your day before leaving."
      : isComplete
        ? "You've wrapped up for the day. Great work!"
        : beforeWindow
          ? "The shift window hasn't opened yet. Start work becomes available shortly."
          : "You haven't clocked in yet. Start work when you're ready.";

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-xl lg:col-span-1" />
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load your dashboard"
        description={
          error.response?.data?.message ||
          "Something went wrong while fetching your attendance. Please try again."
        }
        onRetry={load}
      />
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-[28px]">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {formatDateLong()} · Here's your day at a glance
          </p>
        </div>
        <LiveClock />
      </header>

      {demo.isDemo && <DemoBanner demo={demo} />}

      <Card className="p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary shadow-sm">
              <Clock className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[13px] font-medium text-muted">
                Shift schedule
              </p>
              <p className="mt-0.5 font-display text-lg font-bold tracking-tight text-ink">
                {shift?.shiftName ?? "General Shift"}:{" "}
                {shift
                  ? `${formatClock(shift.startTime)} – ${formatClock(shift.endTime)}`
                  : "08:30 AM – 05:00 PM"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {shiftError && !shift
                  ? shiftError
                  : `Check-in opens ${graceMinutes} min early · Strict enforcement ${
                      shift?.isStrictEnforced ? "enabled" : "relaxed"
                    }`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold shadow-sm",
                beforeWindow
                  ? "border border-warning/30 bg-warning-soft text-warning"
                  : windowOpen
                    ? "border border-success/30 bg-success-soft text-success"
                    : "border border-line bg-surface-raised text-muted",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  beforeWindow
                    ? "bg-warning"
                    : windowOpen
                      ? "bg-success"
                      : "bg-faint",
                )}
                aria-hidden="true"
              />
              {beforeWindow
                ? "Shift locked"
                : windowOpen
                  ? "Shift open"
                  : "Shift ended"}
            </span>
            {beforeWindow && (
              <div className="flex items-center gap-2 rounded-full border border-line bg-surface-raised px-3.5 py-1.5 shadow-sm">
                <Timer className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                <span className="text-xs font-medium text-muted">
                  Starts in
                </span>
                <ShiftCountdown minutes={minutesToOpen} />
              </div>
            )}
          </div>
        </div>
      </Card>

      <section
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        aria-label="Today's summary"
      >
        <StatCard
          label="Current status"
          value={<StatusBadge status={status} />}
          icon={isOnBreak ? PauseCircle : Clock}
          tone={isWorking ? "success" : isOnBreak ? "warning" : "neutral"}
        />
        <StatCard
          label="Check in"
          value={checkInLabel}
          icon={LogIn}
          hint={today.checkIn ? "Clock in time today" : "Not checked in yet"}
        />
        <StatCard
          label="Net productive hours"
          value={hoursLabel}
          icon={Timer}
          hint={
            isWorking
              ? "Counting since check in"
              : `Target ${OFFICE_TARGET_HOURS} hrs`
          }
        />
        <StatCard
          label="Break hours"
          value={breakLabel}
          icon={Coffee}
          hint={isOnBreak ? "Break timer is running" : "Pause time counts here"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3" aria-label="Day progress">
        <Card className="flex flex-col items-center p-6 text-center lg:col-span-1">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Work center</h2>
            <StatusBadge status={status} />
          </div>

          <RadialGauge
            value={gauge}
            size={186}
            color={
              isOnBreak
                ? "var(--color-warning)"
                : isWorking
                  ? "var(--color-primary)"
                  : "var(--color-line-strong)"
            }
            label={`${displayHours.toFixed(1)} of ${OFFICE_TARGET_HOURS} hours worked today`}
            className="mt-6"
          >
            <div className="text-center">
              <div className="text-4xl font-bold tabular tracking-tight text-ink">
                {status === "Offline" ? "0" : displayHours.toFixed(1)}
              </div>
              <div className="mt-1 text-xs font-medium text-muted">
                of {OFFICE_TARGET_HOURS} hrs
              </div>
            </div>
          </RadialGauge>

          <p className="mt-5 text-sm leading-relaxed text-muted">
            {statusBlurb}
          </p>

          <div className="mt-5 w-full">
            {isComplete ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                disabled
                leftIcon={CheckCircle2}
              >
                Work completed
              </Button>
            ) : isOnBreak ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={dispatchBreakEnd}
                loading={busyAction === "resume"}
                leftIcon={Play}
              >
                Resume work
              </Button>
            ) : isWorking ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={dispatchEndWork}
                loading={busyAction === "end"}
                leftIcon={Square}
              >
                End work
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={dispatchStartWork}
                loading={busyAction === "start"}
                disabled={beforeWindow}
                leftIcon={Play}
              >
                {beforeWindow ? "Start work (locked)" : "Start work"}
              </Button>
            )}
          </div>

          {isWorking && (
            <div className="mt-3 w-full">
              <Menu
                trigger={
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={busyAction === "break"}
                    leftIcon={Coffee}
                    rightIcon={ArrowRight}
                  >
                    Take a break
                  </Button>
                }
              >
                <MenuLabel>Choose a pause type</MenuLabel>
                {BREAK_OPTIONS.map((option) => (
                  <MenuItem
                    key={option.type}
                    icon={option.icon}
                    label={option.label}
                    onSelect={() => dispatchBreakStart(option.type)}
                  />
                ))}
              </Menu>
            </div>
          )}

          {isOnBreak && (
            <div className="mt-3 w-full animate-pulse-soft rounded-xl border border-warning/25 bg-warning-soft px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-warning">
                  <PauseCircle className="h-4 w-4" aria-hidden="true" />
                  On break
                </span>
                <span className="text-sm font-bold tabular text-warning">
                  {demo.isDemo
                    ? formatBreakElapsed(
                        { activeBreakStartedAt: demo.breakStartedAt },
                        now,
                      )
                    : formatBreakElapsed(today, now)}
                </span>
              </div>
            </div>
          )}

          <dl className="mt-6 grid w-full grid-cols-2 gap-3 border-t border-line pt-4">
            <div className="text-left">
              <dt className="text-xs text-faint">Check in</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular text-ink">
                {checkInLabel}
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-xs text-faint">Break</dt>
              <dd className="mt-0.5 text-sm font-semibold tabular text-ink">
                {breakLabel}
              </dd>
            </div>
          </dl>
        </Card>

        <Card className="flex flex-col p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">This week</h2>
              <p className="mt-0.5 text-xs text-muted">
                Hours clocked over the last 7 days
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold tabular tracking-tight text-ink">
                {weekTotal.toFixed(1)}{" "}
                <span className="text-xs font-medium text-muted">hrs</span>
              </p>
              <p className="text-xs text-faint">
                {daysWorked} of 7 days
              </p>
            </div>
          </div>

          {weekTotal > 0 ? (
            <div className="mt-8 flex-1">
              <HoursBars
                data={week}
                max={OFFICE_TARGET_HOURS}
                className="h-40"
              />
            </div>
          ) : (
            <EmptyState
              icon={Timer}
              title="No hours yet this week"
              description="Start work to begin tracking your day."
              className="flex-1"
              action={
                <Button
                  size="sm"
                  onClick={handleStartWork}
                  loading={busyAction === "start"}
                  leftIcon={Play}
                >
                  Start work
                </Button>
              }
            />
          )}

          <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success-soft text-success">
                <Activity className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">
                  Net productive hours
                </p>
                <p className="mt-0.5 text-lg font-bold tabular tracking-tight text-ink">
                  {displayHours > 0 ? displayHours.toFixed(1) : "0.0"}{" "}
                  <span className="text-xs font-medium text-muted">hrs</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-raised p-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning">
                <Coffee className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted">Break hours</p>
                <p className="mt-0.5 text-lg font-bold tabular tracking-tight text-ink">
                  {Number(today.breakHours || 0) > 0
                    ? toHours(today.breakHours).toFixed(1)
                    : "0.0"}{" "}
                  <span className="text-xs font-medium text-muted">hrs</span>
                </p>
              </div>
            </div>
          </div>

        </Card>
      </section>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Recent days</h2>
            <p className="text-xs text-muted">
              Your latest attendance records
            </p>
          </div>
          {history.length > 0 && (
            <Link
              to="/attendance-history"
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-ink-soft",
                "transition-colors hover:bg-slate-100 hover:text-primary",
              )}
            >
              View all
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={History}
            title="No attendance records yet"
            description="Start work to create your first record."
            action={
              <Button
                size="sm"
                onClick={handleStartWork}
                loading={busyAction === "start"}
                leftIcon={Play}
              >
                Start work
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-line">
            {history.slice(0, 5).map((record) => (
              <li
                key={dayKey(record.work_date) + record.check_in}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary"
                  aria-hidden="true"
                >
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">
                    {formatDateDay(record.work_date)}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    In {formatTime(record.check_in)} · Out{" "}
                    {formatTime(record.check_out)}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular text-ink">
                  {formatHours(record.total_hours)}
                </p>
                <StatusBadge status={record.working_status} className="shrink-0" />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={deskCheckOpen}
        onClose={() => setDeskCheckOpen(false)}
        title="Still at your desk?"
        description="Quick check-in"
        size="sm"
        footer={
          <Button
            variant="primary"
            onClick={() => {
              setDeskCheckOpen(false);
              resetDeskCheckTimer();
            }}
            leftIcon={CheckCircle2}
          >
            I'm here
          </Button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <span
            className="grid h-16 w-16 place-items-center rounded-2xl border border-primary/30 bg-primary-soft text-primary"
            aria-hidden="true"
          >
            <AlarmClock className="h-8 w-8" />
          </span>
          <p className="mt-4 text-sm font-medium text-ink">
            Still at your desk? Click to acknowledge.
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            A friendly reminder after 30 minutes of work. Acknowledging
            simply restarts the timer — no penalties, no locks.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
