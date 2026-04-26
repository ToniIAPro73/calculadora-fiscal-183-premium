import React from 'react';
import { useLanguage } from '@/contexts/i18nContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, Check, User } from 'lucide-react';
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
      <DialogContent className="taxnomad-modal w-[min(92vw,42rem)] max-w-none overflow-hidden p-0">
        <DialogHeader className="px-5 pb-3 pt-5 text-center sm:px-6">
          <p className="ac-modal__meta text-center">Private report preparation</p>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[color-mix(in_srgb,var(--surface-panel)_82%,transparent)]">
            <User className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-[clamp(2rem,4vw,2.75rem)] leading-[0.95]">
            {t('userDetails.title')}
          </DialogTitle>
          <DialogDescription className="mx-auto max-w-[34rem] text-center italic text-sm sm:text-[0.95rem]">
            {t('userDetails.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="taxnomad-modal__body ac-modal__body px-5 pb-3 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
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
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
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
                        "flex min-h-[3rem] items-center justify-center gap-2 rounded-[18px] border px-3 transition-all font-bold text-[10px] uppercase tracking-widest",
                        isSelected
                          ? "border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,transparent)] text-[var(--accent)]"
                          : "border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-subtle)_85%,transparent)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 shrink-0" />}
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
          </div>

          <p className="mt-3 px-2 text-center text-[9px] font-light leading-relaxed text-[var(--text-muted)] sm:text-[10px]">
            {t('userDetails.note')}
          </p>
        </div>

        <DialogFooter className="border-t border-[var(--border-subtle)] px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <Button
            onClick={onConfirm}
            disabled={isLoading || !userData.name || !userData.taxId || !userData.email}
            className="w-full min-h-[3.5rem] rounded-[22px] gap-3 text-sm shadow-xl transition-all"
          >
            {isLoading ? <span className="animate-pulse">REDIRECTING...</span> : (
              <>
                <Lock className="h-4 w-4" />
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
