import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LOVE_CONFIG,
} from '../config/loveConfig';
import {
  INITIAL_PROPOSAL_STATE,
  computeRosePetalPlacement,
  deserializeLoveConfig,
  generateConstellationStars,
  interpolateLoveText,
  proposalReducer,
  resolveInitialStage,
  sanitizePersonalization,
  serializeLoveConfig,
} from './loveLogic';

test('interpolateLoveText replaces all personalization tokens cleanly', () => {
  const result = interpolateLoveText(
    'Hello [HER NAME], from [YOUR NAME] on [DATE]. Always, [HER NAME].',
    {
      herName: 'Elena',
      yourName: 'Julian',
      specialDate: 'October 14',
    },
  );
  assert.equal(result, 'Hello Elena, from Julian on October 14. Always, Elena.');
});

test('interpolateLoveText falls back to defaults when names are whitespace', () => {
  const result = interpolateLoveText('Dear [HER NAME]', {
    herName: '   ',
    yourName: '',
    specialDate: '',
  });
  assert.equal(result, 'Dear Sifat');
});

test('proposalReducer transitions respectfully between pending, paused, accepted, and replay', () => {
  let state = INITIAL_PROPOSAL_STATE;
  assert.equal(state.status, 'pending');
  assert.equal(state.boxOpen, false);

  state = proposalReducer(state, { type: 'OPEN_BOX' });
  assert.equal(state.boxOpen, true);

  state = proposalReducer(state, { type: 'NEED_MOMENT' });
  assert.equal(state.status, 'paused');

  state = proposalReducer(state, { type: 'RETURN_TO_PROPOSAL' });
  assert.equal(state.status, 'pending');

  state = proposalReducer(state, { type: 'ACCEPT_PROPOSAL' });
  assert.equal(state.status, 'accepted');
  assert.equal(state.boxOpen, true);
  assert.equal(state.celebrationCount, 1);

  state = proposalReducer(state, { type: 'REPLAY_PROPOSAL' });
  assert.equal(state.status, 'pending');
  assert.equal(state.boxOpen, false);
  assert.equal(state.celebrationCount, 1);
});

test('sanitizePersonalization preserves valid image data URLs and rejects invalid ones', () => {
  const updated = sanitizePersonalization({
    herName: '  Sofia  ',
    yourName: 'Marco',
    memories: [
      {
        ...DEFAULT_LOVE_CONFIG.memories[0],
        note: 'Coffee in the rain',
        photoDataUrl: 'data:image/png;base64,AAA',
      },
      {
        ...DEFAULT_LOVE_CONFIG.memories[1],
        photoDataUrl: 'javascript:alert(1)',
      },
    ],
  });

  assert.equal(updated.herName, 'Sofia');
  assert.equal(updated.yourName, 'Marco');
  assert.equal(updated.memories[0].note, 'Coffee in the rain');
  assert.equal(updated.memories[0].photoDataUrl, 'data:image/png;base64,AAA');
  assert.equal(updated.memories[1].photoDataUrl, null);
});

test('serializeLoveConfig and deserializeLoveConfig round-trip cleanly and handle malformed JSON', () => {
  const custom = sanitizePersonalization({ herName: 'Aria', yourName: 'Liam' });
  const json = serializeLoveConfig(custom);
  const restored = deserializeLoveConfig(json);
  assert.equal(restored.herName, 'Aria');
  assert.equal(restored.yourName, 'Liam');

  const malformed = deserializeLoveConfig('{bad-json');
  assert.equal(malformed.herName, DEFAULT_LOVE_CONFIG.herName);
});

test('resolveInitialStage honors autostart=1 query param', () => {
  assert.equal(resolveInitialStage('?autostart=1'), 'experience');
  assert.equal(resolveInitialStage(''), 'loading');
});

test('computeRosePetalPlacement increases radius and tilt monotonically across layers', () => {
  const inner = computeRosePetalPlacement(0, 24);
  const outer = computeRosePetalPlacement(23, 24);
  assert.ok(outer.radius > inner.radius);
  assert.ok(outer.tilt > inner.tilt);
  assert.ok(outer.scale > inner.scale);
});

test('generateConstellationStars produces deterministic star nodes with heart nodes', () => {
  const a = generateConstellationStars(60, 42);
  const b = generateConstellationStars(60, 42);
  assert.equal(a.length, 60);
  assert.deepEqual(a, b);
  assert.ok(a.some((star) => star.isHeartNode));
});
