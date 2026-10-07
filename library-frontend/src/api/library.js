// Funciones por recurso: los componentes no conocen las URLs, solo llaman estas funciones.
import { api } from './client'

export const booksApi = {
  list: () => api.get('/books'),
  create: (book) => api.post('/books', book),
  update: (id, book) => api.put(`/books/${id}`, book),
  remove: (id) => api.delete(`/books/${id}`),
}

export const genresApi = {
  list: () => api.get('/genres'),
}

export const membersApi = {
  list: () => api.get('/members'),
  create: (member) => api.post('/members', member),
  update: (id, member) => api.put(`/members/${id}`, member),
  remove: (id) => api.delete(`/members/${id}`),
}

export const loansApi = {
  list: () => api.get('/loans'),
  create: (loan) => api.post('/loans', loan),
  returnBook: (id) => api.post(`/loans/${id}/return`),
}

export const statisticsApi = {
  get: () => api.get('/statistics'),
}
