import { isSampleImagePath } from './upload.js';

const KEY = 'first-look-additions-v1';

export function cleanText(value, max) {
  return String(value ?? '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, max);
}

function cleanHitbox(hitbox) {
  const num = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0;
  };
  const top = num(hitbox.top);
  const bottom = num(hitbox.bottom);
  const left = num(hitbox.left);
  const right = num(hitbox.right);
  return {
    id: cleanText(hitbox.id, 80),
    roomId: cleanText(hitbox.roomId, 80),
    top: Math.max(top, bottom),
    bottom: Math.min(top, bottom),
    left: Math.min(left, right),
    right: Math.max(left, right),
    text: cleanText(hitbox.text, 255),
    sub: cleanText(hitbox.sub, 1000),
  };
}

function cleanImage(value) {
  const image = String(value ?? '').trim();
  if (isSampleImagePath(image)) return image;
  if (!/^data:image\/jpeg;base64,[a-z0-9+/=\s]+$/i.test(image)) return '';
  if (image.length > 2_500_000) return '';
  return image;
}

export function sanitizeAdditions(input) {
  const source = input && typeof input === 'object' ? input : {};
  const buildings = Array.isArray(source.buildings) ? source.buildings : [];
  const rooms = Array.isArray(source.rooms) ? source.rooms : [];
  const hitboxes = Array.isArray(source.hitboxes) ? source.hitboxes : [];

  return {
    buildings: buildings.slice(0, 40).map((building) => ({
      id: cleanText(building.id, 80),
      name: cleanText(building.name, 255),
      sample: false,
    })).filter((building) => building.id && building.name),
    rooms: rooms.slice(0, 40).map((room) => ({
      id: cleanText(room.id, 80),
      buildingId: cleanText(room.buildingId, 80),
      name: cleanText(room.name, 255),
      summary: 'Added in this browser.',
      imageFile: cleanImage(room.imageFile),
      scene: '',
      sample: false,
    })).filter((room) => room.id && room.name && room.buildingId && room.imageFile),
    hitboxes: hitboxes.slice(0, 200).map(cleanHitbox).filter((hitbox) => hitbox.id && hitbox.roomId && hitbox.text),
  };
}

export function loadAdditions() {
  try {
    return sanitizeAdditions(JSON.parse(localStorage.getItem(KEY) || 'null'));
  } catch {
    return sanitizeAdditions(null);
  }
}

export function saveAdditions(additions) {
  const clean = sanitizeAdditions(additions);
  localStorage.setItem(KEY, JSON.stringify(clean));
  return clean;
}

export function emptyAdditions() {
  return { buildings: [], rooms: [], hitboxes: [] };
}

const SAMPLE_KEY = 'first-look-sample-edits-v1';

export function sanitizeSampleEdits(input) {
  const source = input && typeof input === 'object' ? input : {};
  const hitboxes = Array.isArray(source.hitboxes) ? source.hitboxes : [];
  return {
    hitboxes: hitboxes.slice(0, 80).map((hitbox) => {
      const clean = cleanHitbox(hitbox);
      return clean.id && clean.text ? clean : null;
    }).filter(Boolean),
  };
}

export function loadSampleEdits() {
  try {
    return sanitizeSampleEdits(JSON.parse(localStorage.getItem(SAMPLE_KEY) || 'null'));
  } catch {
    return sanitizeSampleEdits(null);
  }
}

export function saveSampleEdit(hitbox) {
  const current = loadSampleEdits();
  const clean = sanitizeSampleEdits({ hitboxes: [hitbox] }).hitboxes[0];
  if (!clean) return current;
  const rest = current.hitboxes.filter((item) => item.id !== clean.id);
  const next = { hitboxes: [...rest, clean] };
  localStorage.setItem(SAMPLE_KEY, JSON.stringify(next));
  return next;
}

export function resetSampleEdits() {
  localStorage.removeItem(SAMPLE_KEY);
  return sanitizeSampleEdits(null);
}

export function applySampleEdits(hitboxes, edits) {
  const byId = new Map((edits.hitboxes || []).map((hitbox) => [hitbox.id, hitbox]));
  return hitboxes.map((hitbox) => {
    const edit = byId.get(hitbox.id);
    if (!edit) return hitbox;
    return {
      ...hitbox,
      text: edit.text,
      sub: edit.sub,
      left: edit.left,
      right: edit.right,
      top: edit.top,
      bottom: edit.bottom,
    };
  });
}
