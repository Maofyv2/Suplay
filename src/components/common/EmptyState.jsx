/**
 * EmptyState — displayed when a list has no items.
 * @param {string} [icon='bi-inbox'] - Bootstrap Icons class name.
 * @param {string} [title='Nothing here yet']
 * @param {string} [description]
 * @param {React.ReactNode} [action] - Optional CTA button/link.
 */
function EmptyState({
  icon = 'bi-inbox',
  title = 'Nothing here yet',
  description,
  message,
  action,
}) {
  const subtitle = description || message;
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center">
      <i className={`bi ${icon} display-4 text-secondary mb-3`} aria-hidden="true" />
      <h5 className="fw-semibold mb-1">{title}</h5>
      {subtitle && <p className="text-muted small mb-3">{subtitle}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;
