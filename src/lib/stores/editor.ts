import { writable, derived, type Writable, type Readable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'lilylet-editor-code';

export interface LogEntry {
	timestamp: Date;
	level: 'info' | 'warning' | 'error';
	message: string;
}

export interface EditorState {
	code: string;
	error: string | null;
	mei: string | null;
	svg: string | null;
	pageCount: number;
	isRendering: boolean;
	verovioReady: boolean;
	cursorElementId: string | null;
	previewWidth: number;
	logs: LogEntry[];
	logsExpanded: boolean;
}

// Sample Lilylet code demonstrating basic syntax
const defaultCode = `[title "Jesu, meine Freude"]
[subtitle "BWV 610"]
[composer "J.S. Bach"]

\\staff "1" \\key c \\minor \\time 4/4 \\clef "treble" \\stemUp g'4 g f ef \\\\
\\staff "1" \\stemDown ef16[ d ef8]~ ef16[ f ef d] c8[ d]~ d[ c] \\\\
\\staff "2" \\clef "bass" c16[ b c8]~ c16[ b c g] a8[ g]~ g16[ g af ef] \\\\
\\staff "3" \\clef "bass" r8 c,16[ d] ef[ d ef8]~ ef16[ a, b g] c[ b c8] | % 1

\\staff "1" \\stemUp d2 c\\fermata \\\\
\\staff "1" \\stemDown c8[ c4 b8] c8.[ \\staff "2" \\stemUp g16] \\staff "1" c[ b c d] \\\\
\\staff "2" f,16[ ef f d] g[ af g f] ef[ d ef8]~ ef16[ f ef d] \\\\
\\staff "3" r16 g,[ af f] g[ f g8] c,2 | % 2
`;

// Load saved code from localStorage (browser only)
function loadSavedCode(): string {
	if (browser) {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) return saved;
	}
	return defaultCode;
}

// Save code to localStorage (browser only)
function saveCode(code: string): void {
	if (browser) {
		localStorage.setItem(STORAGE_KEY, code);
	}
}

const initialState: EditorState = {
	code: defaultCode, // Will be updated in browser
	error: null,
	mei: null,
	svg: null,
	pageCount: 0,
	isRendering: false,
	verovioReady: false,
	cursorElementId: null,
	previewWidth: 800,
	logs: [],
	logsExpanded: false
};

function createEditorStore() {
	const { subscribe, set, update }: Writable<EditorState> = writable(initialState);

	// Load saved code in browser
	if (browser) {
		const savedCode = loadSavedCode();
		if (savedCode !== defaultCode) {
			update((s) => ({ ...s, code: savedCode }));
		}
	}

	return {
		subscribe,
		setCode: (code: string) => {
			saveCode(code);
			update((s) => ({ ...s, code }));
		},
		setMEI: (mei: string) => update((s) => ({ ...s, mei })),
		setSVG: (svg: string, pageCount: number) =>
			update((s) => ({ ...s, svg, pageCount, error: null })),
		setError: (error: string) => update((s) => ({ ...s, error, svg: null })),
		setRendering: (isRendering: boolean) => update((s) => ({ ...s, isRendering })),
		setVerovioReady: (verovioReady: boolean) => update((s) => ({ ...s, verovioReady })),
		setCursorElement: (cursorElementId: string | null) => update((s) => ({ ...s, cursorElementId })),
		setPreviewWidth: (previewWidth: number) => update((s) => ({ ...s, previewWidth })),
		addLog: (level: LogEntry['level'], message: string) => update((s) => {
			const newLog: LogEntry = { timestamp: new Date(), level, message };
			const newLogs = [...s.logs, newLog].slice(-100); // Keep last 100 logs
			// Auto-expand on error
			const shouldExpand = level === 'error' ? true : s.logsExpanded;
			return { ...s, logs: newLogs, logsExpanded: shouldExpand };
		}),
		setLogsExpanded: (expanded: boolean) => update((s) => ({ ...s, logsExpanded: expanded })),
		clearLogs: () => update((s) => ({ ...s, logs: [] })),
		reset: () => set(initialState)
	};
}

export const editorStore = createEditorStore();

// Derived store for checking if we have valid output
export const hasOutput: Readable<boolean> = derived(editorStore, ($state) => $state.svg !== null);

// Derived store for checking if there's an error
export const hasError: Readable<boolean> = derived(
	editorStore,
	($state) => $state.error !== null
);
