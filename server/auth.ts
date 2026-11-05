import { Router } from "express";
import bcrypt from "bcrypt";
import { rateLimit } from 'express-rate-limit';

const router = Router();

declare module "express-session" {
  interface SessionData {
    user?: {
      id: string;
      isAdmin: boolean;
    };
  }
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: {
    error: 'Too many login attempts. Try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/*
Current login has 1 fixed password
Future authentication methods should establish req.session.user
after successfully verifying the user's identity.
*/

router.post("/login", loginLimiter, async (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string") {
    return res.status(400).json({ error: "Invalid request" });
  }

  try {
    const valid = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH!
    );

    if (!valid) {
      return res.status(401).json({ error: "Wrong password" });
    }

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: "Login failed" });
      }

      req.session.user = {
        id: "admin",
        isAdmin: true
      };

      res.json({ authenticated: true });
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Logout failed"
      });
    }

    res.clearCookie("admin.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    res.json({ authenticated: false });
  });
});

router.get("/me", (req, res) => {
  res.json({
    authenticated: !!req.session.user?.isAdmin
  });
});

export default router;