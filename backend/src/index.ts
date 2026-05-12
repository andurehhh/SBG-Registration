import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { membersRouter } from "./routes/members";
import { adminMembersRouter } from "./routes/admin/members";
import { adminStatsRouter } from "./routes/admin/stats";
import { adminAnnouncementsRouter } from "./routes/admin/announcements";
import { adminTermResetRouter } from "./routes/admin/termReset";

const app = express();
const PORT = process.env.PORT ?? 4000;

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/members", membersRouter);
app.use("/api/admin/members", adminMembersRouter);
app.use("/api/admin/stats", adminStatsRouter);
app.use("/api/admin/announcements", adminAnnouncementsRouter);
app.use("/api/admin/term-reset", adminTermResetRouter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SBG Portal API running on port ${PORT}`);
});

export default app;
