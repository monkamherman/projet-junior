// Routes spécifiques au tableau de bord
import { CertificatesList } from '@/features/certificates/pages/CertificatesList';
import EditFormationPage from '@/features/formations/pages/EditFormationPage';
import { FormationsList } from '@/features/formations/pages/FormationsList';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { UsersList } from '@/features/users/pages/UsersList';
import { DashboardLayout } from './layout/DashboardLayout';
import { DashboardHome } from './pages/DashboardHome';
import CreateFormationPage from './pages/formations/CreateFormationPage';

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
