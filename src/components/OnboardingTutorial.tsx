import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/i18nContext';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Check, Calendar, Merge, BarChart3, FileText } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
    if (!hasSeenOnboarding) {
      setIsOpen(true);
    }
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none glass shadow-none">
        <div className="relative p-12 flex flex-col items-center text-center space-y-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="absolute right-4 top-4 hover:bg-white/5 rounded-full"
          >
            <X className="w-4 h-4 text-white/40" />
          </Button>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className={`w-24 h-24 rounded-[32px] flex items-center justify-center bg-gradient-to-br ${
                steps[currentStep].color === 'emerald' 
                  ? 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/20' 
                  : 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/20'
              } border shadow-2xl relative group`}
            >
              <div className={`absolute inset-0 blur-2xl opacity-40 rounded-full transition-all duration-700 ${
                steps[currentStep].color === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`} />
              <Icon className={`w-10 h-10 relative z-10 ${
                steps[currentStep].color === 'emerald' ? 'text-emerald-400' : 'text-indigo-400'
              }`} />
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
                <h2 className="text-3xl font-serif tracking-tight text-white">
                  {t(`onboarding.step${currentStep + 1}Title`)}
                </h2>
                <p className="text-sm text-white/50 leading-relaxed font-light">
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
                  i === currentStep ? 'w-8 bg-emerald-400' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>

          <div className="w-full space-y-3">
            <Button 
              onClick={handleNext}
              className="w-full h-14 rounded-2xl bg-white text-black hover:bg-emerald-400 transition-colors tracking-widest font-bold text-xs uppercase group"
            >
              {currentStep === steps.length - 1 ? t('onboarding.finish') : t('onboarding.next')}
              <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={handleClose}
              className="w-full h-10 text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 hover:text-white"
            >
              {t('onboarding.skip')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTutorial;
