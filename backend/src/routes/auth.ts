// backend/src/routes/auth.ts
import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginSchema } from "../lib/validations";

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: 8 * 60 * 60 * 1000, // 8 hours in ms
  secure: process.env.NODE_ENV === "production",
};

authRouter.post("/login", validateBody(loginSchema), (req, res) => {
  const { secret } = req.body as { secret: string };
  const adminSecret = process.env.ADMIN_SECRET ?? "";

  // Constant-time comparison to prevent timing attacks
  const inputBuffer = Buffer.from(secret);
  const secretBuffer = Buffer.from(adminSecret);

  let isValid = false;
  if (inputBuffer.length === secretBuffer.length) {
    isValid = crypto.timingSafeEqual(inputBuffer, secretBuffer);
  }

  if (!isValid) {
    res.status(401).json({ success: false, error: "Invalid secret" });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    res.status(500).json({ success: false, error: "Server configuration error" });
    return;
  }

  const token = jwt.sign(
    { adminId: "admin" },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? "8h" }
  );

  res.cookie("admin_token", token, COOKIE_OPTIONS);
  res.json({ success: true });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("admin_token", { path: "/" });
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, data: { adminId: req.adminId } });
});
