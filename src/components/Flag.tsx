import type { Locale } from '../i18n/i18n';

// Broken or solid bar of a trigram, 6 wide, centred on x = 0
const bar = (y: number, broken: boolean) => broken
  ? <><rect x={-3} y={y} width={2.5} height={1.2} /><rect x={0.5} y={y} width={2.5} height={1.2} /></>
  : <rect x={-3} y={y} width={6} height={1.2} />;

/** ☰ ☵ ☲ ☷ in the order geon, gam, ri, gon; true = broken bar */
const TRIGRAMS: Array<[boolean, boolean, boolean]> = [[false, false, false], [true, false, true], [false, true, false], [true, true, true]];
// upper left, upper right, lower left, lower right; the bars run across the line to the centre
const PLACES: Array<[number, number, number]> = [[-9, -6, -56.3], [9, -6, 56.3], [-9, 6, 56.3], [9, 6, -56.3]];

function Korea() {
  return (
    <g transform="translate(18 12)">
      <g transform="rotate(-33.7)">
        <circle r="6" fill="#0047a0" />
        <path d="M-6 0A6 6 0 0 1 6 0A3 3 0 0 1 0 0A3 3 0 0 0-6 0Z" fill="#cd2e3a" />
      </g>
      {TRIGRAMS.map((bars, i) => (
        <g key={i} transform={`translate(${PLACES[i][0]} ${PLACES[i][1]}) rotate(${PLACES[i][2]})`} fill="#111">
          {bars.map((broken, j) => <g key={j}>{bar(-2.1 + j * 2.1 - 0.6, broken)}</g>)}
        </g>
      ))}
    </g>
  );
}

// Five-pointed star centred on (cx, cy)
const star = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = (Math.PI / 5) * i - Math.PI / 2;
  const d = i % 2 ? r * 0.382 : r;
  return `${(cx + d * Math.cos(a)).toFixed(2)},${(cy + d * Math.sin(a)).toFixed(2)}`;
}).join(' ');

/** 13 stripes and a canton of 50 stars, in 9 rows of 6 and 5 */
function USA() {
  const stripe = 24 / 13;
  const cw = 14.4, ch = stripe * 7;
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => <rect key={i} y={i * 2 * stripe} width="36" height={stripe + 0.02} fill="#b22234" />)}
      <rect width={cw} height={ch} fill="#3c3b6e" />
      {Array.from({ length: 9 }, (_, row) => Array.from({ length: row % 2 ? 5 : 6 }, (_, col) => (
        <polygon key={`${row}-${col}`} points={star(cw / 12 * (row % 2 ? 2 + col * 2 : 1 + col * 2), ch / 10 * (row + 1), 0.62)} fill="#fff" />
      )))}
    </>
  );
}

/** Flag of the locale's country as inline SVG, so it renders the same on every system */
export function Flag({ locale, className }: { locale: Locale; className?: string }) {
  return (
    <svg className={className} width="21" height="14" viewBox="0 0 36 24" aria-hidden="true">
      <clipPath id={`flag-${locale}`}><rect width="36" height="24" rx="3" /></clipPath>
      <g clipPath={`url(#flag-${locale})`}>
        <rect width="36" height="24" fill="#fff" />
        {locale === 'ko' ? <Korea /> : <USA />}
      </g>
      <rect x="0.5" y="0.5" width="35" height="23" rx="2.5" fill="none" stroke="#fff" strokeOpacity="0.16" />
    </svg>
  );
}
