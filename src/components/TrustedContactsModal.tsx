
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
  importDeviceContacts,
  requestContactsPermission
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
  
  const handleImportContacts = async () => {
    try {
      // Request permission first
      const hasPermission = await requestContactsPermission();
      
      if (!hasPermission) {
        toast.error("Permission to access contacts was denied");
        return;
      }
      
      toast.loading("Accessing contacts...");
      
      // Get contacts from device
      const deviceContacts = await importDeviceContacts();
      
      if (deviceContacts.length === 0) {
        toast.dismiss();
        toast.info("No contacts were imported. In a capacitor-enabled app, you would select contacts from your device.");
        return;
      }
      
      // Filter out duplicate contacts
      const newContacts = deviceContacts.filter(contact => !isDuplicatePhone(contact.phone, contacts));
      
      if (newContacts.length === 0) {
        toast.dismiss();
        toast.info("All selected contacts are already in your trusted contacts list");
        return;
      }
      
      // Add new contacts
      const updatedContacts = [...contacts, ...newContacts];
      setContacts(updatedContacts);
      saveContactsToStorage(updatedContacts);
      
      toast.dismiss();
      toast.success(`Added ${newContacts.length} new contacts`);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to import contacts. Please try again.");
      console.error("Error importing contacts:", error);
    }
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
