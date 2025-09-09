import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes.auth.js";
import chatRoutes from "./routes.chat.js";
import characterRoutes, { seedDefaultCharacters } from "./routes.characters.js";
import messagesRoutes from "./routes.messages.js";
import path from "path";
import fs from "fs";
import { getDb } from "./db.js";
dotenv.config();
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
// Ensure DB initializes on boot
getDb();
seedDefaultCharacters();
app.use("/auth", authRoutes);
app.use("/chat", chatRoutes);
app.use("/characters", characterRoutes);
app.use("/messages", messagesRoutes);
// serve uploads statically
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const uploadAbs = path.resolve(process.cwd(), uploadDir);
if (!fs.existsSync(uploadAbs))
    fs.mkdirSync(uploadAbs, { recursive: true });
app.use("/uploads", express.static(uploadAbs));
app.get("/health", (_req, res) => res.json({ ok: true }));
const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map