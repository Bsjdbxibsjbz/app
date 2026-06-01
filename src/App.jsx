import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Home, { Footer } from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import ProductCard from './components/ProductCard';
import { getProducts, getCategories } from './services/productService';
import { useCart } from './context/CartContext';

const WHATSAPP_NUMBER = '919999999999';

function Icon({ children, size = 16, fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      {children}
    </svg>
  );
}
function money(v) { return `₹${v.toLocaleString('en-IN')}`; }

// ── Toasts ────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div id="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type} show`}>
          <span className="toast-icon">
            {t.type === 'success' && <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>}
            {t.type === 'error'   && <Icon size={14}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>}
            {t.type === 'info'    && <Icon size={14}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon>}
          </span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Cart Drawer ───────────────────────────────────────────
function CartDrawer({ open, onClose, navigate, onWhatsApp }) {
  const { cartItems, updateQty, removeFromCart, subtotal, total, freeDelivery } = useCart();
  const threshold = 499;
  const pct = Math.min((subtotal / threshold) * 100, 100);

  return (
    <>
      <div id="cart-overlay" className={open ? 'open' : ''} aria-hidden="true" onClick={onClose} />
      <aside id="cart-panel" className={open ? 'open' : ''} role="dialog" aria-label="Shopping cart" aria-modal="true">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" aria-label="Close cart" onClick={onClose}>
            <Icon size={15}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
          </button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">
                <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p>Your cart is empty</p>
              <span>Add fresh products to get started</span>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item._key}>
                <div className="cart-item-img"><img src={item.image} alt={item.name} loading="lazy" /></div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  {/* Show the exact weight the customer selected */}
                  <div className="cart-item-weight">{item.selectedWeight || item.weight}</div>
                  <div className="cart-item-price">{money(item.price * item.qty)}</div>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item._key, -1)} aria-label="Decrease">-</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item._key, 1)} aria-label="Increase">+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(item._key)} aria-label={`Remove ${item.name}`}>
                    <Icon size={13}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-footer">
          {cartItems.length > 0 && (
            <>
              <div className="cart-free-delivery">
                <div className="cart-delivery-info">
                  {freeDelivery
                    ? <span className="delivery-free"><Icon size={12}><polyline points="20 6 9 17 4 12" /></Icon> Free delivery unlocked!</span>
                    : <span>Add <strong>{money(threshold - subtotal)}</strong> more for free delivery</span>
                  }
                </div>
                <div className="cart-progress-bar"><div className="cart-progress-fill" style={{ width: `${pct}%` }} /></div>
              </div>
              <div className="cart-total-row"><span>Subtotal</span><span className="cart-total-amt">{money(subtotal)}</span></div>
              <div className="cart-delivery-row">
                <span>Delivery</span>
                <span>{freeDelivery ? <><s style={{ opacity: 0.4 }}>₹40</s> <span className="tag-free">FREE</span></> : '₹40'}</span>
              </div>
              <div className="cart-divider" />
              <div className="cart-grand-row"><span>Total</span><span>{money(total)}</span></div>
              <button className="btn-checkout" onClick={() => { onClose(); navigate('checkout'); }}>
                Proceed to Checkout <Icon><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></Icon>
              </button>
              <button className="btn-whatsapp" onClick={onWhatsApp}>Order via WhatsApp</button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

// ── Spice Indicator ───────────────────────────────────────
function SpiceIndicator({ level, size = 'normal' }) {
  if (!level) return null;
  const map = { mild: { count: 1, label: 'Mild' }, medium: { count: 2, label: 'Medium' }, hot: { count: 3, label: 'Hot' } };
  const { count, label } = map[level] || map.mild;
  return (
    <div className={`spice-indicator spice-${size}`}>
      <div className="chillies">{[0,1,2].map((i) => <span key={i} className={`chilli ${i < count ? 'on' : 'off'}`}>🌶️</span>)}</div>
      <span className="spice-label">{label}</span>
    </div>
  );
}

// ── Product Detail Modal ──────────────────────────────────
// This is where weight → price logic lives.
// Selecting a weight reads priceByWeight[weight] and updates all price displays live.
function ProductModal({ product, onClose, onAdd }) {
  const weightOptions = product?.weightOptions || [product?.weight];
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0]);
  const [qty, setQty]     = useState(1);
  const [added, setAdded] = useState(false);

  // Derive price from selected weight.
  // priceByWeight['500g'] = 249, priceByWeight['1kg'] = 498 (double)
  const currentPrice    = product?.priceByWeight?.[selectedWeight]    ?? product?.price;
  const currentOriginal = product?.originalPriceByWeight?.[selectedWeight] ?? product?.originalPrice;
  const discount = currentOriginal ? Math.round((1 - currentPrice / currentOriginal) * 100) : 0;

  useEffect(() => {
    // Reset weight selection whenever a new product is opened
    if (product) {
      const opts = product.weightOptions || [product.weight];
      setSelectedWeight(opts[0]);
      setQty(1);
      setAdded(false);
    }
  }, [product?.id]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', Boolean(product));
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.classList.remove('modal-open'); document.removeEventListener('keydown', onKey); };
  }, [product, onClose]);

  if (!product) return null;

  function addFromModal() {
    // Pass selectedWeight and currentPrice so the cart stores the right price
    onAdd(product.id, qty, currentPrice, selectedWeight);
    setAdded(true);
    window.setTimeout(onClose, 900);
  }

  return (
    <div className="pdp-overlay open" id="pdp-modal" role="dialog" aria-modal="true" aria-label={product.name}
      onMouseDown={(e) => e.target.id === 'pdp-modal' && onClose()}>
      <div className="pdp-modal" role="document">
        <button className="pdp-close" aria-label="Close" onClick={onClose}>
          <Icon size={18}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></Icon>
        </button>
        <div className="pdp-layout">
          {/* Image */}
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

          {/* Info */}
          <div className="pdp-info-col">
            <div className="pdp-category-tag">{product.category}</div>
            <h2 className="pdp-title">{product.name}</h2>
            <p className="pdp-tagline">{product.tagline}</p>

            {/* Price — updates instantly when weight changes */}
            <div className="pdp-price-row">
              <span className="pdp-price">{money(currentPrice)}</span>
              {currentOriginal && <span className="pdp-orig">{money(currentOriginal)}</span>}
              {discount > 0 && <span className="pdp-save-tag">Save {money(currentOriginal - currentPrice)}</span>}
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
              {product.highlights.map((h) => (
                <div className="pdp-highlight" key={h}>
                  <Icon size={14}><polyline points="20 6 9 17 4 12" /></Icon>{h}
                </div>
              ))}
            </div>

            {/* Weight selector — clicking updates currentPrice immediately */}
            {weightOptions.length > 1 && (
              <div className="pdp-weight-selector">
                <span className="pdp-info-label">Select Weight</span>
                <div className="weight-opts">
                  {weightOptions.map((w) => (
                    <button key={w} className={`weight-opt ${selectedWeight === w ? 'active' : ''}`}
                      onClick={() => setSelectedWeight(w)}>
                      {w}
                      {/* Show price per weight option for clarity */}
                      <span style={{ display: 'block', fontSize: 11, fontWeight: 700, marginTop: 2, color: selectedWeight === w ? 'var(--red)' : 'var(--gray-400)' }}>
                        {money(product.priceByWeight?.[w] ?? product.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pdp-add-row">
              <div className="pdp-qty-wrap">
                <button className="pdp-qty-btn" onClick={() => setQty((v) => Math.max(1, v - 1))} aria-label="Decrease">-</button>
                <span className="pdp-qty-num">{qty}</span>
                <button className="pdp-qty-btn" onClick={() => setQty((v) => v + 1)} aria-label="Increase">+</button>
              </div>
              <button className={`btn-pdp-add ${added ? 'added' : ''}`} onClick={addFromModal}>
                {added
                  ? <Icon size={15}><polyline points="20 6 9 17 4 12" /></Icon>
                  : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
                }
                {added ? 'Added to Cart!' : <>Add to Cart · {money(currentPrice * qty)}</>}
              </button>
            </div>

            {product.storage && <div className="pdp-storage">{product.storage}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Menu Page ─────────────────────────────────────────────
function MenuPage({ route, navigate, onAdd, onOpen, addedId }) {
  const products   = getProducts();
  const categories = getCategories();

  const filtered = useMemo(() => {
    let next = products;
    if (route.filterCat) next = next.filter((p) => p.category === route.filterCat);
    if (route.filterSub) next = next.filter((p) => p.subcategory === route.filterSub);
    if (route.search) {
      const q = route.search.toLowerCase();
      next = next.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.subcategory.toLowerCase().includes(q));
    }
    return next;
  }, [route, products]);

  const title = route.search ? `Search: ${route.search}` : route.filterSub || route.filterCat || 'All Products';

  return (
    <>
      <section className="menu-page-hero">
        <div className="container">
          <nav className="menu-breadcrumb"><button onClick={() => navigate('home')}>Home</button><span>›</span><span>{title}</span></nav>
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
              {categories.map((cat) => (
                <div key={cat.id}>
                  <button className={`sidebar-cat-btn ${route.filterCat === cat.name && !route.filterSub ? 'active' : ''}`} onClick={() => navigate('menu', { filterCat: cat.name })}>
                    {cat.icon} {cat.name}
                  </button>
                  <div className="sidebar-sub-group">
                    {cat.subcategories.map((sub) => (
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
              <div className="products-grid">
                {filtered.map((item) => (
                  <ProductCard key={item.id} item={item} onAdd={onAdd} onOpen={onOpen} added={addedId === item.id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer navigate={navigate} />
    </>
  );
}

// ── App Root ──────────────────────────────────────────────
export default function App() {
  const [route, setRoute]                   = useState(() => ({ page: window.location.hash.replace('#', '') || 'home', filterCat: null, filterSub: null, search: '' }));
  const [cartOpen, setCartOpen]             = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toasts, setToasts]                 = useState([]);
  const [addedId, setAddedId]               = useState(null);
  const { addToCart, cartItems }            = useCart();

  useEffect(() => {
    const onPop = () => setRoute({ page: window.location.hash.replace('#', '') || 'home', filterCat: null, filterSub: null, search: '' });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function toast(message, type = 'success') {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }

  function navigate(page, opts = {}) {
    const next = { page, filterCat: opts.filterCat || null, filterSub: opts.filterSub || null, search: opts.search || '' };
    setRoute(next);
    window.history.pushState(next, '', page === 'home' ? '/' : `#${page}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // selectedWeight and priceOverride come from the modal when customer picks a weight
  function handleAddToCart(productId, qty = 1, priceOverride = null, selectedWeight = null) {
    const allProducts = getProducts();
    const product = allProducts.find((p) => p.id === productId);
    if (!product) return;

    // Build the cart item with the correct price for the selected weight
    const cartProduct = {
      ...product,
      price: priceOverride ?? product.price,
      selectedWeight: selectedWeight ?? product.weight,
    };

    addToCart(cartProduct, qty);
    setAddedId(productId);
    window.setTimeout(() => setAddedId(null), 1600);
    toast(`${product.name} added to cart!`, 'success');
  }

  function openWhatsApp() {
    if (!cartItems.length) { toast('Your cart is empty', 'info'); return; }
    const lines = cartItems.map((item) => `• ${item.name} (${item.selectedWeight || item.weight}) x${item.qty} - ${money(item.price * item.qty)}`).join('%0A');
    const total = cartItems.reduce((s, item) => s + item.qty * item.price, 0);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Hello ChopperzFresh!%0AI'd like to order:%0A${lines}%0A%0ATotal: ${money(total)}`, '_blank');
  }

  const pageProps = { navigate, onAdd: handleAddToCart, onOpen: setSelectedProduct, addedId };

  function renderPage() {
    switch (route.page) {
      case 'menu':     return <MenuPage route={route} {...pageProps} />;
      case 'cart':     return <Cart navigate={navigate} onToast={toast} />;
      case 'checkout': return <Checkout navigate={navigate} onToast={toast} />;
      default:         return <Home {...pageProps} />;
    }
  }

  return (
    <>
      <Toasts toasts={toasts} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} navigate={navigate} onWhatsApp={openWhatsApp} />
      <Navbar route={route} navigate={navigate} onOpenCart={() => setCartOpen(true)} onToast={toast} onOpenProduct={setSelectedProduct} />
      <main id="main-content" role="main">{renderPage()}</main>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={handleAddToCart} />
    </>
  );
}
