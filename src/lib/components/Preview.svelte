<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { editorStore } from '$lib/stores/editor';
	import Player from './Player.svelte';
	import { tick } from 'svelte';

	let svgContainer: HTMLDivElement;
	let previewContainer: HTMLDivElement;
	let cursorElement: HTMLDivElement;
	let cursorStyle = '';
	let lastRenderedSvg = '';
	let resizeObserver: ResizeObserver | null = null;

	/**
	 * Safely inject SVG content using DOMParser.
	 * This extracts only the SVG element from the content, avoiding potential XSS vectors.
	 */
	function safelyInjectSvg(container: HTMLDivElement, svgString: string) {
		// Parse the SVG string
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgString, 'image/svg+xml');

		// Check for parse errors
		const parseError = doc.querySelector('parsererror');
		if (parseError) {
			console.error('SVG parse error:', parseError.textContent);
			return;
		}

		// Get the SVG element
		const svgElement = doc.querySelector('svg');
		if (!svgElement) {
			console.error('No SVG element found in content');
			return;
		}

		// Clear container and append the sanitized SVG
		container.innerHTML = '';
		container.appendChild(document.importNode(svgElement, true));
	}

	$: if (svgContainer && $editorStore.svg && $editorStore.svg !== lastRenderedSvg) {
		safelyInjectSvg(svgContainer, $editorStore.svg);
		lastRenderedSvg = $editorStore.svg;
	}

	// Update cursor position when cursorElementId changes
	$: if ($editorStore.cursorElementId && svgContainer) {
		updateCursorPosition($editorStore.cursorElementId);
	} else {
		cursorStyle = 'display: none;';
	}

	async function updateCursorPosition(elementId: string) {
		await tick(); // Ensure DOM is updated

		// Use scoped query within svgContainer for safety
		const noteElement = svgContainer?.querySelector(`#${CSS.escape(elementId)}`);
		if (!noteElement || !svgContainer) {
			cursorStyle = 'display: none;';
			return;
		}

		// Find the parent system element to get proper height bounds
		let systemElement = noteElement.closest('.system');
		if (!systemElement) {
			// Fallback: try to find staff
			systemElement = noteElement.closest('.staff');
		}

		const svgRect = svgContainer.getBoundingClientRect();
		const noteRect = noteElement.getBoundingClientRect();

		// Calculate x position relative to SVG container
		const x = noteRect.left - svgRect.left;

		// Calculate y and height based on system/staff bounds
		let top = 0;
		let height = svgRect.height;

		if (systemElement) {
			const systemRect = systemElement.getBoundingClientRect();
			top = systemRect.top - svgRect.top;
			height = systemRect.height;
		}

		cursorStyle = `left: ${x}px; top: ${top}px; height: ${height}px; display: block;`;
	}

	function downloadFile(content: string, filename: string, mimeType: string) {
		const blob = new Blob([content], { type: mimeType });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function exportSVG() {
		if ($editorStore.svg) {
			downloadFile($editorStore.svg, 'lilylet-score.svg', 'image/svg+xml');
		}
	}

	function exportMEI() {
		if ($editorStore.mei) {
			downloadFile($editorStore.mei, 'lilylet-score.mei', 'application/xml');
		}
	}

	function copyMEI() {
		if ($editorStore.mei) {
			navigator.clipboard.writeText($editorStore.mei).then(() => {
				// Could add a toast notification here
			});
		}
	}

	function handleContainerResize() {
		if (!previewContainer) return;
		const newWidth = previewContainer.clientWidth;
		// Only update if significant change (more than 20px)
		if (Math.abs(newWidth - $editorStore.previewWidth) > 20) {
			editorStore.setPreviewWidth(newWidth);
		}
	}

	onMount(() => {
		if (previewContainer) {
			// Set initial width
			editorStore.setPreviewWidth(previewContainer.clientWidth);

			// Set up ResizeObserver
			resizeObserver = new ResizeObserver(() => {
				handleContainerResize();
			});
			resizeObserver.observe(previewContainer);
		}
	});

	onDestroy(() => {
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
	});
</script>

<div class="preview-wrapper">
	<div class="preview-header">
		<span class="title">Preview</span>
		{#if $editorStore.isRendering}
			<span class="rendering">Rendering...</span>
		{/if}
		<div class="spacer"></div>
		<div class="export-buttons">
			<button class="export-btn" on:click={exportSVG} disabled={!$editorStore.svg} title="Download SVG">
				SVG
			</button>
			<button class="export-btn" on:click={exportMEI} disabled={!$editorStore.mei} title="Download MEI">
				MEI
			</button>
			<button class="export-btn" on:click={copyMEI} disabled={!$editorStore.mei} title="Copy MEI to clipboard">
				Copy
			</button>
		</div>
	</div>

	<div class="preview-container" bind:this={previewContainer}>
		{#if !$editorStore.verovioReady}
			<div class="loading-container">
				<div class="loading-spinner">
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
					<div class="spinner-ring"></div>
				</div>
				<p class="loading-text">Loading Verovio...</p>
			</div>
		{:else if $editorStore.error}
			<div class="error-message">
				<div class="error-title">Error</div>
				<pre>{$editorStore.error}</pre>
			</div>
		{:else if $editorStore.svg}
			<div class="svg-wrapper">
				<div class="svg-container" bind:this={svgContainer}></div>
				<div class="playback-cursor" bind:this={cursorElement} style={cursorStyle}></div>
			</div>
		{:else}
			<div class="placeholder">
				<p>Enter Lilylet code to see the rendered score</p>
			</div>
		{/if}
	</div>

	<!-- Player controls at bottom -->
	{#if $editorStore.svg && !$editorStore.error}
		<Player />
	{/if}
</div>

<style>
	.preview-wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #1e1e1e;
	}

	.preview-header {
		padding: 8px 16px;
		background: #252526;
		border-bottom: 1px solid #1e1e1e;
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.title {
		color: #cccccc;
		font-size: 14px;
		font-weight: 500;
	}

	.rendering {
		color: #569cd6;
		font-size: 12px;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.preview-container {
		flex: 1;
		overflow: auto;
		padding: 16px;
		display: flex;
		justify-content: center;
		align-items: flex-start;
	}

	.svg-wrapper {
		position: relative;
	}

	.svg-container {
		background: white;
		padding: 20px;
		border-radius: 4px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.svg-container :global(svg) {
		max-width: 100%;
		height: auto;
	}

	.playback-cursor {
		position: absolute;
		width: 2px;
		background: rgba(0, 122, 204, 0.8);
		pointer-events: none;
		z-index: 10;
		display: none;
	}

	.error-message {
		background: #5a1d1d;
		border: 1px solid #be1100;
		border-radius: 4px;
		padding: 16px;
		max-width: 600px;
	}

	.error-title {
		color: #f48771;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.error-message pre {
		color: #d4d4d4;
		font-size: 12px;
		white-space: pre-wrap;
		word-break: break-all;
		margin: 0;
	}

	.placeholder {
		color: #858585;
		text-align: center;
		padding: 40px;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px;
	}

	.loading-spinner {
		position: relative;
		width: 60px;
		height: 60px;
	}

	.spinner-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 3px solid transparent;
		animation: spin 1.5s linear infinite;
	}

	.spinner-ring:nth-child(1) {
		border-top-color: #569cd6;
		animation-delay: 0s;
	}

	.spinner-ring:nth-child(2) {
		width: 80%;
		height: 80%;
		top: 10%;
		left: 10%;
		border-right-color: #4ec9b0;
		animation-delay: 0.15s;
		animation-direction: reverse;
	}

	.spinner-ring:nth-child(3) {
		width: 60%;
		height: 60%;
		top: 20%;
		left: 20%;
		border-bottom-color: #ce9178;
		animation-delay: 0.3s;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		margin-top: 20px;
		color: #858585;
		font-size: 14px;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.spacer {
		flex: 1;
	}

	.export-buttons {
		display: flex;
		gap: 8px;
	}

	.export-btn {
		background: #0e639c;
		color: #ffffff;
		border: none;
		padding: 4px 12px;
		border-radius: 3px;
		font-size: 12px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.export-btn:hover:not(:disabled) {
		background: #1177bb;
	}

	.export-btn:disabled {
		background: #3c3c3c;
		color: #858585;
		cursor: not-allowed;
	}

	.export-btn:active:not(:disabled) {
		background: #094771;
	}
</style>
