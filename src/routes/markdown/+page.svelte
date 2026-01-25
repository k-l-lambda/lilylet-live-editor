<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import MarkdownIt from 'markdown-it';
	import lilyletPlugin from '@k-l-lambda/lilylet-markdown';
	import { initVerovio, getToolkit } from '$lib/verovio/toolkit';

	let markdownInput = `# Lilylet in Markdown Demo

This demonstrates embedding **Lilylet music notation** in Markdown documents.

## Simple Scale

\`\`\`lilylet
\\key c \\major
\\time 4/4

c'4 d' e' f' | g' a' b' c'' | c''1
\`\`\`

## Chord Progression

\`\`\`lyl
<c' e' g'>2 <d' f' a'>2 | <e' g' b'>2 <f' a' c''>2 | <g' b' d''>1
\`\`\`

## Mixed Content

Here's some regular text with inline \`code\` and a music example:

\`\`\`lilylet
\\time 3/4
d'4 g' b' | d''2.
\`\`\`

And we can continue with more markdown content...

- List item 1
- List item 2
- List item 3

## Code Block (non-music)

\`\`\`javascript
console.log('Hello, Lilylet!');
\`\`\`
`;

	let renderedHtml = '';
	let verovioReady = false;
	let md: MarkdownIt;

	function renderMarkdown() {
		if (!md) return;
		renderedHtml = md.render(markdownInput);

		// After rendering, process lilylet placeholders with Verovio
		if (browser && verovioReady) {
			setTimeout(renderLilyletBlocks, 0);
		}
	}

	async function renderLilyletBlocks() {
		const toolkit = getToolkit();
		if (!toolkit) return;

		const container = document.querySelector('.preview-content');
		if (!container) return;

		// Find all lilylet placeholders (pending ones that need rendering)
		const placeholders = container.querySelectorAll('[data-lilylet-pending]');

		for (const el of placeholders) {
			const mei = el.getAttribute('data-mei');
			if (!mei) continue;

			try {
				toolkit.setOptions({
					scale: 40,
					adjustPageHeight: true,
					pageWidth: 1200
				});

				const loaded = toolkit.loadData(mei);
				if (loaded) {
					const svg = toolkit.renderToSVG(1);
					el.innerHTML = svg;
					el.removeAttribute('data-lilylet-pending');
					el.setAttribute('data-lilylet', '');
				}
			} catch (err) {
				console.error('Failed to render lilylet block:', err);
				el.innerHTML = `<pre class="error">Error: ${err}</pre>`;
			}
		}
	}

	onMount(async () => {
		if (!browser) return;

		// Initialize markdown-it with lilylet plugin
		md = new MarkdownIt({
			html: true,
			linkify: true,
			typographer: true
		});
		md.use(lilyletPlugin);

		// Initial render (without Verovio)
		renderMarkdown();

		// Initialize Verovio
		try {
			await initVerovio();
			verovioReady = true;
			// Re-render with Verovio
			renderLilyletBlocks();
		} catch (err) {
			console.error('Failed to initialize Verovio:', err);
		}
	});

	$: if (browser && md) {
		renderMarkdown();
	}
</script>

<svelte:head>
	<title>Lilylet Markdown Demo</title>
</svelte:head>

<div class="app">
	<header>
		<h1>Lilylet Markdown Demo</h1>
		<nav>
			<a href="/">Live Editor</a>
			<span class="current">Markdown</span>
		</nav>
		<span class="status">
			{#if !verovioReady}
				Loading Verovio...
			{:else}
				Ready
			{/if}
		</span>
	</header>

	<main>
		<div class="pane editor-pane">
			<div class="pane-header">Markdown Source</div>
			<textarea
				class="markdown-editor"
				bind:value={markdownInput}
				spellcheck="false"
			></textarea>
		</div>
		<div class="divider"></div>
		<div class="pane preview-pane">
			<div class="pane-header">Preview</div>
			<div class="preview-content">
				{@html renderedHtml}
			</div>
		</div>
	</main>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		height: 100vh;
		overflow: hidden;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		background: #333333;
		border-bottom: 1px solid #454545;
	}

	h1 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: #ffffff;
	}

	nav {
		display: flex;
		gap: 16px;
	}

	nav a {
		color: #858585;
		text-decoration: none;
		font-size: 14px;
	}

	nav a:hover {
		color: #d4d4d4;
	}

	nav .current {
		color: #0e639c;
		font-weight: 600;
		font-size: 14px;
	}

	.status {
		font-size: 12px;
		color: #858585;
	}

	main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.pane {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.pane-header {
		padding: 8px 12px;
		background: #252526;
		border-bottom: 1px solid #454545;
		font-size: 12px;
		color: #858585;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.editor-pane {
		flex: 0 0 40%;
		min-width: 300px;
	}

	.preview-pane {
		flex: 1;
	}

	.markdown-editor {
		flex: 1;
		width: 100%;
		padding: 16px;
		background: #1e1e1e;
		color: #d4d4d4;
		border: none;
		resize: none;
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 14px;
		line-height: 1.6;
		outline: none;
	}

	.preview-content {
		flex: 1;
		padding: 24px;
		overflow: auto;
		background: #ffffff;
		color: #333333;
	}

	.divider {
		width: 4px;
		background: #333333;
		cursor: col-resize;
	}

	.divider:hover {
		background: #0078d4;
	}

	/* Markdown preview styles */
	.preview-content :global(h1) {
		font-size: 2em;
		margin: 0 0 0.5em 0;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.3em;
	}

	.preview-content :global(h2) {
		font-size: 1.5em;
		margin: 1em 0 0.5em 0;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.3em;
	}

	.preview-content :global(h3) {
		font-size: 1.25em;
		margin: 1em 0 0.5em 0;
	}

	.preview-content :global(p) {
		margin: 0.5em 0;
		line-height: 1.6;
	}

	.preview-content :global(code) {
		background: #f4f4f4;
		padding: 2px 6px;
		border-radius: 3px;
		font-family: 'Fira Code', 'Consolas', monospace;
		font-size: 0.9em;
	}

	.preview-content :global(pre) {
		background: #f4f4f4;
		padding: 16px;
		border-radius: 6px;
		overflow-x: auto;
	}

	.preview-content :global(pre code) {
		background: none;
		padding: 0;
	}

	.preview-content :global(ul), .preview-content :global(ol) {
		padding-left: 2em;
		margin: 0.5em 0;
	}

	.preview-content :global(li) {
		margin: 0.25em 0;
	}

	/* Lilylet container styles */
	.preview-content :global(.lilylet-container) {
		margin: 1em 0;
		padding: 16px;
		background: #fafafa;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		text-align: center;
	}

	.preview-content :global(.lilylet-container svg) {
		max-width: 100%;
		height: auto;
	}

	.preview-content :global(.lilylet-container code) {
		display: block;
		text-align: left;
		color: #666;
		font-size: 12px;
	}

	.preview-content :global(.lilylet-error) {
		margin: 1em 0;
		padding: 16px;
		background: #fff0f0;
		border: 1px solid #ffcccc;
		border-radius: 8px;
		color: #cc0000;
	}
</style>
