import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { useStore } from './store';
import api from './api';
import { OWNER } from './config';
import { Home, Shop, ProductPage, Cart, Auth, Checkout, Orders, Wishlist, Admin } from './pages';

const NAV = [
  ['The Edit', '/shop?sort=new'],
  ['Clothing', '/shop?category=Clothing'],
  ['Dresses', '/shop?category=Dresses'],
  ['Sets', '/shop?category=Sets'],
  ['Accessories', '/shop?category=Accessories'],
  ['Sale', '/shop?sale=1']
];

function Header() {
  const { user, cart, wish, load, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  const logout = async () => {
    await api.post('/auth/logout');
    await load();
    notify('Signed out successfully');
    nav('/');
  };

  const handleSearch = e => {
    e.preventDefault();
    if (q.trim()) {
      nav('/shop?q=' + encodeURIComponent(q.trim()));
      setSearchOpen(false);
    }
  };

  const totalCartCount = cart.reduce((acc, item) => acc + (item.qty || 1), 0);

  return (
    <header className="header">
      <div className="header-inner">
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Toggle Menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="logo">
          <span>LUXORA</span>
          <small>BOUTIQUE</small>
        </Link>

        <nav className={`nav-menu ${open ? 'open' : ''}`}>
          {NAV.map(([name, to]) => (
            <Link
              key={name}
              to={to}
              className={`nav-link ${name === 'Sale' ? 'sale' : ''}`}
              onClick={() => setOpen(false)}
            >
              {name}
            </Link>
          ))}
        </nav>

        <div className="icons">
          <div className={`search-container ${searchOpen ? 'active' : ''}`}>
            <form onSubmit={handleSearch}>
              <input
                placeholder="Search styles, fabrics, pieces..."
                value={q}
                onChange={e => setQ(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="search-btn" aria-label="Submit search">
                <Search size={18} />
              </button>
            </form>
          </div>

          <button
            className="icon-btn search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle Search"
          >
            <Search size={20} />
          </button>

          <Link to="/wishlist" className="icon-btn wishlist-icon" aria-label="Wishlist">
            <Heart size={20} fill={wish.length > 0 ? '#b24358' : 'none'} color={wish.length > 0 ? '#b24358' : 'currentColor'} />
            {wish.length > 0 && <span className="badge-count">{wish.length}</span>}
          </Link>

          <Link to={user ? '/orders' : '/login'} className="icon-btn" aria-label="Account">
            <User size={20} />
          </Link>

          <Link to="/cart" className="icon-btn bag-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            {totalCartCount > 0 && <span className="badge-count">{totalCartCount}</span>}
          </Link>

          {user && (
            <button className="logout-link" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <Link to="/" className="logo-foot">LUXORA<small>BOUTIQUE</small></Link>
          <p className="foot-desc">
            Timeless apparel crafted from natural luxury fabrics. Minimalist silhouettes designed for effortless confidence.
          </p>
          <div className="newsletter-micro">
            <small>EXCLUSIVE PREVIEWS &amp; SEASONAL EDITS</small>
            <p className="subtle">Enjoy 10% off your premier order with code <strong>WELCOME10</strong>.</p>
          </div>
        </div>

        <div className="foot-col">
          <h4>Collection</h4>
          {NAV.map(([name, to]) => (
            <Link key={name} to={to}>{name}</Link>
          ))}
        </div>

        <div className="foot-col">
          <h4>Client Services</h4>
          <Link to="/orders">Order Tracking</Link>
          <Link to="/cart">Shopping Bag</Link>
          <Link to="/wishlist">Saved Pieces</Link>
          <a href={`mailto:${OWNER.email}`}>Concierge: {OWNER.email}</a>
        </div>

        <div className="foot-col owner">
          <h4>Atelier &amp; Development</h4>
          <p className="designer-name">{OWNER.name}</p>
          <p className="designer-role">{OWNER.role}</p>
          <p className="designer-edu">{OWNER.education}</p>
          <div className="foot-socials">
            <a href={OWNER.github} target="_blank" rel="noreferrer">GitHub</a>
            <span>·</span>
            <a href={OWNER.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            {OWNER.portfolio && OWNER.portfolio !== '#' && (
              <>
                <span>·</span>
                <a href={OWNER.portfolio} target="_blank" rel="noreferrer">Portfolio</a>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        <p className="copy">© {new Date().getFullYear()} LUXORA Boutique. All rights reserved. Curated fashion flat-lay photography.</p>
        <p className="currency-note">All prices displayed in Indian Rupees (₹) · Cash on Delivery available.</p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="app-container">
      <div className="announce">
        Complimentary Express Shipping on Orders Over ₹2,999 · Use Code <b>WELCOME10</b> for 10% Off
      </div>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth register />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
