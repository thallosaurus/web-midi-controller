import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "widgets/style.css"

createRoot(document.getElementById('root')!).render(
    <App />
)
