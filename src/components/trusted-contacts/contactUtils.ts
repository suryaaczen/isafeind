
export interface Contact {
  id: string;
  name: string;
  phone: string;
}

export const loadContactsFromStorage = (): Contact[] => {
  const savedContacts = localStorage.getItem('trustedContacts');
  if (savedContacts) {
    try {
      return JSON.parse(savedContacts);
    } catch (error) {
      console.error("Failed to parse trusted contacts:", error);
      return [];
    }
  }
  return [];
};

export const saveContactsToStorage = (contacts: Contact[]): void => {
  localStorage.setItem('trustedContacts', JSON.stringify(contacts));
};

export const isDuplicatePhone = (phone: string, contacts: Contact[]): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return contacts.some(contact => contact.phone.replace(/\D/g, '') === cleanPhone);
};

export const simulateContactImport = (): Contact[] => {
  // Sample contacts with Indian phone numbers
  return [
    { id: `imported-${Date.now()}-1`, name: "Alice Johnson", phone: "9876543210" },
    { id: `imported-${Date.now()}-2`, name: "Bob Smith", phone: "8765432109" },
    { id: `imported-${Date.now()}-3`, name: "Carol Williams", phone: "7654321098" }
  ];
};
