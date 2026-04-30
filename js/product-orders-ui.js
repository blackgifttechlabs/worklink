(function productOrdersPageBootstrap() {
  function market() {
    return window.WorkLinkUpMarketplace;
  }

  function orderStatusClass(status = '') {
    const value = String(status || 'pending').toLowerCase();
    return ['accepted', 'completed', 'rejected'].includes(value) ? value : 'pending';
  }

  async function renderProductOrdersPage() {
    const page = document.querySelector('[data-product-orders-page]');
    const api = market();
    if (!page || !api) return;

    const account = api.getStoredAccount();
    if (!account?.uid) {
      page.innerHTML = `
        <section class="market-account-shell">
          <div class="market-account-empty">
            <i class="fa-solid fa-bag-shopping"></i>
            <h1>Sign in to view your orders</h1>
            <p>This page shows only product orders you placed.</p>
            <a href="../pages/account.html">Sign in</a>
          </div>
        </section>
      `;
      return;
    }

    const allOrders = await api.listProductOrdersForUser(account.uid);
    const orders = allOrders.filter((order) => String(order.buyerUid || '') === String(account.uid));
    const totalValue = orders.reduce((sum, order) => sum + Number(order.offerPrice || 0), 0);

    page.innerHTML = `
      <section class="market-account-shell">
        <header class="market-account-hero">
          <div>
            <span>Product Orders</span>
            <h1>Your placed orders</h1>
            <p>Track the products you ordered from sellers across WorkLinkUp.</p>
          </div>
          <a href="../pages/products.html"><i class="fa-solid fa-store"></i><span>Keep shopping</span></a>
        </header>
        <section class="market-account-summary">
          <article><span>Orders placed</span><strong>${orders.length}</strong></article>
          <article><span>Pending</span><strong>${orders.filter((order) => String(order.status || 'pending') === 'pending').length}</strong></article>
          <article><span>Total offers</span><strong>${api.formatPrice(totalValue)}</strong></article>
        </section>
        <section class="market-account-card">
          <div class="market-account-card-head">
            <h2>Order history</h2>
            <span>${orders.length} rows</span>
          </div>
          <div class="market-order-table">
            ${orders.length ? orders.map((order) => `
              <article class="market-order-table-row">
                <div>
                  <strong>${api.escapeHtml(order.productTitle || 'Product')}</strong>
                  <small>${api.escapeHtml(order.productCategory || 'Marketplace')} / ${api.escapeHtml(order.deliveryMethod || 'pickup')}</small>
                </div>
                <div><span>Seller</span><strong>${api.escapeHtml(order.sellerName || 'Seller')}</strong></div>
                <div><span>Location</span><strong>${api.escapeHtml(order.deliveryLocation || 'Not shared')}</strong></div>
                <div><span>Offer</span><strong>${api.formatPrice(order.offerPrice)}</strong></div>
                <em class="is-${orderStatusClass(order.status)}">${api.escapeHtml(order.status || 'pending')}</em>
                <img src="${api.escapeHtml(api.resolveImage(order.productImageData))}" alt="${api.escapeHtml(order.productTitle || 'Product')}" />
              </article>
            `).join('') : '<div class="market-empty">You have not placed product orders yet.</div>'}
          </div>
        </section>
      </section>
    `;
  }

  document.addEventListener('DOMContentLoaded', renderProductOrdersPage);
})();
