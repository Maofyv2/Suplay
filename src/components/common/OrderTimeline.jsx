import React from 'react';

const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'bi-bag-check' },
  { key: 'processing', label: 'Processing', icon: 'bi-gear' },
  { key: 'shipped', label: 'Shipped', icon: 'bi-truck' },
  { key: 'delivered', label: 'Delivered', icon: 'bi-check-circle' },
];

function OrderTimeline({ status }) {
  const currentStatus = (status || '').toLowerCase();
  const isCancelled = currentStatus === 'cancelled';

  const statusIndexMap = {
    pending: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
  };

  const currentIndex = statusIndexMap[currentStatus] ?? -1;

  if (isCancelled) {
    return (
      <div className="bg-danger-subtle text-danger border border-danger-subtle rounded-3 p-3 text-center my-3">
        <i className="bi bi-x-circle-fill fs-4 d-block mb-1"></i>
        <strong className="d-block">Order Cancelled</strong>
        <span className="small text-danger-emphasis">This order has been cancelled.</span>
      </div>
    );
  }

  return (
    <div className="py-3 px-2">
      <div className="position-relative d-flex justify-content-between align-items-center">
        {/* Connecting Progress Bar Line */}
        <div
          className="position-absolute top-50 start-0 translate-middle-y w-100"
          style={{ height: '3px', backgroundColor: '#e9ecef', zIndex: 0 }}
        >
          <div
            className="h-100 bg-success transition-all"
            style={{
              width: `${Math.max(0, Math.min(100, (currentIndex / (STEPS.length - 1)) * 100))}%`,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, idx) => {
          const isPassed = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          let circleBg = 'bg-white border text-muted';
          let textColor = 'text-muted';

          if (isPassed) {
            circleBg = 'bg-success text-white border-success';
            textColor = 'text-success fw-medium';
          } else if (isCurrent) {
            circleBg = 'bg-primary text-white border-primary shadow-sm';
            textColor = 'text-primary fw-bold';
          }

          return (
            <div
              key={step.key}
              className="d-flex flex-column align-items-center position-relative"
              style={{ zIndex: 1, width: '70px' }}
            >
              <div
                className={`rounded-circle d-flex align-items-center justify-content-center ${circleBg}`}
                style={{
                  width: '36px',
                  height: '36px',
                  fontSize: '0.85rem',
                  borderWidth: '2px',
                  borderStyle: 'solid',
                }}
              >
                {isPassed ? (
                  <i className="bi bi-check-lg fw-bold" />
                ) : (
                  <i className={`bi ${step.icon}`} />
                )}
              </div>
              <span
                className={`small text-center mt-2 ${textColor}`}
                style={{ fontSize: '0.75rem', lineHeight: '1.2' }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OrderTimeline;
