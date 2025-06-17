import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    // Load env variables based on mode (development/production)
    const env = loadEnv(mode, process.cwd(), '');

    return {
        // Base path for GitHub Pages
        base: '/',

        // Development server config
        server: {
            open: true,
            port: 3000,
            strictPort: false,
            cors: true
        },

        // Build optimization
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            minify: 'terser',
            terserOptions: {
                compress: {
                    drop_console: mode === 'production',
                }
            },
            rollupOptions: {
                output: {
                    manualChunks: {
                        vendor: ['vue', 'react', 'lodash']
                    },
                    chunkFileNames: 'assets/js/[name]-[hash].js',
                    entryFileNames: 'assets/js/[name]-[hash].js',
                    assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
                }
            }
        },

        // Optimized asset handling
        optimizeDeps: {
            include: ['vue', 'react', 'lodash']
        },

        // Environment variable configuration
        define: {
            __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
        },

        // CSS optimization
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `$env: ${mode};`
                }
            }
        }
    };
});