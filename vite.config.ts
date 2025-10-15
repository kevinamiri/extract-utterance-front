import { defineConfig } from 'vite'; // import defineConfig
import react from '@vitejs/plugin-react'; // import react plugin

// vite config
export default defineConfig({
	base: '/', // base path
	plugins: [react()] // use react
});