import { writable, derived, type Writable, type Readable } from 'svelte/store';

export interface EditorState {
	code: string;
	error: string | null;
	mei: string | null;
	svg: string | null;
	pageCount: number;
	isRendering: boolean;
	cursorElementId: string | null;
}

// Sample Lilylet code demonstrating basic syntax
const initialState: EditorState = {
	code: `\\key c \\major
\\time 4/4

c'4 d' e' f' | %1

g'4 a' b' c'' | %2

<c' e' g'>2 <d' f' a'>2 | %3

c''1 | %4
`,
	error: null,
	mei: null,
	svg: null,
	pageCount: 0,
	isRendering: false,
	cursorElementId: null
};

function createEditorStore() {
	const { subscribe, set, update }: Writable<EditorState> = writable(initialState);

	return {
		subscribe,
		setCode: (code: string) => update((s) => ({ ...s, code })),
		setMEI: (mei: string) => update((s) => ({ ...s, mei })),
		setSVG: (svg: string, pageCount: number) =>
			update((s) => ({ ...s, svg, pageCount, error: null })),
		setError: (error: string) => update((s) => ({ ...s, error, svg: null })),
		setRendering: (isRendering: boolean) => update((s) => ({ ...s, isRendering })),
		setCursorElement: (cursorElementId: string | null) => update((s) => ({ ...s, cursorElementId })),
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
