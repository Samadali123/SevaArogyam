"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToR2 = exports.uploadMiddleware = void 0;
const multer_1 = __importDefault(require("multer"));
const client_s3_1 = require("@aws-sdk/client-s3");
const imagekit_1 = __importDefault(require("imagekit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configure Multer to store files in memory as a buffer
const storage = multer_1.default.memoryStorage();
// Multer middleware setup (accepts images and standard docs, max 5MB)
exports.uploadMiddleware = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
    },
    fileFilter: (_req, file, cb) => {
        const allowedDocs = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];
        const allowedAudio = [
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/mp4',
            'audio/aac',
            'audio/webm',
            'audio/x-m4a'
        ];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.csv', '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm'];
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/') || allowedDocs.includes(file.mimetype) || allowedAudio.includes(file.mimetype) || allowedExts.includes(ext)) {
            cb(null, true);
        }
        else {
            const { AppError } = require('@errors/AppError');
            cb(new AppError(`File type not allowed (${file.mimetype}). Only images, audio, and standard documents are allowed.`, 400, 'VALIDATION_ERROR', true));
        }
    },
});
/**
 * Uploads a file buffer to Cloudflare R2 or ImageKit if configured, or falls back to local disk storage.
 * Priority: 1) Cloudflare R2 -> 2) ImageKit -> 3) Local Storage
 * @param buffer The file buffer from Multer
 * @param originalName The original file name
 * @param mimetype The file's MIME type
 * @returns The public URL of the uploaded file
 */
const uploadToR2 = async (buffer, originalName, mimetype) => {
    // Generate a unique filename
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `${uniquePrefix}-${originalName.replace(/\s+/g, '-')}`;
    const hasR2Config = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME;
    const hasImageKitConfig = process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT;
    if (hasR2Config) {
        const s3Client = new client_s3_1.S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
        });
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileName,
            Body: buffer,
            ContentType: mimetype,
        });
        await s3Client.send(command);
        // If a custom public URL is provided in .env (e.g., https://pub-xxx.r2.dev), use it.
        // Otherwise, fallback to the standard R2 dev url.
        const publicBaseUrl = process.env.R2_PUBLIC_URL || `https://${process.env.R2_BUCKET_NAME}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
        const cleanBaseUrl = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl;
        return `${cleanBaseUrl}/${fileName}`;
    }
    else if (hasImageKitConfig) {
        const imagekit = new imagekit_1.default({
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
        const response = await imagekit.upload({
            file: buffer,
            fileName: fileName,
        });
        return response.url;
    }
    else {
        // Local storage fallback for testing
        const uploadDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path_1.default.join(uploadDir, fileName);
        await fs_1.default.promises.writeFile(filePath, buffer);
        const port = process.env.PORT || 5000;
        return `http://localhost:${port}/uploads/${fileName}`;
    }
};
exports.uploadToR2 = uploadToR2;
//# sourceMappingURL=upload.js.map