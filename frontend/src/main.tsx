import { AuthProvider, PreloaderProvider, ThemeProvider } from '@/providers';
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router';
import { StrictMode } from 'react'
import '@/assets/styles/index.css';
import "@/assets/styles/fonts.css";
import App from './app';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <ThemeProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>
);