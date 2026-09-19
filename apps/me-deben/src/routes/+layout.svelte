<script lang="ts">
	import '../app.css';
	import icon from '../../icon.svg';
	import { ledger } from '$lib/ledger.svelte';

	let { children } = $props();

	// La app se queda abierta de un día para otro: al volver a ella se recalcula lo vencido.
	$effect(() => {
		const refresh = () => ledger.refreshToday();
		document.addEventListener('visibilitychange', refresh);
		return () => document.removeEventListener('visibilitychange', refresh);
	});
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href={icon} />
</svelte:head>

{@render children()}
