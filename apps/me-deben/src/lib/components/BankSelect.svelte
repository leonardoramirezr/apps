<script lang="ts">
	import { allBanks, bankGroups } from '$lib/banks';

	interface Props {
		label: string;
		value: string;
	}

	let { label, value = $bindable() }: Props = $props();

	/** Un banco guardado que ya salió de la lista sigue siendo una opción válida. */
	const unlisted = $derived(value && !allBanks.includes(value) ? value : '');
</script>

<label class="row">
	<span class="label">{label}</span>
	<select bind:value>
		<option value="">Sin especificar</option>
		{#if unlisted}
			<option value={unlisted}>{unlisted}</option>
		{/if}
		{#each bankGroups as group (group.label)}
			<optgroup label={group.label}>
				{#each group.banks as bank (bank)}
					<option value={bank}>{bank}</option>
				{/each}
			</optgroup>
		{/each}
	</select>
</label>

<style>
	select {
		color: var(--link);
	}

	/* El menú desplegable se lee mejor alineado a la izquierda que el valor de la fila. */
	option {
		text-align: left;
	}
</style>
