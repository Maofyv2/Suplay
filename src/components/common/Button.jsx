/**
 * Reusable Button component.
 * @param {'primary'|'secondary'|'danger'|'outline'|'ghost'} [variant='primary']
 * @param {'sm'|'md'|'lg'} [size='md']
 * @param {boolean} [loading=false] - Shows spinner when true.
 * @param {boolean} [fullWidth=false]
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    outline: 'btn-outline-primary',
    ghost: 'btn-link',
    success: 'btn-success',
    warning: 'btn-warning',
  };

  const sizeMap = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  const classes = [
    'btn',
    variantMap[variant] || 'btn-primary',
    sizeMap[size] || '',
    fullWidth ? 'w-100' : '',
    'd-inline-flex align-items-center gap-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <span
          className="spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}

export default Button;
