import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  History,
  LogIn,
  Play,
  Square,
  Timer,
} from "lucide-react";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { HoursBars } from "../../components/charts/HoursBars";
import { RadialGauge } from "../../components/charts/RadialGauge";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import {
  endWork,
  getAttendanceHistory,
  getTodayAttendance,
  startWork,
} from "../../services/attendance";
import {
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
    <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 shadow-sm">
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

function Dashboard() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [today, setToday] = useState({
    status: "Offline",
    checkIn: null,
    checkOut: null,
    totalHours: 0,
    breakHours: 0,
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null); // "start" | "end"

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [t, h] = await Promise.all([
        getTodayAttendance(),
        getAttendanceHistory(),
      ]);
      setToday((prev) => t.data ?? prev);
      setHistory(Array.isArray(h.data) ? h.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleStart = async () => {
    setBusy("start");
    try {
      const res = await startWork();
      toast.success(res.message || "Work started successfully!");
      addNotification({
        type: "success",
        title: "Work started",
        body: `Checked in at ${formatTime(new Date())}.`,
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to start work.");
    } finally {
      setBusy(null);
    }
  };

  const handleEnd = async () => {
    setBusy("end");
    try {
      const res = await endWork();
      toast.success(res.message || "Work ended successfully!");
      addNotification({
        type: "success",
        title: "Work ended",
        body: "Your day is complete. See you tomorrow!",
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to end work.");
    } finally {
      setBusy(null);
    }
  };

  const now = useNow(30000);
  const status = today.status ?? "Offline";
  const isWorking = status === "working";
  const isComplete = Boolean(today.checkOut);
  const hours = toHours(today.totalHours);
  // While clocked in the backend only records total_hours on check-out, so
  // surface live elapsed time derived from check_in instead.
  const elapsed =
    today.checkIn && isWorking
      ? Math.max(0, (now.getTime() - new Date(today.checkIn).getTime()) / 3.6e6)
      : 0;
  const displayHours = isWorking ? elapsed : hours;
  const gauge = displayHours / OFFICE_TARGET_HOURS;

  const checkInLabel = today.checkIn ? formatTime(today.checkIn) : "--";
  const hoursLabel =
    status === "Offline"
      ? "--"
      : displayHours > 0
        ? formatHours(displayHours)
        : "0 hrs";
  const breakLabel =
    today.breakHours != null && Number(today.breakHours) > 0
      ? formatHours(today.breakHours)
      : "--";

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

  const firstName = fullName(user.firstName, user.lastName, user.employeeId);

  const statusBlurb = isWorking
    ? "You're clocked in. Remember to end your day before leaving."
    : isComplete
      ? "You've wrapped up for the day. Great work!"
      : "You haven't clocked in yet. Office hours run 9:00 AM – 5:00 PM.";

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

      <section
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        aria-label="Today's summary"
      >
        <StatCard
          label="Current status"
          value={<StatusBadge status={status} />}
          icon={Clock}
          tone={isWorking ? "success" : "neutral"}
        />
        <StatCard
          label="Check in"
          value={checkInLabel}
          icon={LogIn}
          hint={today.checkIn ? "Clock in time today" : "Not checked in yet"}
        />
        <StatCard
          label="Working hours"
          value={hoursLabel}
          icon={Timer}
          hint={
            isWorking
              ? "Counting since check in"
              : `Target ${OFFICE_TARGET_HOURS} hrs`
          }
        />
        <StatCard
          label="Break"
          value={breakLabel}
          icon={Coffee}
          hint={isWorking ? "Taking a pause counts here" : undefined}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3" aria-label="Day progress">
        <Card className="flex flex-col items-center p-6 text-center lg:col-span-1">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Today</h2>
            <StatusBadge status={status} />
          </div>

          <RadialGauge
            value={gauge}
            size={186}
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
            ) : isWorking ? (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleEnd}
                loading={busy === "end"}
                leftIcon={Square}
              >
                End work
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleStart}
                loading={busy === "start"}
                leftIcon={Play}
              >
                Start work
              </Button>
            )}
          </div>

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
                  onClick={handleStart}
                  loading={busy === "start"}
                  leftIcon={Play}
                >
                  Start work
                </Button>
              }
            />
          )}
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
                onClick={handleStart}
                loading={busy === "start"}
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
    </div>
  );
}

export default Dashboard;
