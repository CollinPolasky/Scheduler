// components/PersonDropdown.tsx
import React from 'react';

interface Person {
  id: number;
  name: string;
  building?: string;
}

interface PersonDropdownProps {
  persons: Person[];
  selectedPersons: number[];
  onPersonSelect: (selectedIds: number[]) => void;
}

const PersonDropdown: React.FC<PersonDropdownProps> = ({ persons, selectedPersons, onPersonSelect }) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => Number(option.value));
    onPersonSelect(selectedOptions);
  };

  return (
    <select multiple value={selectedPersons} onChange={handleChange}>
      {persons.map(person => (
        <option key={person.id} value={person.id}>
          {person.name}
        </option>
      ))}
    </select>
  );
};

export default PersonDropdown;