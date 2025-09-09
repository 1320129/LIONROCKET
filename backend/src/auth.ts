import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const COOKIE_NAME = "auth";

export type JwtPayload = { userId: number; email: string };

export function signToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET || "dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token =
    req.cookies?.[COOKIE_NAME] ||
    (req.headers.authorization?.replace("Bearer ", "") ?? "");
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    return res.status(401).json({ error: "인증되지 않았습니다" });
  }
  (req as any).user = payload;
  next();
}
