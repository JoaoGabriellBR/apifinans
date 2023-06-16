import jwt, { Secret } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

declare module "express" {
  interface Request {
    userData?: any;
  }
}

const secret = process.env.AUTH_SECRET;

export default async function decodeUserToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).send({ error: "Unauthorized" });

  try {
    const decodedToken = jwt.verify(authorization, secret as Secret);
    req.userData = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send({ error: "Unauthorized" });
  }
}
