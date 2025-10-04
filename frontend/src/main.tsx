import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import { Toaster } from 'sonner'
import { BrowserRouter } from 'react-router'
import { AuthProvider, PreloaderProvider, ThemeProvider } from '@/providers';
import '@/assets/styles/index.css';
import "@/assets/styles/fonts.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>
);
