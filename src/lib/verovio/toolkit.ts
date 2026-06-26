// Verovio Toolkit wrapper for SvelteKit
import type { VerovioToolkit } from 'verovio';

let toolkit: VerovioToolkit | null = null;
let initPromise: Promise<VerovioToolkit> | null = null;

export interface RenderOptions {
	pageWidth?: number;
	pageHeight?: number;
	scale?: number;
	adjustPageHeight?: boolean;
	breaks?: 'auto' | 'none' | 'encoded';
}

const defaultOptions: RenderOptions = {
	pageWidth: 2100,
	pageHeight: 2970,
	scale: 40,
	adjustPageHeight: true,
	breaks: 'auto'
};

export async function initVerovio(): Promise<VerovioToolkit> {
	if (toolkit) return toolkit;

	if (initPromise) return initPromise;

	initPromise = (async () => {
		// Import the WASM module and toolkit separately for browser compatibility
		const createVerovioModule = (await import('verovio/wasm')).default;
		const { VerovioToolkit } = await import('verovio/esm');

		// Initialize the WASM module
		const VerovioModule = await createVerovioModule();

		toolkit = new VerovioToolkit(VerovioModule);
		toolkit.setOptions(defaultOptions);

		console.log('Verovio initialized:', toolkit.getVersion());
		return toolkit;
	})();

	return initPromise;
}

export function getToolkit(): VerovioToolkit | null {
	return toolkit;
}

/**
 * Stack every Verovio page vertically into a single SVG.
 *
 * Verovio paginates a long score into N pages; rendering only page 1 (the old
 * behaviour) silently dropped everything past the first page — and the editor's
 * "make one giant page" trick breaks once the computed pageHeight exceeds
 * Verovio's hard max of 60000 (it then falls back to the 2970 default and splits
 * into several pages). Stacking is robust regardless of page count or height.
 *
 * Each page is a self-contained `<svg width="Wpx" height="Hpx" ...>` whose inner
 * `<svg class="definition-scale" viewBox=...>` maps the engraving coordinate space
 * into that pixel box. We keep each page's outer <svg> intact (so its own scaling
 * is preserved) and place pages as nested <svg> elements positioned with x/y inside
 * one wrapper <svg> — nested <svg> is valid SVG and positions via x/y (a <g
 * transform> cannot reposition a bare inner <svg>, which has no width/height of its
 * own and would otherwise collapse/overlap). All element ids stay globally unique
 * across pages and the glyph <defs> ids are keyed to the shared toolkit instance,
 * so <use xlink:href> still resolves and click-to-seek / the cursor keep working.
 */
function stackPagesVertically(pages: string[]): string {
	if (pages.length === 0) return '';
	if (pages.length === 1) return pages[0];

	const PAGE_GAP = 40; // px of whitespace between stacked pages

	const dim = (svg: string, attr: 'width' | 'height'): number => {
		const m = svg.match(new RegExp(`<svg\\b[^>]*\\b${attr}="(\\d+(?:\\.\\d+)?)px"`));
		return m ? parseFloat(m[1]) : 0;
	};

	const widths = pages.map((p) => dim(p, 'width'));
	const heights = pages.map((p) => dim(p, 'height'));
	const totalWidth = Math.max(...widths, 1);
	const totalHeight = heights.reduce((a, b) => a + b, 0) + PAGE_GAP * (pages.length - 1);

	const parts: string[] = [
		`<svg width="${totalWidth}px" height="${totalHeight}px" viewBox="0 0 ${totalWidth} ${totalHeight}" ` +
			`version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" overflow="visible">`
	];
	let y = 0;
	for (let i = 0; i < pages.length; i++) {
		// Reposition this page's outer <svg> with x/y so it sits below the previous
		// one. Strip any pre-existing x/y, then inject ours right after `<svg`.
		const positioned = pages[i].replace(
			/<svg\b([^>]*)>/,
			(_m, attrs) => `<svg${attrs.replace(/\s+x="[^"]*"/, '').replace(/\s+y="[^"]*"/, '')} x="0" y="${y}">`
		);
		parts.push(positioned);
		y += heights[i] + PAGE_GAP;
	}
	parts.push('</svg>');
	return parts.join('\n');
}

/**
 * Render the currently-loaded score's pages into one vertically-stacked SVG.
 * The toolkit must already have data loaded (call after loadData).
 */
export function renderStackedSVG(tk: VerovioToolkit): string {
	const pageCount = tk.getPageCount();
	const pages: string[] = [];
	for (let p = 1; p <= pageCount; p++) pages.push(tk.renderToSVG(p));
	return stackPagesVertically(pages);
}

export async function renderMEI(
	mei: string,
	options?: Partial<RenderOptions>
): Promise<{ svg: string; pageCount: number; midi?: string }> {
	const tk = await initVerovio();

	if (options) {
		tk.setOptions({ ...defaultOptions, ...options });
	}

	const success = tk.loadData(mei);
	if (!success) {
		throw new Error('Failed to load MEI data');
	}

	const pageCount = tk.getPageCount();
	const svg = renderStackedSVG(tk);

	return { svg, pageCount };
}

export async function renderToMIDI(mei: string): Promise<string> {
	const tk = await initVerovio();
	tk.loadData(mei);
	return tk.renderToMIDI();
}

export async function getElementsAtTime(millisec: number): Promise<{
	notes: string[];
	page: number;
}> {
	const tk = await initVerovio();
	return tk.getElementsAtTime(millisec);
}
