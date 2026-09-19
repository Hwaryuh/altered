// Altered transpose engine: pure functions, no DOM.
// Ported as-is from the design canvas (design/Main.dc.html); types live in transpose.d.ts.
import { translate as msg } from '../i18n/i18n.ts';

/** a warning whose title, detail and fix are catalog messages warn.<id>.* */
function warn(kind, id, values, extra) {
  return Object.assign({ kind: kind, title: msg('warn.' + id + '.title', values), detail: msg('warn.' + id + '.detail', values), fix: msg('warn.' + id + '.fix', values) }, extra);
}

var LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
var SHARP_T = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
var FLAT_T = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
var MIXED_T = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
var MAJOR_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
var MINOR_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
var ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function mod12(n) { return ((n % 12) + 12) % 12; }

// HTML entities -> plain characters. Returns { text, count }.
function decodeEntities(s) {
  var count = 0;
  var text = s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, function (m, e) {
    var ch;
    if (e[0] === '#') {
      var n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      ch = n === 0xa0 ? ' ' : String.fromCodePoint(n);
    } else {
      ch = ENTITIES[e.toLowerCase()];
    }
    if (ch === undefined) return m;
    count++;
    return ch;
  }).replace(/ /g, function () { count++; return ' '; });
  return { text: text, count: count };
}

function keyName(k) { return (k.minor ? MINOR_NAMES : MAJOR_NAMES)[k.tonic] + (k.minor ? ' minor' : ' major'); }
function keyUsesFlats(k) { return k.minor ? [0, 2, 3, 5, 7, 10].indexOf(k.tonic) >= 0 : [1, 3, 5, 8, 10].indexOf(k.tonic) >= 0; }
function keyUsesSharps(k) { return k.minor ? [1, 4, 6, 8, 11].indexOf(k.tonic) >= 0 : [2, 4, 6, 7, 9, 11].indexOf(k.tonic) >= 0; }
function keyTable(k) { return keyUsesFlats(k) ? FLAT_T : keyUsesSharps(k) ? SHARP_T : MIXED_T; }
// spell one pitch class inside a key: diatonic notes follow the signature,
// borrowed notes (b2 b3 b6 b7 in major; b2 b5 in minor) take flats, raised ones take sharps
var MAJOR_DIATONIC = [0, 2, 4, 5, 7, 9, 11], MINOR_DIATONIC = [0, 2, 3, 5, 7, 8, 10];
function spellInKey(pc, k) {
  var d = mod12(pc - k.tonic);
  if ((k.minor ? MINOR_DIATONIC : MAJOR_DIATONIC).indexOf(d) >= 0) return keyTable(k)[pc];
  var flat = k.minor ? [1, 6] : [1, 3, 8, 10];
  return (flat.indexOf(d) >= 0 ? FLAT_T : SHARP_T)[pc];
}

// Note: letter + accidentals. Returns null when not a note.
function parseNote(s) {
  var m = /^([A-G])([#♯b♭]*)$/.exec(s);
  if (!m) return null;
  var acc = 0, sharp = false, flat = false;
  for (var i = 0; i < m[2].length; i++) {
    if (m[2][i] === '#' || m[2][i] === '♯') { acc++; sharp = true; } else { acc--; flat = true; }
  }
  if (sharp && flat) return null;
  return { letter: m[1], acc: acc, pc: mod12(LETTER_PC[m[1]] + acc), raw: s };
}

var QUALITY_RE = /^(maj|Maj|MAJ|mMaj|mmaj|mM|m△|min|mi|m|-|M|△|Δ|dim|°|o|ø|aug|\+)/;
var MOD_RE = /^(sus2|sus4|sus|add2|add4|add9|add11|add13|no3|no5|omit3|omit5|alt|maj7|maj9|maj13|[b#♭♯](?:5|9|11|13)|6\/9|69|13|11|9|7|6|5|4|2)/;

// Parse a suffix. Returns { ok, info, warns } — warns: [{kind,title,detail,fix}]
function parseSuffix(sfx) {
  var info = { quality: 'major', ext: 0, maj7: false, alts: [], adds: [], omits: [], sus: null, power: false };
  var warns = [];
  var pos = 0, rest = sfx, depth = 0;
  var qm = QUALITY_RE.exec(rest);
  if (qm) {
    var q = qm[1];
    if (/^(mMaj|mmaj|mM|m△)$/.test(q)) { info.quality = 'minor'; info.maj7 = true; }
    else if (/^(min|mi|m|-)$/.test(q)) info.quality = 'minor';
    else if (/^(maj|Maj|MAJ|M|△|Δ)$/.test(q)) info.maj7 = true;
    else if (/^(dim|°|o)$/.test(q)) info.quality = 'dim';
    else if (q === 'ø') { info.quality = 'dim'; info.ext = 7; info.halfDim = true; }
    else info.quality = 'aug';
    rest = rest.slice(q.length);
  }
  var seen = {};
  var first = true;
  while (rest.length) {
    var c = rest[0];
    if (c === '(') { depth++; rest = rest.slice(1); continue; }
    if (c === ')') { depth--; rest = rest.slice(1); if (depth < 0) return { ok: false }; continue; }
    if (c === ',' || c === ' ' || c === '/') { if (!depth && c !== '/') return { ok: false }; rest = rest.slice(1); continue; }
    var m = MOD_RE.exec(rest);
    if (!m) return { ok: false };
    var t = m[1];
    rest = rest.slice(t.length);
    if (seen[t]) warns.push(warn('music', 'dupTension', { tension: t }));
    seen[t] = true;
    if (/^\d+$/.test(t) || t === '6/9' || t === '69') {
      var n = t === '6/9' || t === '69' ? 69 : +t;
      if (n === 5 && first && info.quality === 'major' && !info.maj7) { info.power = true; }
      else if (n === 2 || n === 4) { info.sus = n; }
      else if (!depth && (first || !info.ext)) { info.ext = n; }
      else if (n === 9 || n === 11 || n === 13) { info.adds.push(n); }
      else return { ok: false };
    } else if (/^maj(7|9|13)$/.test(t)) { info.maj7 = true; info.ext = +t.slice(3); }
    else if (/^sus/.test(t)) {
      if (info.sus) warns.push(warn('grammar', 'dupSus'));
      info.sus = t === 'sus2' ? 2 : 4;
    }
    else if (/^add/.test(t)) info.adds.push(+t.slice(3));
    else if (/^(no|omit)/.test(t)) info.omits.push(+t.slice(-1));
    else if (t === 'alt') info.alts.push('alt');
    else info.alts.push(t.replace('♭', 'b').replace('♯', '#'));
    first = false;
  }
  if (depth > 0) warns.push(warn('grammar', 'openParen', null, { closeParens: depth }));
  if (info.maj7 && !info.ext) { if (info.quality === 'minor' || /[△Δ]/.test(sfx)) info.ext = 7; else info.maj7 = false; }
  if (info.sus && info.quality === 'minor') warns.push(warn('grammar', 'minorSus'));
  if (info.omits.indexOf(3) >= 0 && info.quality === 'minor') warns.push(warn('grammar', 'minorNo3'));
  var has = function (a) { return info.alts.indexOf(a) >= 0; };
  if (has('b9') && (info.ext >= 9 || info.adds.indexOf(9) >= 0)) warns.push(warn('music', 'clash9'));
  if (has('#11') && (info.ext >= 11 || info.adds.indexOf(11) >= 0)) warns.push(warn('music', 'clash11'));
  if (info.omits.indexOf(3) >= 0) warns.push(warn('music', 'omit3', null, { level: 'info' }));
  return { ok: true, info: info, warns: warns };
}

function chordPcs(info) {
  var set;
  if (info.power) set = [0, 7];
  else if (info.quality === 'minor') set = [0, 3, 7];
  else if (info.quality === 'dim') set = [0, 3, 6];
  else if (info.quality === 'aug') set = [0, 4, 8];
  else set = [0, 4, 7];
  if (info.sus) set = set.map(function (p) { return p === 3 || p === 4 ? (info.sus === 2 ? 2 : 5) : p; });
  var e = info.ext;
  if (e === 6 || e === 69) set.push(9);
  if (e === 69) set.push(2);
  if (e >= 7 && e !== 69) set.push(info.maj7 ? 11 : info.quality === 'dim' && !info.halfDim ? 9 : 10);
  if (e >= 9 && e !== 69) set.push(2);
  if (e >= 11 && e !== 69) set.push(5);
  if (e === 13) set.push(9);
  info.adds.forEach(function (a) { set.push({ 2: 2, 4: 5, 9: 2, 11: 5, 13: 9 }[a]); });
  var altMap = { b5: [7, 6], '#5': [7, 8], b9: [null, 1], '#9': [null, 3], '#11': [null, 6], b13: [null, 8] };
  info.alts.forEach(function (a) {
    var r = altMap[a]; if (!r) return;
    if (r[0] !== null) set = set.filter(function (p) { return p !== r[0]; });
    set.push(r[1]);
  });
  info.omits.forEach(function (o) { set = set.filter(function (p) { return o === 3 ? p !== 3 && p !== 4 : p !== 7; }); });
  return set.map(mod12);
}

// Full chord. Returns { chord } | { unknown: warn } | null (not chord-like at all)
function parseChord(word) {
  var m = /^([A-H])([#♯b♭]*)(.*)$/.exec(word);
  if (!m) return null;
  var chordish = !/[a-z]{4,}/.test(m[3].replace(/sus|add|omit|maj|min|dim|aug|alt/g, '')) && word.length <= 16;
  if (m[1] === 'H') {
    return chordish ? { unknown: warn('grammar', 'germanH', null, { fixTo: 'B' + word.slice(1).replace(/\/H$/, '/B') }) } : null;
  }
  var root = parseNote(m[1] + m[2]);
  if (!root) return chordish ? { unknown: warn('grammar', 'mixedAcc') } : null;
  var body = m[3], bassRaw = null;
  var slash = body.lastIndexOf('/');
  if (slash >= 0 && !(body.slice(slash + 1) === '9' && body[slash - 1] === '6')) {
    bassRaw = body.slice(slash + 1);
    body = body.slice(0, slash);
  }
  var sp = parseSuffix(body);
  if (!sp.ok) return chordish ? { unknown: warn('grammar', 'unreadable', { body: body }) } : null;
  var bass = null, warns = sp.warns.slice();
  if (bassRaw !== null) {
    bass = parseNote(bassRaw);
    if (!bass) return { unknown: Object.assign(warn('grammar', 'badBass', { bass: bassRaw }), bassRaw === 'H' ? { fix: msg('warn.badBass.fixH'), fixTo: m[1] + m[2] + body + '/B' } : {}) };
  }
  [[root, 'root'], [bass, 'bass']].forEach(function (pair) {
    var n = pair[0];
    if (!n) return;
    if (Math.abs(n.acc) > 1) warns.push(warn('grammar', 'doubleAcc', { raw: n.raw, to: MIXED_T[n.pc] }, { note: pair[1] }));
    else if (/^(E#|B#|Cb|Fb)/.test(n.raw.replace('♯', '#').replace('♭', 'b'))) warns.push(warn('music', 'oddNote', { raw: n.raw, to: MIXED_T[n.pc] }, { level: 'info', note: pair[1] }));
  });
  var rebuild = function (r, b) { return r + body + (bass ? '/' + b : ''); };
  warns.forEach(function (w) { if (w.closeParens) w.fixTo = m[1] + m[2] + body + ')'.repeat(w.closeParens) + (bass ? '/' + bass.raw : ''); });
  warns.forEach(function (w) {
    if (!w.note) return;
    w.fixTo = w.note === 'root' ? rebuild(MIXED_T[root.pc], bass && bass.raw) : rebuild(root.raw, MIXED_T[bass.pc]);
  });
  if (bass) {
    var pcs = chordPcs(sp.info);
    if (pcs.indexOf(mod12(bass.pc - root.pc)) < 0) warns.push(warn('music', 'outsideBass', { bass: bass.raw, chord: root.raw + body }, { level: 'info' }));
  }
  return { chord: { root: root, bass: bass, suffix: body, raw: word, info: sp.info }, warns: warns };
}

// Split one word into chord / separator / text pieces
function analyzeWord(word) {
  var p = parseChord(word);
  if (p && p.chord) return [{ type: 'chord', raw: word, parsed: p }];
  if (/^[-–—\/|:()%.x×\d*]+$/.test(word) || /^(N\.?C\.?|x\d+|\(x\d+\))$/i.test(word)) return [{ type: 'sep', raw: word }];
  if (!p || p.unknown) {
    var parts = word.split(/([-–—\/()])/).filter(function (s) { return s !== ''; });
    if (parts.length > 1) {
      var out = [], ok = true;
      for (var i = 0; i < parts.length; i++) {
        if (/^[-–—\/()]$/.test(parts[i])) { out.push({ type: 'sep', raw: parts[i] }); continue; }
        var q = parseChord(parts[i]);
        if (q && q.chord) out.push({ type: 'chord', raw: parts[i], parsed: q });
        else { ok = false; break; }
      }
      if (ok) return out;
    }
  }
  if (p && p.unknown) return [{ type: 'unknown', raw: word, warn: p.unknown }];
  return [{ type: 'text', raw: word }];
}

function tokenizeLine(line) {
  var toks = [];
  if (/\[[^\]\n]*\]/.test(line) && !/^\s*\[[^\]]*\]\s*$/.test(line) || /^\s*\[[A-G][^\]\s]{0,12}\]\s*$/.test(line) && parseChord(line.trim().slice(1, -1))) {
    // ChordPro: only bracket contents are chords
    var re = /\[([^\]\n]*)\]/g, last = 0, m;
    while ((m = re.exec(line))) {
      if (m.index > last) toks.push({ type: 'text', raw: line.slice(last, m.index) });
      toks.push({ type: 'sep', raw: '[' });
      var inner = m[1] ? analyzeWord(m[1]) : [];
      inner.forEach(function (t) { if (t.type === 'text' && inner.length === 1) t.type = 'text'; toks.push(t); });
      toks.push({ type: 'sep', raw: ']' });
      last = m.index + m[0].length;
    }
    if (last < line.length) toks.push({ type: 'text', raw: line.slice(last) });
    return { kind: 'chordpro', toks: toks };
  }
  var parts = line.split(/(\s+|[|,])/).filter(function (s) { return s !== ''; });
  var chords = 0, words = 0;
  parts.forEach(function (s) {
    if (/^\s+$/.test(s)) { toks.push({ type: 'space', raw: s }); return; }
    if (s === '|' || s === ',') { toks.push({ type: 'sep', raw: s }); return; }
    analyzeWord(s).forEach(function (t) {
      toks.push(t);
      if (t.type === 'chord' || t.type === 'unknown') chords++;
      else if (t.type === 'text') words++;
    });
  });
  var isChordLine = chords > 0 && chords >= words && !/[가-힣]/.test(line) && !/^\s*[{#]/.test(line);
  if (!isChordLine) return { kind: 'text', toks: [{ type: 'text', raw: line }] };
  return { kind: 'chords', toks: toks };
}

var TRIADS_MAJOR = [[0, 'major'], [2, 'minor'], [4, 'minor'], [5, 'major'], [7, 'major'], [9, 'minor'], [11, 'dim']];
var TRIADS_MINOR = [[0, 'minor'], [2, 'dim'], [3, 'major'], [5, 'minor'], [7, 'minor'], [7, 'major'], [8, 'major'], [10, 'major'], [11, 'dim']];

function estimateKey(chords) {
  if (!chords.length) return null;
  var scores = [];
  for (var mi = 0; mi < 2; mi++) for (var t = 0; t < 12; t++) {
    var table = mi ? TRIADS_MINOR : TRIADS_MAJOR, s = 0;
    chords.forEach(function (c, i) {
      var deg = mod12(c.pc - t), q = c.quality === 'aug' ? 'major' : c.quality;
      var rootIn = table.some(function (d) { return d[0] === deg; });
      var exact = table.some(function (d) { return d[0] === deg && d[1] === q; });
      s += exact ? 2 : rootIn ? 0.5 : 0;
      var home = deg === 0 && q === (mi ? 'minor' : 'major');
      if (home && i === 0) s += 1.5;
      if (home && i === chords.length - 1) s += 2.5;
      // dominant resolving home (V → i/I) is the strongest key signal
      var next = chords[i + 1];
      if (deg === 7 && q === 'major' && next && mod12(next.pc - t) === 0) s += 2;
    });
    scores.push({ tonic: t, minor: !!mi, score: s });
  }
  scores.sort(function (a, b) { return b.score - a.score; });
  var best = scores[0], second = scores[1];
  var conf = best.score ? Math.round(Math.min(0.97, 0.5 + (best.score - second.score) / best.score) * 100) : 0;
  return { tonic: best.tonic, minor: best.minor, confidence: conf };
}

function nearestShift(from, to) { var d = mod12(to - from); return d > 6 ? d - 12 : d; }

// opts: { shift, policy: sharp|flat|context|preserve, origKey: {tonic,minor}|null }
function transpose(text, opts) {
  var lines = text.split('\n').map(tokenizeLine);
  var found = [];
  lines.forEach(function (l) { l.toks.forEach(function (t) { if (t.type === 'chord') found.push({ pc: t.parsed.chord.root.pc, quality: t.parsed.chord.info.quality }); }); });
  var estimate = estimateKey(found);
  var orig = opts.origKey || estimate;
  var shift = opts.shift;
  var target = orig ? { tonic: mod12(orig.tonic + shift), minor: orig.minor } : null;
  var nameFor = function (note, pc) {
    if (opts.policy === 'sharp') return SHARP_T[pc];
    if (opts.policy === 'flat') return FLAT_T[pc];
    if (opts.policy === 'preserve' && note.acc > 0) return SHARP_T[pc];
    if (opts.policy === 'preserve' && note.acc < 0) return FLAT_T[pc];
    return target ? spellInKey(pc, target) : MIXED_T[pc];
  };
  var warnings = [], id = 0, chordCount = 0, respelled = 0, offset = 0;
  var src = [], out = [], outText = [];
  lines.forEach(function (l) {
    var sLine = [], oLine = [], debt = 0;
    l.toks.forEach(function (t) {
      var tid = 't' + (id++);
      var start = offset;
      offset += t.raw.length;
      var cls = 'tk-' + t.type;
      var res = t.raw;
      var tokWarns = [];
      if (t.type === 'chord') {
        chordCount++;
        var c = t.parsed.chord;
        var r = nameFor(c.root, mod12(c.root.pc + shift));
        var b = c.bass ? nameFor(c.bass, mod12(c.bass.pc + shift)) : null;
        res = r + c.suffix + (b ? '/' + b : '');
        tokWarns = t.parsed.warns.slice();
        if (res !== t.raw && shift === 0) respelled++;
        if (target && (opts.policy === 'sharp' || opts.policy === 'flat' || opts.policy === 'preserve')) {
          [[c.root, r], [c.bass, b]].forEach(function (pair) {
            if (!pair[0] || pair[1].length < 2) return;
            var natural = spellInKey(mod12(pair[0].pc + shift), target);
            var wrongWay = pair[1][1] === '#' ? keyUsesFlats(target) : keyUsesSharps(target);
            if (natural !== pair[1] && wrongWay) tokWarns.push(warn('music', 'wrongSpelling', { key: keyName(target), from: pair[1], to: natural }, { action: 'context' }));
          });
        }
      } else if (t.type === 'unknown') {
        tokWarns = [t.warn];
      } else if (t.type === 'space' && l.kind === 'chords' && debt !== 0 && t.raw.length >= 2) {
        var n = Math.max(1, t.raw.length - debt);
        debt -= t.raw.length - n;
        res = ' '.repeat(n);
      }
      if (t.type === 'chord' || t.type === 'unknown') debt += res.length - t.raw.length;
      if (tokWarns.length) {
        var worst = tokWarns.some(function (w) { return w.kind === 'grammar'; }) ? 'g' : tokWarns.every(function (w) { return w.level === 'info'; }) ? 'i' : 'm';
        cls += ' tk-warn-' + worst;
        tokWarns.forEach(function (w, wi) {
          warnings.push({ id: tid + '-' + wi, tokenId: tid, kind: w.kind, level: w.level || 'warn', title: w.title, detail: w.detail, fix: w.fix, from: t.raw, to: res, start: start, end: start + t.raw.length, fixTo: w.fixTo && w.fixTo !== t.raw ? w.fixTo : null, action: w.action || null });
        });
      }
      if (l.kind === 'text') cls = 'tk-lyric';
      sLine.push({ text: t.raw, cls: cls, tid: tid });
      oLine.push({ text: res, cls: cls, tid: tid });
    });
    offset += 1; // newline
    src.push(sLine); out.push(oLine);
    outText.push(oLine.map(function (s) { return s.text; }).join(''));
  });
  return { src: src, out: out, text: outText.join('\n'), warnings: warnings, estimate: estimate, orig: orig, target: target, chordCount: chordCount, respelled: respelled, lineKinds: lines.map(function (l) { return l.kind; }) };
}


// getters, so the text follows the active locale
var POLICIES = ['sharp', 'flat', 'context', 'preserve'].map(function (id) {
  return { id: id, get label() { return msg('policy.' + id + '.label'); }, get hint() { return msg('policy.' + id + '.hint'); } };
});

function parseKeyId(id) {
  if (!id || id === 'auto') return null;
  var p = id.split(':');
  return { tonic: +p[0], minor: p[1] === 'm' };
}

export {
  LETTER_PC, SHARP_T, MIXED_T, MAJOR_NAMES, MINOR_NAMES, POLICIES,
  mod12, decodeEntities, keyName, keyUsesFlats, keyUsesSharps, nearestShift, parseKeyId, transpose
};
