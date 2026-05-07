import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EventBusProvider } from './eventbus/client.tsx'
import { WsProvider } from './websocket/client.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WsProvider>
      <EventBusProvider>
        <App />
      </EventBusProvider>
    </WsProvider>
  </StrictMode>,
)
