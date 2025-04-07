
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ContactListProps {
  contacts: Contact[];
  onRemoveContact: (id: string) => void;
}

const ContactList = ({ contacts, onRemoveContact }: ContactListProps) => {
  const formatPhoneNumber = (phone: string): string => {
    // Format as XXX-XXX-XXXX for display
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    return phone;
  };

  return (
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
              <p className="text-sm text-gray-500">{formatPhoneNumber(contact.phone)}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemoveContact(contact.id)}
              aria-label="Remove contact"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export default ContactList;
