import { listModels } from './openai';

// Models documented as supporting the image generation tool, shown until the key's own list loads.
const SUGGESTED_TEXT_MODELS = [
	'gpt-5.5',
	'gpt-5.4-mini',
	'gpt-5.4-nano',
	'gpt-5.2',
	'gpt-5',
	'gpt-5-nano',
	'o3',
	'gpt-4.1',
	'gpt-4.1-mini',
	'gpt-4.1-nano',
	'gpt-4o',
	'gpt-4o-mini'
];

const SUGGESTED_IMAGE_MODELS = [
	'gpt-image-2.5-sunburst',
	'gpt-image-2.5-flare',
	'gpt-image-2',
	'gpt-image-1.5',
	'gpt-image-1',
	'gpt-image-1-mini'
];

const SNAPSHOT = /-\d{4}-\d{2}-\d{2}$/;
const NOT_A_CHAT_MODEL =
	/image|audio|realtime|tts|transcribe|search|embedding|moderation|instruct|codex|oss|diarize|deep-research|computer-use|chat-latest/;

/** Model IDs available to the API key, newest first. */
export async function fetchModelIds(apiKey: string) {
	const { data } = await listModels(apiKey);
	return data.toSorted((a, b) => b.created - a.created).map((model) => model.id);
}

export function textModelOptions(ids: string[], current: string) {
	const models = ids.filter(
		(id) => /^(gpt-\d|o\d)/.test(id) && !SNAPSHOT.test(id) && !NOT_A_CHAT_MODEL.test(id)
	);
	return withCurrent(models.length ? models : SUGGESTED_TEXT_MODELS, current);
}

export function imageModelOptions(ids: string[], current: string) {
	const models = ids.filter((id) => /^(chatgpt-)?gpt-image/.test(id) && !SNAPSHOT.test(id));
	return withCurrent(models.length ? models : SUGGESTED_IMAGE_MODELS, current);
}

function withCurrent(models: string[], current: string) {
	return models.includes(current) ? models : [current, ...models];
}
