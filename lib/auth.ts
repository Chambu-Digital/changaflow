// lib/auth.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;

export interface JWTPayload {
  userId: string;
  phone: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getAuthUser(req: NextRequest): JWTPayload | null {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '') ||
                req.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
