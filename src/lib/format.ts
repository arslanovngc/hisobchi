export const amount = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function round(value: number) {
  return Math.round(value * 100) / 100;
}
