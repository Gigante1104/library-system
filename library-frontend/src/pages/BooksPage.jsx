import { useMemo, useState } from 'react'
import { booksApi, genresApi } from '../api/library'
import { useApi } from '../hooks/useApi'
import { useSort } from '../hooks/useSort'
import { firstErrors } from '../utils/format'
import Alert from '../components/Alert'
import BookForm from '../components/BookForm'
import FormField from '../components/FormField'
import SortableHeader from '../components/SortableHeader'
import Toast from '../components/Toast'

const AVAILABILITY_FILTERS = {
  all: 'Todos',
  available: 'Disponibles',
  borrowed: 'Prestados',
}

export default function BooksPage() {
  const { data: books, loading, error, reload } = useApi(booksApi.list)
  const { data: genres } = useApi(genresApi.list)

  // null = formulario cerrado, 'new' = creando, objeto libro = editando
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState('all')

  // useMemo: solo recalcula el filtro cuando cambian los libros o los filtros
  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase()

    return (books ?? []).filter((book) => {
      const matchesText = [book.title, book.author, book.genre].some((field) => field.toLowerCase().includes(term))
      const matchesAvailability =
        availability === 'all' || (availability === 'available' ? book.is_available : !book.is_available)

      return matchesText && matchesAvailability
    })
  }, [books, search, availability])

  // Primero se filtra y luego se ordena el resultado
  const { sorted: visibleBooks, sort, toggleSort } = useSort(filteredBooks, 'title')

  function openForm(book) {
    setEditing(book)
    setServerErrors({})
    setFeedback(null)
  }

  async function handleSubmit(values) {
    setSubmitting(true)
    setServerErrors({})

    try {
      const isNew = editing === 'new'
      const response = isNew ? await booksApi.create(values) : await booksApi.update(editing.id, values)

      setFeedback({ type: 'success', message: response.message })
      setEditing(null)
      reload()
    } catch (err) {
      if (err.status === 422) {
        setServerErrors(firstErrors(err.errors))
      } else {
        setFeedback({ type: 'error', message: err.message })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(book) {
    if (!window.confirm(`¿Eliminar el libro "${book.title}"? Esta acción no se puede deshacer.`)) return

    try {
      const response = await booksApi.remove(book.id)
      setFeedback({ type: 'success', message: response.message })
      reload()
    } catch (err) {
      // Ej. 409: el libro está prestado o tiene historial de préstamos
      setFeedback({ type: 'error', message: err.message })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Libros</h1>
          <p>Catálogo de la biblioteca y su disponibilidad.</p>
        </div>
        {!editing && (
          <button type="button" className="btn" onClick={() => openForm('new')}>
            + Nuevo libro
          </button>
        )}
      </div>

      <Toast type={feedback?.type} message={feedback?.message} onClose={() => setFeedback(null)} />

      {editing && (
        <section className="card" aria-labelledby="book-form-title">
          <h2 id="book-form-title">{editing === 'new' ? 'Nuevo libro' : `Editar: ${editing.title}`}</h2>
          <BookForm
            // key: al cambiar de libro, React crea un formulario nuevo con sus valores
            key={editing === 'new' ? 'new' : editing.id}
            initialValues={editing === 'new' ? null : editing}
            genres={genres ?? []}
            serverErrors={serverErrors}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </section>
      )}

      <section className="card" aria-labelledby="books-list-title">
        <h2 id="books-list-title" className="visually-hidden">
          Listado de libros
        </h2>

        <div className="toolbar">
          <FormField
            id="book-search"
            label="Buscar"
            type="search"
            placeholder="Título, autor o género"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <FormField
            id="book-availability"
            label="Disponibilidad"
            as="select"
            value={availability}
            onChange={(event) => setAvailability(event.target.value)}
          >
            {Object.entries(AVAILABILITY_FILTERS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </FormField>
        </div>

        {loading && <p className="empty-state">Cargando libros…</p>}

        {error && (
          <>
            <Alert type="error" message={error} />
            <button type="button" className="btn btn--secondary" onClick={reload}>
              Reintentar
            </button>
          </>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <p className="empty-state">
            {books?.length ? 'Ningún libro coincide con la búsqueda.' : 'Aún no hay libros registrados.'}
          </p>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <caption className="visually-hidden">Libros del catálogo ({filteredBooks.length})</caption>
              <thead>
                <tr>
                  <SortableHeader column="title" label="Título" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="author" label="Autor" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="genre" label="Género" sort={sort} onSort={toggleSort} />
                  <SortableHeader column="is_available" label="Estado" sort={sort} onSort={toggleSort} />
                  <th scope="col">
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleBooks.map((book) => (
                  <tr key={book.id}>
                    <td data-label="Título">
                      <strong>{book.title}</strong>
                    </td>
                    <td data-label="Autor">{book.author}</td>
                    <td data-label="Género">{book.genre}</td>
                    <td data-label="Estado">
                      <span className={`badge ${book.is_available ? 'badge--success' : 'badge--warning'}`}>
                        {book.is_available ? 'Disponible' : 'Prestado'}
                      </span>
                    </td>
                    <td>
                      <div className="table__actions">
                        <button
                          type="button"
                          className="btn btn--secondary btn--small"
                          onClick={() => openForm(book)}
                          aria-label={`Editar ${book.title}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn--danger btn--small"
                          onClick={() => handleDelete(book)}
                          aria-label={`Eliminar ${book.title}`}
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
            Mostrando {filteredBooks.length} de {books?.length ?? 0} libros.
          </p>
        )}
      </section>
    </>
  )
}
