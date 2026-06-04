import { Box, Button, Container, Flex, useColorModeValue } from '@chakra-ui/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Step } from '../types/bill';

type BottomNavProps = {
  step: Step;
  canContinue: boolean;
  onNavigate: (step: Step) => void;
};

export function BottomNav({ step, canContinue, onNavigate }: BottomNavProps) {
  const { t } = useTranslation();
  const bg = useColorModeValue('whiteAlpha.900', 'gray.800');

  return (
    <Box position='fixed' left={0} right={0} bottom='5vh' zIndex={10} pointerEvents='none'>
      <Container maxW='2xl'>
        <Flex
          bg={bg}
          borderWidth='1px'
          rounded='2xl'
          shadow='xl'
          p={3}
          gap={3}
          pointerEvents='auto'
          backdropFilter='blur(12px)'
        >
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
      </Container>
    </Box>
  );
}
