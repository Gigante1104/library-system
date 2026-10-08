import { useMemo, useState } from 'react'
import { booksApi, loansApi, membersApi } from '../api/library'
import { useApi } from '../hooks/useApi'
import { useSort } from '../hooks/useSort'
import { firstErrors, formatDate, loanStatus } from '../utils/format'
import { MAX_ACTIVE_LOANS, MAX_LOAN_DAYS } from '../utils/loanRules'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import LoanForm from '../components/LoanForm'
import SortableHeader from '../components/SortableHeader'
import Toast from '../components/Toast'

const STATUS_FILTERS = {
  all: 'Todos',
  active: 'Activos',
  overdue: 'Vencidos',
  returned: 'Devueltos',
}

// Prioridad al ordenar por estado: primero lo que requiere atención
const STATUS_ORDER = { overdue: 0, active: 1, returned: 2 }

// Fuera del componente para que no cambie en cada render (ver useSort)
const SORT_ACCESSORS = {
  book: (loan) => loan.book.title,
  member: (loan) => loan.member.name,
  status: (loan) => STATUS_ORDER[loanStatus(loan).key],
}

export default function LoansPage() {
  const { data: loans, loading, error, reload } = useApi(loansApi.list)
  const { data: books, reload: reloadBooks } = useApi(booksApi.list)
  const { data: members, reload: reloadMembers } = useApi(membersApi.list)

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const availableBooks = useMemo(() => (books ?? []).filter((book) => book.is_available), [books])

  const filteredLoans = useMemo(() => {
    const term = search.trim().toLowerCase()

    return (loans ?? []).filter((loan) => {
      const matchesText = [loan.book.title, loan.member.name].some((field) => field.toLowerCase().includes(term))
      const matchesStatus = statusFilter === 'all' || loanStatus(loan).key === statusFilter

      return matchesText && matchesStatus
    })
  }, [loans, search, statusFilter])

  // Por defecto, los préstamos más recientes primero
  const { sorted: visibleLoans, sort, toggleSort } = useSort(filteredLoans, 'loan_date', SORT_ACCESSORS, 'desc')

  const counts = useMemo(() => {
    const result = { all: loans?.length ?? 0, active: 0, overdue: 0, returned: 0 }
    ;(loans ?? []).forEach((loan) => result[loanStatus(loan).key]++)
    return result
  }, [loans])

  function openForm() {
    setShowForm(true)
    setServerErrors({})
    setFeedback(null)
  }

  // Tras prestar o devolver cambian los préstamos, la disponibilidad de los libros y los contadores de los lectores
  function refreshData() {
    reload()
    reloadBooks()
    reloadMembers()
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    setServerErrors({})

    try {
      const response = await loansApi.create(values)
      setFeedback({ type: 'success', message: response.message })
      setShowForm(false)
      refreshData()
    } catch (err) {
      if (err.status === 422) {
        setServerErrors(firstErrors(err.errors))
      } else {
        // 409: reglas de negocio (libro no disponible, máximo de préstamos, lector con vencidos)
        setFeedback({ type: 'error', message: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleReturn(loan) {
    if (!window.confirm(`¿Registrar la devolución de "${loan.book.title}" por ${loan.member.name}?`)) return

    try {
      const response = await loansApi.returnBook(loan.id)
      setFeedback({ type: 'success', message: response.message })
      refreshData()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Préstamos</h1>
          <p>
            Máximo {MAX_ACTIVE_LOANS} préstamos activos por lector · plazo máximo de {MAX_LOAN_DAYS} días · sin
            préstamos nuevos si tiene vencidos.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="btn" onClick={openForm}>
            + Nuevo préstamo
          </button>
        )}
      </div>

      <Toast type={feedback?.type} message={feedback?.message} onClose={() => setFeedback(null)} />

      {showForm && (
        <section className="card" aria-labelledby="loan-form-title">
          <h2 id="loan-form-title">Nuevo préstamo</h2>
          <LoanForm
            books={availableBooks}
            members={members ?? []}
            serverErrors={serverErrors}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      <section className="card" aria-labelledby="loans-list-title">
        <h2 id="loans-list-title" className="visually-hidden">
          Listado de préstamos
        </h2>

        <div className="toolbar">
          <FormField
            id="loan-search"
            label="Buscar"
            type="search"
            placeholder="Libro o lector"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <FormField
            id="loan-status"
            label="Estado"
            as="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {Object.entries(STATUS_FILTERS).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({counts[value]})
              </option>
            ))}
          </FormField>
        </div>

        {loading && <p className="empty-state">Cargando préstamos…</p>}

        {error && (
          <>
            <Alert type="error" message={error} />
            <button type="button" className="btn btn--secondary" onClick={reload}>
              Reintentar
            </button>
          </>
        )}

        {!loading && !error && visibleLoans.length === 0 && (
          <p className="empty-state">
            {loans?.length ? 'Ningún préstamo coincide con la búsqueda.' : 'Aún no hay préstamos registrados.'}
          </p>
        )}

        {!loading && !error && visibleLoans.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <caption className="visually-hidden">Préstamos ({visibleLoans.length})</caption>
              <thead>
                <tr>
                  <SortableHeader column="book" label="Libro" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="member" label="Lector" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="loan_date" label="Prestado" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="due_date" label="Vence" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="status" label="Estado" sort={sort} onSort={toggleSort} />
                  <th scope="col">
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleLoans.map((loan) => {
                  const status = loanStatus(loan)

                  return (
                    <tr key={loan.id}>
                      <td data-label="Libro">
                        <strong>{loan.book.title}</strong>
                      </td>
                      <td data-label="Lector">{loan.member.name}</td>
                      <td data-label="Prestado">{formatDate(loan.loan_date)}</td>
                      <td data-label="Vence">{formatDate(loan.due_date)}</td>
                      <td data-label="Estado">
                        <span className={`badge ${status.badge}`}>{status.label}</span>
                        {loan.return_date && (
                          <span className="muted"> · {formatDate(loan.return_date)}</span>
                        )}
                      </td>
                      <td>
                        <div className="table__actions">
                          {loan.status !== 'RETURNED' && (
                            <button
                              type="button"
                              className="btn btn--secondary btn--small"
                              onClick={() => handleReturn(loan)}
                              aria-label={`Registrar devolución de ${loan.book.title}`}
                            >
                              Devolver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <p className="muted" aria-live="polite">
            Mostrando {visibleLoans.length} de {loans?.length ?? 0} préstamos.
          </p>
        )}
      </section>
    </>
  )
}
