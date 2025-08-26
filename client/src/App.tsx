import React from 'react'
import Router from './routes/routes';
import { RouterProvider } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/hooks/use-theme';
import ScrollProgressBar from './components/ui/ScrollProgress';
import OfflineAlert from './components/ui/OfflineAlert';


const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ScrollProgressBar />
      <RouterProvider router={Router} />
      
      <Toaster />
      <OfflineAlert />
    </ThemeProvider>
  )
}

export default App
