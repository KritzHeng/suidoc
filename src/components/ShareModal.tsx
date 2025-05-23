
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';
import { Input } from '@/components/ui/input';
import { Check, Plus, Trash2, Users } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (addresses: string[]) => void;
  currentShares: string[];
}

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentShares
}) => {
  const [addresses, setAddresses] = useState<string[]>(currentShares);
  const [newAddress, setNewAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const addAddress = () => {
    if (!newAddress.trim()) return;
    
    // Simple validation - in a real app, you would validate the address format
    if (!newAddress.startsWith('0x')) {
      toast.error('Invalid address format. Address should start with 0x');
      return;
    }
    
    if (addresses.includes(newAddress)) {
      toast.error('Address already added');
      return;
    }
    
    setAddresses([...addresses, newAddress]);
    setNewAddress('');
  };

  const removeAddress = (index: number) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    try {
      await onConfirm(addresses);
      onClose();
    } catch (error) {
      console.error('Error sharing document:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Document</DialogTitle>
          <DialogDescription>
            Share this document with other wallet addresses to allow them to sign it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center mb-4">
            <Input
              placeholder="Enter wallet address (0x...)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline"
              size="icon"
              className="ml-2"
              onClick={addAddress}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {addresses.length > 0 ? (
            <div className="border rounded-md overflow-hidden">
              <div className="p-2 bg-gray-50 border-b flex items-center">
                <Users className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium">Shared with</span>
              </div>
              <ul className="divide-y">
                {addresses.map((address, index) => (
                  <li key={index} className="flex items-center justify-between p-2 text-sm">
                    <span className="font-mono truncate max-w-[200px]">{address}</span>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeAddress(index)}
                      className="h-8 w-8 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center p-4 border rounded-md bg-gray-50">
              <p className="text-sm text-gray-500">No addresses added yet</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing || addresses.length === 0}
            className="bg-sui-teal hover:bg-sui-teal/90"
          >
            {isProcessing ? 'Processing...' : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Confirm Sharing
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
