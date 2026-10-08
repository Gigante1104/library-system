/**
 * Ranking con barras horizontales. Cada barra es proporcional al valor más alto.
 * items: [{ id, label, detail?, value }]
 */
export default function BarList({ items, unit = 'préstamos', emptyText = 'Sin datos todavía.' }) {
  if (items.length === 0) return <p className="muted">{emptyText}</p>

  const max = Math.max(...items.map((item) => item.value))

  return (
    <ol className="bar-list">
      {items.map((item) => (
        <li key={item.id}>
          <div className="bar-list__header">
            <span>
              <strong>{item.label}</strong>
              {item.detail && <span className="muted"> · {item.detail}</span>}
            </span>
            <span>
              {item.value} <span className="visually-hidden">{unit}</span>
            </span>
          </div>
          {/* aria-hidden: la barra es decorativa, el valor ya está escrito en texto */}
          <div className="bar" aria-hidden="true">
            <div className="bar__fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  )
}
