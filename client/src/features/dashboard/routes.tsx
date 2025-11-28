// Routes spécifiques au tableau de bord
import { DashboardLayout } from './layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import { UsersList } from '@/features/users/pages/UsersList';
import { CertificatesList } from '@/features/certificates/pages/CertificatesList';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { FormationsList } from '@/features/formations/pages/FormationsList';
import CreateFormationPage from './pages/formations/CreateFormationPage';
import EditFormationPage from '@/features/formations/pages/EditFormationPage';
import { PaymentsList } from '@/features/payments/pages/PaymentsList';

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: 'users',
        element: <UsersList />,
      },
      {
        path: 'formations',
        children: [
          {
            index: true,
            element: <FormationsList />,
          },
          {
            path: 'new',
            element: <CreateFormationPage />,
          },
          {
            path: 'edit/:id',
            element: <EditFormationPage />,
          },
        ],
      },
      {
        path: 'payments',
        element: <PaymentsList />,
      },
      {
        path: 'certificates',
        element: <CertificatesList />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      // Ajouter d'autres routes du tableau de bord ici
    ],
  },
];
