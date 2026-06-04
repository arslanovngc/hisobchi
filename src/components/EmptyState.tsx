import { Box, Heading, Text } from '@chakra-ui/react';

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Box rounded='lg' borderWidth='1px' borderStyle='dashed' p={6}>
      <Heading as='h3' size='sm' mb={2}>
        {title}
      </Heading>
      <Text color='gray.500'>{description}</Text>
    </Box>
  );
}
