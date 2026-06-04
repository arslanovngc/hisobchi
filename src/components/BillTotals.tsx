import { Divider, Flex, Stack, Text } from '@chakra-ui/react';
import { amount } from '../lib/format';

type BillTotalsProps = {
  subtotal: number;
  taxAmount: number;
  serviceFee: number;
  grandTotal: number;
};

export function BillTotals({ subtotal, taxAmount, serviceFee, grandTotal }: BillTotalsProps) {
  return (
    <Stack spacing={3}>
      <TotalRow label='Subtotal' value={subtotal} />
      <TotalRow label='Tax' value={taxAmount} />
      <TotalRow label='Service' value={serviceFee} />
      <Divider />
      <Flex justify='space-between' fontSize='lg'>
        <Text fontWeight='bold'>Total</Text>
        <Text fontWeight='bold'>{amount.format(grandTotal)}</Text>
      </Flex>
    </Stack>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <Flex justify='space-between'>
      <Text color='gray.500'>{label}</Text>
      <Text fontWeight='bold'>{amount.format(value)}</Text>
    </Flex>
  );
}
