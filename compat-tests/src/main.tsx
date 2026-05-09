import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EventBusProvider } from './eventbus/client.tsx'
import { WsProvider } from './websocket/client.tsx'
import { OverlayProvider } from './contexts/overlay.tsx'

createRoot(document.getElementById('root')!).render(
    <WsProvider>
      <EventBusProvider>
        <OverlayProvider>
          <App />
        </OverlayProvider>
      </EventBusProvider>
    </WsProvider>,
)
