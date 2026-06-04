import { FormControl, FormLabel, Input, InputGroup, InputRightAddon } from '@chakra-ui/react';

type PercentFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function PercentField({ label, value, min = 0, max = 100, onChange }: PercentFieldProps) {
  function handleChange(nextValue: string) {
    const parsed = Number(nextValue.replace('%', '').trim());
    if (!Number.isFinite(parsed)) {
      onChange(0);
      return;
    }

    onChange(Math.min(max, Math.max(min, parsed)));
  }

  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Input
          inputMode='decimal'
          value={value ? String(value) : ''}
          placeholder='0'
          onChange={(event) => handleChange(event.target.value)}
        />
        <InputRightAddon>%</InputRightAddon>
      </InputGroup>
    </FormControl>
  );
}
