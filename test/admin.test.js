import assert from 'node:assert/strict';
import test from 'node:test';
import { credentialsMatch, EXAMPLE_PASSWORD, EXAMPLE_USER } from '../src/auth.js';
import { applySampleEdits, sanitizeSampleEdits } from '../src/store.js';
import { sampleCatalog } from '../src/scenes.js';

test('the example account is the only sign-in that matches', () => {
  assert.equal(credentialsMatch(EXAMPLE_USER, EXAMPLE_PASSWORD), true);
  assert.equal(credentialsMatch('admin', 'wrong'), false);
  assert.equal(credentialsMatch('guest', EXAMPLE_PASSWORD), false);
});

test('sample point edits replace a label and drop empty titles', () => {
  const clean = sanitizeSampleEdits({
    hitboxes: [
      { id: 'or-table', roomId: 'sample-operating', text: '  Table\u0000  ', sub: 'Center', top: 0.5, bottom: 0.3, left: 0.4, right: 0.6 },
      { id: 'tx-bed', roomId: 'sample-treatment', text: '', sub: 'nope', top: 0.5, bottom: 0.2, left: 0.2, right: 0.4 },
    ],
  });
  assert.equal(clean.hitboxes.length, 1);
  assert.equal(clean.hitboxes[0].text, 'Table');
  const merged = applySampleEdits(sampleCatalog().hitboxes, clean);
  const table = merged.find((hitbox) => hitbox.id === 'or-table');
  assert.equal(table.text, 'Table');
  assert.equal(table.roomId, 'sample-operating');
  assert.equal(merged.find((hitbox) => hitbox.id === 'or-light').text, 'Surgical light');
});
