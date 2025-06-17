
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/portfolio-leyan/',
    define: {
        // This will replace the variable at build time
        'process.env.GITHUB_TOKEN': JSON.stringify(process.env.VITE_GITHUB_TOKEN)
    }
});