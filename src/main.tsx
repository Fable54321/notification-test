import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100-App/App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Calendar from './100-App/110--Calendar/Calendar.tsx'
import { AuthProvider } from './Contexts/AuthContext.tsx'
// import ProtectedRoute from './Components/ProtectedRoute.tsx'
import { AgendaProvider } from './Contexts/AgendaContext.tsx'



const router = createBrowserRouter([
  {
    path: '/',
    element: 
  
    <App />
   
    ,
    children: [
      {
        index: true,
        element: <Calendar />,
      },
    ]
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AgendaProvider>
    <RouterProvider router={router} />
    </AgendaProvider>
    </AuthProvider>
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
