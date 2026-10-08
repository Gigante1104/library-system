import { useState } from 'react'
import FormField from './FormField'

const EMPTY_BOOK = { title: '', author: '', genre: '' }

/**
 * Validación en el navegador: da respuesta inmediata sin esperar al servidor.
 * El backend vuelve a validar (nunca se confía solo en el frontend).
 * Devuelve un objeto { campo: 'mensaje' } con los errores encontrados.
 */
function validate(values) {
  const errors = {}

  if (!values.title.trim()) {
    errors.title = 'El título es obligatorio.'
  } else if (values.title.trim().length > 255) {
    errors.title = 'El título no puede superar 255 caracteres.'
  }

  if (!values.author.trim()) {
    errors.author = 'El autor es obligatorio.'
  } else if (values.author.trim().length > 255) {
    errors.author = 'El autor no puede superar 255 caracteres.'
  }

  // El género viene de una lista cerrada (select), solo se verifica que se haya elegido
  if (!values.genre) {
    errors.genre = 'Selecciona un género.'
  }

  return errors
}

export default function BookForm({ initialValues, genres = [], serverErrors = {}, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(initialValues ?? EMPTY_BOOK)
  const [errors, setErrors] = useState({})

  const isEditing = Boolean(initialValues)
  // Los errores del servidor (422) se muestran si no hay un error local en ese campo
  const fieldError = (field) => errors[field] ?? serverErrors[field]

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    // Al corregir un campo se limpia su error
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault() // Evita que el navegador recargue la página
    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        title: values.title.trim(),
        author: values.author.trim(),
        genre: values.genre,
      })
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-label={isEditing ? 'Editar libro' : 'Nuevo libro'}>
      <div className="grid grid--3">
        <FormField
          id="title"
          label="Título"
          required
          autoFocus
          maxLength={255}
          value={values.title}
          onChange={handleChange}
          error={fieldError('title')}
        />
        <FormField
          id="author"
          label="Autor"
          required
          maxLength={255}
          value={values.author}
          onChange={handleChange}
          error={fieldError('author')}
        />
        <FormField
          id="genre"
          label="Género"
          as="select"
          required
          value={values.genre}
          onChange={handleChange}
          error={fieldError('genre')}
        >
          <option value="">Selecciona un género</option>
          {/* El catálogo viene del backend (GET /api/genres): una sola fuente de verdad */}
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </FormField>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear libro'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
