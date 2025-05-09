
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowLeftRight } from 'lucide-react';

export const TransferMoney = ({ members }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Transfer",
        description: "Please select a recipient and enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('YOUR_BACKEND_URL/api/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: recipient,
          amount: parseFloat(amount),
          note: note
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      // Success
      toast({
        title: "Transfer Successful",
        description: `You've sent $${amount} successfully`,
      });

      // Reset form
      setRecipient('');
      setAmount('');
      setNote('');
      
      // You could optionally refresh the transactions and balance here
      // or let the parent component handle that
      
    } catch (error) {
      console.error('Transfer error:', error);
      toast({
        title: "Transfer Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleTransfer}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Select
            value={recipient}
            onValueChange={setRecipient}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member._id} value={member._id}>
                  {member.name} {member.accountNumber && `(${member.accountNumber})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              className="pl-8"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note (Optional)</Label>
          <Input
            id="note"
            placeholder="What's this for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <ArrowLeftRight className="h-4 w-4" />
              Send Money
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
