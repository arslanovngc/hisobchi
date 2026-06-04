import {
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tooltip,
  useColorMode,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ChevronDown, Moon, RotateCcw, Sun } from 'lucide-react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

type AppHeaderProps = {
  onReset: () => void;
};

export function AppHeader({ onReset }: AppHeaderProps) {
  const { i18n, t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const resetWarningTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const navBg = useColorModeValue('white', 'gray.800');
  const brandColor = useColorModeValue('teal.700', 'teal.200');

  function changeLanguage(language: string) {
    localStorage.setItem('language', language);
    void i18n.changeLanguage(language);
  }

  function warnBeforeReset() {
    if (resetWarningTimer.current) {
      window.clearTimeout(resetWarningTimer.current);
    }
    resetWarningTimer.current = window.setTimeout(() => {
      toast({
        title: t('Resetting will delete everything.'),
        description: t('Double-click Start over to confirm.'),
        status: 'warning',
        duration: 2400,
        isClosable: true,
        position: 'top',
      });
      resetWarningTimer.current = null;
    }, 250);
  }

  function resetOnDoubleClick() {
    if (resetWarningTimer.current) {
      window.clearTimeout(resetWarningTimer.current);
      resetWarningTimer.current = null;
    }
    onReset();
  }

  return (
    <Flex align='center' direction='row' justify='space-between' gap={4} mb={6}>
      <Heading as='h1' size='lg' color={brandColor} letterSpacing='-0.02em'>
        {t('Hisobchi')}
      </Heading>
      <HStack justify='end'>
        <Menu>
          <MenuButton
            as={Button}
            aria-label={t('Language')}
            rightIcon={<ChevronDown size={16} />}
            bg={navBg}
            variant='outline'
          >
            {getLanguageLabel(i18n.resolvedLanguage || i18n.language)}
          </MenuButton>
          <MenuList minW='120px'>
            <MenuItem onClick={() => changeLanguage('uz')}>UZ</MenuItem>
            <MenuItem onClick={() => changeLanguage('en')}>EN</MenuItem>
            <MenuItem onClick={() => changeLanguage('ru')}>RU</MenuItem>
          </MenuList>
        </Menu>

        <IconButton
          aria-label={t('Toggle color mode')}
          icon={colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          onClick={toggleColorMode}
          variant='solid'
        />
        <Tooltip label={t('Start over')} hasArrow>
          <IconButton
            aria-label={t('Start over')}
            icon={<RotateCcw size={18} />}
            onClick={warnBeforeReset}
            onDoubleClick={resetOnDoubleClick}
            variant='outline'
          />
        </Tooltip>
      </HStack>
    </Flex>
  );
}

function getLanguageLabel(language: string) {
  return language.toUpperCase().slice(0, 2);
}
