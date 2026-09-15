<script lang="ts">
	import { tick } from 'svelte';
	import { chat } from '$lib/chat.svelte';
	import { t } from '$lib/i18n';
	import { prepareImage } from '$lib/images';
	import Icon from './Icon.svelte';

	let { onsend }: { onsend: () => void } = $props();

	interface Attachment {
		id: number;
		/** Set once the photo has been resized. */
		url?: string;
	}

	let text = $state('');
	let attachments = $state<Attachment[]>([]);
	let problem = $state('');

	let textarea: HTMLTextAreaElement;
	let fileInput: HTMLInputElement;
	let nextId = 0;
	let problemTimer: ReturnType<typeof setTimeout> | undefined;

	const ready = $derived(attachments.every((attachment) => attachment.url));
	const canSend = $derived(
		chat.loaded && !chat.pending && ready && (text.trim() !== '' || attachments.length > 0)
	);

	async function addPhotos(files: File[]) {
		const ids = files.map(() => nextId++);
		attachments.push(...ids.map((id) => ({ id })));

		// One at a time: full-size photos use a lot of memory while decoding.
		for (const [index, file] of files.entries()) {
			try {
				const url = await prepareImage(file);
				const attachment = attachments.find(({ id }) => id === ids[index]);
				if (attachment) attachment.url = url;
			} catch {
				remove(ids[index]);
				showProblem(t.unreadablePhoto);
			}
		}
	}

	function remove(id: number) {
		attachments = attachments.filter((attachment) => attachment.id !== id);
	}

	function showProblem(message: string) {
		problem = message;
		clearTimeout(problemTimer);
		problemTimer = setTimeout(() => (problem = ''), 4000);
	}

	function onchange() {
		const files = [...(fileInput.files ?? [])];
		fileInput.value = '';
		if (files.length) addPhotos(files);
	}

	function onpaste(event: ClipboardEvent) {
		const files = [...(event.clipboardData?.files ?? [])].filter((file) => file.type.startsWith('image/'));
		if (!files.length) return;
		event.preventDefault();
		addPhotos(files);
	}

	function onkeydown(event: KeyboardEvent) {
		// Enter sends on computers; on touch keyboards it inserts a new line.
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing || isTouch()) return;
		event.preventDefault();
		submit();
	}

	function submit(event?: SubmitEvent) {
		event?.preventDefault();
		if (!canSend) return;

		chat.send(
			text.trim(),
			attachments.map((attachment) => attachment.url!)
		);
		text = '';
		attachments = [];
		tick().then(resize);
		if (isTouch()) textarea.blur();
		onsend();
	}

	function resize() {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	function isTouch() {
		return matchMedia('(pointer: coarse)').matches;
	}
</script>

<form onsubmit={submit}>
	{#if problem}
		<p class="problem" role="alert">{problem}</p>
	{/if}

	<div class="box">
		{#if attachments.length}
			<div class="attachments">
				{#each attachments as attachment (attachment.id)}
					<div class="attachment">
						{#if attachment.url}
							<img src={attachment.url} alt="" />
						{:else}
							<span class="spinner"></span>
						{/if}
						<button
							type="button"
							class="remove"
							onclick={() => remove(attachment.id)}
							aria-label={t.removePhoto}
						>
							<Icon name="close" size={12} />
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="row">
			<button
				type="button"
				class="round"
				onclick={() => fileInput.click()}
				aria-label={t.addPhotos}
				title={t.addPhotos}
			>
				<Icon name="plus" size={22} />
			</button>

			<textarea
				bind:this={textarea}
				bind:value={text}
				rows="1"
				placeholder={t.placeholder}
				oninput={resize}
				{onkeydown}
				{onpaste}
			></textarea>

			{#if chat.pending}
				<button type="button" class="round send" onclick={() => chat.stop()} aria-label={t.stop} title={t.stop}>
					<Icon name="stop" />
				</button>
			{:else}
				<button type="submit" class="round send" disabled={!canSend} aria-label={t.send} title={t.send}>
					<Icon name="send" />
				</button>
			{/if}
		</div>
	</div>

	<input bind:this={fileInput} type="file" accept="image/*" multiple hidden {onchange} />
</form>

<style>
	form {
		flex: none;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		padding: 4px max(12px, env(safe-area-inset-right)) calc(10px + env(safe-area-inset-bottom))
			max(12px, env(safe-area-inset-left));
	}

	.problem {
		margin: 0 0 8px;
		color: var(--danger);
		font-size: 14px;
		text-align: center;
	}

	.box {
		border: 1px solid var(--border);
		border-radius: 26px;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.attachments {
		display: flex;
		gap: 8px;
		overflow-x: auto;
		padding: 10px 10px 2px;
	}

	.attachment {
		position: relative;
		display: grid;
		flex: none;
		place-items: center;
		width: 64px;
		height: 64px;
		border-radius: 14px;
		background: var(--subtle);
	}

	.attachment img {
		width: 100%;
		height: 100%;
		border-radius: inherit;
		object-fit: cover;
	}

	.remove {
		position: absolute;
		top: 4px;
		right: 4px;
		display: grid;
		place-items: center;
		width: 22px;
		height: 22px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: rgb(0 0 0 / 0.65);
		color: #fff;
	}

	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-top-color: var(--text);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.row {
		display: flex;
		align-items: flex-end;
		gap: 4px;
		padding: 6px;
	}

	textarea {
		flex: 1;
		min-width: 0;
		max-height: 35dvh;
		margin: 0;
		padding: 8px 4px;
		border: 0;
		outline: none;
		background: transparent;
		font-size: 16px;
		line-height: 24px;
		resize: none;
	}

	textarea::placeholder {
		color: var(--muted);
	}

	.round {
		display: grid;
		flex: none;
		place-items: center;
		width: 40px;
		height: 40px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: var(--text);
	}

	.send {
		background: var(--accent);
		color: var(--accent-text);
	}

	.send:disabled {
		opacity: 0.25;
	}
</style>
