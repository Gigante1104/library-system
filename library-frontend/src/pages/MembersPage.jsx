import { useMemo, useState } from 'react'
import { membersApi } from '../api/library'
import { useApi } from '../hooks/useApi'
import { useSort } from '../hooks/useSort'
import { firstErrors } from '../utils/format'
import { MAX_ACTIVE_LOANS } from '../utils/loanRules'
import Alert from '../components/Alert'
import FormField from '../components/FormField'
import MemberForm from '../components/MemberForm'
import SortableHeader from '../components/SortableHeader'
import Toast from '../components/Toast'

export default function MembersPage() {
  const { data: members, loading, error, reload } = useApi(membersApi.list)

  // null = formulario cerrado, 'new' = creando, objeto lector = editando
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [search, setSearch] = useState('')

  const filteredMembers = useMemo(() => {
    const term = search.trim().toLowerCase()

    return (members ?? []).filter((member) =>
      [member.name, member.email, member.phone ?? ''].some((field) => field.toLowerCase().includes(term)),
    )
  }, [members, search])

  const { sorted: visibleMembers, sort, toggleSort } = useSort(filteredMembers, 'name')

  function openForm(member) {
    setEditing(member)
    setServerErrors({})
    setFeedback(null)
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    setServerErrors({})

    try {
      const isNew = editing === 'new'
      const response = isNew ? await membersApi.create(values) : await membersApi.update(editing.id, values)

      setFeedback({ type: 'success', message: response.message })
      setEditing(null)
      reload()
    } catch (err) {
      if (err.status === 422) {
        setServerErrors(firstErrors(err.errors)) // ej. correo ya registrado
      } else {
        setFeedback({ type: 'error', message: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(member) {
    if (!window.confirm(`¿Eliminar al lector "${member.name}"? Esta acción no se puede deshacer.`)) return

    try {
      const response = await membersApi.remove(member.id)
      setFeedback({ type: 'success', message: response.message })
      reload()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Lectores</h1>
          <p>Personas registradas que pueden solicitar préstamos.</p>
        </div>
        {!editing && (
          <button type="button" className="btn" onClick={() => openForm('new')}>
            + Nuevo lector
          </button>
        )}
      </div>

      <Toast type={feedback?.type} message={feedback?.message} onClose={() => setFeedback(null)} />

      {editing && (
        <section className="card" aria-labelledby="member-form-title">
          <h2 id="member-form-title">{editing === 'new' ? 'Nuevo lector' : `Editar: ${editing.name}`}</h2>
          <MemberForm
            key={editing === 'new' ? 'new' : editing.id}
            initialValues={editing === 'new' ? null : editing}
            serverErrors={serverErrors}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      <section className="card" aria-labelledby="members-list-title">
        <h2 id="members-list-title" className="visually-hidden">
          Listado de lectores
        </h2>

        <div className="toolbar">
          <FormField
            id="member-search"
            label="Buscar"
            type="search"
            placeholder="Nombre, correo o teléfono"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && <p className="empty-state">Cargando lectores…</p>}

        {error && (
          <>
            <Alert type="error" message={error} />
            <button type="button" className="btn btn--secondary" onClick={reload}>
              Reintentar
            </button>
          </>
        )}

        {!loading && !error && visibleMembers.length === 0 && (
          <p className="empty-state">
            {members?.length ? 'Ningún lector coincide con la búsqueda.' : 'Aún no hay lectores registrados.'}
          </p>
        )}

        {!loading && !error && visibleMembers.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <caption className="visually-hidden">Lectores registrados ({visibleMembers.length})</caption>
              <thead>
                <tr>
                  <SortableHeader column="name" label="Nombre" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="email" label="Correo" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="phone" label="Teléfono" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="active_loans_count" label="Activos" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="loans_count" label="Total histórico" sort={sort} onSort={toggleSort} />
                  <th scope="col">
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleMembers.map((member) => (
                  <tr key={member.id}>
                    <td data-label="Nombre">
                      <strong>{member.name}</strong>
                    </td>
                    <td data-label="Correo">{member.email}</td>
                    <td data-label="Teléfono">{member.phone ?? <span className="muted">—</span>}</td>
                    <td data-label="Activos">
                      <span
                        className={member.active_loans_count >= MAX_ACTIVE_LOANS ? 'badge badge--warning' : undefined}
                        aria-label={`${member.active_loans_count} de ${MAX_ACTIVE_LOANS} préstamos activos`}
                      >
                        {member.active_loans_count} / {MAX_ACTIVE_LOANS}
                      </span>
                      {member.overdue_loans_count > 0 && (
                        <>
                          {' '}
                          <span className="badge badge--danger">
                            {member.overdue_loans_count} {member.overdue_loans_count === 1 ? 'vencido' : 'vencidos'}
                          </span>
                        </>
                      )}
                    </td>
                    <td data-label="Total histórico">{member.loans_count}</td>
                    <td>
                      <div className="table__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--small"
                          onClick={() => openForm(member)}
                          aria-label={`Editar ${member.name}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          onClick={() => handleDelete(member)}
                          aria-label={`Eliminar ${member.name}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <p className="muted" aria-live="polite">
            Mostrando {visibleMembers.length} de {members?.length ?? 0} lectores.
          </p>
        )}
      </section>
    </>
  )
}
