/** The home screen's own settings, opened from the Ajustes icon defined in `apps.ts`. */
export const ui = $state({ settingsOpen: false });

/** The wallpaper as a data URL, or '' for the built-in gradient. */
export const wallpaper = persisted('home:wallpaper', '');

/** A value kept in localStorage. Keys are prefixed because every app on the site shares the origin. */
function persisted(key: string, fallback: string) {
	let value = $state(read(key, fallback));

	return {
		get value() {
			return value;
		},
		/**
		 * Applies the value, then throws if the browser refuses to store it (over the quota, or site
		 * data blocked): the change stays, but only for this session.
		 */
		set value(next: string) {
			value = next;
			localStorage.setItem(key, next);
		}
	};
}

function read(key: string, fallback: string) {
	try {
		return localStorage.getItem(key) ?? fallback;
	} catch {
		return fallback;
	}
}
