import { Link } from 'react-router-dom'
import { statisticsApi } from '../api/library'
import { useApi } from '../hooks/useApi'
import Alert from '../components/Alert'
import BarList from '../components/BarList'
import MonthlyChart from '../components/MonthlyChart'

function KpiCard({ label, value, detail, alert = false }) {
  return (
    <article className={`card kpi ${alert ? 'kpi--alert' : ''}`}>
      <h2 className="kpi__label">{label}</h2>
      <p className="kpi__value">{value}</p>
      {detail && <p className="kpi__detail">{detail}</p>}
    </article>
  )
}

export default function StatisticsPage() {
  const { data: stats, loading, error, reload } = useApi(statisticsApi.get)

  if (loading) return <p className="empty-state">Cargando estadísticas…</p>

  if (error) {
    return (
      <>
        <h1>Estadísticas</h1>
        <Alert type="error" message={error} />
        <button type="button" className="btn btn--secondary" onClick={reload}>
          Reintentar
        </button>
      </>
    )
  }

  const { overview } = stats

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Estadísticas</h1>
          <p>Estado actual de la biblioteca y tendencias de uso.</p>
        </div>
        <button type="button" className="btn btn--secondary" onClick={reload}>
          Actualizar
        </button>
      </div>

      {/* Indicadores clave (KPIs): números grandes, no requieren gráfico */}
      <section aria-label="Indicadores clave" className="grid grid--kpi">
        <KpiCard
          label="Libros en catálogo"
          value={overview.total_books}
          detail={`${overview.available_books} disponibles · ${overview.borrowed_books} prestados`}
        />
        <KpiCard
          label="Disponibilidad"
          value={`${overview.availability_rate}%`}
          detail="de los libros se pueden prestar hoy"
        />
        <KpiCard
          label="Préstamos activos"
          value={overview.active_loans}
          detail={`${overview.total_loans} préstamos en total · ${overview.total_members} lectores`}
        />
        <KpiCard
          label="⚠ Préstamos vencidos"
          value={overview.overdue_loans}
          detail={
            overview.overdue_loans > 0 ? (
              <Link to="/prestamos">Revisar en préstamos</Link>
            ) : (
              'Sin vencimientos pendientes'
            )
          }
          alert={overview.overdue_loans > 0}
        />
      </section>

      <section className="card" aria-labelledby="monthly-title">
        <div className="card__header">
          <h2 id="monthly-title">Préstamos por mes</h2>
          <span className="muted">Últimos 6 meses · {overview.on_time_rate}% devueltos a tiempo</span>
        </div>
        <MonthlyChart data={stats.loans_by_month} />
      </section>

      <div className="grid grid--3">
        <section className="card" aria-labelledby="genres-title">
          <div className="card__header">
            <h2 id="genres-title">Géneros más prestados</h2>
          </div>
          <BarList
            items={stats.top_genres.map((genre) => ({ id: genre.genre, label: genre.genre, value: genre.total }))}
          />
        </section>

        <section className="card" aria-labelledby="books-title">
          <div className="card__header">
            <h2 id="books-title">Libros más prestados</h2>
          </div>
          <BarList
            items={stats.top_books.map((book) => ({
              id: book.id,
              label: book.title,
              detail: book.author,
              value: book.loans_count,
            }))}
          />
        </section>

        <section className="card" aria-labelledby="members-title">
          <div className="card__header">
            <h2 id="members-title">Lectores más activos</h2>
          </div>
          <BarList
            items={stats.top_members.map((member) => ({
              id: member.id,
              label: member.name,
              value: member.loans_count,
            }))}
          />
        </section>
      </div>
    </>
  )
}
