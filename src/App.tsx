import { Box, Container, Spinner, useColorModeValue } from '@chakra-ui/react';
import { lazy, Suspense, useEffect, useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BottomNav } from './components/BottomNav';
import { getBillTotals, getPersonTotals } from './lib/calculations';
import { getStepFromSearch, persistStep } from './lib/navigation';
import {
  clearBillState,
  clearNameSuggestions,
  loadBillState,
  loadNameSuggestions,
  normalizeName,
  saveBillState,
  saveNameSuggestions,
} from './lib/storage';
import type { Allocation, Item, Person, Step } from './types/bill';

const MealStep = lazy(() => import('./features/meals/MealStep'));
const PeopleStep = lazy(() => import('./features/people/PeopleStep'));

const newId = () => crypto.randomUUID();

export function App() {
  const [savedBillState] = useState(() => loadBillState());
  const [step, setStep] = useState<Step>(() => getStepFromSearch());
  const [items, setItems] = useState<Item[]>(savedBillState.items);
  const [taxPercent, setTaxPercent] = useState(savedBillState.taxPercent);
  const [serviceFee, setServiceFee] = useState(savedBillState.serviceFee);
  const [people, setPeople] = useState<Person[]>(savedBillState.people);
  const [allocations, setAllocations] = useState<Allocation>(savedBillState.allocations);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>(() => loadNameSuggestions());

  const shellBg = useColorModeValue('gray.100', 'gray.900');
  const { subtotal, taxAmount, grandTotal } = getBillTotals(items, taxPercent, serviceFee);
  const canContinue = items.some((item) => item.name.trim() && item.unitPrice > 0 && item.count > 0) && subtotal > 0;
  const hasPeople = people.some((person) => person.name.trim());
  const totals = getPersonTotals(items, people, allocations, taxAmount, serviceFee);

  useEffect(() => {
    saveBillState({ items, people, allocations, taxPercent, serviceFee });
  }, [items, people, allocations, taxPercent, serviceFee]);

  useEffect(() => {
    saveNameSuggestions(nameSuggestions);
  }, [nameSuggestions]);

  useEffect(() => {
    function saveCurrentPeopleNames() {
      const currentNames = people.map((person) => person.name);
      const nextSuggestions = getUniqueNames([...currentNames, ...nameSuggestions]);
      saveNameSuggestions(nextSuggestions);
    }

    window.addEventListener('pagehide', saveCurrentPeopleNames);
    return () => window.removeEventListener('pagehide', saveCurrentPeopleNames);
  }, [people, nameSuggestions]);

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

  function addSuggestedPerson(name: string) {
    setPeople((current) => {
      const normalizedName = normalizeName(name);
      const alreadyAdded = current.some((person) => isSameName(person.name, normalizedName));
      return alreadyAdded ? current : [...current, { id: newId(), name: normalizedName }];
    });
  }

  function updatePerson(id: string, name: string) {
    setPeople((current) => current.map((person) => (person.id === id ? { ...person, name } : person)));
  }

  function removeNameSuggestion(name: string) {
    setNameSuggestions((current) => current.filter((value) => !isSameName(value, name)));
  }

  function clearSuggestions() {
    setNameSuggestions([]);
    clearNameSuggestions();
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

    const share = item.count / activePeople.length;
    setAllocations((current) => ({
      ...current,
      [item.id]: Object.fromEntries(activePeople.map((person) => [person.id, share])),
    }));
  }

  function resetBill() {
    const nextSuggestions = getUniqueNames([...people.map((person) => person.name), ...nameSuggestions]);
    setNameSuggestions(nextSuggestions);
    saveNameSuggestions(nextSuggestions);
    setItems([]);
    setPeople([]);
    setAllocations({});
    setTaxPercent(0);
    setServiceFee(0);
    clearBillState();
    navigateStep(1);
  }

  return (
    <Box minH='100vh' bg={shellBg} pt={{ base: 5, md: 8 }} pb={{ base: 48, md: 52 }}>
      <Container maxW='3xl'>
        <AppHeader onReset={resetBill} />
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
              nameSuggestions={nameSuggestions}
              grandTotal={grandTotal}
              hasPeople={hasPeople}
              onAddPerson={addPerson}
              onAddSuggestedPerson={addSuggestedPerson}
              onRemovePerson={removePerson}
              onUpdatePerson={updatePerson}
              onRemoveNameSuggestion={removeNameSuggestion}
              onClearNameSuggestions={clearSuggestions}
              onUpdateAllocation={updateAllocation}
              onSplitEvenly={splitItemEvenly}
            />
          )}
        </Suspense>
      </Container>
      <BottomNav step={step} mealCount={items.length} peopleCount={people.length} canContinue={canContinue} onNavigate={navigateStep} />
    </Box>
  );
}

function getUniqueNames(names: string[]) {
  const normalizedNames = names.map(normalizeName).filter(Boolean);
  return [...new Map(normalizedNames.map((name) => [name.toLocaleLowerCase(), name])).values()];
}

function isSameName(left: string, right: string) {
  return normalizeName(left).toLocaleLowerCase() === normalizeName(right).toLocaleLowerCase();
}
