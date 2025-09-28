'use client';

import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { AppButton } from '@core/components';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  return (
    <Snackbar
      open={showPrompt}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity="info"
        action={
          <AppButton color="inherit" size="small" onClick={handleInstall}>
            Install
          </AppButton>
        }
      >
        Install CiniFob for a better experience!
      </Alert>
    </Snackbar>
  );
}
