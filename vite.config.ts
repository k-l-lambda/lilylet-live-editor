import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['verovio'],
		include: ['@k-l-lambda/lilylet']
	},
	resolve: {
		alias: [
			// Use browser bundle for music-widgets
			// The lib/index.js doesn't exist, only the dist bundle does
			{
				find: /^@k-l-lambda\/music-widgets(\/.*)?$/,
				replacement: '@k-l-lambda/music-widgets/dist/musicWidgetsBrowser.common.js'
			}
		]
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
