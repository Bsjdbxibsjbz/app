import React, { useEffect, useMemo, useState } from 'react';
import { categories, products } from './data/products.js';

const CART_KEY = 'cf3_cart';
const WHATSAPP_NUMBER = '919999999999';

function money(value) {
  return `₹${value.toLocaleString('en-IN')}`;
}

function Icon({ children, size = 16, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      {children}
    </svg>
  );
}

function CheckIcon({ size = 14 }) {
  return (
    <Icon size={size}>
      <polyline points="20 6 9 17 4 12" />
    </Icon>
  );
}

function CartIcon({ size = 18 }) {
  return (
    <Icon size={size}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </Icon>
  );
}

function CloseIcon({ size = 15 }) {
  return (
    <Icon size={size}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </Icon>
  );
}

function SpiceIndicator({ level, size = 'normal' }) {
  if (!level) return null;
  const map = {
    mild: { count: 1, label: 'Mild' },
    medium: { count: 2, label: 'Medium' },
    hot: { count: 3, label: 'Hot' }
  };
  const { count, label } = map[level] || map.mild;

  return (
    <div className={`spice-indicator spice-${size}`}>
      <div className="chillies">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`chilli ${i < count ? 'on' : 'off'}`}>🌶️</span>
        ))}
      </div>
      <span className="spice-label">{label}</span>
    </div>
  );
}

function Toasts({ toasts }) {
  const icons = {
    success: <CheckIcon />,
    error: <CloseIcon />,
    info: (
      <Icon size={14}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </Icon>
    )
  };

  return (
    <div id="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type} show`}>
          <span className="toast-icon">{icons[toast.type] || icons.success}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}

function ProductCard({ item, onAdd, onOpen, added }) {
  const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(item);
    }
  }

  return (
    <article
      className="product-card"
      tabIndex="0"
      role="button"
      aria-label={`View ${item.name} details`}
      onClick={() => onOpen(item)}
      onKeyDown={handleKeyDown}
    >
      <div className="product-card-img-wrap">
        <img src={item.image} alt={item.name} loading="lazy" className="product-card-img" />
        <div className="product-card-img-overlay" />
        {item.badge && <span className={`product-badge badge-${item.badge.toLowerCase().replace(' ', '-')}`}>{item.badge}</span>}
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {item.category === 'Ready to Cook' && item.spiceLevel && (
          <div className="card-spice-tag">
            <SpiceIndicator level={item.spiceLevel} />
          </div>
        )}
      </div>

      <div className="product-card-body">
        <span className="product-category-tag">{item.category}</span>
        <h3 className="product-name">{item.name}</h3>
        <p className="product-desc-short">{item.description.split(' - ')[0].trim()}</p>
        <div className="product-meta-row">
          <span className="product-weight-tag">
            <Icon size={11}><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></Icon>
            {item.weight}
          </span>
          <span className="product-serves-tag">Serves {item.serves}</span>
        </div>
        <div className="product-footer">
          <div className="product-pricing">
            <span className="product-price">{money(item.price)}</span>
            {item.originalPrice && <span className="product-orig">{money(item.originalPrice)}</span>}
          </div>
          <button
            className={`btn-add-cart ${added ? 'added' : ''}`}
            aria-label={`Add ${item.name} to cart`}
            disabled={added}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(item.id);
            }}
          >
            {added ? <CheckIcon size={13} /> : <Icon size={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon>}
            {added ? 'Added!' : 'Add'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductGrid({ items, onAdd, onOpen, addedId }) {
  return (
    <div className="products-grid">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} onAdd={onAdd} onOpen={onOpen} added={addedId === item.id} />
      ))}
    </div>
  );
}

function Navbar({ cartCount, route, navigate, onOpenCart, onToast, onOpenProduct }) {
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaCat, setMegaCat] = useState(categories[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function go(page, opts) {
    setMegaOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    navigate(page, opts);
  }

  function submitSearch(event) {
    if (event.key === 'Enter' && query.trim()) {
      navigate('menu', { search: query.trim() });
      setSearchOpen(false);
    }
    if (event.key === 'Escape') setSearchOpen(false);
  }

  return (
    <header id="navbar" role="banner" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-top-bar">
        <div className="container nav-top-inner">
          <span>Free delivery on orders above ₹499</span>
          <span>+91 99999 99999</span>
        </div>
      </div>
      <div className="nav-main">
        <div className="container nav-inner">
          <button className="nav-logo" onClick={() => go('home')} aria-label="ChopperzFresh Home">
            Chopperz<span>Fresh</span>
          </button>
          <button className="nav-location" aria-label="Select location">
            <Icon size={14}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Icon>
            Bengaluru
            <Icon size={12}><polyline points="6 9 12 15 18 9" /></Icon>
          </button>

          <div className="search-wrap">
            <div className="search-box">
              <Icon size={15}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon>
              <input
                id="search-input"
                type="search"
                placeholder="Search chicken, kababs..."
                autoComplete="off"
                aria-label="Search products"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSearchOpen(Boolean(event.target.value.trim()));
                }}
                onFocus={() => setSearchOpen(Boolean(query.trim()))}
                onKeyDown={submitSearch}
              />
            </div>
            <div className={`search-results ${searchOpen ? 'open' : ''}`} id="search-results" role="listbox">
              {query.trim() && results.length === 0 && <div className="search-no-result">No products found for &quot;{query}&quot;</div>}
              {results.map((item) => (
                <button
                  key={item.id}
                  className="search-result-item"
                  onClick={() => {
                    setSearchOpen(false);
                    onOpenProduct(item);
                  }}
                >
                  <img src={item.image} alt={item.name} />
                  <div className="sri-text">
                    <div className="sri-name">{item.name}</div>
                    <div className="sri-meta">{item.category} · {money(item.price)} · {item.weight}</div>
                  </div>
                  {item.category === 'Ready to Cook' && <div className="sri-spice">{'🌶️'.repeat(item.spiceLevel === 'mild' ? 1 : item.spiceLevel === 'medium' ? 2 : 3)}</div>}
                </button>
              ))}
            </div>
          </div>

          <nav className="nav-links" aria-label="Main navigation">
            <div className="nav-cat-wrap">
              <button className="nav-link" id="cat-toggle" aria-expanded={megaOpen} aria-haspopup="true" onClick={() => setMegaOpen((open) => !open)}>
                Categories
                <Icon size={12}><polyline points="6 9 12 15 18 9" /></Icon>
              </button>
              <div className={`mega-menu ${megaOpen ? 'open' : ''}`} id="mega-menu" role="dialog" aria-label="Categories menu">
                <div className="mega-menu-inner">
                  <div className="mega-left">
                    <div className="mega-section-title">Browse</div>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        className={`mega-cat-btn ${megaCat === category.id ? 'active' : ''}`}
                        onMouseEnter={() => setMegaCat(category.id)}
                        onFocus={() => setMegaCat(category.id)}
                      >
                        <span className="mega-cat-icon">{category.icon}</span>
                        <span>{category.name}</span>
                        <Icon size={14}><polyline points="9 18 15 12 9 6" /></Icon>
                      </button>
                    ))}
                  </div>
                  <div className="mega-right">
                    {categories.map((category) => (
                      <div key={category.id} className={`mega-sub-panel ${megaCat === category.id ? 'active' : ''}`}>
                        <div className="mega-sub-title">{category.icon} {category.name}</div>
                        <div className="mega-sub-grid">
                          {category.subcategories.map((sub) => (
                            <button key={sub} className="mega-sub-btn" onClick={() => go('menu', { filterSub: sub })}>{sub}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <button className={`nav-link ${route.page === 'home' ? 'active' : ''}`} onClick={() => go('home')}>Home</button>
            <button className={`nav-link ${route.page === 'menu' ? 'active' : ''}`} onClick={() => go('menu')}>Shop</button>
          </nav>

          <div className="nav-actions">
            <button className="nav-action-btn login-btn" onClick={() => onToast('Login coming soon!', 'info')} aria-label="Login">
              <Icon size={18}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon>
              <span>Login</span>
            </button>
            <button className="nav-action-btn cart-btn" id="cart-toggle" aria-label="Open cart" onClick={onOpenCart}>
              <CartIcon />
              <span className="cart-badge" style={{ display: cartCount > 0 ? 'flex' : 'none' }}>{cartCount}</span>
            </button>
          </div>
          <button className={`hamburger ${mobileOpen ? 'open' : ''}`} aria-label="Toggle menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`} id="mobile-nav" role="dialog" aria-label="Mobile navigation">
        <div className="mobile-nav-links">
          <button className="mobile-nav-link" onClick={() => go('home')}>Home</button>
          <button className="mobile-nav-link" onClick={() => go('menu')}>All Products</button>
          <button className="mobile-nav-link" onClick={() => go('menu', { filterCat: 'Chicken' })}>Chicken</button>
          <button className="mobile-nav-link" onClick={() => go('menu', { filterCat: 'Ready to Cook' })}>Ready to Cook</button>
          <div className="mobile-nav-divider" />
          <button className="mobile-nav-link" onClick={() => onToast('Login coming soon!', 'info')}>Login</button>
          <button className="mobile-nav-link" onClick={onOpenCart}>Cart <span className="cart-count-text">{cartCount > 0 ? `(${cartCount})` : ''}</span></button>
        </div>
      </div>
    </header>
  );
}

function Hero({ navigate }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-bg-shape" />
      <div className="container hero-content">
        <div className="hero-text">
          <div className="hero-eyebrow"><span className="eyebrow-pulse" />Delivering Fresh Daily · Bengaluru</div>
          <h1 className="hero-title">Farm-Fresh Meat<br /><em>Delivered to Your</em><br />Doorstep</h1>
          <p className="hero-sub">Hygienic · Vacuum Packed · Ready to Cook</p>
          <div className="hero-pills">
            <span className="hero-pill">No Preservatives</span>
            <span className="hero-pill">Cold Chain Delivery</span>
            <span className="hero-pill">FSSAI Certified</span>
          </div>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => navigate('menu')}>Shop Now <Icon><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon></button>
            <button className="btn-hero-secondary" onClick={() => navigate('menu', { filterCat: 'Ready to Cook' })}>Ready to Cook</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-img-wrap">
            <img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=85" alt="Fresh premium chicken" className="hero-img" />
            <div className="hero-img-glow" />
            <div className="hero-float-card card-1"><span className="float-icon">45</span><div><strong>45 Min</strong><br /><small>Delivery</small></div></div>
            <div className="hero-float-card card-2"><span className="float-icon">0°</span><div><strong>0-4°C</strong><br /><small>Cold Chain</small></div></div>
            <div className="hero-rating"><div className="stars">★★★★★</div><span>4.8 · 12,000+ orders</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategorySection({ navigate }) {
  return (
    <section className="section categories-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-sub">Farm-fresh, hygienically processed, delivered cold</p>
        </div>
        <div className="category-cards">
          {categories.map((category) => (
            <button key={category.id} className="category-card" onClick={() => navigate('menu', { filterCat: category.name })}>
              <div className="category-card-img-wrap">
                <img src={category.image} alt={category.name} loading="lazy" />
                <div className="category-card-overlay" />
              </div>
              <div className="category-card-body">
                <span className="category-card-icon">{category.icon}</span>
                <h3>{category.name}</h3>
                <span className="category-card-count">{category.subcategories.length} variants</span>
                <span className="category-card-cta">Explore →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductsSection({ title, subtitle, items, onAdd, onOpen, addedId }) {
  return (
    <section className="section products-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-sub">{subtitle}</p>}
        </div>
        <ProductGrid items={items} onAdd={onAdd} onOpen={onOpen} addedId={addedId} />
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const perks = [
    ['Fresh & Hygienic', 'Sourced from certified farms and processed in hygienic facilities.'],
    ['Zero Preservatives', 'No additives - just clean, natural meat.'],
    ['Vacuum Packed', 'Sealed for freshness with tamper-proof packaging.'],
    ['45-Min Delivery', 'Delivered cold from farm to your door.']
  ];

  return (
    <section className="section why-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-sub">Freshness, hygiene, and convenience in every order</p>
        </div>
        <div className="why-grid">
          {perks.map(([title, desc]) => (
            <div className="why-card" key={title}>
              <div className="why-icon"><CheckIcon /></div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">Chopperz<span>Fresh</span></div>
            <p>Premium raw meat and ready-to-cook favourites delivered fresh across Bengaluru.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => navigate('home')}>Home</button></li>
              <li><button onClick={() => navigate('menu')}>All Products</button></li>
              <li><button onClick={() => navigate('menu', { filterCat: 'Chicken' })}>Chicken</button></li>
              <li><button onClick={() => navigate('menu', { filterCat: 'Ready to Cook' })}>Ready to Cook</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Delivery Info</h4>
            <ul>
              <li>Monday - Sunday</li>
              <li>7:00 AM - 10:00 PM</li>
              <li>Same-day delivery</li>
              <li>Free above ₹499</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <address>
              <p>123 Food Park, Koramangala<br />Bengaluru, Karnataka 560034</p>
              <p><a href="tel:+919999999999">+91 99999 99999</a></p>
              <p><a href="mailto:hello@chopperzfresh.com">hello@chopperzfresh.com</a></p>
            </address>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 ChopperzFresh. All rights reserved.</p>
          <div className="footer-badges"><span>FSSAI Licensed</span><span>ISO 22000</span><span>100% Halal</span></div>
        </div>
      </div>
    </footer>
  );
}

function HomePage(props) {
  return (
    <>
      <Hero navigate={props.navigate} />
      <CategorySection navigate={props.navigate} />
      <ProductsSection title="Our Products" subtitle="Handpicked favourites - fresh, marinated, and ready" items={products} {...props} />
      <WhyChooseUs />
      <Footer navigate={props.navigate} />
    </>
  );
}

function MenuPage({ route, navigate, onAdd, onOpen, addedId }) {
  const filtered = useMemo(() => {
    let next = products;
    if (route.filterCat) next = next.filter((p) => p.category === route.filterCat);
    if (route.filterSub) next = next.filter((p) => p.subcategory === route.filterSub);
    if (route.search) {
      const q = route.search.toLowerCase();
      next = next.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q));
    }
    return next;
  }, [route]);
  const title = route.search ? `Search: ${route.search}` : route.filterSub || route.filterCat || 'All Products';

  return (
    <>
      <section className="menu-page-hero">
        <div className="container">
          <nav className="menu-breadcrumb" aria-label="Breadcrumb">
            <button onClick={() => navigate('home')}>Home</button>
            <span aria-hidden="true">›</span>
            <span>{title}</span>
          </nav>
          <h1>{title}</h1>
          <p>{filtered.length} product{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
      </section>
      <section className="section">
        <div className="container menu-layout">
          <aside className="menu-sidebar" aria-label="Product filters">
            <div className="sidebar-section">
              <div className="sidebar-title">Categories</div>
              <button className={`sidebar-cat-btn ${!route.filterCat && !route.filterSub && !route.search ? 'active' : ''}`} onClick={() => navigate('menu')}>All Products</button>
              {categories.map((category) => (
                <div key={category.id}>
                  <button className={`sidebar-cat-btn ${route.filterCat === category.name && !route.filterSub ? 'active' : ''}`} onClick={() => navigate('menu', { filterCat: category.name })}>
                    {category.icon} {category.name}
                  </button>
                  <div className="sidebar-sub-group">
                    {category.subcategories.map((sub) => (
                      <button key={sub} className={`sidebar-sub-btn ${route.filterSub === sub ? 'active' : ''}`} onClick={() => navigate('menu', { filterSub: sub })}>{sub}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
          <div className="menu-products">
            {filtered.length === 0 ? (
              <div className="no-results">
                <div className="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try a different category or search term</p>
                <button className="btn-outline" onClick={() => navigate('menu')}>View All Products</button>
              </div>
            ) : (
              <ProductGrid items={filtered} onAdd={onAdd} onOpen={onOpen} addedId={addedId} />
            )}
          </div>
        </div>
      </section>
      <Footer navigate={navigate} />
    </>
  );
}

function CartDrawer({ open, items, onClose, onQty, onRemove, onCheckout, onWhatsApp }) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const count = items.reduce((sum, item) => sum + item.qty, 0);
  const freeDeliveryThreshold = 499;
  const free = subtotal >= freeDeliveryThreshold;
  const progressPct = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);

  return (
    <>
      <div id="cart-overlay" className={open ? 'open' : ''} aria-hidden="true" onClick={onClose} />
      <aside id="cart-panel" className={open ? 'open' : ''} role="dialog" aria-label="Shopping cart" aria-modal="true">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" id="cart-close-btn" aria-label="Close cart" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon"><CartIcon size={48} /></div>
              <p>Your cart is empty</p>
              <span>Add fresh products to get started</span>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-img"><img src={item.image} alt={item.name} loading="lazy" /></div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-weight">{item.weight}</div>
                  <div className="cart-item-price">{money(item.price * item.qty)}</div>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => onQty(item.id, -1)} aria-label="Decrease quantity">-</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => onQty(item.id, 1)} aria-label="Increase quantity">+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`}><CloseIcon size={13} /></button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          {items.length > 0 && (
            <>
              <div className="cart-free-delivery">
                <div className="cart-delivery-info">
                  {free ? <span className="delivery-free"><CheckIcon size={12} /> Free delivery unlocked!</span> : <span>Add <strong>{money(freeDeliveryThreshold - subtotal)}</strong> more for free delivery</span>}
                </div>
                <div className="cart-progress-bar"><div className="cart-progress-fill" style={{ width: `${progressPct}%` }} /></div>
              </div>
              <div className="cart-total-row"><span>Subtotal</span><span className="cart-total-amt">{money(subtotal)}</span></div>
              <div className="cart-delivery-row"><span>Delivery</span><span>{free ? <><s style={{ opacity: 0.4 }}>₹40</s> <span className="tag-free">FREE</span></> : '₹40'}</span></div>
              <div className="cart-divider" />
              <div className="cart-grand-row"><span>Total</span><span>{money(subtotal + (free ? 0 : 40))}</span></div>
              <button className="btn-checkout" onClick={onCheckout}>Proceed to Checkout <Icon><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon></button>
              <button className="btn-whatsapp" onClick={onWhatsApp}>Order via WhatsApp</button>
              <span className="cart-count-text" hidden>{count}</span>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function ProductModal({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(product?.weightOptions?.[0] || product?.weight);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('modal-open', Boolean(product));
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
  }, [product, onClose]);

  if (!product) return null;

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const weightOptions = product.weightOptions || [product.weight];

  function addFromModal() {
    onAdd(product.id, qty);
    setAdded(true);
    window.setTimeout(onClose, 900);
  }

  return (
    <div className="pdp-overlay open" id="pdp-modal" role="dialog" aria-modal="true" aria-label={product.name} onMouseDown={(event) => event.target.id === 'pdp-modal' && onClose()}>
      <div className="pdp-modal" role="document">
        <button className="pdp-close" aria-label="Close product details" onClick={onClose}><CloseIcon size={18} /></button>
        <div className="pdp-layout">
          <div className="pdp-image-col">
            <div className="pdp-img-wrap">
              <img src={product.image} alt={product.name} className="pdp-main-img" loading="eager" />
              {product.badge && <span className={`pdp-badge badge-${product.badge.toLowerCase().replace(' ', '-')}`}>{product.badge}</span>}
              {discount > 0 && <span className="pdp-discount-badge">-{discount}% OFF</span>}
            </div>
            <div className="pdp-trust-row">
              <div className="trust-chip">Hygienic</div>
              <div className="trust-chip">Farm Fresh</div>
              <div className="trust-chip">Fast Delivery</div>
            </div>
          </div>
          <div className="pdp-info-col">
            <div className="pdp-category-tag">{product.category}</div>
            <h2 className="pdp-title">{product.name}</h2>
            <p className="pdp-tagline">{product.tagline}</p>
            <div className="pdp-price-row">
              <span className="pdp-price">{money(product.price)}</span>
              {product.originalPrice && <span className="pdp-orig">{money(product.originalPrice)}</span>}
              {discount > 0 && <span className="pdp-save-tag">Save {money(product.originalPrice - product.price)}</span>}
            </div>
            {product.category === 'Ready to Cook' && (
              <div className="pdp-spice-row">
                <span className="pdp-info-label">Spice Level</span>
                <SpiceIndicator level={product.spiceLevel} size="large" />
              </div>
            )}
            <div className="pdp-specs-grid">
              <div className="pdp-spec"><div className="spec-icon">⚖</div><div className="spec-info"><span className="spec-label">Weight</span><span className="spec-val">{selectedWeight}</span></div></div>
              <div className="pdp-spec"><div className="spec-icon">👥</div><div className="spec-info"><span className="spec-label">Serves</span><span className="spec-val">{product.serves} people</span></div></div>
              <div className="pdp-spec"><div className="spec-icon">🔥</div><div className="spec-info"><span className="spec-label">Calories</span><span className="spec-val">{product.calories}</span></div></div>
              <div className="pdp-spec"><div className="spec-icon">❄</div><div className="spec-info"><span className="spec-label">Storage</span><span className="spec-val">0-4°C</span></div></div>
            </div>
            <p className="pdp-description">{product.description}</p>
            <div className="pdp-highlights">
              {product.highlights.map((highlight) => (
                <div className="pdp-highlight" key={highlight}><CheckIcon />{highlight}</div>
              ))}
            </div>
            {weightOptions.length > 1 && (
              <div className="pdp-weight-selector">
                <span className="pdp-info-label">Select Weight</span>
                <div className="weight-opts">
                  {weightOptions.map((weight) => (
                    <button key={weight} className={`weight-opt ${selectedWeight === weight ? 'active' : ''}`} onClick={() => setSelectedWeight(weight)}>{weight}</button>
                  ))}
                </div>
              </div>
            )}
            <div className="pdp-add-row">
              <div className="pdp-qty-wrap">
                <button className="pdp-qty-btn" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">-</button>
                <span className="pdp-qty-num">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty((value) => value + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button className={`btn-pdp-add ${added ? 'added' : ''}`} onClick={addFromModal}>
                {added ? <CheckIcon size={15} /> : <CartIcon size={16} />}
                {added ? 'Added to Cart!' : <>Add to Cart · {money(product.price * qty)}</>}
              </button>
            </div>
            {product.storage && <div className="pdp-storage">{product.storage}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState(() => ({ page: window.location.hash.replace('#', '') || 'home', filterCat: null, filterSub: null, search: '' }));
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [addedId, setAddedId] = useState(null);
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const onPop = () => setRoute({ page: window.location.hash.replace('#', '') || 'home', filterCat: null, filterSub: null, search: '' });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  function toast(message, type = 'success') {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 2800);
  }

  function navigate(page, opts = {}) {
    const next = {
      page,
      filterCat: opts.filterCat || null,
      filterSub: opts.filterSub || null,
      search: opts.search || ''
    };
    setRoute(next);
    window.history.pushState(next, '', page === 'home' ? '/' : `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addToCart(productId, qty = 1) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setCartItems((current) => {
      const existing = current.find((item) => item.id === productId);
      if (existing) return current.map((item) => item.id === productId ? { ...item, qty: item.qty + qty } : item);
      return [...current, { ...product, qty }];
    });
    setAddedId(productId);
    window.setTimeout(() => setAddedId(null), 1600);
    toast(`${product.name} added to cart!`, 'success');
  }

  function updateQty(productId, delta) {
    setCartItems((current) => current
      .map((item) => item.id === productId ? { ...item, qty: item.qty + delta } : item)
      .filter((item) => item.qty > 0));
  }

  function removeFromCart(productId) {
    setCartItems((current) => current.filter((item) => item.id !== productId));
  }

  function openWhatsApp() {
    if (!cartItems.length) {
      toast('Your cart is empty', 'info');
      return;
    }
    const lines = cartItems.map((item) => `• ${item.name} (${item.weight}) x${item.qty} - ${money(item.price * item.qty)}`).join('%0A');
    const total = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello ChopperzFresh!%0AI'd like to order:%0A${lines}%0A%0ATotal: ${money(total)}`, '_blank');
  }

  const pageProps = { navigate, onAdd: addToCart, onOpen: setSelectedProduct, addedId };

  return (
    <>
      <Toasts toasts={toasts} />
      <CartDrawer
        open={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onQty={updateQty}
        onRemove={removeFromCart}
        onCheckout={() => toast('Checkout coming soon!', 'info')}
        onWhatsApp={openWhatsApp}
      />
      <Navbar
        cartCount={cartCount}
        route={route}
        navigate={navigate}
        onOpenCart={() => setCartOpen(true)}
        onToast={toast}
        onOpenProduct={setSelectedProduct}
      />
      <main id="main-content" role="main">
        {route.page === 'menu' ? <MenuPage route={route} {...pageProps} /> : <HomePage {...pageProps} />}
      </main>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addToCart} />
    </>
  );
}
