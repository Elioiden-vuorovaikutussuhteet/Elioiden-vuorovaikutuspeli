import { Router } from "express";
import bcrypt from "bcrypt";

const router = Router();

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

router.post("/login", async (req, res) => {
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

      req.session.isAdmin = true;

      res.json({ authenticated: true });
    });
  } catch {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("admin.sid");
    res.json({ authenticated: false });
  });
});

router.get("/me", (req, res) => {
  res.json({
    authenticated: req.session.isAdmin === true
  });
});

export default router;