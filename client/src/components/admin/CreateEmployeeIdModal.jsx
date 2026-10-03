import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Check, Copy, KeyRound, UserPlus } from "lucide-react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import {
  createEmployeeId,
  getEmployeeIdShiftOptions,
  getNextEmployeeId,
} from "../../services/employeeId";
import { cn } from "../../lib/utils";

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await window.navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Copy failed — select the text manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied" : "Copy to clipboard"}
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        copied
          ? "bg-success-soft text-success"
          : "text-faint hover:bg-slate-100 hover:text-ink",
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}

function SummaryRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-2 text-sm font-semibold text-ink",
          mono && "font-mono tabular",
        )}
      >
        <span className="truncate">{value}</span>
        <CopyButton value={value} />
      </dd>
    </div>
  );
}

/**
 * "Create Employee ID" onboarding modal: sequential ID generation,
 * shift assignment, and a copyable activation summary card.
 */
export function CreateEmployeeIdModal({ open, onClose, onCreated }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [shifts, setShifts] = useState([]);
  const [nextEmployeeId, setNextEmployeeId] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState(null);

  const loadMeta = useCallback(async () => {
    try {
      const [idRes, shiftRes] = await Promise.allSettled([
        getNextEmployeeId(),
        getEmployeeIdShiftOptions(),
      ]);
      if (idRes.status === "fulfilled") {
        setNextEmployeeId(idRes.value.data?.nextEmployeeId ?? null);
      }
      if (shiftRes.status === "fulfilled") {
        const list = Array.isArray(shiftRes.value.data)
          ? shiftRes.value.data
          : [];
        setShifts(list);
        const active = list.find((s) => s.isActive) ?? list[0];
        setShiftId(active ? String(active.id) : "");
      }
    } catch {
      // Meta is best-effort — the form still works without it.
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    loadMeta();
    return undefined;
  }, [open, loadMeta]);

  const close = () => {
    setSummary(null);
    setErrors({});
    setFirstName("");
    setLastName("");
    setEmail("");
    onClose();
  };

  const validate = () => {
    const next = {};

    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!email.trim()) {
      next.email = "Corporate email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = "Enter a valid corporate email address.";
    }
    if (!shiftId) next.shift = "Select a shift.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setBusy(true);
    try {
      const result = await createEmployeeId({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        ...(shiftId ? { shiftId: Number(shiftId) } : {}),
      });

      const created = result.data;
      setSummary(created);
      toast.success(
        `Employee ID ${created.employeeId} created — pending activation.`,
      );
      onCreated?.(created);
      await loadMeta();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Unable to create the employee ID.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Create Employee ID"
      description="Onboard a new employee — they'll activate their own account."
      size="md"
      footer={
        summary ? (
          <Button variant="primary" onClick={close}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={busy}
              leftIcon={UserPlus}
            >
              Create Employee ID
            </Button>
          </>
        )
      }
    >
      {summary ? (
        <div className="py-2">
          <div className="flex items-center gap-3 rounded-xl border border-success/25 bg-success-soft px-4 py-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-success text-white">
              <KeyRound className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">
                Employee ID created
              </p>
              <p className="text-xs text-muted">
                Account is pending — share the activation link below.
              </p>
            </div>
          </div>

          <dl className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface-raised px-4">
            <SummaryRow
              label="Employee ID"
              value={summary.employeeId}
              mono
            />
            <SummaryRow
              label="Name"
              value={`${summary.firstName} ${summary.lastName}`}
            />
            <SummaryRow label="Email" value={summary.email} />
            <SummaryRow
              label="Activation link"
              value={`${window.location.origin}${summary.activationLink}`}
            />
          </dl>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Full Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Given name"
              error={errors.firstName}
              autoComplete="given-name"
              required
            />
            <Input
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Family name"
              error={errors.lastName}
              autoComplete="family-name"
              required
            />
          </div>

          <Input
            label="Corporate Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            error={errors.email}
            autoComplete="email"
            required
          />

          <Field
            label="Shift"
            htmlFor="create-employee-shift"
            error={errors.shift}
            required
          >
            <div className="relative">
              <select
                id="create-employee-shift"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                aria-invalid={errors.shift ? true : undefined}
                aria-describedby={errors.shift ? "create-employee-shift-error" : undefined}
                className="h-9.5 w-full appearance-none rounded-lg border border-line bg-surface px-3.5 pr-10 text-sm text-ink shadow-sm transition-colors duration-150 focus:outline-none focus:ring-4 focus:ring-primary/15"
              >
                {shifts.length === 0 && <option value="">Loading…</option>}
                {shifts.map((shift) => (
                  <option key={shift.id} value={String(shift.id)}>
                    {shift.shiftName} ({shift.startTime} – {shift.endTime})
                    {shift.isActive ? " · active" : ""}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          {nextEmployeeId && (
            <p className="rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-xs text-muted">
              Next Employee ID:{" "}
              <span className="font-mono font-semibold tabular text-ink">
                {nextEmployeeId}
              </span>{" "}
              — generated automatically in sequence.
            </p>
          )}
        </form>
      )}
    </Modal>
  );
}
