(function wishlistPageBootstrap() {
  function market() {
    return window.WorkLinkUpMarketplace;
  }

  function signInMarkup() {
    return `
      <section class="market-account-shell">
        <div class="market-account-empty">
          <i class="fa-regular fa-heart"></i>
          <h1>Sign in to view your wishlist</h1>
          <p>Your wishlist shows only the products you loved.</p>
          <a href="../pages/account.html">Sign in</a>
        </div>
      </section>
    `;
  }

  async function renderWishlistPage() {
    const page = document.querySelector('[data-wishlist-page]');
    const api = market();
    if (!page || !api) return;

    const account = api.getStoredAccount();
    if (!account?.uid) {
      page.innerHTML = signInMarkup();
      return;
    }

    let saved = await api.listWishlistForUser(account.uid);
    const toProduct = (item) => ({
      id: item.productId,
      title: item.productTitle,
      imageData: item.productImageData,
      price: item.productPrice,
      location: item.productLocation,
      category: 'Saved',
      sellerUid: item.sellerUid || '',
      sellerName: item.sellerName || 'WorkLinkUp seller',
      deliveryOption: item.deliveryMethod || 'pickup'
    });

    const render = () => {
      const wishlistIds = new Set(saved.map((item) => item.productId));
      page.innerHTML = `
        <section class="market-account-shell">
          <header class="market-account-hero">
            <div>
              <span>My Wishlist</span>
              <h1>Products you loved</h1>
              <p>Everything here belongs to your own account, so it is private to your shopping activity.</p>
            </div>
            <a href="../pages/products.html"><i class="fa-solid fa-store"></i><span>Browse products</span></a>
          </header>
          <section class="market-account-summary">
            <article><span>Saved products</span><strong>${saved.length}</strong></article>
            <article><span>Total saved value</span><strong>${api.formatPrice(saved.reduce((sum, item) => sum + Number(item.productPrice || 0), 0))}</strong></article>
            <article><span>Locations</span><strong>${new Set(saved.map((item) => item.productLocation).filter(Boolean)).size}</strong></article>
          </section>
          <section class="market-grid market-account-grid">
            ${saved.length ? saved.map((item) => api.productCard(toProduct(item), wishlistIds)).join('') : '<div class="market-empty">No saved products yet.</div>'}
          </section>
          <div class="market-modal-shell" data-market-modal hidden></div>
        </section>
      `;
      bindActions();
    };

    function bindActions() {
      page.querySelectorAll('[data-product-wishlist]').forEach((button) => {
        button.addEventListener('click', async () => {
          const productId = button.getAttribute('data-product-wishlist') || '';
          const item = saved.find((entry) => String(entry.productId || '') === productId);
          if (!item) return;
          try {
            await api.toggleWishlist(toProduct(item));
            saved = saved.filter((entry) => String(entry.productId || '') !== productId);
            render();
          } catch (error) {
            window.alert(error.message || 'Could not update your wishlist.');
          }
        });
      });

      page.querySelectorAll('[data-product-order]').forEach((button) => {
        button.addEventListener('click', () => {
          const productId = button.getAttribute('data-product-order') || '';
          const item = saved.find((entry) => String(entry.productId || '') === productId);
          if (item) api.openOrderModal(page, toProduct(item));
        });
      });
    }

    render();
  }

  document.addEventListener('DOMContentLoaded', renderWishlistPage);
})();
