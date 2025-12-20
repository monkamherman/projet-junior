import { Button } from '@mantine/core';
import { Download, RefreshCw, Wifi } from 'lucide-react';
import { usePWA, useServiceWorker } from '../features/formations/hooks/usePWA';

export const PWAInstallButton = () => {
  const { isInstallable, installApp, isInstalled } = usePWA();
  const { needsRefresh, updateApp } = useServiceWorker();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {needsRefresh ? (
        <Button
          onClick={updateApp}
          color="orange"
          leftSection={<RefreshCw size={16} />}
          className="shadow-lg transition-all duration-200 hover:shadow-xl"
          size="md"
        >
          Mettre à jour l'app
        </Button>
      ) : isInstalled ? (
        <Button
          color="green"
          leftSection={<Wifi size={16} />}
          disabled
          className="opacity-75 shadow-lg"
          size="md"
        >
          Déjà installée
        </Button>
      ) : (
        <Button
          onClick={installApp}
          color={isInstallable ? 'blue' : 'gray'}
          leftSection={<Download size={16} />}
          disabled={!isInstallable}
          className="rounded bg-blue-600 p-2 text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
          size="md"
        >
          {isInstallable ? "Installer l'app" : 'Installation indisponible'}
        </Button>
      )}
    </div>
  );
};
