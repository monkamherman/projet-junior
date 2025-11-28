// Composants
export { PaiementForm } from './components/PaiementForm';
export { PaiementButton } from './components/PaiementButton';
export { PaiementHistory } from './components/PaiementHistory';
export { PaiementStatusBadge } from './components/PaiementStatusBadge';
export { PaymentSuccessNotification } from './components/PaymentSuccessNotification';

// Pages
export { default as PaiementPage } from './pages/PaiementPage';
export { default as PaiementHistoryPage } from './pages/PaiementHistoryPage';
export { default as PaymentConfirmationPage } from './pages/PaymentConfirmationPage';

// Hooks et API
export * from './api/paiement.api';

// Configuration
export * from './config/paiement.config';

// Types
export type { 
  PaiementData, 
  PaiementResponse, 
  PaiementStatut 
} from './api/paiement.api';
