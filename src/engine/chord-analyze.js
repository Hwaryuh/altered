// Chord analyzer (vendored). Ported verbatim from design/Fretboard.dc.html; do not edit.
// analyze(noteNames: string[]) -> ranked chord readings with warnings.
var analyze = (function () {
  var console = { log: function () {} };
// chord-analyze.js — chord analyzer engine (ranking + warnings). JS only, no DOM.
// ooapps methods + chordWarnings extracted verbatim from the original minified sources.
// glue reimplemented from ca2 createVariations. I18N stubbed (see below).

var copyObject = function (t) {
  var e = JSON.stringify(t);
  return JSON.parse(e);
};
var uniqueValues = function (t) {
  var e = !1,
    s = [],
    i,
    l;
  for (i = 0, l = t.length; i < l; i += 1) {
    e = !1;
    for (var o = 0; o < s.length; o += 1)
      if (t[i] == s[o]) {
        e = !0;
        break;
      }
    0 == e && s.push(t[i]);
  }
  return s;
};
var ooapps = {
  correctMode: !0,
  language: "EN",
  allowLoadingSounds: !0,
  loaded: [],
  soundsToLoad: [],
  allFretboards: [],
  allPianos: [],
  allStaffs: [],
  allStaffboards: [],
  allChordcharts: [],
  allChordsets: [],
  allDiatonicChords: [],
  notesFlat: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  notesSharp: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  notesEnhFlat: [
    "Dbb",
    "Db",
    "Ebb",
    "Fbb",
    "Fb",
    "Gbb",
    "Gb",
    "Abb",
    "Ab",
    "Bbb",
    "Cbb",
    "Cb",
  ],
  notesEnhSharp: [
    "B#",
    "B##",
    "C##",
    "D#",
    "D##",
    "E#",
    "E##",
    "F##",
    "G#",
    "G##",
    "A#",
    "A##",
  ],
  note2Flat: function (t) {
    var e;
    return (
      t.indexOf("bb") > -1 || t.indexOf("Cb") > -1 || t.indexOf("Fb") > -1
        ? (e = ooapps.notesEnhFlat.indexOf(t))
        : t.indexOf("##") > -1 || t.indexOf("E#") > -1 || t.indexOf("B#") > -1
          ? (e = ooapps.notesEnhSharp.indexOf(t))
          : t.indexOf("#") > -1 && (e = ooapps.notesSharp.indexOf(t)),
      e > -1 ? ooapps.notesFlat[e] : t
    );
  },
  mixolydian: {
    C: ["C", "D", "E", "F", "G", "A", "Bb"],
    "C#": ["C#", "D#", "E#", "F#", "G#", "A#", "B"],
    Db: ["Db", "Eb", "F", "Gb", "Ab", "Bb", "Cb"],
    D: ["D", "E", "F#", "G", "A", "B", "C"],
    "D#": ["D#", "E#", "F##", "G#", "A#", "B#", "C#"],
    Eb: ["Eb", "F", "G", "Ab", "Bb", "C", "Db"],
    E: ["E", "F#", "G#", "A", "B", "C#", "D"],
    F: ["F", "G", "A", "Bb", "C", "D", "Eb"],
    "F#": ["F#", "G#", "A#", "B", "C#", "D#", "E"],
    Gb: ["Gb", "Ab", "Bb", "Cb", "Db", "Eb", "Fb"],
    G: ["G", "A", "B", "C", "D", "E", "F"],
    "G#": ["G#", "A#", "B#", "C#", "D#", "E#", "F#"],
    Ab: ["Ab", "Bb", "C", "Db", "Eb", "F", "Gb"],
    A: ["A", "B", "C#", "D", "E", "F#", "G"],
    "A#": ["A#", "B#", "C##", "D#", "E#", "F##", "G#"],
    Bb: ["Bb", "C", "D", "Eb", "F", "G", "Ab"],
    B: ["B", "C#", "D#", "E", "F#", "G#", "A"],
  },
  allTones: [
    "C0",
    "Db0",
    "D0",
    "Eb0",
    "E0",
    "F0",
    "Gb0",
    "G0",
    "Ab0",
    "A0",
    "Bb0",
    "B0",
    "C1",
    "Db1",
    "D1",
    "Eb1",
    "E1",
    "F1",
    "Gb1",
    "G1",
    "Ab1",
    "A1",
    "Bb1",
    "B1",
    "C2",
    "Db2",
    "D2",
    "Eb2",
    "E2",
    "F2",
    "Gb2",
    "G2",
    "Ab2",
    "A2",
    "Bb2",
    "B2",
    "C3",
    "Db3",
    "D3",
    "Eb3",
    "E3",
    "F3",
    "Gb3",
    "G3",
    "Ab3",
    "A3",
    "Bb3",
    "B3",
    "C4",
    "Db4",
    "D4",
    "Eb4",
    "E4",
    "F4",
    "Gb4",
    "G4",
    "Ab4",
    "A4",
    "Bb4",
    "B4",
  ],
  allEnhTonesFlat: [
    "Dbb0",
    "Db0",
    "Ebb0",
    "Eb0",
    "Fb0",
    "Gbb0",
    "Gb0",
    "Abb0",
    "Ab0",
    "Bbb0",
    "Bb0",
    "Cb1",
    "Dbb1",
    "Db1",
    "Ebb1",
    "Eb1",
    "Fb1",
    "Gbb1",
    "Gb1",
    "Abb1",
    "Ab1",
    "Bbb1",
    "Bb1",
    "Cb2",
    "Dbb2",
    "Db2",
    "Ebb2",
    "Eb2",
    "Fb2",
    "Gbb2",
    "Gb2",
    "Abb2",
    "Ab2",
    "Bbb2",
    "Bb2",
    "Cb3",
    "Dbb3",
    "Db3",
    "Ebb3",
    "Eb3",
    "Fb3",
    "Gbb3",
    "Gb3",
    "Abb3",
    "Ab3",
    "Bbb3",
    "Bb3",
    "Cb4",
    "Dbb4",
    "Db4",
    "Ebb4",
    "Eb4",
    "Fb4",
    "Gbb4",
    "Gb4",
    "Abb4",
    "Ab4",
    "Bbb4",
    "Bb4",
    "Cb5",
  ],
  allTonesSharp: [
    "C0",
    "C#0",
    "D0",
    "D#0",
    "E0",
    "F0",
    "F#0",
    "G0",
    "G#0",
    "A0",
    "A#0",
    "B0",
    "C1",
    "C#1",
    "D1",
    "D#1",
    "E1",
    "F1",
    "F#1",
    "G1",
    "G#1",
    "A1",
    "A#1",
    "B1",
    "C2",
    "C#2",
    "D2",
    "D#2",
    "E2",
    "F2",
    "F#2",
    "G2",
    "G#2",
    "A2",
    "A#2",
    "B2",
    "C3",
    "C#3",
    "D3",
    "D#3",
    "E3",
    "F3",
    "F#3",
    "G3",
    "G#3",
    "A3",
    "A#3",
    "B3",
    "C4",
    "C#4",
    "D4",
    "D#4",
    "E4",
    "F4",
    "F#4",
    "G4",
    "G#4",
    "A4",
    "A#4",
    "B4",
  ],
  allEnhTonesSharp: [
    "C0",
    "C#0",
    "C##0",
    "D#0",
    "D##0",
    "E#0",
    "F#0",
    "F##0",
    "G#0",
    "G##0",
    "A#0",
    "A##0",
    "B#0",
    "C#1",
    "C##1",
    "D#1",
    "D##1",
    "E#1",
    "F#1",
    "F##1",
    "G#1",
    "G##1",
    "A#1",
    "A##1",
    "B#1",
    "C#2",
    "C##2",
    "D#2",
    "D##2",
    "E#2",
    "F#2",
    "F##2",
    "G#2",
    "G##2",
    "A#2",
    "A##2",
    "B#2",
    "C#3",
    "C##3",
    "D#3",
    "D##3",
    "E#3",
    "F#3",
    "F##3",
    "G#3",
    "G##3",
    "A#3",
    "A##3",
    "B#3",
    "C#4",
    "C##4",
    "D#4",
    "D##4",
    "E#4",
    "F#4",
    "F##4",
    "G#4",
    "G##4",
    "A#4",
    "A##4",
  ],
  allKeys: [
    "C",
    "C#",
    "Db",
    "D",
    "D#",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "G#",
    "Ab",
    "A",
    "A#",
    "Bb",
    "B",
  ],
  relevantKeys: [
    "C",
    "Db",
    "D",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "Ab",
    "A",
    "Bb",
    "B",
  ],
  relEnhKeys: [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ],
  standardTuning: ["E", "A", "D", "G", "B", "E"],
  deg2int: {
    I: "1",
    "#I": "#1",
    bII: "b9",
    II: "2",
    "#II": "#9",
    bIII: "m3",
    III: "3",
    IV: "4",
    "#IV": "#11",
    V: "5",
    "#V": "#5",
    bVI: "b13",
    VI: "6",
    bbVII: "6",
    "#VI": "7",
    bVII: "7",
    VII: "maj7",
  },
  getHalfSteps: function (t, e) {
    for (var s, o = [], i = 0; i < 12; i += 1)
      if (
        ooapps.notesFlat[i] == t ||
        ooapps.notesSharp[i] == t ||
        ooapps.notesEnhFlat[i] == t ||
        ooapps.notesEnhSharp[i] == t
      ) {
        s = i;
        break;
      }
    for (var a = 0, n = e.length; a < n; a += 1)
      if (e[a] != t) {
        for (i = 0; i < 12; i += 1)
          if (
            ooapps.notesFlat[i] == e[a] ||
            ooapps.notesSharp[i] == e[a] ||
            ooapps.notesEnhFlat[i] == e[a] ||
            ooapps.notesEnhSharp[i] == e[a]
          ) {
            (i < s && (i += 12), (o[a] = i - s));
            break;
          }
      } else o[a] = 0;
    return o;
  },
  getIntervalFromDegree: function (t) {
    var e = this.deg2int[t];
    return void 0 !== e && e;
  },
  getScaleDegreeFromNote: function (t, e) {
    var s = "",
      o = this.mixolydian[t],
      i = o.indexOf(e);
    if (-1 == i) {
      for (var a = 0; a < 7; a += 1)
        if (o[a].substr(0, 1) == e.substr(0, 1)) {
          i = a;
          break;
        }
      if (-1 == i) return !1;
      var n = o[i];
      n.indexOf("##") > -1
        ? e.indexOf("#") > -1 && (s = "b")
        : n.indexOf("#") > -1
          ? -1 == e.indexOf("#")
            ? (s = "b")
            : e.indexOf("#") > -1 && (s = "#")
          : n.indexOf("bb") > -1
            ? e.indexOf("b") > -1 && (s = "#")
            : n.indexOf("b") > -1
              ? -1 == e.indexOf("b")
                ? (s = "#")
                : e.indexOf("bb") > -1 && (s = "b")
              : -1 == n.indexOf("b") &&
                -1 == n.indexOf("#") &&
                (e.indexOf("#") > -1
                  ? (s = "#")
                  : e.indexOf("b") > -1 && (s = "b"));
    }
    if (i < 6) var r = s + ["I", "II", "III", "IV", "V", "VI", "bVII"][i];
    else 6 == i && (r = "b" == s ? "bbVII" : "#" == s ? "VII" : "bVII");
    return r;
  },
  getNotesFromIntervals: function (t, e, s) {
    for (var o, i = [], a = 0, n = e.length; a < n; a += 1) {
      switch (((o = ""), e[a])) {
        case "b1":
          o = h(t, 0);
          break;
        case "1":
          o = ooapps.mixolydian[t][0];
          break;
        case "#1":
          o = l(t, 0);
          break;
        case "b2":
        case "b9":
          o = h(t, 1);
          break;
        case "2":
        case "sus2":
        case "9":
          o = ooapps.mixolydian[t][1];
          break;
        case "#2":
        case "#9":
          o = l(t, 1);
          break;
        case "b3":
        case "-3":
        case "m3":
          o = h(t, 2);
          break;
        case "3":
          o = ooapps.mixolydian[t][2];
          break;
        case "b4":
          o = h(t, 3);
          break;
        case "4":
        case "sus4":
        case "11":
          o = ooapps.mixolydian[t][3];
          break;
        case "#4":
        case "#11":
          o = l(t, 3);
          break;
        case "b5":
          o = h(t, 4);
          break;
        case "5":
          o = ooapps.mixolydian[t][4];
          break;
        case "#5":
          o = l(t, 4);
          break;
        case "b6":
        case "b13":
          o = h(t, 5);
          break;
        case "6":
        case "13":
          o = ooapps.mixolydian[t][5];
          break;
        case "#6":
          o = l(t, 5);
          break;
        case "b7":
        case "°7":
        case "dim7":
          o = h(t, 6);
          break;
        case "7":
          o = ooapps.mixolydian[t][6];
          break;
        case "maj7":
        case "j7":
        case "ma7":
          o = l(t, 6);
          break;
        default:
          o = "x";
      }
      i[a] = o;
    }
    if (0 == s || null == s)
      for (a = 0, n = i.length; a < n; a += 1)
        for (var r = 0; r < 12; r += 1) {
          if (i[a] == this.notesEnhSharp[r]) {
            i[a] = this.notesSharp[r];
            break;
          }
          if (i[a] == this.notesEnhFlat[r]) {
            i[a] = this.notesFlat[r];
            break;
          }
        }
    function h(t, e) {
      var s,
        o = ooapps.mixolydian[t][e];
      s = 0 == e ? 6 : e - 1;
      var i = o.length;
      return o.indexOf("##") > -1 || o.indexOf("#") > -1
        ? o.substr(0, i - 1)
        : o.indexOf("bb") > -1
          ? ooapps.mixolydian[t][s]
          : (o.indexOf("b"), o + "b");
    }
    function l(t, e) {
      var s,
        o = ooapps.mixolydian[t][e];
      s = 6 == e ? 0 : e + 1;
      var i = o.length;
      return o.indexOf("bb") > -1 || o.indexOf("b") > -1
        ? o.substr(0, i - 1)
        : o.indexOf("##") > -1
          ? ooapps.mixolydian[t][s] + "#"
          : (o.indexOf("#"), o + "#");
    }
    return i;
  },
  getTonesFromIntervals: function (t, e, s) {
    var o = ooapps.getNotesFromIntervals(t, s, !0);
    return ooapps.getTonesFromeNotes(o, e);
  },
  getTonesFromNotes: function (t, e) {
    for (var s = [], o = e + 1, i = e - 1, a = 0; a < 12; a += 1)
      if (
        t[0] == ooapps.notesFlat[a] ||
        t[0] == ooapps.notesSharp[a] ||
        t[0] == ooapps.notesEnhFlat[a] ||
        t[0] == ooapps.notesEnhSharp[a]
      ) {
        if ("Cb" === t[0] || "Cbb" === t[0]) {
          s.push(t[0] + o);
          break;
        }
        if ("B#" === t[0] || "B##" === t[0]) {
          s.push(t[0] + i);
          break;
        }
        s.push(t[0] + e);
        break;
      }
    for (var n = 1, r = t.length; n < r; n += 1)
      for (var h = 0; h < 12; h += 1)
        if (
          (12 == (a += 1) && ((a = 0), (o = (e += 1) + 1), (i = e - 1)),
          t[n] == ooapps.notesFlat[a] ||
            t[n] == ooapps.notesSharp[a] ||
            t[n] == ooapps.notesEnhFlat[a] ||
            t[n] == ooapps.notesEnhSharp[a])
        ) {
          "Cb" === t[n] || "Cbb" === t[n]
            ? s.push(t[n] + o)
            : "B#" === t[n] || "B##" === t[n]
              ? s.push(t[n] + i)
              : s.push(t[n] + e);
          break;
        }
    return s;
  },
  syntax: {
    triadQ: "letters",
    punctuation: "brackets",
    altplusminus: !1,
    abbr: !0,
    spans: !0,
    sixSlash911: !0,
    flatSixSlash911: !0,
  },
  getChordSymbolArrayFromChordTypeParams: function (t, e) {
    "" == e && (e = "major");
    for (var s = 0, o = t.length; s < o; s += 1)
      if (t[s].chordtype == e) {
        var i = t[s];
        break;
      }
    if (i)
      return [
        i.triadQ && "major" != i.triadQ ? i.triadQ : "",
        i.extNum ? i.extNum : "",
        i.sus ? i.sus : "",
        i.tensions ? i.tensions.split(",") : [],
        i.adds ? i.adds.split(",") : [],
        i.omit ? i.omit : "",
      ];
  },
  chordSymbol: function (t, e) {
    var s = { csQuality: "", csExt: "", csSus: "", csTensions: "" };
    ((s.majToQuality = !1),
      (s.susPostExt = !1),
      (s.extInBrackets = !1),
      (s.tensionsInBrackets = !1));
    var o = copyObject(this.syntax);
    if (e)
      for (var i in e)
        ((o[i] = e[i]), console.log("changed syntax k to " + o[i]));
    var a = "",
      n = [],
      r = "";
    ((s.specialChords = []),
      (s.specialChords.m11b5no3 = !1),
      (s.specialChords.dimb13 = !1),
      (s.specialChords.dimb13no5 = !1),
      (s.specialChords.susb9 = !1),
      (s.specialChords.susb13 = !1));
    var h = "",
      l = "",
      d = "",
      c = "",
      p = "";
    if ((t[0] && "" != t[0] && (a = t[0]), (a = this.replaceAcc(a)), t[1]))
      for (var f = 0; f < t[1].length; f += 1)
        n[f] = 3 == f || 4 == f ? t[1][f].slice(0) : t[1][f];
    (t[2] &&
      "" != t[2] &&
      ("object" == typeof t[2]
        ? (r = t[2][0])
        : "string" == typeof t[2] && (r = t[2]),
      (r = this.replaceAcc(r))),
      n[5] &&
        "3" == n[5] &&
        "m" == n[0] &&
        "7" == n[1] &&
        n[3].indexOf("11") > -1 &&
        n[3].indexOf("b5") > -1 &&
        (console.log("special m11b5(no3)"),
        (n[5] = ""),
        (s.specialChords.m11b5no3 = !0)),
      n[5] && "5" == n[5]
        ? "dim" == n[0] &&
          "dim7" == n[1] &&
          1 == n[3].length &&
          "b13" == n[3][0] &&
          (console.log("special dimb13no5"),
          1 == o.abbr && (n[1] = ""),
          (n[5] = ""),
          (s.specialChords.dimb13no5 = !0))
        : "dim" == n[0] &&
          "dim7" == n[1] &&
          1 == n[3].length &&
          "b13" == n[3][0] &&
          (console.log("special dimb13"),
          1 == o.abbr && (n[1] = ""),
          (s.specialChords.dimb13 = !0)),
      !n[3] ||
        "7" != n[1] ||
        "sus4" != n[2] ||
        1 != n[3].length ||
        ("b9" != n[3][0] && "b13" != n[3][0]) ||
        (1 == o.abbr && (n[1] = ""),
        "b9" == n[3][0]
          ? (s.specialChords.susb9 = !0)
          : "b13" == n[3][0] && (s.specialChords.susb13 = !0)),
      n.length > 0 && (h = n[0]),
      n.length > 2 && "" != n[2] && (c = n[2]),
      n.length > 1 &&
        ((l = n[1]),
        "dim" == n[0] && "dim7" == n[1] && ((h = "dim"), (l = "7"))));
    var u = ["9", "11", "13"];
    if (n[3]) {
      if (
        ("b6" == l && 1 == o.flatSixSlash911) ||
        ("6" == l && 1 == o.sixSlash911)
      )
        for (f = 0; f < 3; f++)
          n[3].indexOf(u[f]) > -1 &&
            ((l += "/" + u[f]), n[3].splice(n[3].indexOf(u[f]), 1));
      else if ("b6" == l && 0 == o.flatSixSlash911)
        for (f = 0; f < 3; f++)
          n[3].indexOf(u[f]) > -1 &&
            ((l += "," + u[f]), n[3].splice(n[3].indexOf(u[f]), 1));
      if (1 == o.abbr && ("7" == l || "maj7" == l || "dim7" == l)) {
        var b = "7";
        for (f = 0; f < 3; f++)
          n[3].indexOf(u[f]) > -1 &&
            ((b = u[f]), n[3].splice(n[3].indexOf(u[f]), 1));
        l = l.replace("7", b);
      }
      if ("b6" == l)
        for (f = 0; f < 3; f++)
          n[3].indexOf(u[f]) > -1 &&
            ((l += "," + u[f]), n[3].splice(n[3].indexOf(u[f]), 1));
    }
    (n[3] && n[3].length > 0 && (d += n[3]),
      1 == o.abbr &&
        (n[1] && "dim7" == n[1] && (n[1] = ""), "sus4" == n[2] && (c = "sus")),
      n[5] && "" != n[5] && (p = n[5]),
      "" != c &&
        ("6" == l ||
          "7" == l ||
          "maj7" == l ||
          "maj" == h ||
          l.indexOf("maj") > -1) &&
        (s.susPostExt = !0),
      n[4] &&
        (n[4].length > 0 &&
          (n[3] != [] && n[3].length > 0 && (d += ","), (d += n[4])),
        "" != p &&
          ((n[3].length > 0 || (n[4].length > 0 && n[4] != [])) && (d += ","),
          (d += "no" + p))),
      l.indexOf("b6") > -1 && "" == h && "" == c && (s.extInBrackets = !0),
      0 == o.spans &&
        n.length > 1 &&
        "m" == n[0] &&
        "maj7" == n[1] &&
        (s.extInBrackets = !0),
      "" != d &&
        ((s.tensionsInBrackets = !0),
        "auto" != o.punctuation ||
          "7,maj7" == l ||
          ("maj7" == l && "" != h) ||
          (((0 == s.extInBrackets &&
            d.indexOf(",") < 0 &&
            (d.indexOf("#") > -1 || d.indexOf("b") > -1)) ||
            ("add9" == d &&
              ((t[0].indexOf("b") < 0 && t[0].indexOf("#") < 0) ||
                "" != n[0]))) &&
            (s.tensionsInBrackets = !1)),
        1 != o.abbr ||
          (1 != s.specialChords.dimb13 &&
            1 != s.specialChords.dimb13no5 &&
            1 != s.specialChords.m11b5no3 &&
            1 != s.specialChords.susb9 &&
            1 != s.specialChords.susb13) ||
          (s.tensionsInBrackets = !1)),
      "icons" == o.triadQ &&
        (n[0] && "m" == n[0]
          ? (h = "&minus;")
          : n[0] && "dim" == n[0]
            ? (h = "°")
            : n[0] && "aug" == n[0] && (h = "+"),
        (h.indexOf("maj") > -1 || l.indexOf("maj") > -1) &&
          ((h = h.replace("maj", "&Delta;")),
          (l = l.replace("maj", "&Delta;"))),
        1 == o.abbr &&
          "&minus;" == h &&
          "7" == l &&
          "b5" == d &&
          1 == o.abbr &&
          ((h = ""), (l = "&empty;"), (d = ""), (s.tensionsInBrackets = !1))),
      (s.csQuality = h),
      (s.csExt = l),
      (s.csSus = c),
      (s.csTensions = d),
      1 == s.extInBrackets && 1 == s.tensionsInBrackets
        ? ((l = "(" + l), (d = "," + d + ")"))
        : 1 == s.extInBrackets && 0 == s.tensionsInBrackets
          ? (l = "(" + l + ")")
          : 1 == s.tensionsInBrackets &&
            0 == s.extInBrackets &&
            (d = "(" + d + ")"),
      1 == o.spans &&
        (l = l.replaceAll("/", '<span class="csExtSlash">/</span>')),
      (l = this.replaceAcc(l)),
      (d = this.replaceAcc(d)),
      1 == o.spans &&
        ("&minus;" == h
          ? (h = '<span class="csMinus">&minus;</span>')
          : "°" == h
            ? (h = '<span class="csDim">°</span>')
            : "+" == h
              ? (h = '<span class="csPlus">+</span>')
              : "&empty;" == l && (l = '<span class="csEmpty">&empty;</span>'),
        "" != h && (h = '<span class="csQuality">' + h + "</span>"),
        "" != l && (l = '<span class="csExtNum">' + l + "</span>"),
        "" != c && (c = '<span class="csSus">' + c + "</span>"),
        "" != d && (d = '<span class="csTensions">' + d + "</span>")));
    var g = "";
    return (
      1 == o.spans
        ? (r && (g += '<span class="preSlash">'),
          (g += '<span class="csRoot">' + a + "</span>"))
        : (g = a),
      1 == s.susPostExt ? (g += h + l + c + d) : (g += h + c + l + d),
      r &&
        (1 == o.spans
          ? ((g += "</span>"),
            (g += '<span class="csSlash">/</span>'),
            (g += '<span class="csBass">' + r + "</span>"))
          : (g += "/" + r)),
      (s.csFormatted = g),
      (s.chSymArray = n),
      s
    );
  },
  replaceAcc: function (t, e) {
    return t;
  },
  replace_notenames_brackets: function (t, e) {
    var s = this;
    return t.replace(/\[.{1,4}\]/gi, function (t) {
      var o = t.substr(1, t.length - 2),
        i = s.getNotesFromIntervals(e, [o], !0);
      return (i =
        '<span class="tone">' + (i = ooapps.replaceAcc(i[0])) + "</span>");
    });
  },
  sortTones: function (t) {
    var e,
      s,
      o,
      i = [],
      a = ["C", "D", "E", "F", "G", "A", "B"],
      n = t.length;
    for (e = 0; e < 4; e += 1)
      for (s = 0; s < 7; s += 1)
        for (o = 0; o < n; o += 1)
          t[o].substr(t[o].length - 1, 1) == e.toString() &&
            t[o].substr(0, 1) == a[s] &&
            (i.push(t[o]), t.splice(o, 1), (n -= 1), (o -= 1));
    return i;
  },
  stavesPreprocess: function (t, e) {
    var s = uniqueValues(t);
    t = ooapps.sortTones(s);
    var o = [];
    if (null != e && "linear" == e.arrange)
      for (var i = 0; i < t.length; i++) o.push([t[i]]);
    else {
      for (var a, n, r, h = 0, l = [], d = 1, c = t.length; d < c; d += 1)
        if (
          ((n = t[d - 1]),
          (r = t[d]),
          n.substr(0, 1) == r.substr(0, 1) &&
            n.substr(n.length - 1, 1) == r.substr(r.length - 1, 1))
        ) {
          if (
            ("b" == n.substr(1, 1) &&
              "bb" != r.substr(1, 2) &&
              "#" != r.substr(1, 1)) ||
            ("#" == n.substr(1, 1) && "##" != r.substr(1, 2))
          )
            for (l[h] = n, a = d - 1; a < c; a += 1) t[a] = t[a + 1];
          else for (l[h] = r, a = d; a < c - 1; a += 1) t[a] = t[a + 1];
          (t.pop(), (d -= 1), (c -= 1), (h += 1));
        }
      ((o[0] = t), l.length > 0 && (o[1] = l));
    }
    var p = { key: "C" };
    return ((p.notestacks = o), p);
  },
  getIntervalFromNotes: function (t, e) {
    var s = this.getHalfSteps(t, [e]);
    return this.getChordInfo(s).uniqueIntervals[0];
  },
  getScaleInfo: function (t) {
    (console.log(t),
      t.sort(function (t, e) {
        return t - e;
      }));
    var e = t.join("_");
    var s = [];
    ((s["0_2_4_5_7_9_11"] = "Major"),
      (s["0_2_3_5_7_9_10"] = "Dorian"),
      (s["0_1_3_5_7_8_10"] = "Phrygian"),
      (s["0_2_4_6_7_9_11"] = "Lydian"),
      (s["0_2_4_5_7_9_10"] = "Mixolydian"),
      (s["0_2_3_5_7_8_10"] = "Aeolian"),
      (s["0_1_3_5_6_8_10"] = "Locrian"),
      (s["0_2_4_7_9"] = "Major Pentatonic"),
      (s["0_3_5_7_10"] = "Minor Pentatonic"),
      (s["0_3_5_6_7_10"] = "Blues Scale"),
      (s["0_3_4_5_6_7_10"] = "Blues Scale"),
      (s["0_2_3_5_6_8_9_11"] = "Whole-Half Scale"),
      (s["0_1_3_4_6_7_9_10"] = "Half-Whole Scale"),
      (s["0_1_2_3_4_5_6_7_8_9_10_11"] = "Chromatic Scale"),
      (s["0_2_3_5_7_8_11"] = "Harmonic Minor"),
      (s["0_1_3_5_6_9_10"] = "HM2"),
      (s["0_2_4_5_8_9_11"] = "HM3"),
      (s["0_2_3_6_7_9_10"] = "HM4"),
      (s["0_1_4_5_7_8_10"] = "HM5"),
      (s["0_3_4_6_7_9_11"] = "HM6"),
      (s["0_1_3_4_6_8_9"] = "HM7"),
      (s["0_2_3_5_7_9_11"] = "Melodic Minor"),
      (s["0_1_3_5_7_9_10"] = "Dorian b2/b9 (MM2)"),
      (s["0_2_4_6_8_9_11"] = "Lydian Augmented (MM3)"),
      (s["0_2_4_6_7_9_10"] = "Lydian Dominant (MM4)"),
      (s["0_2_4_5_7_8_10"] = "Mixolydian b6/b13 (MM5)"),
      (s["0_2_3_5_6_8_10"] = "Aeolian b5 (MM6)"),
      (s["0_1_3_4_6_8_10"] = "Altered Scale (MM7)"));
    var o = "";
    return (void 0 !== s[e] && (o = s[e]), console.log("scale name: " + o), o);
  },
  getChordInfo: function (t) {
    var e,
      s,
      o,
      i,
      a,
      n,
      r,
      h,
      l,
      d,
      c,
      p,
      f = copyObject(t);
    function u() {
      ((e = !1),
        (s = !1),
        (o = !1),
        (i = !1),
        (a = !1),
        (n = !1),
        (r = !1),
        (h = !1),
        (l = !1),
        (d = !1),
        (c = !1),
        (p = !1));
      for (var t = 0, u = f.length; t < u; t += 1)
        0 == f[t]
          ? (e = !0)
          : 1 == f[t]
            ? (s = !0)
            : 2 == f[t]
              ? (o = !0)
              : 3 == f[t]
                ? (i = !0)
                : 4 == f[t]
                  ? (a = !0)
                  : 5 == f[t]
                    ? (n = !0)
                    : 6 == f[t]
                      ? (r = !0)
                      : 7 == f[t]
                        ? (h = !0)
                        : 8 == f[t]
                          ? (l = !0)
                          : 9 == f[t]
                            ? (d = !0)
                            : 10 == f[t]
                              ? (c = !0)
                              : 11 == f[t] && (p = !0);
    }
    u();
    var b = "",
      g = "",
      v = "",
      m = {},
      x = {},
      y = "";
    function S() {
      ((b = ""),
        (g = ""),
        (v = ""),
        (m = {}),
        (x = {}),
        (y = ""),
        i && !a
          ? (b = !r || h || c || p ? "m" : "dim")
          : ((l && a && !h && !c && !p) || (l && f.length <= 2)) && (b = "aug"),
        i || a || (n ? (v = "sus4") : o && !n && (v = "sus2")),
        !h || s || o || i || a || n || r || l || d || c || p
          ? c && !p
            ? (g = "7")
            : p && !c
              ? (g = "maj7")
              : c && p
                ? (g = "7,maj7")
                : d
                  ? (g = "dim" == b ? "dim7" : "6")
                  : l && "aug" != b && (g = "b6")
          : (g = "5"));
      var t = !1;
      if (
        (g.indexOf("7") < 0 && g.indexOf("6") < 0 && (t = !0),
        (m.b9 = !1),
        (m[9] = !1),
        (m["#9"] = !1),
        (m[11] = !1),
        (m["#11"] = !1),
        (m.b5 = !1),
        (m["#5"] = !1),
        (m.b13 = !1),
        (m[13] = !1),
        s && (m.b9 = !0),
        o && "sus2" != v && (m[9] = !0),
        i && a && (m["#9"] = !0),
        n && "sus4" != v && (m[11] = !0),
        r &&
          "dim" != b &&
          (h
            ? (m["#11"] = !0)
            : (!a && !p && "sus2" != v) || n
              ? (m.b5 = !0)
              : (m["#11"] = !0)),
        l &&
          "aug" != b &&
          "b6" != g &&
          (h || (c && !d) || "dim" == b ? (m.b13 = !0) : (m["#5"] = !0)),
        d && (c || p) && (m[13] = !0),
        (x[9] = !1),
        (x[11] = !1),
        (x.b9 = !1),
        (x["#9"] = !1),
        (x["#11"] = !1),
        1 == t)
      ) {
        (o && "sus2" != v && ((x[9] = !0), (m[9] = !1)),
          n && "sus4" != v && ((x[11] = !0), (m[11] = !1)));
        for (var u = ["b9", "#9", "#11"], S = 0, w = u.length; S < w; S += 1)
          1 == m[u[S]] && ((m[u[S]] = !1), (x[u[S]] = !0));
      }
      (f.length > 1 && (o || i || a || n || "5" == g || (y = "3")),
        !e ||
          o ||
          i ||
          a ||
          !n ||
          !r ||
          h ||
          l ||
          d ||
          !c ||
          p ||
          ((v = ""), (b = "m"), (m[11] = !0), (y = "3")),
        !e ||
          o ||
          !i ||
          a ||
          n ||
          r ||
          h ||
          !l ||
          !d ||
          c ||
          p ||
          ((b = "dim"), (g = "dim7"), (m.b13 = !0), (m["#5"] = !1), (y = "5")));
      var C = {};
      return (
        (C.triadQ = b),
        (C.extNum = g),
        (C.sus = v),
        (C.tensionsObj = m),
        (C.addsObj = x),
        (C.omit = y),
        C
      );
    }
    function w() {
      var t = [];
      return (
        (t[0] = "1"),
        (t[1] = "b9"),
        (t[2] = "sus2" == v ? "sus2" : "9"),
        (t[3] = a ? "#9" : "m3"),
        (t[4] = "3"),
        (t[5] = "sus4" == v ? "sus4" : "11"),
        1 == m["#11"] || 1 == x["#11"] ? (t[6] = "#11") : (t[6] = "b5"),
        (t[7] = "5"),
        "b6" == g ? (t[8] = "b6") : 1 == m.b13 ? (t[8] = "b13") : (t[8] = "#5"),
        1 == m[13] ? (t[9] = "13") : (t[9] = "6" == g ? "6" : "dim7"),
        (t[10] = "7"),
        (t[11] = "maj7"),
        t
      );
    }
    function C(t) {
      for (var e = [], s = 0, o = f.length; s < o; s += 1) e.push(t[f[s]]);
      return e;
    }
    var I = {};
    if (
      ((I.absoluteIntervals = {
        pf1: e,
        mi2: s,
        ma2: o,
        mi3: i,
        ma3: a,
        pf4: n,
        dm5: r,
        pf5: h,
        mi6: l,
        ma6: d,
        mi7: c,
        ma7: p,
      }),
      (I.csParams = S()),
      (I.intervalNames = w()),
      (I.uniqueIntervals = C(I.intervalNames)),
      (I.slashChord = {}),
      0 != f[0])
    ) {
      var F = f[0],
        T = {
          b9: 1,
          9: 2,
          "#9": 3,
          11: 5,
          "#11": 6,
          b6: 8,
          b13: 8,
          6: 9,
          13: 9,
        };
      for (var k in T) F == T[k] && I.intervalNames[T[k]] == k && f.shift();
      (u(),
        (I.slashChord.absoluteIntervals = {
          pf1: e,
          mi2: s,
          ma2: o,
          mi3: i,
          ma3: a,
          pf4: n,
          dm5: r,
          pf5: h,
          mi6: l,
          ma6: d,
          mi7: c,
          ma7: p,
        }),
        (I.slashChord.csParams = S()),
        (I.slashChord.intervalNames = w()),
        (I.slashChord.uniqueIntervals = C(I.slashChord.intervalNames)));
    } else I.slashChord = !1;
    return I;
  },
  chordSymbolObjectToArray: function (t) {
    var e = ["b5", "#5", "b6", "9", "11", "13", "b9", "#9", "#11", "b13"],
      s = [];
    if (t.tensionsObj)
      for (var o = 0, i = e.length; o < i; o += 1)
        !0 === t.tensionsObj[e[o]] && s.push(e[o]);
    var a = ["b9", "9", "#9", "11", "#11"],
      n = [];
    if (t.addsObj)
      for (var r = 0, h = a.length; r < h; r += 1)
        !0 === t.addsObj[a[r]] && n.push("add" + a[r]);
    var l = [];
    return (
      t.triadQ ? (l[0] = t.triadQ) : (l[0] = ""),
      t.extNum ? (l[1] = t.extNum) : (l[1] = ""),
      t.sus ? (l[2] = t.sus) : (l[2] = ""),
      t.tensionsObj ? ((t.tensions = s), (l[3] = s)) : (l[3] = []),
      t.addsObj ? ((t.adds = n), (l[4] = n)) : (l[4] = ""),
      t.omit ? (l[5] = t.omit) : (l[5] = ""),
      l
    );
  },
  correctOnOff: function (t) {
    0 == t || (!t && 1 == this.correctMode)
      ? (this.correctMode = !1)
      : (this.correctMode = !0);
    for (var e = 0, s = this.allFretboards.length; e < s; e += 1) {
      var o = this.allFretboards[e];
      (0 == this.correctMode ? (o.correctMode = !1) : (o.correctMode = !0),
        o.redraw());
    }
  },
  getChordShapePositions: function (t) {
    t.numSpots = t.spots.length;
    for (
      var e, s, o = 99, i = 99, a = 99, n = 0, r = 1, h = 0;
      h < t.numSpots;
      h += 1
    )
      ((s = parseInt(t.spots[h].substr(0, 1))) > r && (r = s),
        (e = parseInt(t.spots[h].substr(1, t.spots[h].length - 1))),
        1 == parseInt(t.intervals[h]) && e < o && (o = e),
        e < i && (i = e),
        null != t.capo && e != t.capo && e < a
          ? (a = e)
          : null == t.capo && (a = i),
        e > n && (n = e));
    var l = n - i + 1;
    if (a < 99) var d = n - a + 1;
    else d = !1;
    return (
      (t.lowString = r),
      (t.highest = n),
      (t.lowest = i),
      (t.subLowest = a),
      (t.lowRoot = o),
      (t.extent = l),
      (t.subextent = d),
      t
    );
  },
};

// ===== I18N stub: real strings live in the original language file (not in folder). =====
// Returns the message key so warning ids are still usable. Replace t() to localize.
var I18N = {
  t: function (key, vars) {
    return vars ? key + " " + JSON.stringify(vars) : key;
  },
};

// ===== glue reimplemented from ca2 createVariations =====
var STD_TUNING = ["E", "A", "D", "G", "B", "E"]; // string 6..1
var CHROM = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var OPEN_PITCH = [40, 45, 50, 55, 59, 64]; // MIDI, string 6..1
var FLAT2SHARP = { Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#" };
function normNote(n) {
  n = n.trim();
  return FLAT2SHARP[n] || n;
}
function stripSpans(h) {
  return h.replace(/<[^>]+>/g, "");
}

// attach chordWarnings onto ooapps (defined in ca2 originally)
ooapps.chordWarnings = function (t, s, e) {
  var i,
    a,
    n,
    r,
    o,
    c,
    h,
    l,
    d,
    p,
    v,
    m,
    w,
    x,
    y,
    b = s.uniqueIntervals,
    u = s.intervalNames,
    f = s.absoluteIntervals;
  ((i = f.pf1),
    (a = f.mi2),
    (n = f.ma2),
    (r = f.mi3),
    (o = f.ma3),
    (c = f.pf4),
    (h = f.dm5),
    (l = f.pf5),
    (d = f.mi6),
    (p = f.ma6),
    (v = f.mi7),
    (m = f.ma7),
    e.csQuality,
    e.csExt,
    e.csTensions,
    e.csSus);
  var g = [];
  ((x = 0),
    (w = {}),
    0 == i ||
      r ||
      o ||
      n ||
      c ||
      ((w = {
        id: "no3",
        cat: "omitted",
        short: I18N.t("CHWRNGS.WRN_no3_SHORT"),
        long: I18N.t("CHWRNGS.WRN_no3_LONG"),
      }),
      g.push(w)));
  ((y = []), (x = 0));
  for (var B in f) ((y[x] = f[B]), x++);
  for (x = 0; x < 12; x += 1) {
    var S = x,
      L = x + 1,
      C = x + 2;
    if (
      (L > 11 && (L -= 12),
      C > 11 && (C -= 12),
      1 == y[S] && 1 == y[L] && 1 == y[C])
    ) {
      let t = { intA: u[S], intB: u[L], intC: u[C] };
      ((w = {
        id: "cluster",
        cat: "cluster",
        short: I18N.t("CHWRNGS.WRN_cluster_SHORT", t),
        long: I18N.t("CHWRNGS.WRN_cluster_LONG", t),
      }),
        g.push(w));
    }
  }
  function k(t, s) {
    for (var e = !0, i = 0, a = t.length; i < a; i += 1)
      if (s.indexOf(t[i]) < 0) {
        e = !1;
        break;
      }
    return e;
  }
  return (
    l &&
      h &&
      "b5" == u[6] &&
      ((w = {
        id: "5b5",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_5b5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_5b5_LONG"),
      }),
      g.push(w)),
    l &&
      d &&
      "#5" == u[8] &&
      ((w = {
        id: "5#5",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_5s5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_5s5_LONG"),
      }),
      g.push(w)),
    1 == k(["b5", "#5"], b) &&
      ((w = {
        id: "b5#5",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_b5s5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_b5s5_LONG"),
      }),
      g.push(w)),
    v &&
      m &&
      ((w = {
        id: "7maj7",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_7maj7_SHORT"),
        long: I18N.t("CHWRNGS.WRN_7maj7_LONG"),
      }),
      g.push(w)),
    n &&
      a &&
      ((w = {
        id: "9b9",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_9b9_SHORT"),
        long: I18N.t("CHWRNGS.WRN_9b9_LONG"),
      }),
      g.push(w)),
    n &&
      r &&
      o &&
      ((w = {
        id: "9#9",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_9s9_SHORT"),
        long: I18N.t("CHWRNGS.WRN_9s9_LONG"),
      }),
      g.push(w)),
    1 == k(["b9", "#9"], b) &&
      ((w = {
        id: "b9#9",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_b9s9_SHORT"),
        long: I18N.t("CHWRNGS.WRN_b9s9_LONG"),
      }),
      g.push(w)),
    1 == k(["b13", "13"], b) &&
      ((w = {
        id: "13b13",
        cat: "double",
        short: I18N.t("CHWRNGS.WRN_13b13_SHORT"),
        long: I18N.t("CHWRNGS.WRN_13b13_LONG"),
      }),
      g.push(w)),
    n &&
      "sus2" == u[2] &&
      h &&
      "b5" == u[6] &&
      ((w = {
        id: "sus2b5",
        cat: "inversion",
        assumedRoot: "2",
        short: I18N.t("CHWRNGS.WRN_sus2b5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_sus2b5_LONG"),
      }),
      g.push(w)),
    n &&
      "sus2" == u[2] &&
      d &&
      "#5" == u[8] &&
      ((w = {
        id: "sus2#5",
        assumedRoot: "7",
        short: I18N.t("CHWRNGS.WRN_sus2s5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_sus2s5_LONG"),
      }),
      g.push(w)),
    c &&
      "sus4" == u[5] &&
      h &&
      "b5" == u[6] &&
      ((w = {
        id: "sus4b5",
        cat: "fragment",
        assumedRoot: "b6,6,9,m3",
        short: I18N.t("CHWRNGS.WRN_sus4b5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_sus4b5_LONG"),
      }),
      g.push(w)),
    c &&
      "sus4" == u[5] &&
      d &&
      "#5" == u[8] &&
      ((w = {
        id: "sus4#5",
        cat: "inversion",
        assumedRoot: "4",
        short: I18N.t("CHWRNGS.WRN_sus4s5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_sus4s5_LONG"),
      }),
      g.push(w)),
    c &&
      "sus4" == u[5] &&
      m &&
      ((w = {
        id: "maj7sus4",
        cat: "",
        assumedRoot: "",
        short: I18N.t("CHWRNGS.WRN_maj7sus4_SHORT"),
        long: I18N.t("CHWRNGS.WRN_maj7sus4_LONG"),
      }),
      g.push(w)),
    r &&
      "m3" == u[3] &&
      d &&
      "#5" == u[8] &&
      ((w = {
        id: "m#5",
        cat: "uncommon",
        assumedRoot: "b6",
        short: I18N.t("CHWRNGS.WRN_ms5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_ms5_LONG"),
      }),
      g.push(w)),
    1 == k(["3", "b6"], b) &&
      ((w = {
        id: "b6",
        cat: "inversion",
        assumedRoot: "b6",
        short: I18N.t("CHWRNGS.WRN_b6_SHORT"),
        long: I18N.t("CHWRNGS.WRN_b6_LONG"),
      }),
      g.push(w)),
    1 == k(["m3", "b6", "5"], b) &&
      ((w = {
        id: "mb6",
        cat: "inversion",
        assumedRoot: "mb6",
        short: I18N.t("CHWRNGS.WRN_mb6_SHORT"),
        long: I18N.t("CHWRNGS.WRN_mb6_LONG"),
      }),
      g.push(w)),
    c &&
      "sus4" == u[5] &&
      p &&
      "6" == u[9] &&
      ((w = {
        id: "6sus4",
        cat: "inversion",
        assumedRoot: "4",
        short: I18N.t("CHWRNGS.WRN_6sus4_SHORT"),
        long: I18N.t("CHWRNGS.WRN_6sus4_LONG"),
      }),
      g.push(w)),
    1 == k(["6", "9", "11"], b)
      ? ((w = {
          id: "6/9/11",
          cat: "inversion",
          assumedRoot: "4",
          short: I18N.t("CHWRNGS.WRN_6911_SHORT"),
          long: I18N.t("CHWRNGS.WRN_6911_LONG"),
        }),
        g.push(w))
      : 1 == k(["6", "11"], b) &&
        ((w = {
          id: "6/11",
          cat: "inversion",
          assumedRoot: "4",
          short: I18N.t("CHWRNGS.WRN_611_SHORT"),
          long: I18N.t("CHWRNGS.WRN_611_LONG"),
        }),
        g.push(w)),
    o &&
      h &&
      "b5" == u[6] &&
      ((w = {
        id: "majorb5",
        cat: "enharmonic",
        assumedRoot: "",
        short: I18N.t("CHWRNGS.WRN_majorb5_SHORT"),
        long: I18N.t("CHWRNGS.WRN_majorb5_LONG"),
      }),
      g.push(w)),
    1 == k(["3", "11"], b) &&
      0 == k(["6"], b) &&
      ((w = {
        id: "major11",
        cat: "dissonance",
        short: I18N.t("CHWRNGS.WRN_major11_SHORT"),
        long: I18N.t("CHWRNGS.WRN_major11_LONG"),
      }),
      g.push(w)),
    1 == k(["m3", "b9"], b) &&
      ((w = {
        id: "m3b9",
        cat: "dissonance",
        short: I18N.t("CHWRNGS.WRN_m3b9_SHORT"),
        long: I18N.t("CHWRNGS.WRN_m3b9_LONG"),
      }),
      g.push(w)),
    "" == s.csParams.extNum &&
      (b.indexOf("b9") > -1 ||
        b.indexOf("#9") > -1 ||
        b.indexOf("#11") > -1 ||
        b.indexOf("b13") > -1) &&
      ((w = {
        id: "addAlt",
        short: I18N.t("CHWRNGS.WRN_addAlt_SHORT"),
        long: I18N.t("CHWRNGS.WRN_addAlt_LONG"),
      }),
      g.push(w)),
    g
  );
};

// spot "s:f" -> {note, pitch}  (string 1-6, standard tuning)
function spotInfo(spot, tuning) {
  tuning = tuning || STD_TUNING;
  var p = spot.split(":"),
    s = parseInt(p[0], 10),
    f = parseInt(p[1], 10);
  var open = normNote(tuning[6 - s]);
  var pc = (CHROM.indexOf(open) + f) % 12;
  var pitch =
    (tuning === STD_TUNING ? OPEN_PITCH[6 - s] : CHROM.indexOf(open) + 40) + f;
  return { note: CHROM[pc], pitch: pitch };
}

// input: note names ["E","G","B","D"]  OR  spots ["6:0","4:2",...]
function analyze(input, opts) {
  opts = opts || {};
  var isSpots = input.length && input[0].indexOf(":") > -1;
  var played; // [{note,pitch}]
  if (isSpots) {
    played = input.map(function (x) {
      return spotInfo(x, opts.tuning);
    });
  } else {
    played = input.map(function (x, i) {
      return { note: normNote(x), pitch: i };
    }); // no octave -> use given order as pitch
  }
  // lowest pitch per unique note -> rank roots bass-first
  var byNote = {};
  played.forEach(function (p) {
    if (byNote[p.note] === undefined || p.pitch < byNote[p.note])
      byNote[p.note] = p.pitch;
  });
  var uniq = Object.keys(byNote);
  var noteSet = uniqueValues(
    played.map(function (p) {
      return p.note;
    }),
  );
  var bass = played.slice().sort(function (a, b) {
    return a.pitch - b.pitch;
  })[0].note;
  // order roots by their lowest pitch (bass first) = ranking
  uniq.sort(function (a, b) {
    return byNote[a] - byNote[b];
  });

  var results = [];
  for (var l = 0; l < uniq.length; l++) {
    var root = uniq[l];
    var hs = ooapps.getHalfSteps(root, noteSet);
    var info = ooapps.getChordInfo(hs);
    var arr = ooapps.chordSymbolObjectToArray(info.csParams);
    var cs = ooapps.chordSymbol([root, arr]);
    var warn = ooapps.chordWarnings(root, info, cs).map(function (w) {
      return { id: w.id, cat: w.cat || "", assumedRoot: w.assumedRoot || "" };
    });
    var r = {
      root: root,
      name: stripSpans(cs.csFormatted),
      intervals: info.uniqueIntervals,
      warnings: warn,
      warn: warn.length > 0,
    };
    if (info.slashChord && root !== bass) {
      var sArr = ooapps.chordSymbolObjectToArray(info.slashChord.csParams);
      var scs = ooapps.chordSymbol([root, sArr, bass]);
      var swarn = ooapps
        .chordWarnings(root, info.slashChord, scs)
        .map(function (w) {
          return {
            id: w.id,
            cat: w.cat || "",
            assumedRoot: w.assumedRoot || "",
          };
        });
      r.slash = stripSpans(scs.csFormatted);
      r.slashWarnings = swarn;
    }
    results.push(r);
  }
  if (results.length) results[0].primary = true; // bass-rooted = best interpretation
  return results;
}

function demo() {
  var out = analyze(["E", "G", "B", "D"]);
  out.forEach(function (r) {
    console.log(
      "  " +
        (r.primary ? "* " : "  ") +
        r.name.padEnd(10) +
        (r.slash ? "(" + r.slash + ")" : "").padEnd(10) +
        (r.warn
          ? " WARN:" +
            r.warnings
              .map(function (w) {
                return w.id;
              })
              .join(",")
          : ""),
    );
  });
  if (out[0].name !== "Em7")
    throw new Error("FAIL expected Em7 got " + out[0].name);
  if (!out[0].primary) throw new Error("FAIL primary not set");
}

  return analyze;
})();

export { analyze };
