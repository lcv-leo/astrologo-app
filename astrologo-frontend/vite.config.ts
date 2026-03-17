// Módulo: vite.config.ts (v1.0.1)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    // Envelopamento das lógicas originais mantido
    plugins: [
        react(),
        tailwindcss()
    ],

    // Implementação estrita do mapeamento de saída
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks: undefined,
            },
        },
    },

    // Garantia de compatibilidade de rotas base para provedores de hospedagem estática
    base: '/',
});