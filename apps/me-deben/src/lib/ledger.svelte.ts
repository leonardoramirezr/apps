import { today } from './money';

export interface Person {
	id: string;
	name: string;
}

export type MovementKind = 'loan' | 'payment';

export interface Movement {
	id: string;
	personId: string;
	/** `loan`: le presté. `payment`: ya me pagó. */
	kind: MovementKind;
	/** Centavos, siempre positivo. El signo lo da `kind`. */
	amount: number;
	/** "AAAA-MM-DD". */
	date: string;
	/** En un préstamo, mi cuenta; en un pago, la suya. Vacío si no se especificó. */
	fromBank: string;
	/** En un préstamo, su cuenta; en un pago, la mía. */
	toBank: string;
	note: string;
	/** Para desempatar movimientos con la misma fecha. */
	createdAt: number;
}

/** Una persona con su saldo ya calculado, que es lo que pintan las listas. */
export interface Balance {
	person: Person;
	/** Centavos que me debe. 0 si está al corriente. */
	owed: number;
	/** Fecha del último movimiento, o `null` si no tiene ninguno. */
	lastDate: string | null;
}

// Todas las apps del sitio comparten el origen: las claves van con prefijo.
const PEOPLE_KEY = 'me-deben:people';
const MOVEMENTS_KEY = 'me-deben:movements';
const MY_BANK_KEY = 'me-deben:my-bank';

function read<T>(key: string, sanitize: (raw: unknown) => T[]): T[] {
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? [] : sanitize(JSON.parse(raw));
	} catch {
		// Sin almacenamiento o con datos corruptos: se empieza vacío en vez de romper la app.
		return [];
	}
}

function readString(key: string): string {
	try {
		return localStorage.getItem(key) ?? '';
	} catch {
		return '';
	}
}

function save(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Almacenamiento lleno o bloqueado: los cambios viven solo en esta sesión.
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function text(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

/** Lo guardado pudo escribirlo una versión anterior: se descarta lo que no cuadre. */
function parsePeople(raw: unknown): Person[] {
	if (!Array.isArray(raw)) return [];

	return raw.filter(isRecord).flatMap((item) => {
		const id = text(item.id);
		const name = text(item.name).trim();
		return id && name ? [{ id, name }] : [];
	});
}

function parseMovements(raw: unknown): Movement[] {
	if (!Array.isArray(raw)) return [];

	return raw.filter(isRecord).flatMap((item) => {
		const id = text(item.id);
		const personId = text(item.personId);
		const amount = typeof item.amount === 'number' ? Math.round(item.amount) : 0;
		const date = /^\d{4}-\d{2}-\d{2}$/.test(text(item.date)) ? text(item.date) : today();
		if (!id || !personId || !(amount > 0)) return [];

		return [
			{
				id,
				personId,
				kind: item.kind === 'payment' ? ('payment' as const) : ('loan' as const),
				amount,
				date,
				fromBank: text(item.fromBank),
				toBank: text(item.toBank),
				note: text(item.note),
				createdAt: typeof item.createdAt === 'number' ? item.createdAt : 0
			}
		];
	});
}

function newId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** Más reciente primero; a igual fecha, lo capturado después. */
function byNewest(a: Movement, b: Movement): number {
	return b.date.localeCompare(a.date) || b.createdAt - a.createdAt;
}

class Ledger {
	people = $state<Person[]>([]);
	movements = $state<Movement[]>([]);

	/** La cuenta desde la que suelo prestar, para no elegirla cada vez. */
	#myBank = $state('');

	constructor() {
		this.people = read(PEOPLE_KEY, parsePeople);
		this.movements = read(MOVEMENTS_KEY, parseMovements);
		this.#myBank = readString(MY_BANK_KEY);
	}

	get myBank(): string {
		return this.#myBank;
	}

	set myBank(bank: string) {
		this.#myBank = bank;
		try {
			localStorage.setItem(MY_BANK_KEY, bank);
		} catch {
			// Sin almacenamiento: el valor por omisión dura lo que la sesión.
		}
	}

	/** Saldo por persona: préstamos menos pagos, en centavos. */
	#balances = $derived.by(() => {
		const totals = new Map<string, number>();
		for (const movement of this.movements) {
			const signed = movement.kind === 'loan' ? movement.amount : -movement.amount;
			totals.set(movement.personId, (totals.get(movement.personId) ?? 0) + signed);
		}
		return totals;
	});

	#lastDates = $derived.by(() => {
		const dates = new Map<string, string>();
		for (const movement of this.movements) {
			const current = dates.get(movement.personId);
			if (!current || movement.date > current) dates.set(movement.personId, movement.date);
		}
		return dates;
	});

	/** Todas las personas con su saldo, las que más deben primero. */
	balances = $derived.by((): Balance[] =>
		this.people
			.map((person) => ({
				person,
				owed: this.#balances.get(person.id) ?? 0,
				lastDate: this.#lastDates.get(person.id) ?? null
			}))
			.sort((a, b) => b.owed - a.owed || a.person.name.localeCompare(b.person.name, 'es'))
	);

	/** Quienes me deben algo ahora mismo. */
	debtors = $derived(this.balances.filter((entry) => entry.owed > 0));

	/** Registrados que no deben nada: ya pagaron, o apenas se agregaron. */
	settled = $derived(this.balances.filter((entry) => entry.owed <= 0));

	/** Suma de lo que me deben. Un saldo a favor de alguien no resta al total. */
	total = $derived(this.debtors.reduce((sum, entry) => sum + entry.owed, 0));

	owedBy(personId: string): number {
		return this.#balances.get(personId) ?? 0;
	}

	movementsOf(personId: string): Movement[] {
		return this.movements.filter((movement) => movement.personId === personId).sort(byNewest);
	}

	/** Busca por nombre sin distinguir mayúsculas ni espacios, para no duplicar personas. */
	findByName(name: string): Person | undefined {
		const wanted = name.trim().toLocaleLowerCase('es');
		return this.people.find((person) => person.name.toLocaleLowerCase('es') === wanted);
	}

	addPerson(name: string): Person {
		this.people.push({ id: newId(), name: name.trim() });
		save(PEOPLE_KEY, this.people);
		// El elemento del arreglo, no el objeto suelto: así quien lo reciba ve los cambios de nombre.
		return this.people[this.people.length - 1];
	}

	renamePerson(id: string, name: string) {
		const person = this.people.find((candidate) => candidate.id === id);
		if (!person) return;

		person.name = name.trim();
		save(PEOPLE_KEY, this.people);
	}

	/** Borra a la persona y todo su historial. */
	removePerson(id: string) {
		this.people = this.people.filter((person) => person.id !== id);
		this.movements = this.movements.filter((movement) => movement.personId !== id);
		save(PEOPLE_KEY, this.people);
		save(MOVEMENTS_KEY, this.movements);
	}

	addMovement(movement: Omit<Movement, 'id' | 'createdAt'>) {
		this.movements.push({ ...movement, id: newId(), createdAt: Date.now() });
		save(MOVEMENTS_KEY, this.movements);
	}

	removeMovement(id: string) {
		this.movements = this.movements.filter((movement) => movement.id !== id);
		save(MOVEMENTS_KEY, this.movements);
	}
}

export const ledger = new Ledger();
