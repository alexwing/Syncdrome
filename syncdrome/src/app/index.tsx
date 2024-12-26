import { createRoot } from 'react-dom/client';
import App from './config/routes';
import React from 'react';

const root = document.getElementById('app');
if (root !== null) {
  createRoot(root).render(<App />);
}