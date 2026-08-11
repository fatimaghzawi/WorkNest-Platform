import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import fs from 'node:fs';

/** Serve the existing demo/ folder at /demo during dev & preview. */
function serveDemoFolder() {
  const demoRoot = path.resolve(__dirname, 'demo');
  const mime: Record<string, string> = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.webm': 'video/webm',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
  };

  const handler = (
    req: { url?: string },
    res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (b?: string) => void },
    next: () => void,
  ) => {
    if (!req.url?.startsWith('/demo')) return next();
    const rel = decodeURIComponent(req.url.replace(/^\/demo\/?/, '').split('?')[0] || 'demo.html');
    const file = path.normalize(path.join(demoRoot, rel));
    if (!file.startsWith(demoRoot)) {
      res.statusCode = 403;
      res.end('Forbidden');
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    const ext = path.extname(file);
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res as unknown as NodeJS.WritableStream);
  };

  return {
    name: 'serve-demo-folder',
    configureServer(server: { middlewares: { use: (fn: typeof handler) => void } }) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server: { middlewares: { use: (fn: typeof handler) => void } }) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), serveDemoFolder()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5174,
    open: false,
  },
});
