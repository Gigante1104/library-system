// Cliente HTTP central: todas las peticiones a la API pasan por aquí,
// así el manejo de errores se escribe una sola vez.

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

/**
 * Error con la información que devuelve Laravel:
 * - status: código HTTP (422 validación, 409 regla de negocio, 404, 500...)
 * - errors: errores por campo cuando es 422, ej. { title: ['...'] }
 */
export class ApiError extends Error {
  constructor(message, status = 0, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

async function request(method, path, body) {
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    // fetch solo falla aquí si no hay conexión (servidor apagado, sin red)
    throw new ApiError('No se pudo conectar con el servidor. Verifica que la API esté en ejecución.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data?.message ?? `Error inesperado del servidor (${response.status}).`
    throw new ApiError(message, response.status, data?.errors ?? {})
  }

  return data
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
