import express from 'express';
import session from 'express-session';
import authRouter from "./auth"
import helmet from 'helmet';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });

const app = express();
const PORT = 3000;

app.use(helmet());
app.use(express.json());

console.log("SESSION_SECRET loaded:", !!process.env.SESSION_SECRET);

app.use(
  session({
    name: "admin.sid",
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 12
    }
  })
);

app.use("/api/auth", authRouter);

// Authorization
function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!req.session.user?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

app.use("/api/hello", requireAdmin);

app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Express!',
    status: 'success'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express running on port ${PORT}`);
});