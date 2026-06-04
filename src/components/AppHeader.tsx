import { Button, Flex, HStack, Heading, IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';
import { getMealLabel, getPeopleLabel } from '../lib/navigation';
import type { Step } from '../types/bill';

type AppHeaderProps = {
  step: Step;
  mealCount: number;
  peopleCount: number;
  onNavigate: (step: Step) => void;
};

export function AppHeader({ step, mealCount, peopleCount, onNavigate }: AppHeaderProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.800');
  const brandColor = useColorModeValue('teal.700', 'teal.200');

  return (
    <Flex align='center' direction='row' justify='space-between' gap={4} mb={6}>
      <Heading as='h1' size='lg' color={brandColor} letterSpacing='-0.02em'>
        Hisobchi
      </Heading>
      <HStack justify='end'>
        <HStack borderWidth='1px' rounded='full' p={1} bg={navBg} aria-label='Progress'>
          <StepButton isActive={step === 1} onClick={() => onNavigate(1)}>
            {getMealLabel(mealCount)}
          </StepButton>
          <StepButton isActive={step === 2} onClick={() => onNavigate(2)}>
            {getPeopleLabel(peopleCount)}
          </StepButton>
        </HStack>
        <IconButton
          aria-label='Toggle color mode'
          icon={colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          onClick={toggleColorMode}
          variant='outline'
        />
      </HStack>
    </Flex>
  );
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
