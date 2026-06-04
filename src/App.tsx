import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  Tooltip,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowLeft, ArrowRight, Moon, Plus, ReceiptText, Sun, Trash2, UsersRound } from 'lucide-react';
import { useState } from 'react';

type Item = {
  id: string;
  source: 'manual' | 'scanner';
  name: string;
  unitPrice: number;
  count: number;
};

type Person = {
  id: string;
  name: string;
};

type Allocation = Record<string, Record<string, number>>;

type PersonTotal = {
  personId: string;
  name: string;
  subtotal: number;
  extra: number;
  total: number;
};

const amount = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const newId = () => crypto.randomUUID();

const initialItems: Item[] = [];

const initialPeople: Person[] = [];

export function App() {
  const [step, setStep] = useState<1 | 2>(() => getStepFromSearch());
  const [items, setItems] = useState<Item[]>(initialItems);
  const [taxPercent, setTaxPercent] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [allocations, setAllocations] = useState<Allocation>({});

  const { colorMode, toggleColorMode } = useColorMode();
  const navBg = useColorModeValue('white', 'gray.800');
  const bottomNavBg = useColorModeValue('whiteAlpha.900', 'gray.800');
  const shellBg = useColorModeValue('gray.100', 'gray.900');
  const brandColor = useColorModeValue('teal.700', 'teal.200');
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.count, 0);
  const taxAmount = subtotal * (taxPercent / 100);
  const grandTotal = subtotal + taxAmount + serviceFee;
  const canContinue = items.some((item) => item.name.trim() && item.unitPrice > 0 && item.count > 0) && subtotal > 0;
  const hasPeople = people.some((person) => person.name.trim());
  const totals = getPersonTotals(items, people, allocations, taxAmount, serviceFee);

  function navigateStep(nextStep: 1 | 2) {
    setStep(nextStep);
    const url = new URL(window.location.href);
    url.searchParams.set('step', nextStep === 1 ? 'meals' : 'people');
    window.history.replaceState(null, '', url);
  }

  function updateItem(id: string, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setAllocations((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function addItem() {
    setItems((current) => [...current, { id: newId(), source: 'manual', name: '', unitPrice: 0, count: 1 }]);
  }

  function updatePerson(id: string, name: string) {
    setPeople((current) => current.map((person) => (person.id === id ? { ...person, name } : person)));
  }

  function addPerson() {
    setPeople((current) => [...current, { id: newId(), name: '' }]);
  }

  function removePerson(id: string) {
    setPeople((current) => current.filter((person) => person.id !== id));
    setAllocations((current) => {
      const next = { ...current };
      Object.keys(next).forEach((itemId) => {
        const itemAllocations = { ...next[itemId] };
        delete itemAllocations[id];
        next[itemId] = itemAllocations;
      });
      return next;
    });
  }

  function updateAllocation(itemId: string, personId: string, value: number) {
    setAllocations((current) => ({
      ...current,
      [itemId]: {
        ...current[itemId],
        [personId]: value,
      },
    }));
  }

  function splitItemEvenly(item: Item) {
    const activePeople = people.filter((person) => person.name.trim());
    if (!activePeople.length) return;
    const share = round(item.count / activePeople.length);
    setAllocations((current) => ({
      ...current,
      [item.id]: Object.fromEntries(activePeople.map((person) => [person.id, share])),
    }));
  }

  return (
    <Box minH='100vh' bg={shellBg} pt={{ base: 5, md: 8 }} pb={{ base: 40, md: 44 }}>
      <Container maxW='3xl'>
        <Flex align='center' direction='row' justify='space-between' gap={4} mb={6}>
          <Heading as='h1' size='lg' color={brandColor} letterSpacing='-0.02em'>
            Hisobchi
          </Heading>
          <HStack justify='end'>
            <HStack borderWidth='1px' rounded='full' p={1} bg={navBg} aria-label='Progress'>
              <Button
                size='sm'
                rounded='full'
                colorScheme={step === 1 ? 'teal' : 'gray'}
                variant={step === 1 ? 'solid' : 'ghost'}
                onClick={() => navigateStep(1)}
              >
                {items.length || 'No'} {items.length === 1 ? 'meal' : 'meals'}
              </Button>
              <Button
                size='sm'
                rounded='full'
                colorScheme={step === 2 ? 'teal' : 'gray'}
                variant={step === 2 ? 'solid' : 'ghost'}
                onClick={() => navigateStep(2)}
              >
                {people.length || 'No'} {people.length === 1 ? 'person' : 'people'}
              </Button>
            </HStack>
            <IconButton
              aria-label='Toggle color mode'
              icon={colorMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              onClick={toggleColorMode}
              variant='outline'
            />
          </HStack>
        </Flex>

        {step === 1 ? (
          <MealStep
            items={items}
            taxPercent={taxPercent}
            serviceFee={serviceFee}
            subtotal={subtotal}
            taxAmount={taxAmount}
            grandTotal={grandTotal}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
            onTaxChange={setTaxPercent}
            onServiceChange={setServiceFee}
            canContinue={canContinue}
          />
        ) : (
          <PeopleStep
            items={items}
            people={people}
            allocations={allocations}
            totals={totals}
            grandTotal={grandTotal}
            onAddPerson={addPerson}
            onRemovePerson={removePerson}
            onUpdatePerson={updatePerson}
            onUpdateAllocation={updateAllocation}
            onSplitEvenly={splitItemEvenly}
            hasPeople={hasPeople}
          />
        )}
      </Container>
      <Box position='fixed' left={0} right={0} bottom='5vh' zIndex={10} pointerEvents='none'>
        <Container maxW='2xl'>
          <Flex
            bg={bottomNavBg}
            borderWidth='1px'
            rounded='2xl'
            shadow='xl'
            p={3}
            gap={3}
            pointerEvents='auto'
            backdropFilter='blur(12px)'
          >
            {step === 2 && (
              <Button leftIcon={<ArrowLeft size={18} />} onClick={() => navigateStep(1)} size='lg' flex={1}>
                Back
              </Button>
            )}
            {step === 1 && (
              <Button
                colorScheme='teal'
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigateStep(2)}
                isDisabled={!canContinue}
                size='lg'
                flex={1}
              >
                Continue
              </Button>
            )}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}

function MealStep(props: {
  items: Item[];
  taxPercent: number;
  serviceFee: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  canContinue: boolean;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  onUpdateItem: (id: string, patch: Partial<Item>) => void;
  onTaxChange: (value: number) => void;
  onServiceChange: (value: number) => void;
}) {
  return (
    <Stack spacing={5}>
      <Card variant='outline' borderColor='teal.200'>
        <CardBody>
          <HStack mb={5}>
            <ReceiptText aria-hidden />
            <Heading as='h2' size='md'>
              Meals and prices
            </Heading>
          </HStack>
          {props.items.length === 0 ? (
            <Box rounded='lg' borderWidth='1px' borderStyle='dashed' p={6}>
              <Heading as='h3' size='sm' mb={2}>
                Start with a meal
              </Heading>
              <Text color='gray.500'>Add each dish or shared item from the receipt.</Text>
            </Box>
          ) : (
            <Stack spacing={4}>
              {props.items.map((item, index) => (
                <Stack key={item.id} spacing={3} rounded='lg' borderWidth='1px' p={4}>
                  <Flex align='center' justify='space-between' gap={3}>
                    <FormLabel m={0}>Meal {index + 1}</FormLabel>
                    <Tooltip label={'Remove'} hasArrow>
                      <IconButton
                        aria-label={'Remove'}
                        icon={<Trash2 size={18} />}
                        colorScheme='red'
                        variant='ghost'
                        size='sm'
                        flexShrink={0}
                        onClick={() => props.onRemoveItem(item.id)}
                      />
                    </Tooltip>
                  </Flex>
                  <FormControl>
                    <Input
                      value={item.name}
                      placeholder='Meal name'
                      onChange={(event) => props.onUpdateItem(item.id, { name: event.target.value })}
                    />
                  </FormControl>
                  <Stack spacing={3}>
                    <AmountField
                      label='Price'
                      value={item.unitPrice}
                      onChange={(unitPrice) => props.onUpdateItem(item.id, { unitPrice })}
                    />
                    <NumberField
                      label='Count'
                      value={item.count}
                      min={1}
                      step={1}
                      onChange={(count) => props.onUpdateItem(item.id, { count: Math.max(1, count) })}
                    />
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
          <Button mt={5} leftIcon={<Plus size={18} />} onClick={props.onAddItem}>
            Add meal
          </Button>
        </CardBody>
      </Card>

      <Card variant='outline' borderColor='blue.200'>
        <CardBody>
          <Heading as='h2' size='md' mb={5}>
            Bill details
          </Heading>
          <Stack spacing={4}>
            <NumberField label='Tax percent' value={props.taxPercent} min={0} max={100} onChange={props.onTaxChange} />
            <AmountField label='Service fee' value={props.serviceFee} onChange={props.onServiceChange} />
            <BillTotals
              subtotal={props.subtotal}
              taxAmount={props.taxAmount}
              serviceFee={props.serviceFee}
              grandTotal={props.grandTotal}
            />
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}

function PeopleStep(props: {
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
}) {
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
            <Box rounded='lg' borderWidth='1px' borderStyle='dashed' p={6}>
              <Heading as='h3' size='sm' mb={2}>
                Add lunch guests
              </Heading>
              <Text color='gray.500'>Names help assign each item to the right person.</Text>
            </Box>
          ) : (
            <Stack spacing={4}>
              {props.people.map((person, index) => (
                <Stack key={person.id} spacing={3} rounded='lg' borderWidth='1px' p={4}>
                  <Flex align='center' justify='space-between' gap={3}>
                    <FormLabel m={0}>Person {index + 1}</FormLabel>
                    <Tooltip label={'Remove'} hasArrow>
                      <IconButton
                        aria-label={'Remove'}
                        icon={<Trash2 size={18} />}
                        colorScheme='red'
                        variant='ghost'
                        size='sm'
                        flexShrink={0}
                        onClick={() => props.onRemovePerson(person.id)}
                      />
                    </Tooltip>
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
          {props.items.length === 0 ? (
            <Box rounded='lg' borderWidth='1px' borderStyle='dashed' p={6}>
              <Heading as='h3' size='sm' mb={2}>
                Nothing to assign yet
              </Heading>
              <Text color='gray.500'>Add meals first, then return here to split them.</Text>
            </Box>
          ) : !props.hasPeople ? (
            <Box rounded='lg' borderWidth='1px' borderStyle='dashed' p={6}>
              <Heading as='h3' size='sm' mb={2}>
                No guests selected yet
              </Heading>
              <Text color='gray.500'>Add at least one named person to enter meal counts.</Text>
            </Box>
          ) : (
            <Stack spacing={4}>
              {props.items.map((item) => {
                const assigned = getAssignedCount(item.id, props.allocations);
                return (
                  <Box key={item.id} rounded='lg' borderWidth='1px' p={4}>
                    <Flex justify='space-between' align='start' gap={4} mb={4}>
                      <Box>
                        <Text fontWeight='bold'>{item.name || 'Unnamed meal'}</Text>
                        <Text color='gray.500'>
                          {amount.format(item.unitPrice)} x {item.count}
                        </Text>
                      </Box>
                      <Badge colorScheme={assigned > item.count ? 'red' : 'teal'}>
                        {round(assigned)} / {item.count}
                      </Badge>
                    </Flex>
                    <Stack spacing={3}>
                      {props.people.map((person) => (
                        <NumberField
                          key={person.id}
                          label={person.name || 'Unnamed'}
                          value={props.allocations[item.id]?.[person.id] ?? 0}
                          min={0}
                          step={0.5}
                          onChange={(value) => props.onUpdateAllocation(item.id, person.id, value)}
                        />
                      ))}
                    </Stack>
                    <Button
                      mt={4}
                      size='sm'
                      variant='outline'
                      colorScheme='teal'
                      onClick={() => props.onSplitEvenly(item)}
                    >
                      Split evenly
                    </Button>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardBody>
      </Card>

      <Stack spacing={5}>
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
        <Stack>
          <Stat borderWidth='1px' rounded='lg' p={4}>
            <StatLabel>Bill total</StatLabel>
            <StatNumber>{amount.format(props.grandTotal)}</StatNumber>
          </Stat>
        </Stack>
      </Stack>
    </Stack>
  );
}

function NumberField(props: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <NumberInput
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(_, value) => props.onChange(cleanNumber(value))}
      >
        <NumberInputField />
      </NumberInput>
    </FormControl>
  );
}

function AmountField(props: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <FormControl>
      <FormLabel>{props.label}</FormLabel>
      <Input
        inputMode='decimal'
        value={props.value ? amount.format(props.value) : ''}
        placeholder='0'
        onChange={(event) => props.onChange(parseAmount(event.target.value))}
      />
    </FormControl>
  );
}

function BillTotals(props: { subtotal: number; taxAmount: number; serviceFee: number; grandTotal: number }) {
  return (
    <Stack spacing={3}>
      <Flex justify='space-between'>
        <Text color='gray.500'>Subtotal</Text>
        <Text fontWeight='bold'>{amount.format(props.subtotal)}</Text>
      </Flex>
      <Flex justify='space-between'>
        <Text color='gray.500'>Tax</Text>
        <Text fontWeight='bold'>{amount.format(props.taxAmount)}</Text>
      </Flex>
      <Flex justify='space-between'>
        <Text color='gray.500'>Service</Text>
        <Text fontWeight='bold'>{amount.format(props.serviceFee)}</Text>
      </Flex>
      <Divider />
      <Flex justify='space-between' fontSize='lg'>
        <Text fontWeight='bold'>Total</Text>
        <Text fontWeight='bold'>{amount.format(props.grandTotal)}</Text>
      </Flex>
    </Stack>
  );
}

function getPersonTotals(
  items: Item[],
  people: Person[],
  allocations: Allocation,
  taxAmount: number,
  serviceFee: number,
): PersonTotal[] {
  const subtotals = people.map((person) => {
    const subtotal = items.reduce((sum, item) => {
      const consumed = allocations[item.id]?.[person.id] ?? 0;
      return sum + consumed * item.unitPrice;
    }, 0);
    return { person, subtotal };
  });
  const assignedSubtotal = subtotals.reduce((sum, row) => sum + row.subtotal, 0);
  const extras = taxAmount + serviceFee;

  return subtotals
    .filter(({ person }) => person.name.trim())
    .map(({ person, subtotal }) => {
      const extra = assignedSubtotal > 0 ? (subtotal / assignedSubtotal) * extras : 0;
      return {
        personId: person.id,
        name: person.name.trim(),
        subtotal,
        extra,
        total: subtotal + extra,
      };
    });
}

function getAssignedCount(itemId: string, allocations: Allocation) {
  return Object.values(allocations[itemId] ?? {}).reduce((sum, count) => sum + count, 0);
}

function cleanNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function getStepFromSearch(): 1 | 2 {
  if (typeof window === 'undefined') return 1;
  return new URLSearchParams(window.location.search).get('step') === 'people' ? 2 : 1;
}

function parseAmount(value: string) {
  const normalized = value.replace(/,/g, '').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}
