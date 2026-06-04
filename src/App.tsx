import { Box, Container, Spinner, useColorModeValue } from '@chakra-ui/react';
import { lazy, Suspense, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { getBillTotals, getPersonTotals } from './lib/calculations';
import { round } from './lib/format';
import { getStepFromSearch, persistStep } from './lib/navigation';
import type { Allocation, Item, Person, Step } from './types/bill';

const MealStep = lazy(() => import('./features/meals/MealStep'));
const PeopleStep = lazy(() => import('./features/people/PeopleStep'));

const newId = () => crypto.randomUUID();

export function App() {
  const [step, setStep] = useState<Step>(() => getStepFromSearch());
  const [items, setItems] = useState<Item[]>([]);
  const [taxPercent, setTaxPercent] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [people, setPeople] = useState<Person[]>([]);
  const [allocations, setAllocations] = useState<Allocation>({});

  const shellBg = useColorModeValue('gray.100', 'gray.900');
  const { subtotal, taxAmount, grandTotal } = getBillTotals(items, taxPercent, serviceFee);
  const canContinue = items.some((item) => item.name.trim() && item.unitPrice > 0 && item.count > 0) && subtotal > 0;
  const hasPeople = people.some((person) => person.name.trim());
  const totals = getPersonTotals(items, people, allocations, taxAmount, serviceFee);

  function navigateStep(nextStep: Step) {
    setStep(nextStep);
    persistStep(nextStep);
  }

  function addItem() {
    setItems((current) => [...current, { id: newId(), source: 'manual', name: '', unitPrice: 0, count: 1 }]);
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

  function addPerson() {
    setPeople((current) => [...current, { id: newId(), name: '' }]);
  }

  function updatePerson(id: string, name: string) {
    setPeople((current) => current.map((person) => (person.id === id ? { ...person, name } : person)));
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
        <AppHeader step={step} mealCount={items.length} peopleCount={people.length} onNavigate={navigateStep} />
        <Suspense fallback={<Spinner />}>
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
            />
          ) : (
            <PeopleStep
              items={items}
              people={people}
              allocations={allocations}
              totals={totals}
              grandTotal={grandTotal}
              hasPeople={hasPeople}
              onAddPerson={addPerson}
              onRemovePerson={removePerson}
              onUpdatePerson={updatePerson}
              onUpdateAllocation={updateAllocation}
              onSplitEvenly={splitItemEvenly}
            />
          )}
        </Suspense>
      </Container>
      <BottomNav step={step} canContinue={canContinue} onNavigate={navigateStep} />
    </Box>
  );
}
