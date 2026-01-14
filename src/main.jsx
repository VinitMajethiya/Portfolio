import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/global-extra.css'
import './styles/navbar-overrides.css'
import './styles/layout-overrides.css'
import './styles/theme.css'
import './styles/theme-toggle.css'
import './styles/home-overrides.css'
import './styles/projects-overrides.css'
import './styles/navbar-theme-overrides.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
