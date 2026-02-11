import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		plugins: [sveltekit()],
		optimizeDeps: {
			exclude: ['verovio'],
			include: ['@k-l-lambda/lilylet']
		},
		server: {
			port: parseInt(env.VITE_PORT || '5173'),
			fs: {
				allow: ['..']
			}
		}
	};
});
