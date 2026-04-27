/* ── ChopperzFresh App v3 ── */
'use strict';

const App = (() => {

  /* ── Toast ── */
  function toast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    const icons = { success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`, error: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`, info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` };
    t.innerHTML = `<span class="toast-icon">${icons[type] || icons.success}</span><span>${msg}</span>`;
    container.appendChild(t);
    requestAnimationFrame(() => { requestAnimationFrame(() => t.classList.add('show')); });
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 2800);
  }

  /* ── Spice Indicator ── */
  function spiceHTML(level, size = 'normal') {
    if (!level) return '';
    const map = { mild: { count: 1, label: 'Mild' }, medium: { count: 2, label: 'Medium' }, hot: { count: 3, label: 'Hot' } };
    const { count, label } = map[level] || map.mild;
    const chillies = Array.from({ length: 3 }, (_, i) =>
      `<span class="chilli ${i < count ? 'on' : 'off'}">🌶️</span>`).join('');
    return `<div class="spice-indicator spice-${size}"><div class="chillies">${chillies}</div><span class="spice-label">${label}</span></div>`;
  }

  /* ── Product Card ── */
  function productCard(item) {
    const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;
    return `
      <article class="product-card" data-pdp="${item.id}" tabindex="0" role="button" aria-label="View ${item.name} details">
        <div class="product-card-img-wrap">
          <img src="${item.image}" alt="${item.name}" loading="lazy" class="product-card-img">
          <div class="product-card-img-overlay"></div>
          ${item.badge ? `<span class="product-badge badge-${item.badge.toLowerCase().replace(' ','-')}">${item.badge}</span>` : ''}
          ${discount ? `<span class="discount-badge">−${discount}%</span>` : ''}
          ${item.category === 'Ready to Cook' && item.spiceLevel ? `<div class="card-spice-tag">${spiceHTML(item.spiceLevel)}</div>` : ''}
        </div>
        <div class="product-card-body">
          <span class="product-category-tag">${item.category}</span>
          <h3 class="product-name">${item.name}</h3>
          <p class="product-desc-short">${item.description.split('—')[0].trim()}</p>
          <div class="product-meta-row">
            <span class="product-weight-tag">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              ${item.weight}
            </span>
            <span class="product-serves-tag">Serves ${item.serves}</span>
          </div>
          <div class="product-footer">
            <div class="product-pricing">
              <span class="product-price">₹${item.price}</span>
              ${item.originalPrice ? `<span class="product-orig">₹${item.originalPrice}</span>` : ''}
            </div>
            <button class="btn-add-cart" data-add="${item.id}" aria-label="Add ${item.name} to cart" onclick="event.stopPropagation()">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>
        </div>
      </article>`;
  }

  /* ── Product Detail Modal (PDP) ── */
  function openPDP(productId) {
    const item = PRODUCTS.find(p => p.id === productId);
    if (!item) return;

    closePDP();

    const discount = item.originalPrice ? Math.round((1 - item.price / item.originalPrice) * 100) : 0;

    const modal = document.createElement('div');
    modal.id = 'pdp-modal';
    modal.className = 'pdp-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', item.name);

    const weightOptions = item.weightOptions || [item.weight];
    const weightButtons = weightOptions.map((w, i) =>
      `<button class="weight-opt ${i === 0 ? 'active' : ''}" data-weight="${w}" onclick="App.selectWeight(this)">${w}</button>`
    ).join('');

    modal.innerHTML = `
      <div class="pdp-modal" role="document">
        <button class="pdp-close" id="pdp-close-btn" aria-label="Close product details">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="pdp-layout">
          <!-- LEFT: Image -->
          <div class="pdp-image-col">
            <div class="pdp-img-wrap">
              <img src="${item.image}" alt="${item.name}" class="pdp-main-img" loading="eager">
              ${item.badge ? `<span class="pdp-badge badge-${item.badge.toLowerCase().replace(' ','-')}">${item.badge}</span>` : ''}
              ${discount ? `<span class="pdp-discount-badge">−${discount}% OFF</span>` : ''}
            </div>
            <!-- Trust Badges -->
            <div class="pdp-trust-row">
              <div class="trust-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Hygienic
              </div>
              <div class="trust-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                Farm Fresh
              </div>
              <div class="trust-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                Fast Delivery
              </div>
            </div>
          </div>

          <!-- RIGHT: Info -->
          <div class="pdp-info-col">
            <div class="pdp-category-tag">${item.category}</div>
            <h2 class="pdp-title">${item.name}</h2>
            <p class="pdp-tagline">${item.tagline || ''}</p>

            <!-- Price Row -->
            <div class="pdp-price-row">
              <span class="pdp-price">₹${item.price}</span>
              ${item.originalPrice ? `<span class="pdp-orig">₹${item.originalPrice}</span>` : ''}
              ${discount ? `<span class="pdp-save-tag">Save ₹${item.originalPrice - item.price}</span>` : ''}
            </div>

            <!-- Spice (Ready to Cook only) -->
            ${item.category === 'Ready to Cook' ? `
            <div class="pdp-spice-row">
              <span class="pdp-info-label">Spice Level</span>
              ${spiceHTML(item.spiceLevel, 'large')}
            </div>` : ''}

            <!-- Specs Grid -->
            <div class="pdp-specs-grid">
              <div class="pdp-spec">
                <div class="spec-icon">⚖️</div>
                <div class="spec-info">
                  <span class="spec-label">Weight</span>
                  <span class="spec-val">${item.weight}</span>
                </div>
              </div>
              <div class="pdp-spec">
                <div class="spec-icon">👥</div>
                <div class="spec-info">
                  <span class="spec-label">Serves</span>
                  <span class="spec-val">${item.serves} people</span>
                </div>
              </div>
              <div class="pdp-spec">
                <div class="spec-icon">🔥</div>
                <div class="spec-info">
                  <span class="spec-label">Calories</span>
                  <span class="spec-val">${item.calories}</span>
                </div>
              </div>
              <div class="pdp-spec">
                <div class="spec-icon">❄️</div>
                <div class="spec-info">
                  <span class="spec-label">Storage</span>
                  <span class="spec-val">0–4°C</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <p class="pdp-description">${item.description}</p>

            <!-- Highlights -->
            <div class="pdp-highlights">
              ${(item.highlights || []).map(h => `
                <div class="pdp-highlight">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                  ${h}
                </div>`).join('')}
            </div>

            <!-- Weight Selector -->
            ${weightOptions.length > 1 ? `
            <div class="pdp-weight-selector">
              <span class="pdp-info-label">Select Weight</span>
              <div class="weight-opts" id="pdp-weight-opts">${weightButtons}</div>
            </div>` : ''}

            <!-- Quantity + Add -->
            <div class="pdp-add-row">
              <div class="pdp-qty-wrap">
                <button class="pdp-qty-btn" id="pdp-qty-minus" aria-label="Decrease quantity">−</button>
                <span class="pdp-qty-num" id="pdp-qty-num">1</span>
                <button class="pdp-qty-btn" id="pdp-qty-plus" aria-label="Increase quantity">+</button>
              </div>
              <button class="btn-pdp-add" id="pdp-add-btn" data-add="${item.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Add to Cart · ₹<span id="pdp-total-price">${item.price}</span>
              </button>
            </div>

            <!-- Storage info -->
            ${item.storage ? `
            <div class="pdp-storage">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
              ${item.storage}
            </div>` : ''}
          </div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => { requestAnimationFrame(() => modal.classList.add('open')); });

    // Qty logic
    let qty = 1;
    const qtyNum = modal.querySelector('#pdp-qty-num');
    const totalPriceEl = modal.querySelector('#pdp-total-price');
    modal.querySelector('#pdp-qty-minus').addEventListener('click', () => {
      if (qty > 1) { qty--; qtyNum.textContent = qty; totalPriceEl.textContent = (item.price * qty).toLocaleString('en-IN'); }
    });
    modal.querySelector('#pdp-qty-plus').addEventListener('click', () => {
      qty++; qtyNum.textContent = qty; totalPriceEl.textContent = (item.price * qty).toLocaleString('en-IN');
    });

    // Add to cart from modal
    modal.querySelector('#pdp-add-btn').addEventListener('click', () => {
      Cart.add(item.id, qty);
      toast(`${item.name} added to cart!`, 'success');
      const btn = modal.querySelector('#pdp-add-btn');
      btn.innerHTML = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added to Cart!`;
      btn.classList.add('added');
      setTimeout(() => closePDP(), 900);
    });

    // Close
    modal.querySelector('#pdp-close-btn').addEventListener('click', closePDP);
    modal.addEventListener('click', (e) => { if (e.target === modal) closePDP(); });

    // Keyboard close
    const keyHandler = (e) => { if (e.key === 'Escape') { closePDP(); document.removeEventListener('keydown', keyHandler); } };
    document.addEventListener('keydown', keyHandler);

    // Focus trap
    modal.querySelector('#pdp-close-btn').focus();
  }

  function selectWeight(btn) {
    btn.closest('.weight-opts').querySelectorAll('.weight-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  function closePDP() {
    const existing = document.getElementById('pdp-modal');
    if (existing) {
      existing.classList.remove('open');
      document.body.classList.remove('modal-open');
      setTimeout(() => existing.remove(), 350);
    }
  }

  /* ── Mega Menu ── */
  function megaMenuHTML() {
    return `
      <div class="mega-menu" id="mega-menu" role="dialog" aria-label="Categories menu">
        <div class="mega-menu-inner">
          <div class="mega-left">
            <div class="mega-section-title">Browse</div>
            ${CATEGORIES.map(c => `
              <button class="mega-cat-btn" data-mega-cat="${c.id}">
                <span class="mega-cat-icon">${c.icon}</span>
                <span>${c.name}</span>
                <svg class="mega-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>`).join('')}
          </div>
          <div class="mega-right">
            ${CATEGORIES.map(c => `
              <div class="mega-sub-panel" data-mega-panel="${c.id}">
                <div class="mega-sub-title">${c.icon} ${c.name}</div>
                <div class="mega-sub-grid">
                  ${c.subcategories.map(sub => `
                    <button class="mega-sub-btn" data-nav="menu" data-filter-sub="${sub}">${sub}</button>`).join('')}
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }

  /* ── Hero Section ── */
  function heroHTML() {
    return `
      <section class="hero" id="hero">
        <div class="hero-bg-shape"></div>
        <div class="container hero-content">
          <div class="hero-text">
            <div class="hero-eyebrow">
              <span class="eyebrow-pulse"></span>
              Delivering Fresh Daily · Bengaluru
            </div>
            <h1 class="hero-title">
              Farm-Fresh Meat<br><em>Delivered to Your</em><br>Doorstep
            </h1>
            <p class="hero-sub">Hygienic · Vacuum Packed · Ready to Cook</p>
            <div class="hero-pills">
              <span class="hero-pill">🌿 No Preservatives</span>
              <span class="hero-pill">❄️ Cold Chain Delivery</span>
              <span class="hero-pill">✅ FSSAI Certified</span>
            </div>
            <div class="hero-ctas">
              <button class="btn-hero-primary" data-nav="menu">
                Shop Now
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button class="btn-hero-secondary" data-nav="menu" data-filter-cat="Ready to Cook">Ready to Cook 🔥</button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="hero-img-wrap">
              <img src="https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=900&q=85" alt="Fresh premium chicken" class="hero-img">
              <div class="hero-img-glow"></div>
              <div class="hero-float-card card-1">
                <span class="float-icon">⏱</span>
                <div><strong>45 Min</strong><br><small>Delivery</small></div>
              </div>
              <div class="hero-float-card card-2">
                <span class="float-icon">🌡️</span>
                <div><strong>0–4°C</strong><br><small>Cold Chain</small></div>
              </div>
              <div class="hero-rating">
                <div class="stars">★★★★★</div>
                <span>4.8 · 12,000+ orders</span>
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  /* ── Category Section ── */
  function categorySectionHTML() {
    return `
      <section class="section categories-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Shop by Category</h2>
            <p class="section-sub">Farm-fresh, hygienically processed, delivered cold</p>
          </div>
          <div class="category-cards">
            ${CATEGORIES.map(c => `
              <button class="category-card" data-nav="menu" data-filter-cat="${c.name}">
                <div class="category-card-img-wrap">
                  <img src="${c.image}" alt="${c.name}" loading="lazy">
                  <div class="category-card-overlay"></div>
                </div>
                <div class="category-card-body">
                  <span class="category-card-icon">${c.icon}</span>
                  <h3>${c.name}</h3>
                  <span class="category-card-count">${c.subcategories.length} variants</span>
                  <span class="category-card-cta">Explore →</span>
                </div>
              </button>`).join('')}
          </div>
        </div>
      </section>`;
  }

  /* ── Products Section ── */
  function productsSectionHTML(products, title = 'Popular Products', subtitle = '') {
    return `
      <section class="section products-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">${title}</h2>
            ${subtitle ? `<p class="section-sub">${subtitle}</p>` : ''}
          </div>
          <div class="products-grid">
            ${products.map(productCard).join('')}
          </div>
        </div>
      </section>`;
  }

  /* ── Why Choose Us ── */
  function whyHTML() {
    const perks = [
      { icon: '🧊', title: 'Fresh & Hygienic', desc: 'Sourced from certified farms, processed in hygienic, FSSAI-approved facilities.' },
      { icon: '🚫', title: 'Zero Preservatives', desc: 'Absolutely no additives — just pure, natural meat the way it should be.' },
      { icon: '📦', title: 'Vacuum Packed', desc: 'Sealed for freshness with tamper-proof, eco-friendly packaging.' },
      { icon: '⚡', title: '45-Min Delivery', desc: 'Delivered cold within 45 minutes — freshness from farm to your door.' },
      { icon: '✅', title: 'FSSAI Certified', desc: 'All products meet strict national food safety standards.' },
      { icon: '🏪', title: 'Daily Fresh Stock', desc: 'New stock every morning — we never deliver day-old products.' },
    ];
    return `
      <section class="section why-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">Why ChopperzFresh?</h2>
            <p class="section-sub">We obsess over quality so you don't have to</p>
          </div>
          <div class="why-grid">
            ${perks.map(p => `
              <div class="why-card">
                <div class="why-icon">${p.icon}</div>
                <h3>${p.title}</h3>
                <p>${p.desc}</p>
              </div>`).join('')}
          </div>
        </div>
      </section>`;
  }

  /* ── Footer ── */
  function footerHTML() {
    return `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <div class="footer-logo">Chopperz<span>Fresh</span></div>
              <p>Freshness delivered daily. Hygienically sourced and vacuum packed for your family.</p>
              <div class="footer-socials">
                <a href="#" aria-label="Instagram" class="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="Facebook" class="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="https://wa.me/919999999999" aria-label="WhatsApp" class="social-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.853.502 3.59 1.378 5.085L2 22l5.04-1.362A9.942 9.942 0 0 0 12.004 22C17.527 22 22 17.527 22 12.004 22 6.477 17.527 2 12.004 2z"/></svg>
                </a>
              </div>
            </div>
            <div class="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><a href="#" data-nav="home">Home</a></li>
                <li><a href="#" data-nav="menu">All Products</a></li>
                <li><a href="#" data-nav="menu" data-filter-cat="Chicken">Chicken</a></li>
                <li><a href="#" data-nav="menu" data-filter-cat="Ready to Cook">Ready to Cook</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Delivery Info</h4>
              <ul>
                <li>Monday – Sunday</li>
                <li>7:00 AM – 10:00 PM</li>
                <li>Same-day delivery</li>
                <li>Min. order: ₹199</li>
                <li>Free above ₹499</li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Contact</h4>
              <address>
                <p>📍 123 Food Park, Koramangala<br>Bengaluru, Karnataka 560034</p>
                <p>📞 <a href="tel:+919999999999">+91 99999 99999</a></p>
                <p>✉️ <a href="mailto:hello@chopperzfresh.com">hello@chopperzfresh.com</a></p>
              </address>
            </div>
          </div>
          <div class="footer-bottom">
            <p>© 2026 ChopperzFresh. All rights reserved. Made with ❤️ in Bengaluru.</p>
            <div class="footer-badges">
              <span>FSSAI Licensed</span>
              <span>ISO 22000</span>
              <span>100% Halal</span>
            </div>
          </div>
        </div>
      </footer>`;
  }

  /* ── WhatsApp Order ── */
  function openWhatsApp() {
    const items = Cart.getItems();
    if (!items.length) { toast('Your cart is empty', 'info'); return; }
    const lines = items.map(i => `• ${i.name} (${i.weight}) x${i.qty} — ₹${i.price * i.qty}`).join('%0A');
    const total = Cart.total();
    const msg = `Hello ChopperzFresh!%0AI'd like to order:%0A${lines}%0A%0ATotal: ₹${total}`;
    window.open(`https://wa.me/919999999999?text=${msg}`, '_blank');
  }

  /* ── Router ── */
  let state = { page: 'home', filterCat: null, filterSub: null, search: '' };

  function navigate(page, opts = {}) {
    state = { page, filterCat: opts.filterCat || null, filterSub: opts.filterSub || null, search: '' };
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeAll();
    const si = document.getElementById('search-input');
    if (si) si.value = '';
    document.querySelectorAll('[data-nav-link]').forEach(el => {
      el.classList.toggle('active', el.dataset.navLink === page);
    });
    history.pushState(state, '', page === 'home' ? '/' : `#${page}`);
  }

  function closeAll() {
    document.getElementById('mega-menu')?.classList.remove('open');
    document.getElementById('cart-panel')?.classList.remove('open');
    document.getElementById('cart-overlay')?.classList.remove('open');
    document.getElementById('search-results')?.classList.remove('open');
    document.querySelector('.hamburger')?.classList.remove('open');
    document.getElementById('mobile-nav')?.classList.remove('open');
  }

  /* ── Main Render ── */
  function render() {
    const main = document.getElementById('main-content');
    if (!main) return;

    if (state.page === 'home') {
      main.innerHTML =
        heroHTML() +
        categorySectionHTML() +
        productsSectionHTML(PRODUCTS, 'Our Products', 'Handpicked favourites — fresh, marinated, and ready') +
        whyHTML() +
        footerHTML();

    } else if (state.page === 'menu') {
      let filtered = PRODUCTS;
      if (state.filterCat) filtered = filtered.filter(p => p.category === state.filterCat);
      if (state.filterSub) filtered = filtered.filter(p => p.subcategory === state.filterSub);
      if (state.search) {
        const q = state.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q));
      }
      const title = state.filterSub || state.filterCat || 'All Products';

      main.innerHTML = `
        <section class="menu-page-hero">
          <div class="container">
            <nav class="menu-breadcrumb" aria-label="Breadcrumb">
              <button data-nav="home">Home</button>
              <span aria-hidden="true">›</span>
              <span>${title}</span>
            </nav>
            <h1>${title}</h1>
            <p>${filtered.length} product${filtered.length !== 1 ? 's' : ''} available</p>
          </div>
        </section>
        <section class="section">
          <div class="container menu-layout">
            <aside class="menu-sidebar" aria-label="Product filters">
              <div class="sidebar-section">
                <div class="sidebar-title">Categories</div>
                <button class="sidebar-cat-btn ${!state.filterCat && !state.filterSub ? 'active' : ''}" data-nav="menu">
                  🧺 All Products
                </button>
                ${CATEGORIES.map(c => `
                  <button class="sidebar-cat-btn ${state.filterCat === c.name && !state.filterSub ? 'active' : ''}"
                    data-nav="menu" data-filter-cat="${c.name}">
                    ${c.icon} ${c.name}
                  </button>
                  <div class="sidebar-sub-group">
                    ${c.subcategories.map(sub => `
                      <button class="sidebar-sub-btn ${state.filterSub === sub ? 'active' : ''}"
                        data-nav="menu" data-filter-sub="${sub}">
                        ${sub}
                      </button>`).join('')}
                  </div>
                `).join('')}
              </div>
            </aside>
            <div class="menu-products">
              ${filtered.length === 0
                ? `<div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>No products found</h3>
                    <p>Try a different category or search term</p>
                    <button class="btn-outline" data-nav="menu">View All Products</button>
                   </div>`
                : `<div class="products-grid">${filtered.map(productCard).join('')}</div>`}
            </div>
          </div>
        </section>
        ${footerHTML()}`;
    }

    setTimeout(() => {
      document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
      initFadeObserver();
    }, 50);
  }

  /* ── Search ── */
  function handleSearch(q) {
    q = q.trim();
    const box = document.getElementById('search-results');
    if (!box) return;
    if (!q) { box.classList.remove('open'); return; }

    const results = PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.category.toLowerCase().includes(q.toLowerCase()));

    if (results.length === 0) {
      box.innerHTML = `<div class="search-no-result">No products found for "<strong>${q}</strong>"</div>`;
    } else {
      box.innerHTML = results.map(p => `
        <button class="search-result-item" data-pdp-search="${p.id}">
          <img src="${p.image}" alt="${p.name}">
          <div class="sri-text">
            <div class="sri-name">${p.name}</div>
            <div class="sri-meta">${p.category} · ₹${p.price} · ${p.weight}</div>
          </div>
          ${p.category === 'Ready to Cook' ? `<div class="sri-spice">${'🌶️'.repeat(p.spiceLevel === 'mild' ? 1 : p.spiceLevel === 'medium' ? 2 : 3)}</div>` : ''}
        </button>`).join('');
      // attach click for search items
      box.querySelectorAll('[data-pdp-search]').forEach(el => {
        el.addEventListener('click', () => {
          box.classList.remove('open');
          openPDP(parseInt(el.dataset.pdpSearch));
        });
      });
    }
    box.classList.add('open');
  }

  /* ── Fade Observer ── */
  function initFadeObserver() {
    const els = document.querySelectorAll('.fade-in:not(.visible)');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 60);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }

  /* ── Mega Menu ── */
  function initMegaMenu() {
    const btns = document.querySelectorAll('.mega-cat-btn');
    const panels = document.querySelectorAll('.mega-sub-panel');
    function activateCat(catId) {
      btns.forEach(b => b.classList.toggle('active', b.dataset.megaCat === catId));
      panels.forEach(p => p.classList.toggle('active', p.dataset.megaPanel === catId));
    }
    if (btns.length) activateCat(btns[0].dataset.megaCat);
    btns.forEach(btn => {
      btn.addEventListener('mouseenter', () => activateCat(btn.dataset.megaCat));
      btn.addEventListener('focus', () => activateCat(btn.dataset.megaCat));
    });
  }

  /* ── Event Delegation ── */
  function initEvents() {
    document.addEventListener('click', (e) => {
      // PDP open
      const pdpCard = e.target.closest('[data-pdp]');
      if (pdpCard && !e.target.closest('[data-add]')) {
        openPDP(parseInt(pdpCard.dataset.pdp));
        return;
      }

      // Navigation
      const navEl = e.target.closest('[data-nav]');
      if (navEl) {
        e.preventDefault();
        navigate(navEl.dataset.nav, {
          filterCat: navEl.dataset.filterCat || null,
          filterSub: navEl.dataset.filterSub || null
        });
        return;
      }

      // Add to cart
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        e.stopPropagation();
        Cart.add(parseInt(addBtn.dataset.add));
        toast('Added to cart!', 'success');
        return;
      }

      // Cart qty
      const qtyBtn = e.target.closest('[data-qty]');
      if (qtyBtn) { Cart.updateQty(parseInt(qtyBtn.dataset.qty), parseInt(qtyBtn.dataset.delta)); return; }

      // Remove from cart
      const removeBtn = e.target.closest('[data-remove]');
      if (removeBtn) { Cart.remove(parseInt(removeBtn.dataset.remove)); return; }

      // Categories toggle
      const catToggle = e.target.closest('#cat-toggle');
      if (catToggle) {
        const mm = document.getElementById('mega-menu');
        mm.classList.toggle('open');
        if (mm.classList.contains('open')) initMegaMenu();
        return;
      }

      // Cart toggle
      const cartToggle = e.target.closest('#cart-toggle');
      if (cartToggle) {
        document.getElementById('cart-panel').classList.toggle('open');
        document.getElementById('cart-overlay').classList.toggle('open');
        Cart.render();
        return;
      }

      // Close cart overlay
      if (e.target.id === 'cart-overlay') {
        document.getElementById('cart-panel').classList.remove('open');
        document.getElementById('cart-overlay').classList.remove('open');
        return;
      }

      // Close mega menu
      const mm = document.getElementById('mega-menu');
      if (mm?.classList.contains('open') && !e.target.closest('#cat-toggle') && !e.target.closest('#mega-menu')) {
        mm.classList.remove('open');
      }

      // Hamburger
      const ham = e.target.closest('.hamburger');
      if (ham) {
        ham.classList.toggle('open');
        document.getElementById('mobile-nav').classList.toggle('open');
        return;
      }

      // Close search on outside click
      if (!e.target.closest('.search-wrap')) {
        document.getElementById('search-results')?.classList.remove('open');
      }
    });

    // Keyboard: open PDP on Enter/Space for cards
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const pdpCard = e.target.closest('[data-pdp]');
        if (pdpCard && !e.target.closest('[data-add]')) {
          e.preventDefault();
          openPDP(parseInt(pdpCard.dataset.pdp));
        }
      }
    });

    // Search
    const si = document.getElementById('search-input');
    if (si) {
      si.addEventListener('input', (e) => handleSearch(e.target.value));
      si.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
          state.page = 'menu';
          state.search = e.target.value.trim();
          state.filterCat = null;
          state.filterSub = null;
          render();
          document.getElementById('search-results')?.classList.remove('open');
        }
        if (e.key === 'Escape') document.getElementById('search-results')?.classList.remove('open');
      });
    }

    window.addEventListener('popstate', (e) => {
      const s = e.state || { page: 'home' };
      state = s;
      render();
    });

    window.addEventListener('scroll', () => {
      document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  /* ── Navbar ── */
  function buildNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    nav.innerHTML = `
      <div class="nav-top-bar">
        <div class="container nav-top-inner">
          <span>🚀 Free delivery on orders above ₹499</span>
          <span>📞 +91 99999 99999</span>
        </div>
      </div>
      <div class="nav-main">
        <div class="container nav-inner">
          <button class="nav-logo" data-nav="home" aria-label="ChopperzFresh Home">
            Chopperz<span>Fresh</span>
          </button>
          <button class="nav-location" aria-label="Select location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Bengaluru
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="search-wrap">
            <div class="search-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input id="search-input" type="search" placeholder="Search chicken, kababs..." autocomplete="off" aria-label="Search products">
            </div>
            <div class="search-results" id="search-results" role="listbox"></div>
          </div>
          <nav class="nav-links" aria-label="Main navigation">
            <div class="nav-cat-wrap">
              <button class="nav-link" id="cat-toggle" aria-expanded="false" aria-haspopup="true">
                Categories
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              ${megaMenuHTML()}
            </div>
            <button class="nav-link" data-nav-link="home" data-nav="home">Home</button>
            <button class="nav-link" data-nav-link="menu" data-nav="menu">Shop</button>
          </nav>
          <div class="nav-actions">
            <button class="nav-action-btn login-btn" onclick="App.toast('Login coming soon! 🔐', 'info')" aria-label="Login">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Login</span>
            </button>
            <button class="nav-action-btn cart-btn" id="cart-toggle" aria-label="Open cart">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span class="cart-badge" style="display:none">0</span>
            </button>
          </div>
          <button class="hamburger" aria-label="Toggle menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <div class="mobile-nav" id="mobile-nav" role="dialog" aria-label="Mobile navigation">
        <div class="mobile-nav-links">
          <button class="mobile-nav-link" data-nav="home">🏠 Home</button>
          <button class="mobile-nav-link" data-nav="menu">🛍 All Products</button>
          <button class="mobile-nav-link" data-nav="menu" data-filter-cat="Chicken">🍗 Chicken</button>
          <button class="mobile-nav-link" data-nav="menu" data-filter-cat="Ready to Cook">🔥 Ready to Cook</button>
          <div class="mobile-nav-divider"></div>
          <button class="mobile-nav-link" onclick="App.toast('Login coming soon! 🔐', 'info')">👤 Login</button>
          <button class="mobile-nav-link" id="mobile-cart-toggle">🛒 Cart <span class="cart-count-text"></span></button>
        </div>
      </div>`;

    document.getElementById('mobile-cart-toggle')?.addEventListener('click', () => {
      document.getElementById('cart-panel').classList.add('open');
      document.getElementById('cart-overlay').classList.add('open');
      document.getElementById('mobile-nav').classList.remove('open');
      document.querySelector('.hamburger')?.classList.remove('open');
      Cart.render();
    });
  }

  /* ── Init ── */
  function init() {
    buildNavbar();
    Cart.updateBadge();
    const hash = window.location.hash.replace('#', '') || 'home';
    navigate(['home', 'menu'].includes(hash) ? hash : 'home');
    initEvents();
  }

  return { init, navigate, toast, openPDP, closePDP, openWhatsApp, selectWeight };
})();

document.addEventListener('DOMContentLoaded', App.init);