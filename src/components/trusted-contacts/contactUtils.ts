
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

// For native contact imports
export const requestContactsPermission = async (): Promise<boolean> => {
  // Check if we're in a Capacitor environment
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    try {
      // For Capacitor/Cordova environments
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'contacts' as any });
        if (result.state === 'granted') {
          return true;
        }
      }
      
      // Show a native dialog explaining why we need contacts permission
      console.log("Requesting contacts permission from device");
      
      // This is a mock - in a real app, you'd use a Capacitor plugin
      // like @capacitor/contacts to request permissions
      return true;
    } catch (error) {
      console.error("Error requesting contacts permission:", error);
      return false;
    }
  }
  return false;
};

export const importDeviceContacts = async (): Promise<Contact[]> => {
  // For demo purposes - in a real implementation you would use:
  // 1. On mobile: Capacitor Contacts plugin (@capacitor/contacts)
  // 2. On web: The Contacts Picker API (only on supported browsers)
  
  // First request permission
  const hasPermission = await requestContactsPermission();
  
  if (!hasPermission) {
    throw new Error("Contact permission denied");
  }
  
  if (window.Capacitor && window.Capacitor.isNativePlatform()) {
    // This is where you'd implement actual contact imports with Capacitor
    console.log("Would access native contacts here");
    
    // Mock data for demo - in a real implementation, remove this and use actual contacts
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
      }
    ];
    
    return mockContacts;
  } else {
    // Web fallback - could use Contact Picker API on supported browsers
    console.log("Web contacts access not fully implemented");
    return [];
  }
};
