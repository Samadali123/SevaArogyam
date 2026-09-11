/**
 * Hashes a plaintext password using bcrypt
 * @param password The plaintext password
 * @returns The hashed password
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compares a plaintext password against a hashed password
 * @param password The plaintext password
 * @param hash The stored hash
 * @returns boolean indicating if they match
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generates an Access Token and a Refresh Token
 * @param payload The data to embed in the token (usually { id, role })
 */
export declare const generateTokens: (payload: object) => {
    accessToken: string;
};
/**
 * Generates a 6-digit numeric OTP
 */
export declare const generateOTP: () => string;
/**
 * Generates a secure random 32-character string for password reset tokens
 */
export declare const generateResetToken: () => string;
/**
 * Generates an 8-character random password for new Staff/Doctors
 */
export declare const generateRandomPassword: () => string;
//# sourceMappingURL=auth.d.ts.map