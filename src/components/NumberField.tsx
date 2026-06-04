import { FormControl, FormLabel, NumberInput, NumberInputField } from '@chakra-ui/react';

type NumberFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
};

export function NumberField({ label, value, min, max, step, onChange }: NumberFieldProps) {
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <NumberInput
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, nextValue) => onChange(Number.isFinite(nextValue) ? nextValue : 0)}
      >
        <NumberInputField />
      </NumberInput>
    </FormControl>
  );
}
