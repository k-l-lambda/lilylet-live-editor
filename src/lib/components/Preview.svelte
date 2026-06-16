<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { editorStore } from '$lib/stores/editor';
	import Player from './Player.svelte';
	import { tick } from 'svelte';
	import { lilyletToLilyPond, lilyletToMusicXml } from '$lib/lilylet';
	import { getToolkit } from '$lib/verovio/toolkit';

	let svgContainer: HTMLDivElement;
	let previewContainer: HTMLDivElement;
	let cursorElement: HTMLDivElement;
	let cursorStyle = '';
	let lastRenderedSvg = '';
	let resizeObserver: ResizeObserver | null = null;
	let exportMenuOpen = false;
	let lastAutoScrollTime = 0;
	let lastUserScrollTime = 0;
	let autoScrollUntil = 0;

	const AUTO_SCROLL_THROTTLE_MS = 350;
	const USER_SCROLL_PAUSE_MS = 2500;
	const AUTO_SCROLL_MARGIN = 96;

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
		scrollCursorIntoView(noteElement);
	}

	function scrollCursorIntoView(element: Element) {
		if (!previewContainer) return;

		const now = performance.now();
		if (now - lastAutoScrollTime < AUTO_SCROLL_THROTTLE_MS) return;
		if (now - lastUserScrollTime < USER_SCROLL_PAUSE_MS) return;

		const containerRect = previewContainer.getBoundingClientRect();
		const elementRect = element.getBoundingClientRect();
		const above = elementRect.top < containerRect.top + AUTO_SCROLL_MARGIN;
		const below = elementRect.bottom > containerRect.bottom - AUTO_SCROLL_MARGIN;

		if (!above && !below) return;

		lastAutoScrollTime = now;
		autoScrollUntil = now + 500;
		const targetTop = previewContainer.scrollTop
			+ (elementRect.top - containerRect.top)
			- previewContainer.clientHeight * 0.35;

		previewContainer.scrollTo({
			top: Math.max(0, targetTop),
			behavior: 'smooth'
		});
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

	function exportLilyPond() {
		if ($editorStore.code) {
			const result = lilyletToLilyPond($editorStore.code);
			if (result.success) {
				downloadFile(result.data, 'lilylet-score.ly', 'text/x-lilypond');
			} else {
				console.error('LilyPond export failed:', result.error);
			}
		}
	}

	function exportMusicXml() {
		if ($editorStore.code) {
			const result = lilyletToMusicXml($editorStore.code);
			if (result.success) {
				downloadFile(result.data, 'lilylet-score.musicxml', 'application/vnd.recordare.musicxml+xml');
			} else {
				console.error('MusicXML export failed:', result.error);
			}
		}
	}

	function toggleExportMenu() {
		exportMenuOpen = !exportMenuOpen;
	}

	function closeExportMenu() {
		exportMenuOpen = false;
	}

	function handleExport(type: string) {
		switch (type) {
			case 'svg':
				exportSVG();
				break;
			case 'lilypond':
				exportLilyPond();
				break;
			case 'musicxml':
				exportMusicXml();
				break;
			case 'mei':
				exportMEI();
				break;
		}
		closeExportMenu();
	}

	function handleContainerResize() {
		if (!previewContainer) return;
		const newWidth = previewContainer.clientWidth;
		// Only update if significant change (more than 20px)
		if (Math.abs(newWidth - $editorStore.previewWidth) > 20) {
			editorStore.setPreviewWidth(newWidth);
		}
	}

	function handleScoreClick(event: MouseEvent) {
		const toolkit = getToolkit();
		if (!toolkit || !svgContainer) return;

		const target = event.target instanceof Element
			? event.target.closest('.note, .chord, .rest, .mRest, .mSpace')
			: null;
		if (!target || !svgContainer.contains(target)) return;

		const id = target.id;
		if (!id) return;

		const time = toolkit.getTimeForElement(id);
		editorStore.requestSeek(time);
	}

	function handleContainerScroll() {
		if (performance.now() > autoScrollUntil) {
			lastUserScrollTime = performance.now();
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
		{#if $editorStore.soundfontLoading || $editorStore.soundfontReady}
			<!-- Sound-library status: grayscaled + dim + pulsing while the GM
			     soundfont loads (piano fallback active), full-color steady
			     piano once ready. -->
			<span
				class="sf-status"
				class:ready={$editorStore.soundfontReady}
				title={$editorStore.soundfontReady
					? 'Sound library ready'
					: 'Loading sound library… (piano fallback active)'}
			>🎹</span>
		{/if}
		{#if $editorStore.isRendering}
			<span class="rendering">Rendering...</span>
		{/if}
		<div class="spacer"></div>
		<div class="export-dropdown">
			<button class="export-toggle" on:click={toggleExportMenu}>
				Export ▾
			</button>
			{#if exportMenuOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
				<div class="export-backdrop" on:click={closeExportMenu}></div>
				<div class="export-menu">
					<button
						class="export-item"
						on:click={() => handleExport('svg')}
					>
						SVG
					</button>
					<button
						class="export-item"
						on:click={() => handleExport('lilypond')}
						disabled={!$editorStore.code}
					>
						LilyPond (.ly)
					</button>
					<button
						class="export-item"
						on:click={() => handleExport('musicxml')}
						disabled={!$editorStore.code}
					>
						MusicXML
					</button>
					<button
						class="export-item"
						on:click={() => handleExport('mei')}
						disabled={!$editorStore.mei}
					>
						MEI
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="preview-container" bind:this={previewContainer} on:scroll={handleContainerScroll}>
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
				<div class="svg-container" bind:this={svgContainer} on:click={handleScoreClick}></div>
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

	.sf-status {
		font-size: 11px;
		line-height: 1;
		margin-left: 6px;
		cursor: help;
		user-select: none;
		/* Loading: desaturate the piano to gray, dimmed and pulsing. */
		filter: grayscale(1) brightness(1.15);
		opacity: 0.5;
		transition: filter 0.4s ease, opacity 0.4s ease;
		animation: pulse 1.4s ease-in-out infinite;
	}

	.sf-status.ready {
		/* Ready: full-color piano, steady. */
		filter: none;
		opacity: 1;
		animation: none;
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

	.export-dropdown {
		position: relative;
	}

	.export-toggle {
		background: #0e639c;
		color: #ffffff;
		border: none;
		padding: 4px 12px;
		border-radius: 3px;
		font-size: 12px;
		cursor: pointer;
		transition: background 0.2s;
	}

	.export-toggle:hover {
		background: #1177bb;
	}

	.export-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 99;
	}

	.export-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		background: #252526;
		border: 1px solid #3c3c3c;
		border-radius: 4px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		min-width: 160px;
		z-index: 100;
		overflow: hidden;
	}

	.export-item {
		display: block;
		width: 100%;
		padding: 8px 16px;
		background: transparent;
		border: none;
		color: #cccccc;
		font-size: 13px;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}

	.export-item:hover:not(:disabled) {
		background: #094771;
	}

	.export-item:disabled {
		color: #5a5a5a;
		cursor: not-allowed;
	}

	.export-item:not(:last-child) {
		border-bottom: 1px solid #3c3c3c;
	}

	.not-impl {
		font-size: 11px;
		color: #858585;
		margin-left: 4px;
	}
</style>
