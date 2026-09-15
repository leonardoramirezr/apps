import { resolve } from '$app/paths';

/**
 * Apps are discovered at build time. Every folder in `apps/<slug>/` must contain:
 *
 * - `app.json`: the manifest, e.g. `{ "name": "WillChat" }`.
 * - `icon.svg`: square, full-bleed artwork. The home screen applies the rounded mask.
 *
 * The app is published at `<base>/<slug>/`.
 */
interface AppManifest {
	name: string;
}

export interface App {
	slug: string;
	name: string;
	icon: string;
	href: string;
}

const manifests = import.meta.glob<AppManifest>('../../../apps/*/app.json', {
	eager: true,
	import: 'default'
});

const icons = import.meta.glob<string>('../../../apps/*/icon.svg', {
	eager: true,
	query: '?url',
	import: 'default'
});

export const apps: App[] = Object.entries(manifests)
	.map(([path, manifest]) => {
		const slug = path.split('/').at(-2)!;
		return {
			slug,
			name: manifest.name,
			icon: icons[path.replace(/app\.json$/, 'icon.svg')],
			href: `${resolve('/')}${slug}/`
		};
	})
	.sort((a, b) => a.name.localeCompare(b.name));
