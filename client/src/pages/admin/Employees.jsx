import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Plus, Search, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Table, TBody, Td, Th, THead, Tr } from "../../components/ui/Table";
import { useNotifications } from "../../context/NotificationContext";
import { getEmployees, toggleEmployeeStatus } from "../../services/admin";
import { fullName } from "../../lib/format";
import { cn } from "../../lib/utils";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function Employees() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [confirmTarget, setConfirmTarget] = useState(null); // { employee, action }
  const [updating, setUpdating] = useState(null); // employee_id in flight

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees();
      setEmployees(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((employee) => {
      if (statusFilter !== "all" && employee.account_status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        employee.first_name,
        employee.last_name,
        employee.employee_id,
        employee.department,
        employee.designation,
        employee.email,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [employees, query, statusFilter]);

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
  };

  const askToggle = (employee) => {
    const action =
      employee.account_status === "active" ? "deactivate" : "activate";
    setConfirmTarget({ employee, action });
  };

  const performToggle = async () => {
    if (!confirmTarget) return;
    const { employee, action } = confirmTarget;
    setUpdating(employee.employee_id);
    try {
      const res = await toggleEmployeeStatus(employee.employee_id);
      const name = fullName(employee.first_name, employee.last_name);
      toast.success(res.message || `Employee ${action}d successfully.`);
      addNotification({
        type: action === "deactivate" ? "warning" : "success",
        title: `Employee ${action}d`,
        body: `${name} (${employee.employee_id}) is now ${action === "deactivate" ? "inactive" : "active"}.`,
      });
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to update employee.");
    } finally {
      setUpdating(null);
      setConfirmTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading employees">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-[72px] rounded-xl" />
        <Table>
          <THead>
            <Tr>
              <Th>Employee</Th>
              <Th>Department</Th>
              <Th>Designation</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {[0, 1, 2, 3, 4].map((i) => (
              <Tr key={i}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </Td>
                <Td>
                  <Skeleton className="h-4 w-24" />
                </Td>
                <Td>
                  <Skeleton className="h-4 w-20" />
                </Td>
                <Td>
                  <Skeleton className="h-5 w-16" />
                </Td>
                <Td>
                  <Skeleton className="h-8 w-32" />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load employees"
        description={
          error.response?.data?.message ||
          "Something went wrong while fetching your team. Please try again."
        }
        onRetry={load}
      />
    );
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title="No employees yet"
        description="Add your first employee to start building your team."
        action={
          <Button
            onClick={() => navigate("/admin/add-employee")}
            leftIcon={Plus}
          >
            Add employee
          </Button>
        }
      />
    );
  }

  const confirmAction = confirmTarget?.action ?? "deactivate";
  const confirmName = confirmTarget
    ? fullName(confirmTarget.employee.first_name, confirmTarget.employee.last_name)
    : "";

  return (
    <div className="animate-fade-up space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            Employees
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Manage, activate, and update your team ·{" "}
            <span className="font-medium text-ink-soft">
              {employees.length} total
            </span>
          </p>
        </div>
        <Button
          onClick={() => navigate("/admin/add-employee")}
          leftIcon={Plus}
        >
          Add employee
        </Button>
      </header>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Input
            leftIcon={Search}
            placeholder="Search name, ID, department…"
            aria-label="Search employees"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full lg:max-w-sm"
          />
          <div
            role="group"
            aria-label="Filter by status"
            className="inline-flex w-fit rounded-lg border border-line bg-surface p-0.5 shadow-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={statusFilter === option.value}
                onClick={() => setStatusFilter(option.value)}
                className={cn(
                  "h-8 rounded-md px-3 text-xs font-medium transition-colors",
                  statusFilter === option.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-ink",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-muted" aria-live="polite">
          Showing {filtered.length} of {employees.length}{" "}
          {filtered.length === 1 ? "employee" : "employees"}
        </p>
        {query || statusFilter !== "all" ? (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title="No matching employees"
            description="Try a different search term or status filter."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <Table>
          <THead>
            <Tr>
              <Th>Employee</Th>
              <Th>Department</Th>
              <Th>Designation</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.map((employee) => {
              const name = fullName(
                employee.first_name,
                employee.last_name,
              );
              const pending = employee.account_status === "pending";
              const isBusy = updating === employee.employee_id;
              return (
                <Tr key={employee.employee_id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Avatar name={name} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {name}
                        </p>
                        <p className="text-xs tabular text-muted">
                          {employee.employee_id}
                        </p>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-muted">{employee.department}</Td>
                  <Td className="text-muted">
                    {employee.designation || (
                      <span className="text-faint">—</span>
                    )}
                  </Td>
                  <Td>
                    <StatusBadge status={employee.account_status} />
                  </Td>
                  <Td>
                    <div className="flex items-center justify-end gap-2">
                      {pending && (
                        <Badge tone="warning">Waiting for activation</Badge>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(`/admin/edit-employee/${employee.employee_id}`)
                        }
                        leftIcon={Pencil}
                      >
                        Edit
                      </Button>
                      {!pending && (
                        <Button
                          variant={
                            employee.account_status === "active"
                              ? "dangerSubtle"
                              : "outline"
                          }
                          size="sm"
                          loading={isBusy}
                          onClick={() => askToggle(employee)}
                        >
                          {employee.account_status === "active"
                            ? "Deactivate"
                            : "Activate"}
                        </Button>
                      )}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}

      <Modal
        open={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        size="sm"
        title={
          confirmTarget
            ? `${capitalize(confirmAction)} ${confirmName}?`
            : ""
        }
        description="This changes the employee's access to TrackWise."
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setConfirmTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant={confirmAction === "deactivate" ? "danger" : "primary"}
              loading={updating === confirmTarget?.employee?.employee_id}
              onClick={performToggle}
            >
              {capitalize(confirmAction)}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-muted">
          {confirmAction === "deactivate"
            ? `${confirmName} will no longer be able to sign in until reactivated. Their attendance history is kept.`
            : `${confirmName} will be able to sign in with their existing credentials.`}
        </p>
      </Modal>
    </div>
  );
}

export default Employees;
