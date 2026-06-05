import { FormControl, FormLabel, NumberInput, NumberInputField } from '@chakra-ui/react';

type NumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  emptyWhenZero?: boolean;
  onChange: (value: number) => void;
  onBlur?: () => void;
};

export function NumberField({ label, value, min, max, step, placeholder, emptyWhenZero, onChange, onBlur }: NumberFieldProps) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <NumberInput
        value={emptyWhenZero && value === 0 ? '' : value}
        min={min}
        max={max}
        step={step}
        onChange={(_, nextValue) => onChange(Number.isFinite(nextValue) ? nextValue : 0)}
      >
        <NumberInputField placeholder={placeholder} onBlur={onBlur} />
      </NumberInput>
    </FormControl>
  );
}
