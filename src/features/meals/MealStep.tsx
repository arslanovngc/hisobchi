import { Badge, Button, Card, CardBody, Flex, FormControl, HStack, Heading, Input, Stack, Text } from '@chakra-ui/react';
import { Plus, ReceiptText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AmountField } from '../../components/AmountField';
import { BillTotals } from '../../components/BillTotals';
import { EmptyState } from '../../components/EmptyState';
import { NumberField } from '../../components/NumberField';
import { PercentField } from '../../components/PercentField';
import { RemoveIconButton } from '../../components/RemoveIconButton';
import { ReceiptScannerButton } from '../scanner/ReceiptScannerButton';
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
  onImportReceipt: (items: Item[], serviceFeePercent: number, serviceFeeAmount: number) => void;
  onTaxChange: (value: number) => void;
  onServiceChange: (value: number) => void;
};

export default function MealStep(props: MealStepProps) {
  const { t } = useTranslation();

  return (
    <Stack spacing={5}>
      <Card variant='outline' borderColor='teal.200'>
        <CardBody>
          <Flex justify='space-between' align='center' gap={3} mb={5}>
            <HStack>
              <ReceiptText aria-hidden />
              <Heading as='h2' size='md'>
                {t('Meals and prices')}
              </Heading>
            </HStack>
            <ReceiptScannerButton onImport={props.onImportReceipt} />
          </Flex>
          {props.items.length === 0 ? (
            <EmptyState title={t('Start with a meal')} description={t('Add each dish or shared item from the receipt.')} />
          ) : (
            <Stack spacing={4}>
              {props.items.map((item, index) => (
                <Stack key={item.id} spacing={3} rounded='lg' borderWidth='1px' p={4} pt={12} position='relative'>
                  <Badge position='absolute' top={3} left={3} colorScheme='teal' rounded='full' px={2}>
                    #{index + 1}
                  </Badge>
                  <HStack position='absolute' top={2} right={2}>
                    {item.scanWarning && <Badge colorScheme='orange'>{t(item.scanWarning)}</Badge>}
                    <RemoveIconButton onRemove={() => props.onRemoveItem(item.id)} />
                  </HStack>
                  <FormControl>
                    <Input
                      value={item.name}
                      placeholder={t('Meal name')}
                      onChange={(event) => props.onUpdateItem(item.id, { name: event.target.value })}
                    />
                  </FormControl>
                  <Stack spacing={3}>
                    <AmountField
                      label={t('Price')}
                      value={item.unitPrice}
                      onChange={(unitPrice) => props.onUpdateItem(item.id, { unitPrice })}
                    />
                    <NumberField
                      label={t('Count')}
                      value={item.count}
                      step={1}
                      placeholder='0'
                      emptyWhenZero
                      onChange={(count) => props.onUpdateItem(item.id, { count })}
                      onBlur={() => {
                        if (item.count < 1) props.onUpdateItem(item.id, { count: 1 });
                      }}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
          <Button mt={5} w='full' leftIcon={<Plus size={18} />} onClick={props.onAddItem}>
            {t('Add meal')}
          </Button>
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='blue.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            {t('Bill details')}
          </Heading>
          <Stack spacing={4}>
            <PercentField label={t('Service fee (percentage)')} value={props.taxPercent} onChange={props.onTaxChange} />
            <Text color='gray.500' fontWeight='bold' textAlign='center'>
              {t('Or')}
            </Text>
            <AmountField label={t('Service fee (amount)')} value={props.serviceFee} onChange={props.onServiceChange} />
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
