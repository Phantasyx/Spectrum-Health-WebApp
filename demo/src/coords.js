const TAU = Math.PI * 2;

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Equirectangular UV to a direction.
 * u = 0..1 left to right, v = 0..1 top to bottom.
 * u = 0.5, v = 0.5 looks down +Z.
 */
export function directionFromUv(u, v) {
  const lon = (u - 0.5) * TAU;
  const lat = (0.5 - v) * Math.PI;
  const cosLat = Math.cos(lat);
  return [Math.sin(lon) * cosLat, Math.sin(lat), Math.cos(lon) * cosLat];
}

export function uvFromDirection(x, y, z) {
  const len = Math.hypot(x, y, z) || 1;
  const nx = x / len;
  const ny = y / len;
  const nz = z / len;
  const lon = Math.atan2(nx, nz);
  const lat = Math.asin(clamp(ny, -1, 1));
  return {
    u: lon / TAU + 0.5,
    v: 0.5 - lat / Math.PI,
  };
}

/**
 * Stored hitboxes match the original C# model: Top and Bottom are fractions
 * of the image height measured from the bottom. Left and Right are fractions
 * of width from the left edge of the equirectangular image.
 */
export function imageRectToHitbox(x0, y0, x1, y1, width, height) {
  const left = clamp(Math.min(x0, x1) / width, 0, 1);
  const right = clamp(Math.max(x0, x1) / width, 0, 1);
  const vTop = clamp(Math.min(y0, y1) / height, 0, 1);
  const vBottom = clamp(Math.max(y0, y1) / height, 0, 1);
  return {
    left,
    right,
    top: 1 - vTop,
    bottom: 1 - vBottom,
  };
}

export function hitboxCenterDirection(hitbox) {
  const u = (hitbox.left + hitbox.right) / 2;
  const fromBottom = (hitbox.top + hitbox.bottom) / 2;
  return directionFromUv(u, 1 - fromBottom);
}

export function hitboxFromPoint(point, halfU = 0.04, halfV = 0.06) {
  const { u, v } = uvFromDirection(point[0], point[1], point[2]);
  const vTop = clamp(v - halfV, 0, 1);
  const vBottom = clamp(v + halfV, 0, 1);
  return {
    left: clamp(u - halfU, 0, 1),
    right: clamp(u + halfU, 0, 1),
    top: 1 - vTop,
    bottom: 1 - vBottom,
  };
}

export function hitboxesOverlap(a, b) {
  const separated =
    a.right <= b.left ||
    b.right <= a.left ||
    a.top <= b.bottom ||
    b.top <= a.bottom;
  return !separated;
}

export function lookYawPitch([x, y, z]) {
  const len = Math.hypot(x, y, z) || 1;
  return {
    yaw: Math.atan2(x / len, z / len),
    pitch: Math.asin(clamp(y / len, -1, 1)),
  };
}

/**
 * Project a world direction into CSS pixels. Y grows downward.
 * Returns null when the point is behind the camera or outside the frame.
 */
export function projectDirection(dir, camera, viewport) {
  const [dx, dy, dz] = dir;
  const cosP = Math.cos(camera.pitch);
  const forward = [
    Math.sin(camera.yaw) * cosP,
    Math.sin(camera.pitch),
    Math.cos(camera.yaw) * cosP,
  ];
  let right = [-forward[2], 0, forward[0]];
  const rightLen = Math.hypot(right[0], right[1], right[2]) || 1;
  right = right.map((component) => component / rightLen);
  const up = [
    right[1] * forward[2] - right[2] * forward[1],
    right[2] * forward[0] - right[0] * forward[2],
    right[0] * forward[1] - right[1] * forward[0],
  ];
  const x = dx * right[0] + dy * right[1] + dz * right[2];
  const y = dx * up[0] + dy * up[1] + dz * up[2];
  const z = dx * forward[0] + dy * forward[1] + dz * forward[2];
  if (z <= 0.08) return null;

  const aspect = viewport.width / viewport.height;
  const scale = Math.tan(camera.fov / 2);
  const ndcX = x / z / scale / aspect;
  const ndcY = y / z / scale;
  if (ndcX < -1.05 || ndcX > 1.05 || ndcY < -1.05 || ndcY > 1.05) return null;

  return {
    x: (ndcX * 0.5 + 0.5) * viewport.width,
    y: (0.5 - ndcY * 0.5) * viewport.height,
  };
}
