import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Hashes a plaintext password using bcrypt
 * @param password The plaintext password
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compares a plaintext password against a hashed password
 * @param password The plaintext password
 * @param hash The stored hash
 * @returns boolean indicating if they match
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generates an Access Token and a Refresh Token
 * @param payload The data to embed in the token (usually { id, role })
 */
export const generateTokens = (payload: object) => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRATION || '1h') as any,
  });

  return { accessToken };
};

/**
 * Generates a 6-digit numeric OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a secure random 32-character string for password reset tokens
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generates an 8-character random password for new Staff/Doctors
 */
export const generateRandomPassword = (): string => {
  return crypto.randomBytes(4).toString('hex'); // 8 hex characters
};
