<script lang="ts">
	import { untrack } from 'svelte';
	import { ledger, type MovementKind, type Person } from '$lib/ledger.svelte';
	import { formatMoney, parseMoney, toAmountInput, today } from '$lib/money';
	import BankSelect from './BankSelect.svelte';
	import PersonPicker from './PersonPicker.svelte';
	import Sheet from './Sheet.svelte';

	interface Props {
		open: boolean;
		kind: MovementKind;
		/** Si se abre desde una persona, ya se sabe de quién se trata y se salta elegirla. */
		person?: Person | null;
	}

	let { open = $bindable(), kind, person = null }: Props = $props();

	let selected = $state<Person | null>(null);
	let amount = $state('');
	let date = $state(today());
	let dueDate = $state('');
	let fromBank = $state('');
	let toBank = $state('');
	let note = $state('');

	const loan = $derived(kind === 'loan');
	const title = $derived(loan ? 'Nuevo préstamo' : 'Registrar pago');

	const cents = $derived(parseMoney(amount));
	const owed = $derived(selected ? ledger.owedBy(selected.id) : 0);
	const remaining = $derived(owed - (cents ?? 0));
	// Devolver antes de prestar no existe: se pide corregir la fecha en vez de guardarla al revés.
	const badDueDate = $derived(loan && dueDate !== '' && dueDate < date);
	const complete = $derived(cents !== null && date !== '' && !badDueDate);

	// Cada vez que se abre la hoja se empieza de cero.
	$effect(() => {
		if (open) untrack(reset);
	});

	function reset() {
		selected = person;
		amount = person && !loan ? toAmountInput(ledger.owedBy(person.id)) : '';
		date = today();
		dueDate = '';
		// Mi cuenta de siempre viene precargada; la de la otra persona cambia en cada préstamo.
		fromBank = loan ? ledger.myBank : '';
		toBank = loan ? '' : ledger.myBank;
		note = '';
	}

	function pick(picked: Person) {
		selected = picked;
		// Lo normal es que paguen todo lo que deben: se propone ese monto y se puede editar.
		if (!loan) amount = toAmountInput(ledger.owedBy(picked.id));
	}

	function save() {
		if (!selected || !complete || cents === null) return;

		ledger.addMovement({
			personId: selected.id,
			kind,
			amount: cents,
			date,
			dueDate: loan ? dueDate : '',
			fromBank,
			toBank,
			note: note.trim()
		});

		// Mi banco casi nunca cambia: se recuerda como valor por omisión del siguiente movimiento.
		const mine = loan ? fromBank : toBank;
		if (mine) ledger.myBank = mine;

		open = false;
	}
</script>

<Sheet bind:open {title}>
	{#snippet leading()}
		{#if selected && !person}
			<button class="plain" type="button" onclick={() => (selected = null)}>Atrás</button>
		{:else}
			<button class="plain" type="button" onclick={() => (open = false)}>Cancelar</button>
		{/if}
	{/snippet}

	{#if !selected}
		<PersonPicker onlyDebtors={!loan} onpick={pick} />
	{:else}
		<p class="who">
			{loan ? 'Le presté a' : 'Me pagó'}
			<strong>{selected.name}</strong>
		</p>

		<div class="group">
			<label class="row">
				<span class="label">Monto</span>
				<input
					type="text"
					inputmode="decimal"
					bind:value={amount}
					placeholder="0.00"
					autocomplete="off"
					enterkeyhint="done"
				/>
			</label>
			<label class="row">
				<span class="label">{loan ? 'Se prestó' : 'Fecha'}</span>
				<input type="date" bind:value={date} max={today()} />
			</label>
			{#if loan}
				<label class="row">
					<span class="label">Se devuelve</span>
					<input type="date" bind:value={dueDate} min={date} />
				</label>
			{/if}
		</div>

		{#if loan}
			<p class="hint" class:warn={badDueDate}>
				{#if badDueDate}
					La fecha de devolución no puede ser anterior a la del préstamo.
				{:else if dueDate === ''}
					Sin fecha de devolución el préstamo nunca se marca como vencido.
				{/if}
			</p>
		{/if}

		{#if !loan && owed > 0}
			<p class="hint">
				Te debe {formatMoney(owed)}.
				{#if cents !== null}
					{#if remaining > 0}
						Quedará debiendo {formatMoney(remaining)}.
					{:else if remaining === 0}
						Queda al corriente.
					{:else}
						Te pagó {formatMoney(-remaining)} de más.
					{/if}
				{/if}
			</p>
		{/if}

		<p class="section-title">Cuentas</p>
		<div class="group">
			<BankSelect label={loan ? 'Desde mi cuenta' : 'Desde su cuenta'} bind:value={fromBank} />
			<BankSelect label={loan ? 'A su cuenta' : 'A mi cuenta'} bind:value={toBank} />
		</div>

		<div class="group">
			<label class="row">
				<span class="label">Nota</span>
				<input type="text" bind:value={note} placeholder="Opcional" autocomplete="off" />
			</label>
		</div>

		<div class="save">
			<button class="primary" type="button" disabled={!complete} onclick={save}>
				{loan ? 'Guardar préstamo' : 'Guardar pago'}
			</button>
		</div>
	{/if}
</Sheet>

<style>
	.plain {
		padding: 4px 0;
		border: 0;
		background: none;
		color: var(--link);
		font-size: 17px;
	}

	.who {
		margin: 0 4px 16px;
		color: var(--muted);
	}

	.who strong {
		color: var(--text);
		font-weight: 600;
	}

	.hint {
		margin: 8px 4px 0;
		min-height: 20px;
		color: var(--muted);
		font-size: 14px;
	}

	.hint.warn {
		color: var(--danger);
	}

	.save {
		margin-top: 24px;
	}
</style>
