// Serves dist/ the way GitHub Pages does, under the same BASE_PATH used for the build.

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');
const port = Number(process.env.PORT ?? 4173);

const types = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.webp': 'image/webp',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain; charset=utf-8',
	'.woff2': 'font/woff2'
};

const stat = (path) => statSync(path, { throwIfNoEntry: false });

function decodeSafely(path) {
	try {
		return decodeURIComponent(path);
	} catch {
		return path;
	}
}

createServer((req, res) => {
	const { pathname } = new URL(req.url ?? '/', 'http://localhost');

	if (base && pathname === '/') {
		res.writeHead(302, { Location: `${base}/` }).end();
		return;
	}

	let file = null;
	if (pathname === base || pathname.startsWith(`${base}/`)) {
		const candidate = join(dist, normalize(decodeSafely(pathname.slice(base.length) || '/')));
		if (candidate === dist || candidate.startsWith(dist + sep)) file = candidate;
	}

	if (file && stat(file)?.isDirectory()) {
		if (!pathname.endsWith('/')) {
			res.writeHead(301, { Location: `${pathname}/` }).end();
			return;
		}
		file = join(file, 'index.html');
	}

	if (!file || !stat(file)?.isFile()) {
		res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
		return;
	}

	res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
	createReadStream(file).pipe(res);
}).listen(port, () => {
	console.log(`Serving dist/ at http://localhost:${port}${base}/`);
});
