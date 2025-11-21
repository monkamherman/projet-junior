import DynamicPageLoader from '@/components/ui/LazyCompoment';
import { dashboardRoutes } from '@/features/dashboard/routes';
import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import UserLayout from '@/layouts/UserLayout';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ResetPassword from '@/pages/auth/ResetPassword';
import VerifyOTP from '@/pages/auth/VerifyOTP';
import Home from '@/pages/home/Home';
import APropos from '@/pages/APropos';
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
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
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
