/**
 * Mensaje de éxito o error.
 * role="alert" hace que los lectores de pantalla lo anuncien de inmediato.
 */
export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="alert__close" onClick={onClose} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  )
}
