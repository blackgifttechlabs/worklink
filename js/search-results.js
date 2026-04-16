document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('[data-search-results-page]');
  if (!page) return;

  const base = '../';
  const params = new URLSearchParams(window.location.search);
  const countHost = page.querySelector('[data-search-results-count]');
  const titleHost = page.querySelector('[data-search-results-title]');
  const gridHost = page.querySelector('[data-search-results-grid]');
  const activeFiltersHost = page.querySelector('[data-search-active-filters]');
  const dialog = document.querySelector('[data-search-filter-dialog]');
  const categoryOptionsHost = document.querySelector('[data-search-category-options]');
  const ratingOptionButtons = Array.from(document.querySelectorAll('[data-search-rating]'));
  const filterOpenBtn = document.querySelector('[data-search-filter-open]');
  const filterCloseTriggers = Array.from(document.querySelectorAll('[data-search-filter-close]'));
  const resetBtn = document.querySelector('[data-search-filter-reset]');

  const state = {
    query: String(params.get('query') || '').trim(),
    category: String(params.get('category') || '').trim(),
    service: String(params.get('service') || '').trim(),
    rating: Number(params.get('rating') || 0)
  };

  let allResults = [];
  let providersLoaded = false;

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizeText(value = '') {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function getCatalog() {
    return Array.isArray(window.WorkLinkUpServiceCatalog) ? window.WorkLinkUpServiceCatalog : [];
  }

  function flattenSearchValues(value) {
    if (Array.isArray(value)) {
      return value.map(flattenSearchValues).filter(Boolean).join(' ');
    }
    if (value && typeof value === 'object') {
      return Object.values(value).map(flattenSearchValues).filter(Boolean).join(' ');
    }
    return String(value || '').trim();
  }

  function textMatchesQuery(text = '', query = '') {
    const normalizedText = normalizeText(text);
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return true;
    if (normalizedText.includes(normalizedQuery)) return true;
    const queryParts = normalizedQuery.split(' ').filter(Boolean);
    return queryParts.length > 1 && queryParts.every((part) => normalizedText.includes(part));
  }

  function resolveImage(src = '') {
    const value = String(src || '').trim();
    if (!value) return `${base}images/logo/logo.jpg`;
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    return `${base}${value.replace(/^\.\.\//, '')}`;
  }

  function buildSearchHref(query = '', options = {}) {
    const params = new URLSearchParams();
    const category = String(options.category || '').trim();
    const service = String(options.service || '').trim();
    const searchQuery = String(query || service || category || '').trim();
    if (searchQuery) params.set('query', searchQuery);
    if (category) params.set('category', category);
    if (service) params.set('service', service);
    const queryString = params.toString();
    return `${base}pages/search-results.html${queryString ? `?${queryString}` : ''}`;
  }

  function providerProfileHref(provider = {}) {
    const uid = String(provider.uid || '').trim();
    const provinceSlug = String(provider.provinceSlug || provider.providerProvinceSlug || provider.province || 'harare')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'harare';
    if (!uid) return buildSearchHref();
    return `${base}pages/provider-profile.html?uid=${encodeURIComponent(uid)}&province=${encodeURIComponent(provinceSlug)}`;
  }

  function normalizeProvider(provider = {}) {
    const displayName = String(provider.displayName || provider.fullName || provider.name || provider.username || 'WorkLinkUp provider').trim();
    const specialty = String(provider.specialty || provider.title || provider.primaryCategory || 'Specialist').trim();
    const category = String(provider.primaryCategory || specialty || 'Specialist').trim();
    const city = String(provider.city || '').trim();
    const province = String(provider.province || provider.providerProvince || '').trim();
    const address = String(provider.address || '').trim();
    const location = address || [city, province].filter(Boolean).join(', ') || 'Zimbabwe';
    const rating = Number(provider.averageRating || 4.7);
    const image = provider.profileImageData || provider.bannerImageData || getCatalog().find((item) => item.label === category)?.image || 'images/logo/logo.jpg';
    const skillText = flattenSearchValues(provider.skills);
    const languageText = flattenSearchValues(provider.languages);
    const workText = flattenSearchValues(provider.workExperience);
    const educationText = flattenSearchValues(provider.education);
    const certificationText = flattenSearchValues(provider.certifications);
    return {
      kind: 'provider',
      title: displayName,
      subtitle: specialty,
      category,
      location,
      rating,
      image: resolveImage(image),
      href: providerProfileHref(provider),
      terms: [
        displayName,
        provider.username,
        provider.providerPublicId,
        specialty,
        provider.title,
        category,
        city,
        province,
        address,
        provider.bio,
        skillText,
        languageText,
        workText,
        educationText,
        certificationText
      ].join(' ')
    };
  }

  async function getProviderResults() {
    if (typeof window.ensureWorkLinkAuth !== 'function') return [];
    try {
      const authHelper = await window.ensureWorkLinkAuth();
      if (!authHelper || typeof authHelper.listProviders !== 'function') return [];
      const providers = await authHelper.listProviders();
      return Array.isArray(providers) ? providers.map(normalizeProvider) : [];
    } catch (error) {
      return [];
    }
  }

  function scoreResult(item = {}) {
    const query = normalizeText(state.query || state.service || state.category);
    if (!query) return Number(item.rating || 0);
    const title = normalizeText(item.title);
    const subtitle = normalizeText(item.subtitle);
    const category = normalizeText(item.category);
    const terms = normalizeText(item.terms);
    let score = Number(item.rating || 0);
    if (title === query) score += 100;
    if (title.startsWith(query)) score += 60;
    if (subtitle === query || category === query) score += 48;
    if (subtitle.includes(query) || category.includes(query)) score += 32;
    if (terms.includes(query)) score += 18;
    score += query.split(' ').filter((part) => part && terms.includes(part)).length * 6;
    score += 4;
    return score;
  }

  function getFilteredResults() {
    const query = normalizeText(state.query || state.service);
    const category = normalizeText(state.category);
    const rating = Number(state.rating || 0);
    return allResults
      .filter((item) => !query || textMatchesQuery(`${item.terms} ${item.title} ${item.subtitle}`, query))
      .filter((item) => !category || normalizeText(item.category) === category)
      .filter((item) => !rating || Number(item.rating || 0) >= rating)
      .map((item) => ({ ...item, score: scoreResult(item) }))
      .sort((first, second) => Number(second.score || 0) - Number(first.score || 0));
  }

  function syncUrl() {
    const nextUrl = new URL(window.location.href);
    if (state.query) nextUrl.searchParams.set('query', state.query);
    else nextUrl.searchParams.delete('query');
    if (state.category) nextUrl.searchParams.set('category', state.category);
    else nextUrl.searchParams.delete('category');
    if (state.service) nextUrl.searchParams.set('service', state.service);
    else nextUrl.searchParams.delete('service');
    if (state.rating) nextUrl.searchParams.set('rating', String(state.rating));
    else nextUrl.searchParams.delete('rating');
    window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
  }

  function renderFilterOptions() {
    if (categoryOptionsHost) {
      const categories = getCatalog();
      categoryOptionsHost.innerHTML = [
        '<button type="button" data-search-category="">All categories</button>',
        ...categories.map((category) => `<button type="button" data-search-category="${escapeHtml(category.label)}">${escapeHtml(category.label)}</button>`)
      ].join('');

      categoryOptionsHost.querySelectorAll('[data-search-category]').forEach((button) => {
        button.classList.toggle('is-active', button.getAttribute('data-search-category') === state.category);
        button.addEventListener('click', () => {
          state.category = button.getAttribute('data-search-category') || '';
          render();
        });
      });
    }

    ratingOptionButtons.forEach((button) => {
      button.classList.toggle('is-active', Number(button.getAttribute('data-search-rating') || 0) === Number(state.rating || 0));
      if (button.dataset.searchRatingBound === '1') return;
      button.dataset.searchRatingBound = '1';
      button.addEventListener('click', () => {
        state.rating = Number(button.getAttribute('data-search-rating') || 0);
        render();
      });
    });
  }

  function renderActiveFilters() {
    if (!activeFiltersHost) return;
    const filters = [];
    if (state.query) filters.push(`Search: ${state.query}`);
    if (state.category) filters.push(state.category);
    if (state.rating) filters.push(`${state.rating.toFixed(state.rating % 1 ? 1 : 0)}+ rating`);
    activeFiltersHost.innerHTML = filters.length
      ? filters.map((filter) => `<span>${escapeHtml(filter)}</span>`).join('')
      : '<span>All WorkLinkUp providers</span>';
  }

  function renderResults() {
    const filtered = getFilteredResults();
    const label = state.query || state.service || state.category || 'all services';
    if (titleHost) titleHost.innerHTML = `Results for <span>"${escapeHtml(label)}"</span>`;
    if (countHost) {
      countHost.textContent = providersLoaded
        ? (filtered.length
          ? `1-${Math.min(filtered.length, 48)} of ${filtered.length} provider${filtered.length === 1 ? '' : 's'}`
          : '0 providers')
        : 'Loading providers';
    }
    if (!gridHost) return;

    if (!providersLoaded) {
      gridHost.innerHTML = `
        <article class="search-result-card is-loading"></article>
        <article class="search-result-card is-loading"></article>
        <article class="search-result-card is-loading"></article>
        <article class="search-result-card is-loading"></article>
      `;
      return;
    }

    if (!filtered.length) {
      gridHost.innerHTML = `
        <div class="search-results-empty">
          <i class="fa-regular fa-compass"></i>
          <h2>No matching providers</h2>
          <p>Try a different name, service, category, city, or clear one of the filters.</p>
        </div>
      `;
      return;
    }

    gridHost.innerHTML = filtered.slice(0, 48).map((item) => `
      <a href="${escapeHtml(item.href)}" class="search-result-card">
        <div class="search-result-card-image">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />
          <span class="search-result-badge">Provider</span>
        </div>
        <div class="search-result-card-copy">
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.subtitle)}</p>
          <strong>${Number(item.rating || 0).toFixed(1)} <i class="fa-solid fa-star"></i></strong>
          <small>${escapeHtml(item.location)}</small>
        </div>
      </a>
    `).join('');
  }

  function render() {
    syncUrl();
    renderFilterOptions();
    renderActiveFilters();
    renderResults();
  }

  function openDialog() {
    if (!dialog) return;
    dialog.hidden = false;
    requestAnimationFrame(() => dialog.classList.add('is-visible'));
  }

  function closeDialog() {
    if (!dialog) return;
    dialog.classList.remove('is-visible');
    window.setTimeout(() => {
      dialog.hidden = true;
    }, 180);
  }

  filterOpenBtn?.addEventListener('click', openDialog);
  filterCloseTriggers.forEach((trigger) => trigger.addEventListener('click', closeDialog));
  resetBtn?.addEventListener('click', () => {
    state.category = '';
    state.rating = 0;
    render();
  });

  async function init() {
    render();
    const providerResults = await getProviderResults();
    allResults = providerResults;
    providersLoaded = true;
    render();
  }

  init();
});
