import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { EventBusProvider } from './eventbus/client.tsx'
import { WsProvider } from './websocket/client.tsx'
import { OverlayProvider } from './ui/overlay.tsx'
import { MenuProvider } from './ui/sidemenu.tsx'

createRoot(document.getElementById('root')!).render(
  <WsProvider>
    <EventBusProvider>
      <OverlayProvider>
        <MenuProvider>

          <App />
        </MenuProvider>
      </OverlayProvider>
    </EventBusProvider>
  </WsProvider>,
)
