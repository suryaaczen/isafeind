
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { X, Plus, UserCircle, Phone, Download } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface TrustedContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrustedContactsModal = ({ isOpen, onClose }: TrustedContactsModalProps) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState<{name: string; phone: string}>({
    name: '',
    phone: ''
  });
  
  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('trustedContacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch (error) {
        console.error("Failed to parse trusted contacts:", error);
        setContacts([]);
      }
    }
  }, [isOpen]);
  
  const handleSave = () => {
    // Validate
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }
    
    // Validate phone number (basic check)
    if (!/^\d{10,15}$/.test(newContact.phone.replace(/[^0-9]/g, ''))) {
      toast.error("Please enter a valid phone number");
      return;
    }
    
    // Add new contact
    const updatedContacts = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: newContact.name.trim(),
        phone: newContact.phone.trim()
      }
    ];
    
    // Save to state and localStorage
    setContacts(updatedContacts);
    localStorage.setItem('trustedContacts', JSON.stringify(updatedContacts));
    
    // Reset form
    setNewContact({ name: '', phone: '' });
    
    toast.success("Contact added successfully");
  };
  
  const handleRemoveContact = (id: string) => {
    const updatedContacts = contacts.filter(contact => contact.id !== id);
    setContacts(updatedContacts);
    localStorage.setItem('trustedContacts', JSON.stringify(updatedContacts));
    toast.info("Contact removed");
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
              // Sample contacts
              const importedContacts = [
                { id: `imported-${Date.now()}-1`, name: "Alice Johnson", phone: "9876543210" },
                { id: `imported-${Date.now()}-2`, name: "Bob Smith", phone: "8765432109" },
                { id: `imported-${Date.now()}-3`, name: "Carol Williams", phone: "7654321098" }
              ];
              
              // Combine with existing contacts, avoiding duplicates
              const newContacts = [
                ...contacts,
                ...importedContacts.filter(
                  importedContact => !contacts.some(
                    contact => contact.phone === importedContact.phone
                  )
                )
              ];
              
              setContacts(newContacts);
              localStorage.setItem('trustedContacts', JSON.stringify(newContacts));
              
              toast.success("3 contacts imported successfully!");
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
          <DialogTitle className="font-cursive text-2xl text-hershield-red">Trusted Contacts</DialogTitle>
          <DialogDescription>
            Add people who should be notified in case of emergency.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="relative">
                  <UserCircle className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    id="name" 
                    placeholder="Contact name" 
                    className="pl-8"
                    value={newContact.name}
                    onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    id="phone" 
                    placeholder="Phone number" 
                    className="pl-8"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                type="button" 
                onClick={handleSave} 
                className="w-full bg-hershield-red hover:bg-red-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Contact
              </Button>
              
              <Button 
                type="button" 
                onClick={handleImportContacts} 
                className="w-full border border-hershield-red text-hershield-red hover:bg-red-50"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" /> Import Contacts
              </Button>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="font-medium text-sm text-gray-500">Your Trusted Contacts</h3>
            
            {contacts.length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No contacts added yet.</p>
            ) : (
              contacts.map(contact => (
                <div 
                  key={contact.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-gray-500">{contact.phone}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveContact(contact.id)}
                    aria-label="Remove contact"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
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
