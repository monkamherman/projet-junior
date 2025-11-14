import DynamicPageLoader from '@/components/ui/LazyCompoment';
import { Outlet } from 'react-router-dom';
// Configuration des routes d'authentification
export const authRoutes = {
  path: '',
  element: <Outlet />,
  children: [
    {
      path: 'login',
      element: <DynamicPageLoader pageKey="auth/Login" />,
    },
    {
      path: 'register',
      element: <DynamicPageLoader pageKey="auth/Register" />,
    },
    {
      path: 'forgot-password',
      element: <DynamicPageLoader pageKey="auth/ForgotPassword" />,
    },
    {
      path: 'reset-password',
      element: <DynamicPageLoader pageKey="auth/ResetPassword" />,
    },
    {
      path: 'verify-otp',
      element: <DynamicPageLoader pageKey="auth/VerifyOTP" />,
    },
  ],
};

export default authRoutes;
