import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react';
import { Plus, UsersRound } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { NumberField } from '../../components/NumberField';
import { RemoveIconButton } from '../../components/RemoveIconButton';
import { getAssignedCount } from '../../lib/calculations';
import { amount, round } from '../../lib/format';
import type { Allocation, Item, Person, PersonTotal } from '../../types/bill';

export type PeopleStepProps = {
  items: Item[];
  people: Person[];
  allocations: Allocation;
  totals: PersonTotal[];
  grandTotal: number;
  hasPeople: boolean;
  onAddPerson: () => void;
  onRemovePerson: (id: string) => void;
  onUpdatePerson: (id: string, name: string) => void;
  onUpdateAllocation: (itemId: string, personId: string, value: number) => void;
  onSplitEvenly: (item: Item) => void;
};

export default function PeopleStep(props: PeopleStepProps) {
  return (
    <Stack spacing={5}>
      <Card variant='outline' borderColor='purple.200'>
        <CardBody>
          <HStack mb={5}>
            <UsersRound aria-hidden />
            <Heading as='h2' size='md'>
              People
            </Heading>
          </HStack>
          {props.people.length === 0 ? (
            <EmptyState title='Add lunch guests' description='Names help assign each item to the right person.' />
          ) : (
            <Stack spacing={4}>
              {props.people.map((person, index) => (
                <Stack key={person.id} spacing={3} rounded='lg' borderWidth='1px' p={4}>
                  <Flex align='center' justify='space-between' gap={3}>
                    <FormLabel m={0}>Person {index + 1}</FormLabel>
                    <RemoveIconButton onRemove={() => props.onRemovePerson(person.id)} />
                  </Flex>
                  <FormControl>
                    <Input
                      value={person.name}
                      placeholder='Name'
                      onChange={(event) => props.onUpdatePerson(person.id, event.target.value)}
                    />
                  </FormControl>
                </Stack>
              ))}
            </Stack>
          )}
          <Button mt={5} leftIcon={<Plus size={18} />} onClick={props.onAddPerson}>
            Add person
          </Button>
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='orange.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            Who ate what
          </Heading>
          <AssignmentContent {...props} />
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='green.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            Final split
          </Heading>
          <Stack spacing={3}>
            {props.totals.map((total) => (
              <Box key={total.personId} rounded='lg' borderWidth='1px' p={4}>
                <Flex justify='space-between' align='center' gap={4}>
                  <Box>
                    <Heading as='h3' size='sm'>
                      {total.name}
                    </Heading>
                    <Text color='gray.500'>
                      Food {amount.format(total.subtotal)} + extras {amount.format(total.extra)}
                    </Text>
                  </Box>
                  <Heading as='p' size='md'>
                    {amount.format(total.total)}
                  </Heading>
                </Flex>
              </Box>
            ))}
          </Stack>
          <Divider my={5} />
          <Flex justify='space-between' fontWeight='bold'>
            <Text>Collected total</Text>
            <Text>{amount.format(props.totals.reduce((sum, total) => sum + total.total, 0))}</Text>
          </Flex>
        </CardBody>
      </Card>

      <Stat borderWidth='1px' rounded='lg' p={4}>
        <StatLabel>Bill total</StatLabel>
        <StatNumber>{amount.format(props.grandTotal)}</StatNumber>
      </Stat>
    </Stack>
  );
}

function AssignmentContent(props: PeopleStepProps) {
  if (props.items.length === 0) {
    return <EmptyState title='Nothing to assign yet' description='Add meals first, then return here to split them.' />;
  }

  if (!props.hasPeople) {
    return <EmptyState title='No guests selected yet' description='Add at least one named person to enter meal counts.' />;
  }

  return (
    <Stack spacing={4}>
      {props.items.map((item) => (
        <AssignmentCard key={item.id} item={item} {...props} />
      ))}
    </Stack>
  );
}

function AssignmentCard(props: PeopleStepProps & { item: Item }) {
  const assigned = getAssignedCount(props.item.id, props.allocations);

  return (
    <Box rounded='lg' borderWidth='1px' p={4}>
      <Flex justify='space-between' align='start' gap={4} mb={4}>
        <Box>
          <Text fontWeight='bold'>{props.item.name || 'Unnamed meal'}</Text>
          <Text color='gray.500'>
            {amount.format(props.item.unitPrice)} x {props.item.count}
          </Text>
        </Box>
        <Badge colorScheme={assigned > props.item.count ? 'red' : 'teal'}>
          {round(assigned)} / {props.item.count}
        </Badge>
      </Flex>
      <Stack spacing={3}>
        {props.people.map((person) => (
          <NumberField
            key={person.id}
            label={person.name || 'Unnamed'}
            value={props.allocations[props.item.id]?.[person.id] ?? 0}
            min={0}
            step={0.5}
            onChange={(value) => props.onUpdateAllocation(props.item.id, person.id, value)}
          />
        ))}
      </Stack>
      <Button mt={4} size='sm' variant='outline' colorScheme='teal' onClick={() => props.onSplitEvenly(props.item)}>
        Split evenly
      </Button>
    </Box>
  );
}
