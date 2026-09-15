<script lang="ts">
	import { apps } from '$lib/apps';
	import StatusBar from '$lib/StatusBar.svelte';

	// 4 columns × 6 rows, like an iPhone home screen page.
	const PAGE_SIZE = 24;

	const pages = Array.from({ length: Math.max(1, Math.ceil(apps.length / PAGE_SIZE)) }, (_, i) =>
		apps.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE)
	);

	let currentPage = $state(0);

	function onscroll({ currentTarget: pager }: UIEvent & { currentTarget: HTMLElement }) {
		currentPage = Math.round(pager.scrollLeft / pager.clientWidth);
	}
</script>

<div class="stage">
	<div class="device">
		<div class="screen">
			<StatusBar />

			<div class="pager" {onscroll}>
				{#each pages as page, index (index)}
					<nav class="page" aria-label="Apps">
						{#each page as app (app.slug)}
							<a class="app" href={app.href} data-sveltekit-reload>
								<img class="icon" src={app.icon} alt="" draggable="false" />
								<span class="label">{app.name}</span>
							</a>
						{/each}
					</nav>
				{/each}
			</div>

			<div class="dots" aria-hidden="true">
				{#each pages as _, index (index)}
					<span class="dot" class:active={index === currentPage}></span>
				{/each}
			</div>

			<div class="dock"></div>
			<div class="home-indicator"></div>
		</div>
	</div>
</div>

<style>
	/* All sizes are expressed in iPhone points (`--u`), scaled to fit the viewport. */
	.stage {
		--u: min(1px, calc(100vw / 390));
		position: fixed;
		inset: 0;
	}

	.device {
		height: 100%;
	}

	.screen {
		position: relative;
		display: flex;
		flex-direction: column;
		box-sizing: border-box;
		height: 100%;
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
		color: #fff;
		text-decoration: none;
		outline: none;
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

	.dock {
		flex: none;
		height: calc(92 * var(--u));
		margin: 0 calc(12 * var(--u));
		border-radius: calc(34 * var(--u));
		background: rgb(255 255 255 / 0.18);
		box-shadow: inset 0 0 0 0.5px rgb(255 255 255 / 0.3);
		-webkit-backdrop-filter: blur(40px) saturate(120%);
		backdrop-filter: blur(40px) saturate(120%);
	}

	.home-indicator {
		display: none;
	}

	/* On larger screens, draw the home screen inside an iPhone. */
	@media (min-width: 640px) and (min-height: 640px) {
		.stage {
			--u: min(1px, calc((100dvh - 64px) / 868));
			display: grid;
			place-items: center;
			background: radial-gradient(circle at 50% 40%, #f5f5f7, #d9d9df);
		}

		.device {
			height: auto;
			padding: calc(12 * var(--u));
			border-radius: calc(68 * var(--u));
			background: #111114;
			box-shadow:
				inset 0 0 0 calc(2 * var(--u)) #3b3b42,
				0 calc(30 * var(--u)) calc(80 * var(--u)) rgb(0 0 0 / 0.35);
		}

		.screen {
			width: calc(390 * var(--u));
			height: calc(844 * var(--u));
			padding-top: 0;
			padding-bottom: calc(8 * var(--u));
			border-radius: calc(56 * var(--u));
		}

		.page {
			padding-top: calc(20 * var(--u));
		}

		.home-indicator {
			display: block;
			flex: none;
			width: calc(134 * var(--u));
			height: calc(5 * var(--u));
			margin: calc(10 * var(--u)) auto 0;
			border-radius: calc(3 * var(--u));
			background: #fff;
		}
	}

	@media (min-width: 640px) and (min-height: 640px) and (prefers-color-scheme: dark) {
		.stage {
			background: radial-gradient(circle at 50% 40%, #26262c, #0d0d10);
		}
	}
</style>
