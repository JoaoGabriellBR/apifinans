import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, DecodeOptions } from "jsonwebtoken";
import generateSecretKey from "../utils/secretKey";

const secretKey = generateSecretKey(32);

interface CustomRequest extends Request {
  userData?: JwtPayload;
}

async function decodeUserToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { authorization } = req.headers;
  if (!authorization) return res.status(401).send({ error: "Unauthorized." });

  const decodedToken = jwt.decode(authorization, secretKey as DecodeOptions);
  if (!decodedToken) return res.status(401).send({ error: "Unauthorized." });

  req.userData = decodedToken as JwtPayload;
  next();
}

export default decodeUserToken;
