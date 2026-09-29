import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, updateProduct } from '../../services/productService';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import { PRODUCT_CATEGORIES, ROUTES } from '../../utils/constants';

import { useApp } from '../../context/AppContext';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  useEffect(() => {
    getProductById(id).then((p) => {
      setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, unit: p.unit, moq: p.moq, description: p.description || '' });
      if (p.image) setExistingImage(p.image);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB', 'error');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImage(null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(id, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
        moq: parseInt(form.moq, 10),
        ...(imageFile ? { imageFile } : {}),
      });
      showToast('Product updated successfully!', 'success');
      navigate(ROUTES.SUPPLIER_MY_PRODUCTS);
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loading />;

  const currentImage = imagePreview || existingImage;

  return (
    <main className="container-xl py-5" id="edit-product-page">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h1 className="fw-bold mb-4">Edit Product</h1>
          <div className="card border-0 shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* Image Upload */}
                <div className="col-12">
                  <label className="form-label fw-medium">Product Image</label>
                  <div
                    className="border rounded-3 p-4 text-center position-relative"
                    style={{
                      background: currentImage ? 'transparent' : 'var(--bs-gray-100)',
                      cursor: 'pointer',
                      minHeight: '180px',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {currentImage ? (
                      <div className="position-relative d-inline-block">
                        <img
                          src={currentImage}
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
                  <Input id="ep-name" label="Product Name *" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label htmlFor="ep-category" className="form-label fw-medium">Category *</label>
                  <select id="ep-category" name="category" className="form-select" value={form.category} onChange={handleChange} required>
                    {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <Input id="ep-unit" label="Unit *" name="unit" value={form.unit} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <Input id="ep-price" label="Price (₱) *" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <Input id="ep-stock" label="Stock *" name="stock" type="number" min="0" value={form.stock} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <Input id="ep-moq" label="Min. Order Qty *" name="moq" type="number" min="1" value={form.moq} onChange={handleChange} required />
                </div>
                <div className="col-12">
                  <label htmlFor="ep-desc" className="form-label fw-medium">Description</label>
                  <textarea id="ep-desc" name="description" className="form-control" rows={4} value={form.description} onChange={handleChange} />
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm" />}
                  Save Changes
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

export default EditProduct;
