import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useThemeStore, applyThemeClass } from './state/themeStore'

applyThemeClass(useThemeStore.getState().theme)
useThemeStore.subscribe((state) => applyThemeClass(state.theme))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
