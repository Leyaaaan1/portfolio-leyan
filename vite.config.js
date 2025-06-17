import { defineConfig } from 'vite'

export default defineConfig({
    base: '/portfolio-leyan/',
    build: {
        outDir: 'dist',
    },
    server: {
        port: 3000,
    }
});