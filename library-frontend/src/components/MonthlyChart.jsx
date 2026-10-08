const monthFormatter = new Intl.DateTimeFormat('es-CO', { month: 'short' })
const monthLongFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

// '2026-10' → Date del 1 de octubre de 2026 (hora local)
const toDate = (month) => {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber - 1, 1)
}

/**
 * Gráfico de columnas de préstamos por mes.
 * Cada columna muestra su valor al pasar el mouse. Para teclado y lectores de pantalla
 * el gráfico se oculta (aria-hidden) y se ofrece la tabla equivalente.
 */
export default function MonthlyChart({ data }) {
  const max = Math.max(1, ...data.map((item) => item.total)) // 1 evita dividir entre cero

  return (
    <>
      <ul className="column-chart" aria-hidden="true">
        {data.map((item) => {
          const date = toDate(item.month)

          return (
            <li key={item.month} className="column-chart__item">
              <div className="column-chart__plot">
                <span className="column-chart__tooltip">
                  {item.total} {item.total === 1 ? 'préstamo' : 'préstamos'}
                </span>
                <div className="column-chart__bar" style={{ height: `${(item.total / max) * 100}%` }} />
              </div>
              <span className="column-chart__label" title={monthLongFormatter.format(date)}>
                {monthFormatter.format(date).replace('.', '')}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Vista de tabla: alternativa accesible al gráfico */}
      <details className="chart-table">
        <summary>Ver datos en tabla</summary>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Mes</th>
              <th scope="col">Préstamos</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.month}>
                <td data-label="Mes">{monthLongFormatter.format(toDate(item.month))}</td>
                <td data-label="Préstamos">{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  )
}
