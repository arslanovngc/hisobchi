import { Box, Button, Container, Flex, HStack, Stack, useColorModeValue } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getMealLabel, getPeopleLabel } from '../lib/navigation';
import type { Step } from '../types/bill';

type BottomNavProps = {
  step: Step;
  mealCount: number;
  peopleCount: number;
  canContinue: boolean;
  onNavigate: (step: Step) => void;
};

export function BottomNav({ step, mealCount, peopleCount, canContinue, onNavigate }: BottomNavProps) {
  const { t } = useTranslation();
  const bg = useColorModeValue('whiteAlpha.900', 'gray.800');

  return (
    <Box position='fixed' left={0} right={0} bottom='5vh' zIndex={10} pointerEvents='none'>
      <Container maxW='2xl'>
        <Stack
          bg={bg}
          borderWidth='1px'
          rounded='2xl'
          shadow='xl'
          p={3}
          spacing={3}
          pointerEvents='auto'
          backdropFilter='blur(12px)'
        >
          <HStack aria-label={t('Progress')} spacing={2} w='full'>
            <StepButton isActive={step === 1} onClick={() => onNavigate(1)}>
              {getMealLabel(mealCount, t)}
            </StepButton>
            <StepButton isActive={step === 2} onClick={() => onNavigate(2)}>
              {getPeopleLabel(peopleCount, t)}
            </StepButton>
          </HStack>
          <Flex>
          {step === 2 && (
            <Button leftIcon={<ArrowLeft size={18} />} onClick={() => onNavigate(1)} size='lg' flex={1}>
              {t('Back')}
            </Button>
          )}
          {step === 1 && (
            <Button
              colorScheme='teal'
              rightIcon={<ArrowRight size={18} />}
              onClick={() => onNavigate(2)}
              isDisabled={!canContinue}
              size='lg'
              flex={1}
            >
              {t('Continue')}
            </Button>
          )}
          </Flex>
        </Stack>
      </Container>
    </Box>
  );
}

function StepButton(props: { children: string; isActive: boolean; onClick: () => void }) {
  return (
    <Button
      size='sm'
      rounded='full'
      flex={1}
      colorScheme={props.isActive ? 'teal' : 'gray'}
      variant={props.isActive ? 'solid' : 'ghost'}
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
}
