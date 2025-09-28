import { createRoot } from 'react-dom/client'
import { SocketProvider } from './context/SocketContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <SocketProvider>
      <App />
  </SocketProvider>
)
