import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarRange,
  Clock3,
  History,
  Play,
  TrendingUp,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Select } from "../../components/ui/Select";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TBody, Td, Th, THead, Tr } from "../../components/ui/Table";
import { getAttendanceHistory } from "../../services/attendance";
import {
  formatDateFull,
  formatHours,
  formatTime,
  isToday,
  monthKey,
  monthLabel,
  toHours,
} from "../../lib/format";

function SummaryCell({ icon: Icon, label, value }) {
  return (
    <div className="px-5 py-4">
      <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Icon className="h-3.5 w-3.5 text-faint" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular tracking-tight text-ink">
        {value}
      </p>
    </div>
  );
}

function InProgressDot() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
      </span>
      In progress
    </span>
  );
}

function AttendanceHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthFilter, setMonthFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAttendanceHistory();
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const monthOptions = useMemo(() => {
    const keys = [...new Set(history.map((r) => monthKey(r.work_date)))];
    return keys.sort().reverse();
  }, [history]);

  const filtered = useMemo(
    () =>
      monthFilter === "all"
        ? history
        : history.filter((r) => monthKey(r.work_date) === monthFilter),
    [history, monthFilter],
  );

  const summary = useMemo(() => {
    const hours = filtered.reduce((sum, r) => sum + toHours(r.total_hours), 0);
    return {
      days: filtered.length,
      hours,
      avg: filtered.length ? hours / filtered.length : 0,
    };
  }, [filtered]);

  const hoursLabel =
    summary.hours > 0 ? formatHours(summary.hours) : "--";
  const avgLabel = summary.avg > 0 ? `${summary.avg.toFixed(1)} hrs` : "--";

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading history">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load your history"
        description={
          error.response?.data?.message ||
          "Something went wrong while fetching your records. Please try again."
        }
        onRetry={load}
      />
    );
  }

  if (history.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="No attendance records yet"
        description="Your check-ins and check-outs will appear here once you start working."
        action={
          <Button
            onClick={() => navigate("/dashboard")}
            leftIcon={Play}
          >
            Go to dashboard
          </Button>
        }
      />
    );
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Attendance history
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Every check-in and check-out, month by month
          </p>
        </div>
        <div className="w-44">
          <Select
            label="Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          >
            <option value="all">All time</option>
            {monthOptions.map((key) => (
              <option key={key} value={key}>
                {monthLabel(key)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="grid grid-cols-1 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SummaryCell
          icon={CalendarRange}
          label="Days worked"
          value={summary.days}
        />
        <SummaryCell
          icon={Clock3}
          label="Hours logged"
          value={hoursLabel}
        />
        <SummaryCell
          icon={TrendingUp}
          label="Average per day"
          value={avgLabel}
        />
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarRange}
            title={`No records in ${monthLabel(monthFilter)}`}
            description="Try a different month, or check back after your next workday."
          />
        </Card>
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th>Date</Th>
              <Th>Check in</Th>
              <Th>Check out</Th>
              <Th className="text-right">Hours</Th>
              <Th>Status</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.map((record) => (
              <Tr
                key={`${record.work_date}-${record.check_in}`}
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-ink">
                      {formatDateFull(record.work_date)}
                    </span>
                    {isToday(record.work_date) && (
                      <Badge tone="primary">Today</Badge>
                    )}
                  </div>
                </Td>
                <Td className="tabular">
                  {formatTime(record.check_in)}
                </Td>
                <Td className="tabular">
                  {record.check_out ? (
                    formatTime(record.check_out)
                  ) : (
                    <InProgressDot />
                  )}
                </Td>
                <Td className="text-right">
                  <span className="font-semibold tabular text-ink">
                    {formatHours(record.total_hours)}
                  </span>
                </Td>
                <Td>
                  <StatusBadge status={record.working_status} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
}

export default AttendanceHistory;
