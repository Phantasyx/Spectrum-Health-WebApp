import assert from 'node:assert/strict';
import test from 'node:test';
import { assessUpload, isSampleImagePath, MAX_UPLOAD_BYTES } from '../src/upload.js';

function jpeg(complete = true) {
  const bytes = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
  if (complete) bytes.push(0xff, 0xd9);
  return new Uint8Array(bytes);
}

function png(complete = true) {
  const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d];
  if (complete) bytes.push(0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82);
  return new Uint8Array(bytes);
}

function webp() {
  const payload = new Uint8Array(20);
  payload.set([0x52, 0x49, 0x46, 0x46], 0);
  const size = payload.length - 8;
  payload[4] = size & 255;
  payload[5] = (size >> 8) & 255;
  payload.set([0x57, 0x45, 0x42, 0x50], 8);
  return payload;
}

test('complete jpeg, png, and webp files are accepted', () => {
  assert.equal(assessUpload({ type: 'image/jpeg', size: jpeg().length, bytes: jpeg() }).ok, true);
  assert.equal(assessUpload({ type: '', size: png().length, bytes: png() }).type, 'image/png');
  assert.equal(assessUpload({ type: 'image/webp', size: webp().length, bytes: webp() }).ok, true);
  assert.equal(assessUpload({ type: 'image/jpg', size: jpeg().length, bytes: jpeg() }).type, 'image/jpeg');
});

test('renamed documents, truncated files, and spoofed types are rejected', () => {
  const html = new TextEncoder().encode('<html><script>alert(1)</script></html>');
  const spoofed = assessUpload({ type: 'image/jpeg', size: html.length, bytes: html });
  assert.equal(spoofed.ok, false);
  assert.match(spoofed.error, /complete JPEG, PNG, or WebP/);

  const svg = assessUpload({
    type: 'image/svg+xml',
    size: 40,
    bytes: new TextEncoder().encode('<svg onload="alert(1)"></svg>'),
  });
  assert.equal(svg.ok, false);
  assert.match(svg.error, /JPEG, PNG, or WebP/);

  const truncated = assessUpload({ type: 'image/jpeg', size: 8, bytes: jpeg(false) });
  assert.equal(truncated.ok, false);

  const mismatch = assessUpload({ type: 'image/png', size: jpeg().length, bytes: jpeg() });
  assert.equal(mismatch.ok, false);
  assert.match(mismatch.error, /do not match/);

  const huge = assessUpload({ type: 'image/jpeg', size: MAX_UPLOAD_BYTES + 1, bytes: jpeg() });
  assert.match(huge.error, /8 MB/);

  const brokenWebp = webp();
  brokenWebp[4] = 1;
  assert.equal(assessUpload({ type: 'image/webp', size: brokenWebp.length, bytes: brokenWebp }).ok, false);
  assert.equal(assessUpload({ type: 'image/png', size: png(false).length, bytes: png(false) }).ok, false);
});

test('sample photographs stay on known photo paths', () => {
  assert.equal(isSampleImagePath('/photos/office.jpg'), true);
  assert.equal(isSampleImagePath('/photos/office-card.jpg'), true);
  assert.equal(isSampleImagePath('/photos/../secret.jpg'), false);
  assert.equal(isSampleImagePath('https://example.com/photos/office.jpg'), false);
  assert.equal(isSampleImagePath('/photos/office.jpg"/><img'), false);
});
