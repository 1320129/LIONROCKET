import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import { getDb } from "./db.js";

const router = Router();

const listQuery = z.object({
  characterId: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.coerce.number().int().optional(),
});

router.get("/", requireAuth, (req, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: "Invalid query" });
  const { characterId, limit, before } = parsed.data;
  const userId = (req as any).user.userId as number;
  const db = getDb();

  // Ensure user can access this character (default or owned)
  const ch = db
    .prepare(
      "SELECT id FROM characters WHERE id = ? AND (owner_user_id IS NULL OR owner_user_id = ?)"
    )
    .get(characterId, userId) as { id: number } | undefined;
  if (!ch) return res.status(404).json({ error: "Character not found" });

  const rows = before
    ? db
        .prepare(
          "SELECT id, role, content, created_at FROM messages WHERE character_id = ? AND user_id = ? AND created_at < ? ORDER BY created_at DESC LIMIT ?"
        )
        .all(characterId, userId, before, limit)
    : db
        .prepare(
          "SELECT id, role, content, created_at FROM messages WHERE character_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT ?"
        )
        .all(characterId, userId, limit);

  // Return ascending order for UI
  const asc = (rows as any[]).reverse();
  res.json(asc);
});

export default router;
