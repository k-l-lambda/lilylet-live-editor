<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import MarkdownIt from 'markdown-it';
	import lilyletPlugin from '@k-l-lambda/lilylet-markdown';
	import { initVerovio, getToolkit } from '$lib/verovio/toolkit';
	import { lilyletToMEI } from '$lib/lilylet';

	let markdownInput = `# Lilylet in Markdown Demo

This demonstrates embedding **Lilylet music notation** in Markdown documents.

## Simple Scale (Static)

\`\`\`lilylet
\\key c \\major
\\time 4/4

c4 d e f | g' a b c | c'1
\`\`\`

## Playable Example

Use \`lyl.play\` or \`lilylet.play\` to make the score playable:

\`\`\`lyl.play
\\time 4/4
c'4 d' e' f' | g'4 a' b' c'' | <c' e' g'>2 <g b d'>2 | c''1
\`\`\`

## Another Playable

\`\`\`lilylet.play
\\time 3/4
\\key g \\major
g'4 a' b' | d''2. | b'4 a' g' | g'2.
\`\`\`

## Regular Code Block

\`\`\`javascript
console.log('Hello, Lilylet!');
\`\`\`
`;

	// Music widgets (loaded dynamically)
	let MIDI: any;
	let MidiPlayer: any;
	let MusicNotation: any;
	let MidiAudio: any;
	let isAudioLoaded = false;

	// Per-block player state
	interface BlockPlayer {
		id: string;
		element: HTMLElement;
		mei: string;
		midiData: any;
		midiPlayer: any;
		isPlaying: boolean;
		currentTime: number;
		duration: number;
		updateInterval: number | null;
		playStartTime: number;
		lastEventIndex: number;
		pausedTime: number;
		highlightedNotes: Set<string>;
		lastHighlightUpdate: number;
	}
	let blockPlayers: Map<string, BlockPlayer> = new Map();
	let playingBlockId: string | null = null;
	const HIGHLIGHT_THROTTLE_MS = 50;

	let renderedHtml = '';
	let verovioReady = false;
	let md: MarkdownIt;
	let renderVersion = 0;
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function renderMarkdown() {
		if (!md) return;
		renderedHtml = md.render(markdownInput);

		// After rendering, process lilylet placeholders with Verovio
		if (browser && verovioReady) {
			renderVersion++;
			setTimeout(() => renderLilyletBlocks(renderVersion), 0);
		}
	}

	function debouncedRender() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			renderMarkdown();
		}, 300);
	}

	// Load music-widgets UMD bundle via script tag
	async function loadMusicWidgets(): Promise<any> {
		if ((window as any).musicWidgetsBrowser) {
			return (window as any).musicWidgetsBrowser;
		}

		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = `${import.meta.env.BASE_URL}js/musicWidgetsBrowser.umd.min.js`;
			script.onload = () => {
				if ((window as any).musicWidgetsBrowser) {
					resolve((window as any).musicWidgetsBrowser);
				} else {
					reject(new Error('musicWidgetsBrowser not found on window after script load'));
				}
			};
			script.onerror = () => reject(new Error('Failed to load music-widgets UMD bundle'));
			document.head.appendChild(script);
		});
	}

	async function initAudio() {
		try {
			const musicWidgets = await loadMusicWidgets();
			MIDI = musicWidgets.MIDI;
			MidiPlayer = musicWidgets.MidiPlayer;
			MusicNotation = musicWidgets.MusicNotation;
			MidiAudio = musicWidgets.MidiAudio;

			await MidiAudio.loadPlugin({
				soundfontUrl: 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/',
				api: 'webaudio'
			});
			isAudioLoaded = true;
		} catch (error) {
			console.error('Failed to load MidiAudio:', error);
		}
	}

	function createMiniPlayer(blockId: string): HTMLElement {
		const controls = document.createElement('div');
		controls.className = 'mini-player';
		controls.innerHTML = `
			<button class="play-btn" data-block="${blockId}" title="Play">
				<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
					<path d="M3 2v12l10-6z" />
				</svg>
			</button>
			<span class="time-display">0:00 / 0:00</span>
			<div class="mini-progress">
				<div class="mini-progress-fill"></div>
			</div>
		`;

		// Add event listeners
		const playBtn = controls.querySelector('.play-btn') as HTMLElement;
		playBtn.addEventListener('click', () => togglePlay(blockId));

		const progressBar = controls.querySelector('.mini-progress') as HTMLElement;
		progressBar.addEventListener('click', (e) => handleProgressClick(blockId, e));

		return controls;
	}

	function formatTime(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function updatePlayerUI(player: BlockPlayer) {
		const controls = player.element.querySelector('.mini-player');
		if (!controls) return;

		const timeDisplay = controls.querySelector('.time-display');
		const progressFill = controls.querySelector('.mini-progress-fill') as HTMLElement;
		const playBtn = controls.querySelector('.play-btn');

		if (timeDisplay) {
			timeDisplay.textContent = `${formatTime(player.currentTime)} / ${formatTime(player.duration)}`;
		}
		if (progressFill && player.duration > 0) {
			progressFill.style.width = `${(player.currentTime / player.duration) * 100}%`;
		}
		if (playBtn) {
			if (player.isPlaying) {
				playBtn.innerHTML = `
					<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
						<path d="M4 2h3v12H4zM9 2h3v12H9z" />
					</svg>
				`;
				playBtn.setAttribute('title', 'Pause');
			} else {
				playBtn.innerHTML = `
					<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
						<path d="M3 2v12l10-6z" />
					</svg>
				`;
				playBtn.setAttribute('title', 'Play');
			}
		}
	}

	function updateHighlights(player: BlockPlayer, time: number) {
		const toolkit = getToolkit();
		if (!toolkit) return;

		try {
			// Load MEI for this block to get correct element timing
			toolkit.loadData(player.mei);

			// Get elements at current time (time is in ms)
			const result = toolkit.getElementsAtTime(time);
			const newNotes = new Set<string>(result.notes || []);

			// Find notes within this block's SVG
			const svg = player.element.querySelector('svg');
			if (!svg) return;

			// Remove highlights from notes no longer playing
			player.highlightedNotes.forEach(id => {
				if (!newNotes.has(id)) {
					const element = svg.querySelector(`#${id}`);
					if (element) {
						element.classList.remove('verovio-highlight');
					}
				}
			});

			// Add highlights to new notes
			newNotes.forEach(id => {
				if (!player.highlightedNotes.has(id)) {
					const element = svg.querySelector(`#${id}`);
					if (element) {
						element.classList.add('verovio-highlight');
					}
				}
			});

			player.highlightedNotes = newNotes;
		} catch (error) {
			// Ignore errors during highlight update
		}
	}

	function updateHighlightsThrottled(player: BlockPlayer, time: number) {
		const now = performance.now();
		if (now - player.lastHighlightUpdate < HIGHLIGHT_THROTTLE_MS) return;
		player.lastHighlightUpdate = now;
		updateHighlights(player, time);
	}

	function clearHighlights(player: BlockPlayer) {
		const svg = player.element.querySelector('svg');
		if (!svg) return;

		player.highlightedNotes.forEach(id => {
			const element = svg.querySelector(`#${id}`);
			if (element) {
				element.classList.remove('verovio-highlight');
			}
		});
		player.highlightedNotes = new Set();
	}

	function togglePlay(blockId: string) {
		const player = blockPlayers.get(blockId);
		if (!player || !player.midiData) return;

		if (player.isPlaying) {
			pauseBlock(blockId);
		} else {
			// Stop any other playing block
			if (playingBlockId && playingBlockId !== blockId) {
				stopBlock(playingBlockId);
			}
			playBlock(blockId);
		}
	}

	function playBlock(blockId: string) {
		const player = blockPlayers.get(blockId);
		if (!player || !player.midiData || player.isPlaying) return;

		player.isPlaying = true;
		playingBlockId = blockId;

		if (player.pausedTime > 0) {
			player.playStartTime = performance.now() - player.pausedTime;
			player.lastEventIndex = findEventIndexAtTime(player.midiData, player.pausedTime);
		} else {
			player.playStartTime = performance.now();
			player.lastEventIndex = 0;
		}

		player.updateInterval = setInterval(() => {
			if (!player.isPlaying || !player.midiData) return;

			const now = performance.now();
			const elapsed = now - player.playStartTime;
			player.currentTime = elapsed;

			const events = player.midiData.events;
			for (; player.lastEventIndex < events.length; player.lastEventIndex++) {
				const event = events[player.lastEventIndex];
				if (event.time > elapsed) break;

				if (event.data.type === 'channel') {
					const timestamp = player.playStartTime + event.time;
					switch (event.data.subtype) {
						case 'noteOn':
							MidiAudio.noteOn(event.data.channel, event.data.noteNumber, event.data.velocity, timestamp);
							break;
						case 'noteOff':
							MidiAudio.noteOff(event.data.channel, event.data.noteNumber, timestamp);
							break;
						case 'programChange':
							MidiAudio.programChange(event.data.channel, event.data.programNumber);
							break;
					}
				}
			}

			// Update note highlights
			updateHighlightsThrottled(player, elapsed);

			updatePlayerUI(player);

			if (elapsed >= player.duration) {
				stopBlock(blockId);
			}
		}, 30) as unknown as number;

		updatePlayerUI(player);
	}

	function pauseBlock(blockId: string) {
		const player = blockPlayers.get(blockId);
		if (!player) return;

		if (player.updateInterval) {
			clearInterval(player.updateInterval);
			player.updateInterval = null;
		}
		player.pausedTime = player.currentTime;
		player.isPlaying = false;
		playingBlockId = null;
		MidiAudio?.stopAllNotes?.();
		updatePlayerUI(player);
	}

	function stopBlock(blockId: string) {
		const player = blockPlayers.get(blockId);
		if (!player) return;

		if (player.updateInterval) {
			clearInterval(player.updateInterval);
			player.updateInterval = null;
		}
		player.isPlaying = false;
		player.currentTime = 0;
		player.pausedTime = 0;
		player.lastEventIndex = 0;
		if (playingBlockId === blockId) {
			playingBlockId = null;
		}
		MidiAudio?.stopAllNotes?.();
		clearHighlights(player);
		updatePlayerUI(player);
	}

	function findEventIndexAtTime(midiData: any, time: number): number {
		const events = midiData.events;
		let low = 0;
		let high = events.length;
		while (low < high) {
			const mid = (low + high) >>> 1;
			if (events[mid].time < time) {
				low = mid + 1;
			} else {
				high = mid;
			}
		}
		return low;
	}

	function handleProgressClick(blockId: string, e: MouseEvent) {
		const player = blockPlayers.get(blockId);
		if (!player || !player.midiData) return;

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percent = x / rect.width;
		const targetTime = player.duration * percent;

		MidiAudio?.stopAllNotes?.();
		player.currentTime = targetTime;
		player.pausedTime = targetTime;
		player.lastEventIndex = findEventIndexAtTime(player.midiData, targetTime);

		if (player.isPlaying) {
			player.playStartTime = performance.now() - targetTime;
		}

		updatePlayerUI(player);
	}

	async function initPlayableBlock(el: HTMLElement, mei: string, blockId: string) {
		if (!isAudioLoaded) return;

		const toolkit = getToolkit();
		if (!toolkit) return;

		try {
			toolkit.loadData(mei);
			const midiBase64 = toolkit.renderToMIDI();
			const binaryString = atob(midiBase64);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}

			const rawMidiData = MIDI.parseMidiData(bytes.buffer);
			const notation = MusicNotation.Notation.parseMidi(rawMidiData);
			if (!notation.tempos || notation.tempos.length === 0) {
				notation.tempos = [{ tempo: 500000, tick: 0, time: 0 }];
			}

			const player: BlockPlayer = {
				id: blockId,
				element: el,
				mei: mei,
				midiData: notation,
				midiPlayer: null,
				isPlaying: false,
				currentTime: 0,
				duration: notation.endTime,
				updateInterval: null,
				playStartTime: 0,
				lastEventIndex: 0,
				pausedTime: 0,
				highlightedNotes: new Set(),
				lastHighlightUpdate: 0
			};

			blockPlayers.set(blockId, player);

			// Add mini-player controls
			const miniPlayer = createMiniPlayer(blockId);
			el.appendChild(miniPlayer);
			updatePlayerUI(player);

		} catch (err) {
			console.error('Failed to init playable block:', err);
		}
	}

	async function renderLilyletBlocks(version: number) {
		const toolkit = getToolkit();
		if (!toolkit) return;

		const container = document.querySelector('.preview-content');
		if (!container) return;

		// Find all lilylet placeholders (pending ones that need rendering)
		const placeholders = container.querySelectorAll('[data-lilylet-pending]');

		let blockIndex = 0;
		for (const el of placeholders) {
			// Check if this render is still current
			if (version !== renderVersion) return;

			// Get source code from data-source attribute
			const source = el.getAttribute('data-source');
			if (!source) continue;

			const isPlayable = el.hasAttribute('data-playable');
			const blockId = `block-${version}-${blockIndex++}`;

			try {
				// Parse lilylet code to MEI
				const mei = await lilyletToMEI(source);

				// Check again after async operation
				if (version !== renderVersion) return;

				if (!mei) {
					el.innerHTML = `<pre class="error">Failed to parse lilylet code</pre>`;
					continue;
				}

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

					// Initialize playable block
					if (isPlayable && isAudioLoaded) {
						await initPlayableBlock(el as HTMLElement, mei, blockId);
					}
				}
			} catch (err) {
				console.error('Failed to render lilylet block:', err);
				if (version === renderVersion) {
					el.innerHTML = `<pre class="error">Error: ${err}</pre>`;
				}
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

		// Initialize Verovio and audio in parallel
		try {
			await Promise.all([
				initVerovio().then(() => {
					verovioReady = true;
				}),
				initAudio()
			]);
			// Re-render with Verovio (audio may still be loading)
			renderVersion++;
			renderLilyletBlocks(renderVersion);
		} catch (err) {
			console.error('Failed to initialize:', err);
		}
	});

	onDestroy(() => {
		// Stop all players and clean up
		blockPlayers.forEach((player, blockId) => {
			stopBlock(blockId);
		});
		blockPlayers.clear();
	});

	// Reactive rendering when markdown input changes
	$: if (browser && md && markdownInput !== undefined) {
		debouncedRender();
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
	:global(body) {
		margin: 0;
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

	/* Mini-player styles for playable blocks */
	.preview-content :global(.mini-player) {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 12px;
		padding: 8px 12px;
		background: #f0f0f0;
		border-radius: 6px;
	}

	.preview-content :global(.mini-player .play-btn) {
		background: #0e639c;
		border: none;
		color: white;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s;
	}

	.preview-content :global(.mini-player .play-btn:hover) {
		background: #1177bb;
	}

	.preview-content :global(.mini-player .time-display) {
		font-size: 12px;
		color: #666;
		font-family: 'Consolas', 'Monaco', monospace;
		min-width: 80px;
	}

	.preview-content :global(.mini-player .mini-progress) {
		flex: 1;
		height: 6px;
		background: #ddd;
		border-radius: 3px;
		cursor: pointer;
		overflow: hidden;
	}

	.preview-content :global(.mini-player .mini-progress-fill) {
		height: 100%;
		background: #0e639c;
		width: 0%;
		transition: width 0.1s linear;
	}

	/* Note highlight animation during playback */
	.preview-content :global(.verovio-highlight) {
		fill: #ff6b35 !important;
		stroke: #ff6b35 !important;
		stroke-width: 1px;
		filter: drop-shadow(0 0 3px #ff6b35);
		transition: fill 0.05s ease, stroke 0.05s ease;
	}
</style>
