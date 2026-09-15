<script lang="ts">
	// Decorative iPad status bar, only visible on larger screens (phones show their own).
	const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric'
	});

	let now = $state(new Date());

	const time = $derived(
		timeFormat
			.formatToParts(now)
			.filter((part) => part.type !== 'dayPeriod')
			.map((part) => part.value)
			.join('')
			.trim()
	);

	const date = $derived(dateFormat.format(now).replaceAll(',', ''));

	$effect(() => {
		const timer = setInterval(() => (now = new Date()), 10_000);
		return () => clearInterval(timer);
	});
</script>

<div class="status-bar" aria-hidden="true">
	<span class="clock">
		<span class="time">{time}</span>
		<span>{date}</span>
	</span>
	<span class="indicators">
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

	/* Keep in sync with the iPad media query in +page.svelte. */
	@media (min-width: 640px) and (min-height: 640px) {
		.status-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			flex: none;
			height: calc(32 * var(--u));
			padding: 0 calc(24 * var(--u));
			color: #fff;
			font-size: calc(15 * var(--u));
			font-weight: 600;
			letter-spacing: -0.01em;
		}
	}

	.clock {
		display: flex;
		gap: calc(6 * var(--u));
	}

	.time {
		font-variant-numeric: tabular-nums;
	}

	.indicators {
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
