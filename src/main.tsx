import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/components.css';
import './styles/key-wheel.css';
import './styles/layout.css';
import './styles/fretboard.css';
import './styles/chordform.css';
import { I18nProvider } from './i18n/I18nProvider';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
);
