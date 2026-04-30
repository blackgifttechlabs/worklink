(function myShopPageBootstrap() {
  function market() {
    return window.WorkLinkUpMarketplace;
  }

  function dayKey(timestamp) {
    const date = new Date(Number(timestamp || Date.now()));
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  function statusClass(status = '') {
    const value = String(status || 'pending').toLowerCase();
    return ['accepted', 'completed', 'rejected'].includes(value) ? value : 'pending';
  }

  function barChartMarkup(points = [], emptyLabel = 'No activity yet') {
    const max = Math.max(1, ...points.map((point) => Number(point.value || 0)));
    return `
      <div class="shop-bar-chart">
        ${points.length ? points.map((point) => `
          <div class="shop-bar-item">
            <span style="height:${Math.max(8, Math.round((Number(point.value || 0) / max) * 100))}%"></span>
            <small>${point.label}</small>
          </div>
        `).join('') : `<p>${emptyLabel}</p>`}
      </div>
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
    const revenue = orders
      .filter((order) => ['accepted', 'completed'].includes(String(order.status || '').toLowerCase()))
      .reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);
    const pendingValue = orders
      .filter((order) => String(order.status || 'pending').toLowerCase() === 'pending')
      .reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);
    const conversion = saves.length ? Math.round((orders.length / saves.length) * 100) : 0;
    const days = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return { label: date.toLocaleDateString(undefined, { weekday: 'short' }), value: 0 };
    });
    orders.forEach((order) => {
      const label = dayKey(order.createdAtMs);
      const bucket = days.find((item) => item.label === label);
      if (bucket) bucket.value += Number(order.offerPrice || 0);
    });
    const saveDays = days.map((item) => ({ ...item, value: saves.filter((save) => dayKey(save.createdAtMs) === item.label).length }));

    const renderProducts = () => {
      const grid = page.querySelector('[data-shop-products]');
      if (!grid) return;
      grid.innerHTML = products.length
        ? products.map((product) => api.productCard(product)).join('')
        : '<div class="market-empty">No products listed yet.</div>';
    };

    page.innerHTML = `
      <section class="market-account-shell shop-dashboard">
        <header class="market-account-hero shop-hero">
          <div>
            <span>My Shop</span>
            <h1>${api.escapeHtml(account.name || 'Your')} storefront</h1>
            <p>Manage listings, see buyer demand, and react to orders from one focused dashboard.</p>
          </div>
          <button type="button" data-shop-add-product><i class="fa-solid fa-plus"></i><span>Add product</span></button>
        </header>

        <section class="shop-metric-grid">
          <article><i class="fa-solid fa-box-open"></i><span>Active listings</span><strong>${products.length}</strong><small>${products.filter((item) => Number(item.wishlistCount || 0) > 0).length} getting saves</small></article>
          <article><i class="fa-solid fa-bag-shopping"></i><span>Seller orders</span><strong>${orders.length}</strong><small>${api.formatPrice(pendingValue)} pending value</small></article>
          <article><i class="fa-regular fa-heart"></i><span>Wishlist saves</span><strong>${saves.length}</strong><small>${conversion}% order-to-save signal</small></article>
          <article><i class="fa-solid fa-chart-line"></i><span>Accepted revenue</span><strong>${api.formatPrice(revenue)}</strong><small>Accepted and completed orders</small></article>
        </section>

        <section class="shop-dashboard-grid">
          <article class="market-account-card shop-performance-card">
            <div class="market-account-card-head"><h2>Order value trend</h2><span>7 days</span></div>
            ${barChartMarkup(days)}
          </article>
          <article class="market-account-card shop-performance-card">
            <div class="market-account-card-head"><h2>Wishlist demand</h2><span>7 days</span></div>
            ${barChartMarkup(saveDays)}
          </article>
        </section>

        <section class="market-account-card">
          <div class="market-account-tabs">
            <button type="button" class="is-active" data-shop-tab="listings">Listings</button>
            <button type="button" data-shop-tab="orders">Orders</button>
            <button type="button" data-shop-tab="wishlist">WishList</button>
          </div>
          <div data-shop-panel="listings">
            <div class="market-grid market-account-grid" data-shop-products></div>
          </div>
          <div data-shop-panel="orders" hidden>
            <div class="market-order-table">
              ${orders.length ? orders.map((order) => `
                <article class="market-order-table-row">
                  <div><strong>${api.escapeHtml(order.productTitle || 'Product')}</strong><small>${api.escapeHtml(order.message || 'No buyer message')}</small></div>
                  <div><span>Buyer</span><strong>${api.escapeHtml(order.buyerName || 'Buyer')}</strong><small>${api.escapeHtml(order.buyerPhone || '')}</small></div>
                  <div><span>Delivery</span><strong>${api.escapeHtml(order.deliveryLocation || 'Not shared')}</strong></div>
                  <div><span>Offer</span><strong>${api.formatPrice(order.offerPrice)}</strong></div>
                  <em class="is-${statusClass(order.status)}">${api.escapeHtml(order.status || 'pending')}</em>
                  <img src="${api.escapeHtml(api.resolveImage(order.productImageData))}" alt="${api.escapeHtml(order.productTitle || 'Product')}" />
                </article>
              `).join('') : '<div class="market-empty">No one has ordered from your shop yet.</div>'}
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
    `;

    renderProducts();

    page.querySelector('[data-shop-add-product]')?.addEventListener('click', () => {
      api.openAddItemModal(page, (item) => {
        products = [item, ...products];
        renderProducts();
      });
    });

    page.querySelectorAll('[data-shop-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const tab = button.getAttribute('data-shop-tab') || 'listings';
        page.querySelectorAll('[data-shop-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
        page.querySelectorAll('[data-shop-panel]').forEach((panel) => {
          panel.hidden = panel.getAttribute('data-shop-panel') !== tab;
        });
      });
    });

    api.bindMarketplaceEvents(page, () => products, (nextProducts) => {
      products = nextProducts;
      renderProducts();
    }, { wishlistIds: new Set() }, renderProducts);
  }

  document.addEventListener('DOMContentLoaded', renderMyShopPage);
})();
