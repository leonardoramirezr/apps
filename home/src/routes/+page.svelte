<script lang="ts">
	import { MediaQuery } from 'svelte/reactivity';
	import { apps } from '$lib/apps';
	import StatusBar from '$lib/StatusBar.svelte';

	// Keep in sync with the iPad media query below and in StatusBar.svelte.
	const large = new MediaQuery('(min-width: 640px) and (min-height: 640px)');

	// iPhone: 4 columns × 6 rows. iPad: 6 × 5 in landscape, 5 × 6 in portrait.
	const pageSize = $derived(large.current ? 30 : 24);

	const pages = $derived(
		Array.from({ length: Math.max(1, Math.ceil(apps.length / pageSize)) }, (_, i) =>
			apps.slice(i * pageSize, (i + 1) * pageSize)
		)
	);

	let currentPage = $state(0);

	function onscroll({ currentTarget: pager }: UIEvent & { currentTarget: HTMLElement }) {
		currentPage = Math.round(pager.scrollLeft / pager.clientWidth);
	}
</script>

<div class="screen">
	<StatusBar />

	<div class="pager" {onscroll}>
		{#each pages as page, index (index)}
			<nav class="page" aria-label="Apps">
				{#each page as app (app.slug)}
					{#if 'href' in app}
						<a class="app" href={app.href} data-sveltekit-reload>
							<img class="icon" src={app.icon} alt="" draggable="false" />
							<span class="label">{app.name}</span>
						</a>
					{:else}
						<button class="app" type="button" onclick={app.action}>
							<img class="icon" src={app.icon} alt="" draggable="false" />
							<span class="label">{app.name}</span>
						</button>
					{/if}
				{/each}
			</nav>
		{/each}
	</div>

	<div class="dots" aria-hidden="true">
		{#each pages as _, index (index)}
			<span class="dot" class:active={index === Math.min(currentPage, pages.length - 1)}></span>
		{/each}
	</div>
</div>

<style>
	/* All sizes are expressed in device points (`--u`), scaled to fit the viewport. */
	.screen {
		--u: min(1px, calc(100vw / 390));
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding-top: calc(env(safe-area-inset-top) + 24 * var(--u));
		padding-bottom: calc(env(safe-area-inset-bottom) + 8 * var(--u));
		background:
			radial-gradient(90% 55% at 0% 0%, rgb(255 150 90 / 0.95), transparent 70%),
			radial-gradient(80% 50% at 100% 18%, rgb(240 70 160 / 0.9), transparent 70%),
			radial-gradient(100% 60% at 0% 100%, rgb(40 120 255 / 0.9), transparent 70%),
			radial-gradient(90% 55% at 100% 85%, rgb(130 70 240 / 0.95), transparent 70%),
			linear-gradient(170deg, #4a2a8a, #1c1446);
	}

	/* iOS home-screen web apps size the fixed viewport (and dvh) short by the top safe-area inset,
	   leaving an empty band at the bottom; the large viewport covers the whole screen. */
	@media (display-mode: standalone) {
		.screen {
			bottom: auto;
			height: 100lvh;
		}
	}

	.pager {
		display: flex;
		flex: 1;
		min-height: 0;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
	}

	.pager::-webkit-scrollbar {
		display: none;
	}

	.page {
		flex: 0 0 100%;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-auto-rows: max-content;
		align-content: start;
		row-gap: calc(24 * var(--u));
		box-sizing: border-box;
		padding: calc(8 * var(--u)) calc(18 * var(--u));
		overflow-y: auto;
		scroll-snap-align: start;
	}

	.app {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: calc(6 * var(--u));
		min-width: 0;
		padding: 0;
		border: 0;
		background: none;
		font: inherit;
		color: #fff;
		text-decoration: none;
		outline: none;
		cursor: pointer;
	}

	.icon {
		display: block;
		width: calc(62 * var(--u));
		height: calc(62 * var(--u));
		border-radius: 22.5%;
		box-shadow: 0 calc(2 * var(--u)) calc(10 * var(--u)) rgb(0 0 0 / 0.18);
		transition:
			filter 0.15s,
			transform 0.15s;
	}

	.app:active .icon {
		filter: brightness(0.7);
		transform: scale(0.96);
	}

	.app:focus-visible .icon {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	.label {
		max-width: calc(78 * var(--u));
		overflow: hidden;
		font-size: calc(12 * var(--u));
		font-weight: 500;
		line-height: 1.2;
		letter-spacing: 0.01em;
		text-align: center;
		text-overflow: ellipsis;
		text-shadow: 0 1px 3px rgb(0 0 0 / 0.3);
		white-space: nowrap;
	}

	.dots {
		display: flex;
		flex: none;
		justify-content: center;
		gap: calc(8 * var(--u));
		padding: calc(14 * var(--u)) 0;
	}

	.dot {
		width: calc(7 * var(--u));
		height: calc(7 * var(--u));
		border-radius: 50%;
		background: rgb(255 255 255 / 0.4);
	}

	.dot.active {
		background: #fff;
	}

	/* On larger screens, fill the viewport with an iPad home screen (1180 × 820 points in landscape). */
	@media (min-width: 640px) and (min-height: 640px) {
		.screen {
			--u: clamp(0.75px, min(100vw / 1180, 100dvh / 820), 1.5px);
			padding-top: 0;
			padding-bottom: calc(12 * var(--u));
		}

		.page {
			grid-template-columns: repeat(6, 1fr);
			grid-template-rows: repeat(5, 1fr);
			align-content: stretch;
			row-gap: 0;
			padding: calc(28 * var(--u)) calc(80 * var(--u)) 0;
		}

		.app {
			align-self: start;
			gap: calc(8 * var(--u));
		}

		.icon {
			width: calc(76 * var(--u));
			height: calc(76 * var(--u));
		}

		.label {
			max-width: calc(110 * var(--u));
			font-size: calc(13 * var(--u));
		}

		.dots {
			padding: calc(18 * var(--u)) 0;
		}
	}

	@media (min-width: 640px) and (min-height: 640px) and (max-aspect-ratio: 1/1) {
		.screen {
			--u: clamp(0.75px, min(100vw / 820, 100dvh / 1180), 1.5px);
		}

		.page {
			grid-template-columns: repeat(5, 1fr);
			grid-template-rows: repeat(6, 1fr);
			padding-inline: calc(48 * var(--u));
		}
	}
</style>
