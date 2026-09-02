import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { FeedbackProvider } from './context/FeedbackContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AccessibilityProvider>
        <FeedbackProvider>
          <App />
        </FeedbackProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </StrictMode>,
);


