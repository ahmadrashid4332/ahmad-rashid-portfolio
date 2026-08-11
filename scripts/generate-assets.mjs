/*
 * Generates the favicon set and the Open Graph image from the design tokens.
 *
 * Run with: npm run assets
 *
 * The outputs are committed, not built on demand. They change perhaps once in
 * the life of the site, and generating them at build time would put a raster
 * pipeline on the critical path for no benefit. This script exists so they are
 * reproducible rather than mystery binaries somebody has to recreate by hand.
 *
 * Colours are copied from src/styles/tokens.css. They are duplicated rather
 * than imported because this runs outside the Astro build with no CSS parser,
 * and three constants are not worth a dependency. If the accent changes, change
 * it here too.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const BG = '#FAFAFA';
const TEXT = '#18181B';
const ACCENT = '#0F6B4B';

const NAME = 'Ahmad Rashid';

/*
 * The OG image carries the NAME ONLY.
 *
 * It deliberately does not carry the positioning sentence. That sentence is
 * CMS-editable and will be refined after launch, while this is a committed
 * asset with no CMS field, so the two would drift apart silently and the link
 * preview would start contradicting the page.
 */

const root = new URL('../', import.meta.url);
const publicDir = fileURLToPath(new URL('public/', root));

mkdirSync(publicDir, { recursive: true });

/**
 * The AR monogram, as SVG markup.
 *
 * Letterforms are drawn as paths rather than set as <text>, because this markup
 * is rasterised by sharp where no font stack is guaranteed, and because the
 * favicon must render identically everywhere. A system font here would resolve
 * differently on every machine that regenerated it.
 *
 * Geometry: two letterforms on a 64 unit grid, stroked rather than filled, so
 * the mark stays legible at 16px where a filled monogram turns to mud.
 */
function monogram({ size, background, foreground, padding = 0.16 }) {
	const inset = size * padding;
	const box = size - inset * 2;
	const stroke = Math.max(1.5, box * 0.085);

	// Letterforms sit on a shared baseline, each in half the available width.
	const top = inset + box * 0.16;
	const bottom = inset + box * 0.86;
	const height = bottom - top;

	// "A": two legs meeting at an apex, with a crossbar.
	const aLeft = inset;
	const aWidth = box * 0.42;
	const aApex = aLeft + aWidth / 2;
	const aCrossY = top + height * 0.66;
	const aCrossInset = aWidth * 0.16;

	// "R": stem, bowl, and a leg kicking out from the bowl's base.
	const rLeft = inset + box * 0.55;
	const rWidth = box * 0.4;
	const rBowlBottom = top + height * 0.52;
	const rBowlWidth = rWidth * 0.82;

	const bg =
		background === 'none'
			? ''
			: `<rect width="${size}" height="${size}" rx="${size * 0.18}" fill="${background}"/>`;

	return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
	${bg}
	<g fill="none" stroke="${foreground}" stroke-width="${stroke}" stroke-linecap="butt" stroke-linejoin="round">
		<path d="M${aLeft} ${bottom} L${aApex} ${top} L${aLeft + aWidth} ${bottom}"/>
		<path d="M${aLeft + aCrossInset} ${aCrossY} L${aLeft + aWidth - aCrossInset} ${aCrossY}"/>
		<path d="M${rLeft} ${bottom} L${rLeft} ${top} L${rLeft + rBowlWidth * 0.72} ${top} A${rBowlWidth * 0.42} ${(rBowlBottom - top) / 2} 0 0 1 ${rLeft + rBowlWidth * 0.72} ${rBowlBottom} L${rLeft} ${rBowlBottom}"/>
		<path d="M${rLeft + rBowlWidth * 0.5} ${rBowlBottom} L${rLeft + rWidth} ${bottom}"/>
	</g>
</svg>`;
}

/*
 * favicon.svg is theme-aware. A single mark that inverts with the viewer's
 * system setting, which is the one thing an SVG favicon can do that a PNG
 * cannot. Transparent background so it sits on the browser's own tab colour.
 */
const faviconSvg = monogram({
	size: 64,
	background: 'none',
	foreground: ACCENT,
}).replace(
	'<g fill="none"',
	`<style>@media (prefers-color-scheme: dark){g{stroke:#4FD6A0}}</style>\n\t<g fill="none"`,
);

writeFileSync(new URL('favicon.svg', `file://${publicDir}`), faviconSvg);

/*
 * The Open Graph image.
 *
 * 1200x630 with every element inside the centred 1080x600 safe zone, which is
 * what platforms crop to. One accent hairline, matching the rationing rule: the
 * accent marks, it never fills.
 *
 * The name is set as <text> here rather than as paths because this is generated
 * once on a machine with fonts, and the result is committed. If it ever renders
 * without a font, the fallback below keeps it legible rather than blank.
 */
const OG_W = 1200;
const OG_H = 630;
const SAFE_X = (OG_W - 1080) / 2;
const SAFE_Y = (OG_H - 600) / 2;

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" viewBox="0 0 ${OG_W} ${OG_H}">
	<rect width="${OG_W}" height="${OG_H}" fill="${BG}"/>
	<text
		x="${SAFE_X + 8}"
		y="${OG_H / 2 + 6}"
		font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
		font-size="96"
		font-weight="600"
		letter-spacing="-2.9"
		fill="${TEXT}"
	>${NAME}</text>
	<rect
		x="${SAFE_X + 8}"
		y="${OG_H / 2 + 44}"
		width="180"
		height="4"
		fill="${ACCENT}"
	/>
	<text
		x="${OG_W - SAFE_X - 8}"
		y="${SAFE_Y + 52}"
		text-anchor="end"
		font-family="Segoe UI, Helvetica Neue, Arial, sans-serif"
		font-size="26"
		font-weight="500"
		fill="#52525B"
	>AR</text>
</svg>`;

const outputs = [
	{ file: 'apple-touch-icon.png', svg: monogram({ size: 180, background: BG, foreground: ACCENT }), w: 180, h: 180 },
	{ file: 'favicon-32.png', svg: monogram({ size: 32, background: BG, foreground: ACCENT }), w: 32, h: 32 },
	{ file: 'og-image.png', svg: ogSvg, w: OG_W, h: OG_H },
];

for (const { file, svg, w, h } of outputs) {
	await sharp(Buffer.from(svg)).resize(w, h).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL(file, `file://${publicDir}`)));
	console.log(`wrote public/${file}  ${w}x${h}`);
}

console.log('wrote public/favicon.svg');
