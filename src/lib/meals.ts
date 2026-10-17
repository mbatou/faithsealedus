// The two dinner options served at Maison Madera (Dakar, 5 December 2026).
// Stored in the database by stable id; the French dish names are the canonical
// labels shown in both languages.

export const MEAL_IDS = ['volaille', 'boeuf'] as const;

export type MealId = (typeof MEAL_IDS)[number];

export const MEAL_NAMES: Record<MealId, string> = {
  volaille: 'Jambonnette de volaille à l’estragon',
  boeuf: 'Filet de bœuf au poivre',
};

export function isMealId(value: unknown): value is MealId {
  return typeof value === 'string' && (MEAL_IDS as readonly string[]).includes(value);
}
