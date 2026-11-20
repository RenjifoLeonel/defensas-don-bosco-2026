import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ics':'text/calendar; charset=utf-8'};
const server = http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.stat(target, (err, stats) => {
    if (err || !stats.isFile()) { res.writeHead(404).end('No encontrado'); return; }
    const headers = {'Content-Type':types[path.extname(target)] || 'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    const range = /^bytes=(\d+)-(\d*)$/.exec(req.headers.range || '');
    if (range) {
      const start = Number(range[1]); const end = range[2] ? Math.min(Number(range[2]), stats.size - 1) : stats.size - 1;
      if (start >= stats.size || start > end) { res.writeHead(416, {'Content-Range':`bytes */${stats.size}`}).end(); return; }
      res.writeHead(206, {...headers,'Content-Range':`bytes ${start}-${end}/${stats.size}`,'Content-Length':end-start+1});
      fs.createReadStream(target,{start,end}).pipe(res);
    } else {
      res.writeHead(200,{...headers,'Content-Length':stats.size});
      if (req.method === 'HEAD') res.end(); else fs.createReadStream(target).pipe(res);
    }
  });
});
server.listen(4318, '127.0.0.1', () => process.stdout.write('Local: http://127.0.0.1:4318\n'));

