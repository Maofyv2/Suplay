/**
 * Loading spinner component.
 * @param {boolean} [fullScreen=false] - Centres the spinner in the full viewport.
 * @param {string} [message] - Optional message below the spinner.
 * @param {'sm'|'md'|'lg'} [size='md']
 */
function Loading({ fullScreen = false, message, size = 'md' }) {
  const sizeClass = size === 'sm' ? '' : size === 'lg' ? 'spinner-border-lg' : '';

  const spinner = (
    <div className="d-flex flex-column align-items-center gap-3">
      <div
        className={`spinner-border text-primary ${sizeClass}`}
        role="status"
        aria-label="Loading…"
      >
        <span className="visually-hidden">Loading…</span>
      </div>
      {message && <p className="text-muted mb-0 small">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: '100vh' }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-5">
      {spinner}
    </div>
  );
}

export default Loading;
