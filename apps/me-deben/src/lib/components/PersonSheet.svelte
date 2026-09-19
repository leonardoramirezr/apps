<script lang="ts">
	import { ledger, type Movement, type Person } from '$lib/ledger.svelte';
	import { formatDate, formatDateShort, formatMoney } from '$lib/money';
	import { perLabel } from '$lib/plan';
	import MovementSheet from './MovementSheet.svelte';
	import Sheet from './Sheet.svelte';

	interface Props {
		open: boolean;
		person: Person;
	}

	let { open = $bindable(), person }: Props = $props();

	let editing = $state(false);
	let lending = $state(false);
	let collecting = $state(false);

	const owed = $derived(ledger.owedBy(person.id));
	const overdue = $derived(ledger.overdueBy(person.id));
	const movements = $derived(ledger.movementsOf(person.id));

	// Salir del modo edición al cerrar, para no reabrir la hoja con los botones rojos puestos.
	$effect(() => {
		if (!open) editing = false;
	});

	/** "BBVA México → Nu México", o lo que se haya capturado de las dos cuentas. */
	function route(movement: Movement): string {
		const { fromBank: from, toBank: to } = movement;
		if (from && to) return `${from} → ${to}`;
		if (from) return `Desde ${from}`;
		if (to) return `A ${to}`;
		return '';
	}

	function removeMovement(movement: Movement) {
		const what = movement.kind === 'loan' ? 'préstamo' : 'pago';
		if (!confirm(`¿Eliminar este ${what} de ${formatMoney(movement.amount)}?`)) return;

		ledger.removeMovement(movement.id);
		if (ledger.movementsOf(person.id).length === 0) editing = false;
	}

	function removePerson() {
		const warning =
			movements.length > 0
				? `¿Eliminar a ${person.name}? También se borran sus ${movements.length} movimiento(s).`
				: `¿Eliminar a ${person.name}?`;
		if (!confirm(warning)) return;

		ledger.removePerson(person.id);
		open = false;
	}
</script>

<Sheet bind:open title={person.name}>
	{#snippet trailing()}
		<button class="plain" type="button" onclick={() => (open = false)}>Listo</button>
	{/snippet}

	<div class="balance">
		{#if owed > 0}
			<p class="caption">Te debe en total</p>
			<p class="amount total">{formatMoney(owed)}</p>
			<p class="overdue" class:late={overdue > 0}>
				{#if overdue > 0}
					Ya venció <strong class="amount">{formatMoney(overdue)}</strong>
				{:else}
					Al corriente: nada vencido
				{/if}
			</p>
		{:else if owed === 0}
			<p class="caption">Sin adeudo</p>
			<p class="amount total clear">{formatMoney(0)}</p>
		{:else}
			<p class="caption">Le debes de más</p>
			<p class="amount total clear">{formatMoney(-owed)}</p>
		{/if}
	</div>

	<div class="actions">
		<button type="button" onclick={() => (lending = true)}>
			<span class="sign" aria-hidden="true">+</span>
			Prestar
		</button>
		<button type="button" disabled={owed <= 0} onclick={() => (collecting = true)}>
			<span class="sign minus" aria-hidden="true">−</span>
			Me pagó
		</button>
	</div>

	<div class="history-title">
		<p class="section-title">Movimientos</p>
		{#if movements.length > 0}
			<button class="plain small" type="button" onclick={() => (editing = !editing)}>
				{editing ? 'Listo' : 'Editar'}
			</button>
		{/if}
	</div>

	{#if movements.length === 0}
		<p class="empty">Todavía no hay préstamos registrados.</p>
	{:else}
		<div class="group">
			{#each movements as movement (movement.id)}
				<div class="row movement">
					{#if editing}
						<button
							class="remove"
							type="button"
							aria-label="Eliminar movimiento"
							onclick={() => removeMovement(movement)}
						>
							−
						</button>
					{/if}
					<div class="detail">
						<p class="kind">{movement.kind === 'loan' ? 'Préstamo' : 'Pago'}</p>
						<p class="meta">
							{formatDate(movement.date)}{#if route(movement)}&nbsp;· {route(movement)}{/if}
						</p>
						{#if movement.plan !== ''}
							{@const next = ledger.nextChargeOn(movement)}
							<p class="due" class:late={ledger.isOverdue(movement)}>
								{formatMoney(movement.planAmount)}
								{perLabel(movement.plan)}
								{#if ledger.isOverdue(movement)}
									· ya venció <span class="amount">{formatMoney(ledger.overdueOn(movement))}</span>
								{:else if ledger.pendingOn(movement) === 0}
									· pagado
								{:else if next !== ''}
									· próximo cobro el {formatDateShort(next)}
								{/if}
							</p>
						{:else if movement.kind === 'loan' && movement.dueDate}
							<p class="due" class:late={ledger.isOverdue(movement)}>
								{#if ledger.isOverdue(movement)}
									Venció el {formatDateShort(movement.dueDate)} ·
									<span class="amount">{formatMoney(ledger.pendingOn(movement))}</span> sin pagar
								{:else if ledger.pendingOn(movement) === 0}
									Pagado (vencía el {formatDateShort(movement.dueDate)})
								{:else}
									Se devuelve el {formatDateShort(movement.dueDate)}
								{/if}
							</p>
						{/if}
						{#if movement.note}
							<p class="note">{movement.note}</p>
						{/if}
					</div>
					<span class="amount" class:out={movement.kind === 'loan'} class:in={movement.kind === 'payment'}>
						{movement.kind === 'loan' ? '+' : '−'}{formatMoney(movement.amount)}
					</span>
				</div>
			{/each}
		</div>
	{/if}

	<p class="section-title">Persona</p>
	<div class="group">
		<label class="row">
			<span class="label">Nombre</span>
			<input
				type="text"
				value={person.name}
				autocapitalize="words"
				onchange={(event) => {
					const name = event.currentTarget.value.trim();
					if (name) ledger.renamePerson(person.id, name);
					else event.currentTarget.value = person.name;
				}}
			/>
		</label>
		<button class="row delete" type="button" onclick={removePerson}>Eliminar persona</button>
	</div>
</Sheet>

<MovementSheet bind:open={lending} kind="loan" {person} />
<MovementSheet bind:open={collecting} kind="payment" {person} />

<style>
	.plain {
		padding: 4px 0;
		border: 0;
		background: none;
		color: var(--link);
		font-size: 17px;
	}

	.plain.small {
		font-size: 15px;
	}

	.balance {
		padding: 8px 0 20px;
		text-align: center;
	}

	.caption {
		margin: 0 0 4px;
		color: var(--muted);
		font-size: 14px;
	}

	.total {
		margin: 0;
		font-size: 38px;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.total.clear {
		color: var(--muted);
	}

	.overdue {
		margin: 8px 0 0;
		color: var(--muted);
		font-size: 15px;
	}

	.overdue.late {
		color: var(--danger);
	}

	.overdue strong {
		font-weight: 600;
	}

	.actions {
		display: flex;
		gap: 12px;
	}

	.actions button {
		display: flex;
		flex: 1;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
		border: 0;
		border-radius: 12px;
		background: var(--group);
		font-size: 16px;
		font-weight: 500;
	}

	.actions button:disabled {
		opacity: 0.4;
	}

	.sign {
		display: grid;
		width: 24px;
		height: 24px;
		place-items: center;
		border-radius: 50%;
		background: var(--out);
		color: #fff;
		font-size: 17px;
		line-height: 1;
	}

	.sign.minus {
		background: var(--in);
	}

	.history-title {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
	}

	.empty {
		margin: 0 4px;
		color: var(--muted);
	}

	.movement {
		gap: 10px;
	}

	.detail {
		flex: 1;
		min-width: 0;
	}

	.kind {
		margin: 0;
		font-size: 16px;
	}

	.meta,
	.due,
	.note {
		margin: 2px 0 0;
		color: var(--muted);
		font-size: 13px;
	}

	.due.late {
		color: var(--danger);
	}

	.note {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.amount {
		flex: none;
		font-weight: 500;
	}

	.amount.out {
		color: var(--out);
	}

	.amount.in {
		color: var(--in);
	}

	.remove {
		display: grid;
		width: 24px;
		height: 24px;
		flex: none;
		place-items: center;
		border: 0;
		border-radius: 50%;
		background: var(--danger);
		color: #fff;
		font-size: 17px;
		line-height: 1;
	}

	.delete {
		width: 100%;
		color: var(--danger);
	}

	.delete:active {
		background: var(--hover);
	}
</style>
