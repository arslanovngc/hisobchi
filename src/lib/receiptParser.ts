import type { Item } from '../types/bill';
import type { ParsedReceipt } from '../types/receipt';

const serviceKeywords = ['обсл', 'service', 'xizmat', 'надбавка'];
const totalKeywords = ['итого', 'полная сумма', 'jami', 'total', 'к оплате'];

export function parseReceiptText(rawText: string): ParsedReceipt {
  const warnings: string[] = [];
  const items: Item[] = [];
  let serviceFeePercent = 0;
  let serviceFeeAmount = 0;

  const lines = rawText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  lines.forEach((line) => {
    const normalizedLine = normalizeLine(line);
    const lowerLine = normalizedLine.toLocaleLowerCase();
    const numbers = extractNumbers(normalizedLine);

    if (isServiceLine(lowerLine)) {
      const percent = extractPercent(normalizedLine);
      if (percent > 0) serviceFeePercent = percent;
      else if (numbers.length > 0) serviceFeeAmount = numbers[numbers.length - 1];
      return;
    }

    if (isTotalLine(lowerLine)) return;

    if (numbers.length === 0) {
      const continuation = normalizeContinuationName(line);
      const previousItem = items[items.length - 1];
      if (continuation && previousItem && !isReceiptNoise(lowerLine))
        previousItem.name = `${previousItem.name} ${continuation}`;
      return;
    }

    const item = parseItemLine(line, numbers);
    if (item) items.push(item);
  });

  if (items.length === 0) warnings.push('No receipt items found.');

  return {
    items,
    serviceFeePercent,
    serviceFeeAmount,
    rawText,
    warnings,
  };
}

function parseItemLine(line: string, _numbers: number[]): Item | null {
  const columns = line
    .split(/\s{2,}/)
    .map((column) => column.trim())
    .filter(Boolean);

  if (columns.length >= 2) {
    const columnItem = parseColumns(columns);
    if (columnItem) return columnItem;
  }

  return parseLooseLine(line);
}

function parseColumns(columns: string[]): Item | null {
  const numericTail: string[] = [];

  for (let index = columns.length - 1; index >= 0; index -= 1) {
    if (!isNumericColumn(columns[index])) break;
    numericTail.unshift(columns[index]);
  }

  if (numericTail.length === 0) return null;

  const nameColumns = columns.slice(0, columns.length - numericTail.length);
  const name = nameColumns.join(' ').trim();
  if (!name) return null;

  const totalPrice = normalizeNumber(numericTail[numericTail.length - 1]);
  if (totalPrice <= 0) return null;

  if (numericTail.length === 1) {
    const groups = numericTail[0].split(/\s+/);
    const possibleCount = normalizeNumber(groups[0]);
    if (groups.length >= 3 && isLikelyCount(possibleCount)) {
      const price = normalizeNumber(groups.slice(1).join(' '));
      return createItem(name, possibleCount, price / possibleCount);
    }
  }

  if (numericTail.length >= 3) {
    const count = normalizeNumber(numericTail[numericTail.length - 3]);
    const unitPrice = normalizeNumber(numericTail[numericTail.length - 2]);
    if (isLikelyCount(count) && unitPrice > 0) return createItem(name, count, unitPrice);
  }

  if (numericTail.length >= 2) {
    const count = normalizeNumber(numericTail[numericTail.length - 2]);
    if (isLikelyCount(count)) return createItem(name, count, totalPrice / count);
  }

  return createItem(name, 1, totalPrice);
}

function createItem(name: string, count: number, unitPrice: number): Item {
  return {
    id: crypto.randomUUID(),
    source: 'scanner',
    name,
    unitPrice,
    count,
    scanWarning: getScanWarning(count, unitPrice),
  };
}

function parseLooseLine(line: string) {
  const tailMatch = line.match(/((?:\d+\s+){1,3}\d+|\d+(?:[.,]\d+)?)$/);
  if (!tailMatch) return null;

  const tail = tailMatch[1].trim();
  const groups = tail.split(/\s+/);
  const maybeCount = normalizeNumber(groups[0]);
  const hasLeadingCount = groups.length >= 3 && isLikelyCount(maybeCount);
  const priceText = hasLeadingCount ? groups.slice(1).join(' ') : tail;
  const count = hasLeadingCount ? maybeCount : 1;
  const totalPrice = normalizeNumber(priceText);
  const name = line.slice(0, tailMatch.index).trim();

  if (!name || totalPrice <= 0) return null;

  return createItem(name, count, totalPrice / count);
}

function extractNumbers(line: string) {
  return [...line.matchAll(/\d[\d\s.,]*/g)]
    .map((match) => normalizeNumber(match[0]))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function extractPercent(line: string) {
  const match = line.match(/(\d+(?:[.,]\d+)?)\s*%/);
  return match ? normalizeNumber(match[1]) : 0;
}

function normalizeNumber(value: string) {
  return Number(value.replace(/\s/g, '').replace(',', '.'));
}

function isNumericColumn(value: string) {
  return /^[+]?\d[\d\s.,]*$/.test(value);
}

function normalizeLine(line: string) {
  return line.replace(/\s+/g, ' ').trim();
}

function isServiceLine(line: string) {
  return serviceKeywords.some((keyword) => line.includes(keyword));
}

function isTotalLine(line: string) {
  return totalKeywords.some((keyword) => line.includes(keyword));
}

function isReceiptNoise(line: string) {
  return /^[-=_\s.]+$/.test(line) || serviceKeywords.some((keyword) => line.includes(keyword));
}

function normalizeContinuationName(line: string) {
  return line
    .replace(/[^a-zа-яё'\s-]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyCount(value: number) {
  return Number.isInteger(value) && value > 0 && value < 100;
}

function getScanWarning(count: number, unitPrice: number) {
  if (count > 5) return 'Check scanned value';
  if (!Number.isInteger(unitPrice)) return 'Check scanned value';
  if (unitPrice % 500 !== 0) return 'Check scanned value';
  return undefined;
}
