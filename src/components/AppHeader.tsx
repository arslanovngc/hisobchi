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
import { Check, ChevronDown, Moon, RotateCcw, Sun } from 'lucide-react';
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
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

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
            {getLanguageLabel(activeLanguage)}
          </MenuButton>
          <MenuList minW='120px'>
            <LanguageMenuItem language='uz' activeLanguage={activeLanguage} onClick={() => changeLanguage('uz')} />
            <LanguageMenuItem language='en' activeLanguage={activeLanguage} onClick={() => changeLanguage('en')} />
            <LanguageMenuItem language='ru' activeLanguage={activeLanguage} onClick={() => changeLanguage('ru')} />
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

function LanguageMenuItem(props: { language: string; activeLanguage: string; onClick: () => void }) {
  const isActive = props.activeLanguage.startsWith(props.language);
  const activeBg = useColorModeValue('teal.50', 'teal.900');
  const activeColor = useColorModeValue('teal.700', 'teal.100');

  return (
    <MenuItem
      icon={isActive ? <Check size={16} /> : <span />}
      bg={isActive ? activeBg : undefined}
      color={isActive ? activeColor : undefined}
      fontWeight={isActive ? 'bold' : 'normal'}
      onClick={props.onClick}
    >
      {getLanguageLabel(props.language)}
    </MenuItem>
  );
}
