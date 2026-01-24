import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['verovio'],
		include: ['@k-l-lambda/lilylet']
	},
	resolve: {
		alias: []
	},
	build: {
		commonjsOptions: {
			include: [/music-widgets/, /node_modules/],
			transformMixedEsModules: true
		}
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
