
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
  // Return empty array instead of sample contacts
  // This prevents dummy contacts from being added
  return [];
};
