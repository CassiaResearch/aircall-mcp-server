// Shared formatting helpers

// Convert an Aircall timestamp to an ISO 8601 string.
// The API mixes UNIX-second integers and ISO strings across endpoints,
// and some documented fields are absent in practice — never crash on them.
export function toIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
