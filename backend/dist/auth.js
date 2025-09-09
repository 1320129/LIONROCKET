import jwt from "jsonwebtoken";
const COOKIE_NAME = "auth";
export function signToken(payload) {
    const secret = process.env.JWT_SECRET || "dev-secret";
    return jwt.sign(payload, secret, { expiresIn: "7d" });
}
export function verifyToken(token) {
    try {
        const secret = process.env.JWT_SECRET || "dev-secret";
        return jwt.verify(token, secret);
    }
    catch {
        return null;
    }
}
export function setAuthCookie(res, token) {
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
    });
}
export function clearAuthCookie(res) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
}
export function requireAuth(req, res, next) {
    const token = req.cookies?.[COOKIE_NAME] ||
        (req.headers.authorization?.replace("Bearer ", "") ?? "");
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = payload;
    next();
}
//# sourceMappingURL=auth.js.map