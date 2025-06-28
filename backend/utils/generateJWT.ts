import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export const generateJWT = (payload: JWTPayload): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

export const verifyJWT = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
}; 