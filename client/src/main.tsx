/**
 * Client entry — mounts the React tree.
 * App shell & routing live under `src/app/`.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/app/App';
import '@/index.css';
import '@/styles/DesignSystem.css';
import '@/styles/Mobile.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
