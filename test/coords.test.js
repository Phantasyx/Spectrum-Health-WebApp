import assert from 'node:assert/strict';
import test from 'node:test';
import {
  directionFromUv,
  hitboxCenterDirection,
  hitboxesOverlap,
  imageRectToHitbox,
  lookYawPitch,
  projectDirection,
  panoramaPoint,
  uvFromDirection,
} from '../src/coords.js';
import { sampleCatalog } from '../src/scenes.js';
import { sanitizeAdditions } from '../src/store.js';

test('equirectangular UV round-trips through a direction', () => {
  const samples = [
    [0.5, 0.5],
    [0.25, 0.4],
    [0.75, 0.62],
    [0.15, 0.2],
  ];
  for (const [u, v] of samples) {
    const [x, y, z] = directionFromUv(u, v);
    const uv = uvFromDirection(x, y, z);
    assert.ok(Math.abs(uv.u - u) < 1e-6, `u ${uv.u} vs ${u}`);
    assert.ok(Math.abs(uv.v - v) < 1e-6, `v ${uv.v} vs ${v}`);
  }
});

test('the center of a 360 photo sits in front of the A-Frame camera', () => {
  const [x, y, z] = panoramaPoint(0.5, 0.5);
  assert.ok(Math.abs(x) < 1e-6);
  assert.ok(Math.abs(y) < 1e-6);
  assert.ok(Math.abs(z + 1) < 1e-6);
  const above = panoramaPoint(0.5, 0.38);
  assert.ok(above[1] > 0.2);
});

test('a direction in front of the camera projects to the center', () => {
  const dir = directionFromUv(0.33, 0.42);
  const camera = { ...lookYawPitch(dir), fov: 1.15 };
  const point = projectDirection(dir, camera, { width: 800, height: 500 });
  assert.ok(point);
  assert.ok(Math.abs(point.x - 400) < 0.75);
  assert.ok(Math.abs(point.y - 250) < 0.75);
});

test('image rectangles store top and bottom from the bottom edge', () => {
  const hitbox = imageRectToHitbox(0, 0, 100, 20, 200, 100);
  assert.equal(hitbox.left, 0);
  assert.equal(hitbox.right, 0.5);
  assert.equal(hitbox.top, 1);
  assert.equal(hitbox.bottom, 0.8);
  const [x, y, z] = hitboxCenterDirection(hitbox);
  const uv = uvFromDirection(x, y, z);
  assert.ok(uv.v < 0.15);
});

test('overlapping hitboxes are detected and separated ones are not', () => {
  const a = { left: 0.1, right: 0.4, bottom: 0.2, top: 0.5 };
  const b = { left: 0.3, right: 0.6, bottom: 0.4, top: 0.7 };
  const c = { left: 0.5, right: 0.8, bottom: 0.2, top: 0.5 };
  assert.equal(hitboxesOverlap(a, b), true);
  assert.equal(hitboxesOverlap(a, c), false);
});

test('sample rooms use the photographs and valid hitboxes', () => {
  const catalog = sampleCatalog();
  assert.equal(catalog.rooms.length, 6);
  assert.equal(catalog.hitboxes.length, 24);
  assert.deepEqual(catalog.buildings.map((building) => building.name), ['Care rooms', 'More places to try']);
  for (const room of catalog.rooms) {
    assert.match(room.imageFile, /^\/photos\/[a-z0-9-]+\.jpg$/);
    assert.match(room.poster, /^\/photos\/[a-z0-9-]+\.jpg$/);
    assert.equal(room.scene, '');
    assert.ok(room.credit);
  }
  for (const hotspot of catalog.hitboxes) {
    assert.ok(hotspot.left >= 0 && hotspot.right <= 1);
    assert.ok(hotspot.bottom >= 0 && hotspot.top <= 1);
    assert.ok(hotspot.top > hotspot.bottom);
    assert.ok(hotspot.right - hotspot.left > 0.02);
    const [x, y, z] = hitboxCenterDirection(hotspot);
    const uv = uvFromDirection(x, y, z);
    assert.ok(uv.u > 0 && uv.u < 1);
    assert.ok(uv.v > 0 && uv.v < 1);
  }
});

test('local additions drop markup, oversized text, and non-image payloads', () => {
  const clean = sanitizeAdditions({
    buildings: [{ id: 'b1', name: '  North wing\u0000  ' }],
    rooms: [
      {
        id: 'r1',
        buildingId: 'b1',
        name: 'Room',
        imageFile: 'javascript:alert(1)',
      },
      {
        id: 'r2',
        buildingId: 'b1',
        name: 'Kept',
        imageFile: 'data:image/jpeg;base64,aaaa',
      },
      {
        id: 'r3',
        buildingId: 'b1',
        name: 'Sample copy',
        imageFile: '/photos/office.jpg',
      },
      {
        id: 'r4',
        buildingId: 'b1',
        name: 'Traversal',
        imageFile: '/photos/../secret.jpg',
      },
      {
        id: 'r5',
        buildingId: 'b1',
        name: 'Png data',
        imageFile: 'data:image/png;base64,aaaa',
      },
    ],
    hitboxes: [{ id: 'h1', roomId: 'r2', text: 'x'.repeat(400), sub: '<b>note</b>', top: 2, bottom: -1, left: 0.2, right: 0.1 }],
  });
  assert.equal(clean.buildings[0].name, 'North wing');
  assert.deepEqual(clean.rooms.map((room) => room.id), ['r2', 'r3']);
  assert.equal(clean.rooms[1].imageFile, '/photos/office.jpg');
  assert.equal(clean.hitboxes[0].text.length, 255);
  assert.equal(clean.hitboxes[0].sub, '<b>note</b>');
  assert.equal(clean.hitboxes[0].top, 1);
  assert.equal(clean.hitboxes[0].bottom, 0);
  assert.equal(clean.hitboxes[0].left, 0.1);
  assert.equal(clean.hitboxes[0].right, 0.2);
});
