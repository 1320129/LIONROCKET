import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { getDb } from "./db.js";
import { clearAuthCookie, setAuthCookie, signToken } from "./auth.js";
import jwt from "jsonwebtoken";
const router = Router();
const credentialsSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});
router.post("/register", async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid input" });
    const { email, password } = parsed.data;
    const db = getDb();
    const existing = db
        .prepare("SELECT id FROM users WHERE email = ?")
        .get(email);
    if (existing)
        return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = Date.now();
    const info = db
        .prepare("INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)")
        .run(email, passwordHash, createdAt);
    const userId = Number(info.lastInsertRowid);
    const token = signToken({ userId, email });
    setAuthCookie(res, token);
    res.json({ id: userId, email });
});
router.post("/login", async (req, res) => {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid input" });
    const { email, password } = parsed.data;
    const db = getDb();
    const row = db
        .prepare("SELECT id, password_hash FROM users WHERE email = ?")
        .get(email);
    if (!row)
        return res.status(401).json({ error: "Invalid email or password" });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok)
        return res.status(401).json({ error: "Invalid email or password" });
    const token = signToken({ userId: row.id, email });
    setAuthCookie(res, token);
    res.json({ id: row.id, email });
});
router.post("/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ ok: true });
});
router.get("/me", (req, res) => {
    const token = req.cookies?.["auth"] ||
        (req.headers.authorization?.replace("Bearer ", "") ?? "");
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const secret = process.env.JWT_SECRET || "dev-secret";
        const decoded = jwt.verify(token, secret);
        // refresh cookie to avoid edge cases with stale tokens
        const refreshed = jwt.sign({ userId: decoded.userId, email: decoded.email }, secret, { expiresIn: "7d" });
        res.cookie("auth", refreshed, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
        res.json({ id: decoded.userId, email: decoded.email });
    }
    catch {
        res.status(401).json({ error: "Unauthorized" });
    }
});
export default router;
//# sourceMappingURL=routes.auth.js.map