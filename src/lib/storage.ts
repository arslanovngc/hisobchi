import type { Allocation, Item, Person } from '../types/bill';

const BILL_STORAGE_KEY = 'hisobchi.bill.v1';

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
