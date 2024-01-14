import { Response } from "express";

export const handleErrorResponse = (res: Response, errorMessage: string) =>
  res.status(500).json({ error: errorMessage });
