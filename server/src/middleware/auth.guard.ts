import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { jwtSecret } from "@/config/env";

export interface AuthenticatedUser {
    readonly id: number | string;
    readonly employeeId: string;
    readonly email: string;
    readonly role: string;
}

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

export const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
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

        req.user = {
            id: payload.id ?? payload.userId ?? "",
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
