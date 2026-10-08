import { useCallback, useEffect, useState } from 'react'

/**
 * Hook para cargar datos de la API con estados de carga y error.
 * Uso: const { data, loading, error, reload } = useApi(booksApi.list)
 */
export function useApi(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Los setState ocurren al resolver la promesa (no de forma síncrona dentro del efecto)
  const load = useCallback(
    () =>
      fetcher()
        .then((result) => {
          setData(result)
          setError(null)
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false)),
    [fetcher],
  )

  useEffect(() => {
    load()
  }, [load])

  // Para recargar después de crear, editar o eliminar
  const reload = useCallback(() => {
    setLoading(true)
    return load()
  }, [load])

  return { data, loading, error, reload }
}
