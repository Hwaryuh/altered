// Smoke check for the ported engines: `npm run check`.
import assert from 'node:assert/strict';
import { transpose, parseKeyId, mod12 } from './transpose.js';
import { readFileSync } from 'node:fs';
import { TUNINGS, analyzeShape, describeCandidate, shapeCode } from './fretboard.js';
import { parseChord, parseShapes, shiftChord, capoRanks, voicings, voicePath } from './voicing.js';

const t = transpose('F  C/E  Dm7  Bbmaj7', { shift: -2, policy: 'context', origKey: null });
assert.equal(t.text, 'Eb Bb/D Cm7  Abmaj7');
assert.deepEqual(t.target, { tonic: 3, minor: false });
assert.equal(transpose('C7(b9', { shift: 0, policy: 'context', origKey: parseKeyId('0:M') }).warnings[0].kind, 'grammar');

const std = TUNINGS[0].midi;
const c = analyzeShape([null, 3, 2, 0, 1, 0], std, 0);
assert.equal(c.candidates[0].symbol, 'C');
assert.deepEqual(describeCandidate(c, c.candidates[0]).missing, []);
assert.equal(shapeCode([null, 3, 2, 0, 1, 0]), 'X-3-2-0-1-0');
assert.equal(shapeCode([null, 10, 12, 12, 12, 10]), 'X-10-12-12-12-10');
const f = analyzeShape([1, 3, 3, 2, 1, 1], std, 0);
assert.equal(f.candidates[0].symbol, 'F');
assert.deepEqual(f.play.barre, { fret: 1, from: 0, to: 5 });
assert.equal(analyzeShape([null, null, 2, 3, 3, null], std, 0).candidates[0].symbol, 'C9');
assert.equal(analyzeShape([null, 3, 2, 0, 1, 0], std, 3).candidates[0].symbol, 'Eb');

assert.deepEqual(parseChord('C6/9'), { root: 0, bass: null, quality: '6/9', intervals: [0, 4, 7, 9, 2] });
assert.equal(parseChord('Bb/D').bass, 2);
assert.equal(parseChord('Cmaj7(b13)'), null);
// every owner shape comes back for its own chord, in the mode its string count implies
/** compact single-digit shape (x57775) → shapeCode format */
const C = (s) => s.match(/x|\d/g).join('-').toUpperCase();
const known = parseShapes(readFileSync(new URL('./my-shapes.txt', import.meta.url), 'utf8'));
assert.ok(known.length > 50);
for (const k of known) {
  const n = k.frets.filter((x) => x !== null).length;
  const v = voicings(k.symbol, { notes: n, known });
  assert.ok(v.some((x) => x.known && x.frets.join() === k.frets.join()), `${k.symbol} ${shapeCode(k.frets)}`);
}
// closed shapes move: x35553 (C) → x57775 (D); open ones do not
assert.ok(voicings('D', { notes: 5, known }).some((x) => x.code === C('x57775') && x.known));
assert.ok(!voicings('D', { notes: 5, known }).some((x) => x.code === C('x43121') && x.known));
const fullC = voicings('C', { notes: 5 }).concat(voicings('C', { notes: 6 }));
assert.ok(fullC.every((x) => mod12(std[x.frets.findIndex((f) => f !== null)] + x.frets.find((f) => f !== null)) === 0), 'full voicings keep the root in the bass');
const path = voicePath(['C', 'Am7', 'Dm7', 'G7'], { notes: 4, known });
assert.ok(path.every((s) => s.choice));
// region keeps the hand in 5–9 when voicings exist there
const mid = voicePath(['F', 'G', 'E7', 'Am'], { notes: 4, known, region: [5, 9] });
assert.ok(mid.every((s) => s.choice.frets.every((f) => f === null || (f >= 5 && f <= 9))), mid.map((s) => s.choice.code).join(' '));
// a pinned voicing is kept and the path is rebuilt around it
const pinned = voicePath(['F', 'G', 'E7', 'Am'], { notes: 4, known, region: [5, 9] }, [null, null, C('xx6757'), null]);
assert.equal(pinned[2].choice.code, C('xx6757'));
// six strings that cannot stay in 5–9 fall back to a five-string shape that can
const six = voicePath(['F', 'E7', 'Dm7'], { notes: 6, region: [5, 9] });
assert.ok(six.every((s) => s.choice.out === 0), six.map((s) => s.choice.code).join(' '));
// string preference: 3 notes on strings 1–3 stay on the top three strings
const top = voicePath(['C', 'Am', 'F', 'G'], { notes: 3, strings: [1, 3] });
assert.ok(top.every((s) => s.choice.frets.slice(0, 3).every((f) => f === null)), top.map((s) => s.choice.code).join(' '));
// twisted four-fret shapes are not offered
for (const sym of ['Fmaj7', 'Dm9']) assert.ok(!voicings(sym, { notes: 4, region: [5, 9] }).some((v) => [C('xx7968'), C('x8796x'), C('x7796x'), C('x8976x')].includes(v.code)), sym);
assert.ok(voicings('F', { notes: 4, region: [5, 9] }).some((v) => v.code === C('xx7565')), 'common D-form F stays');
// bundled shapes all parse, and the qualities they use (plus the analyzer's extras) have voicings
const bundled = parseShapes(readFileSync(new URL('./bundled-shapes.txt', import.meta.url), 'utf8'), 1.5);
assert.ok(bundled.length > 600);
for (const sym of ['C7b13', 'G13#11', 'Am7#5', 'Cmaj7#5', 'D9sus4', 'Em7b9', 'C7#9b5']) assert.ok(voicings(sym, { notes: 4 }).length, sym);
assert.ok(voicings('C', { notes: 5, known: bundled }).some((v) => v.known));
// capo: Bb F Gm Eb sounds easiest as G D Em C with the capo on 3
assert.equal(shiftChord('Am7/G', 3), 'Cm7/Bb');
const capo = capoRanks(['Bb', 'F', 'Gm', 'Eb'], { known: [...bundled, ...known] });
assert.equal(capo[0].capo, 3);
assert.deepEqual(capo[0].shapes, ['G', 'D', 'Em', 'C']);
console.log('engine ok');
