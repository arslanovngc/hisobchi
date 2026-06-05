import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  HStack,
  Heading,
  Input,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Clipboard, Minus, Plus, UserPlus, UsersRound, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../components/EmptyState';
import { RemoveIconButton } from '../../components/RemoveIconButton';
import { getAssignedCount } from '../../lib/calculations';
import { amount, round } from '../../lib/format';
import type { Allocation, Item, Person, PersonTotal } from '../../types/bill';

export type PeopleStepProps = {
  items: Item[];
  people: Person[];
  allocations: Allocation;
  totals: PersonTotal[];
  nameSuggestions: string[];
  grandTotal: number;
  hasPeople: boolean;
  onAddPerson: () => void;
  onAddSuggestedPerson: (name: string) => void;
  onRemovePerson: (id: string) => void;
  onUpdatePerson: (id: string, name: string) => void;
  onRemoveNameSuggestion: (name: string) => void;
  onClearNameSuggestions: () => void;
  onUpdateAllocation: (itemId: string, personId: string, value: number) => void;
  onSplitEvenly: (item: Item) => void;
};

export default function PeopleStep(props: PeopleStepProps) {
  const toast = useToast();
  const { t } = useTranslation();

  async function copyFinalSplit() {
    await navigator.clipboard.writeText(formatSplitForCopy(props.totals));
    toast({
      title: t('Copied'),
      status: 'success',
      duration: 1600,
      isClosable: true,
      position: 'top',
    });
  }

  return (
    <Stack spacing={5}>
      <Card variant='outline' borderColor='purple.200'>
        <CardBody>
          <HStack mb={5}>
            <UsersRound aria-hidden />
            <Heading as='h2' size='md'>
              {t('People')}
            </Heading>
          </HStack>
          {props.people.length === 0 ? (
            <EmptyState title={t('Add lunch guests')} description={t('Names help assign each item to the right person.')} />
          ) : (
            <Stack spacing={4}>
              {props.people.map((person, index) => (
                <Stack key={person.id} spacing={3} rounded='lg' borderWidth='1px' p={4} pt={12} position='relative'>
                  <Badge position='absolute' top={3} left={3} colorScheme='purple' rounded='full' px={2}>
                    #{index + 1}
                  </Badge>
                  <HStack position='absolute' top={2} right={2}>
                    <RemoveIconButton onRemove={() => props.onRemovePerson(person.id)} />
                  </HStack>
                  <FormControl>
                    <Input
                      value={person.name}
                      placeholder={t('Name')}
                      onChange={(event) => props.onUpdatePerson(person.id, event.target.value)}
                    />
                  </FormControl>
                </Stack>
              ))}
            </Stack>
          )}
          <Button mt={5} w='full' leftIcon={<Plus size={18} />} onClick={props.onAddPerson}>
            {t('Add person')}
          </Button>
          <NameSuggestions
            names={props.nameSuggestions}
            people={props.people}
            onAdd={props.onAddSuggestedPerson}
            onRemove={props.onRemoveNameSuggestion}
            onClear={props.onClearNameSuggestions}
          />
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='orange.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            {t('Who ate what')}
          </Heading>
          <AssignmentContent {...props} />
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='green.200'>
        <CardBody>
          <Flex align='center' justify='space-between' gap={3} mb={5}>
            <Heading as='h2' size='md'>
              {t('Final split')}
            </Heading>
            <Button
              leftIcon={<Clipboard size={18} />}
              size='sm'
              variant='outline'
              colorScheme='teal'
              onClick={copyFinalSplit}
              isDisabled={props.totals.length === 0}
            >
              {t('Copy')}
            </Button>
          </Flex>
          <Stack spacing={3}>
            {props.totals.map((total) => (
              <Box key={total.personId} rounded='lg' borderWidth='1px' p={4}>
                <Flex justify='space-between' align='center' gap={4}>
                  <Box>
                    <Heading as='h3' size='sm'>
                      {total.name}
                    </Heading>
                    <Text color='gray.500'>
                      {t('Food')} {amount.format(total.subtotal)} + {t('extras')} {amount.format(total.extra)}
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
            <Text>{t('Collected total')}</Text>
            <Text>{amount.format(props.totals.reduce((sum, total) => sum + total.total, 0))}</Text>
          </Flex>
        </CardBody>
      </Card>

      <Stat borderWidth='1px' rounded='lg' p={4}>
        <StatLabel>{t('Bill total')}</StatLabel>
        <StatNumber>{amount.format(props.grandTotal)}</StatNumber>
      </Stat>
    </Stack>
  );
}

function NameSuggestions(props: {
  names: string[];
  people: Person[];
  onAdd: (name: string) => void;
  onRemove: (name: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  const availableNames = props.names.filter(
    (name) => !props.people.some((person) => normalizeName(person.name).toLocaleLowerCase() === normalizeName(name).toLocaleLowerCase()),
  );
  if (availableNames.length === 0) return null;

  return (
    <Box mt={5}>
      <Flex align='center' justify='space-between' gap={3} mb={3}>
        <Heading as='h3' size='sm'>
          {t('Suggested names')}
        </Heading>
        <Button size='xs' variant='ghost' colorScheme='red' onClick={props.onClear}>
          {t('Clear suggestions')}
        </Button>
      </Flex>
      <Flex wrap='wrap' gap={2}>
        {availableNames.map((name) => (
          <Flex key={name} align='center' borderWidth='1px' rounded='full' overflow='hidden'>
            <Button size='sm' variant='ghost' leftIcon={<UserPlus size={14} />} onClick={() => props.onAdd(name)}>
              {name}
            </Button>
            <Button size='sm' variant='ghost' colorScheme='red' px={2} onClick={() => props.onRemove(name)} aria-label={t('Remove suggestion')}>
              <X size={14} />
            </Button>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function AssignmentContent(props: PeopleStepProps) {
  const { t } = useTranslation();

  if (props.items.length === 0) {
    return <EmptyState title={t('Nothing to assign yet')} description={t('Add meals first, then return here to split them.')} />;
  }

  if (!props.hasPeople) {
    return <EmptyState title={t('No guests selected yet')} description={t('Add at least one named person to enter meal counts.')} />;
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
  const { t } = useTranslation();
  const assigned = getAssignedCount(props.item.id, props.allocations);
  const remaining = round(props.item.count - assigned);
  const status = getAssignmentStatus(remaining, t);

  return (
    <Box rounded='lg' borderWidth='1px' p={4}>
      <Flex justify='space-between' align='start' gap={4} mb={4}>
        <Box>
          <Text fontWeight='bold'>{props.item.name || t('Unnamed meal')}</Text>
          <Text color='gray.500'>
            {amount.format(props.item.unitPrice)} x {props.item.count}
          </Text>
        </Box>
        <Badge colorScheme={status.color}>
          {status.label}
        </Badge>
      </Flex>

      {props.item.count === 1 && (
        <Box mb={4}>
          <Text color='gray.500' fontSize='sm' mb={2}>
            {t('Who ate this?')}
          </Text>
          <Flex wrap='wrap' gap={2}>
            {props.people.map((person) => (
              <Button
                key={person.id}
                size='sm'
                variant='outline'
                onClick={() => assignFullItemToPerson(props, person.id)}
              >
                {person.name || t('Unnamed')}
              </Button>
            ))}
          </Flex>
        </Box>
      )}

      <Stack spacing={3}>
        {props.people.map((person) => (
          <PersonQuantityStepper key={person.id} {...props} person={person} />
        ))}
      </Stack>
      <Button mt={4} size='sm' variant='outline' colorScheme='teal' onClick={() => props.onSplitEvenly(props.item)}>
        {t('Split equally')}
      </Button>
    </Box>
  );
}

function PersonQuantityStepper(props: PeopleStepProps & { item: Item; person: Person }) {
  const { t } = useTranslation();
  const value = props.allocations[props.item.id]?.[props.person.id] ?? 0;
  const assigned = getAssignedCount(props.item.id, props.allocations);
  const maxValue = round(value + Math.max(0, props.item.count - assigned));

  function update(nextValue: number) {
    props.onUpdateAllocation(props.item.id, props.person.id, Math.min(maxValue, Math.max(0, round(nextValue))));
  }

  return (
    <Flex align='center' justify='space-between' gap={3} rounded='lg' borderWidth='1px' p={3}>
      <Text fontWeight='medium'>{props.person.name || t('Unnamed')}</Text>
      <Flex align='center' gap={2}>
        <Button size='sm' variant='outline' onClick={() => update(value - 1)} isDisabled={value <= 0} aria-label={t('Decrease count')}>
          <Minus size={16} />
        </Button>
        <Button size='sm' minW='64px' variant='ghost' onClick={() => update(value + 1)}>
          {round(value)}
        </Button>
        <Button
          size='sm'
          variant='outline'
          colorScheme='teal'
          onClick={() => update(value + 1)}
          isDisabled={value >= maxValue}
          aria-label={t('Increase count')}
        >
          <Plus size={16} />
        </Button>
      </Flex>
    </Flex>
  );
}

function assignFullItemToPerson(props: PeopleStepProps & { item: Item }, personId: string) {
  props.people.forEach((person) => {
    props.onUpdateAllocation(props.item.id, person.id, person.id === personId ? props.item.count : 0);
  });
}

function getAssignmentStatus(remaining: number, t: (key: string) => string) {
  if (Math.abs(remaining) <= 0.01) return { label: t('Done'), color: 'green' };
  if (remaining === 0) return { label: t('Done'), color: 'green' };
  if (remaining < 0) return { label: `${Math.abs(remaining)} ${t('over')}`, color: 'red' };
  return { label: `${remaining} ${t('left')}`, color: 'gray' };
}

function formatSplitForCopy(totals: PersonTotal[]) {
  return totals.map((total) => `${total.name}: ${amount.format(total.total)}`).join('\n');
}
