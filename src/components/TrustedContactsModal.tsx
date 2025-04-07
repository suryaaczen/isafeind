
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ContactForm from "./trusted-contacts/ContactForm";
import ContactList from "./trusted-contacts/ContactList";
import { 
  Contact, 
  loadContactsFromStorage, 
  saveContactsToStorage, 
  isDuplicatePhone,
  simulateContactImport
} from "./trusted-contacts/contactUtils";

interface TrustedContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrustedContactsModal = ({ isOpen, onClose }: TrustedContactsModalProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  
  useEffect(() => {
    // Load contacts from localStorage when modal opens
    if (isOpen) {
      const loadedContacts = loadContactsFromStorage();
      setContacts(loadedContacts);
    }
  }, [isOpen]);
  
  const handleAddContact = (name: string, phone: string) => {
    // Add new contact
    const updatedContacts = [
      ...contacts,
      {
        id: Date.now().toString(),
        name,
        phone
      }
    ];
    
    // Save to state and localStorage
    setContacts(updatedContacts);
    saveContactsToStorage(updatedContacts);
    
    toast.success("Contact added successfully");
  };
  
  const handleRemoveContact = (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    saveContactsToStorage(updatedContacts);
    toast.info("Contact removed");
  };
  
  const checkDuplicatePhone = (phone: string): boolean => {
    return isDuplicatePhone(phone, contacts);
  };
  
  const handleImportContacts = () => {
    // Note: This is just a simulation since actual contact import requires native capabilities
    toast.info("This feature requires native device permissions");

    // In a real React Native app, we would use the Contacts API
    // For this web app, we'll simulate the import with a timeout
    toast("Requesting contacts permission...");
    
    setTimeout(() => {
      toast.success("Permission granted, importing contacts...");
      
      // Simulate import delay
      setTimeout(() => {
        toast("Select contacts to import", {
          description: "This would show your device contacts in a native app",
          action: {
            label: "Import 3 contacts",
            onClick: () => {
              // Get simulated contacts
              const importedContacts = simulateContactImport();
              
              // Combine with existing contacts, avoiding duplicates by phone number
              const newContacts = [...contacts];
              
              // Only add contacts that don't already exist
              let addedCount = 0;
              for (const importedContact of importedContacts) {
                if (!checkDuplicatePhone(importedContact.phone)) {
                  newContacts.push(importedContact);
                  addedCount++;
                }
              }
              
              setContacts(newContacts);
              saveContactsToStorage(newContacts);
              
              if (addedCount > 0) {
                toast.success(`${addedCount} contacts imported successfully!`);
              } else {
                toast.info("No new contacts were imported (all were duplicates)");
              }
            }
          }
        });
      }, 1000);
    }, 800);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-hershield-red">Trusted Contacts</DialogTitle>
          <DialogDescription>
            Add people who should be notified in case of emergency.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ContactForm 
            onAddContact={handleAddContact} 
            onImportContacts={handleImportContacts}
            isDuplicatePhone={checkDuplicatePhone}
          />
          
          <ContactList 
            contacts={contacts} 
            onRemoveContact={handleRemoveContact} 
          />
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrustedContactsModal;
