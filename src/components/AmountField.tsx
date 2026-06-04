import { FormControl, FormLabel, Input } from '@chakra-ui/react';
import { amount, parseAmount } from '../lib/format';

type AmountFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export function AmountField({ label, value, onChange }: AmountFieldProps) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Input
        inputMode='decimal'
        value={value ? amount.format(value) : ''}
        placeholder='0'
        onChange={(event) => onChange(parseAmount(event.target.value))}
      />
    </FormControl>
  );
}
