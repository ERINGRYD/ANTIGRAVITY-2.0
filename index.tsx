import React from 'react';
import ReactDOM from 'react-dom/client';
import './src/index.css';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { UIProvider } from './contexts/UIContext';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <AppProvider>
      <UIProvider>
        <App />
      </UIProvider>
    </AppProvider>
  </ErrorBoundary>
);
