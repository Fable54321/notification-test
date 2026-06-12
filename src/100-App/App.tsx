import { Outlet } from "react-router-dom"


const App = () => {
  return (
    <article className="font-tertiary">
      <h2 className="hidden sr-only">agenda interactif

      </h2>

      <Outlet />
    </article>
  )
}

export default App
