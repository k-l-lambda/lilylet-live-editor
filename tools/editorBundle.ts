// Standalone CodeMirror 6 editor bundle for LilyScript (Gradio app).
//
// LilyScript can't reuse Gradio's gr.Code editor for highlighting (its CodeMirror
// is contentEditable with a private DOMObserver, and the EditorView instance +
// CM modules aren't reachable from an injected script). So we ship our OWN CM6
// editor — the same setup as live-editor's Editor.svelte — as a vendored IIFE,
// reusing live-editor's grammar-derived `lilylet()` highlighter unchanged.
//
// Exposes `window.LilyEditor.mount(container, { value, onChange })` returning a
// small handle { getValue, setValue, destroy }. LilyScript mounts it into a
// gr.HTML div and bridges it to a hidden gr.Textbox (Gradio state).
//
// Build:
//   node_modules/.bin/esbuild tools/editorBundle.ts --bundle --format=iife \
//     --platform=browser --minify --outfile=dist/lyl-editor.bundle.js

import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import { lilylet } from "../src/lib/lilylet/highlight";

interface MountOpts {
	value?: string;
	onChange?: (text: string) => void;
}

interface EditorHandle {
	getValue: () => string;
	setValue: (text: string) => void;
	destroy: () => void;
}

declare global {
	interface Window {
		LilyEditor: {
			mount: (container: HTMLElement, opts?: MountOpts) => EditorHandle;
		};
	}
}

function mount(container: HTMLElement, opts: MountOpts = {}): EditorHandle {
	const onChange = opts.onChange || (() => {});
	let suppress = false; // true while we apply an external setValue (don't echo back)

	const view = new EditorView({
		state: EditorState.create({
			doc: opts.value || "",
			extensions: [
				basicSetup,
				oneDark,
				lilylet(),
				EditorView.lineWrapping,
				EditorView.updateListener.of((u) => {
					if (u.docChanged && !suppress) onChange(u.state.doc.toString());
				}),
			],
		}),
		parent: container,
	});

	return {
		getValue: () => view.state.doc.toString(),
		setValue: (text: string) => {
			const cur = view.state.doc.toString();
			if (cur === text) return; // no-op guard avoids feedback loops
			suppress = true;
			view.dispatch({ changes: { from: 0, to: cur.length, insert: text } });
			suppress = false;
		},
		destroy: () => view.destroy(),
	};
}

window.LilyEditor = { mount };
