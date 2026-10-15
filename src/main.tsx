import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

window.__BUILD_DATE__ = __BUILD_DATE__;
console.log('Build date from Vite:', __BUILD_DATE__);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
