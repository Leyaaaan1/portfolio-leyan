import { defineConfig } from 'vite';

export default defineConfig({
    // Makes the site available at root path
    base: '/',
    // Open the site in browser when starting dev server
    server: {
        open: true
    }
});