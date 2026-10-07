import { useMemo, useState } from 'react'

// Compara textos en español ignorando mayúsculas y tildes ("Álgebra" junto a "algebra")
const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true })

function compare(a, b) {
  if (a == null) return 1 // Los valores vacíos siempre al final
  if (b == null) return -1
  if (typeof a === 'string') return collator.compare(a, b)
  return Number(a) - Number(b) // Números y booleanos
}

// Constante fuera del componente: un {} por defecto sería un objeto nuevo en cada render y anularía useMemo
const NO_ACCESSORS = {}

/**
 * Ordena una lista por columna; al volver a elegir la misma columna invierte el orden.
 * accessors permite ordenar por datos anidados, ej. { book: (loan) => loan.book.title }
 * (defínelo fuera del componente para que no cambie en cada render).
 */
export function useSort(items, initialKey, accessors = NO_ACCESSORS) {
  const [sort, setSort] = useState({ key: initialKey, direction: 'asc' })

  const sorted = useMemo(() => {
    const getValue = accessors[sort.key] ?? ((item) => item[sort.key])
    const factor = sort.direction === 'asc' ? 1 : -1

    // [...items] crea una copia: sort() modifica el arreglo original
    return [...items].sort((a, b) => compare(getValue(a), getValue(b)) * factor)
  }, [items, sort, accessors])

  function toggleSort(key) {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return { sorted, sort, toggleSort }
}
