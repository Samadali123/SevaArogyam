"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
/**
 * Singleton instance of PrismaClient.
 * This prevents creating multiple instances of Prisma Client in development
 * due to hot reloading, which can quickly exhaust the database connection limit.
 */
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
//# sourceMappingURL=database.js.map