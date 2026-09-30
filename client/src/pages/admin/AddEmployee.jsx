import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { EmployeeForm } from "../../components/forms/EmployeeForm";
import { useNotifications } from "../../context/NotificationContext";
import { createEmployee } from "../../services/admin";
import { fullName } from "../../lib/format";

function AddEmployee() {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const res = await createEmployee(values);
      toast.success(res.message || "Employee created successfully!");
      addNotification({
        type: "success",
        title: "Employee created",
        body: `${fullName(values.firstName, values.lastName)} (${values.employeeId}) added to your team.`,
      });
      navigate("/admin/employees");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to create employee.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Add employee
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Create a new employee account — they'll get an activation link
        </p>
      </header>

      <EmployeeForm
        onSubmit={handleSubmit}
        submitLabel="Create employee"
        submitting={submitting}
        onCancel={() => navigate("/admin/employees")}
      />
    </div>
  );
}

export default AddEmployee;
