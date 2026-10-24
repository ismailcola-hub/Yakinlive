import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

const zipDownloadPlugin = (): Plugin => ({
  name: 'zip-download-attachment',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const urlPath = req.url?.split('?')[0];
      if (urlPath === '/yakin-live.zip' || urlPath === '/api/download-zip') {
        const filePath = path.resolve(__dirname, 'public/yakin-live.zip');
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          res.writeHead(200, {
            'Content-Type': 'application/zip',
            'Content-Length': stat.size,
            'Content-Disposition': 'attachment; filename="yakin-live.zip"',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          });
          fs.createReadStream(filePath).pipe(res);
          return;
        }
      }
      next();
    });
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), zipDownloadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
