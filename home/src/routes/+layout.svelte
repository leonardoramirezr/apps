<script lang="ts">
	import icon from '$lib/icon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={icon} />
</svelte:head>

{@render children()}

<style>
	:global(html, body) {
		margin: 0;
		height: 100%;
	}

	:global(body) {
		font-family:
			-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', system-ui, sans-serif;
		-webkit-font-smoothing: antialiased;
		-webkit-tap-highlight-color: transparent;
		-webkit-user-select: none;
		user-select: none;
		overscroll-behavior: none;
	}
</style>
