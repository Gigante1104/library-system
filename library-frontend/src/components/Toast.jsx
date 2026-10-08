import { useEffect, useRef } from 'react'
import Alert from './Alert'

const AUTO_CLOSE_MS = 4000

/**
 * Notificación flotante: queda visible aunque el usuario haya hecho scroll.
 * Los mensajes de éxito se cierran solos; los de error esperan a que el usuario los cierre.
 */
export default function Toast({ type, message, onClose }) {
  // useRef guarda la última función onClose sin reiniciar el temporizador en cada render
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (type !== 'success' || !message) return

    const timer = setTimeout(() => onCloseRef.current(), AUTO_CLOSE_MS)
    return () => clearTimeout(timer) // Limpieza: cancela el temporizador si el mensaje cambia
  }, [type, message])

  if (!message) return null

  return (
    <div className="toast-region">
      <Alert type={type} message={message} onClose={onClose} />
    </div>
  )
}
