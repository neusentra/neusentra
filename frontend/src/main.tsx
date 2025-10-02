import { AuthProvider, PreloaderProvider, ThemeProvider } from './providers'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import { THEME_KEY } from './constants';
import { StrictMode } from 'react';
import '@/assets/styles/index.css';
import '@/assets/styles/fonts.css';
import { Toaster } from 'sonner'
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <ThemeProvider storageKey={THEME_KEY}>
          <AuthProvider>
            <App />
            <Toaster position="bottom-right" richColors />
          </AuthProvider>
        </ThemeProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>,
)
