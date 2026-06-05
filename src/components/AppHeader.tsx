import {
  Box,
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
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type AppHeaderProps = {
  onReset: () => void;
};

export function AppHeader({ onReset }: AppHeaderProps) {
  const { i18n, t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();
  const [isVisible, setIsVisible] = useState(true);
  const resetWarningTimer = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const previousScrollY = useRef(0);
  const headerBg = useColorModeValue('whiteAlpha.900', 'gray.900');
  const navBg = useColorModeValue('white', 'gray.800');
  const brandColor = useColorModeValue('teal.700', 'teal.200');
  const activeLanguage = i18n.resolvedLanguage || i18n.language;

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;
      const isAtTop = currentScrollY < 12;
      const isScrollingUp = currentScrollY < previousScrollY.current;

      setIsVisible(isAtTop || isScrollingUp);
      previousScrollY.current = currentScrollY;
    }

    previousScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <>
      <Box h='64px' mb={6} />
      <Box
        position='fixed'
        top={0}
        left={0}
        right={0}
        zIndex={20}
        bg={headerBg}
        backdropFilter='blur(12px)'
        borderBottomWidth='1px'
        transform={isVisible ? 'translateY(0)' : 'translateY(-100%)'}
        transition='transform 180ms ease'
      >
        <Flex maxW='3xl' mx='auto' px={{ base: 4, md: 0 }} py={3} align='center' direction='row' justify='space-between' gap={4}>
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
      </Box>
    </>
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
