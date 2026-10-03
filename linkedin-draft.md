HOOK: #15 The Warning
Your spreadsheet is quietly costing you data integrity. Not your budget.

---

You can't write a rule into a cell that refuses a double punch-in. The `uq_attendance_user_day` constraint on `(user_id, work_date)` does what frontend validation can't: it survives two tabs, a refresh, two machines.

Spreadsheets run on trust. You eyeball overlaps, chase edit history, recompute hours at month-end. A 9-to-5 policy with an 8:30 early window becomes whatever the manager remembers.

TrackWise turns soft controls into hard ones.

Backend: Node 20 + Express 5, PostgreSQL. JWTs expire in 8 hours. Passwords bcrypt-10. Every mutating route validates before it touches the DB. Employees stay `pending` until they set their own password — admins never see it.

The check-in path is over-guarded on purpose. Service pre-check, then the unique constraint as the backstop. I stress-tested concurrent attempts to confirm it holds. Hours are calculated on check-out, never estimated.

Frontend: React 19 + Vite 8, Tailwind 4 tokens, lazy routes, an Axios interceptor that auto-logs you out on 401. Deployed on Render.

Phase 2: client-side face recognition via @vladmandic/face-api for enrollment. The DB still catches a double-punch. It can't stop a human from letting a coworker tap in. That's the gap nothing can close.

The thing you don't want is a tool that tracks time better. You want one where the wrong answer is impossible.

If you manage past five people, what's your backstop for a double punch-in?

#opensource #postgresql #attendantmanagement
