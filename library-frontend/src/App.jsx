import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import StatisticsPage from './pages/StatisticsPage'
import BooksPage from './pages/BooksPage'
import MembersPage from './pages/MembersPage'
import LoansPage from './pages/LoansPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Todas las páginas comparten el Layout (encabezado + menú) */}
      <Route element={<Layout />}>
        {/* La página principal redirige al dashboard; replace evita que "/" quede en el historial */}
        <Route index element={<Navigate to="/estadisticas" replace />} />
        <Route path="estadisticas" element={<StatisticsPage />} />
        <Route path="libros" element={<BooksPage />} />
        <Route path="lectores" element={<MembersPage />} />
        <Route path="prestamos" element={<LoansPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
