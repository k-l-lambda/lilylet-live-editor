import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		exclude: ['verovio'],
		include: ['@k-l-lambda/lilylet']
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});
