import { type Request, type Response, type NextFunction } from "express";
import { verifyJWT } from "../utils/generateJWT";
import { createError } from "../utils/handleErrors";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      throw createError("Access token required", 401);
    }

    const decoded = verifyJWT(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError("Invalid token", 403));
  }
};
