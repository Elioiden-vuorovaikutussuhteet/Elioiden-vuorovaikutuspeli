import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

if (process.env.NODE_ENV === "development") {
  process.env.SESSION_SECRET ||= crypto.randomBytes(32).toString("hex");
  process.env.ADMIN_PASSWORD_HASH ||= bcrypt.hashSync(
    process.env.DEV_ADMIN_PASSWORD || "admin",
    10,
  );
}

if (!process.env.SESSION_SECRET || !process.env.ADMIN_PASSWORD_HASH) {
  throw new Error(
    "Missing required environment variables: SESSION_SECRET and ADMIN_PASSWORD_HASH",
  );
}

import express from "express";
import session from "express-session";
import helmet from "helmet";
import authRouter, { requireAdmin } from "./auth";
import configRouter from "./configRoutes";
import { profileRoutes } from "./profileRoutes";
import { initDb } from "./db";

const app = express();
const PORT = 3000;

app.set("trust proxy", 1);

app.use(helmet());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(
  session({
    name: "admin.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 12,
    },
  }),
);

app.use("/api/auth", authRouter);
app.use("/api/configs", configRouter);
app.use("/api/profiles", profileRoutes);

app.get("/api/hello", requireAdmin, (_req, res) => {
  res.json({
    message: "Logged in as admin",
    status: "success",
  });
});

// Initialize database table before starting the HTTP server
initDb()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Express running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });