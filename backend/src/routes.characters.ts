import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { requireAuth } from "./auth.js";
import { getDb } from "./db.js";

const router = Router();

const uploadDir = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "uploads"
);
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || ".img";
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
  if (!ok) return cb(new Error("지원되지 않는 이미지 형식입니다"));
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

const createSchema = z.object({
  name: z.string().min(1).max(50),
  prompt: z.string().min(1).max(2000),
});

// Seed default characters if not present
export function seedDefaultCharacters() {
  const db = getDb();
  const defaults = [
    {
      name: "현자",
      prompt:
        "당신은 지혜로운 멘토입니다. 간결하고 실행 가능한 조언만 제공합니다.",
    },
    {
      name: "버디",
      prompt:
        "당신은 친근한 도우미입니다. 답변은 편안하고 친절하게 유지합니다.",
    },
    {
      name: "갤럭시",
      prompt: "당신은 SF 전문가입니다. 창의적이되 실용적인 어조로 답합니다.",
    },
  ];
  for (const d of defaults) {
    const exists = db
      .prepare(
        "SELECT id FROM characters WHERE owner_user_id IS NULL AND name = ?"
      )
      .get(d.name) as { id: number } | undefined;
    if (!exists) {
      db.prepare(
        "INSERT INTO characters (owner_user_id, name, prompt, thumbnail_path, created_at) VALUES (NULL, ?, ?, NULL, ?)"
      ).run(d.name, d.prompt, Date.now());
    }
  }
}

// List characters (defaults + user-owned)
router.get("/", requireAuth, (req, res) => {
  const user = (req as any).user as { userId: number };
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT id, owner_user_id, name, prompt, thumbnail_path, created_at FROM characters WHERE owner_user_id IS NULL OR owner_user_id = ? ORDER BY created_at DESC"
    )
    .all(user.userId) as Array<{
    id: number;
    owner_user_id: number | null;
    name: string;
    prompt: string;
    thumbnail_path: string | null;
    created_at: number;
  }>;
  res.json(rows);
});

// Create character (multipart)
router.post("/", requireAuth, upload.single("thumbnail"), (req, res) => {
  const parsed = createSchema.safeParse({
    name: req.body?.name,
    prompt: req.body?.prompt,
  });
  if (!parsed.success)
    return res.status(400).json({ error: "잘못된 입력입니다" });
  const { name, prompt } = parsed.data;
  const user = (req as any).user as { userId: number };
  const file = req.file;
  const db = getDb();
  const createdAt = Date.now();
  const relativePath = file
    ? path.join(process.env.UPLOAD_DIR || "uploads", path.basename(file.path))
    : null;
  const info = db
    .prepare(
      "INSERT INTO characters (owner_user_id, name, prompt, thumbnail_path, created_at) VALUES (?, ?, ?, ?, ?)"
    )
    .run(user.userId, name, prompt, relativePath, createdAt);
  const id = Number(info.lastInsertRowid);
  res.json({
    id,
    name,
    prompt,
    thumbnail_path: relativePath,
    created_at: createdAt,
  });
});

// Delete character (owner-only)
router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "잘못된 요청입니다" });
  }
  const user = (req as any).user as { userId: number };
  const db = getDb();
  const row = db
    .prepare(
      "SELECT id, owner_user_id, thumbnail_path FROM characters WHERE id = ?"
    )
    .get(id) as
    | {
        id: number;
        owner_user_id: number | null;
        thumbnail_path: string | null;
      }
    | undefined;
  if (!row) return res.status(404).json({ error: "캐릭터를 찾을 수 없습니다" });
  if (row.owner_user_id !== user.userId) {
    return res.status(403).json({ error: "권한이 없습니다" });
  }
  // Delete DB row (messages cascade)
  db.prepare("DELETE FROM characters WHERE id = ?").run(id);
  // Remove thumbnail file if exists
  if (row.thumbnail_path) {
    const abs = path.resolve(process.cwd(), row.thumbnail_path);
    try {
      if (fs.existsSync(abs)) fs.unlinkSync(abs);
    } catch {}
  }
  return res.json({ ok: true });
});

export default router;
