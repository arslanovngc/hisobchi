export type Step = 1 | 2;

export type Item = {
  id: string;
  source: 'manual' | 'scanner';
  name: string;
  unitPrice: number;
  count: number;
  scanWarning?: string;
};

export type Person = {
  id: string;
  name: string;
};

export type Allocation = Record<string, Record<string, number>>;

export type PersonTotal = {
  personId: string;
  name: string;
  subtotal: number;
  extra: number;
  total: number;
};
