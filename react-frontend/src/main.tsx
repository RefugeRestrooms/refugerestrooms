import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ApolloProvider } from './components/providers/ApolloProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider>
      <App />
    </ApolloProvider>
  </StrictMode>
);
