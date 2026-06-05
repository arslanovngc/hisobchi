import type { Item } from './bill';

export type ParsedReceipt = {
  items: Item[];
  serviceFeePercent: number;
  serviceFeeAmount: number;
  rawText: string;
  warnings: string[];
};
