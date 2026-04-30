(function productsUiBootstrap() {
  const fallbackProducts = [
    { id: 'demo-macbook', title: 'MacBook Air M1 2020', price: 450, location: 'Masvingo', category: 'Electronics', subcategory: 'Laptops', imageData: 'images/categories/digital_converted.avif', sellerName: 'Verified Seller', deliveryOption: 'delivery', createdAtMs: Date.now() - 7200000 },
    { id: 'demo-iphone', title: 'iPhone 13 128GB', price: 320, location: 'Harare', category: 'Electronics', subcategory: 'Mobile Phones', imageData: 'images/categories/automech_converted.avif', sellerName: 'Tadiwa Store', deliveryOption: 'pickup', createdAtMs: Date.now() - 14400000 },
    { id: 'demo-sofa', title: 'L-Shaped Sofa', price: 280, location: 'Chitungwiza', category: 'Home & Living', subcategory: 'Furniture', imageData: 'images/categories/furnicher_converted.avif', sellerName: 'Home Hub', deliveryOption: 'delivery', createdAtMs: Date.now() - 18000000 },
    { id: 'demo-car', title: 'Mercedes Benz C200 2015', price: 8500, location: 'Harare', category: 'Vehicles', subcategory: 'Cars', imageData: 'images/categories/automech_converted.avif', sellerName: 'Verified Seller', deliveryOption: 'pickup', createdAtMs: Date.now() - 86400000 },
    { id: 'demo-shoes', title: 'Nike Air Max 270', price: 70, location: 'Bulawayo', category: 'Fashion', subcategory: 'Shoes', imageData: 'images/categories/clothing_converted.avif', sellerName: 'Sneaker House', deliveryOption: 'delivery', createdAtMs: Date.now() - 259200000 }
  ];
  const localProductsKey = 'worklinkup_marketplace_products';
  const localWishlistKey = 'worklinkup_marketplace_wishlist';
  const fallbackCategories = [
    { name: 'Electronics', subcategories: ['Mobile Phones', 'Tablets', 'Laptops', 'Desktops', 'TVs', 'Audio & Headphones', 'Cameras', 'Gaming Consoles', 'Accessories (Chargers, Cables, etc.)', 'Smart Home Devices'] },
    { name: 'Home & Living', subcategories: ['Furniture', 'Kitchen Appliances', 'Home Decor', 'Bedding & Mattresses', 'Lighting', 'Storage & Organization', 'Cleaning Supplies', 'Garden Furniture'] },
    { name: 'Fashion', subcategories: ["Men's Clothing", "Women's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Accessories', 'Jewelry', 'Watches', 'Traditional Wear'] },
    { name: 'Beauty & Health', subcategories: ['Skincare', 'Haircare', 'Makeup', 'Fragrances', 'Personal Care', 'Health Supplements', 'Medical Supplies'] },
    { name: 'Vehicles', subcategories: ['Cars', 'Motorcycles', 'Trucks', 'Bicycles', 'Vehicle Parts', 'Accessories', 'Boats'] },
    { name: 'Property', subcategories: ['Houses for Sale', 'Houses for Rent', 'Apartments', 'Land', 'Commercial Property'] },
    { name: 'Jobs & Services', subcategories: ['Freelance Services', 'Home Services', 'Repairs', 'Tutoring', 'Beauty Services', 'Transport Services', 'Event Services'] },
    { name: 'Agriculture', subcategories: ['Livestock', 'Seeds & Plants', 'Farming Equipment', 'Fertilizers', 'Animal Feed'] },
    { name: 'Sports & Outdoors', subcategories: ['Gym Equipment', 'Outdoor Gear', 'Sportswear', 'Bicycles', 'Camping Equipment'] },
    { name: 'Kids & Baby', subcategories: ['Baby Clothing', 'Toys', 'Strollers', 'Baby Furniture', 'School Supplies'] },
    { name: 'Business & Industrial', subcategories: ['Office Equipment', 'Industrial Machines', 'Construction Tools', 'Packaging Materials', 'Retail Supplies'] },
    { name: 'Food & Catering', subcategories: ['Groceries', 'Baked Goods', 'Catering Services', 'Fast Food', 'Organic Products'] },
    { name: 'Books & Media', subcategories: ['Books', 'Magazines', 'Educational Material', 'Music', 'Movies'] },
    { name: 'Other', subcategories: ['Miscellaneous', 'Bundles', 'Free Items'] }
  ];

  function getBase() {
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  function escapeHtml(value = '') {
    return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getStoredAccount() {
    try { return JSON.parse(localStorage.getItem('softgiggles_account') || 'null'); } catch (error) { return null; }
  }

  function formatPrice(value = 0) {
    return `US$${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function categories() {
    return Array.isArray(window.WorkLinkUpProductCategories) ? window.WorkLinkUpProductCategories : fallbackCategories;
  }

  function resolveImage(src = '') {
    const value = String(src || '').trim();
    if (!value) return `${getBase()}images/logo/joblinks.avif`;
    if (/^(data:|https?:|blob:|\/)/i.test(value)) return value;
    return `${getBase()}${value.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, '')}`;
  }

  function readLocalProducts() {
    try { return JSON.parse(localStorage.getItem(localProductsKey) || '[]'); } catch (error) { return []; }
  }

  function writeLocalProducts(products = []) {
    localStorage.setItem(localProductsKey, JSON.stringify(products));
  }

  function readLocalWishlist() {
    try { return JSON.parse(localStorage.getItem(localWishlistKey) || '[]'); } catch (error) { return []; }
  }

  function writeLocalWishlist(items = []) {
    localStorage.setItem(localWishlistKey, JSON.stringify(items));
  }

  async function authHelper() {
    if (typeof window.ensureWorkLinkAuth !== 'function') return null;
    return window.ensureWorkLinkAuth().catch(() => null);
  }

  async function readImageAsDataUrl(file) {
    if (!file) return '';
    const raw = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.readAsDataURL(file);
    });
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not process image.'));
      img.src = raw;
    });
    const targetAspect = 1.45;
    let sourceWidth = image.width;
    let sourceHeight = image.height;
    let sourceX = 0;
    let sourceY = 0;
    if (image.width / image.height > targetAspect) {
      sourceWidth = Math.round(image.height * targetAspect);
      sourceX = Math.round((image.width - sourceWidth) / 2);
    } else {
      sourceHeight = Math.round(image.width / targetAspect);
      sourceY = Math.round((image.height - sourceHeight) / 2);
    }
    const ratio = Math.min(1, 1400 / sourceWidth, 965 / sourceHeight);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sourceWidth * ratio));
    canvas.height = Math.max(1, Math.round(sourceHeight * ratio));
    const context = canvas.getContext('2d');
    context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/webp', 0.84);
  }

  async function listProducts(options = {}) {
    const helper = await authHelper();
    if (helper?.listMarketplaceProducts) {
      const remote = await helper.listMarketplaceProducts(options).catch(() => []);
      if (remote.length || options.sellerUid) return remote;
    }
    const local = readLocalProducts();
    const all = [...local, ...fallbackProducts];
    return options.sellerUid ? all.filter((item) => item.sellerUid === options.sellerUid) : all;
  }

  async function createProduct(payload) {
    const helper = await authHelper();
    if (helper?.createMarketplaceProduct) return helper.createMarketplaceProduct(payload);
    const account = getStoredAccount();
    const item = { id: `local-${Date.now()}`, sellerUid: account?.uid || 'local', sellerName: account?.name || 'WorkLinkUp seller', createdAtMs: Date.now(), status: 'active', ...payload };
    const products = readLocalProducts();
    products.unshift(item);
    writeLocalProducts(products);
    return item;
  }

  async function toggleWishlist(product) {
    const helper = await authHelper();
    if (helper?.toggleProductWishlist && !String(product.id).startsWith('demo-')) return helper.toggleProductWishlist(product.id);
    const list = readLocalWishlist();
    const exists = list.some((item) => item.productId === product.id);
    writeLocalWishlist(exists ? list.filter((item) => item.productId !== product.id) : [{ productId: product.id, productTitle: product.title, productImageData: product.imageData, productPrice: product.price, productLocation: product.location, createdAtMs: Date.now() }, ...list]);
    return { saved: !exists };
  }

  async function placeOrder(product, payload) {
    const helper = await authHelper();
    if (helper?.placeProductOrder && !String(product.id).startsWith('demo-')) return helper.placeProductOrder(product.id, payload);
    window.alert('Order saved locally for this demo product.');
    return { id: `local-order-${Date.now()}`, productId: product.id, ...payload };
  }

  function productCard(product, wishlistIds = new Set()) {
    const saved = wishlistIds.has(product.id);
    return `
      <article class="market-product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="market-product-image">
          <img src="${escapeHtml(resolveImage(product.imageData || product.image || product.images?.[0]))}" alt="${escapeHtml(product.title)}" loading="lazy" />
          <button type="button" class="market-wish-btn ${saved ? 'is-saved' : ''}" data-product-wishlist="${escapeHtml(product.id)}" aria-label="Add to wishlist"><i class="${saved ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
        </div>
        <div class="market-product-copy">
          <strong>${escapeHtml(formatPrice(product.price))}</strong>
          <h3>${escapeHtml(product.title)}</h3>
          <p>${escapeHtml(product.category || 'Other')} ${product.subcategory ? `· ${escapeHtml(product.subcategory)}` : ''}</p>
          <div><span><i class="fa-solid fa-location-dot"></i>${escapeHtml(product.location || 'Zimbabwe')}</span><span><i class="fa-regular fa-clock"></i>${product.deliveryOption === 'delivery' ? 'Delivery' : 'Pickup'}</span></div>
          <small>${escapeHtml(product.sellerName || 'WorkLinkUp seller')}${Number(product.wishlistCount || product._saveCount || 0) ? ` · ${escapeHtml(Number(product.wishlistCount || product._saveCount || 0))} saves` : ''}${product._saverPreview ? ` · Saved by ${escapeHtml(product._saverPreview)}` : ''}</small>
          <button type="button" class="market-order-btn" data-product-order="${escapeHtml(product.id)}"><i class="fa-solid fa-cart-shopping"></i> Place Order</button>
        </div>
      </article>
    `;
  }

  function shellMarkup(title = 'Online Marketplace') {
    const categoryItems = categories();
    return `
      <section class="market-layout">
        <aside class="market-sidebar">
          <strong>Browse Categories</strong>
          <button type="button" class="is-active" data-market-category=""><i class="fa-solid fa-border-all"></i><span>All Categories</span></button>
          ${categoryItems.map((item) => `<button type="button" data-market-category="${escapeHtml(item.name)}"><i class="fa-solid fa-tag"></i><span>${escapeHtml(item.name)}</span></button>`).join('')}
        </aside>

        <section class="market-main">
          <header class="market-head">
            <div class="market-head-copy">
              <h1>${escapeHtml(title)}</h1>
              <p>Buy and sell new or used items in your community.</p>
            </div>
            <div class="market-head-actions">
              <button type="button" class="market-sell-btn" data-market-add-item>+ Sell an Item</button>
            </div>
          </header>

          <div class="market-tools">
            <label><i class="fa-solid fa-magnifying-glass"></i><input type="search" data-market-search placeholder="Search for anything..." /></label>
            <select data-market-location><option value="">All Locations</option><option>Harare</option><option>Bulawayo</option><option>Masvingo</option><option>Chitungwiza</option></select>
            <select data-market-category-select><option value="">All Categories</option>${categoryItems.map((item) => `<option>${escapeHtml(item.name)}</option>`).join('')}</select>
            <select data-market-sort><option value="newest">Newest First</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option></select>
          </div>

          <div class="market-category-rail">${categoryItems.slice(0, 9).map((item) => `<button type="button" data-market-category="${escapeHtml(item.name)}"><i class="fa-solid fa-tag"></i><span>${escapeHtml(item.name.split(' ')[0])}</span></button>`).join('')}<button type="button"><i class="fa-solid fa-ellipsis"></i><span>More</span></button></div>
          <section class="market-featured"><strong><i class="fa-solid fa-star"></i> Recommended for you</strong><button type="button">View all</button></section>
          <section class="market-grid" data-market-grid></section>
        </section>
      </section>
      <div class="market-modal-shell" data-market-modal hidden></div>
    `;
  }

  async function renderProductsPage() {
    const page = document.querySelector('[data-products-page]');
    if (!page) return;
    page.innerHTML = shellMarkup();
    const account = getStoredAccount();
    let products = await listProducts();
    const wishlist = await getWishlistIds();
    const state = { query: '', category: '', location: '', sort: 'newest' };
    const grid = page.querySelector('[data-market-grid]');
    const render = () => {
      let items = products.filter((item) => {
        const q = state.query.toLowerCase();
        return (!q || [item.title, item.category, item.subcategory, item.location].join(' ').toLowerCase().includes(q))
          && (!state.category || item.category === state.category)
          && (!state.location || item.location === state.location);
      });
      if (state.sort === 'price-low') items.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      else if (state.sort === 'price-high') items.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      else items.sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
      grid.innerHTML = items.map((item) => productCard(item, wishlist)).join('') || '<div class="market-empty">No products found.</div>';
    };
    bindMarketplaceEvents(page, () => products, (next) => { products = next; render(); }, state, render);
    render();
    page.querySelectorAll('[data-market-add-item]').forEach((button) => button.addEventListener('click', () => {
      if (!account?.uid) {
        window.alert('Please sign in to sell an item.');
        return;
      }
      openAddItemModal(page, async (item) => { products.unshift(item); render(); });
    }));
  }

  async function getWishlistIds() {
    const helper = await authHelper();
    if (helper?.listProductWishlistForUser) {
      const account = getStoredAccount();
      const remote = account?.uid ? await helper.listProductWishlistForUser(account.uid).catch(() => []) : [];
      return new Set(remote.map((item) => item.productId));
    }
    return new Set(readLocalWishlist().map((item) => item.productId));
  }

  function bindMarketplaceEvents(scope, getProducts, setProducts, state, render) {
    scope.querySelector('[data-market-search]')?.addEventListener('input', (event) => { state.query = event.target.value.trim(); render(); });
    scope.querySelector('[data-market-location]')?.addEventListener('change', (event) => { state.location = event.target.value; render(); });
    scope.querySelector('[data-market-category-select]')?.addEventListener('change', (event) => { state.category = event.target.value; render(); });
    scope.querySelector('[data-market-sort]')?.addEventListener('change', (event) => { state.sort = event.target.value; render(); });
    scope.querySelectorAll('[data-market-category]').forEach((button) => button.addEventListener('click', () => { state.category = button.getAttribute('data-market-category') || ''; scope.querySelectorAll('[data-market-category]').forEach((item) => item.classList.toggle('is-active', item === button)); render(); }));
    scope.addEventListener('click', async (event) => {
      const wish = event.target.closest('[data-product-wishlist]');
      if (wish) {
        const product = getProducts().find((item) => item.id === wish.getAttribute('data-product-wishlist'));
        if (product) { await toggleWishlist(product); window.location.reload(); }
      }
      const order = event.target.closest('[data-product-order]');
      if (order) {
        const product = getProducts().find((item) => item.id === order.getAttribute('data-product-order'));
        if (product) openOrderModal(scope, product);
      }
    });
  }

  function openOrderModal(scope, product) {
    const modal = scope.querySelector('[data-market-modal]') || document.createElement('div');
    modal.hidden = false;
    modal.className = 'market-modal-shell';
    modal.innerHTML = `<form class="market-modal-card" data-order-form><button type="button" data-market-close>×</button><h2>Place Order</h2><p>${escapeHtml(product.title)} · ${escapeHtml(formatPrice(product.price))}</p><label><span>Delivery location</span><input name="deliveryLocation" required placeholder="Address, suburb or pickup notes" /></label><label><span>Offer / negotiation price</span><input name="offerPrice" type="number" min="1" value="${escapeHtml(product.price)}" required /></label><label><span>Optional message</span><textarea name="message" placeholder="Ask a question or add delivery notes"></textarea></label><small>${product.deliveryOption === 'delivery' ? 'Seller offers delivery.' : 'Pickup only.'}</small><button type="submit">Send Order</button></form>`;
    if (!modal.parentElement) document.body.appendChild(modal);
    modal.querySelector('[data-market-close]')?.addEventListener('click', () => { modal.hidden = true; });
    modal.querySelector('[data-order-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.currentTarget).entries());
      try { await placeOrder(product, data); modal.hidden = true; window.alert('Order sent.'); } catch (error) { window.alert(error.message || 'Could not place order.'); }
    });
  }

  function openAddItemModal(scope, onCreate) {
    const modal = scope.querySelector('[data-market-modal]') || document.createElement('div');
    modal.hidden = false;
    modal.className = 'market-modal-shell';
    modal.innerHTML = `<form class="market-modal-card" data-add-product-form style="max-width:900px"><button type="button" data-market-close>×</button><h2>Add Item</h2>
      <label>
        <span>Product image</span>
        <div class="market-image-dropzone" data-product-image-wrapper style="position:relative;border-radius:12px;border:1px dashed rgba(15,23,42,0.08);min-height:160px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#f7fbff 0%,#eef6ff 100%);">
          <input type="file" accept="image/*" data-product-image style="position:absolute;inset:0;opacity:0;cursor:pointer;" />
          <div class="market-image-placeholder" data-product-image-placeholder style="text-align:center;color:#617087;pointer-events:none">
            <svg width="72" height="44" viewBox="0 0 72 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 32C10 24 20 24 30 32C40 40 50 40 60 32C66 27 72 28 72 28V44H0V32Z" fill="#E6F0FF"/></svg>
            <div style="margin-top:8px;font-size:13px;">Tap or drop to upload — you will be asked to crop</div>
          </div>
          <div data-product-image-preview class="market-image-preview" hidden style="position:absolute;inset:8px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:#fff"><img alt="Preview" style="max-width:100%;height:auto;display:block" /></div>
        </div>
      </label>
      <label><span>Title</span><input name="title" required /></label>
      <label><span>Price</span><input name="price" type="number" min="1" required /></label>
      <label><span>Category</span><select name="category">${categories().map((item) => `<option>${escapeHtml(item.name)}</option>`).join('')}</select></label>
      <label><span>Location</span>
        <select name="location" required>
          <option value="">Select a location</option>
          ${(() => {
            try {
              const groups = Array.isArray(window.ZIMBABWE_LOCATION_GROUPS) ? window.ZIMBABWE_LOCATION_GROUPS : [];
              const cities = [...new Map(groups.map(g => [g.city, g.city]))].map(c => `<option>${escapeHtml(c)}</option>`).join('');
              return cities;
            } catch (e) { return `<option>Harare</option><option>Bulawayo</option><option>Masvingo</option>`; }
          })()}
        </select>
      </label>
      <label><span>Description</span><textarea name="description"></textarea></label>
      <label><span>Delivery option</span><select name="deliveryOption"><option value="delivery">Delivery available</option><option value="pickup">Pickup only</option></select></label>
      <button type="submit">Publish Item</button></form>`;
    if (!modal.parentElement) document.body.appendChild(modal);
    modal.querySelector('[data-market-close]')?.addEventListener('click', () => { modal.hidden = true; });

    // image input: show preview and open crop modal when available
    const fileInputEl = modal.querySelector('[data-product-image]');
    const previewHost = modal.querySelector('[data-product-image-preview]');
    const previewImg = previewHost?.querySelector('img');
    if (fileInputEl) {
      fileInputEl.addEventListener('change', async () => {
        const file = fileInputEl.files?.[0];
        if (!file) return;
        try {
          const sourceDataUrl = await readImageAsDataUrl(file);
          let cropped = sourceDataUrl;
          if (typeof window.openProviderPostCropModal === 'function') {
            try {
              cropped = await window.openProviderPostCropModal(sourceDataUrl);
            } catch (err) {
              // if user canceled crop, keep original
              if (err?.message === 'Crop cancelled.') return;
            }
          }
          modal.dataset.croppedImage = String(cropped || '');
          if (previewHost && previewImg) {
            previewHost.hidden = false;
            modal.querySelector('[data-product-image-placeholder]')?.setAttribute('hidden', '');
            previewImg.src = cropped;
          }
        } catch (error) {
          window.alert(error.message || 'Could not process that image.');
        } finally {
          fileInputEl.value = '';
        }
      });
    }

    modal.querySelector('[data-add-product-form]')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = Object.fromEntries(new FormData(form).entries());
      // prefer cropped image if available
      if (modal.dataset.croppedImage) data.imageData = modal.dataset.croppedImage;
      else {
        const file = modal.querySelector('[data-product-image]')?.files?.[0];
        if (file) data.imageData = await readImageAsDataUrl(file);
      }
      try { const item = await createProduct(data); modal.hidden = true; onCreate?.(item); } catch (error) { window.alert(error.message || 'Could not publish product.'); }
    });
  }

  async function renderWishlistPage() {
    const page = document.querySelector('[data-wishlist-page]');
    if (!page) return;
    const helper = await authHelper();
    const account = getStoredAccount();
    const saved = helper?.listProductWishlistForUser && account?.uid ? await helper.listProductWishlistForUser(account.uid).catch(() => []) : readLocalWishlist();
    page.innerHTML = `<section class="market-main is-standalone"><header class="market-head"><h1>Wishlist</h1><p>Products you saved from the marketplace.</p></header><section class="market-grid">${saved.map((item) => productCard({ id: item.productId, title: item.productTitle, price: item.productPrice, location: item.productLocation, imageData: item.productImageData, category: 'Saved' }, new Set([item.productId]))).join('') || '<div class="market-empty">No saved products yet.</div>'}</section></section>`;
    page.onclick = async (event) => {
      const wishButton = event.target.closest('[data-product-wishlist]');
      const orderButton = event.target.closest('[data-product-order]');
      const productId = wishButton?.getAttribute('data-product-wishlist') || orderButton?.getAttribute('data-product-order');
      const item = saved.find((entry) => entry.productId === productId);
      if (!item) return;
      const product = { id: item.productId, title: item.productTitle, imageData: item.productImageData, price: item.productPrice, location: item.productLocation, category: 'Saved' };
      if (wishButton) {
        await toggleWishlist(product);
        renderWishlistPage();
      } else if (orderButton) {
        openOrderModal(page, product);
      }
    };
  }

  async function renderProfileMarketplaceTabs() {
    const page = document.querySelector('[data-client-profile-page]');
    if (!page) return;
    window.setTimeout(async () => {
      let tabs = page.querySelector('.provider-profile-gallery-tabs');
      // Ensure a gallery head exists and is placed above gallery content (like provider page does).
      if (!page.querySelector('.provider-profile-gallery-head')) {
        const insertBeforeEl = page.querySelector('.provider-profile-gallery') || page.querySelector('.provider-profile-hero') || page.firstElementChild || page;
        const head = document.createElement('section');
        head.className = 'provider-profile-gallery-head';
        head.innerHTML = `<div class="provider-profile-gallery-tabs"></div>`;
        insertBeforeEl.parentNode.insertBefore(head, insertBeforeEl);
      }
      tabs = page.querySelector('.provider-profile-gallery-tabs');
      if (tabs.querySelector('[data-client-profile-tab="shop"]')) return;

      // Add a prominent two-button main tab row (Jobs / Products) above the gallery tabs for quick switching
      if (!page.querySelector('.provider-profile-main-tabs')) {
        const galleryHead = page.querySelector('.provider-profile-gallery-head');
        const mainTabs = document.createElement('div');
        mainTabs.className = 'provider-profile-main-tabs';
        mainTabs.innerHTML = `<button type="button" class="provider-profile-main-tab" data-client-profile-tab="jobs"><span>Jobs</span></button><button type="button" class="provider-profile-main-tab" data-client-profile-tab="shop"><span>Products</span></button>`;
        galleryHead.insertAdjacentElement('afterbegin', mainTabs);
      }
      const account = getStoredAccount();
      ['jobs', 'shop', 'orders', 'wishlist'].forEach((key) => tabs.insertAdjacentHTML('beforeend', `<button type="button" class="provider-profile-gallery-tab" data-client-profile-tab="${key}"><span>${key[0].toUpperCase()}${key.slice(1)}</span></button>`));
      page.insertAdjacentHTML('beforeend', `<section class="provider-profile-gallery client-profile-gallery" data-client-profile-panel="jobs" hidden><a class="market-profile-link" href="${getBase()}pages/job-giver-profile.html">Open Jobs and Bids</a></section><section class="provider-profile-gallery client-profile-gallery market-profile-panel" data-client-profile-panel="shop" hidden><button type="button" class="market-floating-add" data-market-add-item>+ Add Item</button><div class="market-grid" data-profile-shop-grid></div><div class="market-modal-shell" data-market-modal hidden></div></section><section class="provider-profile-gallery client-profile-gallery market-profile-panel" data-client-profile-panel="orders" hidden><div data-profile-orders></div></section><section class="provider-profile-gallery client-profile-gallery market-profile-panel" data-client-profile-panel="wishlist" hidden><a class="market-profile-link" href="${getBase()}pages/wishlist.html">Open Wishlist</a></section>`);
      let products = account?.uid ? await listProducts({ sellerUid: account.uid }) : [];
      const helper = await authHelper();
      if (helper?.listProductWishlistSaves && products.length) {
        products = await Promise.all(products.map(async (product) => {
          const saves = await helper.listProductWishlistSaves(product.id).catch(() => []);
          return {
            ...product,
            _saveCount: saves.length,
            _saverPreview: saves.slice(0, 3).map((save) => save.buyerName).filter(Boolean).join(', ')
          };
        }));
      }
      const shopGrid = page.querySelector('[data-profile-shop-grid]');
      if (shopGrid) shopGrid.innerHTML = products.map((item) => productCard(item)).join('') || '<div class="market-empty">No products listed yet.</div>';
      const orders = helper?.listProductOrdersForUser && account?.uid ? await helper.listProductOrdersForUser(account.uid).catch(() => []) : [];
      const ordersHost = page.querySelector('[data-profile-orders]');
      if (ordersHost) ordersHost.innerHTML = orders.map((order) => `<article class="market-order-row"><strong>${escapeHtml(order.productTitle)}</strong><span>${escapeHtml(order.buyerName || order.sellerName || 'Marketplace user')}</span><span>${escapeHtml(formatPrice(order.offerPrice))}</span><em>${escapeHtml(order.status || 'pending')}</em><small>${escapeHtml(order.deliveryMethod || 'pickup')} · ${escapeHtml(order.deliveryLocation || 'No location')}</small></article>`).join('') || '<div class="market-empty">No product orders yet.</div>';
      page.querySelector('[data-market-add-item]')?.addEventListener('click', () => openAddItemModal(page, (item) => { shopGrid.insertAdjacentHTML('afterbegin', productCard(item)); }));
      page.querySelectorAll('[data-client-profile-tab]').forEach((tab) => tab.addEventListener('click', () => {
        const name = tab.getAttribute('data-client-profile-tab');
        page.querySelectorAll('[data-client-profile-tab]').forEach((item) => item.classList.toggle('is-active', item === tab));
        page.querySelectorAll('[data-client-profile-panel]').forEach((panel) => { const active = panel.getAttribute('data-client-profile-panel') === name; panel.hidden = !active; panel.classList.toggle('is-active-gallery', active); });
      }));
      // Activate Jobs tab by default so the user sees the main Jobs panel immediately
      const defaultTab = page.querySelector('[data-client-profile-tab="jobs"]');
      if (defaultTab) defaultTab.click();
    }, 900);
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderProductsPage();
    renderWishlistPage();
    renderProfileMarketplaceTabs();
  });
})();
