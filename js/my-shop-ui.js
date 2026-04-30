(function myShopPageBootstrap() {
  function market() {
    return window.WorkLinkUpMarketplace;
  }

  function dayKey(timestamp) {
    return new Date(Number(timestamp || Date.now())).toLocaleDateString(undefined, { weekday: 'short' });
  }

  function statusClass(status = '') {
    const value = String(status || 'pending').toLowerCase();
    return ['accepted', 'completed', 'rejected', 'cancelled', 'canceled', 'shipped', 'sold'].includes(value) ? value.replace('canceled', 'cancelled') : 'pending';
  }

  function productStatus(product = {}) {
    return String(product.status || 'active') === 'sold' ? 'sold' : 'active';
  }

  function chartMarkup(points = [], color = '#ff0050', money = false) {
    const max = Math.max(1, ...points.map((point) => Number(point.value || 0)));
    const width = 520;
    const height = 150;
    const step = points.length > 1 ? width / (points.length - 1) : width;
    const coords = points.map((point, index) => {
      const x = Math.round(index * step);
      const y = Math.round(height - (Number(point.value || 0) / max) * 110 - 20);
      return { ...point, x, y };
    });
    const path = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');
    const fill = `${path} L${width},${height} L0,${height} Z`;
    const last = coords[coords.length - 1] || { x: 0, y: height, value: 0 };
    return `
      <div class="shop-line-chart">
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="7 day performance chart">
          <path d="${fill}" fill="${color}" opacity="0.10"></path>
          <path d="${path}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>
          ${coords.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#fff" stroke="${color}" stroke-width="3"></circle>`).join('')}
          <g transform="translate(${Math.max(18, last.x - 44)},${Math.max(18, last.y - 28)})">
            <rect width="58" height="22" rx="7" fill="${color}"></rect>
            <text x="29" y="15" fill="#fff" font-size="10" font-weight="800" text-anchor="middle">${money ? `US$${Number(last.value || 0).toLocaleString()}` : Number(last.value || 0).toLocaleString()}</text>
          </g>
        </svg>
        <div class="shop-chart-days">${points.map((point) => `<span>${point.label}</span>`).join('')}</div>
      </div>
    `;
  }

  function windowStats(items = [], valueGetter = () => 1) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const currentStart = now - (7 * dayMs);
    const previousStart = now - (14 * dayMs);
    const current = items
      .filter((item) => Number(item.createdAtMs || 0) >= currentStart)
      .reduce((sum, item) => sum + Number(valueGetter(item) || 0), 0);
    const previous = items
      .filter((item) => Number(item.createdAtMs || 0) >= previousStart && Number(item.createdAtMs || 0) < currentStart)
      .reduce((sum, item) => sum + Number(valueGetter(item) || 0), 0);
    const diff = current - previous;
    const percent = previous > 0 ? Math.round((diff / previous) * 100) : (current > 0 ? 100 : 0);
    return { current, previous, diff, percent };
  }

  function comparisonLabel(stats = {}, suffix = 'vs previous 7 days') {
    const value = Number(stats.percent || 0);
    const sign = value > 0 ? '+' : '';
    return `<b class="${value < 0 ? 'is-down' : ''}">${sign}${value}%</b> ${suffix}`;
  }

  function orderRow(order, api) {
    return `
      <article class="shop-order-card-row">
        <img src="${api.escapeHtml(api.resolveImage(order.productImageData))}" alt="${api.escapeHtml(order.productTitle || 'Product')}" />
        <div class="shop-order-main">
          <small>Order #${api.escapeHtml(String(order.id || order.productId || '').slice(-12) || 'pending')}</small>
          <strong>${api.escapeHtml(order.productTitle || 'Product')}</strong>
          <span>Buyer: ${api.escapeHtml(order.buyerName || 'Buyer')}</span>
          <em><i class="fa-regular fa-calendar"></i>${new Date(Number(order.createdAtMs || Date.now())).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</em>
        </div>
        <div class="shop-order-meta">
          <b class="is-${statusClass(order.status)}">${api.escapeHtml(order.status || 'pending')}</b>
          <strong>${api.formatPrice(order.offerPrice)}</strong>
          <span>Offered: ${api.formatPrice(order.offerPrice)}</span>
          <small><i class="fa-solid fa-location-dot"></i>${api.escapeHtml(order.deliveryLocation || 'No location')}</small>
        </div>
        <button type="button" aria-label="Open order"><i class="fa-solid fa-chevron-right"></i></button>
      </article>
    `;
  }

  async function renderMyShopPage() {
    const page = document.querySelector('[data-my-shop-page]');
    const api = market();
    if (!page || !api) return;

    const account = api.getStoredAccount();
    if (!account?.uid) {
      page.innerHTML = `
        <section class="market-account-shell">
          <div class="market-account-empty">
            <i class="fa-solid fa-store"></i>
            <h1>Sign in to open My Shop</h1>
            <p>My Shop is where your listings, product orders, and save activity live.</p>
            <a href="../pages/account.html">Sign in</a>
          </div>
        </section>
      `;
      return;
    }

    let products = await api.listProducts({ sellerUid: account.uid });
    const allOrders = await api.listProductOrdersForUser(account.uid);
    const orders = allOrders.filter((order) => String(order.sellerUid || '') === String(account.uid));
    const saves = await api.listWishlistSavesForSeller(account.uid);
    const acceptedRevenue = orders
      .filter((order) => ['accepted', 'completed', 'shipped'].includes(String(order.status || '').toLowerCase()))
      .reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);
    const acceptedOrders = orders.filter((order) => ['accepted', 'completed', 'shipped'].includes(String(order.status || '').toLowerCase()));
    const pendingValue = orders
      .filter((order) => String(order.status || 'pending').toLowerCase() === 'pending')
      .reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);
    const activeListings = products.filter((product) => productStatus(product) === 'active');
    const soldListings = products.filter((product) => productStatus(product) === 'sold');
    const orderValueStats = windowStats(orders, (order) => Number(order.offerPrice || 0));
    const saveStats = windowStats(saves, () => 1);
    const acceptedRevenueStats = windowStats(acceptedOrders, (order) => Number(order.offerPrice || 0));
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: 0 };
    });
    const orderDays = days.map((item) => ({ ...item }));
    orders.forEach((order) => {
      const bucket = orderDays.find((item) => item.label === dayKey(order.createdAtMs));
      if (bucket) bucket.value += Number(order.offerPrice || 0);
    });
    const saveDays = days.map((item) => ({ ...item, value: saves.filter((save) => dayKey(save.createdAtMs) === item.label).length }));

    page.innerHTML = `
      <section class="shop-app-shell">
        <aside class="shop-side-panel">
          <div class="shop-side-brand">
            <span><i class="fa-solid fa-bag-shopping"></i></span>
            <div>
              <strong>${api.escapeHtml(account.name || 'My Shop')}</strong>
              <a href="../pages/products.html">View public store <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </div>
          </div>
          <nav class="shop-side-nav" aria-label="Shop sections">
            <button type="button" class="is-active" data-shop-tab="overview"><i class="fa-regular fa-square-check"></i><span>Overview</span></button>
            <button type="button" data-shop-tab="listings"><i class="fa-regular fa-clipboard"></i><span>Listings</span></button>
            <button type="button" data-shop-tab="orders"><i class="fa-regular fa-calendar-check"></i><span>Orders</span></button>
            <button type="button" data-shop-tab="wishlist"><i class="fa-regular fa-heart"></i><span>Wishlist Saves</span></button>
            <button type="button" data-shop-tab="analytics"><i class="fa-solid fa-chart-column"></i><span>Analytics</span></button>
            <a href="../pages/messages.html"><i class="fa-regular fa-message"></i><span>Messages</span></a>
            <button type="button"><i class="fa-solid fa-gear"></i><span>Settings</span></button>
          </nav>
          <div class="shop-support-card">
            <i class="fa-solid fa-headset"></i>
            <strong>Need help?</strong>
            <small>We are here to help manage your shop.</small>
            <a href="../pages/help.html">Contact Support</a>
          </div>
        </aside>

        <section class="shop-main-panel">
          <header class="shop-hero-card">
            <div>
              <span>My Shop</span>
              <h1>${api.escapeHtml(account.name || 'Black Gift')} storefront</h1>
              <p>Manage listings, see buyer demand, and react to orders from one focused dashboard.</p>
            </div>
            <button type="button" data-shop-add-product><i class="fa-solid fa-plus"></i><span>Add Product</span></button>
          </header>

          <section class="shop-stat-row">
            <article><i class="fa-solid fa-bag-shopping"></i><span>Active listings</span><strong>${activeListings.length}</strong><small>${soldListings.length} sold listings</small></article>
            <article><i class="fa-solid fa-lock"></i><span>Seller orders</span><strong>${orders.length}</strong><small>${api.formatPrice(pendingValue)} pending value</small></article>
            <article><i class="fa-regular fa-heart"></i><span>Wishlist saves</span><strong>${saves.length}</strong><small>${comparisonLabel(saveStats, 'vs previous 7 days')}</small></article>
            <article><i class="fa-solid fa-chart-line"></i><span>Accepted revenue</span><strong>${api.formatPrice(acceptedRevenue)}</strong><small>${comparisonLabel(acceptedRevenueStats, 'vs previous 7 days')}</small></article>
          </section>

          <section class="shop-chart-grid">
            <article>
              <div><h2>Order value trend</h2><button type="button">Last 7 days <i class="fa-solid fa-chevron-down"></i></button></div>
              <strong>${api.formatPrice(orderDays.reduce((sum, point) => sum + point.value, 0))}</strong>
              <small>${comparisonLabel(orderValueStats)}</small>
              ${chartMarkup(orderDays, '#ff0050', true)}
            </article>
            <article>
              <div><h2>Wishlist demand</h2><button type="button">Last 7 days <i class="fa-solid fa-chevron-down"></i></button></div>
              <strong>${saves.length}</strong>
              <small>${comparisonLabel(saveStats)}</small>
              ${chartMarkup(saveDays, '#b000ff')}
            </article>
          </section>

          <section class="shop-data-card">
            <div class="shop-data-tabs">
              <button type="button" class="is-active" data-shop-tab="listings">Listings</button>
              <button type="button" data-shop-tab="orders">Orders</button>
              <button type="button" data-shop-tab="wishlist">Wishlist Saves</button>
            </div>
            <div class="shop-data-tools">
              <label><input type="search" data-shop-search placeholder="Search products..." /><i class="fa-solid fa-magnifying-glass"></i></label>
              <button type="button"><i class="fa-solid fa-filter"></i> Filters</button>
              <select><option>Newest</option><option>Oldest</option></select>
            </div>

            <div data-shop-panel="listings">
              <div class="shop-listing-table" data-shop-listings></div>
            </div>
            <div data-shop-panel="orders" hidden>
              <div class="shop-mobile-order-stats">
                <article><i class="fa-solid fa-lock"></i><span>All Orders</span><strong>${orders.length}</strong><small>Total orders</small></article>
                <article><i class="fa-solid fa-clock"></i><span>Pending</span><strong>${orders.filter((order) => String(order.status || 'pending') === 'pending').length}</strong><small>Awaiting response</small></article>
                <article><i class="fa-solid fa-check"></i><span>Completed</span><strong>${orders.filter((order) => String(order.status || '') === 'completed').length}</strong><small>Orders completed</small></article>
                <article><i class="fa-solid fa-xmark"></i><span>Cancelled</span><strong>${orders.filter((order) => ['cancelled', 'canceled', 'rejected'].includes(String(order.status || ''))).length}</strong><small>Orders cancelled</small></article>
              </div>
              <div class="shop-orders-list">
                ${orders.length ? orders.map((order) => orderRow(order, api)).join('') : '<div class="market-empty">No one has ordered from your shop yet.</div>'}
              </div>
            </div>
            <div data-shop-panel="wishlist" hidden>
              <div class="shop-save-list">
                ${saves.length ? saves.map((save) => `
                  <article class="shop-save-row">
                    <img src="${api.escapeHtml(api.resolveImage(save.productImageData))}" alt="${api.escapeHtml(save.productTitle || 'Product')}" />
                    <div><strong>${api.escapeHtml(save.productTitle || 'Product')}</strong><span>${api.escapeHtml(save.productLocation || 'Location not shared')}</span></div>
                    <div><span>Saved by</span><strong>${api.escapeHtml(save.buyerName || 'WorkLinkUp user')}</strong>${save.buyerPhone ? `<small>${api.escapeHtml(save.buyerPhone)}</small>` : ''}</div>
                    <em>${api.formatPrice(save.productPrice)}</em>
                  </article>
                `).join('') : '<div class="market-empty">No wishlist saves on your products yet.</div>'}
              </div>
            </div>
          </section>
          <div class="market-modal-shell" data-market-modal hidden></div>
        </section>
      </section>
    `;

    const listingHost = page.querySelector('[data-shop-listings]');
    const searchInput = page.querySelector('[data-shop-search]');

    function listingMarkup(item) {
      const itemOrders = orders.filter((order) => String(order.productId || '') === String(item.id || ''));
      const itemSaves = saves.filter((save) => String(save.productId || '') === String(item.id || ''));
      const revenue = itemOrders.reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);
      const status = productStatus(item);
      return `
        <article class="shop-listing-row">
          <div class="shop-listing-product">
            <img src="${api.escapeHtml(api.resolveImage(item.imageData || item.image || item.images?.[0]))}" alt="${api.escapeHtml(item.title || 'Product')}" />
            <div><strong>${api.escapeHtml(item.title || 'Product')}</strong><span>${api.escapeHtml(item.category || 'Other')}</span></div>
          </div>
          <strong>${api.formatPrice(item.price)}</strong>
          <b class="is-${status}">${status === 'sold' ? 'Sold' : 'Active'}</b>
          <span>${Number(item.views || item.viewCount || 0)}</span>
          <span>${itemSaves.length || Number(item.wishlistCount || 0)}</span>
          <span>${itemOrders.length}</span>
          <strong>${api.formatPrice(revenue)}</strong>
          <div class="shop-listing-actions">
            <button type="button" data-edit-listing="${api.escapeHtml(item.id)}" aria-label="Edit listing"><i class="fa-solid fa-pen"></i></button>
            <button type="button" data-toggle-status="${api.escapeHtml(item.id)}" aria-label="${status === 'sold' ? 'Mark available' : 'Mark sold'}"><i class="fa-solid ${status === 'sold' ? 'fa-rotate-left' : 'fa-check'}"></i></button>
          </div>
        </article>
      `;
    }

    function renderListings() {
      if (!listingHost) return;
      const query = String(searchInput?.value || '').trim().toLowerCase();
      const filtered = products.filter((item) => !query || [item.title, item.category, item.location].join(' ').toLowerCase().includes(query));
      listingHost.innerHTML = `
        <div class="shop-listing-head"><span>Product</span><span>Price</span><span>Status</span><span>Views</span><span>Saves</span><span>Orders</span><span>Revenue</span><span>Actions</span></div>
        ${filtered.length ? filtered.map(listingMarkup).join('') : '<div class="market-empty">No listings found.</div>'}
        <div class="shop-table-foot"><span>Showing 1 to ${filtered.length} of ${products.length} products</span><div><button type="button" disabled><i class="fa-solid fa-chevron-left"></i></button><button type="button" class="is-active">1</button><button type="button">2</button><button type="button"><i class="fa-solid fa-chevron-right"></i></button></div></div>
      `;
    }

    renderListings();

    page.querySelector('[data-shop-add-product]')?.addEventListener('click', () => {
      api.openAddItemModal(page, (item) => {
        products = [item, ...products];
        renderListings();
      });
    });

    searchInput?.addEventListener('input', renderListings);

    page.addEventListener('click', async (event) => {
      const editButton = event.target.closest('[data-edit-listing]');
      const statusButton = event.target.closest('[data-toggle-status]');
      if (editButton) {
        const product = products.find((item) => String(item.id || '') === editButton.getAttribute('data-edit-listing'));
        if (!product) return;
        api.openEditItemModal(page, product, (updated) => {
          products = products.map((item) => String(item.id || '') === String(updated.id || '') ? updated : item);
          renderListings();
        });
        return;
      }
      if (statusButton) {
        const product = products.find((item) => String(item.id || '') === statusButton.getAttribute('data-toggle-status'));
        if (!product) return;
        const nextStatus = productStatus(product) === 'sold' ? 'active' : 'sold';
        try {
          const updated = await api.updateProduct(product.id, { ...product, status: nextStatus });
          products = products.map((item) => String(item.id || '') === String(updated.id || '') ? updated : item);
          renderListings();
        } catch (error) {
          window.alert(error.message || 'Could not update listing status.');
        }
      }
    });

    page.querySelectorAll('[data-shop-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-shop-tab') || 'listings';
        const panelName = tab === 'overview' || tab === 'analytics' ? 'listings' : tab;
        page.querySelectorAll('[data-shop-tab]').forEach((item) => item.classList.toggle('is-active', item.getAttribute('data-shop-tab') === tab));
        page.querySelectorAll('[data-shop-panel]').forEach((panel) => {
          panel.hidden = panel.getAttribute('data-shop-panel') !== panelName;
        });
        document.querySelector('.shop-data-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', renderMyShopPage);
})();
