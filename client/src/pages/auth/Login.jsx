import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Building2, KeyRound, UserRound } from "lucide-react";
import { AuthShell } from "../../components/auth/AuthShell";
import { PasswordField } from "../../components/auth/PasswordField";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const IDENTIFIER_MODES = [
  { key: "employeeId", label: "Employee ID", icon: UserRound },
  { key: "email", label: "Corporate Email", icon: Building2 },
];

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("employeeId");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const identifier = mode === "employeeId" ? employeeId : email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};

    if (!identifier.trim()) {
      next[mode] =
        mode === "employeeId"
          ? "Employee ID is required."
          : "Corporate email is required.";
    }
    if (mode === "email" && identifier.trim()) {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
      if (!valid) next.email = "Enter a valid corporate email address.";
    }
    if (!password) next.password = "Password is required.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const user = await login(identifier.trim(), password);
      toast.success("Welcome back!");
      navigate(user.role === "admin" ? "/admin" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed.");
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to TrackWise to manage your day"
      footer={
        <>
          <span className="text-muted">
            Received an Employee ID?{" "}
          </span>
          <Link
            to="/activate"
            className="font-medium text-primary transition-colors hover:text-primary-strong"
          >
            Activate Account
          </Link>
        </>
      }
    >
      <div className="mt-8" role="tablist" aria-label="Sign in method">
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1 shadow-sm">
          {IDENTIFIER_MODES.map((item) => {
            const Icon = item.icon;
            const active = mode === item.key;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchMode(item.key)}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-all duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active
                    ? "bg-primary-soft text-primary shadow-sm"
                    : "text-muted hover:bg-slate-100 hover:text-ink",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        {mode === "employeeId" ? (
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
        ) : (
          <Input
            label="Corporate Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            error={errors.email}
            autoComplete="username"
            required
          />
        )}
        <PasswordField
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={loading}
          leftIcon={KeyRound}
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

export default Login;
