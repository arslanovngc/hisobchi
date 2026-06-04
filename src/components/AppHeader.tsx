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
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronDown, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMealLabel, getPeopleLabel } from '../lib/navigation';
import type { Step } from '../types/bill';

type AppHeaderProps = {
  step: Step;
  mealCount: number;
  peopleCount: number;
  onNavigate: (step: Step) => void;
};

export function AppHeader({ step, mealCount, peopleCount, onNavigate }: AppHeaderProps) {
  const { i18n, t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.800');
  const brandColor = useColorModeValue('teal.700', 'teal.200');

  function changeLanguage(language: string) {
    localStorage.setItem('language', language);
    void i18n.changeLanguage(language);
  }

  return (
    <Flex align='center' direction='row' justify='space-between' gap={4} mb={6}>
      <Heading as='h1' size='lg' color={brandColor} letterSpacing='-0.02em'>
        {t('Hisobchi')}
      </Heading>
      <HStack justify='end'>
        <HStack borderWidth='1px' rounded='full' p={1} bg={navBg} aria-label={t('Progress')}>
          <StepButton isActive={step === 1} onClick={() => onNavigate(1)}>
            {getMealLabel(mealCount, t)}
          </StepButton>
          <StepButton isActive={step === 2} onClick={() => onNavigate(2)}>
            {getPeopleLabel(peopleCount, t)}
          </StepButton>
        </HStack>

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
      </HStack>
    </Flex>
  );
}

function getLanguageLabel(language: string) {
  return language.toUpperCase().slice(0, 2);
}

function StepButton(props: { children: string; isActive: boolean; onClick: () => void }) {
  return (
    <Button
      size='sm'
      rounded='full'
      colorScheme={props.isActive ? 'teal' : 'gray'}
      variant={props.isActive ? 'solid' : 'ghost'}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
