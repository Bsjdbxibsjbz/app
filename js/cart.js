/* ── ChopperzFresh Cart v3 ── */
const Cart = (() => {
  let items = [];
  try { items = JSON.parse(localStorage.getItem('cf3_cart') || '[]'); } catch(e) { items = []; }

  function save() {
    try { localStorage.setItem('cf3_cart', JSON.stringify(items)); } catch(e) {}
    render();
    updateBadge();
  }

  function add(productId, qty = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = items.find(i => i.id === productId);
    if (existing) existing.qty += qty;
    else items.push({ ...product, qty });
    save();
    showAddFeedback(productId);
  }

  function remove(productId) {
    items = items.filter(i => i.id !== productId);
    save();
  }

  function updateQty(productId, delta) {
    const item = items.find(i => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) remove(productId);
    else save();
  }

  function clear() { items = []; save(); }
  function total() { return items.reduce((s, i) => s + i.price * i.qty, 0); }
  function count() { return items.reduce((s, i) => s + i.qty, 0); }
  function getItems() { return [...items]; }

  function updateBadge() {
    const n = count();
    document.querySelectorAll('.cart-badge').forEach(b => {
      b.textContent = n;
      b.style.display = n > 0 ? 'flex' : 'none';
      if (n > 0) { b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 300); }
    });
    document.querySelectorAll('.cart-count-text').forEach(el => {
      el.textContent = n > 0 ? `(${n})` : '';
    });
  }

  function showAddFeedback(productId) {
    const btn = document.querySelector(`[data-add="${productId}"]`);
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added!`;
    btn.classList.add('added');
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('added');
      btn.disabled = false;
    }, 1600);
  }

  function render() {
    const panel = document.getElementById('cart-panel');
    if (!panel) return;
    const cartItems = getItems();

    if (cartItems.length === 0) {
      panel.querySelector('.cart-body').innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          </div>
          <p>Your cart is empty</p>
          <span>Add fresh products to get started</span>
        </div>`;
      panel.querySelector('.cart-footer').innerHTML = '';
      return;
    }

    panel.querySelector('.cart-body').innerHTML = cartItems.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-img">
          <img src="${item.image}" alt="${item.name}" loading="lazy">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-weight">${item.weight}</div>
          <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        </div>
        <div class="cart-item-controls">
          <div class="cart-item-qty">
            <button class="qty-btn" data-qty="${item.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-qty="${item.id}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" data-remove="${item.id}" aria-label="Remove ${item.name}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`).join('');

    const t = total();
    const freeDeliveryThreshold = 499;
    const free = t >= freeDeliveryThreshold;
    const progressPct = Math.min((t / freeDeliveryThreshold) * 100, 100);

    panel.querySelector('.cart-footer').innerHTML = `
      <div class="cart-free-delivery">
        <div class="cart-delivery-info">
          ${free
            ? `<span class="delivery-free"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Free delivery unlocked!</span>`
            : `<span>Add <strong>₹${freeDeliveryThreshold - t}</strong> more for free delivery</span>`}
        </div>
        <div class="cart-progress-bar">
          <div class="cart-progress-fill" style="width:${progressPct}%"></div>
        </div>
      </div>
      <div class="cart-total-row">
        <span>Subtotal</span>
        <span class="cart-total-amt">₹${t.toLocaleString('en-IN')}</span>
      </div>
      <div class="cart-delivery-row">
        <span>Delivery</span>
        <span>${free ? '<s style="opacity:.4">₹40</s> <span class="tag-free">FREE</span>' : '₹40'}</span>
      </div>
      <div class="cart-divider"></div>
      <div class="cart-grand-row">
        <span>Total</span>
        <span>₹${(t + (free ? 0 : 40)).toLocaleString('en-IN')}</span>
      </div>
      <button class="btn-checkout" onclick="App.toast('Checkout coming soon! 🚀', 'info')">
        Proceed to Checkout
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
      <button class="btn-whatsapp" onclick="App.openWhatsApp()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2C6.477 2 2 6.477 2 12.004c0 1.853.502 3.59 1.378 5.085L2 22l5.04-1.362A9.942 9.942 0 0 0 12.004 22C17.527 22 22 17.527 22 12.004 22 6.477 17.527 2 12.004 2z"/></svg>
        Order via WhatsApp
      </button>`;
  }

  return { add, remove, updateQty, clear, total, count, getItems, render, updateBadge };
})();