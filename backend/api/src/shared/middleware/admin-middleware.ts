import { NextFunction, Request, Response } from "express";
import { UserServer } from "../../../../../interfaces/user";
import { User } from "../../database/mongo";

export async function checkAndReturnAdminUser(req: Request, res: Response, next: NextFunction) {
  const user = req.user as UserServer;
  const isAdmin = await checkAdminRole(user);
  if (req.user && isAdmin) {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

async function checkAdminRole(user: UserServer): Promise<boolean> {
  const dbUser = await User.findById(user._id).exec();
  return dbUser ? dbUser.roles.includes("admin") : false;
}