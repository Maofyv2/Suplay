import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="suplay-footer mt-auto py-5" id="main-footer">
      <div className="container-xl">
        <div className="row g-4 mb-4">
          {/* Brand */}
          <div className="col-12 col-md-4">
            <Link className="text-decoration-none d-flex align-items-center gap-2 mb-3" to={ROUTES.HOME}>
              <i className="bi bi-box-seam-fill fs-4 text-primary" />
              <span className="fw-bold fs-5 text-white">Suplay</span>
            </Link>
            <p className="text-secondary small mb-0">
              The modern B2B marketplace connecting businesses with trusted suppliers across the Philippines.
            </p>
          </div>

          {/* Marketplace */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Marketplace</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><Link to={ROUTES.PRODUCTS} className="suplay-footer-link">Products</Link></li>
              <li className="mb-2"><Link to={ROUTES.SUPPLIERS} className="suplay-footer-link">Suppliers</Link></li>
              <li className="mb-2"><Link to={ROUTES.CONTACT} className="suplay-footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="suplay-footer-link">About Us</a></li>
              <li className="mb-2"><a href="#" className="suplay-footer-link">Careers</a></li>
              <li className="mb-2"><a href="#" className="suplay-footer-link">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#" className="suplay-footer-link">Help Center</a></li>
              <li className="mb-2"><a href="#" className="suplay-footer-link">Privacy Policy</a></li>
              <li className="mb-2"><a href="#" className="suplay-footer-link">Terms of Service</a></li>
            </ul>
          </div>

          {/* Social */}
          <div className="col-6 col-md-2">
            <h6 className="text-white fw-semibold mb-3">Follow Us</h6>
            <div className="d-flex gap-2">
              <a href="#" className="suplay-social-icon" aria-label="Facebook"><i className="bi bi-facebook" /></a>
              <a href="#" className="suplay-social-icon" aria-label="LinkedIn"><i className="bi bi-linkedin" /></a>
              <a href="#" className="suplay-social-icon" aria-label="Twitter/X"><i className="bi bi-twitter-x" /></a>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <p className="text-secondary small mb-0">
            &copy; {year} Suplay. All rights reserved.
          </p>
          <p className="text-secondary small mb-0">
            Built for Philippine B2B commerce.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
