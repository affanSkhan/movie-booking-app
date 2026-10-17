import jwt from "jsonwebtoken";

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
};

export const generateJWT = (payload: JWTPayload): string => {
  return jwt.sign(payload, getJWTSecret(), { expiresIn: "24h" });
};

export const verifyJWT = (token: string): JWTPayload => {
  return jwt.verify(token, getJWTSecret()) as JWTPayload;
};
