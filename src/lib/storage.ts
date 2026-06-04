import type { Allocation, Item, Person } from '../types/bill';

const BILL_STORAGE_KEY = 'hisobchi.bill.v1';
const NAME_SUGGESTIONS_STORAGE_KEY = 'hisobchi.nameSuggestions.v1';

type SavedBillState = {
  schemaVersion: 1;
  items: Item[];
  people: Person[];
  allocations: Allocation;
  taxPercent: number;
  serviceFee: number;
};

export type BillState = Omit<SavedBillState, 'schemaVersion'>;

export const emptyBillState: BillState = {
  items: [],
  people: [],
  allocations: {},
  taxPercent: 0,
  serviceFee: 0,
};

export function loadBillState(): BillState {
  try {
    const raw = localStorage.getItem(BILL_STORAGE_KEY);
    if (!raw) return emptyBillState;

    const parsed = JSON.parse(raw) as SavedBillState;
    if (parsed.schemaVersion !== 1) return emptyBillState;

    return {
      items: parsed.items ?? [],
      people: parsed.people ?? [],
      allocations: parsed.allocations ?? {},
      taxPercent: parsed.taxPercent ?? 0,
      serviceFee: parsed.serviceFee ?? 0,
    };
  } catch {
    return emptyBillState;
  }
}

export function saveBillState(state: BillState) {
  localStorage.setItem(BILL_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, ...state }));
}

export function clearBillState() {
  localStorage.removeItem(BILL_STORAGE_KEY);
}

export function loadNameSuggestions() {
  try {
    const raw = localStorage.getItem(NAME_SUGGESTIONS_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];

    return Array.isArray(parsed) ? normalizeNames(parsed.filter((name): name is string => typeof name === 'string')) : [];
  } catch {
    return [];
  }
}

export function saveNameSuggestions(names: string[]) {
  localStorage.setItem(NAME_SUGGESTIONS_STORAGE_KEY, JSON.stringify(normalizeNames(names)));
}

export function clearNameSuggestions() {
  localStorage.removeItem(NAME_SUGGESTIONS_STORAGE_KEY);
}

export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function normalizeNames(names: string[]) {
  const normalizedNames = names.map(normalizeName).filter(Boolean);
  return [...new Map(normalizedNames.map((name) => [name.toLocaleLowerCase(), name])).values()];
}
