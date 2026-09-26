export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_STORED_EDGE = 1920;
export const MAX_DATA_URL_LENGTH = 2_400_000;

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

function includesBytes(bytes, needle, from) {
  const start = Math.max(0, from);
  for (let i = start; i <= bytes.length - needle.length; i += 1) {
    let match = true;
    for (let j = 0; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

export function sniffImageType(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    const from = Math.max(0, data.length - 65536);
    return includesBytes(data, [0xff, 0xd9], from) ? 'image/jpeg' : '';
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (data.length >= 16 && png.every((byte, index) => data[index] === byte)) {
    return includesBytes(data, [0x49, 0x45, 0x4e, 0x44], data.length - 32) ? 'image/png' : '';
  }
  const riff = data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46;
  const webp = data[8] === 0x57 && data[9] === 0x45 && data[10] === 0x42 && data[11] === 0x50;
  if (data.length >= 12 && riff && webp) {
    const size = data[4] + (data[5] << 8) + (data[6] << 16) + (data[7] * 0x1000000);
    return size + 8 === data.length ? 'image/webp' : '';
  }
  return '';
}

function normalizeType(type) {
  const value = String(type || '').toLowerCase().split(';')[0].trim();
  if (value === 'image/jpg' || value === 'image/pjpeg') return 'image/jpeg';
  return value;
}

export function assessUpload({ type, size, bytes }) {
  const declared = normalizeType(type);
  if (!Number.isFinite(size) || size <= 0) {
    return { ok: false, error: 'Choose a JPEG, PNG, or WebP image.' };
  }
  if (size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: 'That file is larger than 8 MB. Choose a smaller image.' };
  }
  if (declared && !ALLOWED.has(declared)) {
    return { ok: false, error: 'Use a JPEG, PNG, or WebP image. Other file types are not accepted.' };
  }
  const sniffed = sniffImageType(bytes);
  if (!sniffed) {
    return { ok: false, error: 'That file is not a complete JPEG, PNG, or WebP image.' };
  }
  if (declared && declared !== sniffed) {
    return { ok: false, error: 'The file contents do not match its type.' };
  }
  return { ok: true, type: sniffed };
}

export function isSampleImagePath(value) {
  return /^\/photos\/[a-z0-9-]+\.jpg$/.test(String(value || ''));
}

export async function readUpload(file) {
  if (!file) return { ok: false, error: 'Choose a JPEG, PNG, or WebP image.' };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const assessed = assessUpload({ type: file.type, size: file.size, bytes });
  if (!assessed.ok) return assessed;

  let bitmap;
  try {
    bitmap = await createImageBitmap(new Blob([bytes], { type: assessed.type }));
  } catch {
    return { ok: false, error: 'The image could not be read. It may be truncated or damaged.' };
  }
  if (bitmap.width < 2 || bitmap.height < 2) {
    bitmap.close();
    return { ok: false, error: 'That image is too small to use.' };
  }

  const scale = Math.min(1, MAX_STORED_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(2, Math.round(bitmap.width * scale));
  canvas.height = Math.max(2, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  if (!dataUrl.startsWith('data:image/jpeg') || dataUrl.length > MAX_DATA_URL_LENGTH) {
    return { ok: false, error: 'That image is still too large to keep in this browser. Try a smaller file.' };
  }
  return {
    ok: true,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}
