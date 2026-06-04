import { IconButton, Tooltip } from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';

type RemoveIconButtonProps = {
  label?: string;
  onRemove: () => void;
};

export function RemoveIconButton({ label = 'Remove', onRemove }: RemoveIconButtonProps) {
  return (
    <Tooltip label={label} hasArrow>
      <IconButton
        aria-label={label}
        icon={<Trash2 size={18} />}
        colorScheme='red'
        variant='ghost'
        size='sm'
        flexShrink={0}
        onClick={onRemove}
      />
    </Tooltip>
  );
}
