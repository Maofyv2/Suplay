import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createProduct } from '../../services/productService';
import Input from '../../components/common/Input';
import { PRODUCT_CATEGORIES, ROUTES } from '../../utils/constants';

function AddProduct() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '', unit: '', moq: '', description: '' });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const effectiveSupplierId = currentUser?.supplierId || currentUser?.id || currentUser?._id;
      const effectiveSupplierName = currentUser?.companyName || currentUser?.name || 'Supplier';

      await createProduct({
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        moq: parseInt(form.moq, 10),
        supplierId: String(effectiveSupplierId),
        supplierName: effectiveSupplierName,
        ...(imageFile ? { imageFile } : {}),
      });
      setSuccess(true);
      setTimeout(() => navigate(ROUTES.SUPPLIER_MY_PRODUCTS), 1500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container-xl py-5" id="add-product-page">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h1 className="fw-bold mb-4">Add New Product</h1>

          {success && (
            <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
              Product added! Redirecting…
            </div>
          )}

          <div className="card border-0 shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Image Upload */}
                <div className="col-12">
                  <label className="form-label fw-medium">Product Image</label>
                  <div
                    className="border rounded-3 p-4 text-center position-relative"
                    style={{
                      background: imagePreview ? 'transparent' : 'var(--bs-gray-100)',
                      cursor: 'pointer',
                      minHeight: '180px',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="position-relative d-inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                          style={{ transform: 'translate(30%, -30%)', width: '28px', height: '28px', padding: 0 }}
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="py-3">
                        <i className="bi bi-cloud-arrow-up display-5 text-muted d-block mb-2" />
                        <p className="text-muted mb-1">Click to upload product image</p>
                        <small className="text-muted">JPG, PNG, WebP — max 5 MB</small>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="d-none"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <Input id="ap-name" label="Product Name *" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Industrial Ball Bearings" />
                </div>
                <div className="col-md-6">
                  <label htmlFor="ap-category" className="form-label fw-medium">Category *</label>
                  <select id="ap-category" name="category" className="form-select" value={form.category} onChange={handleChange} required>
                    <option value="">Select category</option>
                    {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <Input id="ap-unit" label="Unit *" name="unit" value={form.unit} onChange={handleChange} required placeholder="piece, pack, ream…" />
                </div>
                <div className="col-md-4">
                  <Input id="ap-price" label="Price (₱) *" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <Input id="ap-stock" label="Stock *" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <Input id="ap-moq" label="Min. Order Qty *" name="moq" type="number" min="1" value={form.moq} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label htmlFor="ap-desc" className="form-label fw-medium">Description</label>
                  <textarea id="ap-desc" name="description" className="form-control" rows={4} value={form.description} onChange={handleChange} placeholder="Describe your product…" />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm" />}
                  <i className="bi bi-plus-circle me-1" />Add Product
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddProduct;
