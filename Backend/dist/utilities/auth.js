"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomPassword = exports.generateResetToken = exports.generateOTP = exports.generateTokens = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
/**
 * Hashes a plaintext password using bcrypt
 * @param password The plaintext password
 * @returns The hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
/**
 * Compares a plaintext password against a hashed password
 * @param password The plaintext password
 * @param hash The stored hash
 * @returns boolean indicating if they match
 */
const comparePassword = async (password, hash) => {
    return bcrypt_1.default.compare(password, hash);
};
exports.comparePassword = comparePassword;
/**
 * Generates an Access Token and a Refresh Token
 * @param payload The data to embed in the token (usually { id, role })
 */
const generateTokens = (payload) => {
    const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: (process.env.JWT_EXPIRATION || '1h'),
    });
    return { accessToken };
};
exports.generateTokens = generateTokens;
/**
 * Generates a 6-digit numeric OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
/**
 * Generates a secure random 32-character string for password reset tokens
 */
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateResetToken = generateResetToken;
/**
 * Generates an 8-character random password for new Staff/Doctors
 */
const generateRandomPassword = () => {
    return crypto_1.default.randomBytes(4).toString('hex'); // 8 hex characters
};
exports.generateRandomPassword = generateRandomPassword;
//# sourceMappingURL=auth.js.map