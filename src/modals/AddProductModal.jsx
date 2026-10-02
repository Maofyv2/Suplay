import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Input from '../components/common/Input';
import { PRODUCT_CATEGORIES } from '../utils/constants';

/**
 * AddProductModal — form modal for adding a new product (supplier use).
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onSubmit - Receives form data object.
 */
function AddProductModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    moq: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit?.({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        moq: parseInt(form.moq, 10),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg border-0 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-product-modal-title"
      >
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom bg-light bg-opacity-50">
          <h5 className="modal-title fw-bold mb-0 text-dark" id="add-product-modal-title">
            <i className="bi bi-plus-circle me-2 text-primary" />Add New Product
          </h5>
          <button
            type="button"
            className="btn-close p-2"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* BODY / FORM */}
        <form onSubmit={handleSubmit} className="d-flex flex-column overflow-hidden flex-grow-1">
          <div className="p-4 overflow-y-auto flex-grow-1">
            <div className="row g-3">
              <div className="col-12">
                <Input id="add-name" label="Product Name *" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Industrial Ball Bearings (Pack of 50)" />
              </div>
              <div className="col-12">
                <label htmlFor="add-category" className="form-label fw-medium">Category *</label>
                <select id="add-category" name="category" className="form-select" value={form.category} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <Input id="add-price" label="Price (₱) *" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <Input id="add-stock" label="Stock *" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
              </div>
              <div className="col-md-4">
                <Input id="add-moq" label="Min. Order Qty *" name="moq" type="number" min="1" value={form.moq} onChange={handleChange} required />
              </div>
              <div className="col-12">
                <label htmlFor="add-description" className="form-label fw-medium">Description</label>
                <textarea id="add-description" name="description" className="form-control" rows={3} value={form.description} onChange={handleChange} placeholder="Describe the product…" />
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 pt-3 border-top bg-light bg-opacity-50 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary px-4 fw-medium" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 fw-medium" disabled={loading}>
              {loading && <span className="spinner-border spinner-border-sm" />}
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default AddProductModal;
