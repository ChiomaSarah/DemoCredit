const dotenv = require("dotenv");
dotenv.config();

import jwt, { Secret, verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: number;
}

const tokenSecret: Secret = process.env.TOKEN_SECRET as Secret;

export function generateJwtToken(userId: number): string {
  return jwt.sign({ userId }, tokenSecret, { expiresIn: "1hr" });
}

export function verifyToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { userId } = verify(token, tokenSecret) as { userId: number };
    req.userId = userId;
    next();
  } catch (error) {
    console.error("Error verifying token: ", error);
    res.status(401).json({ error: "Invalid token" });
  }
}
