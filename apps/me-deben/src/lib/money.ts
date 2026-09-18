/**
 * Los montos se guardan en centavos enteros: sumar y restar pesos como número flotante
 * acumula errores (0.1 + 0.2 ≠ 0.3) y aquí los saldos se calculan sumando movimientos.
 */

const currency = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 2
});

/** "$1,234.50" */
export function formatMoney(cents: number): string {
	return currency.format(cents / 100);
}

/** Lo que el usuario escribió en el campo de monto, a centavos. `null` si no es un monto válido. */
export function parseMoney(input: string): number | null {
	const cleaned = input.replace(/[\s,$]/g, '');
	if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '' || cleaned === '.') return null;

	const cents = Math.round(Number(cleaned) * 100);
	return Number.isFinite(cents) && cents > 0 ? cents : null;
}

/** El monto en el formato que espera el campo de texto: "1234.50". */
export function toAmountInput(cents: number): string {
	return (cents / 100).toFixed(2);
}

const longDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

/** Las fechas se guardan como "AAAA-MM-DD" y se leen como fecha local, no UTC. */
function toDate(iso: string): Date {
	const [year, month, day] = iso.split('-').map(Number);
	return new Date(year, month - 1, day);
}

export function formatDate(iso: string): string {
	return longDate.format(toDate(iso));
}

/** Fechas de este año sin el año: "3 mar". */
export function formatDateShort(iso: string): string {
	const date = toDate(iso);
	if (date.getFullYear() !== new Date().getFullYear()) return longDate.format(date);
	return shortDate.format(date).replace('.', '');
}

/** Hoy en "AAAA-MM-DD", en la zona horaria del navegador. */
export function today(): string {
	const now = new Date();
	const month = `${now.getMonth() + 1}`.padStart(2, '0');
	const day = `${now.getDate()}`.padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
}
