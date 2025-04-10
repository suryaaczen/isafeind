
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

// For native contact imports - improved for Android compatibility
export const requestContactsPermission = async (): Promise<boolean> => {
  // Check if we're in a Capacitor environment
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    try {
      console.log("Requesting contacts permission from Android device");
      
      // In a real implementation, you would use Capacitor Contacts plugin
      // For example with @capacitor/contacts:
      // const { permissions } = await import('@capacitor/core');
      // const result = await permissions.requestPermissions({
      //   permissions: ['contacts']
      // });
      // return result.permissions.contacts.granted;
      
      // For demonstration purposes
      toast.info("Requesting contact permissions on Android");
      return true;
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      return false;
    }
  }
  
  // For web platforms
  if (navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: 'contacts' as any });
      if (result.state === 'granted') {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking web contacts permission:", error);
      return false;
    }
  }
  
  return false;
};

export const importDeviceContacts = async (): Promise<Contact[]> => {
  // First request permission
  const hasPermission = await requestContactsPermission();
  
  if (!hasPermission) {
    throw new Error("Contact permission denied");
  }
  
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    console.log("Accessing Android contacts");
    
    // In a real implementation, you would use the Capacitor Contacts plugin
    // For example with @capacitor/contacts:
    // const { Contacts } = await import('@capacitor/contacts');
    // const result = await Contacts.getContacts({
    //   projection: {
    //     name: true,
    //     phones: true
    //   }
    // });
    // 
    // return result.contacts.map(contact => ({
    //   id: contact.contactId || `contact-${Date.now()}-${Math.random()}`,
    //   name: contact.name?.display || 'Unknown',
    //   phone: contact.phones?.[0]?.number || ''
    // })).filter(c => c.phone);
    
    // For demonstration purposes, we'll use mock data
    const mockContacts: Contact[] = [
      {
        id: 'contact1',
        name: 'Emergency Contact',
        phone: '9876543210'
      },
      {
        id: 'contact2',
        name: 'Family Member',
        phone: '8765432109'
      },
      {
        id: 'contact3',
        name: 'Police',
        phone: '100'
      }
    ];
    
    return mockContacts;
  } else {
    // Web fallback
    console.log("Web contacts access not fully implemented");
    return [];
  }
};
