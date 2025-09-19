import { createRoot } from 'react-dom/client'
import { ModalProvider } from '@/context/ModalContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <ModalProvider>
    <App />
  </ModalProvider>
);
