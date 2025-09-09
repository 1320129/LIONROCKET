import type { Request, Response, NextFunction } from "express";
export type JwtPayload = {
    userId: number;
    email: string;
};
export declare function signToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload | null;
export declare function setAuthCookie(res: Response, token: string): void;
export declare function clearAuthCookie(res: Response): void;
export declare function requireAuth(req: Request, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map