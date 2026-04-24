import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileDown, Lock, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userData: { name: string; documentType: string; taxId: string; email: string };
  setUserData: React.Dispatch<React.SetStateAction<{ name: string; documentType: string; taxId: string; email: string }>>;
  isLoading: boolean;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, onConfirm, userData, setUserData, isLoading }) => {
  const { t } = useLanguage();

  const documentTypes = [
    { value: 'passport', label: t('userDetails.documentTypePassport') },
    { value: 'nie', label: t('userDetails.documentTypeNie') },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden glass border-none">
        <DialogHeader>
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <User className="text-primary w-8 h-8" />
          </div>
          <DialogTitle className="text-2xl font-serif font-bold text-center">
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription className="text-center italic opacity-70">
            {t('userDetails.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] ml-1">
              {t('userDetails.nameLabel')}
            </Label>
            <Input
              placeholder="e.g. Alex Rivera"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="rounded-2xl h-12 border-white/5 bg-white/5 focus:bg-white/10 transition-all placeholder:opacity-20"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] ml-1">
              {t('userDetails.emailLabel') || 'Email Address'}
            </Label>
            <Input
              type="email"
              placeholder="alex@example.com"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="rounded-2xl h-12 border-white/5 bg-white/5 focus:bg-white/10 transition-all placeholder:opacity-20"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] ml-1">
              {t('userDetails.documentLabel')}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {documentTypes.map((option) => {
                const isSelected = userData.documentType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setUserData({ ...userData, documentType: option.value })}
                    className={cn(
                      "flex items-center justify-center gap-2 h-12 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest",
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-white/5 bg-white/5 text-white/40 hover:bg-white/10"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase opacity-70 tracking-[0.2em] ml-1">
              {userData.documentType === 'nie' ? t('userDetails.documentTypeNie') : t('userDetails.documentTypePassport')} {t('userDetails.number') || 'NUMBER'}
            </Label>
            <Input
              placeholder={t('userDetails.taxIdPlaceholder')}
              value={userData.taxId}
              onChange={(e) => setUserData({ ...userData, taxId: e.target.value })}
              className="rounded-2xl h-12 border-white/5 bg-white/5 focus:bg-white/10 transition-all placeholder:opacity-20"
            />
          </div>
          
          <p className="text-[9px] opacity-60 text-center px-4 leading-relaxed font-light">
            {t('userDetails.note')}
          </p>
        </div>

        <DialogFooter className="px-0">
          <Button
            onClick={onConfirm}
            disabled={isLoading || !userData.name || !userData.taxId || !userData.email}
            className="w-full h-14 rounded-2xl font-bold text-sm tracking-widest shadow-xl transition-all gap-3 bg-primary hover:bg-primary/80"
          >
            {isLoading ? <span className="animate-pulse">REDIRECTING...</span> : (
              <>
                <Lock className="w-4 h-4" />
                {t('userDetails.confirm').toUpperCase()}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
