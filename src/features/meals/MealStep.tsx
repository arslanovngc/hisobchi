import { Button, Card, CardBody, Flex, FormControl, FormLabel, HStack, Heading, Input, Stack } from '@chakra-ui/react';
import { Plus, ReceiptText } from 'lucide-react';
import { AmountField } from '../../components/AmountField';
import { BillTotals } from '../../components/BillTotals';
import { EmptyState } from '../../components/EmptyState';
import { NumberField } from '../../components/NumberField';
import { RemoveIconButton } from '../../components/RemoveIconButton';
import type { Item } from '../../types/bill';

export type MealStepProps = {
  items: Item[];
  taxPercent: number;
  serviceFee: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, patch: Partial<Item>) => void;
  onTaxChange: (value: number) => void;
  onServiceChange: (value: number) => void;
};

export default function MealStep(props: MealStepProps) {
  return (
    <Stack spacing={5}>
      <Card variant='outline' borderColor='teal.200'>
        <CardBody>
          <HStack mb={5}>
            <ReceiptText aria-hidden />
            <Heading as='h2' size='md'>
              Meals and prices
            </Heading>
          </HStack>
          {props.items.length === 0 ? (
            <EmptyState title='Start with a meal' description='Add each dish or shared item from the receipt.' />
          ) : (
            <Stack spacing={4}>
              {props.items.map((item, index) => (
                <Stack key={item.id} spacing={3} rounded='lg' borderWidth='1px' p={4}>
                  <Flex align='center' justify='space-between' gap={3}>
                    <FormLabel m={0}>Meal {index + 1}</FormLabel>
                    <RemoveIconButton onRemove={() => props.onRemoveItem(item.id)} />
                  </Flex>
                  <FormControl>
                    <Input
                      value={item.name}
                      placeholder='Meal name'
                      onChange={(event) => props.onUpdateItem(item.id, { name: event.target.value })}
                    />
                  </FormControl>
                  <Stack spacing={3}>
                    <AmountField
                      label='Price'
                      value={item.unitPrice}
                      onChange={(unitPrice) => props.onUpdateItem(item.id, { unitPrice })}
                    />
                    <NumberField
                      label='Count'
                      value={item.count}
                      min={1}
                      step={1}
                      onChange={(count) => props.onUpdateItem(item.id, { count: Math.max(1, count) })}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
          <Button mt={5} leftIcon={<Plus size={18} />} onClick={props.onAddItem}>
            Add meal
          </Button>
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='blue.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            Bill details
          </Heading>
          <Stack spacing={4}>
            <NumberField label='Tax percent' value={props.taxPercent} min={0} max={100} onChange={props.onTaxChange} />
            <AmountField label='Service fee' value={props.serviceFee} onChange={props.onServiceChange} />
            <BillTotals
              subtotal={props.subtotal}
              taxAmount={props.taxAmount}
              serviceFee={props.serviceFee}
              grandTotal={props.grandTotal}
            />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
