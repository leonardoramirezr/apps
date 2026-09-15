// Builds the home screen and every app into dist/, ready for GitHub Pages:
//
//   home/          → dist/
//   apps/<slug>/   → dist/<slug>/
//
// BASE_PATH is the path the site is served from, e.g. "/apps" for
// https://<user>.github.io/apps/. Leave it empty to serve from the root.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const base = (process.env.BASE_PATH ?? '').replace(/\/+$/, '');

function fail(message) {
	console.error(`\n✖ ${message}\n`);
	process.exit(1);
}

if (base && !base.startsWith('/')) fail(`BASE_PATH must start with "/" (got "${base}")`);

/** Every folder in apps/ is an app and must follow the contract documented in README.md. */
function findApps() {
	const appsDir = join(root, 'apps');

	return readdirSync(appsDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
		.map(({ name: slug }) => {
			const dir = join(appsDir, slug);

			if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
				fail(`apps/${slug}: folder names may only contain lowercase letters, digits and dashes`);
			}
			for (const file of ['app.json', 'icon.svg', 'package.json']) {
				if (!existsSync(join(dir, file))) fail(`apps/${slug} is missing ${file}`);
			}
			const manifest = JSON.parse(readFileSync(join(dir, 'app.json'), 'utf8'));
			if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
				fail(`apps/${slug}/app.json must define a "name"`);
			}

			return { slug, dir };
		});
}

/** Runs the project's `build` script with its base path and returns its output folder. */
function build(dir, basePath) {
	const name = relative(root, dir);
	console.log(`\n▸ Building ${name} for ${basePath || '/'}\n`);

	const { status } = spawnSync('pnpm', ['run', 'build'], {
		cwd: dir,
		stdio: 'inherit',
		env: { ...process.env, BASE_PATH: basePath }
	});
	if (status !== 0) fail(`Build failed: ${name}`);

	const output = join(dir, 'build');
	if (!existsSync(join(output, 'index.html'))) fail(`${name}/build/index.html was not generated`);
	return output;
}

const apps = findApps();

rmSync(dist, { recursive: true, force: true });
cpSync(build(join(root, 'home'), base), dist, { recursive: true });

for (const { slug, dir } of apps) {
	cpSync(build(dir, `${base}/${slug}`), join(dist, slug), { recursive: true });
}

// SvelteKit writes its assets to `_app/`, which Jekyll would otherwise ignore.
writeFileSync(join(dist, '.nojekyll'), '');

console.log(`\n✔ Built home + ${apps.length} app(s) into dist/ for ${base || '/'}\n`);
