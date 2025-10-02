import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import { AuthProvider, PreloaderProvider, ThemeProvider } from './providers'
import { StrictMode } from 'react';
import { THEME_KEY } from './constants';
import App from './App';
import '@/assets/styles/index.css';
import '@/assets/styles/fonts.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <ThemeProvider storageKey={THEME_KEY}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>,
)
