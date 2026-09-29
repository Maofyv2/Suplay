import { useState } from 'react';

function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend
    setSubmitted(true);
  };

  return (
    <main className="container-xl py-5" id="contact-page">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="fw-bold mb-1">Contact Us</h1>
          <p className="text-muted mb-4">Have a question or need help? We'd love to hear from you.</p>

          {submitted ? (
            <div className="alert alert-success d-flex align-items-center gap-2">
              <i className="bi bi-check-circle-fill" />
              Thank you! We'll get back to you within 1-2 business days.
            </div>
          ) : (
            <div className="card border-0 shadow-sm p-4">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="contact-name" className="form-label fw-medium">Full Name *</label>
                    <input id="contact-name" name="name" className="form-control" required value={form.name} onChange={handleChange} placeholder="Ana Reyes" />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="contact-email" className="form-label fw-medium">Email *</label>
                    <input id="contact-email" name="email" type="email" className="form-control" required value={form.email} onChange={handleChange} placeholder="ana@company.com" />
                  </div>
                  <div className="col-12">
                    <label htmlFor="contact-subject" className="form-label fw-medium">Subject *</label>
                    <input id="contact-subject" name="subject" className="form-control" required value={form.subject} onChange={handleChange} placeholder="e.g. Supplier enquiry" />
                  </div>
                  <div className="col-12">
                    <label htmlFor="contact-message" className="form-label fw-medium">Message *</label>
                    <textarea id="contact-message" name="message" className="form-control" rows={5} required value={form.message} onChange={handleChange} placeholder="Describe your enquiry…" />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-send me-2" />Send Message
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Info */}
          <div className="row g-3 mt-4">
            {[
              { icon: 'bi-envelope', label: 'Email', value: 'hello@suplay.ph' },
              { icon: 'bi-telephone', label: 'Phone', value: '+63 2 8123 4567' },
              { icon: 'bi-geo-alt', label: 'Address', value: 'Makati City, Metro Manila' },
            ].map((info) => (
              <div className="col-md-4" key={info.label}>
                <div className="d-flex align-items-center gap-3 p-3 rounded-3 bg-light">
                  <i className={`bi ${info.icon} fs-5 text-primary`} />
                  <div>
                    <p className="small text-muted mb-0">{info.label}</p>
                    <p className="fw-medium mb-0 small">{info.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Contact;
