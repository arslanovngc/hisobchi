import { IconButton, Tooltip } from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type RemoveIconButtonProps = {
  label?: string;
  onRemove: () => void;
};

export function RemoveIconButton({ label = 'Remove', onRemove }: RemoveIconButtonProps) {
  const { t } = useTranslation();
  const translatedLabel = t(label);

  return (
    <Tooltip label={translatedLabel} hasArrow>
      <IconButton
        aria-label={translatedLabel}
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
