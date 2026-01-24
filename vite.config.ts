import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['verovio'],
		include: ['@k-l-lambda/lilylet', '@k-l-lambda/music-widgets']
	},
	resolve: {
		alias: []
	},
	ssr: {
		noExternal: ['@k-l-lambda/music-widgets']
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
