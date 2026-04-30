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
  const localOrdersKey = 'worklinkup_marketplace_orders';
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

  function locationOptionsMarkup(selected = '') {
    const groups = Array.isArray(window.WorkLinkUpZimbabweLocations) ? window.WorkLinkUpZimbabweLocations : [];
    if (!groups.length) {
      return ['Harare', 'Bulawayo', 'Masvingo', 'Chitungwiza', 'Mutare', 'Gweru']
        .map((city) => `<option ${selected === city ? 'selected' : ''}>${escapeHtml(city)}</option>`)
        .join('');
    }
    return groups.map((group) => {
      const province = String(group.province || '').trim();
      const cities = Array.isArray(group.cities) ? group.cities : [];
      return `<optgroup label="${escapeHtml(province)}">${cities.map((city) => {
        const value = String(city || '').trim();
        return `<option value="${escapeHtml(value)}" ${selected === value ? 'selected' : ''}>${escapeHtml(value)}</option>`;
      }).join('')}</optgroup>`;
    }).join('');
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

  function readLocalOrders() {
    try { return JSON.parse(localStorage.getItem(localOrdersKey) || '[]'); } catch (error) { return []; }
  }

  function writeLocalOrders(items = []) {
    localStorage.setItem(localOrdersKey, JSON.stringify(items));
  }

  async function authHelper() {
    if (typeof window.ensureWorkLinkAuth !== 'function') return null;
    return window.ensureWorkLinkAuth().catch(() => null);
  }

  function withTimeout(promise, fallback = null, ms = 450) {
    return Promise.race([
      promise,
      new Promise((resolve) => window.setTimeout(() => resolve(fallback), ms))
    ]);
  }

  async function readFileDataUrl(file) {
    if (!file) return '';
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read image.'));
      reader.readAsDataURL(file);
    });
  }

  async function readImageAsDataUrl(file) {
    const raw = await readFileDataUrl(file);
    if (!raw) return '';
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

  function loadImageElement(src = '') {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Could not process that image.'));
      image.src = src;
    });
  }

  async function cropImageDataUrl(sourceDataUrl = '', cropRect = {}, displayedSize = {}) {
    const sourceImage = await loadImageElement(sourceDataUrl);
    const displayWidth = Math.max(1, Number(displayedSize.width || sourceImage.naturalWidth || sourceImage.width || 1));
    const displayHeight = Math.max(1, Number(displayedSize.height || sourceImage.naturalHeight || sourceImage.height || 1));
    const scaleX = (sourceImage.naturalWidth || sourceImage.width) / displayWidth;
    const scaleY = (sourceImage.naturalHeight || sourceImage.height) / displayHeight;
    const sx = Math.max(0, Math.round(Number(cropRect.x || 0) * scaleX));
    const sy = Math.max(0, Math.round(Number(cropRect.y || 0) * scaleY));
    const sw = Math.max(1, Math.round(Number(cropRect.width || displayWidth) * scaleX));
    const sh = Math.max(1, Math.round(Number(cropRect.height || displayHeight) * scaleY));
    const outputScale = Math.min(1, 1600 / sw, 1600 / sh);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw * outputScale));
    canvas.height = Math.max(1, Math.round(sh * outputScale));
    const context = canvas.getContext('2d');
    if (!context) return sourceDataUrl;
    context.drawImage(sourceImage, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.86);
  }

  function openProductCropModal(sourceDataUrl = '') {
    if (typeof window.openProviderPostCropModal === 'function') return window.openProviderPostCropModal(sourceDataUrl);
    return new Promise((resolve, reject) => {
      const shell = document.createElement('div');
      shell.className = 'provider-post-crop-shell';
      shell.innerHTML = `
        <div class="provider-post-crop-panel" role="dialog" aria-modal="true" aria-label="Crop product image">
          <div class="provider-post-crop-head">
            <div><span>Crop product image</span><h3>Drag the edges or corners</h3></div>
            <button type="button" class="provider-post-crop-close" data-provider-crop-cancel aria-label="Close crop modal">x</button>
          </div>
          <div class="provider-post-crop-stage">
            <div class="provider-post-crop-frame" data-provider-crop-frame>
              <img src="${escapeHtml(sourceDataUrl)}" alt="Selected product preview" data-provider-crop-image />
              <div class="provider-post-crop-box" data-provider-crop-box>
                <span class="provider-post-crop-grid"></span>
                ${['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => `<button type="button" class="provider-post-crop-handle is-${handle}" data-crop-handle="${handle}" aria-label="Resize crop ${handle}"></button>`).join('')}
              </div>
            </div>
          </div>
          <div class="provider-post-crop-actions">
            <button type="button" class="provider-post-crop-secondary" data-provider-crop-cancel>Cancel</button>
            <button type="button" class="provider-post-crop-primary" data-provider-crop-finish>Finish cropping</button>
          </div>
        </div>`;
      document.body.appendChild(shell);
      document.body.classList.add('job-modal-open');

      const frame = shell.querySelector('[data-provider-crop-frame]');
      const image = shell.querySelector('[data-provider-crop-image]');
      const box = shell.querySelector('[data-provider-crop-box]');
      const minSize = 64;
      let crop = { x: 0, y: 0, width: 0, height: 0 };
      let dragState = null;
      const closeModal = () => { shell.remove(); document.body.classList.remove('job-modal-open'); };
      const getBounds = () => ({ width: Math.max(1, image?.clientWidth || frame?.clientWidth || 1), height: Math.max(1, image?.clientHeight || frame?.clientHeight || 1) });
      const renderCrop = () => {
        if (!(box instanceof HTMLElement)) return;
        box.style.left = `${crop.x}px`;
        box.style.top = `${crop.y}px`;
        box.style.width = `${crop.width}px`;
        box.style.height = `${crop.height}px`;
      };
      const initializeCrop = () => {
        const bounds = getBounds();
        crop.width = Math.max(minSize, Math.round(bounds.width * 0.82));
        crop.height = Math.max(minSize, Math.round(bounds.height * 0.72));
        crop.x = Math.round((bounds.width - crop.width) / 2);
        crop.y = Math.round((bounds.height - crop.height) / 2);
        renderCrop();
      };
      const getPointer = (event) => {
        const point = event.touches?.[0] || event.changedTouches?.[0] || event;
        return { x: Number(point.clientX || 0), y: Number(point.clientY || 0) };
      };
      const stopDrag = () => {
        dragState = null;
        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', onDrag);
        window.removeEventListener('touchend', stopDrag);
      };
      const startDrag = (event, handle = 'move') => {
        event.preventDefault();
        dragState = { handle, pointer: getPointer(event), crop: { ...crop } };
        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchmove', onDrag, { passive: false });
        window.addEventListener('touchend', stopDrag);
      };
      function onDrag(event) {
        if (!dragState) return;
        event.preventDefault();
        const bounds = getBounds();
        const pointer = getPointer(event);
        const dx = pointer.x - dragState.pointer.x;
        const dy = pointer.y - dragState.pointer.y;
        const original = dragState.crop;
        const handle = dragState.handle;
        let next = { ...original };
        if (handle === 'move') {
          next.x = Math.min(Math.max(0, original.x + dx), bounds.width - original.width);
          next.y = Math.min(Math.max(0, original.y + dy), bounds.height - original.height);
        } else {
          if (handle.includes('w')) {
            const nextX = Math.min(Math.max(0, original.x + dx), original.x + original.width - minSize);
            next.width = original.width + (original.x - nextX);
            next.x = nextX;
          }
          if (handle.includes('e')) next.width = Math.min(Math.max(minSize, original.width + dx), bounds.width - original.x);
          if (handle.includes('n')) {
            const nextY = Math.min(Math.max(0, original.y + dy), original.y + original.height - minSize);
            next.height = original.height + (original.y - nextY);
            next.y = nextY;
          }
          if (handle.includes('s')) next.height = Math.min(Math.max(minSize, original.height + dy), bounds.height - original.y);
        }
        crop = next;
        renderCrop();
      }
      image?.addEventListener('load', initializeCrop, { once: true });
      if (image?.complete) window.requestAnimationFrame(initializeCrop);
      box?.addEventListener('mousedown', (event) => { if (!event.target?.hasAttribute?.('data-crop-handle')) startDrag(event, 'move'); });
      box?.addEventListener('touchstart', (event) => { if (!event.target?.hasAttribute?.('data-crop-handle')) startDrag(event, 'move'); }, { passive: false });
      shell.querySelectorAll('[data-crop-handle]').forEach((button) => {
        const handle = button.getAttribute('data-crop-handle') || 'se';
        button.addEventListener('mousedown', (event) => startDrag(event, handle));
        button.addEventListener('touchstart', (event) => startDrag(event, handle), { passive: false });
      });
      shell.querySelectorAll('[data-provider-crop-cancel]').forEach((button) => button.addEventListener('click', () => { closeModal(); reject(new Error('Crop cancelled.')); }));
      shell.querySelector('[data-provider-crop-finish]')?.addEventListener('click', async () => {
        try {
          const cropped = await cropImageDataUrl(sourceDataUrl, crop, getBounds());
          closeModal();
          resolve(cropped);
        } catch (error) {
          closeModal();
          reject(error);
        }
      });
    });
  }

  async function listProducts(options = {}) {
    const local = readLocalProducts();
    const fallback = options.sellerUid ? local.filter((item) => item.sellerUid === options.sellerUid) : [...local, ...fallbackProducts];
    const helper = await withTimeout(authHelper(), null);
    if (helper?.listMarketplaceProducts) {
      const remote = await helper.listMarketplaceProducts(options).catch(() => []);
      if (remote.length || options.sellerUid) return remote;
    }
    return fallback;
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
    const productId = String(product.id || '');
    const canUseRemote = !productId.startsWith('demo-') && !productId.startsWith('local-');
    const helper = canUseRemote ? await authHelper() : null;
    if (helper?.toggleProductWishlist) return helper.toggleProductWishlist(product.id);
    const list = readLocalWishlist();
    const exists = list.some((item) => item.productId === product.id);
    const account = getStoredAccount();
    writeLocalWishlist(exists ? list.filter((item) => item.productId !== product.id) : [{
      productId: product.id,
      sellerUid: product.sellerUid || '',
      sellerName: product.sellerName || '',
      productTitle: product.title,
      productImageData: product.imageData,
      productPrice: product.price,
      productLocation: product.location,
      buyerUid: account?.uid || 'local-buyer',
      buyerName: account?.name || 'Local buyer',
      buyerPhone: account?.phone || '',
      createdAtMs: Date.now()
    }, ...list]);
    return { saved: !exists };
  }

  async function placeOrder(product, payload) {
    const productId = String(product.id || '');
    const canUseRemote = !productId.startsWith('demo-') && !productId.startsWith('local-');
    const helper = canUseRemote ? await authHelper() : null;
    if (helper?.placeProductOrder) return helper.placeProductOrder(product.id, payload);
    const account = getStoredAccount();
    const order = {
      id: `local-order-${Date.now()}`,
      productId: product.id,
      productTitle: product.title || '',
      productImageData: product.imageData || product.image || product.images?.[0] || '',
      productCategory: product.category || '',
      sellerUid: product.sellerUid || '',
      sellerName: product.sellerName || 'Seller',
      buyerUid: account?.uid || 'local-buyer',
      buyerName: account?.name || 'Local buyer',
      buyerPhone: account?.phone || '',
      deliveryLocation: String(payload.deliveryLocation || '').trim(),
      deliveryMethod: String(product.deliveryOption || 'pickup').trim(),
      offerPrice: Number(payload.offerPrice || product.price || 0),
      message: String(payload.message || '').trim(),
      status: 'pending',
      createdAtMs: Date.now(),
      updatedAtMs: Date.now()
    };
    const orders = readLocalOrders();
    orders.unshift(order);
    writeLocalOrders(orders);
    return order;
  }

  async function listProductOrdersForUser(uid = getStoredAccount()?.uid) {
    const helper = await withTimeout(authHelper(), null);
    if (helper?.listProductOrdersForUser && uid) {
      const remote = await helper.listProductOrdersForUser(uid).catch(() => []);
      if (remote.length) return remote;
    }
    return readLocalOrders()
      .filter((item) => !uid || String(item.buyerUid || '') === String(uid) || String(item.sellerUid || '') === String(uid))
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
  }

  async function listWishlistForUser(uid = getStoredAccount()?.uid) {
    const helper = await withTimeout(authHelper(), null);
    if (helper?.listProductWishlistForUser && uid) {
      const remote = await helper.listProductWishlistForUser(uid).catch(() => []);
      if (remote.length) return remote;
    }
    return readLocalWishlist()
      .filter((item) => !uid || !item.buyerUid || String(item.buyerUid || '') === String(uid))
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
  }

  async function listWishlistSavesForSeller(sellerUid = getStoredAccount()?.uid) {
    if (!sellerUid) return [];
    const products = await listProducts({ sellerUid });
    const helper = await withTimeout(authHelper(), null);
    const rows = [];
    for (const product of products) {
      const productId = String(product.id || '');
      const saves = helper?.listProductWishlistSaves && !productId.startsWith('demo-') && !productId.startsWith('local-')
        ? await helper.listProductWishlistSaves(product.id).catch(() => [])
        : readLocalWishlist().filter((item) => String(item.productId || '') === String(product.id));
      saves.forEach((save) => rows.push({
        ...save,
        productId: product.id,
        productTitle: save.productTitle || product.title || '',
        productImageData: save.productImageData || product.imageData || product.image || product.images?.[0] || '',
        productPrice: Number(save.productPrice || product.price || 0),
        productLocation: save.productLocation || product.location || '',
        sellerUid
      }));
    }
    return rows.sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
  }

  function productCard(product, wishlistIds = new Set()) {
    const saved = wishlistIds.has(product.id);
    return `
      <article class="market-product-card" data-product-id="${escapeHtml(product.id)}">
        <div class="market-product-image">
          <img src="${escapeHtml(resolveImage(product.imageData || product.image || product.images?.[0]))}" alt="${escapeHtml(product.title)}" loading="lazy" />
          <button type="button" class="market-wish-btn ${saved ? 'is-saved' : ''}" data-product-wishlist="${escapeHtml(product.id)}" aria-label="${saved ? 'Remove from wishlist' : 'Add to wishlist'}"><i class="${saved ? 'fa-solid' : 'fa-regular'} fa-heart"></i></button>
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
            <select data-market-location><option value="">All Locations</option>${locationOptionsMarkup()}</select>
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
    let wishlist = await getWishlistIds();
    const state = { query: '', category: '', location: '', sort: 'newest', wishlistIds: wishlist };
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
      grid.innerHTML = items.map((item) => productCard(item, state.wishlistIds)).join('') || '<div class="market-empty">No products found.</div>';
    };
    bindMarketplaceEvents(page, () => products, (next) => { products = next; render(); }, state, render, wishlist);
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
    const helper = await withTimeout(authHelper(), null);
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
        if (product) {
          try {
            const result = await toggleWishlist(product);
            const saved = Boolean(result?.saved);
            const id = String(product.id || '');
            if (state?.wishlistIds instanceof Set) {
              if (saved) state.wishlistIds.add(id);
              else state.wishlistIds.delete(id);
            }
            wish.classList.toggle('is-saved', saved);
            wish.setAttribute('aria-label', saved ? 'Remove from wishlist' : 'Add to wishlist');
            const icon = wish.querySelector('i');
            if (icon) icon.className = `${saved ? 'fa-solid' : 'fa-regular'} fa-heart`;
            if (typeof render === 'function') render();
          } catch (error) {
            window.alert(error.message || 'Could not update your wishlist.');
          }
        }
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
    modal.innerHTML = `<form class="market-modal-card market-add-product-card" data-add-product-form>
      <button type="button" data-market-close>×</button>
      <div class="market-modal-title">
        <span>Marketplace seller</span>
        <h2>Add product to My Shop</h2>
        <p>Upload a clear product photo, choose where the product is available, and publish it to buyers.</p>
      </div>
      <label class="market-image-field">
        <span>Product image</span>
        <div class="market-image-dropzone" data-product-image-wrapper>
          <input type="file" accept="image/*" data-product-image />
          <div class="market-wave-layer" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="market-image-placeholder" data-product-image-placeholder>
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <strong>Upload product photo</strong>
            <small>Choose an image and crop it before publishing.</small>
          </div>
          <div data-product-image-preview class="market-image-preview" hidden><img alt="Product preview" /></div>
        </div>
      </label>
      <div class="market-add-form-grid">
        <label><span>Product title</span><input name="title" required placeholder="e.g. iPhone 13 128GB" /></label>
        <label><span>Price</span><input name="price" type="number" min="1" required placeholder="US$" /></label>
        <label><span>Category</span><select name="category">${categories().map((item) => `<option>${escapeHtml(item.name)}</option>`).join('')}</select></label>
        <label><span>Location</span>
        <select name="location" required>
          <option value="">Select a location</option>
          ${locationOptionsMarkup()}
        </select>
        </label>
      </div>
      <label><span>Description</span><textarea name="description" placeholder="Condition, size, brand, and anything the buyer should know"></textarea></label>
      <label><span>Delivery option</span><select name="deliveryOption"><option value="delivery">Delivery available</option><option value="pickup">Pickup only</option></select></label>
      <button type="submit">Publish Item</button>
    </form>`;
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
          const sourceDataUrl = await readFileDataUrl(file);
          const cropped = await openProductCropModal(sourceDataUrl).catch((error) => {
            if (error?.message === 'Crop cancelled.') return '';
            throw error;
          });
          if (!cropped) return;
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

  window.WorkLinkUpMarketplace = {
    escapeHtml,
    formatPrice,
    resolveImage,
    getStoredAccount,
    listProducts,
    createProduct,
    toggleWishlist,
    placeOrder,
    listProductOrdersForUser,
    listWishlistForUser,
    listWishlistSavesForSeller,
    getWishlistIds,
    productCard,
    openAddItemModal,
    openOrderModal,
    bindMarketplaceEvents
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderProductsPage();
  });
})();
