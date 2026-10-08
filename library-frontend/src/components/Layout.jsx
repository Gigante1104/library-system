import { NavLink, Outlet } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/estadisticas', label: 'Estadísticas' },
  { to: '/libros', label: 'Libros' },
  { to: '/lectores', label: 'Lectores' },
  { to: '/prestamos', label: 'Préstamos' },
]

export default function Layout() {
  return (
    <>
      {/* Permite a usuarios de teclado saltar el menú e ir directo al contenido */}
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>

      <header className="app-header">
        <div className="app-header__inner">
          <NavLink to="/" className="app-header__brand">
            📚 Biblioteca
          </NavLink>

          <nav className="app-nav" aria-label="Navegación principal">
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  {/* NavLink agrega aria-current="page" al enlace activo */}
                  <NavLink to={item.to}>{item.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="contenido" className="app-main" tabIndex={-1}>
        {/* Aquí se renderiza la página de la ruta actual */}
        <Outlet />
      </main>
    </>
  )
}
