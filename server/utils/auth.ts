import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Secret key for cryptographic signing of JWT tokens
const JWT_SECRET = process.env.JWT_SECRET || 'haymete-abrham-sunday-school-secret-key-2026-jwt-token-hash-strong';
const JWT_EXPIRES_IN = '7d';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
  amharicName?: string;
}

// Extend Express Request type to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * Hashes a plaintext password using bcrypt with salt rounds of 10
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Synchronously hashes a password (useful for initial state/seed data)
 */
export function hashPasswordSync(plainPassword: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainPassword, salt);
}

/**
 * Compares plaintext password against a stored password.
 * Supports standard bcrypt hashes and automatically identifies legacy plaintext for seamless migration.
 */
export async function comparePassword(plainPassword: string, storedHashOrPlain: string): Promise<boolean> {
  if (!plainPassword || !storedHashOrPlain) {
    return false;
  }

  // Check if the stored string is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
  const isBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(storedHashOrPlain);

  if (isBcryptHash) {
    return bcrypt.compare(plainPassword, storedHashOrPlain);
  }

  // Legacy plaintext fallback comparison
  return plainPassword === storedHashOrPlain;
}

/**
 * Generates a cryptographically signed JWT token with a 7-day expiration
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });
}

/**
 * Verifies a JWT token and returns the decoded payload
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Express Middleware to authenticate and verify incoming JWT tokens
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token. Please sign in again.',
    });
  }

  req.user = decoded;
  next();
}
