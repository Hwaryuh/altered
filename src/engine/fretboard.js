// Fretboard reverse analysis: chord analyzer + ranking, rootless shells, playability. Pure, no DOM.
import { analyze } from './chord-analyze.js';
import { hasMessage, translate as msg } from '../i18n/i18n.ts';
import { LETTER_PC, MIXED_T, SHARP_T, mod12 } from './transpose.js';

/** name and label are getters, so they follow the active locale */
function tuning(id, notes, midi) {
  return {
    id: id, midi: midi,
    get name() { return msg('tuning.' + id + '.name'); },
    get label() { return msg('tuning.label', { name: msg('tuning.' + id + '.name'), notes: notes }); }
  };
}
var TUNINGS = [
  tuning('std', 'E A D G B E', [40, 45, 50, 55, 59, 64]),
  tuning('half', 'Eb Ab Db Gb Bb Eb', [39, 44, 49, 54, 58, 63]),
  tuning('dropd', 'D A D G B E', [38, 45, 50, 55, 59, 64]),
  tuning('dadgad', 'D A D G A D', [38, 45, 50, 55, 57, 62]),
  tuning('openg', 'D G D G B D', [38, 43, 50, 55, 59, 62]),
  tuning('opend', 'D A D F# A D', [38, 45, 50, 54, 57, 62])
];
var INTERVAL_SEMI = { '1': 0, 'b9': 1, '9': 2, 'sus2': 2, '2': 2, '#9': 3, 'm3': 3, '3': 4, '4': 5, 'sus4': 5, '11': 5, 'b5': 6, '#11': 6, '5': 7, '#5': 8, 'b6': 8, 'b13': 8, 'mb6': 8, '6': 9, '13': 9, '7': 10, 'maj7': 11 };
var CORE_INTERVALS = ['1', '3', 'm3', '5', 'b5', '#5', '7', 'maj7', 'sus2', 'sus4', '6'];
// rootless shells: the 3rd, the 7th and the defining extension must all sound
var ROOTLESS_FORMS = [
  { sfx: '9', pcs: [4, 7, 10, 2], need: [4, 10, 2] }, { sfx: 'maj9', pcs: [4, 7, 11, 2], need: [4, 11, 2] },
  { sfx: 'm9', pcs: [3, 7, 10, 2], need: [3, 10, 2] }, { sfx: '13', pcs: [4, 10, 2, 9], need: [4, 10, 9] },
  { sfx: '7(b9)', pcs: [4, 7, 10, 1], need: [4, 10, 1] }, { sfx: '7(#9)', pcs: [4, 10, 3, 7], need: [4, 10, 3] }
];
// symbols the analyzer sometimes builds that no player writes
var MALFORMED = /,|sus\d{2,}|\)\(|^[A-G][#b]?\d{3,}/;
var PC_INTERVAL = ['1', 'b9', '9', 'm3', '3', '11', '#11', '5', 'b13', '13', '7', 'maj7'];

function spellSymbol(s) {
  return s.replace(/(^|\/)([A-G])#/g, function (m, p, l) { return p + MIXED_T[mod12(LETTER_PC[l] + 1)]; });
}
function noteName(pc) { return MIXED_T[mod12(pc)]; }

function shapeCode(frets) {
  return frets.map(function (f) { return f === null ? 'X' : String(f); }).join('-');
}

// frets: [low E .. high e], null = muted; relative to capo
function playability(frets) {
  var warns = [];
  var sounding = frets.map(function (f, i) { return f === null ? -1 : i; }).filter(function (i) { return i >= 0; });
  if (sounding.length) {
    var inner = 0;
    for (var i = sounding[0]; i <= sounding[sounding.length - 1]; i++) if (frets[i] === null) inner++;
    if (inner) warns.push({ cat: 'play', title: msg('play.innerMute.title'), detail: msg('play.innerMute.detail', { count: inner }) });
  }
  var fretted = frets.filter(function (f) { return f !== null && f > 0; });
  if (!fretted.length) return { warns: warns, fingers: 0, barre: null, span: 0 };
  var min = Math.min.apply(null, fretted), max = Math.max.apply(null, fretted);
  var span = max - min + 1;
  var onMin = [];
  frets.forEach(function (f, i) { if (f === min) onMin.push(i); });
  var barre = null;
  if (onMin.length >= 2) {
    var ok = true;
    for (var j = onMin[0]; j <= onMin[onMin.length - 1]; j++) if (frets[j] === null || frets[j] < min) ok = false;
    if (ok) barre = { fret: min, from: onMin[0], to: onMin[onMin.length - 1] };
  }
  var fingers = fretted.length - (barre ? onMin.length - 1 : 0);
  if (span > 4) warns.push({ cat: 'play', title: msg('play.wide.title'), detail: msg('play.wide.detail', { min: min, max: max, span: span }) });
  if (fingers > 4) warns.push({ cat: 'play', title: msg('play.fingers.title'), detail: msg('play.fingers.detail', { count: fingers }) });
  return { warns: warns, fingers: fingers, barre: barre, span: span };
}

function analyzeShape(frets, tuningMidi, capo) {
  var played = [];
  frets.forEach(function (f, i) { if (f !== null) played.push({ string: 6 - i, fret: f, midi: tuningMidi[i] + capo + f }); });
  played.forEach(function (p) { p.pc = mod12(p.midi); });
  var pcs = [];
  played.slice().sort(function (a, b) { return a.midi - b.midi; }).forEach(function (p) { if (pcs.indexOf(p.pc) < 0) pcs.push(p.pc); });
  var play = playability(frets);
  if (pcs.length < 2) return { played: played, pcs: pcs, candidates: [], play: play, tooFew: true };
  var bassPc = pcs[0];
  var results = analyze(pcs.map(function (pc) { return SHARP_T[pc]; }));
  var cands = results.map(function (r) {
    var rootPc = SHARP_T.indexOf(r.root);
    var slash = !!r.slash;
    var name = spellSymbol(slash ? r.slash : r.name);
    var warns = [], seen = {};
    r.warnings.concat(r.slashWarnings || []).forEach(function (w) { if (!seen[w.id]) { seen[w.id] = true; warns.push(w); } });
    if (/m?b6/.test(r.name) && !seen.b6 && !seen.mb6) warns.push({ id: 'mb6', cat: 'inversion', assumedRoot: 'b6' });
    var power = pcs.length === 2 && /5$/.test(r.name) && r.root === SHARP_T[bassPc];
    if (power) warns = warns.filter(function (w) { return w.id !== 'no3'; });
    // names built on b6 are almost always inversions of a simpler chord
    var inv = /b6/.test(r.name) ? 1 : 0;
    var odd = (r.name.replace(/m?b6/, '').match(/b9|b13|#11|#5|b5|add|sus[^/]*6|6sus|,/g) || []).length;
    var score = 100 - warns.length * 10 - inv * 14 - odd * 6 - Math.max(0, r.intervals.length - 3) * 2 - (slash ? 8 : 0) + (r.primary ? 4 : 0) + (power ? 30 : 0);
    if (MALFORMED.test(name)) score = -999;
    return { symbol: name, rootPc: rootPc, slash: slash, rootless: false, intervals: r.intervals, oo: warns, score: score };
  });
  // rootless voicings: the root is implied, not played
  if (pcs.length >= 3) {
    for (var root = 0; root < 12; root++) {
      if (pcs.indexOf(root) >= 0) continue;
      ROOTLESS_FORMS.forEach(function (form) {
        var rel = pcs.map(function (pc) { return mod12(pc - root); });
        var fits = rel.every(function (x) { return form.pcs.indexOf(x) >= 0; });
        var hasShell = form.need.every(function (x) { return rel.indexOf(x) >= 0; });
        if (fits && hasShell) cands.push({
          symbol: noteName(root) + form.sfx, rootPc: root, slash: false, rootless: true,
          intervals: rel.map(function (x) { return x === 2 ? '9' : x === 9 ? '13' : PC_INTERVAL[x]; }), oo: [],
          // a bare 3-7-extension shell is the textbook rootless voicing
          score: pcs.length === 3 ? 90 : 86
        });
      });
    }
  }
  var usable = cands.filter(function (c) { return c.score > -999; });
  if (usable.length) cands = usable;
  cands.sort(function (a, b) { return b.score - a.score; });
  cands = cands.slice(0, 6);
  var z = cands.map(function (c) { return Math.exp(c.score / 9); });
  var sum = z.reduce(function (a, b) { return a + b; }, 0);
  cands.forEach(function (c, i) { c.confidence = Math.round(z[i] / sum * 100); });
  // keep the top reading, drop near-zero noise
  cands = cands.filter(function (c, i) { return i === 0 || c.confidence >= 5; });
  return { played: played, pcs: pcs, bassPc: bassPc, candidates: cands, play: play, tooFew: false };
}

// details for one chosen candidate
function describeCandidate(an, c) {
  var labels = {};
  an.pcs.forEach(function (pc) {
    var semi = mod12(pc - c.rootPc);
    var hit = null;
    c.intervals.forEach(function (iv) { if (hit === null && INTERVAL_SEMI[iv] === semi) hit = iv; });
    labels[pc] = hit || PC_INTERVAL[semi];
  });
  var ivs = an.pcs.map(function (pc) { return labels[pc]; });
  var has = function (list) { return ivs.some(function (iv) { return list.indexOf(iv) >= 0; }); };
  var missing = [];
  if (c.rootless) missing.push(msg('fret.missing.root', { note: noteName(c.rootPc) }));
  if (!has(['3', 'm3', 'sus2', 'sus4']) && !/sus/.test(c.symbol)) missing.push(msg('fret.missing.third'));
  if (!has(['5', 'b5', '#5', 'b13', 'b6'])) missing.push(msg('fret.missing.fifth'));
  // tensions already named in the symbol are not "added"
  var named = function (iv) { return new RegExp('(^|[^b#\\d])' + iv.replace('#', '\\#') + '(?!\\d)').test(c.symbol.replace(/\/.*$/, '')); };
  var extra = ivs.filter(function (iv) { return CORE_INTERVALS.indexOf(iv) < 0 && !named(iv); });
  var warns = c.oo.map(function (w) {
    var known = hasMessage('fretWarn.' + w.id + '.title');
    var title = known ? msg('fretWarn.' + w.id + '.title') : w.id;
    var detail = known ? msg('fretWarn.' + w.id + '.detail') : '';
    if (w.assumedRoot && /^(b6|mb6|4|2|7)$/.test(w.assumedRoot)) {
      var alt = noteName(c.rootPc + INTERVAL_SEMI[w.assumedRoot === '2' ? '9' : w.assumedRoot]);
      detail = msg('fret.betterRoot', { note: alt });
    }
    return { cat: w.cat === 'inversion' || w.cat === 'fragment' ? 'shape' : 'music', title: title, detail: detail };
  });
  if (c.rootless) warns.unshift({ cat: 'music', title: msg('fret.rootless.title'), detail: msg('fret.rootless.detail', { note: noteName(c.rootPc) }) });
  if (c.slash) {
    var bassIv = labels[an.bassPc];
    if (['1', '3', 'm3', '5'].indexOf(bassIv) < 0) warns.push({ cat: 'music', title: msg('fret.oddInversion.title'), detail: msg('fret.oddInversion.detail', { iv: bassIv, note: noteName(an.bassPc) }) });
  }
  return { labels: labels, missing: missing, extra: extra, warns: warns.concat(an.play.warns) };
}

/** index 0 is the low E string, numbered 6 */
function stringName(i) { return msg('fret.string', { n: 6 - i }); }
var TUNE_MIN = 24, TUNE_MAX = 76;
function presetIdOf(midi) { var t = TUNINGS.filter(function (x) { return x.midi.join() === midi.join(); })[0]; return t ? t.id : 'custom'; }
function pitchName(midi) { return { note: noteName(midi), oct: String(Math.floor(midi / 12) - 1) }; }

export {
  TUNINGS, stringName, TUNE_MIN, TUNE_MAX,
  noteName, shapeCode, playability, analyzeShape, describeCandidate, presetIdOf, pitchName
};
