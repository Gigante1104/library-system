/**
 * Campo de formulario accesible: une la etiqueta con el input (htmlFor/id)
 * y asocia el mensaje de error al campo (aria-describedby).
 * Uso: <FormField id="title" label="Título" error={errors.title} value={...} onChange={...} />
 *      <FormField as="select" ...><option>...</option></FormField>
 */
export default function FormField({ id, label, error, hint, required, as: Tag = 'input', children, ...props }) {
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined

  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label} {required && <span className="required" aria-hidden="true">*</span>}
      </label>

      <Tag
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {children}
      </Tag>

      {hint && (
        <span id={`${id}-hint`} className="form-field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className="form-field__error">
          {error}
        </span>
      )}
    </div>
  )
}
