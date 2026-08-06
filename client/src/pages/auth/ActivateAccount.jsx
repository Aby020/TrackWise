import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../components/auth/AuthShell";
import { PasswordField } from "../../components/auth/PasswordField";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { activateAccount } from "../../services/auth";

function ActivateAccount() {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!employeeId.trim()) next.employeeId = "Employee ID is required.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) {
      next.password = "Use at least 8 characters.";
    }
    if (!confirmPassword) next.confirmPassword = "Confirm your password.";
    else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords don't match.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const res = await activateAccount({
        employeeId,
        password,
        confirmPassword,
      });
      toast.success(res.message || "Account activated successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Activation failed. Please try again.",
      );
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Activate your account"
      subtitle="Set your password to start using TrackWise"
      footer={
        <>
          <span className="text-muted">Already activated? </span>
          <Link
            to="/login"
            className="font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
        <Input
          label="Employee ID"
          name="employeeId"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="e.g. EMP-101"
          error={errors.employeeId}
          autoComplete="username"
          required
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          error={errors.password}
          hint="Use at least 8 characters"
          autoComplete="new-password"
          required
        />
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Activate account
        </Button>
      </form>
    </AuthShell>
  );
}

export default ActivateAccount;
