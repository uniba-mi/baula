import { NextFunction, Request, Response } from "express";
import { User } from "../../../../../interfaces/user";

export function denyDemoWrites(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const forbiddenMethods = ["POST", "PUT", "DELETE"];

  const user = req.user as User
  if (user && user.roles.includes("demo") && forbiddenMethods.includes(req.method)) {
    return res.status(403).json({
      message: "Aktion für Demo-Nutzer nicht erlaubt."
    });
  }

  next();
}