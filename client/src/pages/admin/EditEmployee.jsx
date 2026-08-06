import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { EmployeeForm } from "../../components/forms/EmployeeForm";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { Skeleton } from "../../components/ui/Skeleton";
import { useNotifications } from "../../context/NotificationContext";
import { getEmployee, updateEmployee } from "../../services/admin";
import { fullName } from "../../lib/format";

function EditEmployee() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();

  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployee(employeeId);
      const employee = res.data;
      setInitial({
        employeeId: employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        department: employee.department,
        designation: employee.designation,
      });
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await updateEmployee(employeeId, values);
      toast.success(res.message || "Employee updated successfully!");
      addNotification({
        type: "success",
        title: "Employee updated",
        body: `${fullName(values.firstName, values.lastName)}'s details were saved.`,
      });
      navigate("/admin/employees");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to update employee.",
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Loading employee"
      >
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Card className="p-6 sm:p-7">
          <div className="grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-9 rounded-lg" />
            ))}
          </div>
          <div className="mt-7 flex justify-end border-t border-line pt-5">
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !initial) {
    return (
      <ErrorState
        title="Couldn't load this employee"
        description={
          error?.response?.data?.message ||
          "The employee may have been removed, or your session expired."
        }
        onRetry={load}
      />
    );
  }

  const displayName = fullName(initial.firstName, initial.lastName);

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Edit employee
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Update {displayName}'s information — changes apply immediately
        </p>
      </header>

      <EmployeeForm
        key={initial.employeeId}
        initialValues={initial}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submitting={submitting}
        onCancel={() => navigate("/admin/employees")}
        readOnlyEmployeeId
      />
    </div>
  );
}

export default EditEmployee;
