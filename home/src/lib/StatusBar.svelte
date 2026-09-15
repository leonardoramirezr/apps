<script lang="ts">
	// Decorative iPhone status bar, only visible when the home is drawn inside a device frame.
	const format = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });

	let now = $state(new Date());

	const time = $derived(
		format
			.formatToParts(now)
			.filter((part) => part.type !== 'dayPeriod')
			.map((part) => part.value)
			.join('')
			.trim()
	);

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 10_000);
		return () => clearInterval(timer);
	});
</script>

<div class="status-bar" aria-hidden="true">
	<span class="time">{time}</span>
	<span class="island"></span>
	<span class="indicators">
		<svg viewBox="0 0 18 12" width="18" height="12">
			<rect x="0" y="8" width="3" height="4" rx="1" />
			<rect x="5" y="5.5" width="3" height="6.5" rx="1" />
			<rect x="10" y="3" width="3" height="9" rx="1" />
			<rect x="15" y="0" width="3" height="12" rx="1" />
		</svg>
		<svg viewBox="0 0 16 12" width="16" height="12">
			<path
				d="M8 2.4c2.2 0 4.2.8 5.7 2.2l1.2-1.3A10 10 0 0 0 8 .6 10 10 0 0 0 1.1 3.3l1.2 1.3A8.2 8.2 0 0 1 8 2.4Zm0 3.6c1.2 0 2.3.4 3.2 1.2l1.2-1.3A6.4 6.4 0 0 0 8 4.2c-1.7 0-3.2.6-4.4 1.7l1.2 1.3C5.7 6.4 6.8 6 8 6Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.5l1.3-1.4c-.3-.3-.8-.5-1.3-.5Z"
			/>
		</svg>
		<svg viewBox="0 0 27 13" width="27" height="13">
			<rect x="0.5" y="0.5" width="23" height="12" rx="3.8" fill="none" stroke="currentColor" opacity="0.4" />
			<rect x="2" y="2" width="20" height="9" rx="2.5" />
			<path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" opacity="0.4" />
		</svg>
	</span>
</div>

<style>
	.status-bar {
		display: none;
	}

	/* Keep in sync with the device-frame media query in +page.svelte. */
	@media (min-width: 640px) and (min-height: 640px) {
		.status-bar {
			position: relative;
			display: grid;
			grid-template-columns: 1fr calc(126 * var(--u)) 1fr;
			align-items: center;
			flex: none;
			height: calc(54 * var(--u));
			padding: 0 calc(22 * var(--u));
			color: #fff;
		}
	}

	.time {
		justify-self: center;
		font-size: calc(17 * var(--u));
		font-weight: 600;
		letter-spacing: -0.01em;
		font-variant-numeric: tabular-nums;
	}

	.island {
		justify-self: center;
		width: calc(124 * var(--u));
		height: calc(36 * var(--u));
		border-radius: calc(18 * var(--u));
		background: #000;
	}

	.indicators {
		justify-self: center;
		display: flex;
		align-items: center;
		gap: calc(6 * var(--u));
	}

	svg {
		fill: currentColor;
		width: auto;
		height: calc(12 * var(--u));
	}
</style>
