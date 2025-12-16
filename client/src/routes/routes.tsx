import DynamicPageLoader from '@/components/ui/LazyCompoment';
import { MesAttestationsPage } from '@/features/attestations/pages/MesAttestationsPage';
import { dashboardRoutes } from '@/features/dashboard/routes';
import {
  PaiementHistoryPage,
  PaiementPage,
  PaymentConfirmationPage,
} from '@/features/paiements';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import UserLayout from '@/layouts/UserLayout';
import APropos from '@/pages/APropos';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import VerifyOTP from '@/pages/auth/VerifyOTP';
import FormationConfirmationPage from '@/pages/FormationConfirmationPage';
import FormationsPage from '@/pages/FormationsPage';
import Home from '@/pages/home/Home';
import { createBrowserRouter } from 'react-router-dom';

/**
 * Creates a router with specified routes and elements for each route.
 * @param {Array} routes - An array of route objects containing path and element information.
 * @returns None
 */

const RouterInstance = createBrowserRouter([
  {
    path: '/',
    element: <UserLayout />,
    // Page erreur
    errorElement: <DynamicPageLoader pageKey="error/PageError" />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      // Authentication routes (direct imports to avoid lazy load mismatch)
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'verify-otp', element: <VerifyOTP /> },
      // Profile accessible directement
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Page À propos
      {
        path: 'a-propos',
        element: <APropos />,
      },
      // Route de paiement
      {
        path: 'formations/:id/paiement',
        element: <PaiementPage />,
      },
      // Historique des paiements
      {
        path: 'mon-compte/paiements',
        element: <PaiementHistoryPage />,
      },
      // Confirmation de paiement
      {
        path: 'paiement/confirmation',
        element: <PaymentConfirmationPage />,
      },
      // Mes attestations
      {
        path: 'mes-attestations',
        element: <MesAttestationsPage />,
      },
      // Page formations publique
      {
        path: 'formations',
        element: <FormationsPage />,
      },
      // Détail d'une formation
      {
        path: 'formations/:id',
        element: <FormationsPage />,
      },
      // Confirmation d'inscription
      {
        path: 'formations/:id/confirmation',
        element: <FormationConfirmationPage />,
      },
      // Public catch-all -> 404
      { path: '*', element: <DynamicPageLoader pageKey="error/PageError" /> },
    ],
  },
  ...dashboardRoutes,
  {
    path: '*',
    element: <DynamicPageLoader pageKey="error/PageError" />,
  },
]);

export const router = RouterInstance;
// export default router;
