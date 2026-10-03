import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AlarmClock, ArrowRight, Building2, UserRound } from "lucide-react";
import { AuthPage } from "../../components/auth/AuthGlassCard";
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

  const [sessionNotice] = useState(() => {
    try {
      const message = sessionStorage.getItem("tw:session-message");
      sessionStorage.removeItem("tw:session-message");
      return message;
    } catch {
      return null;
    }
  });

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
      const data = err.response?.data;
      if (data?.needsActivation) {
        toast.error(
          <span>
            Account not activated yet.{" "}
            <Link
              to="/activate"
              className="font-semibold underline underline-offset-2"
            >
              Click here to activate.
            </Link>
          </span>,
        );
      } else {
        toast.error(data?.message || "Login failed.");
      }
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  return (
    <AuthPage
      title="Welcome back"
      subtitle="Sign in to TrackWise to manage your day"
      backTo="/"
      footer={
        <>
          <span className="text-slate-400">
            Received an Employee ID?{' '}
          </span>
          <Link
            to="/activate"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded"
          >
            Activate Account
          </Link>
        </>
      }
    >
      {sessionNotice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-300"
        >
          <AlarmClock className="h-4 w-4 shrink-0" aria-hidden="true" />
          {sessionNotice}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div role="tablist" aria-label="Sign in method">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-slate-800 bg-slate-950/40 p-1">
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
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40",
                    active
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {mode === "employeeId" ? (
          <Input
            variant="glass"
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
            variant="glass"
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
          variant="glass"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          error={errors.password}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 shadow-md shadow-indigo-600/25 border border-indigo-400/20 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
        >
          <span>{loading ? "Signing in..." : "Sign in"}</span>
          {!loading && <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />}
        </button>
      </form>
    </AuthPage>
  );
}

export default Login;