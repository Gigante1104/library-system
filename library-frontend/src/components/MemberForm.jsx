import { useState } from 'react'
import FormField from './FormField'

const EMPTY_MEMBER = { name: '', email: '', phone: '' }

// Expresiones regulares: patrones de texto para validar formatos
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // algo@algo.algo
const PHONE_PATTERN = /^[0-9+\s()-]{7,20}$/ // dígitos, +, espacios, paréntesis y guiones

function validate(values) {
  const errors = {}

  if (!values.name.trim()) {
    errors.name = 'El nombre es obligatorio.'
  } else if (values.name.trim().length > 255) {
    errors.name = 'El nombre no puede superar 255 caracteres.'
  }

  if (!values.email.trim()) {
    errors.email = 'El correo es obligatorio.'
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Ingresa un correo válido, por ejemplo nombre@correo.com.'
  }

  // El teléfono es opcional: solo se valida si se escribió algo
  if (values.phone.trim() && !PHONE_PATTERN.test(values.phone.trim())) {
    errors.phone = 'Ingresa un teléfono válido (7 a 20 dígitos).'
  }

  return errors
}

export default function MemberForm({ initialValues, serverErrors = {}, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    initialValues ? { ...initialValues, phone: initialValues.phone ?? '' } : EMPTY_MEMBER,
  )
  const [errors, setErrors] = useState({})

  const isEditing = Boolean(initialValues)
  const fieldError = (field) => errors[field] ?? serverErrors[field]

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null, // Vacío se envía como null (campo opcional)
      })
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-label={isEditing ? 'Editar lector' : 'Nuevo lector'}>
      <div className="grid grid--3">
        <FormField
          id="name"
          label="Nombre completo"
          required
          autoFocus
          maxLength={255}
          autoComplete="name"
          value={values.name}
          onChange={handleChange}
          error={fieldError('name')}
        />
        <FormField
          id="email"
          label="Correo"
          type="email"
          required
          maxLength={255}
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          error={fieldError('email')}
        />
        <FormField
          id="phone"
          label="Teléfono"
          type="tel"
          maxLength={20}
          autoComplete="tel"
          value={values.phone}
          onChange={handleChange}
          error={fieldError('phone')}
          hint="Opcional"
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar lector'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
