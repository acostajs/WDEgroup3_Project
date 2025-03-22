import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any; // Attach user info to the request object
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded; // Attach decoded user data to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token." });
  }
};
