// Module declarations for packages without types
declare module 'verovio' {
	export interface VerovioToolkit {
		loadData(data: string): boolean;
		getPageCount(): number;
		renderToSVG(page: number): string;
		renderToMIDI(): string;
		getElementsAtTime(millisec: number): { notes: string[]; page: number };
		setOptions(options: any): void;
		getVersion(): string;
	}
}

declare module 'verovio/wasm' {
	const createVerovioModule: () => Promise<any>;
	export default createVerovioModule;
}

declare module 'verovio/esm' {
	import type { VerovioToolkit as VT } from 'verovio';
	export class VerovioToolkit implements VT {
		constructor(module: any);
		loadData(data: string): boolean;
		getPageCount(): number;
		renderToSVG(page: number): string;
		renderToMIDI(): string;
		getElementsAtTime(millisec: number): { notes: string[]; page: number };
		setOptions(options: any): void;
		getVersion(): string;
	}
}

declare module '@k-l-lambda/music-widgets/dist/musicWidgetsBrowser.es.js' {
	export const MidiAudio: {
		loadPlugin(options: { soundfontUrl: string; api: string }): Promise<void>;
		noteOn(channel: number, note: number | undefined, velocity: number | undefined, timestamp: number): void;
		noteOff(channel: number, note: number | undefined, timestamp: number): void;
		programChange(channel: number, program: number | undefined): void;
		stopAllNotes?: () => void;
		WebAudio?: {
			needsWarmup?: () => boolean;
			awaitWarmup?: () => Promise<void>;
			getContextState?: () => string | null;
		};
	};
}
