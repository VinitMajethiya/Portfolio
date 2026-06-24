import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/chaos-variables.css'
import './styles/chaos-base.css'
import './styles/chaos-animations.css'
import ChaosApp from './ChaosApp.jsx'

const container = document.getElementById('chaos-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChaosApp />
    </React.StrictMode>
  );
}
