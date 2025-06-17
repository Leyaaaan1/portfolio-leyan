import { defineConfig } from 'vite';

export default defineConfig({
    // Your existing config...

    // Ensure environment variables are properly exposed
    define: {
        'import.meta.env.VITE_GITHUB_TOKEN': JSON.stringify(process.env.VITE_GITHUB_TOKEN)
    }
});