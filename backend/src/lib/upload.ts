import path from "node:path";
import { promises as fs } from "node:fs";
import sharp from "sharp";

const STORAGE_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.HACKMITTEN_STORAGE_ROOT || path.join(process.cwd(), "storage"));
const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.HM3_PUBLIC_UPLOAD_DIR || path.join(STORAGE_ROOT, "public"));
const PRIVATE_UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.env.HM3_PRIVATE_UPLOAD_DIR || path.join(STORAGE_ROOT, "private"));
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const PARTICIPANT_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 8 * 1024 * 1024;
export const MAX_PARTICIPANT_IMAGE_SIZE = 5 * 1024 * 1024;

export class UploadError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export interface StoredFile {
  relativePath: string;
  absolutePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  isPrivate: boolean;
}

function safeName(prefix: string, mime: string): string {
  const ext = guessExtension(mime);
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9_-]/g, "-").slice(0, 40) || "upload";
  return `${safePrefix}_${random}.${ext}`;
}

function guessExtension(mime: string): string {
  switch (mime) {
    case "image/jpeg": return "jpg";
    case "image/png": return "png";
    case "image/webp": return "webp";
    case "image/gif": return "gif";
    default: return "bin";
  }
}

export function detectImageMime(head: Uint8Array): string | null {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return "image/png";
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46) return "image/gif";
  if (
    head[0] === 0x52 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x46 &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

function hasStrictImageBoundary(bytes: Uint8Array, mime: string): boolean {
  let end = bytes.length;
  // Ignore harmless trailing padding (null bytes or EOF whitespace) added by mobile cameras or sector boundaries
  while (end > 0 && (bytes[end - 1] === 0x00 || bytes[end - 1] === 0x0a || bytes[end - 1] === 0x0d || bytes[end - 1] === 0x20)) {
    end--;
  }

  if (mime === "image/jpeg") return end >= 2 && bytes[end - 2] === 0xff && bytes[end - 1] === 0xd9;
  if (mime === "image/png") {
    return end >= 12 &&
      bytes[end - 8] === 0x49 && bytes[end - 7] === 0x45 && bytes[end - 6] === 0x4e && bytes[end - 5] === 0x44;
  }
  if (mime === "image/gif") return end >= 1 && bytes[end - 1] === 0x3b;
  if (mime === "image/webp") {
    if (bytes.length < 12 || bytes[0] !== 0x52 || bytes[1] !== 0x49 || bytes[2] !== 0x46 || bytes[3] !== 0x46) {
      return false;
    }
    const riffPayload = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true);
    return riffPayload + 8 === bytes.length || riffPayload + 8 === end;
  }
  return false;
}

export async function validateImageFile(file: File, options: { maxSize?: number; allowedMime?: Set<string> } = {}): Promise<string> {
  const maxSize = options.maxSize ?? MAX_SIZE;
  const allowedMime = options.allowedMime ?? ALLOWED_MIME;
  if (!file || file.size === 0) throw new UploadError("The selected image is empty.");
  if (file.size > maxSize) throw new UploadError(`File too large (maximum ${maxSize} bytes)`);
  const detected = detectImageMime(new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!detected || !allowedMime.has(detected)) {
    throw new UploadError("File content is not a supported image.");
  }
  if (file.type !== detected) {
    throw new UploadError("File content does not match the declared image type.");
  }
  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    
    const metadata = await sharp(bytes, { failOn: "error", limitInputPixels: 12_000_000 }).metadata();
    if (!metadata.width || !metadata.height || metadata.format !== detected.slice("image/".length)) {
      throw new UploadError("The selected image is malformed or does not match its declared type.");
    }
    await sharp(bytes, { failOn: "error", limitInputPixels: 12_000_000 }).stats();
    if (!hasStrictImageBoundary(bytes, detected)) {
      throw new UploadError("The selected image has unexpected trailing data.");
    }
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError("The selected image is malformed or cannot be decoded.");
  }
  return detected;
}

export async function storeImage(opts: {
  file: File;
  prefix: string;
}): Promise<StoredFile> {
  const { file, prefix } = opts;
  return storeFileInternal(file, prefix, false);
}

export async function storePaymentScreenshot(opts: {
  file: File;
  paymentId: string;
}): Promise<StoredFile> {
  const { file, paymentId } = opts;
  return storeFileInternal(file, `pay_${paymentId}`, true);
}

export async function storeParticipantImage(file: File): Promise<StoredFile> {
  const mime = await validateImageFile(file, { maxSize: MAX_PARTICIPANT_IMAGE_SIZE, allowedMime: PARTICIPANT_IMAGE_MIME });
  return saveToLocal(file, safeName("participant", mime), true, mime);
}

async function storeFileInternal(
  file: File,
  prefix: string,
  isPrivate: boolean,
): Promise<StoredFile> {
  const effectiveMime = await validateImageFile(file);
  const fileName = safeName(prefix, effectiveMime);

  if (isPrivate) {
    return saveToLocal(file, fileName, true, effectiveMime);
  }

  return saveToLocal(file, fileName, false, effectiveMime);
}

function privateFileName(relativePath: string): string | null {
  if (!relativePath.startsWith("private://")) return null;
  const fileName = relativePath.slice("private://".length);
  return /^[a-z0-9_-]+_[a-f0-9]{12}\.(?:jpg|png|webp|gif)$/.test(fileName) ? fileName : null;
}

export async function deletePrivateFile(relativePath: string): Promise<void> {
  const fileName = privateFileName(relativePath);
  if (fileName) await fs.rm(path.join(/*turbopackIgnore: true*/ PRIVATE_UPLOAD_ROOT, fileName), { force: true });
}

export async function deletePublicFile(relativePath: string): Promise<void> {
  const match = relativePath.match(/^\/api\/uploads\/([a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif))$/);
  if (match) await fs.rm(path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, match[1]), { force: true });
}

export async function readPublicUpload(fileName: string): Promise<Buffer | null> {
  if (!/^[a-z0-9_-]{1,40}_[a-f0-9]{12}\.(?:jpg|png|webp|gif)$/.test(fileName)) return null;
  try {
    return await fs.readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, fileName));
  } catch {
    return null;
  }
}

async function saveToLocal(
  file: File,
  fileName: string,
  isPrivate: boolean,
  mimeType: string,
): Promise<StoredFile> {
  if (isPrivate) {
    try {
      await fs.mkdir(/*turbopackIgnore: true*/ PRIVATE_UPLOAD_ROOT, { recursive: true, mode: 0o700 });
      await fs.chmod(/*turbopackIgnore: true*/ PRIVATE_UPLOAD_ROOT, 0o700).catch(() => {});
    } catch (e) {
      console.error("[upload] Could not create or access private upload dir:", PRIVATE_UPLOAD_ROOT, e);
      throw new Error(`Storage configuration error: cannot access private upload directory at ${PRIVATE_UPLOAD_ROOT}`);
    }

    const abs = path.join(/*turbopackIgnore: true*/ PRIVATE_UPLOAD_ROOT, fileName);
    const buf = await file.arrayBuffer();

    await fs.writeFile(/*turbopackIgnore: true*/ abs, Buffer.from(buf), { flag: "wx", mode: 0o600 });

    return {
      relativePath: `private://${fileName}`,
      absolutePath: abs,
      fileName,
      mimeType,
      sizeBytes: file.size,
      isPrivate,
    };
  }

  await fs.mkdir(/*turbopackIgnore: true*/ UPLOAD_ROOT, { recursive: true, mode: 0o755 });
  await fs.chmod(/*turbopackIgnore: true*/ UPLOAD_ROOT, 0o755);

  const abs = path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, fileName);
  const buf = await file.arrayBuffer();

  await fs.writeFile(/*turbopackIgnore: true*/ abs, Buffer.from(buf), { flag: "wx", mode: 0o644 });

  return {
    relativePath: `/api/uploads/${fileName}`,
    absolutePath: abs,
    fileName,
    mimeType,
    sizeBytes: file.size,
    isPrivate,
  };
}

/**
 * Read a private image from persistent storage. The caller must authorize access.
 */
export async function readPrivateFile(relativePath: string): Promise<{
  data: Buffer;
  contentType: string;
} | null> {
  const fileName = privateFileName(relativePath);
  if (!fileName) return null;

  const candidateDirs = [
    PRIVATE_UPLOAD_ROOT,
    path.resolve(process.cwd(), "storage", "private"),
    path.resolve(process.cwd(), "backend", "storage", "private"),
    path.resolve("E:/hackmitten/Hackmitten-3.0_Final/backend/storage/private"),
    path.resolve("E:/hackmitten/Hackmitten-3.0_Final/storage/private"),
    path.resolve("E:/var/lib/hackmitten/private"),
    path.resolve(process.cwd(), "storage", "photos"),
    path.resolve("E:/hackmitten/Hackmitten-3.0_Final/backend/storage/photos"),
  ];

  for (const dir of candidateDirs) {
    try {
      const abs = path.join(dir, fileName);
      const data = await fs.readFile(abs);
      const ext = path.extname(fileName).toLowerCase();

      const contentType =
        ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" :
        ext === ".png" ? "image/png" :
        ext === ".webp" ? "image/webp" :
        ext === ".gif" ? "image/gif" :
        "application/octet-stream";

      return { data, contentType };
    } catch {
      // try next directory
    }
  }

  return null;
}
