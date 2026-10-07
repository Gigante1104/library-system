const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * '2026-10-14' → '14 oct 2026'.
 * Se arma la fecha con sus partes para evitar el desfase de zona horaria
 * que ocurre con new Date('2026-10-14') (se interpreta como UTC).
 */
export function formatDate(value) {
  if (!value) return '—'
  const [year, month, day] = value.split('-').map(Number)
  return dateFormatter.format(new Date(year, month - 1, day))
}

/** Fecha local en formato YYYY-MM-DD, sumando días a hoy (para inputs type="date"). */
export function dateFromToday(days = 0) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** Toma el primer mensaje de cada campo de un error 422 de Laravel. */
export function firstErrors(errors = {}) {
  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0]]))
}
