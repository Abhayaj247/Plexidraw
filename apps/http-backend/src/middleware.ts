import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from "@repo/backend-common/config"


// Extend Request interface to include `userId` and `isGuest`
declare global {
    namespace Express {
      interface Request {
        userId?: string;
        isGuest?: boolean;
      }
    }
  }

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const token = req.headers["authorization"];
    
    // Allow guest access if no token is provided
    if (!token) {
        req.isGuest = true;
        next();
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string") {
            res.status(401).json({
                message: "Invalid token"
            });
            return;
        }
        req.userId = (decoded as JwtPayload).userId;
        req.isGuest = false;
        next();
    } catch (error) {
        res.status(401).json({
            message: "Invalid token"
        });
    }
};
