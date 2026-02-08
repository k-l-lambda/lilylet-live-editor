<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { editorStore } from '$lib/stores/editor';
	import { lilylet } from '$lib/lilylet/highlight';

	const dispatch = createEventDispatcher<{ filedrop: File }>();

	let editorContainer: HTMLDivElement;
	let view: EditorView | null = null;
	let storeUnsubscribe: (() => void) | null = null;

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Track if the editor is the source of the change
	let isEditorUpdate = false;

	// Check if a file is a supported music file
	function isMusicFile(fileName: string): boolean {
		const lower = fileName.toLowerCase();
		return lower.endsWith('.lyl') ||
			lower.endsWith('.ly') || lower.endsWith('.ily') ||
			lower.endsWith('.musicxml') || lower.endsWith('.mxl') ||
			(lower.endsWith('.xml') && !lower.endsWith('.mei.xml')) ||
			lower.endsWith('.abc');
	}

	// Extension to intercept drop events for music files
	const dropHandler = EditorView.domEventHandlers({
		drop(event: DragEvent) {
			const files = event.dataTransfer?.files;
			if (files && files.length > 0) {
				const file = files[0];
				if (isMusicFile(file.name)) {
					event.preventDefault();
					event.stopPropagation();
					dispatch('filedrop', file);
					return true;
				}
			}
			return false;
		}
	});

	function handleUpdate(update: any) {
		if (update.docChanged) {
			const code = update.state.doc.toString();

			// Mark that the editor is updating the store
			isEditorUpdate = true;

			// Debounce the store update
			if (debounceTimer) clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				editorStore.setCode(code);
				// Reset flag after the store update is dispatched
				setTimeout(() => {
					isEditorUpdate = false;
				}, 0);
			}, 300);
		}
	}

	function setEditorContent(code: string) {
		if (!view) return;

		const currentContent = view.state.doc.toString();
		if (currentContent !== code) {
			view.dispatch({
				changes: {
					from: 0,
					to: currentContent.length,
					insert: code
				}
			});
		}
	}

	onMount(async () => {
		// Get initial code from store
		let initialCode = '';
		const initUnsubscribe = editorStore.subscribe((state) => {
			initialCode = state.code;
		});
		initUnsubscribe();

		const state = EditorState.create({
			doc: initialCode,
			extensions: [
				basicSetup,
				oneDark,
				lilylet(),
				EditorView.updateListener.of(handleUpdate),
				EditorView.lineWrapping,
				dropHandler
			]
		});

		view = new EditorView({
			state,
			parent: editorContainer
		});

		// Subscribe to store changes to handle external updates (like URL loading)
		storeUnsubscribe = editorStore.subscribe((state) => {
			// Only update if the change came from outside the editor
			if (!isEditorUpdate && view) {
				const currentContent = view.state.doc.toString();
				if (currentContent !== state.code) {
					setEditorContent(state.code);
				}
			}
		});
	});

	onDestroy(() => {
		if (debounceTimer) clearTimeout(debounceTimer);
		if (storeUnsubscribe) storeUnsubscribe();
		view?.destroy();
	});
</script>

<div class="editor-wrapper">
	<div class="editor-header">
		<span class="title">Lilylet Editor</span>
	</div>
	<div class="editor-container" bind:this={editorContainer}></div>
</div>

<style>
	.editor-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #282c34;
	}

	.editor-header {
		padding: 8px 16px;
		background: #21252b;
		border-bottom: 1px solid #181a1f;
	}

	.title {
		color: #abb2bf;
		font-size: 14px;
		font-weight: 500;
	}

	.editor-container {
		flex: 1;
		overflow: auto;
	}

	.editor-container :global(.cm-editor) {
		height: 100%;
	}

	.editor-container :global(.cm-scroller) {
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 14px;
	}
</style>
