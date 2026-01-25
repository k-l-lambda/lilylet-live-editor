# Lilylet Live Editor

A web-based editor for [Lilylet](https://github.com/k-l-lambda/lilylet) music notation with real-time rendering and MIDI playback.

## Live Demo

- [Live Editor](https://k-l-lambda.github.io/lilylet-live-editor/) - Write Lilylet code and see rendered notation instantly
- [Markdown Editor](https://k-l-lambda.github.io/lilylet-live-editor/markdown) - Embed music notation in Markdown documents
- [Tutorial](https://k-l-lambda.github.io/lilylet-live-editor/docs/lilylet-tutorial.html) - Learn Lilylet syntax

## Features

### Live Editor
- Real-time music notation rendering via [Verovio](https://www.verovio.org/)
- Syntax highlighting with CodeMirror
- Shareable URLs with compressed code

### Markdown Editor
- Embed Lilylet code blocks in Markdown documents
- Static notation rendering with ` ```lilylet ` code blocks
- Playable notation with ` ```lilylet.play ` code blocks
- MIDI playback with note highlighting
- Live preview as you type

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production (includes docs)
npm run build

# Build docs only
npm run build:docs

# Preview production build
npm run preview
```

### Deploy

```bash
# Deploy to GitHub Pages
npm run deploy
```

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [Verovio](https://www.verovio.org/) - Music notation rendering
- [CodeMirror](https://codemirror.net/) - Code editor
- [markdown-it](https://github.com/markdown-it/markdown-it) - Markdown parser
- [@k-l-lambda/lilylet](https://github.com/k-l-lambda/lilylet) - Lilylet parser
- [@k-l-lambda/lilylet-markdown](https://github.com/k-l-lambda/lilylet) - Markdown plugin for Lilylet
- [@k-l-lambda/music-widgets](https://github.com/k-l-lambda/web-widgets) - MIDI playback

## Related Projects

- [Lilylet](https://github.com/k-l-lambda/lilylet) - The Lilylet language parser and MEI encoder

## License

MIT
