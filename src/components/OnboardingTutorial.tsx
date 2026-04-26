import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Merge, BarChart3, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

const steps = [
  {
    icon: Calendar,
    color: 'emerald',
  },
  {
    icon: Merge,
    color: 'indigo',
  },
  {
    icon: BarChart3,
    color: 'emerald',
  },
  {
    icon: FileText,
    color: 'indigo',
  },
];

const OnboardingTutorial: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    setIsOpen(!hasSeenOnboarding);
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenOnboarding', 'true');
  };

  const Icon = currentStep >= 0 ? steps[currentStep].icon : Calendar;

  return (
    <>
      {!isOpen ? (
        <div className="mx-auto flex max-w-[88rem] justify-center px-4 pt-3 md:px-6">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(true)}
            className="min-h-[2.5rem] rounded-full border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-panel)_92%,transparent)] px-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-eyebrow)] hover:text-[var(--text-primary)]"
          >
            Guided Tour
          </Button>
        </div>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="my-auto w-full max-w-[460px] overflow-hidden p-0 sm:max-w-[460px]">
          <DialogTitle className="sr-only">{t(`onboarding.step${currentStep + 1}Title`)}</DialogTitle>
          <DialogDescription className="sr-only">{t(`onboarding.step${currentStep + 1}Desc`)}</DialogDescription>
          <div className="flex flex-col items-center space-y-8 p-12 text-center">

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="relative flex h-24 w-24 items-center justify-center rounded-[32px] border border-[var(--border-default)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface-panel-strong)_92%,transparent),color-mix(in_srgb,var(--surface-panel)_88%,transparent))] shadow-2xl"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--domain-glow)_32%,transparent),transparent_65%)] blur-2xl opacity-70" />
              <Icon className="relative z-10 h-10 w-10 text-[var(--accent)]" />
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <p className="ac-modal__meta">Guided onboarding</p>
                <h2 className="text-3xl font-serif tracking-tight text-[var(--text-primary)]">
                  {t(`onboarding.step${currentStep + 1}Title`)}
                </h2>
                <p className="text-sm font-light leading-relaxed text-[var(--text-secondary)]">
                  {t(`onboarding.step${currentStep + 1}Desc`)}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex gap-2 pb-4">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentStep ? 'w-8 bg-[var(--accent)]' : 'w-2 bg-[var(--border-subtle)]'
                }`}
              />
            ))}
          </div>

          <div className="w-full space-y-3">
            <Button 
              onClick={handleNext}
              className="group min-h-[3.75rem] w-full rounded-[22px] text-xs transition-colors"
            >
              {currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="h-10 w-full text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              {t('onboarding.skip')}
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OnboardingTutorial;
