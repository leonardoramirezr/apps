<script lang="ts">
	import { t } from '$lib/i18n';

	let {
		label,
		value = $bindable(),
		options
	}: { label: string; value: string; options: string[] } = $props();

	// Model IDs never contain spaces, so this can't clash with one.
	const CUSTOM = 'custom model';

	let custom = $state(false);
	let draft = $state('');

	function onchange(event: Event & { currentTarget: HTMLSelectElement }) {
		custom = event.currentTarget.value === CUSTOM;
		if (custom) draft = '';
		else value = event.currentTarget.value;
	}

	function commit(event?: SubmitEvent) {
		event?.preventDefault();
		const id = draft.trim();
		if (id) value = id;
		if (id || !event) custom = false;
	}
</script>

<div class="model">
	<label>
		<span>{label}</span>
		<select value={custom ? CUSTOM : value} {onchange}>
			{#each options as option (option)}
				<option value={option}>{option}</option>
			{/each}
			<option value={CUSTOM}>{t.customModel}</option>
		</select>
	</label>

	{#if custom}
		<form onsubmit={commit}>
			<!-- svelte-ignore a11y_autofocus -->
			<input
				bind:value={draft}
				placeholder={t.modelId}
				aria-label={label}
				autocapitalize="off"
				autocomplete="off"
				spellcheck="false"
				autofocus
				onblur={() => commit()}
			/>
		</form>
	{/if}
</div>

<style>
	.model + :global(.model) {
		border-top: 1px solid var(--border);
	}

	label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 0 16px;
	}

	span {
		flex: none;
		padding: 12px 0;
	}

	select {
		flex: 1;
		min-width: 0;
		padding: 12px 0;
		border: 0;
		outline: none;
		background: transparent;
		color: var(--muted);
		font-size: 16px;
		text-align: right;
		text-align-last: right;
		text-overflow: ellipsis;
	}

	form {
		padding: 0 16px 12px;
	}

	input {
		width: 100%;
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--bg);
		font-family: var(--mono);
		font-size: 16px;
	}
</style>
