'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  action: 'open' | 'close';
}

export function PinDialog({ isOpen, onClose, onSuccess, action }: PinDialogProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyPin = () => {
    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const storedPin = localStorage.getItem('scanner-pin');
      if (pin === storedPin) {
        toast({
            title: 'Akses Diberikan',
            description: 'PIN berhasil diverifikasi.',
        });
        onSuccess();
      } else {
        setError('PIN tidak valid. Silakan coba lagi.');
        toast({
            variant: 'destructive',
            title: 'Akses Ditolak',
            description: 'PIN yang Anda masukkan salah.',
        });
      }
      setIsLoading(false);
      setPin('');
    }, 500);
  };

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPin(value);
    if (value.length === (localStorage.getItem('scanner-pin')?.length || 4)) {
        // Automatically submit when length matches
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerifyPin();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Verifikasi PIN</DialogTitle>
          <DialogDescription>
            {action === 'open'
              ? 'Masukkan PIN untuk membuka halaman absensi.'
              : 'Masukkan PIN untuk menutup halaman absensi.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={handlePinChange}
            maxLength={6}
            className="text-center text-2xl tracking-[0.5em]"
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading || pin.length < 4}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verifikasi'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
