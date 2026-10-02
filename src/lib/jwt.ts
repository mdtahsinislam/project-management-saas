import jwt, { SignOptions } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

export function signAccessToken(payload: object) {
  const options: SignOptions = {
    expiresIn: ACCESS_EXPIRES as any,
  };
  return jwt.sign(payload, ACCESS_SECRET, options);
}

export function signRefreshToken(payload: object) {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRES as any,
  };
  return jwt.sign(payload, REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}