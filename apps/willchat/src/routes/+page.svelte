<script lang="ts">
	import ChatView from '$lib/components/ChatView.svelte';
	import Onboarding from '$lib/components/Onboarding.svelte';
	import { apiKey } from '$lib/settings.svelte';
</script>

{#if apiKey.value}
	<ChatView />
{:else}
	<Onboarding />
{/if}
