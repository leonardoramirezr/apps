/** A value kept in localStorage. Keys are prefixed because every app on the site shares the origin. */
function persisted<T>(key: string, fallback: T) {
	let value = $state(read(key, fallback));

	return {
		get value() {
			return value;
		},
		set value(next: T) {
			value = next;
			try {
				localStorage.setItem(key, JSON.stringify(next));
			} catch {
				// Storage is unavailable (e.g. blocked site data): keep the value for this session only.
			}
		}
	};
}

function read<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? fallback : JSON.parse(raw);
	} catch {
		return fallback;
	}
}

export const apiKey = persisted('willchat:api-key', '');
export const textModel = persisted('willchat:text-model', 'gpt-5');
export const imageModel = persisted('willchat:image-model', 'gpt-image-2.5-sunburst');

/** Model IDs available to the API key, newest first. */
export const availableModels = persisted<string[]>('willchat:models', []);
