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
    return res.status(400).json({ error: "잘못된 입력입니다" });
  const { characterId, message } = parsed.data;

  const user = (req as any).user as { userId: number; email: string };
  const userId = user.userId;

  const db = getDb();

  let systemPrompt: string | undefined = undefined;
  if (characterId) {
    const ch = db
      .prepare(
        "SELECT id, owner_user_id, prompt FROM characters WHERE id = ? AND (owner_user_id IS NULL OR owner_user_id = ?)"
      )
      .get(characterId, userId) as
      | { id: number; owner_user_id: number | null; prompt: string }
      | undefined;
    if (!ch)
      return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
    systemPrompt = ch.prompt;
  }

  const createdAt = Date.now();
  const insertedUserMsg = db
    .prepare(
      "INSERT INTO messages (character_id, user_id, role, content, created_at) VALUES (?, NULL, 'user', ?, ?)"
    )
    .run(characterId ?? null, message, createdAt);

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey)
      return res
        .status(500)
        .json({
          error: "서버 환경변수 ANTHROPIC_API_KEY가 설정되지 않았습니다",
        });

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
      return res.status(502).json({ error: `Claude 오류: ${text}` });
    }
    const data = (await response.json()) as any;
    const parts = Array.isArray(data?.content) ? data.content : [];
    const reply: string = parts
      .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
      .join("")
      .trim();

    const createdAtAssistant = Date.now();
    db.prepare(
      "INSERT INTO messages (character_id, user_id, role, content, created_at) VALUES (?, NULL, 'assistant', ?, ?)"
    ).run(characterId ?? null, reply, createdAtAssistant);

    return res.json({ reply, createdAt: createdAtAssistant });
  } catch (e: any) {
    return res
      .status(500)
      .json({ error: e?.message || "채팅 처리에 실패했습니다" });
  }
});

export default router;
