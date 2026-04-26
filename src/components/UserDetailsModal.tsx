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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <p className="ac-modal__meta text-center">Private report preparation</p>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--surface-panel)_82%,transparent)]">
            <User className="text-primary w-8 h-8" />
          </div>
          <DialogTitle className="text-center">
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription className="text-center italic">
            {t('userDetails.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="ac-modal__body space-y-4 py-2">
          <div className="ac-form-field">
            <Label className="ml-1">
              {t('userDetails.nameLabel')}
            </Label>
            <Input
              placeholder="e.g. Alex Rivera"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="placeholder:opacity-40"
            />
          </div>

          <div className="ac-form-field">
            <Label className="ml-1">
              {t('userDetails.emailLabel') || 'Email Address'}
            </Label>
            <Input
              type="email"
              placeholder="alex@example.com"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              className="placeholder:opacity-40"
            />
          </div>
          
          <div className="ac-form-field">
            <Label className="ml-1">
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
                      "flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[18px] border transition-all font-bold text-[10px] uppercase tracking-widest",
                      isSelected
                        ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"
                        : "border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-subtle)_85%,transparent)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ac-form-field">
            <Label className="ml-1">
              {userData.documentType === 'nie' ? t('userDetails.documentTypeNie') : t('userDetails.documentTypePassport')} {t('userDetails.number') || 'NUMBER'}
            </Label>
            <Input
              placeholder={t('userDetails.taxIdPlaceholder')}
              value={userData.taxId}
              onChange={(e) => setUserData({ ...userData, taxId: e.target.value })}
              className="placeholder:opacity-40"
            />
          </div>
          
          <p className="text-[9px] text-center px-4 font-light leading-relaxed text-[var(--text-muted)]">
            {t('userDetails.note')}
          </p>
        </div>

        <DialogFooter className="px-0">
          <Button
            onClick={onConfirm}
            disabled={isLoading || !userData.name || !userData.taxId || !userData.email}
            className="w-full min-h-[3.75rem] rounded-[22px] text-sm shadow-xl transition-all gap-3"
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
