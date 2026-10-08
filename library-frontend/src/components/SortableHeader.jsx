/**
 * Encabezado de tabla que ordena al hacer clic.
 * aria-sort informa a los lectores de pantalla cómo está ordenada la columna.
 */
export default function SortableHeader({ column, label, sort, onSort }) {
  const isActive = sort.key === column
  const ariaSort = isActive ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'
  const icon = isActive ? (sort.direction === 'asc' ? '▲' : '▼') : '↕'

  return (
    <th scope="col" aria-sort={ariaSort}>
      <button type="button" className="sort-button" onClick={() => onSort(column)}>
        {label}
        <span aria-hidden="true" className="sort-button__icon">
          {icon}
        </span>
      </button>
    </th>
  )
}
