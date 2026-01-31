<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { base } from '$app/paths';
	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import { editorStore } from '$lib/stores/editor';
	import { lilyletToMEI, musicXmlToLilylet, lilypondToLilylet } from '$lib/lilylet';
	import { getStateFromUrl, copyShareUrl } from '$lib/utils/share';
	import { initVerovio, getToolkit } from '$lib/verovio/toolkit';

	let shareStatus: 'idle' | 'copied' | 'error' = 'idle';
	let lastRenderedCode = '';
	let lastRenderedWidth = 0;
	let resizeDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Divider drag state
	let isDragging = false;
	let editorWidth = 40; // percentage
	let mainElement: HTMLElement;

	// Drag and drop state
	let isDragOver = false;

	// Render cancellation token to prevent out-of-order updates
	let currentRenderId = 0;

	// Watch for code changes and re-render (only when code actually changes)
	$: if (browser && $editorStore.verovioReady && $editorStore.code && $editorStore.code !== lastRenderedCode) {
		lastRenderedCode = $editorStore.code;
		lastRenderedWidth = $editorStore.previewWidth;
		renderScore($editorStore.code);
	}

	// Watch for width changes and re-render with debounce
	$: if (browser && $editorStore.verovioReady && $editorStore.svg && $editorStore.previewWidth !== lastRenderedWidth) {
		if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
		resizeDebounceTimer = setTimeout(() => {
			lastRenderedWidth = $editorStore.previewWidth;
			renderScore($editorStore.code);
		}, 150);
	}

	async function handleShare() {
		const success = await copyShareUrl({ code: $editorStore.code });
		shareStatus = success ? 'copied' : 'error';
		setTimeout(() => {
			shareStatus = 'idle';
		}, 2000);
	}

	async function setupVerovio() {
		try {
			await initVerovio();
			editorStore.setVerovioReady(true);
		} catch (err) {
			console.error('Failed to initialize Verovio:', err);
			editorStore.setError('Failed to initialize Verovio: ' + String(err));
		}
	}

	async function renderScore(code: string) {
		const toolkit = getToolkit();
		if (!toolkit) return;

		// Increment render ID and capture for this render
		const renderId = ++currentRenderId;

		editorStore.setRendering(true);

		try {
			// Convert Lilylet to MEI
			const result = await lilyletToMEI(code);
			if (!result.success) {
				// Check if this render is still current
				if (renderId !== currentRenderId) return;
				editorStore.setError('Failed to parse Lilylet code');
				editorStore.addLog('error', `Lilylet to MEI conversion failed: ${result.error}`);
				return;
			}

			const { mei, measureCount, staffCount } = result;

			// Check if this render is still current before updating store
			if (renderId !== currentRenderId) return;
			editorStore.setMEI(mei);

			// Calculate pageWidth based on container - account for padding
			const effectiveWidth = Math.max(400, $editorStore.previewWidth - 80);
			// Verovio scale 40 means 40% of default size, pageWidth is in abstract units
			// At scale 40, approximately 2.5 abstract units = 1 pixel
			const pageWidthUnits = Math.round(effectiveWidth * 2.5);

			// Calculate pageHeight based on measure count and staff count
			// ~20 measures fit in one standard page (height ~2000 units at scale 40)
			const basePageHeight = 2000;
			const measuresPerPage = 20;
			const pageHeight = Math.max(basePageHeight, Math.ceil(measureCount / measuresPerPage) * basePageHeight) * 2 * staffCount;

			toolkit.setOptions({
				scale: 40,
				adjustPageHeight: true,
				pageHeight,
				pageWidth: pageWidthUnits
			});

			// Render with Verovio
			const success = toolkit.loadData(mei);
			if (!success) {
				if (renderId !== currentRenderId) return;
				editorStore.setError('Verovio failed to load MEI data');
				editorStore.addLog('error', 'Verovio failed to load MEI data');
				return;
			}

			const pageCount = toolkit.getPageCount();
			const svg = toolkit.renderToSVG(1);

			// Final check before committing results
			if (renderId !== currentRenderId) return;
			editorStore.setSVG(svg, pageCount);
		} catch (err) {
			// Only set error if this render is still current
			if (renderId === currentRenderId) {
				console.error('Render error:', err);
				editorStore.setError(String(err));
				editorStore.addLog('error', `Render error: ${String(err)}`);
			}
		} finally {
			// Only clear rendering flag if this is the current render
			if (renderId === currentRenderId) {
				editorStore.setRendering(false);
			}
		}
	}

	// Drag and drop handlers
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragOver = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;
	}

	async function handleFileDrop(file: File) {
		const fileName = file.name.toLowerCase();

		// Check file type by extension
		const isLilypond = fileName.endsWith('.ly') || fileName.endsWith('.ily');
		const isMusicXml = fileName.endsWith('.musicxml') || fileName.endsWith('.mxl') ||
			(fileName.endsWith('.xml') && !fileName.endsWith('.mei.xml'));

		if (!isLilypond && !isMusicXml) {
			editorStore.addLog('warning', `Unsupported file type: ${file.name}. Supported formats: .ly, .musicxml, .xml`);
			return;
		}

		try {
			const content = await file.text();
			editorStore.addLog('info', `Converting ${file.name}...`);

			if (isLilypond) {
				const result = lilypondToLilylet(content);
				if (result.success) {
					editorStore.setCode(result.data);
					editorStore.addLog('info', `Successfully converted ${file.name} to Lilylet`);
				} else {
					editorStore.addLog('error', result.error);
				}
			} else if (isMusicXml) {
				const result = musicXmlToLilylet(content);
				if (result.success) {
					editorStore.setCode(result.data);
					editorStore.addLog('info', `Successfully converted ${file.name} to Lilylet`);
				} else {
					editorStore.addLog('error', result.error);
				}
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			editorStore.addLog('error', `Failed to read file: ${errorMessage}`);
		}
	}

	async function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragOver = false;

		const files = e.dataTransfer?.files;
		if (!files || files.length === 0) return;

		await handleFileDrop(files[0]);
	}

	function handleDividerMouseDown(e: MouseEvent) {
		isDragging = true;
		e.preventDefault();
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !mainElement) return;
		const rect = mainElement.getBoundingClientRect();
		const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
		// Clamp between 20% and 80%
		editorWidth = Math.max(20, Math.min(80, newWidth));
	}

	function handleMouseUp() {
		isDragging = false;
	}

	onMount(() => {
		if (browser) {
			// Load state from URL if present
			const urlState = getStateFromUrl();
			if (urlState?.code) {
				editorStore.setCode(urlState.code);
			}

			setupVerovio();

			// Add global mouse event listeners for dragging
			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}
	});
</script>

<svelte:head>
	<title>Lilylet Live Editor</title>
</svelte:head>

<div class="app">
	<header>
		<h1>Lilylet Live Editor</h1>
		<nav>
			<span class="current">Editor</span>
			<a href="{base}/markdown">Markdown Demo</a>
			<a href="{base}/docs/lilylet-tutorial.html" target="_blank">Tutorial</a>
		</nav>
		<div class="header-actions">
			<button class="share-btn" on:click={handleShare}>
				{#if shareStatus === 'copied'}
					Copied!
				{:else if shareStatus === 'error'}
					Error
				{:else}
					Share
				{/if}
			</button>
			<span class="status">
				{#if !$editorStore.verovioReady}
					Loading Verovio...
				{:else}
					Ready
				{/if}
			</span>
		</div>
	</header>

	<main
		bind:this={mainElement}
		class:dragging={isDragging}
		class:drag-over={isDragOver}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<div class="pane editor-pane" style="flex: 0 0 {editorWidth}%">
			<Editor on:filedrop={(e) => { isDragOver = false; handleFileDrop(e.detail); }} />
		</div>
		<div class="divider" on:mousedown={handleDividerMouseDown}></div>
		<div class="pane preview-pane">
			<Preview />
		</div>
		{#if isDragOver}
			<div class="drop-overlay">
				<div class="drop-message">
					Drop LilyPond (.ly) or MusicXML (.musicxml, .xml) file to convert
				</div>
			</div>
		{/if}
	</main>

	<!-- Collapsible Log Area -->
	<div class="log-area" class:expanded={$editorStore.logsExpanded}>
		<button class="log-toggle" on:click={() => editorStore.setLogsExpanded(!$editorStore.logsExpanded)}>
			<span class="toggle-icon">{$editorStore.logsExpanded ? '▼' : '▶'}</span>
			Logs ({$editorStore.logs.length})
			{#if $editorStore.logs.filter(l => l.level === 'error').length > 0}
				<span class="error-badge">{$editorStore.logs.filter(l => l.level === 'error').length} errors</span>
			{/if}
		</button>
		{#if $editorStore.logsExpanded}
			<div class="log-content">
				<div class="log-actions">
					<button class="clear-btn" on:click={() => editorStore.clearLogs()}>Clear</button>
				</div>
				<div class="log-entries">
					{#each $editorStore.logs as log}
						<div class="log-entry log-{log.level}">
							<span class="log-time">{log.timestamp.toLocaleTimeString()}</span>
							<span class="log-level">[{log.level.toUpperCase()}]</span>
							<span class="log-message">{log.message}</span>
						</div>
					{/each}
					{#if $editorStore.logs.length === 0}
						<div class="log-empty">No logs yet</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
		background: #1e1e1e;
		color: #d4d4d4;
	}

	:global(*) {
		box-sizing: border-box;
	}

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

	.header-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.share-btn {
		background: #0e639c;
		color: #ffffff;
		border: none;
		padding: 6px 16px;
		border-radius: 3px;
		font-size: 13px;
		cursor: pointer;
		transition: background 0.2s;
		min-width: 80px;
	}

	.share-btn:hover {
		background: #1177bb;
	}

	.share-btn:active {
		background: #094771;
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
		flex: 1;
		overflow: hidden;
	}

	.editor-pane {
		min-width: 200px;
	}

	.preview-pane {
		flex: 1;
	}

	.divider {
		width: 4px;
		background: #333333;
		cursor: col-resize;
	}

	.divider:hover {
		background: #0078d4;
	}

	main.dragging {
		cursor: col-resize;
		user-select: none;
	}

	main.dragging .divider {
		background: #0078d4;
	}

	/* Drag and drop styles */
	main.drag-over {
		position: relative;
	}

	.drop-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(14, 99, 156, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		pointer-events: none;
	}

	.drop-message {
		color: #ffffff;
		font-size: 18px;
		font-weight: 600;
		padding: 24px 48px;
		border: 3px dashed #ffffff;
		border-radius: 8px;
		text-align: center;
	}

	/* Log area styles */
	.log-area {
		border-top: 1px solid #454545;
		background: #252526;
	}

	.log-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		background: #333333;
		border: none;
		color: #d4d4d4;
		font-size: 12px;
		cursor: pointer;
		text-align: left;
	}

	.log-toggle:hover {
		background: #3c3c3c;
	}

	.toggle-icon {
		font-size: 10px;
		color: #858585;
	}

	.error-badge {
		background: #f14c4c;
		color: #ffffff;
		padding: 1px 6px;
		border-radius: 10px;
		font-size: 11px;
		margin-left: auto;
	}

	.log-content {
		max-height: 200px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.log-actions {
		padding: 4px 12px;
		border-bottom: 1px solid #454545;
		display: flex;
		justify-content: flex-end;
	}

	.clear-btn {
		background: transparent;
		border: 1px solid #454545;
		color: #858585;
		padding: 2px 8px;
		border-radius: 3px;
		font-size: 11px;
		cursor: pointer;
	}

	.clear-btn:hover {
		background: #3c3c3c;
		color: #d4d4d4;
	}

	.log-entries {
		flex: 1;
		overflow-y: auto;
		padding: 8px 12px;
		font-family: 'Consolas', 'Monaco', monospace;
		font-size: 12px;
	}

	.log-entry {
		padding: 2px 0;
		display: flex;
		gap: 8px;
	}

	.log-time {
		color: #6a9955;
		flex-shrink: 0;
	}

	.log-level {
		flex-shrink: 0;
		min-width: 60px;
	}

	.log-message {
		word-break: break-word;
	}

	.log-info .log-level {
		color: #4fc1ff;
	}

	.log-warning .log-level {
		color: #cca700;
	}

	.log-error .log-level {
		color: #f14c4c;
	}

	.log-error .log-message {
		color: #f14c4c;
	}

	.log-empty {
		color: #858585;
		font-style: italic;
		text-align: center;
		padding: 16px;
	}
</style>
