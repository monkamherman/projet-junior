import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { router } from '@/routes/routes';
import { theme } from './theme';
import { AuthProvider } from '@/contexts/AuthContext';

// Créer un client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <AuthProvider>
          <Notifications position="top-right" />
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
};

export default App;
