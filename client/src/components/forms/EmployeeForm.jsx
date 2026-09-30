import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";

const EMPTY_VALUES = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;

function validate(values) {
  const errors = {};
  if (!values.employeeId.trim()) {
    errors.employeeId = "Employee ID is required.";
  } else if (values.employeeId.trim().length < 3) {
    errors.employeeId = "Use at least 3 characters.";
  }
  if (!values.firstName.trim()) errors.firstName = "First name is required.";
  if (!values.lastName.trim()) errors.lastName = "Last name is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  return errors;
}

/**
 * Shared add/edit employee form. Owns field state and inline validation;
 * the parent supplies `initialValues`, an `onSubmit(values)` handler, and
 * the submit label / busy state.
 */
export function EmployeeForm({
  initialValues,
  onSubmit,
  submitLabel = "Save changes",
  submitting = false,
  onCancel,
  readOnlyEmployeeId = false,
}) {
  const [values, setValues] = useState({ ...EMPTY_VALUES, ...initialValues });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    onSubmit(values);
  };

  return (
    <Card className="max-w-3xl p-6 sm:p-7">
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Employee ID"
            name="employeeId"
            value={values.employeeId}
            onChange={handleChange}
            placeholder="e.g. EMP-101"
            error={errors.employeeId}
            hint={readOnlyEmployeeId ? "Cannot be changed" : undefined}
            required
            disabled={readOnlyEmployeeId}
          />
          <Input
            label="First name"
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            placeholder="e.g. Alex"
            error={errors.firstName}
            required
          />
          <Input
            label="Last name"
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            placeholder="e.g. Morgan"
            error={errors.lastName}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="alex.morgan@company.com"
            error={errors.email}
            required
          />
          <Input
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            placeholder="+1 555 000 1234"
            error={errors.phone}
            hint="Optional"
          />
          <Input
            label="Department"
            name="department"
            value={values.department}
            onChange={handleChange}
            placeholder="e.g. Engineering"
          />
          <Input
            label="Designation"
            name="designation"
            value={values.designation}
            onChange={handleChange}
            placeholder="e.g. Senior Developer"
          />
        </div>

        <div className="mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              leftIcon={ArrowLeft}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            loading={submitting}
            leftIcon={Save}
            className="sm:min-w-[10rem]"
          >
            {submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
