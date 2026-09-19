// Catalog hygiene and key coverage: `npm run check`.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { koMessages } from './messages.ko.ts';
import { enMessages } from './messages.en.ts';
import { translate, translateFor } from './i18n.ts';

// keys name a meaning: no counters, no template pieces; messages are trimmed and self-contained
for (const [key, text] of Object.entries(koMessages)) {
  assert.match(key, /^[a-z]+(\.[\w/#-]+)+$/i, key);
  assert.doesNotMatch(key, /\.(text|label|str)\d+$/, key);
  assert.equal(text, text.trim(), `${key} has stray spaces`);
  assert.ok(text.length, `${key} is empty`);
  assert.doesNotMatch(text, /\{\d+\}|\{\}/, `${key} has an unnamed placeholder`);
}

// every locale has the keys of the Korean catalog and the same {placeholders}
const holes = (text) => [...new Set(text.match(/\{\w+\}/g) ?? [])].sort().join();
for (const [key, text] of Object.entries(koMessages)) {
  assert.ok(key in enMessages, `en is missing ${key}`);
  assert.equal(holes(enMessages[key]), holes(text), `placeholders differ in ${key}`);
  assert.equal(enMessages[key], enMessages[key].trim(), `en ${key} has stray spaces`);
}
assert.equal(Object.keys(enMessages).length, Object.keys(koMessages).length, 'en has extra keys');

// interpolation
assert.equal(translate('common.fret', { n: 5 }), '5프렛');
assert.equal(translateFor('en', 'common.fret', { n: 5 }), 'fret 5');
assert.equal(translateFor('ko', 'common.fret'), '{n}프렛', 'an unfilled placeholder stays visible');

// every literal key used in the sources exists; warn ids used through warn('kind', 'id') have all three parts
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = `${dir}/${f}`;
  return statSync(p).isDirectory() ? walk(p) : /\.(tsx?|jsx?)$/.test(p) && !/chord-analyze|\.d\.ts$/.test(p) ? [p] : [];
});
const missing = [];
for (const file of walk(new URL('..', import.meta.url).pathname)) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\b(?:t|msg|translate|hasMessage)\(\s*'([a-z]+\.[^']+)'/gi)) if (!(m[1] in koMessages) && !m[1].endsWith('.')) missing.push(`${file}: ${m[1]}`);
  for (const m of src.matchAll(/\bwarn\('(?:music|grammar)', '(\w+)'/g)) for (const part of ['title', 'detail', 'fix']) if (!(`warn.${m[1]}.${part}` in koMessages)) missing.push(`${file}: warn.${m[1]}.${part}`);
}
assert.deepEqual(missing, [], 'keys used but not in the catalog');
console.log('i18n ok');
