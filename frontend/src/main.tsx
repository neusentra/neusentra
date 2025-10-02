import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import { AuthProvider, PreloaderProvider, ThemeProvider } from './providers'
import { StrictMode } from 'react';
import { THEME_KEY } from './constants';
import App from './App';
import '@/assets/styles/index.css';
import '@/assets/styles/fonts.css';

// Change these as needed
const API_URL = '/api/v1/initialize/status';
const LOGOUT_URL = '/api/v1/auth/logout';
const AUTH_KEY = 'auth_token';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PreloaderProvider>
        <ThemeProvider storageKey={THEME_KEY}>
          <AuthProvider API_URL={API_URL} LOGOUT_URL={LOGOUT_URL} AUTH_KEY={AUTH_KEY}>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </PreloaderProvider>
    </BrowserRouter>
  </StrictMode>,
)
