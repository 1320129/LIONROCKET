import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import { getDb } from "./db.js";
const router = Router();
const bodySchema = z.object({
    characterId: z.number().int().positive().optional(),
    message: z.string().min(1).max(200),
    model: z.string().optional(),
});
router.post("/", requireAuth, async (req, res) => {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: "Invalid input" });
    const { characterId, message } = parsed.data;
    const user = req.user;
    const userId = user.userId;
    const db = getDb();
    let systemPrompt = undefined;
    if (characterId) {
        const ch = db
            .prepare("SELECT id, owner_user_id, prompt FROM characters WHERE id = ? AND (owner_user_id IS NULL OR owner_user_id = ?)")
            .get(characterId, userId);
        if (!ch)
            return res.status(404).json({ error: "Character not found" });
        systemPrompt = ch.prompt;
    }
    const createdAt = Date.now();
    const insertedUserMsg = db
        .prepare("INSERT INTO messages (character_id, user_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)")
        .run(characterId ?? null, userId, message, createdAt);
    try {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey)
            return res.status(500).json({ error: "Missing ANTHROPIC_API_KEY" });
        const model = parsed.data.model || "claude-3-5-sonnet-20240620";
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model,
                max_tokens: 512,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: message,
                    },
                ],
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            return res.status(502).json({ error: `Claude error: ${text}` });
        }
        const data = (await response.json());
        const parts = Array.isArray(data?.content) ? data.content : [];
        const reply = parts
            .map((p) => (typeof p?.text === "string" ? p.text : ""))
            .join("")
            .trim();
        const createdAtAssistant = Date.now();
        db.prepare("INSERT INTO messages (character_id, user_id, role, content, created_at) VALUES (?, ?, 'assistant', ?, ?)").run(characterId ?? null, userId, reply, createdAtAssistant);
        return res.json({ reply, createdAt: createdAtAssistant });
    }
    catch (e) {
        return res.status(500).json({ error: e?.message || "Chat failed" });
    }
});
export default router;
//# sourceMappingURL=routes.chat.js.map