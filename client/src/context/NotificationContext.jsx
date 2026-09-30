/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "tw_notifications";
const MAX_ITEMS = 20;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — notifications stay in memory */
  }
}

/**
 * In-app notification feed, persisted to localStorage. Events are pushed by
 * the UI as real user actions happen (clock-in/out, employee changes).
 */
const NotificationContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(load);

  const addNotification = useCallback(({ type = "info", title, body }) => {
    const item = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      type,
      title,
      body,
      time: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => {
      const next = [item, ...prev].slice(0, MAX_ITEMS);
      persist(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      addNotification,
      markAllRead,
    }),
    [notifications, addNotification, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
