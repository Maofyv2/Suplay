/**
 * Reusable Input component.
 * Wraps a Bootstrap form-control with label, error, and helper text support.
 */
function Input({
  id,
  label,
  error,
  helper,
  className = '',
  wrapperClassName = '',
  type = 'text',
  ...props
}) {
  return (
    <div className={`mb-3 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label fw-medium">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
      />
      {error && <div className="invalid-feedback">{error}</div>}
      {helper && !error && <div className="form-text text-muted">{helper}</div>}
    </div>
  );
}

export default Input;
