import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEMO_QUERY = "demo";

/** The live demo is entered through `?demo=true` on any workspace route. */
export function isDemoLocation(location) {
  return new URLSearchParams(location.search).get(DEMO_QUERY) === "true";
}

const DEMO_PROFILE = {
  employeeId: "EMP-DEMO",
  firstName: "Sarah",
  lastName: "Chen",
  role: "employee",
};

const CHIME_DURATION_SECONDS = 60;

const CHIME_FREQUENCIES = [880, 1174.66];

/** Web Audio chime for the desk-check verification flow. */
export function playDeskCheckChime() {
  try {
    const AudioCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioCtor) return false;
    const ctx = new AudioCtor();
    CHIME_FREQUENCIES.forEach((frequency, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.14;
      const duration = 0.5;
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration);
    });
    window.setTimeout(() => ctx.close().catch(() => {}), 1200);
    return true;
  } catch {
    return false;
  }
}

/**
 * Interactive demo session driven by the `?demo=true` search param.
 * Holds a fully local, simulated attendance state so the demo
 * never touches real DB records.
 */
export function useDemoMode() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDemo = searchParams.get(DEMO_QUERY) === "true";

  const [status, setStatus] = useState("working");
  const [breakType, setBreakType] = useState(null);
  const [breakStartedAt, setBreakStartedAt] = useState(null);
  const [checkIn, setCheckIn] = useState(() => {
    const d = new Date();
    d.setHours(8, 41, 0, 0);
    return d.toISOString();
  });
  const [workSeconds, setWorkSeconds] = useState(5.2 * 3600);
  const [presenceChime, setPresenceChime] = useState(false);
  const [chimeCountdown, setChimeCountdown] = useState(null);
  const [idleFlagged, setIdleFlagged] = useState(false);
  const [idleFlaggedAt, setIdleFlaggedAt] = useState(null);

  const exitDemo = useCallback(() => {
    const next = new URLSearchParams(searchParams);
    next.delete(DEMO_QUERY);
    const qs = next.toString();
    setSearchParams(qs ? `?${qs}` : ".", { replace: true });
  }, [searchParams, setSearchParams]);

  const startBreak = useCallback((type) => {
    setBreakType(type);
    setBreakStartedAt(new Date().toISOString());
    setStatus("on_break");
    setIdleFlagged(false);
    setIdleFlaggedAt(null);
  }, []);

  const resumeWork = useCallback(() => {
    setBreakType(null);
    setBreakStartedAt(null);
    setStatus("working");
    setIdleFlagged(false);
    setIdleFlaggedAt(null);
  }, []);

  const endWork = useCallback(() => {
    setStatus("completed");
    setBreakType(null);
    setBreakStartedAt(null);
    setIdleFlagged(false);
    setIdleFlaggedAt(null);
  }, []);

  /** Reset the simulated day: fresh check-in, zero accrued hours. */
  const simulateStartWork = useCallback(() => {
    const now = new Date();
    setCheckIn(now.toISOString());
    setWorkSeconds(0);
    setBreakType(null);
    setBreakStartedAt(null);
    setStatus("working");
    setIdleFlagged(false);
    setIdleFlaggedAt(null);
  }, []);

  const triggerPresenceCheck = useCallback(() => {
    setPresenceChime(true);
    setChimeCountdown(CHIME_DURATION_SECONDS);
  }, []);

  const dismissPresenceChime = useCallback(() => {
    setPresenceChime(false);
    setChimeCountdown(null);
  }, []);

  /** Flip the session to amber "idle" to show unverified behaviour. */
  const simulateIdleFlag = useCallback(() => {
    if (status !== "working") return;
    setIdleFlagged(true);
    setIdleFlaggedAt(new Date().toISOString());
  }, [status]);

  const clearIdleFlag = useCallback(() => {
    setIdleFlagged(false);
    setIdleFlaggedAt(null);
  }, []);

  useEffect(() => {
    if (!isDemo || status !== "working") return undefined;
    const id = window.setInterval(() => {
      setWorkSeconds((s) => s + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isDemo, status]);

  useEffect(() => {
    if (chimeCountdown === null) return undefined;
    if (chimeCountdown <= 0) {
      setPresenceChime(false);
      setChimeCountdown(null);
      return undefined;
    }
    const id = window.setTimeout(() => {
      setChimeCountdown((c) => (c === null ? null : c - 1));
    }, 1000);
    return () => window.clearTimeout(id);
  }, [chimeCountdown]);

  const value = useMemo(
    () => ({
      isDemo,
      profile: DEMO_PROFILE,
      status,
      breakType,
      breakStartedAt,
      checkIn,
      workSeconds,
      presenceChimeOpen: presenceChime,
      chimeCountdown,
      idleFlagged,
      idleFlaggedAt,
      exitDemo,
      startBreak,
      resumeWork,
      endWork,
      simulateStartWork,
      triggerPresenceCheck,
      dismissPresenceChime,
      simulateIdleFlag,
      clearIdleFlag,
    }),
    [
      isDemo,
      status,
      breakType,
      breakStartedAt,
      checkIn,
      workSeconds,
      presenceChime,
      chimeCountdown,
      idleFlagged,
      idleFlaggedAt,
      exitDemo,
      startBreak,
      resumeWork,
      endWork,
      simulateStartWork,
      triggerPresenceCheck,
      dismissPresenceChime,
      simulateIdleFlag,
      clearIdleFlag,
    ],
  );

  return value;
}
