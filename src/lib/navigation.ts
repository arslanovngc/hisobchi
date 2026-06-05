import type { Step } from '../types/bill';

export function getStepFromSearch(): Step {
  if (typeof window === 'undefined') return 1;
  return new URLSearchParams(window.location.search).get('step') === 'people' ? 2 : 1;
}

export function persistStep(step: Step) {
  const url = new URL(window.location.href);
  url.searchParams.set('step', step === 1 ? 'meals' : 'people');
  window.history.replaceState(null, '', url);
}

export function getMealLabel(count: number, t: (key: string) => string) {
  return `${t('Meals')} (${count})`;
}

export function getPeopleLabel(count: number, t: (key: string) => string) {
  return `${t('People')} (${count})`;
}
