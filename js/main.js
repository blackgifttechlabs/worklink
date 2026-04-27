// Nav mega dropdown hover logic
document.addEventListener('DOMContentLoaded', () => {
  const appLoader = document.getElementById('app-loader');

  function hideAppLoader() {
    if (!appLoader || appLoader.dataset.hidden === 'true') return;
    appLoader.dataset.hidden = 'true';
    appLoader.classList.add('is-hidden');
    window.setTimeout(() => {
      appLoader.remove();
    }, 420);
  }

  if (appLoader) {
    window.addEventListener('load', () => {
      window.setTimeout(hideAppLoader, 450);
    }, { once: true });
    window.setTimeout(hideAppLoader, 3000);
  }

  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.querySelector('.cookie-accept');
  const cookieDecline = document.querySelector('.cookie-decline');
  const consentKey = 'softgiggles_cookie_consent';

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.add('is-hidden');
    window.setTimeout(() => {
      cookieBanner.hidden = true;
    }, 240);
  }

  function saveCookieChoice(choice) {
    try {
      localStorage.setItem(consentKey, choice);
    } catch (error) {
      // Ignore storage errors and keep the UI usable.
    }
    document.cookie = `softgiggles_cookie_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    hideCookieBanner();
  }

  if (cookieBanner) {
    let savedChoice = null;
    try {
      savedChoice = localStorage.getItem(consentKey);
    } catch (error) {
      savedChoice = null;
    }

    if (!savedChoice) {
      cookieBanner.hidden = false;
      window.requestAnimationFrame(() => {
        cookieBanner.classList.add('is-visible');
      });
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => saveCookieChoice('accepted'));
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => saveCookieChoice('declined'));
  }

  let searchModal = document.getElementById('mobile-search-overlay');
  let searchSuggestions = document.getElementById('search-suggestions');
  let searchModalInput = searchModal ? searchModal.querySelector('input[data-search-context="overlay"]') : null;
  let searchModalResults = document.getElementById('mobile-search-results');
  let activeSearchInput = null;
  let searchSuggestionRequestId = 0;
  let searchModalRequestId = 0;
  let providerSearchCache = [];
  let providerSearchPromise = null;
  let serviceSearchCache = [];

  if (!searchSuggestions) {
    document.body.insertAdjacentHTML('beforeend', `<div class="search-suggestions" id="search-suggestions" hidden></div>`);
    searchSuggestions = document.getElementById('search-suggestions');
  }

  function hideSearchSuggestions() {
    if (!searchSuggestions) return;
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = '';
    searchSuggestions.classList.remove('is-visible');
    activeSearchInput = null;
  }

  function normalizeSearchTerms(values = []) {
    return values
      .flatMap((value) => {
        if (Array.isArray(value)) return normalizeSearchTerms(value);
        return [String(value || '').trim()];
      })
      .filter(Boolean);
  }

  function normalizeSkillLabels(values = []) {
    if (!Array.isArray(values)) return [];
    return values
      .map((entry) => String(entry?.name || entry?.skill || '').trim())
      .filter(Boolean);
  }

  function normalizeProviderServiceLabels(values = []) {
    if (!Array.isArray(values)) return [];
    return values
      .flatMap((entry) => [
        String(entry?.service || entry?.specialty || entry?.name || '').trim(),
        String(entry?.category || entry?.primaryCategory || '').trim()
      ])
      .filter(Boolean);
  }

  function normalizeWorkExperienceLabels(values = []) {
    if (!Array.isArray(values)) return [];
    return values
      .flatMap((entry) => [
        String(entry?.role || '').trim(),
        String(entry?.company || '').trim(),
        String(entry?.summary || '').trim()
      ])
      .filter(Boolean);
  }

  function normalizeProviderSearchItems(rawProviders = []) {
    return rawProviders
      .map((provider) => {
        const displayName = String(provider.displayName || provider.name || '').trim();
        const username = String(provider.username || '').trim();
        const specialty = String(provider.specialty || provider.title || provider.primaryCategory || '').trim();
        const primaryCategory = String(provider.primaryCategory || '').trim();
        const title = String(provider.title || '').trim();
        const city = String(provider.city || '').trim();
        const province = String(provider.province || '').trim();
        const address = String(provider.address || '').trim();
        const bio = String(provider.bio || '').trim();
        const providerPublicId = String(provider.providerPublicId || '').trim();
        const skills = normalizeSkillLabels(provider.skills);
        const services = normalizeProviderServiceLabels(provider.services);
        const workExperience = normalizeWorkExperienceLabels(provider.workExperience);
        if (!displayName && !specialty && !city && !province) return null;
        return {
          kind: 'provider',
          displayName: displayName || specialty || 'WorkLinkUp specialist',
          username,
          specialty: specialty || primaryCategory || 'Specialist',
          primaryCategory,
          title,
          city,
          province,
          address,
          bio,
          providerPublicId,
          services,
          skills,
          workExperience,
          averageRating: Number(provider.averageRating || 0)
        };
      })
      .filter(Boolean);
  }

  async function getSearchProviders() {
    if (providerSearchCache.length) return providerSearchCache;
    if (providerSearchPromise) return providerSearchPromise;

    providerSearchPromise = (async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper || typeof authHelper.listProviders !== 'function') {
        providerSearchCache = [];
        return providerSearchCache;
      }

      const providers = await authHelper.listProviders().catch(() => []);
      providerSearchCache = normalizeProviderSearchItems(providers);
      return providerSearchCache;
    })();

    const result = await providerSearchPromise;
    providerSearchPromise = null;
    return result;
  }

  function getSearchProviderIcon(item = {}) {
    const label = `${item.specialty} ${item.primaryCategory} ${(item.services || []).join(' ')}`.toLowerCase();
    if (label.includes('plumb')) return 'fa-solid fa-faucet-drip';
    if (label.includes('garden')) return 'fa-solid fa-seedling';
    if (label.includes('nail') || label.includes('hair') || label.includes('beauty')) return 'fa-solid fa-spa';
    if (label.includes('photo')) return 'fa-solid fa-camera';
    if (label.includes('program') || label.includes('digital') || label.includes('design')) return 'fa-solid fa-laptop-code';
    if (label.includes('tutor') || label.includes('math') || label.includes('teach')) return 'fa-solid fa-graduation-cap';
    return 'fa-solid fa-magnifying-glass';
  }

  function getSearchItemIcon(item = {}) {
    if (item.kind === 'service' || item.kind === 'category') {
      return item.icon || getSearchProviderIcon(item);
    }
    return getSearchProviderIcon(item);
  }

  function getSearchProviderText(item = {}) {
    return normalizeSearchTerms([
      item.displayName,
      item.username,
      item.specialty,
      item.title,
      item.primaryCategory,
      item.services,
      item.city,
      item.province,
      item.address,
      item.bio,
      item.providerPublicId,
      item.skills,
      item.workExperience
    ]).join(' ').toLowerCase();
  }

  function scoreSearchProvider(item, rawQuery) {
    const query = String(rawQuery || '').trim().toLowerCase();
    if (!query) return Number(item.averageRating || 0);

    const name = String(item.displayName || '').toLowerCase();
    const username = String(item.username || '').toLowerCase();
    const specialty = String(item.specialty || '').toLowerCase();
    const title = String(item.title || '').toLowerCase();
    const category = String(item.primaryCategory || '').toLowerCase();
    const city = String(item.city || '').toLowerCase();
    const province = String(item.province || '').toLowerCase();
    const address = String(item.address || '').toLowerCase();
    const bio = String(item.bio || '').toLowerCase();
    const providerPublicId = String(item.providerPublicId || '').toLowerCase();
    const skills = Array.isArray(item.skills) ? item.skills.map((value) => String(value || '').toLowerCase()) : [];
    const services = Array.isArray(item.services) ? item.services.map((value) => String(value || '').toLowerCase()) : [];
    const workExperience = Array.isArray(item.workExperience) ? item.workExperience.map((value) => String(value || '').toLowerCase()) : [];
    const haystack = getSearchProviderText(item);

    let score = 0;
    if (name === query || username === query || providerPublicId === query) score += 120;
    if (name.startsWith(query) || username.startsWith(query)) score += 84;
    if (specialty === query || title === query || category === query) score += 72;
    if (specialty.startsWith(query) || title.startsWith(query) || category.startsWith(query)) score += 46;
    if (services.some((value) => value === query)) score += 74;
    if (services.some((value) => value.startsWith(query))) score += 48;
    if (services.some((value) => value.includes(query))) score += 26;
    if (skills.some((value) => value === query)) score += 66;
    if (skills.some((value) => value.startsWith(query))) score += 44;
    if (workExperience.some((value) => value.includes(query))) score += 34;
    if (city === query || province === query) score += 42;
    if (address.includes(query)) score += 20;
    if (bio.includes(query)) score += 18;
    if (haystack.includes(query)) score += 18;
    return score;
  }

  function buildSearchQueryFromProvider(item = {}) {
    return [
      item.displayName,
      item.specialty,
      item.city || item.province
    ].filter(Boolean).join(' ');
  }

  function getServiceCatalog() {
    return Array.isArray(window.WorkLinkUpServiceCatalog) ? window.WorkLinkUpServiceCatalog : [];
  }

  function buildServiceSearchItems() {
    const categories = getServiceCatalog();
    return categories.flatMap((category) => {
      const categoryLabel = String(category.label || '').trim();
      const shortLabel = String(category.shortLabel || '').trim();
      const subservices = Array.isArray(category.subservices) ? category.subservices : [];
      const categoryTerms = normalizeSearchTerms([categoryLabel, shortLabel, subservices]);
      const categoryItem = {
        kind: 'category',
        title: categoryLabel,
        subtitle: `${subservices.length} services`,
        query: categoryLabel,
        category: categoryLabel,
        icon: category.icon || 'fa-solid fa-briefcase',
        terms: categoryTerms
      };

      const serviceItems = subservices.map((service) => ({
        kind: 'service',
        title: String(service || '').trim(),
        subtitle: categoryLabel,
        query: String(service || '').trim(),
        service: String(service || '').trim(),
        category: categoryLabel,
        icon: category.icon || 'fa-solid fa-briefcase',
        terms: normalizeSearchTerms([service, categoryLabel, shortLabel])
      }));

      return [categoryItem, ...serviceItems];
    });
  }

  function getServiceSearchItems() {
    if (!serviceSearchCache.length) {
      serviceSearchCache = buildServiceSearchItems();
    }
    return serviceSearchCache;
  }

  function scoreServiceSearchItem(item = {}, rawQuery) {
    const query = String(rawQuery || '').trim().toLowerCase();
    if (!query) return 0;

    const title = String(item.title || '').toLowerCase();
    const subtitle = String(item.subtitle || '').toLowerCase();
    const terms = Array.isArray(item.terms) ? item.terms.map((value) => String(value || '').toLowerCase()) : [];

    let score = item.kind === 'service' ? 8 : 0;
    if (title === query) score += 180;
    if (terms.some((value) => value === query)) score += 150;
    if (title.startsWith(query)) score += 110;
    if (terms.some((value) => value.startsWith(query))) score += 82;
    if (title.includes(query)) score += 58;
    if (subtitle.includes(query)) score += 36;
    if (terms.some((value) => value.includes(query))) score += 34;
    return score;
  }

  const HOME_TRENDING_JOBS = [
    { category: 'Plumbing', service: 'Leak Repairs', image: 'images/categories/plumber_converted.avif', budget: 'From $25', blurb: 'Burst pipes, blocked drains, and urgent home call-outs.' },
    { category: 'Electrical', service: 'Solar System Installation', image: 'images/categories/electrician_converted.avif', budget: 'From $120', blurb: 'Backup power setups for homes, shops, and offices.' },
    { category: 'Cleaning Services', service: 'Deep House Cleaning', image: 'images/categories/cleaning_converted.avif', budget: 'From $30', blurb: 'Move-ins, weekly resets, and office clean-ups.' },
    { category: 'Construction & Building', service: 'Bricklayer', image: 'images/categories/construction_converted.avif', budget: 'From $85', blurb: 'Boundary walls, room extensions, and tank stands.' },
    { category: 'Food & Catering', service: 'Event Caterer', image: 'images/categories/catering_converted.avif', budget: 'From $60', blurb: 'Weddings, parties, and office platters booking fast.' },
    { category: 'Digital & Business', service: 'Graphic Designer', image: 'images/categories/digital_converted.avif', budget: 'From $40', blurb: 'Posters, brand packs, and fast-turnaround content.' },
    { category: 'Transport & Logistics', service: 'Moving & Relocation Services', image: 'images/categories/transport_converted.avif', budget: 'From $50', blurb: 'House moves, furniture runs, and local deliveries.' },
    { category: 'Photography & Videography', service: 'Wedding Photographer', image: 'images/categories/photographer_converted.avif', budget: 'From $150', blurb: 'Full-day shoots, edited galleries, and reels.' },
    { category: 'Agriculture & Farming', service: 'Irrigation Setup', image: 'images/categories/farmer_converted.avif', budget: 'From $90', blurb: 'Borehole-fed lines, garden systems, and small plots.' },
    { category: 'Beauty & Wellness', service: 'Hairdresser', image: 'images/categories/beauty_converted.avif', budget: 'From $20', blurb: 'Home appointments, salon shifts, and event styling.' }
  ];

  function buildHomepageCategoryMarkup(base = getSiteBasePath(), categories = [], options = {}) {
    const isClone = Boolean(options.isClone);
    return categories.map((category) => `
      <a href="${typeof buildWorkLinkUpSpecialistsHref === 'function'
        ? buildWorkLinkUpSpecialistsHref(category.label, { base, category: category.label, query: category.label })
        : `${base}pages/search-results.html?category=${encodeURIComponent(category.label)}&query=${encodeURIComponent(category.label)}`}" class="category-circle home-category-circle"${isClone ? ' aria-hidden="true" tabindex="-1" data-loop-clone="1"' : ''}>
        <div class="category-circle-img">
          ${category.image
            ? `<img src="${escapeHtml(`${base}${category.image}`)}" alt="${escapeHtml(category.label)}" loading="lazy" decoding="async" />`
            : `<span class="category-circle-icon" aria-hidden="true"><i class="${escapeHtml(category.icon || 'fa-solid fa-briefcase')}"></i></span>`}
        </div>
        <span>${escapeHtml(category.shortLabel || category.label)}</span>
      </a>
    `).join('');
  }

  function splitHomepageCategoriesIntoRows(categories = [], rowCount = 3) {
    return categories.reduce((rows, category, index) => {
      rows[index % rowCount].push(category);
      return rows;
    }, Array.from({ length: rowCount }, () => []));
  }

  function buildHomepageCategoryRailsMarkup(base = getSiteBasePath(), categories = []) {
    const desktopMarkup = `${buildHomepageCategoryMarkup(base, categories)}${buildHomepageCategoryMarkup(base, categories, { isClone: true })}`;
    const mobileRows = splitHomepageCategoriesIntoRows(categories, 3)
      .map((rowCategories, index) => {
        const directionClass = index % 2 === 1 ? 'is-reverse' : 'is-forward';
        return `
          <div class="home-mobile-category-row-shell">
            <div class="home-mobile-category-row ${directionClass}">
              ${buildHomepageCategoryMarkup(base, rowCategories)}${buildHomepageCategoryMarkup(base, rowCategories, { isClone: true })}
            </div>
          </div>
        `;
      }).join('');

    return `
      <div class="home-category-desktop-row">${desktopMarkup}</div>
      <div class="home-mobile-category-rows">${mobileRows}</div>
    `;
  }

  function getHomepageCategoryConfig(label = '') {
    return getServiceCatalog().find((category) => category.label === label) || null;
  }

  function buildHomepageTrendingHref(base = getSiteBasePath(), item = {}) {
    const target = new URL(`${base}pages/search-results.html`, window.location.href);
    const searchValue = String(item.service || item.category || '').trim();
    const categoryValue = String(item.category || '').trim();
    if (searchValue) target.searchParams.set('query', searchValue);
    if (categoryValue) target.searchParams.set('category', categoryValue);
    return `${base}pages/search-results.html${target.search}`;
  }

  function buildHomepageTrendingJobsMarkup(base = getSiteBasePath(), items = [], options = {}) {
    const isClone = Boolean(options.isClone);
    const cardClass = String(options.cardClass || '').trim();
    return items.map((item, index) => {
      const rank = Number(item._homeRank || 0) || (index + 1);
      const categoryConfig = getHomepageCategoryConfig(item.category);
      const imagePath = String(item.image || categoryConfig?.image || '').trim();
      const iconClass = escapeHtml(categoryConfig?.icon || 'fa-solid fa-briefcase');
      const href = buildHomepageTrendingHref(base, item);

      return `
        <a href="${escapeHtml(href)}" class="home-trending-job-card${cardClass ? ` ${escapeHtml(cardClass)}` : ''}"${isClone ? ' aria-hidden="true" tabindex="-1" data-loop-clone="1"' : ''} aria-label="Browse ${escapeHtml(item.service || item.category || 'trending jobs')} jobs">
          <div class="home-trending-job-art">
            ${imagePath
              ? `<img src="${escapeHtml(`${base}${imagePath}`)}" alt="${escapeHtml(item.service || item.category || 'Trending job')}" loading="lazy" decoding="async" />`
              : `<span class="home-trending-job-icon" aria-hidden="true"><i class="${iconClass}"></i></span>`}
          </div>
          <span class="home-trending-job-rank" aria-hidden="true">${rank}</span>
          <div class="home-trending-job-copy">
            <div class="home-trending-job-chips">
              <span>${escapeHtml(item.category || 'Trending')}</span>
              <span>${escapeHtml(item.budget || 'Open')}</span>
            </div>
            <h3>${escapeHtml(item.service || item.category || 'Trending job')}</h3>
            <p>${escapeHtml(item.blurb || 'High-demand work on WorkLinkUp right now.')}</p>
          </div>
        </a>
      `;
    }).join('');
  }

  function getHomepageTrendingItems() {
    return HOME_TRENDING_JOBS.map((item, index) => ({
      ...item,
      _homeRank: index + 1
    }));
  }

  function getMobileFeaturedTrendingItems(items = [], cursor = 0) {
    if (!items.length) return [];
    if (items.length === 1) return [items[0]];
    const firstIndex = cursor % items.length;
    const secondIndex = (cursor + Math.ceil(items.length / 2)) % items.length;
    if (secondIndex === firstIndex) return [items[firstIndex], items[(firstIndex + 1) % items.length]];
    return [items[firstIndex], items[secondIndex]];
  }

  function getDesktopFeaturedTrendingItems(items = [], cursor = 0) {
    if (!items.length) return [];
    return [items[cursor % items.length]];
  }

  function renderHomepageCategories() {
    const categoryRow = document.querySelector('[data-home-categories]');
    if (!categoryRow) return;
    const categories = getServiceCatalog();
    if (!categories.length) return;
    const base = getSiteBasePath();
    categoryRow.innerHTML = buildHomepageCategoryRailsMarkup(base, categories);
    initHomeMobileCategoryRailTouch();
    initScrollableRails(document);
  }

  function initHomeMobileCategoryRailTouch(root = document) {
    root.querySelectorAll('.home-mobile-category-row-shell').forEach((shell) => {
      if (!(shell instanceof HTMLElement) || shell.dataset.mobileRailTouchBound === '1') return;
      let releaseTimer = 0;

      function setTouching(isTouching) {
        if (releaseTimer) window.clearTimeout(releaseTimer);
        if (isTouching) {
          shell.classList.add('is-touching');
          return;
        }
        releaseTimer = window.setTimeout(() => {
          shell.classList.remove('is-touching');
        }, 160);
      }

      shell.addEventListener('pointerdown', () => setTouching(true), { passive: true });
      shell.addEventListener('pointerup', () => setTouching(false), { passive: true });
      shell.addEventListener('pointercancel', () => setTouching(false), { passive: true });
      shell.addEventListener('touchstart', () => setTouching(true), { passive: true });
      shell.addEventListener('touchend', () => setTouching(false), { passive: true });
      shell.addEventListener('touchcancel', () => setTouching(false), { passive: true });
      shell.dataset.mobileRailTouchBound = '1';
    });
  }

  function renderHomepageTrendingJobs() {
    const trendingRow = document.querySelector('[data-home-trending-jobs]');
    const featuredRow = document.querySelector('[data-home-trending-featured]');
    if (!trendingRow) return;
    const base = getSiteBasePath();
    const trendingItems = getHomepageTrendingItems();
    const mobileTrendingQuery = window.matchMedia('(max-width: 768px)');
    trendingRow.innerHTML = `${buildHomepageTrendingJobsMarkup(base, trendingItems)}${buildHomepageTrendingJobsMarkup(base, trendingItems, { isClone: true })}`;

    if (featuredRow) {
      let featuredCursor = 0;
      let featuredTimerId = 0;
      const renderFeatured = () => {
        const featuredItems = mobileTrendingQuery.matches
          ? getMobileFeaturedTrendingItems(trendingItems, featuredCursor)
          : getDesktopFeaturedTrendingItems(trendingItems, featuredCursor);
        featuredRow.innerHTML = buildHomepageTrendingJobsMarkup(base, featuredItems, {
          cardClass: mobileTrendingQuery.matches ? 'is-mobile-featured' : 'is-desktop-featured'
        });
      };

      const scheduleFeaturedSwap = () => {
        if (featuredTimerId) window.clearTimeout(featuredTimerId);
        if (trendingItems.length <= 1) return;
        featuredTimerId = window.setTimeout(() => {
          featuredCursor = (featuredCursor + 1) % trendingItems.length;
          renderFeatured();
          scheduleFeaturedSwap();
        }, mobileTrendingQuery.matches ? 3000 : 5000);
      };

      renderFeatured();
      scheduleFeaturedSwap();
      mobileTrendingQuery.addEventListener('change', () => {
        renderFeatured();
        scheduleFeaturedSwap();
      });
    }
  }

  const HOME_JOB_GUIDE_CARDS = [
    {
      step: '1',
      title: 'Post what you need',
      text: 'Share the service, address, budget, and timing.',
      image: 'images/categories/digital_converted.avif',
      cta: 'Post Job',
      href: 'pages/post-job.html'
    },
    {
      step: '2',
      title: 'Providers see it',
      text: 'Available providers can open the details and send a bid.',
      image: 'images/categories/digital_converted.avif',
      cta: 'Browse Jobs',
      href: 'pages/job-posts.html'
    },
    {
      step: '3',
      title: 'Compare bids',
      text: 'Review budget, message, and profile before you choose.',
      image: 'images/categories/furnicher_converted.avif',
      cta: 'View Jobs',
      href: 'pages/job-posts.html'
    },
    {
      step: '4',
      title: 'Accept the best fit',
      text: 'Pick the provider that matches your job and budget.',
      image: 'images/categories/photographer_converted.avif',
      cta: 'Learn More',
      href: 'pages/job-posts.html'
    },
    {
      step: '5',
      title: 'Chat directly',
      text: 'Use messages to agree on timing and final details.',
      image: 'images/categories/events_converted.avif',
      cta: 'Open Jobs',
      href: 'pages/job-posts.html'
    },
    {
      step: '6',
      title: 'Get it done',
      text: 'Your job dashboard keeps the work and bids together.',
      image: 'images/categories/construction_converted.avif',
      cta: 'Post Job',
      href: 'pages/post-job.html'
    }
  ];

  function formatHomeJobCurrency(value) {
    const amount = Number(value || 0);
    return `US$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function formatHomeJobDate(timestamp) {
    const date = new Date(Number(timestamp || 0));
    if (Number.isNaN(date.getTime())) return 'Recently';
    return new Intl.DateTimeFormat('en-ZW', {
      day: 'numeric',
      month: 'short'
    }).format(date);
  }

  function resolveHomeMediaSrc(value, fallback = '') {
    const source = String(value || '').trim();
    if (!source) return fallback ? resolveHomeMediaSrc(fallback) : '';
    const unescaped = source
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/g, '/')
      .replace(/&#47;/g, '/');
    if (/^(data:|https?:|blob:|\/)/i.test(unescaped)) return unescaped;
    if (/^image\/[a-z0-9.+-]+;base64,/i.test(unescaped)) return `data:${unescaped}`;
    if (/^[A-Za-z0-9+/=\s]+$/.test(unescaped) && unescaped.replace(/\s+/g, '').length > 160) {
      return `data:image/jpeg;base64,${unescaped.replace(/\s+/g, '')}`;
    }
    const normalizedPath = unescaped.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, '');
    return `${getSiteBasePath()}${normalizedPath}`;
  }

  function getHomeJobCategoryConfig(job = {}) {
    const categoryLabel = String(job.category || '').trim();
    const subcategoryLabel = String(job.subcategory || '').trim();
    return getServiceCatalog().find((category) => category.label === categoryLabel)
      || (typeof findCategoryByServiceLabel === 'function' ? findCategoryByServiceLabel(subcategoryLabel) : null)
      || getServiceCatalog()[0]
      || {};
  }

  function getHomeJobInitials(name = '') {
    const parts = String(name || 'WorkLinkUp client')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return parts.map((part) => part[0]).join('').toUpperCase() || 'WL';
  }

  function buildHomeJobDetailHref(jobId = '') {
    const base = getSiteBasePath();
    const params = new URLSearchParams();
    if (jobId) params.set('detailJob', jobId);
    return `${base}pages/job-posts.html${params.toString() ? `?${params.toString()}` : ''}`;
  }

  function buildHomeAvailableJobCard(job = {}) {
    const categoryConfig = getHomeJobCategoryConfig(job);
    const categoryImage = resolveHomeMediaSrc(categoryConfig.image || 'images/categories/digital_converted.avif');
    const title = String(job.subcategory || job.category || 'Open job').trim();
    const href = buildHomeJobDetailHref(job.id);
    const serviceText = `${job.category || 'Service request'} • ${formatHomeJobCurrency(job.budget)}`;

    return `
      <article class="home-market-card home-market-available-card wl-showcase-card wl-showcase-card--home">
        <a class="wl-showcase-card__media" href="${escapeHtml(href)}" aria-label="Open ${escapeHtml(title)} job details">
          <img class="wl-showcase-card__image" src="${escapeHtml(categoryImage)}" alt="${escapeHtml(job.category || 'Job category')}" loading="lazy" decoding="async" />
          <div class="wl-showcase-card__overlay"></div>
        </a>
        <div class="wl-showcase-card__badge-row">
          <span class="wl-showcase-card__badge">${escapeHtml(formatHomeJobDate(job.createdAtMs))}</span>
          <span class="wl-showcase-card__badge wl-showcase-card__badge--accent">New</span>
        </div>
        <div class="wl-showcase-card__content">
          <h3 class="wl-showcase-card__title">${escapeHtml(title)}</h3>
          <p class="wl-showcase-card__subtitle">${escapeHtml(serviceText)}</p>
        </div>
        <a class="wl-showcase-card__action" href="${escapeHtml(href)}" aria-label="Open ${escapeHtml(title)} job">
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </article>
    `;
  }

  function buildHomeJobGuideCard(card = {}) {
    const href = `${getSiteBasePath()}${card.href || 'pages/job-posts.html'}`;
    const image = resolveHomeMediaSrc(card.image || 'images/categories/digital_converted.avif');
    return `
      <article class="home-market-card home-market-available-card home-job-guide-card wl-showcase-card wl-showcase-card--home wl-showcase-card--guide">
        <a class="wl-showcase-card__media" href="${escapeHtml(href)}">
          <img class="wl-showcase-card__image" src="${escapeHtml(image)}" alt="${escapeHtml(card.title || 'How WorkLinkUp jobs work')}" loading="lazy" decoding="async" />
          <div class="wl-showcase-card__overlay"></div>
        </a>
        <div class="wl-showcase-card__badge-row">
          <span class="wl-showcase-card__badge">Today</span>
          <span class="wl-showcase-card__badge wl-showcase-card__badge--accent">New</span>
        </div>
        <div class="wl-showcase-card__content">
          <h3 class="wl-showcase-card__title">${escapeHtml(card.title || 'Open jobs')}</h3>
          <p class="wl-showcase-card__subtitle">${escapeHtml(card.text || 'Find posted work and place your bid.')}</p>
        </div>
        <a class="wl-showcase-card__action" href="${escapeHtml(href)}" aria-label="${escapeHtml(card.cta || 'View Jobs')}">
          <i class="fa-solid fa-arrow-right"></i>
        </a>
      </article>
    `;
  }

  function updateHomeAvailableStats(totalJobs = 0) {
    const statPills = Array.from(document.querySelectorAll('[data-home-available-stats]'));
    if (!statPills.length) return;

    const isUp = Math.random() >= 0.5;
    const percentage = Math.floor(4 + (Math.random() * 38));
    statPills.forEach((pill) => {
      pill.classList.toggle('is-up', isUp);
      pill.classList.toggle('is-down', !isUp);
      const totalEl = pill.querySelector('[data-home-available-total]');
      const trendEl = pill.querySelector('[data-home-available-trend]');
      const iconEl = pill.querySelector('[data-home-available-trend-icon]');
      if (totalEl) totalEl.textContent = String(totalJobs);
      if (trendEl) trendEl.textContent = `${percentage}%`;
      if (iconEl) iconEl.textContent = isUp ? '▲' : '▼';
    });

    window.clearTimeout(window.homeAvailableStatsTimer);
    window.homeAvailableStatsTimer = window.setTimeout(() => {
      updateHomeAvailableStats(totalJobs);
    }, 3000 + Math.floor(Math.random() * 9000));
  }

  function renderHomeAvailableJobCards(hosts, jobs = []) {
    const latestJobs = jobs
      .filter((job) => String(job.status || 'open').trim().toLowerCase() === 'open')
      .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0))
      .slice(0, 6);
    const neededGuideCards = Math.max(0, 6 - latestJobs.length);
    const markup = `${latestJobs.map((job) => buildHomeAvailableJobCard(job)).join('')}${HOME_JOB_GUIDE_CARDS
      .slice(0, neededGuideCards)
      .map((card) => buildHomeJobGuideCard(card))
      .join('')}`;

    hosts.forEach((host) => {
      host.innerHTML = markup;
      host.closest('[data-home-market-scroll-window]')?.dispatchEvent(new Event('scroll'));
    });
  }

  async function enrichHomeJobsWithOwnerProfiles(authHelper, jobs = []) {
    const profileCache = new Map();
    return Promise.all(jobs.map(async (job) => {
      const ownerUid = String(job.ownerUid || '').trim();
      if (!ownerUid || !authHelper) return job;
      if (!profileCache.has(ownerUid)) {
        profileCache.set(ownerUid, Promise.all([
          typeof authHelper.getClientProfileByUid === 'function'
            ? authHelper.getClientProfileByUid(ownerUid).catch(() => null)
            : Promise.resolve(null),
          typeof authHelper.getUserDocument === 'function'
            ? authHelper.getUserDocument(ownerUid).catch(() => null)
            : Promise.resolve(null)
        ]).then(([clientProfile, userDoc]) => ({
          ownerProfile: clientProfile || userDoc || null,
          ownerProfileImageData: clientProfile?.profileImageData || userDoc?.profileImageData || ''
        })));
      }
      const ownerProfileData = await profileCache.get(ownerUid).catch(() => ({}));
      return {
        ...job,
        ...ownerProfileData
      };
    }));
  }

  async function renderHomeAvailableJobs() {
    const hosts = Array.from(document.querySelectorAll('[data-home-available-jobs], [data-home-available-jobs-mobile]'))
      .filter((host) => host instanceof HTMLElement);
    if (!hosts.length) return;

    renderHomeAvailableJobCards(hosts, []);
    updateHomeAvailableStats(0);

    const authHelper = typeof window.ensureWorkLinkAuth === 'function'
      ? await window.ensureWorkLinkAuth().catch(() => null)
      : window.softGigglesAuth || null;
    if (!authHelper || typeof authHelper.listJobPosts !== 'function') return;

    const jobs = await authHelper.listJobPosts().catch(() => []);
    const openJobs = jobs
      .filter((job) => String(job.status || 'open').trim().toLowerCase() === 'open');
    const latestJobs = openJobs
      .sort((first, second) => Number(second.createdAtMs || 0) - Number(first.createdAtMs || 0))
      .slice(0, 6);
    const enrichedJobs = await enrichHomeJobsWithOwnerProfiles(authHelper, latestJobs);
    renderHomeAvailableJobCards(hosts, enrichedJobs);
    updateHomeAvailableStats(openJobs.length);
  }

  function initHomeMarketScrollers() {
    document.querySelectorAll('.home-market-booked-shell').forEach((shell) => {
      if (!(shell instanceof HTMLElement) || shell.dataset.marketScrollBound === '1') return;
      const windowEl = shell.querySelector('[data-home-market-scroll-window]');
      if (!(windowEl instanceof HTMLElement)) return;
      const buttons = shell.querySelectorAll('[data-home-market-scroll]');

      function syncButtons() {
        const maxScrollLeft = Math.max(0, windowEl.scrollWidth - windowEl.clientWidth);
        buttons.forEach((button) => {
          if (!(button instanceof HTMLButtonElement)) return;
          const direction = button.getAttribute('data-home-market-scroll');
          button.disabled = direction === 'prev'
            ? windowEl.scrollLeft <= 4
            : windowEl.scrollLeft >= maxScrollLeft - 4;
        });
      }

      buttons.forEach((button) => {
        button.addEventListener('click', () => {
          const direction = button.getAttribute('data-home-market-scroll') === 'prev' ? -1 : 1;
          windowEl.scrollBy({ left: direction * Math.max(windowEl.clientWidth * 0.92, 220), behavior: 'smooth' });
        });
      });

      windowEl.addEventListener('scroll', syncButtons, { passive: true });
      window.addEventListener('resize', syncButtons);
      shell.dataset.marketScrollBound = '1';
      syncButtons();
    });
  }

  function initHomeCardCarousels() {
    document.querySelectorAll('[data-home-card-carousel]').forEach((carousel) => {
      if (!(carousel instanceof HTMLElement) || carousel.dataset.carouselBound === '1') return;
      const slides = Array.from(carousel.querySelectorAll('.home-carousel-slide')).filter((slide) => slide instanceof HTMLElement);
      const dotsHost = carousel.querySelector('.home-carousel-dots');
      if (!slides.length || !(dotsHost instanceof HTMLElement)) return;
      let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
      let timerId = 0;

      dotsHost.innerHTML = slides.map((_, index) => `
        <button type="button" class="home-carousel-dot" data-home-carousel-dot="${index}" aria-label="Show slide ${index + 1}"></button>
      `).join('');

      const dots = Array.from(dotsHost.querySelectorAll('.home-carousel-dot')).filter((dot) => dot instanceof HTMLButtonElement);

      function renderSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
      }

      function scheduleNext() {
        if (timerId) window.clearInterval(timerId);
        timerId = window.setInterval(() => {
          renderSlide(activeIndex + 1);
        }, 3600);
      }

      dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
          renderSlide(index);
          scheduleNext();
        });
      });

      carousel.dataset.carouselBound = '1';
      renderSlide(activeIndex);
      scheduleNext();
    });
  }

  async function getSearchMatches(rawQuery) {
    const query = String(rawQuery || '').trim().toLowerCase();
    const [providers, serviceItems] = await Promise.all([
      getSearchProviders(),
      Promise.resolve(getServiceSearchItems())
    ]);

    const rankedProviders = providers
      .map((item) => ({
        ...item,
        _score: scoreSearchProvider(item, query)
      }))
      .filter((item) => !query || item._score > 0 || getSearchProviderText(item).includes(query))
      .sort((first, second) => {
        const scoreDiff = Number(second._score || 0) - Number(first._score || 0);
        if (scoreDiff !== 0) return scoreDiff;
        return Number(second.averageRating || 0) - Number(first.averageRating || 0);
      })
      .slice(0, query ? 4 : 6)
      .map((item) => ({
        kind: 'provider',
        query: buildSearchQueryFromProvider(item),
        title: item.displayName,
        subtitle: [item.specialty || item.title || item.primaryCategory, item.city || item.province || item.address].filter(Boolean).join(' • '),
        icon: getSearchProviderIcon(item),
        averageRating: item.averageRating,
        _score: item._score
      }));

    const rankedServices = serviceItems
      .map((item) => ({
        ...item,
        _score: scoreServiceSearchItem(item, query)
      }))
      .filter((item) => query && item._score > 0)
      .sort((first, second) => Number(second._score || 0) - Number(first._score || 0))
      .slice(0, 4)
      .map((item) => ({
        kind: item.kind,
        query: item.query,
        title: item.title,
        subtitle: item.kind === 'category' ? `Category • ${item.subtitle}` : `Service • ${item.subtitle}`,
        icon: item.icon,
        category: item.category || '',
        service: item.service || '',
        _score: item._score
      }));

    return [...rankedServices, ...rankedProviders]
      .sort((first, second) => Number(second._score || 0) - Number(first._score || 0))
      .slice(0, query ? 8 : 8);
  }

  function goToSpecialistsSearch(rawQuery, options = {}) {
    const query = String(rawQuery || '').trim();
    const category = String(options.category || '').trim();
    const service = String(options.service || '').trim();
    const base = getSiteBasePath();
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (service) params.set('service', service);
    const queryString = params.toString();
    window.location.href = `${base}pages/search-results.html${queryString ? `?${queryString}` : ''}`;
  }

  function submitInlineSearch(input) {
    const query = input instanceof HTMLInputElement ? input.value.trim() : '';

    if (!query && input instanceof HTMLInputElement && input.closest('[data-home-hero-search]')) {
      const base = getSiteBasePath();
      window.location.href = `${base}pages/search-results.html`;
      return;
    }

    hideSearchSuggestions();
    goToSpecialistsSearch(query);
  }

  function buildSearchItemMarkup(item, query, className) {
    return `
      <button type="button" class="${className}" data-query="${escapeHtml(item.query)}"${item.category ? ` data-category="${escapeHtml(item.category)}"` : ''}${item.service ? ` data-service="${escapeHtml(item.service)}"` : ''}>
        <span class="search-result-icon is-${escapeHtml(item.kind || 'search')}" aria-hidden="true"><i class="${escapeHtml(getSearchItemIcon(item))}"></i></span>
        <span class="search-result-copy">
          <strong>${highlightMatch(item.title, query)}</strong>
          <small>${highlightMatch(item.subtitle, query)}</small>
        </span>
        <span class="search-result-type">${escapeHtml(item.kind === 'provider' ? 'Provider' : item.kind === 'category' ? 'Category' : 'Service')}</span>
      </button>
    `;
  }

  async function renderSearchModalResults(query = '') {
    if (!searchModalResults) return;
    const requestId = ++searchModalRequestId;
    searchModalResults.innerHTML = query
      ? `<div class="mobile-search-empty">Searching services and providers...</div>`
      : `<div class="mobile-search-empty">Start typing a service, skill, provider, or city.</div>`;
    const matches = await getSearchMatches(query);
    if (requestId !== searchModalRequestId) return;
    searchModalResults.innerHTML = matches.length
      ? matches.map((item) => buildSearchItemMarkup(item, query, 'mobile-search-result')).join('')
      : `<div class="mobile-search-empty">No matches found for that search yet.</div>`;
  }

  function openSearchModal(prefill = '') {
    if (!searchModal) return;
    searchModal.hidden = false;
    document.body.classList.add('mobile-search-open');
    if (searchModalInput) searchModalInput.value = prefill;
    renderSearchModalResults(prefill);
    requestAnimationFrame(() => {
      searchModal.classList.add('is-visible');
      if (searchModalInput) searchModalInput.focus();
    });
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('is-visible');
    document.body.classList.remove('mobile-search-open');
    setTimeout(() => {
      searchModal.hidden = true;
      if (searchModalInput) searchModalInput.value = '';
      searchModalResults && (searchModalResults.innerHTML = '');
    }, 180);
  }

  function initHomeHeroSearchTyping() {
    const input = document.querySelector('[data-home-search-typing]');
    if (!(input instanceof HTMLInputElement)) return;

    const terms = [
      'Search plumbers in Harare',
      'Find electricians near me',
      'Cleaning services in Bulawayo',
      'Wedding photographer in Mutare',
      'Makeup artist for events',
      'Transport and moving help',
      'Gardeners in Chitungwiza',
      'Home repairs this weekend',
      'Available jobs for builders',
      'Tutors for O Level maths'
    ];

    let termIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timerId = 0;

    function schedule(delay) {
      if (timerId) window.clearTimeout(timerId);
      timerId = window.setTimeout(tick, delay);
    }

    function tick() {
      if (document.activeElement === input || input.value.trim()) {
        schedule(400);
        return;
      }

      const currentTerm = terms[termIndex] || '';

      if (!isDeleting) {
        charIndex = Math.min(currentTerm.length, charIndex + 1);
        input.setAttribute('placeholder', currentTerm.slice(0, charIndex));
        if (charIndex >= currentTerm.length) {
          isDeleting = true;
          schedule(1000);
          return;
        }
        schedule(80);
        return;
      }

      charIndex = Math.max(0, charIndex - 1);
      input.setAttribute('placeholder', currentTerm.slice(0, charIndex));
      if (charIndex === 0) {
        isDeleting = false;
        termIndex = (termIndex + 1) % terms.length;
        schedule(220);
        return;
      }
      schedule(38);
    }

    input.addEventListener('focus', () => {
      if (!input.value.trim()) input.setAttribute('placeholder', '');
    });

    input.addEventListener('blur', () => {
      if (!input.value.trim() && !timerId) schedule(180);
    });

    input.addEventListener('input', () => {
      if (!input.value.trim() && document.activeElement !== input) {
        input.setAttribute('placeholder', '');
      }
    });

    tick();
  }

  function positionSearchSuggestions(input) {
    if (!searchSuggestions || !input) return;
    const rect = input.closest('.search-bar').getBoundingClientRect();
    searchSuggestions.style.top = `${window.scrollY + rect.bottom + 8}px`;
    searchSuggestions.style.left = `${window.scrollX + rect.left}px`;
    searchSuggestions.style.width = `${rect.width}px`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function highlightMatch(text, query) {
    const safeText = escapeHtml(text);
    if (!query) return safeText;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const start = lowerText.indexOf(lowerQuery);

    if (start === -1) return safeText;

    const end = start + query.length;
    const before = escapeHtml(text.slice(0, start));
    const match = escapeHtml(text.slice(start, end));
    const after = escapeHtml(text.slice(end));
    return `${before}<span class="search-match">${match}</span>${after}`;
  }

  async function renderSearchSuggestions(input) {
    if (!searchSuggestions) return;
    const rawQuery = input.value.trim();
    const query = rawQuery.toLowerCase();

    if (!query) {
      searchSuggestions.innerHTML = '';
      searchSuggestions.hidden = true;
      searchSuggestions.classList.remove('is-visible');
      return;
    }

    const requestId = ++searchSuggestionRequestId;
    searchSuggestions.innerHTML = `<button type="button" class="search-suggestion is-empty">Searching services and providers...</button>`;
    positionSearchSuggestions(input);
    searchSuggestions.hidden = false;
    activeSearchInput = input;
    const matches = await getSearchMatches(rawQuery);
    if (requestId !== searchSuggestionRequestId) return;

    if (!matches.length) {
      searchSuggestions.innerHTML = `<button type="button" class="search-suggestion is-empty">No matching services or providers found</button>`;
    } else {
      searchSuggestions.innerHTML = matches
        .map((item) => buildSearchItemMarkup(item, rawQuery, 'search-suggestion'))
        .join('');
    }

    positionSearchSuggestions(input);
    searchSuggestions.hidden = false;
    activeSearchInput = input;
    requestAnimationFrame(() => {
      if (searchSuggestions && !searchSuggestions.hidden) {
        searchSuggestions.classList.add('is-visible');
      }
    });
  }

  function initScrollableRails(root = document) {
    root.querySelectorAll('[data-scroll-rail]').forEach((rail) => {
      if (!(rail instanceof HTMLElement) || rail.dataset.railBound === '1') return;
      const shell = rail.closest('.worklinkup-rail-shell');
      if (!(shell instanceof HTMLElement)) return;
      const prevBtn = shell.querySelector('[data-scroll-prev]');
      const nextBtn = shell.querySelector('[data-scroll-next]');
      const scrollAmount = () => Math.max(rail.clientWidth * 0.72, 180);
      const autoScrollEnabled = rail.hasAttribute('data-auto-scroll');
      const autoScrollSpeed = Math.max(0.008, Number.parseFloat(rail.getAttribute('data-auto-scroll-speed') || '0.02'));
      const autoScrollDirection = rail.getAttribute('data-auto-scroll-direction') === 'backward' ? -1 : 1;
      let autoScrollFrame = 0;
      let lastFrameAt = 0;
      let pauseUntil = 0;
      let pointerInside = false;
      let autoScrollPhase = 'moving';
      let phaseStartedAt = 0;
      let autoScrollPrimed = false;
      let loopNormalizeTimer = 0;
      const autoScrollMoveDuration = Math.max(1000, Number.parseInt(rail.getAttribute('data-auto-scroll-move-duration') || '5000', 10) || 5000);
      const autoScrollRestDuration = Math.max(0, Number.parseInt(rail.getAttribute('data-auto-scroll-rest-duration') || '3000', 10) || 3000);

      function isRendered(element) {
        return Boolean(element?.offsetWidth || element?.offsetHeight || element?.getClientRects().length);
      }

      function getLoopScrollWidth() {
        const firstClone = Array.from(rail.querySelectorAll('[data-loop-clone]')).find((clone) => (
          clone instanceof HTMLElement && isRendered(clone)
        ));
        const loopParent = firstClone?.parentElement;
        if (!(firstClone instanceof HTMLElement) || !(loopParent instanceof HTMLElement)) return 0;
        const firstOriginal = Array.from(loopParent.children).find((item) => (
          item instanceof HTMLElement && !item.hasAttribute('data-loop-clone') && isRendered(item)
        ));
        if (!(firstOriginal instanceof HTMLElement)) return 0;

        const loopWidth = Math.round(firstClone.getBoundingClientRect().left - firstOriginal.getBoundingClientRect().left);
        const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
        if (loopWidth <= rail.clientWidth || loopWidth >= rail.scrollWidth || maxScrollLeft <= 6) return 0;
        return loopWidth;
      }

      function normalizeLoopScroll(options = {}) {
        const loopWidth = getLoopScrollWidth();
        if (!loopWidth) return;
        const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
        let nextLeft = rail.scrollLeft;

        if (options.preferEnd && nextLeft <= 4 && loopWidth <= maxScrollLeft) {
          nextLeft += loopWidth;
        } else {
          while (nextLeft >= loopWidth && nextLeft - loopWidth <= maxScrollLeft) {
            nextLeft -= loopWidth;
          }
        }

        if (Math.abs(nextLeft - rail.scrollLeft) > 1) {
          const previousScrollBehavior = rail.style.scrollBehavior;
          rail.style.scrollBehavior = 'auto';
          rail.scrollLeft = nextLeft;
          rail.style.scrollBehavior = previousScrollBehavior;
        }
      }

      function scheduleLoopNormalization() {
        if (!getLoopScrollWidth()) return;
        if (loopNormalizeTimer) window.clearTimeout(loopNormalizeTimer);
        loopNormalizeTimer = window.setTimeout(() => {
          normalizeLoopScroll();
          syncButtons();
        }, 180);
      }

      function resetAutoScrollCycle(nextPhase = 'moving', timestamp = performance.now()) {
        autoScrollPhase = nextPhase;
        phaseStartedAt = timestamp;
      }

      function pauseAutoScroll(durationMs = 4000, timestamp = performance.now()) {
        pauseUntil = Date.now() + durationMs;
        resetAutoScrollCycle('moving', timestamp);
      }

      function syncButtons() {
        if (window.matchMedia('(max-width: 768px)').matches) {
          if (prevBtn instanceof HTMLButtonElement) prevBtn.disabled = false;
          if (nextBtn instanceof HTMLButtonElement) nextBtn.disabled = false;
          return;
        }
        if (getLoopScrollWidth()) {
          if (prevBtn instanceof HTMLButtonElement) prevBtn.disabled = false;
          if (nextBtn instanceof HTMLButtonElement) nextBtn.disabled = false;
          return;
        }
        const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);
        if (prevBtn instanceof HTMLButtonElement) prevBtn.disabled = rail.scrollLeft <= 4;
        if (nextBtn instanceof HTMLButtonElement) nextBtn.disabled = rail.scrollLeft >= maxScrollLeft - 4;
      }

      prevBtn?.addEventListener('click', () => {
        pauseAutoScroll();
        normalizeLoopScroll({ preferEnd: true });
        rail.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        scheduleLoopNormalization();
      });
      nextBtn?.addEventListener('click', () => {
        pauseAutoScroll();
        normalizeLoopScroll();
        rail.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        scheduleLoopNormalization();
      });
      rail.addEventListener('scroll', () => {
        syncButtons();
        scheduleLoopNormalization();
      }, { passive: true });
      rail.addEventListener('pointerdown', () => pauseAutoScroll(4000), { passive: true });
      rail.addEventListener('touchstart', () => pauseAutoScroll(4000), { passive: true });
      rail.addEventListener('wheel', () => pauseAutoScroll(4000), { passive: true });
      rail.addEventListener('focusin', () => pauseAutoScroll(4000));
      rail.addEventListener('mouseenter', () => {
        pointerInside = true;
      });
      rail.addEventListener('mouseleave', () => {
        pointerInside = false;
        resetAutoScrollCycle('moving', performance.now());
      });
      window.addEventListener('resize', syncButtons);

      const track = rail.querySelector('[data-scroll-track]');
      if (track instanceof HTMLElement && typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(syncButtons);
        observer.observe(track, { childList: true });
      }

      rail.dataset.railBound = '1';
      syncButtons();

      function tick(timestamp) {
        if (!autoScrollEnabled) return;
        if (!lastFrameAt) lastFrameAt = timestamp;
        if (!phaseStartedAt) phaseStartedAt = timestamp;
        const delta = timestamp - lastFrameAt;
        lastFrameAt = timestamp;
        const maxScrollLeft = Math.max(0, rail.scrollWidth - rail.clientWidth);

        if (!autoScrollPrimed && maxScrollLeft > 6) {
          if (autoScrollDirection < 0 && rail.scrollLeft <= 1) {
            rail.scrollLeft = maxScrollLeft;
          }
          autoScrollPrimed = true;
          syncButtons();
        }

        if (!pointerInside && Date.now() >= pauseUntil && maxScrollLeft > 6) {
          const phaseElapsed = timestamp - phaseStartedAt;

          if (autoScrollPhase === 'moving') {
            const loopWidth = getLoopScrollWidth();
            let nextLeft = rail.scrollLeft + (autoScrollDirection * autoScrollSpeed * delta);
            if (loopWidth) {
              if (autoScrollDirection > 0 && nextLeft >= loopWidth) {
                nextLeft -= loopWidth;
              }
              if (autoScrollDirection < 0 && nextLeft <= 1) {
                nextLeft += loopWidth;
              }
            } else {
              if (autoScrollDirection > 0 && nextLeft >= maxScrollLeft - 1) {
                nextLeft = 0;
              }
              if (autoScrollDirection < 0 && nextLeft <= 1) {
                nextLeft = maxScrollLeft;
              }
            }
            rail.scrollLeft = nextLeft;
            syncButtons();

            if (phaseElapsed >= autoScrollMoveDuration) {
              resetAutoScrollCycle('resting', timestamp);
            }
          } else if (phaseElapsed >= autoScrollRestDuration) {
            resetAutoScrollCycle('moving', timestamp);
          }
        }

        autoScrollFrame = window.requestAnimationFrame(tick);
      }

      if (autoScrollEnabled) {
        autoScrollFrame = window.requestAnimationFrame(tick);
        rail.dataset.autoScrollFrame = String(autoScrollFrame);
      }
    });
  }

  window.initScrollableRails = initScrollableRails;

  document.querySelectorAll('.search-bar input').forEach(input => {
    const context = input.dataset.searchContext || 'inline';
    if (context === 'specialists-page') return;

    input.addEventListener('focus', () => {
      if (context === 'overlay') {
        renderSearchModalResults(input.value.trim());
        return;
      }
      if (input.value.trim()) renderSearchSuggestions(input);
    });

    input.addEventListener('input', () => {
      if (context === 'overlay') {
        renderSearchModalResults(input.value.trim());
        return;
      }
      renderSearchSuggestions(input);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (context === 'overlay') {
          goToSpecialistsSearch(input.value.trim());
          return;
        }
        submitInlineSearch(input);
      }

      if (event.key === 'Escape' && context === 'overlay') {
        closeSearchModal();
      }
    });
  });

  const homeHeroSearchForm = document.querySelector('[data-home-hero-search]');
  if (homeHeroSearchForm instanceof HTMLFormElement) {
    const homeHeroSearchInput = homeHeroSearchForm.querySelector('input[name="query"]');
    homeHeroSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      submitInlineSearch(homeHeroSearchInput);
    });
  }

  renderHomepageCategories();
  renderHomepageTrendingJobs();
  renderHomeAvailableJobs();
  initHomeHeroSearchTyping();
  initHomeMarketScrollers();
  initHomeCardCarousels();
  initScrollableRails(document);

  if (searchSuggestions) {
    searchSuggestions.addEventListener('mousedown', (event) => {
      const button = event.target.closest('.search-suggestion');
      if (!button || button.classList.contains('is-empty')) return;
      event.preventDefault();
      const value = button.getAttribute('data-query') || '';
      const category = button.getAttribute('data-category') || '';
      const service = button.getAttribute('data-service') || '';
      if (activeSearchInput) activeSearchInput.value = value;
      hideSearchSuggestions();
      goToSpecialistsSearch(value, { category, service });
    });
  }

  if (searchModal) {
    searchModal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === searchModal || target.closest('.mobile-search-close')) {
        closeSearchModal();
        return;
      }

      const result = target.closest('.mobile-search-result');
      if (result instanceof HTMLElement && searchModalInput) {
        const value = result.getAttribute('data-query') || '';
        const category = result.getAttribute('data-category') || '';
        const service = result.getAttribute('data-service') || '';
        goToSpecialistsSearch(value, { category, service });
      }
    });
  }

  window.addEventListener('resize', () => {
    if (activeSearchInput && searchSuggestions && !searchSuggestions.hidden) {
      positionSearchSuggestions(activeSearchInput);
    }
  });

  window.addEventListener('scroll', () => {
    if (activeSearchInput && searchSuggestions && !searchSuggestions.hidden) {
      positionSearchSuggestions(activeSearchInput);
    }
  }, { passive: true });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (searchSuggestions && searchSuggestions.contains(target)) return;
    if (target instanceof HTMLElement && target.closest('.search-bar')) return;
    if (target instanceof HTMLElement && target.closest('.mobile-search-panel')) return;
    hideSearchSuggestions();
  });

  const mobileFilterToggle = document.querySelector('.mobile-filter-toggle');
  const filtersCloseBtn = document.querySelector('.filters-close-btn');
  const catalogMobileOverlay = document.querySelector('.catalog-mobile-overlay');
  const sortDropdowns = document.querySelectorAll('.sort-dropdown');

  if (mobileFilterToggle) {
    mobileFilterToggle.addEventListener('click', () => {
      document.body.classList.add('mobile-filters-open');
    });
  }

  if (filtersCloseBtn) {
    filtersCloseBtn.addEventListener('click', () => {
      document.body.classList.remove('mobile-filters-open');
    });
  }

  if (catalogMobileOverlay) {
    catalogMobileOverlay.addEventListener('click', () => {
      document.body.classList.remove('mobile-filters-open');
      sortDropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-open');
        const toggle = dropdown.querySelector('button[aria-expanded]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  sortDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('button[aria-expanded]');
    const options = dropdown.querySelectorAll('.mobile-sort-option, .desktop-sort-option');

    if (toggle) {
      toggle.addEventListener('click', () => {
        const willOpen = !dropdown.classList.contains('is-open');
        sortDropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('is-open');
            const otherToggle = other.querySelector('button[aria-expanded]');
            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    }

    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(item => item.classList.remove('is-active'));
        option.classList.add('is-active');
        if (toggle) {
          const label = option.textContent.trim();
          const labelSpan = toggle.querySelector('span');
          if (labelSpan) labelSpan.textContent = label;
          toggle.setAttribute('aria-expanded', 'false');
        }
        dropdown.classList.remove('is-open');
      });
    });
  });

  document.addEventListener('error', (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallbackApplied === 'true') return;
    image.dataset.fallbackApplied = 'true';
    image.src = `${getSiteBasePath()}images/logo/logo.jpg`;
  }, true);

  // Filter chips toggle
  document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.toggle('active');
    });
  });

  // Grid toggle
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;

    sortDropdowns.forEach(dropdown => {
      if (!dropdown.classList.contains('is-open')) return;
      if (dropdown.contains(target)) return;
      dropdown.classList.remove('is-open');
      const toggle = dropdown.querySelector('button[aria-expanded]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const toggleBtns = document.querySelectorAll('.grid-toggle');
  const catalogGrid = document.querySelector('.catalog-grid');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view || 'grid';
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (catalogGrid) {
        catalogGrid.dataset.view = view;
      }
    });
  });

  const wishlistTrendingRow = document.querySelector('.wishlist-trending-row');
  document.querySelectorAll('.wishlist-scroll-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!wishlistTrendingRow) return;
      const direction = index === 0 ? -1 : 1;
      wishlistTrendingRow.scrollBy({
        left: direction * 260,
        behavior: 'smooth'
      });
    });
  });

  const accountStorageKey = 'softgiggles_account';
  const accountAuthOverlay = document.getElementById('account-auth-overlay');
  const accountAuthClose = document.querySelector('.account-auth-close');
  const accountAuthPanel = document.querySelector('.account-auth-panel');
  const accountLoggedOutTriggers = document.querySelectorAll('.account-menu-host.is-logged-out .account-trigger, .account-guest-open');
  const accountGoogleBtn = document.querySelector('.account-google-btn');
  const accountPhoneToggle = document.querySelector('.account-phone-toggle');
  const accountEmailToggle = document.querySelector('.account-email-toggle');
  const accountGoogleCard = document.querySelector('.account-method-google');
  const accountPhoneCard = document.querySelector('.account-method-phone');
  const accountEmailCard = document.querySelector('.account-method-email');
  const accountMethodDivider = document.querySelector('.account-method-divider');
  const accountPhoneFormWrap = document.querySelector('.account-phone-form-wrap');
  const accountPhoneInput = document.getElementById('account-phone');
  const accountPhoneSubmit = document.querySelector('.account-phone-submit');
  const accountCodeRow = document.querySelector('.account-code-row');
  const accountPhoneCode = document.getElementById('account-phone-code');
  const accountPhoneVerify = document.querySelector('.account-phone-verify');
  const accountEmailFormWrap = document.querySelector('.account-email-form-wrap');
  const accountEmailForm = document.getElementById('account-email-form');
  const accountFormError = document.querySelector('[data-account-form-error]');
  const accountEmailInput = document.getElementById('account-email');
  const accountIdentifierModeInput = document.getElementById('account-identifier-mode');
  const accountIdentifierSwitch = document.querySelector('[data-account-identifier-switch]');
  const accountIdentifierLabel = document.querySelector('[data-account-identifier-label]');
  const accountNameInput = document.getElementById('account-name');
  const accountModeSwitch = document.querySelector('.account-mode-switch');
  const accountForgotPasswordBtn = document.querySelector('.account-forgot-password');
  const accountChangeMethodBtns = document.querySelectorAll('.account-change-method');
  const accountModeInput = document.getElementById('account-mode');
  const accountSuccessToast = document.getElementById('account-success-toast');
  const accountHeading = document.querySelector('.account-auth-heading');
  const accountSubtext = document.querySelector('.account-auth-subtext');
  const accountSwitchLabel = document.querySelector('.account-switch-label');
  const accountSubmitBtn = document.querySelector('.account-email-form .account-submit-btn');
  const accountSubmitBtnLabel = document.querySelector('.account-email-form .account-btn-label');
  const accountNameRow = document.querySelector('.account-name-row');
  const accountDashboard = document.getElementById('account-dashboard');
  const accountGuestCard = document.getElementById('account-guest-card');
  const accountDisplayName = document.getElementById('account-display-name');
  const accountProfileName = document.getElementById('account-profile-name');
  const accountProfileEmail = document.getElementById('account-profile-email');
  const accountPageLogout = document.querySelector('.account-side-logout');
  const accountJobsAndBidsLinks = document.querySelectorAll('[data-account-jobs-bids-link]');
  const accountProviderOnlyLinks = document.querySelectorAll('[data-account-provider-only]');
  const accountDeleteLink = document.querySelector('.account-delete-link');
  const accountDeleteOverlay = document.getElementById('account-delete-overlay');
  const accountDeleteClose = document.querySelector('.account-delete-close');
  const accountDeleteCancel = document.querySelector('.account-delete-cancel');
  const accountDeleteConfirm = document.querySelector('.account-delete-confirm');
  const accountDeleteInput = document.getElementById('account-delete-confirmation');
  const accountDeleteLabel = document.getElementById('account-delete-label');
  const accountDeleteTargetLabel = document.getElementById('account-delete-target-label');
  const accountPageModeInput = document.getElementById('account-page-mode');
  const accountPageModeSwitch = document.querySelector('.account-page-mode-switch');
  const accountPageGoogleBtn = document.querySelector('.account-page-google-btn');
  const accountPageEmailForm = document.getElementById('account-page-email-form');
  const accountPageFormError = document.querySelector('[data-account-page-form-error]');
  const accountPageNameRow = document.querySelector('.account-page-name-row');
  const accountPageNameInput = document.getElementById('account-page-name');
  const accountPageEmailInput = document.getElementById('account-page-email');
  const accountPageIdentifierModeInput = document.getElementById('account-page-identifier-mode');
  const accountPageIdentifierSwitch = document.querySelector('[data-account-page-identifier-switch]');
  const accountPageIdentifierLabel = document.querySelector('[data-account-page-identifier-label]');
  const accountPagePasswordInput = document.getElementById('account-page-password');
  const accountPageHeading = document.querySelector('.account-auth-page-heading');
  const accountPageSubtextLabel = document.querySelector('.account-auth-page-subtext-label');
  const accountPageSubmitBtn = document.querySelector('.account-page-submit-btn');
  const accountPageForgotPasswordBtn = document.querySelector('.account-page-forgot-password');
  const homeGetFoundBtn = document.querySelector('[data-home-get-found]');
  const accountPageParams = new URLSearchParams(window.location.search);
  const isEmbeddedAccountPage = accountPageParams.get('embed') === '1';
  const requestedAccountPageMode = accountPageParams.get('mode') === 'signin' ? 'signin' : 'signup';

  function readAccount() {
    try {
      const raw = localStorage.getItem(accountStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeAccount(account) {
    try {
      localStorage.setItem(accountStorageKey, JSON.stringify(account));
    } catch (error) {
      // Ignore storage issues to avoid blocking UI.
    }
  }

  function openAccountPanel() {
    if (!accountAuthOverlay) return;
    accountAuthOverlay.hidden = false;
    if (typeof window.ensureWorkLinkAuth === 'function') {
      window.ensureWorkLinkAuth().catch(() => {});
    }
    requestAnimationFrame(() => {
      accountAuthOverlay.classList.add('is-visible');
    });
  }

  function closeAccountPanel() {
    if (!accountAuthOverlay) return;
    accountAuthOverlay.classList.remove('is-visible');
    setTimeout(() => {
      accountAuthOverlay.hidden = true;
    }, 240);
  }

  function getAuthHelper() {
    return window.softGigglesAuth || null;
  }

  async function getAuthHelperReady() {
    const existing = getAuthHelper();
    if (existing) return existing;
    if (typeof window.ensureWorkLinkAuth === 'function') {
      try {
        return await window.ensureWorkLinkAuth();
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  const pendingReviewPromptState = {
    checking: false,
    open: false,
    activeKey: ''
  };

  function closePendingReviewPrompt() {
    const shell = document.querySelector('[data-pending-review-shell]');
    if (shell instanceof HTMLElement) shell.remove();
    document.body.classList.remove('job-modal-open');
    pendingReviewPromptState.open = false;
    pendingReviewPromptState.activeKey = '';
  }

  function buildPendingReviewStarsMarkup(selectedRating = 0) {
    return Array.from({ length: 5 }, (_, index) => {
      const value = index + 1;
      return `<button type="button" class="star ${value <= selectedRating ? 'is-selected' : ''}" data-pending-review-star="${value}">&#9733;</button>`;
    }).join('');
  }

  function openPendingReviewPrompt(item, authHelper) {
    if (!item?.jobId || !item?.applicationId) return;
    closePendingReviewPrompt();

    const workerName = String(item.application?.bidderName || item.application?.bidderUid || 'Worker').trim();
    const jobTitle = String(item.job?.subcategory || item.job?.category || 'Job').trim();
    const shell = document.createElement('div');
    shell.className = 'job-review-modal-shell worklinkup-review-prompt-shell';
    shell.setAttribute('data-pending-review-shell', '1');
    shell.innerHTML = `
      <div class="job-review-modal-panel worklinkup-review-prompt-panel" role="dialog" aria-modal="true" aria-label="Rate worker">
        <button type="button" class="job-modal-close" data-pending-review-close><i class="fa-solid fa-xmark"></i></button>
        <div class="job-review-head">
          <div class="job-review-provider-icon"><span>${escapeHtml(workerName.slice(0, 2).toUpperCase() || 'WL')}</span></div>
          <div>
            <strong>Rate ${escapeHtml(workerName)}</strong>
            <div class="job-review-meta"><span>${escapeHtml(jobTitle)}</span></div>
          </div>
        </div>
        <div class="job-review-body">
          <p class="worklinkup-review-prompt-copy">This worker marked the job as finished. Leave your star rating and an optional comment.</p>
          <div class="job-review-stars" data-pending-review-stars>${buildPendingReviewStarsMarkup(0)}</div>
          <textarea placeholder="Add a short comment if you want" data-pending-review-comment></textarea>
          <div class="job-review-footer">
            <button type="button" class="btn-secondary fleece-secondary" data-pending-review-close>Later</button>
            <button type="button" class="btn-primary" data-pending-review-submit>Submit Review</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(shell);
    document.body.classList.add('job-modal-open');
    pendingReviewPromptState.open = true;
    pendingReviewPromptState.activeKey = `${item.jobId}:${item.applicationId}`;

    const closeButtons = shell.querySelectorAll('[data-pending-review-close]');
    closeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        closePendingReviewPrompt();
      });
    });

    let selectedRating = 0;
    const syncStars = () => {
      shell.querySelectorAll('[data-pending-review-star]').forEach((button) => {
        const value = Number(button.getAttribute('data-pending-review-star') || 0);
        button.classList.toggle('is-selected', value <= selectedRating);
      });
    };

    shell.querySelectorAll('[data-pending-review-star]').forEach((button) => {
      button.addEventListener('click', () => {
        selectedRating = Number(button.getAttribute('data-pending-review-star') || 0);
        syncStars();
      });
    });

    shell.querySelector('[data-pending-review-submit]')?.addEventListener('click', async () => {
      const submitButton = shell.querySelector('[data-pending-review-submit]');
      const comment = String(shell.querySelector('[data-pending-review-comment]')?.value || '').trim();
      if (!selectedRating) {
        window.alert('Please choose a rating.');
        return;
      }

      if (submitButton instanceof HTMLButtonElement) submitButton.disabled = true;
      try {
        await authHelper.submitJobReview(item.jobId, item.applicationId, {
          rating: selectedRating,
          comment
        });
        closePendingReviewPrompt();
        showAccountSuccess('Review saved');
        window.dispatchEvent(new CustomEvent('worklinkup-review-prompt-refresh'));
      } catch (error) {
        window.alert(error?.message || 'Could not save that review.');
        if (submitButton instanceof HTMLButtonElement) submitButton.disabled = false;
      }
    });
  }

  async function maybePromptPendingJobReview() {
    if (pendingReviewPromptState.checking || pendingReviewPromptState.open) return;

    const account = readAccount();
    if (!account?.loggedIn || !account.uid) return;

    const authHelper = await getAuthHelperReady();
    if (!authHelper || typeof authHelper.listPendingJobReviews !== 'function' || typeof authHelper.submitJobReview !== 'function') {
      return;
    }

    pendingReviewPromptState.checking = true;
    try {
      if (typeof authHelper.waitForAuthSession === 'function') {
        await authHelper.waitForAuthSession(account.uid, 8000).catch(() => null);
      }
      const pendingReviews = await authHelper.listPendingJobReviews(account.uid).catch(() => []);
      const nextReview = Array.isArray(pendingReviews) ? pendingReviews[0] : null;
      if (!nextReview) return;

      const nextKey = `${nextReview.jobId}:${nextReview.applicationId}`;
      if (pendingReviewPromptState.activeKey === nextKey) return;
      openPendingReviewPrompt(nextReview, authHelper);
    } finally {
      pendingReviewPromptState.checking = false;
    }
  }

  function getAccountErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
    return String(error?.message || fallback).trim();
  }

  function setAccountFormError(target, message = '') {
    if (!(target instanceof HTMLElement)) return;
    const text = String(message || '').trim();
    target.textContent = text;
    target.hidden = !text;
    target.classList.toggle('is-visible', Boolean(text));
  }

  function clearAccountFormError(target) {
    setAccountFormError(target, '');
  }

  function setMethodVisibility(method) {
    if (!accountGoogleCard || !accountPhoneCard || !accountEmailCard) return;

    const showAll = method === 'all';
    accountGoogleCard.classList.toggle('is-hidden', !showAll);
    accountPhoneCard.classList.toggle('is-hidden', !(showAll || method === 'phone'));
    accountEmailCard.classList.toggle('is-hidden', !(showAll || method === 'email'));

    if (accountMethodDivider) {
      accountMethodDivider.classList.toggle('is-hidden', !(showAll || method === 'email'));
    }
  }

  function showAccountSuccess(message = 'Signed in successfully', callback) {
    if (!accountSuccessToast) {
      if (typeof callback === 'function') callback();
      return;
    }
    const label = accountSuccessToast.querySelector('span');
    if (label) label.textContent = message;
    accountSuccessToast.hidden = false;
    requestAnimationFrame(() => {
      accountSuccessToast.classList.add('is-visible');
    });
    window.setTimeout(() => {
      accountSuccessToast.classList.remove('is-visible');
      window.setTimeout(() => {
        accountSuccessToast.hidden = true;
        if (typeof callback === 'function') callback();
      }, 220);
    }, 1200);
  }

  async function routeAfterAuthSuccess() {
    const authHelper = await getAuthHelperReady();
    const base = getSiteBasePath();

    if (authHelper && typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession('', 12000).catch(() => null);
    }

    // Check if we're in an iframe (embed mode)
    const isEmbedded = window !== window.parent && new URLSearchParams(window.location.search).get('embed') === '1';

    if (isEmbedded) {
      window.parent?.postMessage({ type: 'worklinkup-setup-complete' }, '*');
      return;
    }

    // Always take them home after login/signup as requested
    window.location.replace(`${base}index.html`);
  }

  function finalizeAuthSuccess(message) {
    showAccountSuccess(message, () => {
      closeAccountPanel();
      routeAfterAuthSuccess();
    });
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.classList.toggle('is-loading', isLoading);
    button.classList.toggle('has-jimu-loader', isLoading && button.classList.contains('account-submit-btn'));
    button.disabled = isLoading;

    if (!button.classList.contains('account-submit-btn')) return;

    const loader = button.querySelector('.loader');
    if (isLoading && !loader) {
      button.insertAdjacentHTML('beforeend', `
        <div class="loader" aria-hidden="true">
          <div class="justify-content-center jimu-primary-loading"></div>
        </div>
      `);
    }

    if (!isLoading && loader) {
      loader.remove();
    }
  }

  function syncAccountMode(mode) {
    clearAccountFormError(accountFormError);
    if (!accountModeInput) return;
    accountModeInput.value = mode;
    const isSignup = mode === 'signup';
    if (accountHeading) accountHeading.textContent = 'Welcome';
    if (accountSubtext) accountSubtext.textContent = 'Create an account or sign in to continue with WorkLinkUp.';
    if (accountSwitchLabel) accountSwitchLabel.textContent = isSignup ? 'Already have an account?' : 'Joining us for the first time?';
    if (accountModeSwitch) accountModeSwitch.textContent = isSignup ? 'Sign In' : 'Create Account';
    if (accountSubmitBtn) {
      accountSubmitBtn.classList.toggle('account-submit-signup', isSignup);
      accountSubmitBtn.classList.toggle('account-submit-signin', !isSignup);
    }
    if (accountSubmitBtnLabel) accountSubmitBtnLabel.textContent = isSignup ? 'Create Account' : 'Sign In';
    if (accountNameRow) {
      accountNameRow.hidden = !isSignup;
      accountNameRow.style.display = isSignup ? '' : 'none';
    }
    if (accountNameInput) {
      accountNameInput.disabled = !isSignup;
      accountNameInput.required = isSignup;
      if (!isSignup) accountNameInput.value = '';
    }
    if (accountIdentifierSwitch) accountIdentifierSwitch.hidden = isSignup;
    syncIdentifierField(accountEmailInput, accountIdentifierLabel, accountIdentifierModeInput?.value || 'email', isSignup);
  }

  function syncAccountPageMode(mode) {
    clearAccountFormError(accountPageFormError);
    if (!accountPageModeInput || isEmbeddedAccountPage) return;
    const isSignup = mode === 'signup';
    accountPageModeInput.value = mode;
    if (accountPageHeading) accountPageHeading.textContent = isSignup ? 'Create a new account' : 'Sign in to your account';
    if (accountPageSubtextLabel) accountPageSubtextLabel.textContent = isSignup ? 'Already have an account?' : 'New to WorkLinkUp?';
    if (accountPageNameRow) accountPageNameRow.hidden = !isSignup;
    if (accountPageNameInput) {
      accountPageNameInput.disabled = !isSignup;
      accountPageNameInput.required = isSignup;
      if (!isSignup) accountPageNameInput.value = '';
    }
    if (accountPageIdentifierSwitch) accountPageIdentifierSwitch.hidden = isSignup;
    if (accountPageSubmitBtn) {
      accountPageSubmitBtn.classList.toggle('account-submit-signup', isSignup);
      accountPageSubmitBtn.classList.toggle('account-submit-signin', !isSignup);
      const label = accountPageSubmitBtn.querySelector('.account-btn-label');
      if (label) label.textContent = isSignup ? 'Create Account' : 'Sign In';
    }
    if (accountPageModeSwitch) accountPageModeSwitch.textContent = isSignup ? 'Sign in' : 'Create account';
    syncIdentifierField(accountPageEmailInput, accountPageIdentifierLabel, accountPageIdentifierModeInput?.value || 'email', isSignup);
  }

  function syncIdentifierField(input, label, mode = 'email', forceEmail = false) {
    if (!(input instanceof HTMLInputElement)) return;
    const normalizedMode = forceEmail ? 'email' : (mode === 'username' ? 'username' : 'email');
    const isUsername = normalizedMode === 'username';
    if (label instanceof HTMLElement) {
      label.textContent = isUsername ? 'Username' : 'Email address';
    }
    input.type = isUsername ? 'text' : 'email';
    input.inputMode = isUsername ? 'text' : 'email';
    input.autocapitalize = 'none';
    input.autocomplete = isUsername ? 'username' : 'email';
    input.placeholder = isUsername ? 'john_smith' : 'you@example.com';
  }

  function bindIdentifierSwitch(container, hiddenInput, input, label, isSignupCheck) {
    if (!(container instanceof HTMLElement) || !(hiddenInput instanceof HTMLInputElement)) return;
    container.querySelectorAll('[data-account-identifier-option], [data-account-page-identifier-option]').forEach((button) => {
      button.addEventListener('click', () => {
        if (typeof isSignupCheck === 'function' && isSignupCheck()) return;
        const nextMode = button.getAttribute('data-account-identifier-option')
          || button.getAttribute('data-account-page-identifier-option')
          || 'email';
        hiddenInput.value = nextMode === 'username' ? 'username' : 'email';
        container.querySelectorAll('button').forEach((item) => {
          item.classList.toggle('is-active', item === button);
        });
        syncIdentifierField(input, label, hiddenInput.value, false);
        clearAccountFormError(container.closest('#account-page-email-form') ? accountPageFormError : accountFormError);
        input?.focus();
      });
    });
  }

  function readSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function clearSessionFlag(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function setSessionFlag(key, value = '1') {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  async function maybeHandleRedirectedGoogleAuth() {
    if (isEmbeddedAccountPage) return;
    const hasRedirectSuccess = readSessionFlag('worklinkup_google_redirect_success');
    if (!hasRedirectSuccess) return;
    const authHelper = await getAuthHelperReady();
    if (authHelper && typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession('', 12000).catch(() => null);
    }
    clearSessionFlag('worklinkup_google_redirect_success');
    if (window.location.pathname.endsWith('/account.html')) {
      closeAccountPanel();
      routeAfterAuthSuccess();
      return;
    }
    showAccountSuccess('Signed in successfully', () => {
      closeAccountPanel();
      routeAfterAuthSuccess();
    });
  }

  function openWorkLinkUpSetupModal(pendingSearch = '', options = {}) {
    const normalizedSearch = String(pendingSearch || '').trim()
      ? (String(pendingSearch).startsWith('?') ? String(pendingSearch) : `?${String(pendingSearch)}`)
      : '?setup=1';
    const delayMs = Number(options.delayMs ?? 0);
    const clearPendingOnClose = Boolean(options.clearPendingOnClose);
    const consumeOnceFlag = Boolean(options.consumeOnceFlag);
    const base = getSiteBasePath();
    const frameSrc = `${base}pages/account.html${normalizedSearch}${normalizedSearch.includes('embed=1') ? '' : `${normalizedSearch ? '&' : '?'}embed=1`}`;

    document.getElementById('pending-setup-overlay')?.remove();

    document.body.insertAdjacentHTML('beforeend', `
      <div class="pending-setup-overlay" id="pending-setup-overlay" hidden>
        <div class="pending-setup-backdrop"></div>
        <div class="pending-setup-panel" role="dialog" aria-modal="true" aria-label="Complete your account setup">
          <button type="button" class="pending-setup-close" aria-label="Close setup modal">×</button>
          <iframe class="pending-setup-frame" src="${frameSrc}" title="WorkLinkUp account setup"></iframe>
        </div>
      </div>
    `);

    const overlay = document.getElementById('pending-setup-overlay');
    const closeBtn = overlay?.querySelector('.pending-setup-close');
    let openTimer = 0;

    function closeModal(shouldClearPending = false) {
      if (!(overlay instanceof HTMLElement)) return;
      overlay.classList.remove('is-visible');
      document.body.classList.remove('pending-setup-open');
      window.setTimeout(() => {
        overlay.hidden = true;
        overlay.remove();
      }, 180);
      if (consumeOnceFlag) clearSessionFlag('worklinkup_show_setup_modal_once');
      if (shouldClearPending || clearPendingOnClose) {
        try {
          localStorage.removeItem('worklinkup_pending_setup');
        } catch (error) {
          // Ignore storage issues.
        }
      }
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
    }

    if (overlay instanceof HTMLElement) {
      openTimer = window.setTimeout(() => {
        overlay.hidden = false;
        requestAnimationFrame(() => {
          overlay.classList.add('is-visible');
          document.body.classList.add('pending-setup-open');
        });
        if (consumeOnceFlag) clearSessionFlag('worklinkup_show_setup_modal_once');
      }, Math.max(0, delayMs));
    }

    closeBtn?.addEventListener('click', () => closeModal(false));
    overlay?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains('pending-setup-backdrop')) {
        closeModal(false);
      }
    });

    const messageHandler = (event) => {
      const eventOrigin = String(event.origin || '').trim();
      const currentOrigin = String(window.location.origin || '').trim();
      
      // Only check origin if both are defined and same-origin is expected
      if (eventOrigin && currentOrigin && eventOrigin !== currentOrigin) {
        return;
      }
      
      if (event.data?.type === 'worklinkup-setup-complete') {
        if (openTimer) window.clearTimeout(openTimer);
        closeModal(true);

        const redirectUrl = event.data?.redirectUrl
          ? `${getSiteBasePath()}${event.data.redirectUrl}`
          : null;

        // Show success toast on parent before redirecting
        const toast = document.createElement('div');
        toast.textContent = 'Profile completed — redirecting…';
        Object.assign(toast.style, {
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#ffffff', color: '#0b0b0b', padding: '10px 20px',
          borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
          zIndex: '9999', fontWeight: '700', fontSize: '15px'
        });
        document.body.appendChild(toast);

        window.setTimeout(() => {
          toast.remove();
          if (redirectUrl) {
            window.location.href = redirectUrl;
          } else {
            window.location.reload();
          }
        }, 1200);
        return;
      }
      if (event.data?.type === 'worklinkup:profile-saved') {
        closeModal(false);
        if (openTimer) window.clearTimeout(openTimer);
      }
    };

    window.addEventListener('message', messageHandler);
  }

  window.openWorkLinkUpSetupModal = openWorkLinkUpSetupModal;

  async function handleHomeGetFoundClick() {
    const base = getSiteBasePath();
    const account = readAccount();
    if (!account?.loggedIn || !account?.uid) {
      openAccountPanel();
      return;
    }

    const authHelper = await getAuthHelperReady();
    if (!authHelper) {
      window.location.href = `${base}pages/account.html?mode=signin`;
      return;
    }

    try {
      const userDoc = await authHelper.getUserDocument(account.uid).catch(() => null);
      const providerProfile = await authHelper.getProviderProfileByUid(
        account.uid,
        userDoc?.providerProvinceSlug || account.providerProvinceSlug || ''
      ).catch(() => null);
      const isProvider = String(userDoc?.userRole || account.userRole || '').trim().toLowerCase() === 'provider';
      const providerComplete = Boolean(userDoc?.providerProfileComplete || providerProfile?.uid);

      if (isProvider && providerComplete) {
        window.location.href = `${base}pages/my-posts.html`;
        return;
      }

      openWorkLinkUpSetupModal('?setup=provider', {
        clearPendingOnClose: true
      });
    } catch (error) {
      openWorkLinkUpSetupModal('?setup=provider', {
        clearPendingOnClose: true
      });
    }
  }

  function initPendingSetupModal() {
    if (!document.body.classList.contains('home-page-body')) return;
    if (!readSessionFlag('worklinkup_show_setup_modal_once')) return;

    let pendingSearch = '';
    try {
      pendingSearch = localStorage.getItem('worklinkup_pending_setup') || '';
    } catch (error) {
      pendingSearch = '';
    }

    const account = readAccount();
    if (!account?.loggedIn || !pendingSearch) return;
    openWorkLinkUpSetupModal(pendingSearch, {
      delayMs: 2000,
      consumeOnceFlag: true
    });
  }

  function applyAccountToPage() {
    if (!accountDashboard || !accountGuestCard) return;
    if (isEmbeddedAccountPage) {
      accountDashboard.hidden = true;
      accountGuestCard.hidden = true;
      return;
    }
    const account = readAccount();
    const isLoggedIn = Boolean(account && account.loggedIn);
    accountDashboard.hidden = !isLoggedIn;
    accountGuestCard.hidden = isLoggedIn;
    if (!isLoggedIn) return;

    const name = account.name || 'WorkLinkUp User';
    const email = account.email || 'you@example.com';
    const isProvider = String(account.userRole || '').trim().toLowerCase() === 'provider';
    const jobsAndBidsHref = 'job-giver-profile.html';
    if (accountDisplayName) accountDisplayName.textContent = name;
    if (accountProfileName) accountProfileName.textContent = name;
    if (accountProfileEmail) accountProfileEmail.textContent = email;
    accountJobsAndBidsLinks.forEach((link) => {
      if (link instanceof HTMLAnchorElement) {
        link.href = jobsAndBidsHref;
      }
    });
    accountProviderOnlyLinks.forEach((link) => {
      if (!(link instanceof HTMLElement)) return;
      link.hidden = !isProvider;
    });
  }

  function getDeleteIdentifier(account) {
    if (!account) return { label: 'Email address', value: '' };
    const provider = String(account.provider || '');
    const phone = String(account.phone || '').trim();
    const email = String(account.email || '').trim();
    if (provider.includes('phone') || (!email && phone)) {
      return { label: 'Phone number', value: phone };
    }
    return { label: 'Email address', value: email };
  }

  function syncDeleteConfirmationState() {
    const account = readAccount();
    const expected = getDeleteIdentifier(account).value;
    const typed = String(accountDeleteInput?.value || '').trim();
    if (accountDeleteConfirm) {
      accountDeleteConfirm.disabled = !expected || typed !== expected;
    }
  }

  function openDeleteModal() {
    if (!accountDeleteOverlay) return;
    const account = readAccount();
    const target = getDeleteIdentifier(account);
    if (accountDeleteLabel) accountDeleteLabel.textContent = target.label;
    if (accountDeleteTargetLabel) accountDeleteTargetLabel.textContent = target.value || 'No identifier found';
    if (accountDeleteInput) {
      accountDeleteInput.value = '';
      accountDeleteInput.placeholder = `Type your ${target.label.toLowerCase()} exactly`;
    }
    syncDeleteConfirmationState();
    accountDeleteOverlay.hidden = false;
  }

  function closeDeleteModal() {
    if (!accountDeleteOverlay) return;
    accountDeleteOverlay.hidden = true;
  }

  function promptAccountSignIn() {
    if (accountAuthOverlay) {
      openAccountPanel();
      return;
    }
    window.alert('Please sign in first.');
  }

  const cartStorageKey = 'softgiggles_cart';
  const wishlistStorageKey = 'softgiggles_wishlist';
  const freeDeliveryThreshold = 600;

  function getSiteBasePath() {
    if (typeof getBasePath === 'function') return getBasePath();
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  function slugifyProductId(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function readCollection(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeCollection(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage issues and keep the interface usable.
    }
  }

  function readCart() {
    return readCollection(cartStorageKey);
  }

  function writeCart(items) {
    writeCollection(cartStorageKey, items);
  }

  function readWishlist() {
    return readCollection(wishlistStorageKey);
  }

  function writeWishlist(items) {
    writeCollection(wishlistStorageKey, items);
  }

  function parsePrice(priceText) {
    const text = String(priceText || '').trim();
    const numeric = Number.parseFloat(text.replace(/[^0-9.]+/g, '')) || 0;
    const currencySymbol = text.includes('$') ? '$' : 'R';
    return { amount: numeric, currencySymbol };
  }

  function formatMoney(amount, currencySymbol = 'R') {
    return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
  }

  function inferColour(name) {
    const colours = [
      'yellow', 'natural', 'pink', 'grey', 'gray', 'brown', 'burgundy', 'blue',
      'green', 'olive', 'charcoal', 'tan', 'teal', 'black', 'white', 'red'
    ];
    const lowerName = String(name || '').toLowerCase();
    const match = colours.find((colour) => lowerName.includes(colour));
    if (!match) return 'ASSORTED';
    return match === 'gray' ? 'GREY' : match.toUpperCase();
  }

  function syncCartBadge(count = readCart().reduce((total, item) => total + Number(item.quantity || 0), 0)) {
    document.querySelectorAll('.cart-badge').forEach((badge) => {
      badge.textContent = String(count);
    });
  }

  function getCartSummary(items = readCart()) {
    const cartItems = Array.isArray(items) ? items : [];
    const subtotal = cartItems.reduce((total, item) => total + (Number(item.amount) * Number(item.quantity || 0)), 0);
    const currencySymbol = cartItems[0]?.currencySymbol || 'R';
    const quantity = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return { items: cartItems, subtotal, currencySymbol, quantity };
  }

  function buildCartItemMarkup(item, context = 'drawer') {
    const controlsClass = context === 'page' ? 'cart-line-controls is-page' : 'cart-line-controls';
    return `
      <article class="cart-line-item" data-cart-item-id="${item.id}">
        <div class="cart-line-media">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-line-content">
          <div class="cart-line-head">
            <div>
              <h3>${item.name}</h3>
              <p>Colour: ${item.colour}</p>
              <p>Size: ${item.size}</p>
            </div>
            <button type="button" class="cart-line-remove" data-cart-remove="${item.id}">Remove</button>
          </div>
          <div class="${controlsClass}">
            <div class="cart-qty-control">
              <button type="button" aria-label="Decrease quantity" data-cart-qty="${item.id}" data-cart-change="-1">−</button>
              <span>${item.quantity}</span>
              <button type="button" aria-label="Increase quantity" data-cart-qty="${item.id}" data-cart-change="1">+</button>
            </div>
            <strong>${formatMoney(item.amount * item.quantity, item.currencySymbol)}</strong>
          </div>
        </div>
      </article>
    `;
  }

  function renderCartDrawer() {
    const drawerItemsHost = document.querySelector('[data-cart-drawer-items]');
    const subtotalLabel = document.querySelector('[data-cart-subtotal]');
    const progressCopy = document.querySelector('.cart-progress-copy');
    const progressFill = document.querySelector('.cart-progress-fill');
    if (!drawerItemsHost || !subtotalLabel || !progressCopy || !progressFill) return;

    const { items, subtotal, currencySymbol } = getCartSummary();
    subtotalLabel.textContent = formatMoney(subtotal, currencySymbol);

    const progressRatio = Math.min(subtotal / freeDeliveryThreshold, 1);
    progressFill.style.width = `${progressRatio * 100}%`;
    const amountRemaining = Math.max(freeDeliveryThreshold - subtotal, 0);
    progressCopy.textContent = amountRemaining > 0
      ? `Spend ${formatMoney(amountRemaining, currencySymbol)} more and receive free delivery.`
      : 'You have qualified for free delivery.';

    drawerItemsHost.innerHTML = items.length
      ? items.map((item) => buildCartItemMarkup(item, 'drawer')).join('')
      : `
        <div class="cart-empty-state">
          <div class="cart-empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <h3>Your cart is empty</h3>
          <p>Add a few baby essentials and they will appear here.</p>
        </div>
      `;
  }

  function renderWishlistButtons() {
    const wishlist = readWishlist();
    const wishlistIds = new Set(wishlist.map((item) => item.id));
    document.querySelectorAll('.product-card').forEach((card) => {
      const product = getProductFromCard(card);
      const button = card.querySelector('.wishlist-btn');
      if (!button) return;
      const isSaved = wishlistIds.has(product.id);
      button.innerHTML = isSaved ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
      button.classList.toggle('is-active', isSaved);
      button.setAttribute('aria-label', isSaved ? 'Remove from wishlist' : 'Add to wishlist');
    });
  }

  function renderWishlistPage() {
    const emptyState = document.querySelector('[data-wishlist-empty]');
    const listSection = document.querySelector('[data-wishlist-list]');
    const listHost = document.querySelector('[data-wishlist-items]');
    if (!emptyState || !listSection || !listHost) return;

    const base = getSiteBasePath();
    const wishlist = readWishlist();
    emptyState.hidden = wishlist.length > 0;
    listSection.hidden = wishlist.length === 0;

    listHost.innerHTML = wishlist.map((item) => `
      <article class="wishlist-product-card" data-wishlist-item-id="${item.id}">
        <a href="${base}pages/cart.html" class="wishlist-product-image">
          <img src="${item.image}" alt="${item.name}" />
        </a>
        <div class="wishlist-product-copy">
          <h3>${item.name}</h3>
          <p>Colour: ${item.colour}</p>
          <p>Size: ${item.size}</p>
          <strong>${formatMoney(item.amount, item.currencySymbol)}</strong>
          <div class="wishlist-product-actions">
            <button type="button" class="wishlist-action-btn" data-wishlist-add-cart="${item.id}">Add to cart</button>
            <button type="button" class="wishlist-secondary-btn" data-wishlist-remove="${item.id}">Remove</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderCartPage() {
    const itemsHost = document.querySelector('[data-cart-page-items]');
    const summaryHost = document.querySelector('[data-cart-page-summary]');
    if (!itemsHost || !summaryHost) return;

    const { items, subtotal, currencySymbol, quantity } = getCartSummary();
    const amountRemaining = Math.max(freeDeliveryThreshold - subtotal, 0);
    const progressRatio = Math.min(subtotal / freeDeliveryThreshold, 1);

    itemsHost.innerHTML = items.length
      ? items.map((item) => buildCartItemMarkup(item, 'page')).join('')
      : `
        <div class="cart-page-empty">
          <h2>Your shopping cart is empty</h2>
          <p>Add products from the catalogue to continue shopping.</p>
          <a href="${getSiteBasePath()}index.html" class="cart-page-continue">Continue shopping</a>
        </div>
      `;

    summaryHost.innerHTML = `
      <section class="cart-summary-card">
        <div class="cart-drawer-progress cart-page-progress">
          <div class="cart-progress-track">
            <span class="cart-progress-fill" style="width:${progressRatio * 100}%"></span>
          </div>
          <p class="cart-progress-copy">${amountRemaining > 0 ? `Spend ${formatMoney(amountRemaining, currencySymbol)} more and receive free delivery.` : 'You have qualified for free delivery.'}</p>
        </div>
      </section>
      <section class="cart-summary-card">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <strong>${formatMoney(subtotal, currencySymbol)}</strong>
        </div>
        <p>Tax included. Shipping calculated at checkout.</p>
        <a href="${getSiteBasePath()}pages/checkout.html" class="cart-summary-checkout ${items.length ? '' : 'is-disabled'}">Checkout</a>
        <div class="cart-summary-safe">This is a secure checkout</div>
        <div class="cart-summary-count">${quantity} item${quantity === 1 ? '' : 's'} in cart</div>
      </section>
    `;
  }

  function renderCheckoutPage() {
    const deliveryInput = document.querySelector('[data-checkout-shipping]');
    const summaryTotal = document.querySelector('[data-checkout-total]');
    const summarySubtotal = document.querySelector('[data-checkout-subtotal]');
    const summaryShipping = document.querySelector('[data-checkout-shipping-copy]');
    const itemsHost = document.querySelector('[data-checkout-items]');
    const homePanel = document.querySelector('[data-home-delivery-panel]');
    const pickupPanel = document.querySelector('[data-pickup-panel]');
    const toggleButtons = document.querySelectorAll('[data-delivery-mode]');
    const payButton = document.querySelector('[data-pay-now]');
    if (!summaryTotal || !summarySubtotal || !summaryShipping || !itemsHost || !homePanel || !pickupPanel) return;

    const { items, subtotal, currencySymbol, quantity } = getCartSummary();
    const shippingValue = deliveryInput?.value === 'pickup' ? 0 : 0;
    const total = subtotal + shippingValue;

    summarySubtotal.textContent = `${formatMoney(subtotal, currencySymbol)} · ${quantity} item${quantity === 1 ? '' : 's'}`;
    summaryShipping.textContent = deliveryInput?.value === 'pickup' ? 'Pickup point selected' : 'Enter shipping address';
    summaryTotal.textContent = formatMoney(total, currencySymbol);
    itemsHost.innerHTML = items.map((item) => `
      <article class="checkout-order-item">
        <div class="checkout-order-media">
          <img src="${item.image}" alt="${item.name}" />
          <span>${item.quantity}</span>
        </div>
        <div class="checkout-order-copy">
          <h3>${item.name}</h3>
          <p>${item.colour} / ${item.size}</p>
        </div>
        <strong>${formatMoney(item.amount * item.quantity, item.currencySymbol)}</strong>
      </article>
    `).join('');

    toggleButtons.forEach((button) => {
      const isActive = button.dataset.deliveryMode === (deliveryInput?.value || 'delivery');
      button.classList.toggle('is-active', isActive);
    });
    homePanel.hidden = deliveryInput?.value === 'pickup';
    pickupPanel.hidden = deliveryInput?.value !== 'pickup';
    if (payButton) {
      payButton.disabled = items.length === 0;
    }
  }

  function renderCommerceUI() {
    syncCartBadge();
    renderCartDrawer();
    renderWishlistButtons();
    renderWishlistPage();
    renderCartPage();
    renderCheckoutPage();
  }

  function getProductFromCard(card) {
    const title = card.querySelector('.product-info h3')?.textContent?.trim() || 'SoftGiggles product';
    const price = card.querySelector('.price')?.textContent?.trim() || '';
    const imageValue = card.querySelector('.product-img img')?.getAttribute('src') || '';
    const category = document.querySelector('.page-header h1')?.textContent?.trim() || 'Catalog';
    const { amount, currencySymbol } = parsePrice(price);
    const image = imageValue ? new URL(imageValue, window.location.href).href : '';
    return {
      id: slugifyProductId(title),
      name: title,
      price,
      image,
      category,
      amount,
      currencySymbol,
      quantity: 1,
      size: '3-6 MTHS',
      colour: inferColour(title)
    };
  }

  async function handleCartAction(card, button, successLabel) {
    setButtonLoading(button, true);
    try {
      const product = getProductFromCard(card);
      const cart = readCart();
      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push(product);
      }
      writeCart(cart);
      document.dispatchEvent(new CustomEvent('softgiggles:cart-open'));
      renderCommerceUI();
      const defaultLabel = button.dataset.defaultLabel || button.textContent;
      button.textContent = successLabel;
      button.classList.add('is-added');
      window.setTimeout(() => {
        button.textContent = defaultLabel;
        button.classList.remove('is-added');
      }, 1200);
    } catch (error) {
      window.alert(error.message || 'Could not add item to cart.');
    } finally {
      setButtonLoading(button, false);
    }
  }

  function logoutAccount() {
    try {
      localStorage.removeItem(accountStorageKey);
    } catch (error) {
      // Ignore storage issues.
    }
    window.location.reload();
  }

  accountLoggedOutTriggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openAccountPanel();
    });
  });

  if (accountAuthClose) {
    accountAuthClose.addEventListener('click', closeAccountPanel);
  }

  if (accountAuthOverlay) {
    accountAuthOverlay.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === accountAuthOverlay) closeAccountPanel();
    });
  }

  if (accountEmailToggle && accountEmailFormWrap) {
    accountEmailToggle.addEventListener('click', () => {
      const willOpen = !accountEmailFormWrap.classList.contains('is-open');
      accountEmailFormWrap.classList.toggle('is-open', willOpen);
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      setMethodVisibility(willOpen ? 'email' : 'all');
    });
  }

  if (accountPhoneToggle && accountPhoneFormWrap) {
    accountPhoneToggle.addEventListener('click', () => {
      const willOpen = !accountPhoneFormWrap.classList.contains('is-open');
      accountPhoneFormWrap.classList.toggle('is-open', willOpen);
      if (accountEmailFormWrap) accountEmailFormWrap.classList.remove('is-open');
      setMethodVisibility(willOpen ? 'phone' : 'all');
    });
  }

  if (accountModeSwitch && accountModeInput) {
    accountModeSwitch.addEventListener('click', () => {
      const nextMode = accountModeInput.value === 'signup' ? 'signin' : 'signup';
      syncAccountMode(nextMode);
      if (accountEmailFormWrap) accountEmailFormWrap.classList.add('is-open');
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      setMethodVisibility('email');
    });
  }

  if (!isEmbeddedAccountPage && accountPageModeSwitch && accountPageModeInput) {
    accountPageModeSwitch.addEventListener('click', () => {
      const nextMode = accountPageModeInput.value === 'signup' ? 'signin' : 'signup';
      syncAccountPageMode(nextMode);
    });
  }

  if (accountForgotPasswordBtn && accountEmailInput) {
    accountForgotPasswordBtn.addEventListener('click', async () => {
      clearAccountFormError(accountFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper || typeof authHelper.resetPassword !== 'function') {
        setAccountFormError(accountFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      if (accountIdentifierModeInput?.value === 'username' && accountModeInput?.value !== 'signup') {
        setAccountFormError(accountFormError, 'Password reset works with email. Switch to Email first.');
        return;
      }
      const email = accountEmailInput.value.trim();
      if (!email) {
        setAccountFormError(accountFormError, 'Enter your email address first so we can send the reset link.');
        accountEmailInput.focus();
        return;
      }

      accountForgotPasswordBtn.disabled = true;
      try {
        await authHelper.resetPassword(email);
        clearAccountFormError(accountFormError);
        showAccountSuccess('Password reset email sent');
      } catch (error) {
        setAccountFormError(accountFormError, getAccountErrorMessage(error, 'Could not send reset email.'));
      } finally {
        accountForgotPasswordBtn.disabled = false;
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageForgotPasswordBtn && accountPageEmailInput) {
    accountPageForgotPasswordBtn.addEventListener('click', async () => {
      clearAccountFormError(accountPageFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper || typeof authHelper.resetPassword !== 'function') {
        setAccountFormError(accountPageFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      if (accountPageIdentifierModeInput?.value === 'username' && accountPageModeInput?.value !== 'signup') {
        setAccountFormError(accountPageFormError, 'Password reset works with email. Switch to Email first.');
        return;
      }
      const email = accountPageEmailInput.value.trim();
      if (!email) {
        setAccountFormError(accountPageFormError, 'Enter your email address first so we can send the reset link.');
        accountPageEmailInput.focus();
        return;
      }

      accountPageForgotPasswordBtn.disabled = true;
      try {
        await authHelper.resetPassword(email);
        clearAccountFormError(accountPageFormError);
        showAccountSuccess('Password reset email sent');
      } catch (error) {
        setAccountFormError(accountPageFormError, getAccountErrorMessage(error, 'Could not send reset email.'));
      } finally {
        accountPageForgotPasswordBtn.disabled = false;
      }
    });
  }

  accountChangeMethodBtns.forEach((button) => {
    button.addEventListener('click', () => {
      if (accountEmailFormWrap) accountEmailFormWrap.classList.remove('is-open');
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      if (accountCodeRow) accountCodeRow.hidden = true;
      if (accountPhoneVerify) accountPhoneVerify.hidden = true;
      setMethodVisibility('all');
    });
  });

  if (accountGoogleBtn) {
    accountGoogleBtn.addEventListener('click', async () => {
      clearAccountFormError(accountFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      setButtonLoading(accountGoogleBtn, true);
      try {
        const result = await authHelper.signInWithGoogle();
        if (result?.redirected) return;
        clearAccountFormError(accountFormError);
        finalizeAuthSuccess('Signed in successfully');
      } catch (error) {
        setAccountFormError(accountFormError, getAccountErrorMessage(error, 'Google sign-in failed.'));
      } finally {
        setButtonLoading(accountGoogleBtn, false);
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageGoogleBtn) {
    accountPageGoogleBtn.addEventListener('click', async () => {
      clearAccountFormError(accountPageFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountPageFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      setButtonLoading(accountPageGoogleBtn, true);
      try {
        const result = await authHelper.signInWithGoogle();
        if (result?.redirected) return;
        clearAccountFormError(accountPageFormError);
        finalizeAuthSuccess('Signed in successfully');
      } catch (error) {
        setAccountFormError(accountPageFormError, getAccountErrorMessage(error, 'Google sign-in failed.'));
      } finally {
        setButtonLoading(accountPageGoogleBtn, false);
      }
    });
  }

  if (accountEmailForm && accountModeInput) {
    accountEmailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearAccountFormError(accountFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      const formData = new FormData(accountEmailForm);
      const identifier = String(formData.get('identifier') || '').trim();
      const password = String(formData.get('password') || '');
      const typedName = String(formData.get('name') || '').trim();
      const isSignup = accountModeInput.value === 'signup';
      setButtonLoading(accountSubmitBtn, true);

      try {
        if (isSignup) {
          await authHelper.signUpWithEmail(typedName, identifier, password);
        } else {
          const method = accountIdentifierModeInput?.value || 'email';
          await (authHelper.signInWithIdentifier
            ? authHelper.signInWithIdentifier(identifier, password, method)
            : authHelper.signInWithEmail(identifier, password));
        }
        clearAccountFormError(accountFormError);
        finalizeAuthSuccess(isSignup ? 'Account created successfully' : 'Signed in successfully');
      } catch (error) {
        setAccountFormError(accountFormError, getAccountErrorMessage(error, 'Email authentication failed.'));
      } finally {
        setButtonLoading(accountSubmitBtn, false);
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageEmailForm && accountPageModeInput) {
    accountPageEmailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearAccountFormError(accountPageFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountPageFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      const formData = new FormData(accountPageEmailForm);
      const identifier = String(formData.get('identifier') || '').trim();
      const password = String(formData.get('password') || '');
      const typedName = String(formData.get('name') || '').trim();
      const isSignup = accountPageModeInput.value === 'signup';
      setButtonLoading(accountPageSubmitBtn, true);

      try {
        if (isSignup) {
          await authHelper.signUpWithEmail(typedName, identifier, password);
        } else {
          const method = accountPageIdentifierModeInput?.value || 'email';
          await (authHelper.signInWithIdentifier
            ? authHelper.signInWithIdentifier(identifier, password, method)
            : authHelper.signInWithEmail(identifier, password));
        }
        clearAccountFormError(accountPageFormError);
        finalizeAuthSuccess(isSignup ? 'Account created successfully' : 'Signed in successfully');
      } catch (error) {
        setAccountFormError(accountPageFormError, getAccountErrorMessage(error, 'Email authentication failed.'));
      } finally {
        setButtonLoading(accountPageSubmitBtn, false);
      }
    });
  }

  if (accountPhoneSubmit && accountPhoneInput) {
    accountPhoneSubmit.addEventListener('click', async () => {
      clearAccountFormError(accountFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      setButtonLoading(accountPhoneSubmit, true);
      try {
        await authHelper.sendPhoneCode(accountPhoneInput.value.trim());
        clearAccountFormError(accountFormError);
        if (accountCodeRow) accountCodeRow.hidden = false;
        if (accountPhoneVerify) accountPhoneVerify.hidden = false;
      } catch (error) {
        setAccountFormError(accountFormError, getAccountErrorMessage(error, 'Could not send verification code.'));
      } finally {
        setButtonLoading(accountPhoneSubmit, false);
      }
    });
  }

  if (accountPhoneVerify && accountPhoneCode) {
    accountPhoneVerify.addEventListener('click', async () => {
      clearAccountFormError(accountFormError);
      const authHelper = await getAuthHelperReady();
      if (!authHelper) {
        setAccountFormError(accountFormError, 'Authentication is still loading. Please try again.');
        return;
      }
      setButtonLoading(accountPhoneVerify, true);
      try {
        await authHelper.verifyPhoneCode(accountPhoneCode.value.trim());
        clearAccountFormError(accountFormError);
        showAccountSuccess('Signed in successfully', () => window.location.reload());
      } catch (error) {
        setAccountFormError(accountFormError, getAccountErrorMessage(error, 'Verification failed.'));
      } finally {
        setButtonLoading(accountPhoneVerify, false);
      }
    });
  }

  if (accountPageLogout) {
    accountPageLogout.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (authHelper) {
        try {
          await authHelper.signOut();
        } catch (error) {
          window.alert(error.message || 'Could not log out.');
        }
        window.location.reload();
        return;
      }
      logoutAccount();
    });
  }

  if (accountDeleteLink) {
    accountDeleteLink.addEventListener('click', openDeleteModal);
  }

  if (accountDeleteInput) {
    accountDeleteInput.addEventListener('input', syncDeleteConfirmationState);
  }

  [accountDeleteClose, accountDeleteCancel].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', closeDeleteModal);
  });

  if (accountDeleteOverlay) {
    accountDeleteOverlay.addEventListener('click', (event) => {
      if (event.target === accountDeleteOverlay) closeDeleteModal();
    });
  }

  if (accountDeleteConfirm) {
    accountDeleteConfirm.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountDeleteConfirm, true);
      try {
        await authHelper.deleteProfile();
        showAccountSuccess('Profile deleted successfully', () => {
          window.location.href = '../index.html';
        });
      } catch (error) {
        window.alert(error.message || 'Profile deletion failed. You may need to sign in again before deleting your profile.');
      } finally {
        setButtonLoading(accountDeleteConfirm, false);
      }
    });
  }

  syncAccountMode('signin');
  if (!isEmbeddedAccountPage) {
    syncAccountPageMode(requestedAccountPageMode);
  }
  bindIdentifierSwitch(
    accountIdentifierSwitch,
    accountIdentifierModeInput,
    accountEmailInput,
    accountIdentifierLabel,
    () => accountModeInput?.value === 'signup'
  );
  bindIdentifierSwitch(
    accountPageIdentifierSwitch,
    accountPageIdentifierModeInput,
    accountPageEmailInput,
    accountPageIdentifierLabel,
    () => accountPageModeInput?.value === 'signup'
  );

  if (homeGetFoundBtn) {
    homeGetFoundBtn.addEventListener('click', () => {
      handleHomeGetFoundClick();
    });
  }
  setMethodVisibility('all');
  applyAccountToPage();
  maybeHandleRedirectedGoogleAuth();
  initPendingSetupModal();

  // Filter group collapse
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      const content = group.querySelector('.filter-group-content');
      if (content) content.style.display = content.style.display === 'none' ? '' : 'none';
    });
  });

  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawerClose = document.querySelector('.cart-drawer-close');

  function openCartDrawer() {
    if (!cartDrawerOverlay) return;
    renderCartDrawer();
    cartDrawerOverlay.hidden = false;
    requestAnimationFrame(() => {
      cartDrawerOverlay.classList.add('is-visible');
    });
  }

  function closeCartDrawer() {
    if (!cartDrawerOverlay) return;
    cartDrawerOverlay.classList.remove('is-visible');
    window.setTimeout(() => {
      cartDrawerOverlay.hidden = true;
    }, 240);
  }

  document.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const card = btn.closest('.product-card');
      if (!card) return;
      const product = getProductFromCard(card);
      const wishlist = readWishlist();
      const itemIndex = wishlist.findIndex((item) => item.id === product.id);
      if (itemIndex >= 0) {
        wishlist.splice(itemIndex, 1);
      } else {
        wishlist.unshift(product);
      }
      writeWishlist(wishlist);
      renderCommerceUI();
    });
  });

  document.querySelectorAll('.product-card').forEach((card) => {
    const quickAddBtn = card.querySelector('.quick-add');
    const addBtn = card.querySelector('.add-btn');

    if (quickAddBtn) {
      quickAddBtn.textContent = 'Add to Cart';
      quickAddBtn.dataset.defaultLabel = 'Add to Cart';
      quickAddBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, quickAddBtn, 'Added');
      });
    }

    if (addBtn) {
      addBtn.dataset.defaultLabel = '+';
      addBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, addBtn, '✓');
      });
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const cartTrigger = target.closest('[data-cart-trigger]');
    if (cartTrigger) {
      event.preventDefault();
      openCartDrawer();
      return;
    }

    if (target === cartDrawerOverlay) {
      closeCartDrawer();
      return;
    }

    const qtyButton = target.closest('[data-cart-qty]');
    if (qtyButton) {
      const itemId = qtyButton.getAttribute('data-cart-qty');
      const change = Number(qtyButton.getAttribute('data-cart-change') || 0);
      const cart = readCart().map((item) => item.id === itemId ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + change) } : item);
      writeCart(cart);
      renderCommerceUI();
      return;
    }

    const removeButton = target.closest('[data-cart-remove]');
    if (removeButton) {
      const itemId = removeButton.getAttribute('data-cart-remove');
      writeCart(readCart().filter((item) => item.id !== itemId));
      renderCommerceUI();
      return;
    }

    const wishlistRemove = target.closest('[data-wishlist-remove]');
    if (wishlistRemove) {
      const itemId = wishlistRemove.getAttribute('data-wishlist-remove');
      writeWishlist(readWishlist().filter((item) => item.id !== itemId));
      renderCommerceUI();
      return;
    }

    const wishlistAddCart = target.closest('[data-wishlist-add-cart]');
    if (wishlistAddCart) {
      const itemId = wishlistAddCart.getAttribute('data-wishlist-add-cart');
      const wishlistItem = readWishlist().find((item) => item.id === itemId);
      if (!wishlistItem) return;
      const cart = readCart();
      const existingItem = cart.find((item) => item.id === itemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.unshift({ ...wishlistItem, quantity: 1 });
      }
      writeCart(cart);
      renderCommerceUI();
      openCartDrawer();
      return;
    }

    const deliveryToggle = target.closest('[data-delivery-mode]');
    if (deliveryToggle) {
      const deliveryInput = document.querySelector('[data-checkout-shipping]');
      if (deliveryInput) {
        deliveryInput.value = deliveryToggle.getAttribute('data-delivery-mode') || 'delivery';
        renderCheckoutPage();
      }
      return;
    }
  });

  if (cartDrawerClose) {
    cartDrawerClose.addEventListener('click', closeCartDrawer);
  }

  document.addEventListener('softgiggles:cart-open', openCartDrawer);
  window.addEventListener('focus', () => {
    maybePromptPendingJobReview().catch(() => {});
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      maybePromptPendingJobReview().catch(() => {});
    }
  });
  window.addEventListener('softgiggles-auth-changed', () => {
    maybePromptPendingJobReview().catch(() => {});
  });
  window.addEventListener('worklinkup-job-updated', () => {
    maybePromptPendingJobReview().catch(() => {});
  });
  window.addEventListener('worklinkup-review-prompt-refresh', () => {
    maybePromptPendingJobReview().catch(() => {});
  });

  renderCommerceUI();
  window.setTimeout(() => {
    maybePromptPendingJobReview().catch(() => {});
  }, 600);
});
