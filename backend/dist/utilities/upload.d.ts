import multer from 'multer';
export declare const uploadMiddleware: multer.Multer;
/**
 * Uploads a file buffer to Cloudflare R2 or ImageKit if configured, or falls back to local disk storage.
 * Priority: 1) Cloudflare R2 -> 2) ImageKit -> 3) Local Storage
 * @param buffer The file buffer from Multer
 * @param originalName The original file name
 * @param mimetype The file's MIME type
 * @returns The public URL of the uploaded file
 */
export declare const uploadToR2: (buffer: Buffer, originalName: string, mimetype: string) => Promise<string>;
//# sourceMappingURL=upload.d.ts.map