import { useState } from 'react'
import { dateFromToday } from '../utils/format'
import { borrowingBlockReason, DEFAULT_LOAN_DAYS, MAX_ACTIVE_LOANS, MAX_LOAN_DAYS } from '../utils/loanRules'
import FormField from './FormField'

function validate(values) {
  const errors = {}

  if (!values.book_id) errors.book_id = 'Selecciona un libro.'
  if (!values.member_id) errors.member_id = 'Selecciona un lector.'

  // Las fechas YYYY-MM-DD se pueden comparar como texto
  if (!values.due_date) {
    errors.due_date = 'Indica la fecha de devolución.'
  } else if (values.due_date < dateFromToday()) {
    errors.due_date = 'La fecha de devolución no puede ser anterior a hoy.'
  } else if (values.due_date > dateFromToday(MAX_LOAN_DAYS)) {
    errors.due_date = `El plazo máximo es de ${MAX_LOAN_DAYS} días.`
  }

  return errors
}

export default function LoanForm({ books, members, serverErrors = {}, submitting, onSubmit, onCancel }) {
  const [values, setValues] = useState({ book_id: '', member_id: '', due_date: dateFromToday(DEFAULT_LOAN_DAYS) })
  const [errors, setErrors] = useState({})

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
        book_id: Number(values.book_id), // Los <select> devuelven texto; la API espera números
        member_id: Number(values.member_id),
        due_date: values.due_date,
      })
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate aria-label="Nuevo préstamo">
      <div className="grid grid--3">
        <FormField
          id="book_id"
          label="Libro"
          as="select"
          required
          autoFocus
          value={values.book_id}
          onChange={handleChange}
          error={fieldError('book_id')}
          hint={`${books.length} libros disponibles`}
        >
          <option value="">Selecciona un libro</option>
          {books.map((book) => (
            <option key={book.id} value={book.id}>
              {book.title} — {book.author}
            </option>
          ))}
        </FormField>

        <FormField
          id="member_id"
          label="Lector"
          as="select"
          required
          value={values.member_id}
          onChange={handleChange}
          error={fieldError('member_id')}
        >
          <option value="">Selecciona un lector</option>
          {members.map((member) => {
            // Los lectores que no cumplen las reglas se muestran deshabilitados con el motivo
            const blockReason = borrowingBlockReason(member)

            return (
              <option key={member.id} value={member.id} disabled={Boolean(blockReason)}>
                {member.name} ({member.active_loans_count}/{MAX_ACTIVE_LOANS})
                {blockReason && ` — ${blockReason}`}
              </option>
            )
          })}
        </FormField>

        <FormField
          id="due_date"
          label="Fecha de devolución"
          type="date"
          required
          min={dateFromToday()}
          max={dateFromToday(MAX_LOAN_DAYS)}
          value={values.due_date}
          onChange={handleChange}
          error={fieldError('due_date')}
          hint={`Máximo ${MAX_LOAN_DAYS} días desde hoy`}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Registrando…' : 'Registrar préstamo'}
        </button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
