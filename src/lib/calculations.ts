import type { Allocation, Item, Person, PersonTotal } from '../types/bill';

export function getBillTotals(items: Item[], taxPercent: number, serviceFee: number) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.count, 0);
  const taxAmount = subtotal * (taxPercent / 100);

  return {
    subtotal,
    taxAmount,
    grandTotal: subtotal + taxAmount + serviceFee,
  };
}

export function getPersonTotals(
  items: Item[],
  people: Person[],
  allocations: Allocation,
  taxAmount: number,
  serviceFee: number,
): PersonTotal[] {
  const subtotals = people.map((person) => {
    const subtotal = items.reduce((sum, item) => {
      const consumed = allocations[item.id]?.[person.id] ?? 0;
      return sum + consumed * item.unitPrice;
    }, 0);

    return { person, subtotal };
  });
  const assignedSubtotal = subtotals.reduce((sum, row) => sum + row.subtotal, 0);
  const extras = taxAmount + serviceFee;

  return subtotals
    .filter(({ person }) => person.name.trim())
    .map(({ person, subtotal }) => {
      const extra = assignedSubtotal > 0 ? (subtotal / assignedSubtotal) * extras : 0;

      return {
        personId: person.id,
        name: person.name.trim(),
        subtotal,
        extra,
        total: subtotal + extra,
      };
    });
}

export function getAssignedCount(itemId: string, allocations: Allocation) {
  return Object.values(allocations[itemId] ?? {}).reduce((sum, count) => sum + count, 0);
}
