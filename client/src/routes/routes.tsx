import Footer from '@/layouts/footer/Footer';
import Navbar from '@/layouts/navbar/Header';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import authRoutes from './authRoutes';
// import ScrollProgress from '@/components/ui/scroll-progress'
import DynamicPageLoader from '@/components/ui/LazyCompoment';
import ScrollToTop from '@/components/ui/ScrollToTop';

/**
 * Creates a router with specified routes and elements for each route.
 * @param {Array} routes - An array of route objects containing path and element information.
 * @returns None
 */

const Router = createBrowserRouter([
  {
    path: '',
    element: (
      <>
        <Outlet />

        {/* To scroll to top each time that we change routes */}
        <ScrollToTop />
      </>
    ),

    // Page erreur
    errorElement: <DynamicPageLoader pageKey="error/PageError" />,

    children: [
      {
        path: '/',
        element: (
          <>
            <Navbar />
            <div className="min-h-[80vh]">
              <Outlet />
            </div>
            <Footer />
          </>
        ),
        children: [
          {
            path: '/',
            element: <DynamicPageLoader pageKey="home/Home" />,
          },

          // Authentication routes part
          authRoutes,
        ],
      },
    ],
  },
]);

export default Router;
