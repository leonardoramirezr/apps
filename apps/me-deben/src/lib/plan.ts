/**
 * Acuerdo de pago: en vez de una sola fecha de devolución, el préstamo se cobra por semana
 * o por mes a partir de la primera fecha de cobro, siempre el mismo día de la semana (o del mes).
 */

import { toDate, toIso } from './money';

/** Cada cuándo se cobra. Vacío es un préstamo sin acuerdo. */
export type Plan = '' | 'weekly' | 'monthly';

/** Los dos acuerdos que se pueden pactar, en el orden en que se ofrecen. */
export const plans: { value: Plan; label: string; per: string }[] = [
	{ value: 'weekly', label: 'Por semana', per: 'por semana' },
	{ value: 'monthly', label: 'Por mes', per: 'por mes' }
];

/** Lo guardado pudo escribirlo otra versión: solo estos dos valores son un acuerdo. */
export function isPlan(value: unknown): value is Plan {
	return value === 'weekly' || value === 'monthly';
}

/** "por semana" o "por mes", para armar frases. Vacío si no hay acuerdo. */
export function perLabel(plan: Plan): string {
	return plans.find((option) => option.value === plan)?.per ?? '';
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

/**
 * La fecha del cobro número `index` (el primero es el 0). Al sumar meses el día se recorta
 * al último del mes: un acuerdo que empieza el 31 de enero cobra el 28 de febrero.
 */
export function chargeDate(start: string, plan: Plan, index: number): string {
	const first = toDate(start);
	if (plan === 'weekly') {
		return toIso(new Date(first.getFullYear(), first.getMonth(), first.getDate() + index * 7));
	}

	const month = new Date(first.getFullYear(), first.getMonth() + index, 1);
	const day = Math.min(first.getDate(), daysInMonth(month.getFullYear(), month.getMonth()));
	return toIso(new Date(month.getFullYear(), month.getMonth(), day));
}

/** Cuántos cobros ya pasaron antes de `on`. El cobro del mismo día todavía no se vence. */
export function chargesDueBefore(start: string, plan: Plan, on: string): number {
	if (plan === '' || start === '' || on <= start) return 0;

	const first = toDate(start);
	const until = toDate(on);

	if (plan === 'weekly') {
		// Con horario de verano un día dura 23 o 25 horas: se redondea a días completos.
		const days = Math.round((until.getTime() - first.getTime()) / 86_400_000);
		return Math.floor((days - 1) / 7) + 1;
	}

	const months =
		(until.getFullYear() - first.getFullYear()) * 12 + until.getMonth() - first.getMonth();
	const day = Math.min(first.getDate(), daysInMonth(until.getFullYear(), until.getMonth()));
	// El cobro de este mes solo cuenta si su día ya quedó atrás.
	return Math.max(0, until.getDate() <= day ? months : months + 1);
}

/** En cuántos cobros se cubre un préstamo. El último es el que sobra, y puede ser menor. */
export function chargeCount(amount: number, installment: number): number {
	return installment > 0 ? Math.ceil(amount / installment) : 0;
}
