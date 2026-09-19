// Chord symbol → guitar voicings, and the least-movement path through a progression. Pure, no DOM.
import { LETTER_PC, mod12 } from './transpose.js';
import { playability, shapeCode } from './fretboard.js';

var STD = [40, 45, 50, 55, 59, 64];
// suffix → semitones above the root
var QUALITIES = {
  '': [0, 4, 7], m: [0, 3, 7], '5': [0, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7],
  '6': [0, 4, 7, 9], m6: [0, 3, 7, 9], '6/9': [0, 4, 7, 9, 2], 'm6/9': [0, 3, 7, 9, 2], add9: [0, 4, 7, 2], madd9: [0, 3, 7, 2],
  '7': [0, 4, 7, 10], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], m7b5: [0, 3, 6, 10], dim7: [0, 3, 6, 9], mmaj7: [0, 3, 7, 11],
  '7sus4': [0, 5, 7, 10], '7#5': [0, 4, 8, 10], '7b5': [0, 4, 6, 10],
  '9': [0, 4, 7, 10, 2], maj9: [0, 4, 7, 11, 2], m9: [0, 3, 7, 10, 2], '9sus4': [0, 5, 7, 10, 2],
  '7b9': [0, 4, 7, 10, 1], '7#9': [0, 4, 7, 10, 3], '7#11': [0, 4, 7, 10, 6], 'maj7#11': [0, 4, 7, 11, 6],
  '11': [0, 7, 10, 2, 5], m11: [0, 3, 7, 10, 2, 5], '13': [0, 4, 7, 10, 2, 9], m13: [0, 3, 7, 10, 2, 9], maj13: [0, 4, 7, 11, 2, 9],
  add11: [0, 4, 7, 5], madd11: [0, 3, 7, 5], sus2sus4: [0, 2, 5, 7], '7sus2': [0, 2, 7, 10], '7sus4b9': [0, 5, 7, 10, 1], '13sus4': [0, 5, 7, 10, 2, 9],
  dimmaj7: [0, 3, 6, 11], 'm7#5': [0, 3, 8, 10], 'maj7#5': [0, 4, 8, 11], mmaj9: [0, 3, 7, 11, 2], 'maj9#11': [0, 4, 7, 11, 2, 6],
  m7b9: [0, 3, 7, 10, 1], m9b5: [0, 3, 6, 10, 2], m11b5: [0, 3, 6, 10, 5], m7b13: [0, 3, 7, 10, 8],
  '9b5': [0, 4, 6, 10, 2], '9#5': [0, 4, 8, 10, 2], '9#11': [0, 4, 7, 10, 2, 6],
  '7b9b5': [0, 4, 6, 10, 1], '7b9#5': [0, 4, 8, 10, 1], '7#9b5': [0, 4, 6, 10, 3], '7#9#5': [0, 4, 8, 10, 3], '7b13': [0, 4, 7, 10, 8], '7b9b13': [0, 4, 7, 10, 1, 8],
  '13b9': [0, 4, 7, 10, 1, 9], '13#11': [0, 4, 7, 10, 2, 6, 9]
};
var ALIASES = {
  M: '', maj: '', min: 'm', '-': 'm', sus: 'sus4', '+': 'aug', add2: 'add9', '69': '6/9', m69: 'm6/9',
  M7: 'maj7', 'Δ': 'maj7', 'Δ7': 'maj7', ma7: 'maj7', M9: 'maj9', mM7: 'mmaj7', mmaj7: 'mmaj7', 'm-7b5': 'm7b5',
  'ø': 'm7b5', 'ø7': 'm7b5', o: 'dim', '°': 'dim', o7: 'dim7', '°7': 'dim7', aug7: '7#5', '+7': '7#5', '7sus': '7sus4', '9sus': '9sus4', '13sus': '13sus4', 'M7#5': 'maj7#5', 'maj7+5': 'maj7#5', '7alt': '7#9b5'
};
// string ranges for n sounding strings, low E = 0: n adjacent strings, and for 5 also all six with one muted inside
function stringSets(n) {
  var sets = [];
  for (var a = 0; a + n <= 6; a++) sets.push([a, a + n - 1]);
  if (n === 5) sets.push([0, 5]);
  return sets;
}
var MAX_FRET = 15;

function parseChord(symbol) {
  var m = /^([A-G])([#b]?)(.*?)(?:\/([A-G])([#b]?))?$/.exec(symbol.trim());
  if (!m) return null;
  var sfx = m[3].replace(/[()]/g, '').replace(/^Maj/, 'maj');
  sfx = sfx in ALIASES ? ALIASES[sfx] : sfx;
  if (!(sfx in QUALITIES)) return null;
  var acc = function (a) { return a === '#' ? 1 : a === 'b' ? -1 : 0; };
  var root = mod12(LETTER_PC[m[1]] + acc(m[2]));
  var bass = m[4] ? mod12(LETTER_PC[m[4]] + acc(m[5])) : null;
  return { root: root, bass: bass, quality: sfx, intervals: QUALITIES[sfx] };
}

/** the notes a voicing cannot drop: every note of a triad, else all but root and 5th (and the 9th under an 11th/13th) */
function requiredOf(iv) {
  if (iv.length <= 3) return iv.slice();
  var upper = iv.indexOf(9) >= 0 && (iv.indexOf(10) >= 0 || iv.indexOf(11) >= 0) || iv.indexOf(5) >= 0 && iv.indexOf(10) >= 0;
  return iv.filter(function (x) { return x !== 0 && x !== 7 && !(x === 2 && upper); });
}

function parseFrets(code) {
  var parts = code.indexOf('-') >= 0 ? code.split('-') : code.split('');
  return parts.map(function (c) { return c === 'x' || c === 'X' ? null : parseInt(c, 10); });
}

/** "C x32010" lines → [{ symbol, frets }]; '#' comments and unreadable lines are skipped */
function parseShapes(text, bonus) {
  return text.split('\n').map(function (l) { return l.trim().split(/\s+/); })
    .filter(function (p) { return p.length === 2 && p[0][0] !== '#' && parseChord(p[0]) && /^[x\d-]+$/.test(p[1]); })
    .map(function (p) { return { symbol: p[0], frets: parseFrets(p[1]), bonus: bonus === undefined ? 3 : bonus }; })
    .filter(function (s) { return s.frets.length === 6 && s.frets.every(function (f) { return f === null || f <= MAX_FRET; }); });
}

function sounding(frets) { return frets.filter(function (f) { return f !== null; }).length; }
function handPos(frets) {
  var fretted = frets.filter(function (f) { return f !== null && f > 0; });
  return fretted.length ? Math.min.apply(null, fretted) : 1;
}

// frets a voicing reaches past the preferred region [lo, hi]; open strings count as fret 0
function outside(frets, region) {
  if (!region) return 0;
  var out = 0;
  frets.forEach(function (f) {
    if (f === null || f === 0 && region[0] <= 1) return;
    out = Math.max(out, region[0] - f, f - region[1]);
  });
  return out;
}

/**
 * How much the hand has to twist: fretted notes on neighbouring strings far apart, and frets that zigzag
 * up and down across the strings. One finger per fret puts the fingers out of string order on such shapes
 * (xx7968: index on B, middle on D, ring on e, pinky on G).
 */
function twist(frets, play) {
  var seq = frets.filter(function (f) { return f !== null && f > 0; });
  var jumps = 0, turns = 0, dir = 0;
  for (var i = 1; i < frets.length; i++) {
    var a = frets[i - 1], b = frets[i];
    if (a > 0 && b > 0 && Math.abs(a - b) >= 3) jumps++;
  }
  for (var j = 1; j < seq.length; j++) {
    var d = Math.sign(seq[j] - seq[j - 1]);
    if (d && dir && d !== dir) turns++;
    if (d) dir = d;
  }
  // a barre anchors the hand, so only barre-free shapes are judged on their zigzag
  if (play.barre) turns = 0;
  return { hard: !play.barre && play.span >= 4 && (jumps > 0 || turns > 0), cost: jumps * 2 + turns };
}

// sounding strings outside the preferred string range [a, b], numbered as players do (1 = high e)
function offStrings(frets, strings) {
  if (!strings) return 0;
  return frets.filter(function (f, i) { return f !== null && (6 - i < strings[0] || 6 - i > strings[1]); }).length;
}

function rate(frets, known, rootless, o) {
  var play = playability(frets);
  var idx = frets.map(function (f, i) { return f === null ? -1 : i; }).filter(function (i) { return i >= 0; });
  var inner = 0;
  for (var i = idx[0]; i <= idx[idx.length - 1]; i++) if (frets[i] === null) inner++;
  // open strings under a hand far up the neck are a stretch of attention, not of fingers
  var pos = handPos(frets);
  var farOpen = pos > 3 ? frets.filter(function (f) { return f === 0; }).length : 0;
  var cost = play.fingers + twist(frets, play).cost + farOpen + (play.barre ? 1.5 : 0) + Math.max(0, play.span - 2) + inner * 1.5
    + (rootless ? 1.5 : 0) - (known || 0) + outside(frets, o.region) * 3 + offStrings(frets, o.strings) * 2;
  return { frets: frets, code: shapeCode(frets), cost: cost, pos: pos, known: !!known, fingers: play.fingers, barre: play.barre, out: outside(frets, o.region), off: offStrings(frets, o.strings) };
}

/**
 * Playable voicings of one chord, easiest first.
 * opts.notes: 3–6 sounding strings (5 and 6 keep the root in the bass); opts.known: parseShapes() output, preferred and transposed;
 * opts.region: [lo, hi] frets the hand should stay in (soft: voicings outside cost more); six strings that
 * cannot stay in it fall back to five-string voicings that can.
 * opts.strings: [a, b] strings to use, 1 = high e: voicings off them are dropped whenever any voicing fits.
 */
function voicings(symbol, opts) {
  var o = opts || {};
  var tuning = o.tuning || STD, notes = o.notes || 6, known = o.known || [];
  var ch = parseChord(symbol);
  if (!ch) return [];
  var tones = ch.intervals.map(function (x) { return mod12(ch.root + x); });
  if (ch.bass !== null && tones.indexOf(ch.bass) < 0) tones.push(ch.bass);
  var need = requiredOf(ch.intervals).map(function (x) { return mod12(ch.root + x); });
  if (notes >= 5) need.push(ch.root);
  var lowPc = ch.bass !== null ? ch.bass : notes >= 5 ? ch.root : null;
  var found = {};

  function accept(frets) {
    var pcs = [], low = null;
    frets.forEach(function (f, i) {
      if (f === null) return;
      var pc = mod12(tuning[i] + f);
      if (low === null) low = pc;
      if (pcs.indexOf(pc) < 0) pcs.push(pc);
    });
    if (notes === 3 && pcs.length !== 3) return;
    if (sounding(frets) !== notes) return;
    if (lowPc !== null && low !== lowPc) return;
    if (!need.every(function (pc) { return pcs.indexOf(pc) >= 0; })) return;
    var play = playability(frets);
    if (play.fingers > 4 || play.span > 4 || twist(frets, play).hard) return;
    // an open string under a hand parked past the 4th fret is a trick shape, not a voicing
    if (handPos(frets) > 4 && frets.indexOf(0) >= 0) return;
    var key = frets.join();
    if (!found[key]) found[key] = rate(frets, 0, pcs.indexOf(ch.root) < 0, o);
  }

  // ponytail: brute force over 4-fret windows (~12 × few sets × ≤5^6); fine for one chord at a time
  stringSets(notes).forEach(function (set) {
    for (var lo = 1; lo <= MAX_FRET - 3; lo++) {
      var frets = [null, null, null, null, null, null];
      (function walk(s) {
        if (s > set[1]) return accept(frets.slice());
        var outer = s === set[0] || s === set[1];
        var choices = outer || set[1] - set[0] + 1 === notes ? [] : [null];
        [0, lo, lo + 1, lo + 2, lo + 3].forEach(function (f) { if (tones.indexOf(mod12(tuning[s] + f)) >= 0) choices.push(f); });
        choices.forEach(function (f) { frets[s] = f; walk(s + 1); });
        frets[s] = null;
      })(set[0]);
    }
  });

  // the owner's shapes, moved to this root; open-string shapes only stay where they are
  var sig = ch.quality + '/' + (ch.bass === null ? '' : mod12(ch.bass - ch.root));
  known.forEach(function (k) {
    var kc = parseChord(k.symbol);
    if (!kc || kc.quality + '/' + (kc.bass === null ? '' : mod12(kc.bass - kc.root)) !== sig) return;
    var d = mod12(ch.root - kc.root);
    var open = k.frets.some(function (f) { return f === 0; });
    [d, d - 12].forEach(function (shift) {
      if (open && shift !== 0) return;
      var frets = k.frets.map(function (f) { return f === null ? null : f + shift; });
      if (frets.some(function (f) { return f !== null && (f < 0 || f > MAX_FRET); })) return;
      if (sounding(frets) !== notes) return;
      found[frets.join()] = rate(frets, k.bonus === undefined ? 3 : k.bonus, false, o);
    });
  });

  var list = Object.keys(found).map(function (key) { return found[key]; });
  // no six-string shape fits the region: a five-string one that does, one string short, beats leaving the region
  if (notes === 6 && o.region && !list.some(function (v) { return v.out === 0; })) {
    list = list.concat(voicings(symbol, Object.assign({}, o, { notes: 5 }))
      .filter(function (v) { return v.out === 0; })
      .map(function (v) { return Object.assign({}, v, { cost: v.cost + 1 }); }));
  }
  var on = list.filter(function (v) { return v.off === 0; });
  return (on.length ? on : list).sort(function (a, b) { return a.cost - b.cost || a.pos - b.pos; });
}

// hand shift weighs most; fingers that stay on the same string and fret are free
function moveCost(a, b) {
  var cost = Math.abs(a.pos - b.pos) * 1.5;
  b.frets.forEach(function (f, i) {
    if (f === null || f === 0) return;
    cost += a.frets[i] === f ? -0.5 : 0.5;
  });
  return cost;
}

/**
 * One voicing per chord minimising difficulty plus hand movement over the whole progression (Viterbi).
 * pins[i], a voicing code, fixes that step so the rest of the path is found around it.
 */
function voicePath(symbols, opts, pins) {
  var steps = symbols.map(function (s, i) {
    var all = voicings(s, opts);
    var pin = pins && pins[i];
    var fixed = pin ? all.filter(function (v) { return v.code === pin; }) : [];
    return { symbol: s, options: all.slice(0, 16), candidates: fixed.length ? fixed : all.slice(0, 16), choice: null };
  });
  var live = steps.filter(function (s) { return s.candidates.length; });
  if (!live.length) return steps;
  var best = live[0].candidates.map(function (v) { return { cost: v.cost, back: -1 }; });
  var trail = [best];
  for (var i = 1; i < live.length; i++) {
    var prev = live[i - 1].candidates;
    best = live[i].candidates.map(function (v) {
      var top = { cost: Infinity, back: -1 };
      prev.forEach(function (p, j) {
        var c = trail[i - 1][j].cost + moveCost(p, v) + v.cost;
        if (c < top.cost) top = { cost: c, back: j };
      });
      return top;
    });
    trail.push(best);
  }
  var k = 0;
  best.forEach(function (b, j) { if (b.cost < best[k].cost) k = j; });
  for (var n = live.length - 1; n >= 0; n--) {
    live[n].choice = live[n].candidates[k];
    k = trail[n][k].back;
  }
  steps.forEach(function (s) { delete s.candidates; });
  return steps;
}

var SPELL = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
/** the same chord d semitones up, its suffix kept ("Am7/G" +3 → "Cm7/Bb"); null when the symbol is unreadable */
function shiftChord(symbol, d) {
  var m = /^([A-G][#b]?)(.*?)(?:\/([A-G][#b]?))?$/.exec(symbol.trim());
  var ch = parseChord(symbol);
  if (!m || !ch) return null;
  return SPELL[mod12(ch.root + d)] + m[2] + (ch.bass === null ? '' : '/' + SPELL[mod12(ch.bass + d)]);
}

/**
 * Capo positions 0..max for a progression, easiest first: each chord is fingered d semitones lower and the path
 * scored by chord difficulty plus hand travel (unplayable chords cost 10). Every string count 4–6 is tried per capo.
 * Returns [{ capo, shapes, choices, score, open, barre }]; unreadable chords are left out.
 */
function capoRanks(symbols, opts, max) {
  var o = opts || {};
  var list = [];
  for (var capo = 0; capo <= (max === undefined ? 7 : max); capo++) {
    var shapes = symbols.map(function (s) { return capo ? shiftChord(s, -capo) : (parseChord(s) ? s : null); }).filter(Boolean);
    if (!shapes.length) continue;
    var best = null;
    [4, 5, 6].forEach(function (n) {
      var steps = voicePath(shapes, Object.assign({}, o, { notes: n, region: null, strings: null }));
      var score = 0, prev = null;
      steps.forEach(function (st) {
        var v = st.choice;
        if (!v) { score += 10; return; }
        score += v.cost + (prev ? Math.abs(v.pos - prev.pos) * 1.5 : 0);
        prev = v;
      });
      if (!best || score < best.score) best = { steps: steps, score: score };
    });
    var picked = best.steps.map(function (st) { return st.choice; });
    list.push({
      capo: capo, shapes: shapes, choices: picked, score: best.score,
      open: picked.filter(function (v) { return v && v.frets.indexOf(0) >= 0 && v.pos <= 3; }).length,
      barre: picked.filter(function (v) { return v && v.barre; }).length
    });
  }
  return list.sort(function (a, b) { return a.score - b.score || a.capo - b.capo; });
}

export { QUALITIES, parseChord, parseShapes, shiftChord, voicings, voicePath, capoRanks };
