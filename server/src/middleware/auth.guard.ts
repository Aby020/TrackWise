import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { jwtSecret } from "@/config/env";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export interface AuthenticatedUser {
    readonly id: number | string;
    readonly userId?: number | string;
    readonly employeeId: string;
    readonly email: string;
    readonly role: string;
}

/**
 * The caller's primary key, whichever claim carried it.
 *
 * The legacy login signs the JWT with the legacy integer
 * `id`, while modern punch endpoints resolve against
 * modern.users (a UUID). Resolving happens lazily here so a
 * legacy-shaped token still maps to the correct modern user
 * row instead of failing with "Employee ID not found".
 */
export const userKey = (
    user: AuthenticatedUser,
): string => String(user.id ?? user.userId ?? user.employeeId ?? "");

declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

interface TokenPayload {
    readonly id?: number | string;
    readonly userId?: number | string;
    readonly employeeId?: string;
    readonly email?: string;
    readonly role?: string;
}

const extractToken = (req: Request): string | undefined => {
    const header = req.headers.authorization;

    if (!header) {
        return undefined;
    }

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return undefined;
    }

    return token;
};

/**
 * Resolve the modern user row for a verified token.
 *
 * Tries, in order:
 *  1. modern.users.id (a UUID — the modern flow)
 *  2. modern.users.employee_id (case/hyphen tolerant, so
 *     "EMP-102" and "EMP102" both resolve)
 *
 * Returns the resolved UUID (or the raw claim when no modern
 * row matches, so downstream code still receives the claim).
 */
const resolveModernUserId = async (
    payload: TokenPayload,
): Promise<string> => {
    const rawId = String(payload.id ?? payload.userId ?? "").trim();
    const rawEmployeeId = String(payload.employeeId ?? "").trim();

    if (rawId) {
        const byId = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, rawId))
            .limit(1);

        if (byId[0]) {
            return String(byId[0].id);
        }
    }

    const lookup = (rawEmployeeId || rawId).toLowerCase().replace(/-/g, "");

    if (lookup) {
        const byEmployeeId = await db
            .select({ id: users.id, employeeId: users.employeeId })
            .from(users)
            .where(
                sql`lower(replace(${users.employeeId}, '-', '')) = ${lookup}`,
            )
            .limit(1);

        if (byEmployeeId[0]) {
            return String(byEmployeeId[0].id);
        }
    }

    return rawId || rawEmployeeId;
};

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const token = extractToken(req);

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Access token is required.",
        });
        return;
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as TokenPayload;

        const resolvedId = await resolveModernUserId(payload);

        req.user = {
            id: resolvedId,
            employeeId: payload.employeeId ?? "",
            email: payload.email ?? "",
            role: payload.role ?? "",
        };

        next();
    } catch {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token.",
        });
    }
};

export const adminOnly = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    if (req.user?.role !== "admin") {
        res.status(403).json({
            success: false,
            message: "Access denied. Admins only.",
        });
        return;
    }

    next();
};
