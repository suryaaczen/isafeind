
import { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus, UserCircle, Phone, Download } from 'lucide-react';

interface ContactFormProps {
  onAddContact: (name: string, phone: string) => void;
  onImportContacts: () => void;
  isDuplicatePhone: (phone: string) => boolean;
}

const ContactForm = ({ onAddContact, onImportContacts, isDuplicatePhone }: ContactFormProps) => {
  const [newContact, setNewContact] = useState<{name: string; phone: string}>({
    name: '',
    phone: ''
  });

  const validateIndianPhoneNumber = (phone: string): boolean => {
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's exactly 10 digits and starts with a valid Indian prefix
    return cleanPhone.length === 10 && /^[6-9]\d{9}$/.test(cleanPhone);
  };

  const handleSave = () => {
    // Validate name
    if (!newContact.name.trim()) {
      toast.error("Please enter contact name");
      return;
    }
    
    // Clean phone number
    const cleanPhone = newContact.phone.replace(/\D/g, '');
    
    // Validate Indian phone number format
    if (!validateIndianPhoneNumber(cleanPhone)) {
      toast.error("Please enter a valid 10-digit Indian phone number");
      return;
    }
    
    // Check for duplicate phone number
    if (isDuplicatePhone(cleanPhone)) {
      toast.error("This phone number is already in your contacts");
      return;
    }
    
    // Add new contact
    onAddContact(newContact.name.trim(), cleanPhone);
    
    // Reset form
    setNewContact({ name: '', phone: '' });
  };

  return (
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
              placeholder="10-digit number" 
              className="pl-8"
              value={newContact.phone}
              onChange={(e) => {
                // Allow only numbers and basic formatting
                const value = e.target.value.replace(/[^\d-]/g, '');
                setNewContact({...newContact, phone: value});
              }}
              maxLength={10}
            />
          </div>
          <p className="text-xs text-gray-500">Enter 10-digit Indian mobile number</p>
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
          onClick={onImportContacts} 
          className="w-full border border-hershield-red text-hershield-red hover:bg-red-50"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" /> Import Contacts
        </Button>
      </div>
    </div>
  );
};

export default ContactForm;
