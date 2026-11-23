import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import bcrypt from "bcrypt";
import { rateLimit } from "express-rate-limit";

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
  message: { error: "Too many login attempts. Try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

/*
Current login has 1 fixed password.
Future authentication methods should establish req.session.user
after successfully verifying the user's identity.
*/

router.post("/login", loginLimiter, async (req, res) => {
  const password = req.body?.password;
  if (typeof password !== "string") {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    res.status(500).json({ error: "Login failed" });
    return;
  }

  try {
    const valid = await bcrypt.compare(password, hash);
    if (!valid) {
      res.status(401).json({ error: "Wrong password" });
      return;
    }

    req.session.regenerate((err) => {
      if (err) {
        res.status(500).json({ error: "Login failed" });
        return;
      }

      req.session.user = { id: "admin", isAdmin: true };
      req.session.save((saveErr) => {
        if (saveErr) {
          res.status(500).json({ error: "Login failed" });
          return;
        }
        res.json({ authenticated: true });
      });
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Logout failed" });
      return;
    }

    res.clearCookie("admin.sid", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });
    res.json({ authenticated: false });
  });
});

router.get("/me", (req, res) => {
  res.json({ authenticated: Boolean(req.session?.user?.isAdmin) });
});

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!req.session?.user?.isAdmin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

export default router;