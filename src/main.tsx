import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './100-App/App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Calendar from './100-App/110--Calendar/Calendar.tsx'



const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
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
    <RouterProvider router={router} />
  </StrictMode>,
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
