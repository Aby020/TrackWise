import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatCard } from "../../components/ui/StatCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Donut } from "../../components/charts/Donut";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats, getEmployees } from "../../services/admin";
import { formatDateLong, fullName, greeting } from "../../lib/format";
import { workforceSegments } from "../../lib/status";
import { cn } from "../../lib/utils";

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalEmployees: 0,
    workingToday: 0,
    completedToday: 0,
    notStartedToday: 0,
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, e] = await Promise.all([getDashboardStats(), getEmployees()]);
      setStats((prev) => s.data ?? prev);
      setEmployees(Array.isArray(e.data) ? e.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const adminName = fullName(user.firstName, user.lastName, user.employeeId);
  const workingPct =
    stats.totalEmployees > 0
      ? Math.round((stats.workingToday / stats.totalEmployees) * 100)
      : 0;

  const donutSegments = workforceSegments.map((seg) => ({
    key: seg.key,
    label: seg.label,
    dot: seg.dot,
    value: stats[seg.key],
  }));

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
          <Skeleton className="h-96 rounded-xl lg:col-span-1" />
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load the dashboard"
        description={
          error.response?.data?.message ||
          "Something went wrong while fetching your team data. Please try again."
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
            {greeting()}, {adminName}
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            {formatDateLong()} · Here's your team at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/employees")}
            leftIcon={Users}
          >
            Manage employees
          </Button>
          <Button
            onClick={() => navigate("/admin/add-employee")}
            leftIcon={Plus}
          >
            Add employee
          </Button>
        </div>
      </header>

      <section
        className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        aria-label="Today's workforce summary"
      >
        <StatCard
          label="Total employees"
          value={stats.totalEmployees}
          icon={Users}
          tone="primary"
          hint="Across all departments"
        />
        <StatCard
          label="Working now"
          value={stats.workingToday}
          icon={Activity}
          tone="success"
          hint="Clocked in today"
        />
        <StatCard
          label="Completed today"
          value={stats.completedToday}
          icon={CheckCircle2}
          tone="neutral"
          hint="Finished their shift"
        />
        <StatCard
          label="Not started"
          value={stats.notStartedToday}
          icon={CircleDashed}
          tone="warning"
          hint="Yet to check in"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3" aria-label="Workforce breakdown">
        <Card className="flex flex-col items-center p-6 lg:col-span-1">
          <div className="w-full">
            <h2 className="text-sm font-semibold text-ink">Today</h2>
            <p className="mt-0.5 text-xs text-muted">
              Who's working across the team
            </p>
          </div>

          <Donut
            segments={donutSegments}
            size={190}
            label={`${workingPct}% of employees are working now`}
            className="mt-6"
          >
            <div className="text-center">
              <div className="text-4xl font-bold tabular tracking-tight text-ink">
                {workingPct}%
              </div>
              <div className="mt-1 text-xs font-medium text-muted">
                working now
              </div>
            </div>
          </Donut>

          <ul className="mt-6 w-full space-y-3">
            {donutSegments.map((seg) => (
              <li key={seg.key} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.dot }}
                  aria-hidden="true"
                />
                <span className="flex-1 text-sm text-muted">{seg.label}</span>
                <span className="text-sm font-semibold tabular text-ink">
                  {seg.value}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Team snapshot</h2>
              <p className="text-xs text-muted">Your people at a glance</p>
            </div>
            {employees.length > 0 && (
              <Link
                to="/admin/employees"
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

          {employees.length === 0 ? (
            <EmptyState
              icon={UserPlus}
              title="No employees yet"
              description="Add your first employee to start building your team."
              action={
                <Button
                  size="sm"
                  onClick={() => navigate("/admin/add-employee")}
                  leftIcon={Plus}
                >
                  Add employee
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {employees.slice(0, 6).map((employee) => (
                <li
                  key={employee.employee_id}
                  className="flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <Avatar
                    name={`${employee.first_name} ${employee.last_name}`}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {employee.department}
                      {employee.designation
                        ? ` · ${employee.designation}`
                        : ""}
                    </p>
                  </div>
                  <StatusBadge
                    status={employee.account_status}
                    className="shrink-0"
                  />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;
