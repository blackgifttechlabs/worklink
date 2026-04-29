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
    rating: Number(params.get('rating') || 0),
    searchIntent: null
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

  function normalizeProfileImage(src = '') {
    const rawValue = String(src || '').trim();
    if (!rawValue) return 'images/sections/profileimg.avif';

    const normalized = rawValue
      .replace(/^https?:\/\/[^/]+\//i, '')
      .replace(/^\.?\//, '')
      .replace(/^(\.\.\/)+/, '')
      .split('?')[0]
      .split('#')[0];

    const categoryImages = getCatalog()
      .map((item) => String(item.image || '').trim())
      .filter(Boolean)
      .map((imagePath) => imagePath.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, ''));

    if (
      normalized === 'images/logo/joblinks.avif'
      || normalized === 'images/sections/findme.avif'
      || normalized.startsWith('images/categories/')
      || categoryImages.includes(normalized)
    ) {
      return 'images/sections/profileimg.avif';
    }

    return rawValue;
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

  function getSearchIntel() {
    return window.WorkLinkUpSearchIntelligence || null;
  }

  function getCurrentSearchIntent() {
    if (state.searchIntent) return state.searchIntent;
    const searchIntel = getSearchIntel();
    if (!searchIntel || typeof searchIntel.resolveIntent !== 'function') {
      return {
        query: state.query,
        service: state.service,
        category: state.category,
        city: '',
        province: '',
        suggestions: []
      };
    }
    return searchIntel.resolveIntent([state.query, state.service, state.category].filter(Boolean).join(' '));
  }

  function getIntentSearchTerms(intent = {}) {
    return [
      state.query,
      state.service,
      state.category,
      intent.service,
      intent.category,
      intent.city,
      intent.province
    ].map((value) => String(value || '').trim()).filter(Boolean);
  }

  function resolveImage(src = '') {
    const value = String(src || '').trim();
    if (!value) return `${base}images/logo/joblinks.avif`;
    const unescaped = value
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/g, '/')
      .replace(/&#47;/g, '/');
    if (/^(https?:|data:|blob:|\/)/i.test(unescaped)) return unescaped;
    if (/^image\/[a-z0-9.+-]+;base64,/i.test(unescaped)) return `data:${unescaped}`;
    if (/^[A-Za-z0-9+/=\s]+$/.test(unescaped) && unescaped.replace(/\s+/g, '').length > 160) {
      return `data:image/jpeg;base64,${unescaped.replace(/\s+/g, '')}`;
    }
    return `${base}${unescaped.replace(/^\.?\//, '').replace(/^(\.\.\/)+/, '')}`;
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
    const ratingTotal = Math.max(0, Number(provider.ratingTotal || 0));
    const reviewCount = ratingTotal > 0 ? Math.max(0, Number(provider.reviewCount || 0)) : 0;
    const rating = reviewCount > 0 ? Number(provider.averageRating || (ratingTotal / reviewCount) || 0) : 0;
    const image = normalizeProfileImage(provider.profileImageData);
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
      reviewCount,
      ratingTotal,
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
    const intent = getCurrentSearchIntent();
    const query = normalizeText(intent.service || state.query || state.service || intent.category || state.category);
    if (!query) return Number(item.rating || 0);
    const title = normalizeText(item.title);
    const subtitle = normalizeText(item.subtitle);
    const category = normalizeText(item.category);
    const location = normalizeText(item.location);
    const terms = normalizeText(item.terms);
    let score = Number(item.rating || 0);
    if (title === query) score += 100;
    if (title.startsWith(query)) score += 60;
    if (subtitle === query || category === query) score += 48;
    if (subtitle.includes(query) || category.includes(query)) score += 32;
    if (intent.category && category === normalizeText(intent.category)) score += 44;
    if (intent.service && terms.includes(normalizeText(intent.service))) score += 56;
    if (intent.city && location.includes(normalizeText(intent.city))) score += 36;
    if (intent.province && location.includes(normalizeText(intent.province))) score += 24;
    if (terms.includes(query)) score += 18;
    score += query.split(' ').filter((part) => part && terms.includes(part)).length * 6;
    score += 4;
    return score;
  }

  function passesSharedFilters(item = {}, intent = getCurrentSearchIntent()) {
    const explicitCategory = normalizeText(state.category);
    const rating = Number(state.rating || 0);
    if (explicitCategory && normalizeText(item.category) !== explicitCategory) return false;
    if (intent.city && !normalizeText(item.location).includes(normalizeText(intent.city))) return false;
    if (intent.province && !normalizeText(item.location).includes(normalizeText(intent.province))) return false;
    if (rating && Number(item.rating || 0) < rating) return false;
    return true;
  }

  function providerMatchesTerm(item = {}, term = '') {
    const value = String(term || '').trim();
    if (!value) return true;
    const haystack = `${item.terms} ${item.title} ${item.subtitle}`;
    return textMatchesQuery(haystack, value);
  }

  function getEquivalentServiceTerms(term = '') {
    const normalized = normalizeText(term);
    if (normalized === 'barber' || normalized === 'hairdresser') {
      return ['Barber', 'Hairdresser', 'Braiding & Hair Weaving', 'Loc / Dreadlock Maintenance'];
    }
    return [term];
  }

  function providerMatchesCategory(item = {}, category = '') {
    const normalizedCategory = normalizeText(category);
    if (!normalizedCategory) return false;
    return normalizeText(item.category) === normalizedCategory || normalizeText(item.terms).includes(normalizedCategory);
  }

  function getSearchBuckets() {
    const intent = getCurrentSearchIntent();
    const normalizedService = String(state.service || intent.service || '').trim();
    const normalizedCategory = String(state.category || intent.category || '').trim();
    const intentTerms = normalizedService
      ? [normalizedService]
      : normalizedCategory
        ? [normalizedCategory]
        : [];
    const queryTerms = intentTerms.length
      ? intentTerms
      : [state.query, state.service, state.category].map((value) => String(value || '').trim()).filter(Boolean);

    const sharedCandidates = allResults
      .filter((item) => passesSharedFilters(item, intent))
      .map((item) => ({ ...item, score: scoreResult(item) }))
      .sort((first, second) => Number(second.score || 0) - Number(first.score || 0));

    if (!normalizedService) {
      return {
        intent,
        exact: sharedCandidates.filter((item) => !queryTerms.length || queryTerms.some((term) => providerMatchesTerm(item, term))),
        related: []
      };
    }

    const exactServiceTerms = getEquivalentServiceTerms(normalizedService);
    const exact = sharedCandidates.filter((item) => exactServiceTerms.some((term) => providerMatchesTerm(item, term)));
    const exactHrefs = new Set(exact.map((item) => item.href));
    const related = sharedCandidates.filter((item) => (
      !exactHrefs.has(item.href)
      && normalizedCategory
      && providerMatchesCategory(item, normalizedCategory)
    ));

    return { intent, exact, related };
  }

  function getFilteredResults() {
    const buckets = getSearchBuckets();
    return buckets.exact.length ? buckets.exact : buckets.related;
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
    const intent = getCurrentSearchIntent();
    if (state.query) filters.push(`Search: ${state.query}`);
    if (state.category || intent.category) filters.push(state.category || intent.category);
    if (intent.service && intent.service !== state.query) filters.push(intent.service);
    if (intent.city) filters.push(intent.city);
    if (intent.province && intent.province !== intent.city) filters.push(intent.province);
    if (state.rating) filters.push(`${state.rating.toFixed(state.rating % 1 ? 1 : 0)}+ rating`);
    activeFiltersHost.innerHTML = filters.length
      ? filters.map((filter) => `<span>${escapeHtml(filter)}</span>`).join('')
      : '<span>All WorkLinkUp providers</span>';
  }

  function renderResults() {
    const buckets = getSearchBuckets();
    const filtered = buckets.exact.length ? buckets.exact : buckets.related;
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

    const renderCard = (item) => `
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
    `;

    const relatedMarkup = buckets.related.length
      ? `
        <div class="search-results-section-title ${buckets.exact.length ? '' : 'is-related-only'}">
          ${buckets.exact.length
            ? '<h2>Related results</h2><p>These providers are in the same service category.</p>'
            : `<h2>No exact ${escapeHtml(buckets.intent.service || 'worker')} match yet</h2><p>We could not find exactly that worker. Below are related service providers in ${escapeHtml(buckets.intent.category || 'the same category')}.</p>`}
        </div>
        ${buckets.related.slice(0, buckets.exact.length ? 12 : 48).map(renderCard).join('')}
      `
      : '';

    gridHost.innerHTML = `
      ${buckets.exact.length ? buckets.exact.slice(0, 24).map(renderCard).join('') : ''}
      ${relatedMarkup}
    `;
  }

  function render() {
    syncUrl();
    renderFilterOptions();
    renderActiveFilters();
    renderResults();
  }

  async function resolveSearchIntentBeforeLoadingProviders() {
    const searchIntel = getSearchIntel();
    const rawSearch = [state.query, state.service, state.category].filter(Boolean).join(' ');
    if (!rawSearch || !searchIntel || typeof searchIntel.resolveIntent !== 'function') return;

    state.searchIntent = searchIntel.resolveIntent(rawSearch);
    if (countHost) countHost.textContent = 'Understanding your search';
    renderActiveFilters();

    if (typeof searchIntel.refineIntentWithGroq !== 'function') return;

    const remoteIntent = await searchIntel.refineIntentWithGroq(rawSearch, state.searchIntent.suggestions || [], {
      includeAllCandidates: true,
      maxCandidates: 600,
      timeoutMs: 4500
    });

    if (!remoteIntent) return;
    state.searchIntent = {
      ...state.searchIntent,
      query: remoteIntent.query || state.searchIntent.query,
      service: remoteIntent.service || state.searchIntent.service,
      category: remoteIntent.category || state.searchIntent.category,
      city: remoteIntent.city || state.searchIntent.city,
      province: remoteIntent.province || state.searchIntent.province,
      suggestions: state.searchIntent.suggestions || []
    };
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
    await resolveSearchIntentBeforeLoadingProviders();
    const providerResults = await getProviderResults();
    allResults = providerResults;
    providersLoaded = true;
    render();
  }

  init();
});
