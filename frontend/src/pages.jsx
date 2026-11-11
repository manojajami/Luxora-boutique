import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Check, ShieldCheck, RefreshCw, Truck, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import api from './api';
import { useStore } from './store';

export const inr = n => '₹' + Number(n || 0).toLocaleString('en-IN');

// Product Card
export function Card({ p }) {
  const { wish, load, notify } = useStore();
  const nav = useNavigate();
  const liked = wish.includes(p._id);

  const toggleWishlist = async e => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (liked) {
        await api.delete('/wishlist/' + p._id);
        notify(`Removed "${p.name}" from wishlist`);
      } else {
        await api.post('/wishlist', { productId: p._id });
        notify(`Saved "${p.name}" to wishlist`);
      }
      await load();
    } catch {
      notify('Could not update wishlist', 'error');
    }
  };

  const quickAdd = async e => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post('/cart', {
        productId: p._id,
        size: p.sizes[0] || 'M',
        color: p.colors[0] || '#d8c3a5',
        qty: 1
      });
      await load();
      notify(`Added "${p.name}" to bag`);
    } catch {
      notify('Could not add to bag', 'error');
    }
  };

  const discountPercent = p.discountPrice && p.discountPrice < p.price
    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
    : 0;

  return (
    <div className="product-card">
      <div className="card-media">
        <Link to={'/product/' + p._id} className="card-img-link">
          <img
            src={p.images?.[0] || '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'}
            alt={p.name}
            loading="lazy"
            onError={e => {
              e.currentTarget.src = '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg';
            }}
          />
        </Link>

        {/* Badges */}
        <div className="card-badges">
          {discountPercent > 0 && <span className="badge badge-sale">−{discountPercent}%</span>}
          {p.newArrival && <span className="badge badge-new">NEW</span>}
          {p.featured && !p.newArrival && discountPercent === 0 && (
            <span className="badge badge-edit">THE EDIT</span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          className={`card-heart ${liked ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={liked ? '#b24358' : 'none'} color={liked ? '#b24358' : '#1b1816'} />
        </button>

        {/* Quick Add Overlay */}
        <button className="card-quick-add" onClick={quickAdd}>
          <ShoppingBag size={15} /> Quick Add
        </button>
      </div>

      <div className="card-body">
        <div className="card-category-brand">
          <span className="card-brand">LUXORA</span>
          <span className="card-cat">{p.category}</span>
        </div>

        <h4 className="card-title">
          <Link to={'/product/' + p._id}>{p.name}</Link>
        </h4>

        <div className="card-price-row">
          <span className="card-price">{inr(p.discountPrice || p.price)}</span>
          {p.discountPrice > 0 && <s className="card-original-price">{inr(p.price)}</s>}
        </div>

        <div className="card-footer-meta">
          <div className="card-swatches">
            {p.colors.map(c => (
              <i key={c} className="swatch-dot" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
          <span className="card-sizes">{p.sizes.join(' · ')}</span>
        </div>
      </div>
    </div>
  );
}

const Grid = ({ items }) => (
  <div className="product-grid">
    {items.map(p => (
      <Card key={p._id} p={p} />
    ))}
  </div>
);

// Home Page
export function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useStore();

  useEffect(() => {
    api.get('/products?featured=1').then(r => {
      setItems((r.data || []).slice(0, 4));
      setLoading(false);
    });
  }, []);

  const handleSubscribe = e => {
    e.preventDefault();
    notify('Thank you for joining the LUXORA circle. Check your inbox for your 10% welcome token.');
    e.target.reset();
  };

  return (
    <div className="home-page">
      {/* Editorial Hero */}
      <section
        className="hero"
        style={{ backgroundImage: 'linear-gradient(90deg, rgba(20,18,16,0.85) 0%, rgba(20,18,16,0.45) 55%, rgba(20,18,16,0.15) 100%), url(/assets/hero/hero-fashion-banner.svg)' }}
      >
        <div className="hero-content">
          <span className="hero-tag">AUTUMN / WINTER 2026 CAPSULE</span>
          <h1 className="hero-title">
            DRESS YOUR<br /><em>MOMENT.</em>
          </h1>
          <p className="hero-desc">
            Sartorial silhouettes, natural European linen, and pure silk fabrics crafted for effortless modern sophistication.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop the Edit <ArrowRight size={16} />
            </Link>
            <Link to="/shop?category=Clothing" className="btn btn-outline-light">
              Explore Wardrobe
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Curated Edit */}
      <section className="section-container">
        <div className="section-header">
          <small className="sub-heading">THE EDIT</small>
          <h2 className="main-heading">CURATED. STYLISH. YOU.</h2>
          <p className="section-subtitle">A handpicked selection of our most coveted signature wardrobe staples.</p>
        </div>

        {loading ? (
          <div className="product-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <Grid items={items} />
        )}

        <div className="section-cta">
          <Link className="btn btn-outline" to="/shop">
            View All Pieces ({items.length ? '16 Styles' : 'Collection'}) <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Category Spotlight */}
      <section className="category-spotlight">
        <div className="section-container">
          <div className="section-header">
            <small className="sub-heading">EXPLORE CATEGORIES</small>
            <h2 className="main-heading">SHOP BY SILHOUETTE</h2>
          </div>
          <div className="categories-grid">
            {[
              { name: 'Tailored Clothing', cat: 'Clothing', desc: 'Blazers, crisp poplin shirts & pleated trousers' },
              { name: 'Fluid Dresses', cat: 'Dresses', desc: 'Satin wrap dresses & tiered summer silhouettes' },
              { name: 'Resort Sets', cat: 'Sets', desc: 'Matching linen co-ords & sartorial vest sets' },
              { name: 'Fine Accessories', cat: 'Accessories', desc: 'Calfskin handbags, silk twill scarves & 18k gold' }
            ].map(c => (
              <Link key={c.cat} to={`/shop?category=${c.cat}`} className="category-tile">
                <div className="cat-tile-overlay" />
                <div className="cat-tile-content">
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                  <span className="cat-link">Explore Category →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Mid-Page Editorial Promo Banner */}
      <section
        className="promo"
        style={{ backgroundImage: 'linear-gradient(rgba(20,18,16,0.7), rgba(20,18,16,0.8)), url(/assets/banners/collection-banner.svg)' }}
      >
        <div className="promo-content">
          <small className="promo-tag">TIMELESS ELEGANCE</small>
          <h2>YOUR STYLE.<br /><em>YOUR STORY.</em></h2>
          <p>Luxurious garments designed to move with you, elevating everyday rituals into moments of understated grace.</p>
          <Link to="/shop?sale=1" className="btn btn-gold">
            Discover Exclusive Pieces →
          </Link>
        </div>
      </section>

      {/* Boutique Commitments */}
      <section className="benefits-bar">
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon"><Truck size={24} /></div>
            <b>Complimentary Delivery</b>
            <span>Express courier on orders over ₹2,999</span>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><Sparkles size={24} /></div>
            <b>Artisanal Quality</b>
            <span>Pure mulberry silk, certified linen &amp; fine wool</span>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><RefreshCw size={24} /></div>
            <b>14-Day Seamless Returns</b>
            <span>Complimentary home collection on returns</span>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon"><ShieldCheck size={24} /></div>
            <b>Client Concierge</b>
            <span>Dedicated styling advice &amp; secure payment</span>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-box">
          <small className="sub-heading">THE PRIVATE CIRCLE</small>
          <h3>Join the LUXORA Society</h3>
          <p>Receive invitations to private seasonal sales, atelier previews, and complimentary styling consultations.</p>
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input type="email" required placeholder="Enter your email address" aria-label="Email" />
            <button className="btn btn-primary" type="submit">Join the Circle</button>
          </form>
        </div>
      </section>
    </div>
  );
}

// Shop Page
export function Shop() {
  const [sp, setSp] = useSearchParams();
  const [items, setItems] = useState(null);

  useEffect(() => {
    setItems(null);
    api.get('/products?' + sp.toString()).then(r => setItems(r.data || []));
  }, [sp]);

  const activeCategory = sp.get('category') || '';
  const activeSize = sp.get('size') || '';
  const activeMax = sp.get('max') || '';
  const activeSort = sp.get('sort') || '';
  const activeSale = sp.get('sale') === '1';
  const searchQuery = sp.get('q') || '';

  const setFilter = (key, val) => {
    const next = new URLSearchParams(sp);
    if (val) {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSp(next);
  };

  const clearAllFilters = () => {
    setSp(new URLSearchParams());
  };

  const hasActiveFilters = activeCategory || activeSize || activeMax || activeSort || activeSale || searchQuery;

  return (
    <div className="section-container shop-page">
      <div className="shop-header">
        <h2 className="shop-title">The Collection</h2>
        <p className="shop-subtitle">
          {searchQuery ? `Search results for "${searchQuery}"` : 'Discover our full boutique catalog of luxury flat-lay apparel'}
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="category-pills">
        <button
          className={`pill-btn ${!activeCategory && !activeSale ? 'active' : ''}`}
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.delete('category');
            next.delete('sale');
            setSp(next);
          }}
        >
          All Pieces
        </button>
        {['Clothing', 'Dresses', 'Sets', 'Accessories'].map(cat => (
          <button
            key={cat}
            className={`pill-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => {
              const next = new URLSearchParams(sp);
              next.set('category', cat);
              next.delete('sale');
              setSp(next);
            }}
          >
            {cat}
          </button>
        ))}
        <button
          className={`pill-btn sale-pill ${activeSale ? 'active' : ''}`}
          onClick={() => {
            const next = new URLSearchParams(sp);
            next.set('sale', '1');
            next.delete('category');
            setSp(next);
          }}
        >
          Sale Editions
        </button>
      </div>

      {/* Secondary Filter & Sort Toolbar */}
      <div className="shop-toolbar">
        <div className="toolbar-filters">
          <select value={activeSize} onChange={e => setFilter('size', e.target.value)}>
            <option value="">Filter by Size: All</option>
            {['XS', 'S', 'M', 'L', 'XL'].map(s => (
              <option key={s} value={s}>Size {s}</option>
            ))}
          </select>

          <select value={activeMax} onChange={e => setFilter('max', e.target.value)}>
            <option value="">Price Range: Any</option>
            <option value="1000">Under {inr(1000)}</option>
            <option value="2000">Under {inr(2000)}</option>
            <option value="3000">Under {inr(3000)}</option>
          </select>
        </div>

        <div className="toolbar-sort">
          <select value={activeSort} onChange={e => setFilter('sort', e.target.value)}>
            <option value="">Sort by: Curated</option>
            <option value="new">Newest Arrivals</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Filter Chips & Counter */}
      <div className="results-status-bar">
        <span className="results-counter">
          {items ? `Showing ${items.length} ${items.length === 1 ? 'piece' : 'pieces'}` : 'Loading wardrobe...'}
        </span>

        {hasActiveFilters && (
          <div className="active-chips">
            {activeCategory && <span className="filter-chip">Category: {activeCategory} <button onClick={() => setFilter('category', '')}>×</button></span>}
            {activeSize && <span className="filter-chip">Size: {activeSize} <button onClick={() => setFilter('size', '')}>×</button></span>}
            {activeMax && <span className="filter-chip">Under {inr(activeMax)} <button onClick={() => setFilter('max', '')}>×</button></span>}
            {activeSale && <span className="filter-chip">Sale Items <button onClick={() => setFilter('sale', '')}>×</button></span>}
            {searchQuery && <span className="filter-chip">"{searchQuery}" <button onClick={() => setFilter('q', '')}>×</button></span>}
            <button className="clear-all-btn" onClick={clearAllFilters}>Reset All</button>
          </div>
        )}
      </div>

      {/* Product Grid / Skeleton */}
      {!items ? (
        <div className="product-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <Grid items={items} />
      ) : (
        <div className="empty-shop-state">
          <h3>No styles match your selected filters.</h3>
          <p>Try resetting filters or exploring our curated categories.</p>
          <button className="btn btn-primary" onClick={clearAllFilters}>
            Show All Pieces
          </button>
        </div>
      )}
    </div>
  );
}

// Product Detail Page
export function ProductPage() {
  const { id } = useParams();
  const { wish, load, notify } = useStore();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState('fabric');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    api.get('/products/' + id).then(r => {
      const data = r.data;
      setP(data);
      setSize(data.sizes[0] || 'M');
      setColor(data.colors[0] || '#d8c3a5');
      setQty(1);
      setActiveImg(0);
    });
  }, [id]);

  if (!p) {
    return (
      <div className="section-container detail-loading">
        <div className="skeleton-card" style={{ height: 500 }} />
      </div>
    );
  }

  const liked = wish.includes(p._id);

  const toggleWishlist = async () => {
    try {
      if (liked) {
        await api.delete('/wishlist/' + p._id);
        notify(`Removed "${p.name}" from wishlist`);
      } else {
        await api.post('/wishlist', { productId: p._id });
        notify(`Saved "${p.name}" to wishlist`);
      }
      await load();
    } catch {
      notify('Could not update wishlist', 'error');
    }
  };

  const addToCart = async () => {
    try {
      await api.post('/cart', { productId: p._id, size, color, qty });
      await load();
      notify(`Added ${qty} × "${p.name}" (${size}) to bag`);
    } catch {
      notify('Could not add to bag', 'error');
    }
  };

  const discountPercent = p.discountPrice && p.discountPrice < p.price
    ? Math.round(((p.price - p.discountPrice) / p.price) * 100)
    : 0;

  return (
    <div className="section-container product-detail-page">
      {/* Breadcrumb */}
      <nav className="detail-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${p.category}`}>{p.category}</Link>
        <span>/</span>
        <span className="current">{p.name}</span>
      </nav>

      <div className="detail-layout">
        {/* Gallery Column */}
        <div className="detail-gallery">
          <div className="main-image-wrap">
            <img
              src={p.images?.[activeImg] || p.images?.[0] || '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'}
              alt={p.name}
              className="main-detail-img"
              onError={e => {
                e.currentTarget.src = '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg';
              }}
            />
            {discountPercent > 0 && <span className="detail-badge">−{discountPercent}% OFF</span>}
          </div>

          {p.images.length > 1 && (
            <div className="thumbnail-strip">
              {p.images.map((img, i) => (
                <button
                  key={i}
                  className={`thumb-btn ${i === activeImg ? 'active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`${p.name} view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="detail-info">
          <span className="detail-brand-badge">LUXORA ATELIER</span>
          <h1 className="detail-title">{p.name}</h1>

          <div className="detail-price-box">
            <span className="detail-current-price">{inr(p.discountPrice || p.price)}</span>
            {p.discountPrice > 0 && (
              <>
                <s className="detail-original-price">{inr(p.price)}</s>
                <span className="detail-save-pill">Save {inr(p.price - p.discountPrice)}</span>
              </>
            )}
          </div>

          <p className="detail-description">{p.description}</p>

          <div className="detail-sku-row">
            <span>SKU: <strong>{p.sku}</strong></span>
            <span>·</span>
            <span className={p.stock > 0 ? 'stock-ok' : 'stock-out'}>
              {p.stock > 0 ? `In Stock (${p.stock} Available)` : 'Currently Sold Out'}
            </span>
          </div>

          {/* Color Selector */}
          <div className="detail-option-group">
            <label className="option-label">
              Colour: <strong style={{ textTransform: 'capitalize' }}>Selected Palette</strong>
            </label>
            <div className="detail-swatches">
              {p.colors.map(c => (
                <button
                  key={c}
                  className={`detail-swatch-circle ${c === color ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="detail-option-group">
            <div className="size-label-row">
              <label className="option-label">Select Size:</label>
              <span className="size-guide-hint">True to size · Model wears Size S</span>
            </div>
            <div className="detail-size-chips">
              {p.sizes.map(s => (
                <button
                  key={s}
                  className={`size-chip-btn ${s === size ? 'selected' : ''}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="detail-option-group">
            <label className="option-label">Quantity:</label>
            <div className="qty-picker">
              <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock || 10, qty + 1))} aria-label="Increase quantity">+</button>
            </div>
          </div>

          {/* Action CTA Buttons */}
          <div className="detail-cta-row">
            <button className="btn btn-primary add-bag-btn" disabled={p.stock < 1} onClick={addToCart}>
              <ShoppingBag size={18} /> Add to Shopping Bag
            </button>
            <button
              className={`btn btn-outline wishlist-btn ${liked ? 'active' : ''}`}
              onClick={toggleWishlist}
              aria-label="Save to Wishlist"
            >
              <Heart size={20} fill={liked ? '#b24358' : 'none'} color={liked ? '#b24358' : 'currentColor'} />
            </button>
          </div>

          {/* Assurance perks */}
          <div className="detail-perks">
            <div><Check size={16} /> Complimentary Express Shipping over ₹2,999</div>
            <div><Check size={16} /> 14-day hassle-free returns &amp; exchanges</div>
            <div><Check size={16} /> 100% authentic fine garment craftsmanship</div>
          </div>

          {/* Accordion Tabs */}
          <div className="detail-accordions">
            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => setActiveTab(activeTab === 'fabric' ? '' : 'fabric')}
              >
                <span>Fabric &amp; Care Instructions</span>
                {activeTab === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeTab === 'fabric' && (
                <div className="accordion-content">
                  <p>Handcrafted using sustainably sourced textiles. Dry clean recommended or delicate cold cycle wash inside out. Warm iron under damp cloth.</p>
                </div>
              )}
            </div>

            <div className="accordion-item">
              <button
                className="accordion-header"
                onClick={() => setActiveTab(activeTab === 'shipping' ? '' : 'shipping')}
              >
                <span>Complimentary Delivery &amp; Returns</span>
                {activeTab === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeTab === 'shipping' && (
                <div className="accordion-content">
                  <p>Orders are dispatched within 24–48 hours from our Mumbai atelier. Delivered via priority air express within 2–4 business days across India.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cart Page
export function Cart() {
  const { cart, load, notify } = useStore();
  const subtotal = cart.reduce(
    (acc, c) => acc + (c.product?.discountPrice || c.product?.price || 1999) * c.qty,
    0
  );

  const updateQty = async (id, qty) => {
    try {
      await api.put('/cart/' + id, { qty });
      await load();
    } catch {
      notify('Could not update quantity', 'error');
    }
  };

  const removeItem = async id => {
    try {
      await api.delete('/cart/' + id);
      await load();
      notify('Item removed from shopping bag');
    } catch {
      notify('Could not remove item', 'error');
    }
  };

  const freeShippingThreshold = 2999;
  const distanceToFreeShipping = freeShippingThreshold - subtotal;

  return (
    <div className="section-container cart-page">
      <div className="cart-header">
        <h2>Your Shopping Bag</h2>
        <span className="cart-total-count">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span>
      </div>

      {!cart.length ? (
        <div className="empty-cart-state">
          <ShoppingBag size={48} strokeWidth={1.2} />
          <h3>Your shopping bag is currently empty</h3>
          <p>Explore our latest autumn/winter collection and discover timeless luxury pieces.</p>
          <Link to="/shop" className="btn btn-primary">
            Explore Collection →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-column">
            {/* Free Shipping Banner */}
            <div className="shipping-progress-box">
              {distanceToFreeShipping > 0 ? (
                <p>
                  Add <strong>{inr(distanceToFreeShipping)}</strong> more to unlock <strong>Complimentary Express Shipping</strong>!
                </p>
              ) : (
                <p className="free-shipping-unlocked">
                  <Check size={16} /> You have unlocked <strong>Complimentary Express Shipping</strong>!
                </p>
              )}
              <div className="progress-track">
                <div
                  className="progress-bar"
                  style={{ width: `${Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%` }}
                />
              </div>
            </div>

            {cart.map(c => {
              const p = c.product || {};
              const unitPrice = p.discountPrice || p.price || 1999;
              return (
                <div className="cart-row" key={c._id}>
                  <Link to={'/product/' + (p._id || '')} className="cart-item-thumb">
                    <img
                      src={p.images?.[0] || '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'}
                      alt={p.name}
                      onError={e => { e.currentTarget.src = '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'; }}
                    />
                  </Link>

                  <div className="cart-item-details">
                    <h4 className="cart-item-title">
                      <Link to={'/product/' + (p._id || '')}>{p.name}</Link>
                    </h4>
                    <p className="cart-item-specs">
                      Size: <strong>{c.size}</strong> · Colour: <i className="swatch-inline" style={{ backgroundColor: c.color }} />
                    </p>
                    <div className="cart-item-price-mobile">
                      {inr(unitPrice * c.qty)}
                    </div>
                  </div>

                  <div className="cart-item-qty">
                    <div className="qty-picker small">
                      <button onClick={() => updateQty(c._id, c.qty - 1)} disabled={c.qty <= 1}>−</button>
                      <span>{c.qty}</span>
                      <button onClick={() => updateQty(c._id, c.qty + 1)}>+</button>
                    </div>
                  </div>

                  <div className="cart-item-total">
                    <b>{inr(unitPrice * c.qty)}</b>
                    {p.discountPrice > 0 && <s>{inr(p.price * c.qty)}</s>}
                  </div>

                  <button className="cart-item-remove" onClick={() => removeItem(c._id)} aria-label="Remove item">
                    Remove
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-summary-column">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>{inr(subtotal)}</span>
              </div>
              <div className="summary-line">
                <span>Estimated Shipping</span>
                <span>{subtotal >= freeShippingThreshold ? 'Complimentary' : inr(99)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-line total-line">
                <b>Total Amount</b>
                <b>{inr(subtotal >= freeShippingThreshold ? subtotal : subtotal + 99)}</b>
              </div>
              <p className="summary-tax-note">Promotional coupons can be applied at checkout.</p>
              <Link to="/checkout" className="btn btn-primary checkout-btn">
                Proceed to Checkout <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="continue-link">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Checkout Page
export function Checkout() {
  const { cart, load, notify } = useStore();
  const nav = useNavigate();
  const [a, setA] = useState({ name: '', phone: '', line: '', city: '', pincode: '' });
  const [code, setCode] = useState('WELCOME10');
  const [pct, setPct] = useState(10); // preset 10% for smooth demo

  const sub = cart.reduce((s, c) => s + (c.product?.discountPrice || c.product?.price || 1999) * c.qty, 0);
  const disc = Math.round((sub * pct) / 100);
  const ship = sub - disc >= 2999 ? 0 : 99;

  const applyCoupon = async () => {
    try {
      const res = await api.post('/coupons/validate', { code: code.trim() });
      setPct(res.data.percent);
      notify(`Coupon "${code.toUpperCase()}" applied! ${res.data.percent}% discount.`);
    } catch {
      setPct(0);
      notify('Invalid coupon code. Try WELCOME10', 'error');
    }
  };

  const placeOrder = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/orders', {
        address: a,
        couponCode: pct ? code : undefined,
        total: sub - disc + ship
      });
      await load();
      notify(`Order placed successfully! ID: #${res.data._id.slice(-6).toUpperCase()}`);
      nav('/orders');
    } catch {
      notify('Could not place order. Please review your address.', 'error');
    }
  };

  const on = k => e => setA({ ...a, [k]: e.target.value });

  if (!cart.length) {
    return (
      <div className="section-container empty-cart-state">
        <h3>Your shopping bag is empty</h3>
        <p>Please add products to your bag before checking out.</p>
        <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="section-container checkout-page">
      <h2>Complete Your Order</h2>
      <div className="checkout-layout">
        {/* Shipping Form */}
        <div className="checkout-form-column">
          <form className="luxury-form" onSubmit={placeOrder}>
            <h3>1. Shipping Address</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input required placeholder="e.g. Eleanor Vance" value={a.name} onChange={on('name')} />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Phone Number (10 digits) *</label>
                <input required pattern="\d{10}" placeholder="9876543210" value={a.phone} onChange={on('phone')} />
              </div>
              <div className="form-group">
                <label>PIN Code (6 digits) *</label>
                <input required pattern="\d{6}" placeholder="400001" value={a.pincode} onChange={on('pincode')} />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address / Apartment *</label>
              <input required placeholder="Penthouse 4B, Heritage Avenue" value={a.line} onChange={on('line')} />
            </div>

            <div className="form-group">
              <label>City &amp; State *</label>
              <input required placeholder="Mumbai, Maharashtra" value={a.city} onChange={on('city')} />
            </div>

            <h3 style={{ marginTop: 24 }}>2. Payment Selection</h3>
            <div className="cod-banner">
              <Check size={18} />
              <div>
                <b>Cash on Delivery / Pay on Arrival</b>
                <p>Pay conveniently upon parcel delivery at your doorstep.</p>
              </div>
            </div>

            <button className="btn btn-primary place-order-btn" type="submit">
              Confirm &amp; Place Order ({inr(sub - disc + ship)})
            </button>
          </form>
        </div>

        {/* Order Summary & Coupon Column */}
        <div className="checkout-summary-column">
          <div className="summary-card">
            <h3>Items in Order ({cart.length})</h3>
            <div className="checkout-item-preview">
              {cart.map(c => {
                const p = c.product || {};
                return (
                  <div key={c._id} className="checkout-mini-row">
                    <img src={p.images?.[0] || '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'} alt={p.name} />
                    <div>
                      <b>{p.name}</b>
                      <span>Qty: {c.qty} · Size: {c.size}</span>
                    </div>
                    <span>{inr((p.discountPrice || p.price || 1999) * c.qty)}</span>
                  </div>
                );
              })}
            </div>

            <div className="coupon-box">
              <label>Promotion Code</label>
              <div className="coupon-input-row">
                <input
                  placeholder="Code (e.g. WELCOME10)"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
                <button type="button" className="btn btn-outline small-btn" onClick={applyCoupon}>
                  Apply
                </button>
              </div>
              <small className="coupon-tip">Tip: Enter WELCOME10 for 10% off your premier order.</small>
            </div>

            <div className="summary-divider" />

            <div className="summary-line">
              <span>Subtotal</span>
              <span>{inr(sub)}</span>
            </div>
            {disc > 0 && (
              <div className="summary-line discount-line">
                <span>Promotional Discount ({pct}%)</span>
                <span>−{inr(disc)}</span>
              </div>
            )}
            <div className="summary-line">
              <span>Express Delivery</span>
              <span>{ship === 0 ? 'Complimentary' : inr(ship)}</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-line total-line">
              <b>Total Payable</b>
              <b>{inr(sub - disc + ship)}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Orders Page
export function Orders() {
  const [orders, setOrders] = useState([]);
  const { notify } = useStore();

  const getOrders = () => {
    api.get('/orders/my-orders').then(r => setOrders(r.data || []));
  };

  useEffect(() => {
    getOrders();
  }, []);

  const cancel = async id => {
    try {
      await api.put(`/orders/${id}/cancel`);
      notify('Order cancelled');
      getOrders();
    } catch {
      notify('Could not cancel order', 'error');
    }
  };

  return (
    <div className="section-container orders-page">
      <h2>My Order History</h2>
      {!orders.length ? (
        <div className="empty-shop-state">
          <h3>You have no placed orders yet.</h3>
          <p>Once you acquire a piece from the boutique, your parcel tracking will appear here.</p>
          <Link to="/shop" className="btn btn-primary">Discover the Edit</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(o => (
            <div className="order-card" key={o._id}>
              <div className="order-header">
                <div>
                  <span className="order-ref">#{o._id.slice(-8).toUpperCase()}</span>
                  <span className="order-date">
                    Placed on {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="order-meta-right">
                  <span className={`status-pill status-${(o.status || 'Confirmed').toLowerCase()}`}>
                    {o.status}
                  </span>
                  <b>{inr(o.total)}</b>
                </div>
              </div>

              <div className="order-items-summary">
                {o.items?.map((item, idx) => (
                  <span key={idx} className="order-item-tag">
                    {item.name} ×{item.qty}
                  </span>
                ))}
              </div>

              {['Pending', 'Confirmed'].includes(o.status) && (
                <div className="order-actions">
                  <button className="link-btn-danger" onClick={() => cancel(o._id)}>
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Wishlist Page
export function Wishlist() {
  const [items, setItems] = useState([]);
  const { wish } = useStore();

  useEffect(() => {
    api.get('/wishlist').then(r => setItems(r.data || []));
  }, [wish]);

  return (
    <div className="section-container wishlist-page">
      <h2>Saved Wardrobe ({items.length})</h2>
      <p className="section-subtitle">Your personal curated wishlist of timeless pieces.</p>
      {items.length > 0 ? (
        <Grid items={items} />
      ) : (
        <div className="empty-shop-state">
          <Heart size={44} color="#b24358" strokeWidth={1.2} />
          <h3>Your wishlist is empty</h3>
          <p>Click the heart icon on any piece to save it for later review.</p>
          <Link to="/shop" className="btn btn-primary">Explore Collection</Link>
        </div>
      )}
    </div>
  );
}

// Auth Page
export function Auth({ register }) {
  const { load, notify } = useStore();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' });

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post(register ? '/auth/register' : '/auth/login', f);
      await load();
      notify(register ? 'Welcome to LUXORA! Account created.' : 'Welcome back!');
      nav('/');
    } catch {
      notify('Authentication failed. Please check credentials.', 'error');
    }
  };

  const on = k => e => setF({ ...f, [k]: e.target.value });

  return (
    <div className="section-container auth-page">
      <div className="auth-box">
        <h2>{register ? 'Create Your Account' : 'Welcome to LUXORA'}</h2>
        <p className="auth-sub">
          {register
            ? 'Join our private boutique circle for bespoke privileges and effortless shopping.'
            : 'Sign in to access your orders, saved pieces, and client profile.'}
        </p>

        <form className="luxury-form" onSubmit={submit}>
          {register && (
            <div className="form-group">
              <label>Full Name</label>
              <input required placeholder="Eleanor Vance" value={f.name} onChange={on('name')} />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input required type="email" placeholder="client@luxora.local" value={f.email} onChange={on('email')} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input required type="password" minLength={6} placeholder="Min. 6 characters" value={f.password} onChange={on('password')} />
          </div>
          <button className="btn btn-primary auth-submit-btn" type="submit">
            {register ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-toggle">
          {register ? (
            <p>Already have a client account? <Link to="/login">Sign in here</Link></p>
          ) : (
            <p>New to LUXORA? <Link to="/register">Create an account</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin Page
export function Admin() {
  const { user } = useStore();
  const [d, setD] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const get = () => {
    api.get('/admin/dashboard').then(r => setD(r.data));
    api.get('/admin/orders').then(r => setOrders(r.data || []));
    api.get('/products').then(r => setProducts(r.data || []));
  };

  useEffect(() => {
    get();
  }, []);

  return (
    <div className="section-container admin-page">
      <h2>Atelier Admin Dashboard</h2>
      {d && (
        <div className="admin-stats-grid">
          <div className="stat-card">
            <small>Total Revenue</small>
            <b>{inr(d.revenue)}</b>
          </div>
          <div className="stat-card">
            <small>Active Orders</small>
            <b>{d.orders}</b>
          </div>
          <div className="stat-card">
            <small>Registered Clients</small>
            <b>{d.users}</b>
          </div>
          <div className="stat-card">
            <small>Catalogue Styles</small>
            <b>{d.products}</b>
          </div>
        </div>
      )}

      <h3>Recent Orders</h3>
      <div className="admin-orders-table">
        {orders.map(o => (
          <div className="admin-order-row" key={o._id}>
            <span>#{o._id.slice(-6).toUpperCase()}</span>
            <span>{o.user?.name || 'Valued Client'}</span>
            <span>{inr(o.total)}</span>
            <span className="status-pill status-confirmed">{o.status || 'Confirmed'}</span>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 32 }}>Inventory Pieces ({products.length})</h3>
      <div className="admin-products-list">
        {products.map(p => (
          <div className="admin-prod-row" key={p._id}>
            <img src={p.images?.[0] || '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'} alt="" onError={e => { e.currentTarget.src = '/assets/products/shirts/lisanto-ve2dwNxZ5Rg-unsplash.jpg'; }} />
            <div className="admin-prod-info">
              <b>{p.name}</b>
              <small>{p.category} · {inr(p.price)} · Stock: {p.stock}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
