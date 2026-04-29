document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('[data-search-results-page]');
  if (!page) return;

  const base = '../';
  const params = new URLSearchParams(window.location.search);
  const countHost = page.querySelector('[data-search-results-count]');
  const titleHost = page.querySelector('[data-search-results-title]');
  const form = page.querySelector('[data-search-results-form]');
  const searchInput = page.querySelector('[data-search-results-input]');
  const sortSelect = page.querySelector('[data-search-sort]');
  const filterDot = document.querySelector('[data-search-filter-dot]');
  const backBtn = page.querySelector('[data-search-back]');
  const bestHost = page.querySelector('[data-search-best-results]');
  const relatedBlock = page.querySelector('[data-search-related-block]');
  const relatedHost = page.querySelector('[data-search-related-results]');
  const popularChipsHost = page.querySelector('[data-search-popular-chips]');
  const paginationHost = page.querySelector('[data-search-pagination]');
  const desktopFilterForm = page.querySelector('[data-search-desktop-filter-form]');
  const desktopQueryInput = page.querySelector('[data-search-desktop-query]');
  const desktopCategorySelect = page.querySelector('[data-search-desktop-category]');
  const desktopServiceSelect = page.querySelector('[data-search-desktop-service]');
  const desktopLocationInput = page.querySelector('[data-search-desktop-location]');
  const desktopRatingInput = page.querySelector('[data-search-desktop-rating]');
  const desktopClearBtn = page.querySelector('[data-search-desktop-clear]');
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
    sort: String(params.get('sort') || 'relevant'),
    searchIntent: null,
    aiRanking: null,
    showAllRelated: false,
    page: Number(params.get('page') || 1)
  };

  let allResults = [];
  let rawProviders = [];
  let providersLoaded = false;

  if (searchInput) searchInput.value = state.query || state.service || state.category || '';
  if (sortSelect) sortSelect.value = state.sort;
  if (desktopQueryInput) desktopQueryInput.value = state.query || state.service || state.category || '';
  if (desktopRatingInput) desktopRatingInput.checked = Number(state.rating || 0) >= 4.5;

  function escapeHtml(value = '') {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(Number(value || 0));
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

  function tokenizeSearch(value = '') {
    const stopwords = new Set(['a', 'an', 'and', 'for', 'from', 'i', 'in', 'me', 'my', 'near', 'need', 'of', 'the', 'to', 'too', 'with', 'is']);
    return normalizeText(value).split(' ').filter((token) => token.length > 1 && !stopwords.has(token));
  }

  function levenshtein(firstValue = '', secondValue = '') {
    const first = normalizeText(firstValue);
    const second = normalizeText(secondValue);
    if (!first || !second) return Math.max(first.length, second.length);
    const costs = Array.from({ length: second.length + 1 }, (_, index) => index);
    for (let i = 1; i <= first.length; i += 1) {
      let previous = i - 1;
      costs[0] = i;
      for (let j = 1; j <= second.length; j += 1) {
        const current = costs[j];
        costs[j] = first[i - 1] === second[j - 1]
          ? previous
          : Math.min(previous + 1, costs[j] + 1, costs[j - 1] + 1);
        previous = current;
      }
    }
    return costs[second.length];
  }

  function getNearnessPercent(item = {}, intent = getCurrentSearchIntent()) {
    const queryParts = [
      state.query,
      state.service,
      state.category,
      intent.service,
      intent.category,
      intent.city,
      intent.province
    ].filter(Boolean);
    const query = normalizeText(queryParts.join(' '));
    const haystack = normalizeText(`${item.title} ${item.subtitle} ${item.category} ${item.location} ${item.terms}`);
    if (!query) return Math.min(100, Math.round(Number(item.rating || 0) * 12));
    if (haystack.includes(query)) return 100;

    const queryTokens = tokenizeSearch(query);
    const haystackTokens = tokenizeSearch(haystack);
    if (!queryTokens.length || !haystackTokens.length) return 0;
    const tokenScores = queryTokens.map((token) => {
      let best = 0;
      haystackTokens.forEach((candidate) => {
        if (candidate === token) best = Math.max(best, 1);
        else if (candidate.startsWith(token) || token.startsWith(candidate)) best = Math.max(best, 0.82);
        else {
          const distance = levenshtein(token, candidate);
          const maxLength = Math.max(token.length, candidate.length, 1);
          best = Math.max(best, Math.max(0, 1 - (distance / maxLength)));
        }
      });
      return best;
    });
    const average = tokenScores.reduce((sum, value) => sum + value, 0) / tokenScores.length;
    const categoryBoost = intent.category && normalizeText(item.category).includes(normalizeText(intent.category)) ? 0.12 : 0;
    const serviceBoost = intent.service && normalizeText(item.terms).includes(normalizeText(intent.service)) ? 0.18 : 0;
    return Math.max(0, Math.min(100, Math.round((average + categoryBoost + serviceBoost) * 100)));
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

  function getProviderServiceChips(item = {}) {
    const services = Array.isArray(item.raw?.services)
      ? item.raw.services.map((entry) => (
        typeof entry === 'string'
          ? entry
          : entry?.service || entry?.name || entry?.label || entry?.specialty || ''
      ))
      : [];
    return [item.subtitle, ...services, item.category]
      .map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter((value, index, list) => list.findIndex((other) => normalizeText(other) === normalizeText(value)) === index)
      .slice(0, 3);
  }

  function getPopularSearches(intent = getCurrentSearchIntent()) {
    const fromIntent = Array.isArray(intent.suggestions)
      ? intent.suggestions.map((entry) => entry.service || entry.title || entry.query || '').filter(Boolean)
      : [];
    const category = String(intent.category || state.category || '').trim();
    const catalogMatch = getCatalog().find((item) => normalizeText(item.label) === normalizeText(category));
    const subservices = Array.isArray(catalogMatch?.subservices) ? catalogMatch.subservices : [];
    return [
      ...fromIntent,
      ...subservices,
      state.service,
      category,
      'haircut',
      'hair treatment',
      'box braids',
      'hair color',
      'dreadlocks',
      'hair styling'
    ].map((value) => String(value || '').trim())
      .filter(Boolean)
      .filter((value, index, list) => list.findIndex((other) => normalizeText(other) === normalizeText(value)) === index)
      .slice(0, 8);
  }

  function renderPopularSearches(intent = getCurrentSearchIntent()) {
    if (!popularChipsHost) return;
    const searches = getPopularSearches(intent);
    popularChipsHost.innerHTML = searches.map((search) => `
      <a href="${escapeHtml(buildSearchHref(search))}">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span>${escapeHtml(search)}</span>
      </a>
    `).join('');
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

  function providerMessageHref(provider = {}) {
    const uid = String(provider.uid || '').trim();
    const provinceSlug = String(provider.provinceSlug || provider.providerProvinceSlug || provider.province || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!uid) return `${base}pages/messages.html`;
    const params = new URLSearchParams({ provider: uid });
    if (provinceSlug) params.set('province', provinceSlug);
    return `${base}pages/messages.html?${params.toString()}`;
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
      uid: String(provider.uid || '').trim(),
      title: displayName,
      subtitle: specialty,
      category,
      location,
      city,
      province,
      raw: provider,
      rating,
      reviewCount,
      ratingTotal,
      image: resolveImage(image),
      href: providerProfileHref(provider),
      messageHref: providerMessageHref(provider),
      priceLabel: String(provider.priceLabel || provider.startingPrice || provider.rate || '').trim(),
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
      rawProviders = Array.isArray(providers) ? providers : [];
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
    score += getNearnessPercent(item, intent);
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
      .map((item) => ({
        ...item,
        score: scoreResult(item),
        nearness: getNearnessPercent(item, intent)
      }));

    const aiOrder = state.aiRanking && typeof state.aiRanking === 'object'
      ? new Map([
        ...((Array.isArray(state.aiRanking.bestMatches) ? state.aiRanking.bestMatches : []).map((match, index) => [String(match.uid || '').trim(), { group: 'best', index, match }])),
        ...((Array.isArray(state.aiRanking.relatedMatches) ? state.aiRanking.relatedMatches : []).map((match, index) => [String(match.uid || '').trim(), { group: 'related', index, match }]))
      ])
      : new Map();

    const rankedCandidates = sharedCandidates
      .map((item) => {
        const aiMatch = aiOrder.get(item.uid);
        const aiPercent = Number(aiMatch?.match?.matchPercent || 0);
        return {
          ...item,
          aiGroup: aiMatch?.group || '',
          aiIndex: Number.isFinite(aiMatch?.index) ? aiMatch.index : 999,
          nearness: Math.max(Number(item.nearness || 0), aiPercent)
        };
      })
      .sort((first, second) => {
        if (state.sort === 'rating') {
          return Number(second.rating || 0) - Number(first.rating || 0) || Number(second.nearness || 0) - Number(first.nearness || 0);
        }
        if (state.sort === 'near') {
          return Number(second.nearness || 0) - Number(first.nearness || 0) || Number(second.score || 0) - Number(first.score || 0);
        }
        const firstGroupBoost = first.aiGroup === 'best' ? 2000 : first.aiGroup === 'related' ? 1000 : 0;
        const secondGroupBoost = second.aiGroup === 'best' ? 2000 : second.aiGroup === 'related' ? 1000 : 0;
        return (secondGroupBoost + Number(second.score || 0) + Number(second.nearness || 0)) - (firstGroupBoost + Number(first.score || 0) + Number(first.nearness || 0))
          || Number(first.aiIndex || 999) - Number(second.aiIndex || 999);
      });

    if (!normalizedService) {
      return {
        intent,
        exact: rankedCandidates.filter((item) => !queryTerms.length || queryTerms.some((term) => providerMatchesTerm(item, term) || Number(item.nearness || 0) >= 54)),
        related: []
      };
    }

    const exactServiceTerms = getEquivalentServiceTerms(normalizedService);
    const exact = rankedCandidates.filter((item) => item.aiGroup === 'best' || exactServiceTerms.some((term) => providerMatchesTerm(item, term)) || Number(item.nearness || 0) >= 72);
    const exactHrefs = new Set(exact.map((item) => item.href));
    const related = rankedCandidates.filter((item) => (
      !exactHrefs.has(item.href)
      && normalizedCategory
      && (item.aiGroup === 'related' || providerMatchesCategory(item, normalizedCategory) || Number(item.nearness || 0) >= 28)
    )).sort((first, second) => Number(second.nearness || 0) - Number(first.nearness || 0) || Number(second.score || 0) - Number(first.score || 0));

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
    if (state.sort && state.sort !== 'relevant') nextUrl.searchParams.set('sort', state.sort);
    else nextUrl.searchParams.delete('sort');
    if (state.page > 1) nextUrl.searchParams.set('page', String(state.page));
    else nextUrl.searchParams.delete('page');
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
          state.aiRanking = null;
          state.page = 1;
          render();
        });
      });
    }

    if (desktopCategorySelect) {
      const categories = getCatalog();
      desktopCategorySelect.innerHTML = [
        '<option value="">All categories</option>',
        ...categories.map((category) => `<option value="${escapeHtml(category.label)}">${escapeHtml(category.label)}</option>`)
      ].join('');
      desktopCategorySelect.value = state.category || getCurrentSearchIntent().category || '';
    }

    if (desktopServiceSelect) {
      const category = state.category || getCurrentSearchIntent().category || '';
      const catalogMatch = getCatalog().find((item) => normalizeText(item.label) === normalizeText(category));
      const services = Array.isArray(catalogMatch?.subservices) ? catalogMatch.subservices : [];
      desktopServiceSelect.innerHTML = [
        '<option value="">All subcategories</option>',
        ...services.map((service) => `<option value="${escapeHtml(service)}">${escapeHtml(service)}</option>`)
      ].join('');
      desktopServiceSelect.value = services.includes(state.service) ? state.service : '';
    }

    ratingOptionButtons.forEach((button) => {
      button.classList.toggle('is-active', Number(button.getAttribute('data-search-rating') || 0) === Number(state.rating || 0));
      if (button.dataset.searchRatingBound === '1') return;
      button.dataset.searchRatingBound = '1';
      button.addEventListener('click', () => {
        state.rating = Number(button.getAttribute('data-search-rating') || 0);
        state.page = 1;
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
    if (filterDot) filterDot.hidden = !(state.category || state.rating);
    activeFiltersHost.innerHTML = filters.length
      ? `${filters.map((filter) => `<span>${escapeHtml(filter)} ${filter !== `Search: ${state.query}` ? '<button type="button" data-filter-clear aria-label="Clear filter"><i class="fa-solid fa-xmark"></i></button>' : ''}</span>`).join('')}${filters.length > 1 ? '<button type="button" class="search-results-clear-all" data-search-clear-all>Clear all</button>' : ''}`
      : '<span>All WorkLinkUp providers</span>';
    activeFiltersHost.querySelectorAll('[data-filter-clear]').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = '';
        state.rating = 0;
        state.service = '';
        state.aiRanking = null;
        state.page = 1;
        render();
      });
    });
    activeFiltersHost.querySelector('[data-search-clear-all]')?.addEventListener('click', () => {
      state.category = '';
      state.service = '';
      state.rating = 0;
      state.aiRanking = null;
      state.page = 1;
      render();
    });
  }

  function renderResults() {
    const buckets = getSearchBuckets();
    const filtered = buckets.exact.length ? buckets.exact : buckets.related;
    const desktopResults = [...buckets.exact, ...buckets.related]
      .filter((item, index, array) => array.findIndex((other) => other.href === item.href) === index);
    const label = state.query || state.service || state.category || 'all services';
    if (titleHost) titleHost.innerHTML = `Results for <span>"${escapeHtml(label)}"</span>`;
    if (countHost) {
      countHost.textContent = providersLoaded
        ? (desktopResults.length || filtered.length
          ? `${desktopResults.length || filtered.length} result${(desktopResults.length || filtered.length) === 1 ? '' : 's'} for "${label}"`
          : '0 providers')
        : 'Loading providers';
    }
    if (!gridHost || !bestHost || !relatedHost || !relatedBlock) return;

    if (!providersLoaded) {
      bestHost.innerHTML = '<article class="search-result-featured is-loading"></article>';
      relatedBlock.hidden = true;
      gridHost.innerHTML = '<article class="search-result-card is-loading"></article><article class="search-result-card is-loading"></article><article class="search-result-card is-loading"></article><article class="search-result-card is-loading"></article>';
      renderPopularSearches(buckets.intent);
      return;
    }

    if (!filtered.length) {
      bestHost.innerHTML = `
        <div class="search-results-empty">
          <i class="fa-regular fa-compass"></i>
          <h2>No matching providers</h2>
          <p>Try a different name, service, category, city, or clear one of the filters.</p>
        </div>
      `;
      relatedBlock.hidden = true;
      gridHost.innerHTML = '';
      renderPopularSearches(buckets.intent);
      return;
    }

    const renderStars = (rating) => {
      const rounded = Math.max(0, Math.min(5, Math.round(Number(rating || 0))));
      return Array.from({ length: 5 }, (_, index) => `<i class="fa-${index < rounded ? 'solid' : 'regular'} fa-star"></i>`).join('');
    };

    const renderFeaturedCard = (item) => `
      <article class="search-result-featured">
        <div class="search-result-card-image">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />
          <span class="search-result-badge">Provider</span>
        </div>
        <div class="search-result-featured-copy">
          <span class="search-result-provider-pill">Provider</span>
          <h2>${escapeHtml(item.title)} <i class="fa-solid fa-circle-check"></i></h2>
          <p>${escapeHtml(item.subtitle)}</p>
          <div class="search-result-rating-row">
            <strong>${Number(item.rating || 0).toFixed(1)}</strong>
            <span>${renderStars(item.rating)}</span>
            <small>(${formatNumber(item.reviewCount || 0)} reviews)</small>
          </div>
          <div class="search-result-location"><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.city || item.location)}</div>
          <p class="search-result-description">${escapeHtml(item.raw?.bio || `Specialized in ${item.subtitle} and related ${item.category} services.`)}</p>
          <div class="search-result-service-chips">
            ${getProviderServiceChips(item).map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}
          </div>
          <div class="search-result-featured-actions">
            <a href="${escapeHtml(item.messageHref)}" class="search-result-message"><i class="fa-regular fa-comment"></i> Message</a>
            <a href="${escapeHtml(item.href)}" class="search-result-profile">View Profile</a>
          </div>
        </div>
      </article>
    `;

    const renderRelatedCard = (item) => `
      <a href="${escapeHtml(item.href)}" class="search-result-related-card">
        <div class="search-result-related-image">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />
          <button type="button" aria-label="Save provider"><i class="fa-regular fa-heart"></i></button>
          <span>Provider</span>
        </div>
        <div class="search-result-related-copy">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.subtitle)}</p>
          <strong>${Number(item.rating || 0).toFixed(1)} <i class="fa-solid fa-star"></i> <small>(${formatNumber(item.reviewCount || 0)})</small></strong>
          <div><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.city || item.location)}</div>
          <small>${item.priceLabel ? `From ${escapeHtml(item.priceLabel)}` : `${formatNumber(item.nearness || 0)}% match`}</small>
        </div>
      </a>
    `;

    const renderCard = (item) => `
      <a href="${escapeHtml(item.href)}" class="search-result-card">
        <div class="search-result-card-image">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" />
          <button type="button" class="search-result-save" aria-label="Save provider"><i class="fa-regular fa-heart"></i></button>
          <span class="search-result-badge">Provider</span>
        </div>
        <div class="search-result-card-copy">
          <h2>${escapeHtml(item.title)}</h2>
          <p>${escapeHtml(item.subtitle)}</p>
          <strong>${Number(item.rating || 0).toFixed(1)} <i class="fa-solid fa-star"></i> <small>(${formatNumber(item.reviewCount || 0)})</small></strong>
          <small><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.city || item.location)}</small>
          <em>${Number(item.nearness || 0) >= 45 ? 'Available now' : 'Available soon'}</em>
          <b>${item.priceLabel ? `From ${escapeHtml(item.priceLabel)}` : `${formatNumber(item.nearness || 0)}% match`}</b>
        </div>
      </a>
    `;

    const best = buckets.exact[0] || filtered[0];
    const remainingExact = buckets.exact.filter((item) => item.href !== best.href);
    const related = [...remainingExact, ...buckets.related].filter((item, index, array) => array.findIndex((other) => other.href === item.href) === index);
    bestHost.innerHTML = renderFeaturedCard(best);
    relatedBlock.hidden = !related.length;
    relatedHost.innerHTML = related.slice(0, state.showAllRelated ? 48 : 8).map(renderRelatedCard).join('');
    const pageSize = 10;
    const gridResults = desktopResults.length ? desktopResults : filtered;
    const totalPages = Math.max(1, Math.ceil(gridResults.length / pageSize));
    state.page = Math.min(Math.max(1, state.page), totalPages);
    const pageStart = (state.page - 1) * pageSize;
    gridHost.innerHTML = gridResults.slice(pageStart, pageStart + pageSize).map(renderCard).join('');
    renderPagination(totalPages);
    renderPopularSearches(buckets.intent);
  }

  function renderPagination(totalPages = 1) {
    if (!paginationHost) return;
    if (totalPages <= 1) {
      paginationHost.innerHTML = '';
      return;
    }
    const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1);
    paginationHost.innerHTML = `
      <button type="button" data-page-prev ${state.page <= 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>
      ${pages.map((pageNumber) => `<button type="button" data-page-number="${pageNumber}" class="${pageNumber === state.page ? 'is-active' : ''}">${pageNumber}</button>`).join('')}
      ${totalPages > 5 ? '<span>...</span>' : ''}
      <button type="button" data-page-next ${state.page >= totalPages ? 'disabled' : ''}>Next <i class="fa-solid fa-chevron-right"></i></button>
    `;
    paginationHost.querySelector('[data-page-prev]')?.addEventListener('click', () => {
      state.page = Math.max(1, state.page - 1);
      render();
    });
    paginationHost.querySelector('[data-page-next]')?.addEventListener('click', () => {
      state.page = Math.min(totalPages, state.page + 1);
      render();
    });
    paginationHost.querySelectorAll('[data-page-number]').forEach((button) => {
      button.addEventListener('click', () => {
        state.page = Number(button.getAttribute('data-page-number') || 1);
        render();
      });
    });
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
      categories: getCatalog().map((category) => ({
        label: category.label,
        shortLabel: category.shortLabel || '',
        subservices: Array.isArray(category.subservices) ? category.subservices : []
      })),
      matchingCategory: state.searchIntent.category || '',
      providers: buildProviderAiPayload(),
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
    state.aiRanking = {
      bestMatches: Array.isArray(remoteIntent.bestMatches) ? remoteIntent.bestMatches : [],
      relatedMatches: Array.isArray(remoteIntent.relatedMatches) ? remoteIntent.relatedMatches : []
    };
  }

  function buildProviderAiPayload() {
    return allResults.map((item) => ({
      uid: item.uid,
      name: item.title,
      title: item.subtitle,
      specialty: item.subtitle,
      category: item.category,
      city: item.city,
      province: item.province,
      location: item.location,
      rating: Number(item.rating || 0),
      reviewCount: Number(item.reviewCount || 0),
      services: getProviderServiceChips(item),
      bio: String(item.raw?.bio || '').slice(0, 260)
    }));
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
  backBtn?.addEventListener('click', () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = `${base}index.html`;
  });
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nextQuery = String(searchInput?.value || '').trim();
    state.query = nextQuery;
    state.service = '';
    state.category = '';
    state.searchIntent = null;
    state.aiRanking = null;
    state.showAllRelated = false;
    state.page = 1;
    render();
    await resolveSearchIntentBeforeLoadingProviders();
    render();
  });
  sortSelect?.addEventListener('change', () => {
    state.sort = String(sortSelect.value || 'relevant');
    state.page = 1;
    render();
  });
  page.querySelector('[data-search-view-all-related]')?.addEventListener('click', () => {
    state.showAllRelated = !state.showAllRelated;
    render();
  });
  filterCloseTriggers.forEach((trigger) => trigger.addEventListener('click', closeDialog));
  resetBtn?.addEventListener('click', () => {
    state.category = '';
    state.rating = 0;
    state.page = 1;
    render();
  });

  desktopCategorySelect?.addEventListener('change', () => {
    const category = String(desktopCategorySelect.value || '');
    state.category = category;
    state.service = '';
    state.page = 1;
    renderFilterOptions();
  });

  desktopFilterForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    state.query = String(desktopQueryInput?.value || '').trim();
    state.category = String(desktopCategorySelect?.value || '').trim();
    state.service = String(desktopServiceSelect?.value || '').trim();
    state.rating = desktopRatingInput?.checked ? 4.5 : 0;
    state.searchIntent = null;
    state.aiRanking = null;
    state.page = 1;
    render();
    await resolveSearchIntentBeforeLoadingProviders();
    render();
  });

  desktopClearBtn?.addEventListener('click', () => {
    state.query = '';
    state.category = '';
    state.service = '';
    state.rating = 0;
    state.searchIntent = null;
    state.aiRanking = null;
    state.page = 1;
    if (desktopQueryInput) desktopQueryInput.value = '';
    if (desktopLocationInput) desktopLocationInput.value = '';
    if (desktopRatingInput) desktopRatingInput.checked = false;
    render();
  });

  async function init() {
    render();
    const providerResults = await getProviderResults();
    allResults = providerResults;
    providersLoaded = true;
    await resolveSearchIntentBeforeLoadingProviders();
    render();
  }

  init();
});
