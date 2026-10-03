import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { AuthPage } from "../../components/auth/AuthGlassCard";
import { Input } from "../../components/ui/Input";
import { PasswordField } from "../../components/auth/PasswordField";
import { activateAccount } from "../../services/auth";
import { cn } from "../../lib/utils";

const MIN_PASSWORD_LENGTH = 8;

const STRENGTH_LEVELS = [
  { key: "empty", label: "Password strength", score: 0, tone: "bg-slate-700" },
  { key: "weak", label: "Weak", score: 1, tone: "bg-rose-500" },
  { key: "fair", label: "Fair", score: 2, tone: "bg-amber-500" },
  { key: "good", label: "Good", score: 3, tone: "bg-sky-500" },
  { key: "strong", label: "Strong", score: 4, tone: "bg-emerald-500" },
];

function scorePassword(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^a-zA-Z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}

function StrengthMeter({ value }) {
  const score = scorePassword(value);
  const level = STRENGTH_LEVELS[score];
  const filled = score;

  const barTone =
    score <= 1
      ? "bg-rose-500"
      : score === 2
        ? "bg-amber-500"
        : score === 3
          ? "bg-sky-500"
          : "bg-emerald-500";

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div
        className="flex gap-1.5"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-label={`Password strength: ${level.label}`}
      >
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-200",
              segment <= filled ? barTone : "bg-slate-800",
            )}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-400">
          {value ? level.label : "Use at least 8 characters"}
        </p>
        {score >= 3 && (
          <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Strong password
          </p>
        )}
      </div>
    </div>
  );
}

function ActivateAccount() {
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const strength = useMemo(() => scorePassword(password), [password]);

  const passwordsMatch =
    password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  const validate = () => {
    const next = {};

    if (!employeeId.trim()) {
      next.employeeId = "Employee ID is required.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      next.password = "Use at least 8 characters.";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Confirm your password.";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords don't match.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setBusy(true);

    try {
      await activateAccount({ employeeId, password, confirmPassword });
      toast.success("Account activated successfully.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Activation failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPage
      title="Activate your account"
      subtitle="Set your password to finish activation"
      backTo="/"
      footer={
        <>
          <span className="text-slate-400">Already activated? </span>
          <Link
            to="/login"
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 rounded"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
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
        <div className="space-y-3">
          <PasswordField
            variant="glass"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            error={errors.password}
            autoComplete="new-password"
            required
          />
          <StrengthMeter value={password} />
          <p className="sr-only" aria-live="polite">
            {`Password strength: ${STRENGTH_LEVELS[strength].label}`}
          </p>
        </div>
        <PasswordField
          variant="glass"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repeat your password"
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={busy || !passwordsMatch}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-600/25 border border-indigo-400/20 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <span>{busy ? "Activating account..." : "Activate Account"}</span>
          {!busy && <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />}
        </button>
      </form>
    </AuthPage>
  );
}

export default ActivateAccount;
