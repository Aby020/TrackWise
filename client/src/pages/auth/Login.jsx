import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AuthShell } from "../../components/auth/AuthShell";
import { PasswordField } from "../../components/auth/PasswordField";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!employeeId.trim()) next.employeeId = "Employee ID is required.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const user = await login(employeeId.trim(), password);
      toast.success("Welcome back!");
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to TrackWise to manage your day"
      footer={
        <>
          <span className="text-muted">New to TrackWise? </span>
          <Link
            to="/activate"
            className="font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Activate your account
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export default Login;
