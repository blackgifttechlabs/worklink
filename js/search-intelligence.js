(function searchIntelligenceBootstrap(root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.WorkLinkUpSearchIntelligence = api;
})(typeof globalThis !== 'undefined' ? globalThis : window, function searchIntelligenceFactory(root) {
  const FALLBACK_LOCATIONS = [
    { province: 'Bulawayo', cities: ['Bulawayo', 'Cowdray Park', 'Luveve', 'Magwegwe', 'Mpopoma', 'Nkulumane', 'Pumula', 'Tshabalala'] },
    { province: 'Harare', cities: ['Harare', 'Borrowdale', 'Budiriro', 'Chitungwiza', 'Dzivarasekwa', 'Glen Norah', 'Glen View', 'Greendale', 'Hatfield', 'Highfield', 'Kambuzuma', 'Kuwadzana', 'Mbare', 'Mufakose', 'Norton', 'Ruwa', 'Southerton', 'Waterfalls'] },
    { province: 'Manicaland', cities: ['Mutare', 'Birchenough Bridge', 'Buhera', 'Chimanimani', 'Chipinge', 'Hauna', 'Headlands', 'Makoni', 'Murambinda', 'Nyanga', 'Odzi', 'Penhalonga', 'Rusape', 'Sakubva'] },
    { province: 'Mashonaland Central', cities: ['Bindura', 'Centenary', 'Concession', 'Glendale', 'Guruve', 'Mazowe', 'Mbire', 'Mount Darwin', 'Mvurwi', 'Rushinga', 'Shamva'] },
    { province: 'Mashonaland East', cities: ['Marondera', 'Beatrice', 'Chivhu', 'Goromonzi', 'Hwedza', 'Mahusekwa', 'Macheke', 'Mudzi', 'Murewa', 'Mutoko', 'Nyamapanda', 'Seke', 'Uzumba'] },
    { province: 'Mashonaland West', cities: ['Chinhoyi', 'Alaska', 'Banket', 'Chegutu', 'Chirundu', 'Kadoma', 'Kariba', 'Karoi', 'Makuti', 'Mhondoro', 'Mhangura', 'Murombedzi', 'Raffingora', 'Sanyati'] },
    { province: 'Masvingo', cities: ['Masvingo', 'Bikita', 'Chiredzi', 'Chivi', 'Gutu', 'Mashava', 'Mwenezi', 'Ngundu', 'Rutenga', 'Triangle', 'Zaka'] },
    { province: 'Matabeleland North', cities: ['Lupane', 'Binga', 'Bubi', 'Dete', 'Hwange', 'Jotsholo', 'Kamativi', 'Nkayi', 'Tsholotsho', 'Victoria Falls'] },
    { province: 'Matabeleland South', cities: ['Gwanda', 'Beitbridge', 'Esigodini', 'Filabusi', 'Figtree', 'Insiza', 'Kezi', 'Mangwe', 'Matobo', 'Plumtree'] },
    { province: 'Midlands', cities: ['Gweru', 'Chirumhanzu', 'Gokwe', 'Kwekwe', 'Lalapanzi', 'Mberengwa', 'Mvuma', 'Redcliff', 'Shurugwi', 'Zvishavane'] }
  ];

  const SEARCH_ALIASES = [
    ['maid', 'Domestic Worker / Housekeeper', 'Cleaning Services'],
    ['house maid', 'Domestic Worker / Housekeeper', 'Cleaning Services'],
    ['cleaner', 'Domestic Worker / Housekeeper', 'Cleaning Services'],
    ['house cleaning', 'Deep House Cleaning', 'Cleaning Services'],
    ['carpenter', 'Carpenter', 'Home Services'],
    ['capender', 'Carpenter', 'Home Services'],
    ['capenter', 'Carpenter', 'Home Services'],
    ['carpender', 'Carpenter', 'Home Services'],
    ['wood work', 'Carpenter', 'Home Services'],
    ['woodwork', 'Carpenter', 'Home Services'],
    ['garden', 'General Gardener', 'Gardening & Landscaping'],
    ['gardens', 'General Gardener', 'Gardening & Landscaping'],
    ['gardener', 'General Gardener', 'Gardening & Landscaping'],
    ['lawn', 'Lawn Mower', 'Gardening & Landscaping'],
    ['mowing', 'Lawn Mower', 'Gardening & Landscaping'],
    ['fix pipes', 'Leak Repairs', 'Plumbing'],
    ['blocked drain', 'Blocked Drains', 'Plumbing'],
    ['geyser', 'Geyser / Water Heater Installation', 'Plumbing'],
    ['wiring', 'Wiring & Rewiring', 'Electrical'],
    ['solar', 'Solar System Installation', 'Electrical'],
    ['power backup', 'Inverter & Battery Setup', 'Electrical'],
    ['builder', 'Building Contractor', 'Construction & Building'],
    ['build wall', 'Bricklayer', 'Construction & Building'],
    ['web site', 'Web Designer', 'Digital & Business'],
    ['website', 'Web Designer', 'Digital & Business'],
    ['app', 'App Developer', 'Digital & Business'],
    ['computer repair', 'IT Support / Technician', 'Digital & Business'],
    ['phone repair', 'Phone Screen Replacement', 'Appliance & Electronics Repair'],
    ['make up', 'Makeup Artist', 'Beauty & Wellness'],
    ['makeup', 'Makeup Artist', 'Beauty & Wellness'],
    ['hair', 'Hairdresser', 'Beauty & Wellness'],
    ['haircut', 'Barber', 'Beauty & Wellness'],
    ['hair cut', 'Barber', 'Beauty & Wellness'],
    ['cut hair', 'Barber', 'Beauty & Wellness'],
    ['trim hair', 'Barber', 'Beauty & Wellness'],
    ['my hair is too long', 'Barber', 'Beauty & Wellness'],
    ['hair too long', 'Barber', 'Beauty & Wellness'],
    ['barber', 'Barber', 'Beauty & Wellness'],
    ['shave', 'Barber', 'Beauty & Wellness'],
    ['nails', 'Nail Technician', 'Beauty & Wellness'],
    ['moving', 'Moving & Relocation Services', 'Transport & Logistics'],
    ['truck', 'Goods Transport (truck / bakkie)', 'Transport & Logistics'],
    ['taxi', 'Taxi / Ride-hailing Driver', 'Transport & Logistics'],
    ['wedding photos', 'Wedding Photographer', 'Photography & Videography'],
    ['photos', 'Photographer', 'Photography & Videography'],
    ['maths', 'Maths Tutor', 'Tutoring & Education'],
    ['math', 'Maths Tutor', 'Tutoring & Education'],
    ['babysitter', 'Babysitter', 'Childcare & Family'],
    ['nanny', 'Nanny', 'Childcare & Family'],
    ['security camera', 'CCTV Installation', 'Security Services'],
    ['cctv', 'CCTV Installation', 'Security Services'],
    ['water tank', 'Water Tank Installer', 'Home Services'],
    ['borehole', 'Borehole Drilling', 'Water & Environment'],
    ['catering', 'Event Caterer', 'Food & Catering'],
    ['cake', 'Baking & Cake Making', 'Food & Catering']
  ];

  function normalizeText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function tokenize(value) {
    const stopwords = new Set(['a', 'an', 'and', 'for', 'from', 'i', 'in', 'me', 'my', 'near', 'need', 'of', 'the', 'to', 'with']);
    return normalizeText(value).split(' ').filter((token) => token.length > 1 && !stopwords.has(token));
  }

  function levenshtein(a, b) {
    const first = normalizeText(a);
    const second = normalizeText(b);
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

  function fuzzyBonus(query, value) {
    const normalizedQuery = normalizeText(query);
    const normalizedValue = normalizeText(value);
    if (!normalizedQuery || !normalizedValue) return 0;
    if (normalizedValue === normalizedQuery) return 220;
    if (normalizedValue.startsWith(normalizedQuery)) return 150;
    if (normalizedValue.length >= 3 && normalizedQuery.includes(normalizedValue)) return 120;
    if (normalizedValue.includes(normalizedQuery)) return 95;

    const queryTokens = tokenize(normalizedQuery);
    const valueTokens = tokenize(normalizedValue);
    const tokenHits = queryTokens.filter((token) => valueTokens.some((valueToken) => valueToken === token || valueToken.startsWith(token) || levenshtein(token, valueToken) <= 1)).length;
    let score = tokenHits * 32;
    if (normalizedQuery.length >= 4 && levenshtein(normalizedQuery, normalizedValue) <= 2) score += 70;
    return score;
  }

  function getCatalog() {
    return Array.isArray(root.WorkLinkUpServiceCatalog) ? root.WorkLinkUpServiceCatalog : [];
  }

  function getLocations() {
    return Array.isArray(root.WorkLinkUpZimbabweLocations) ? root.WorkLinkUpZimbabweLocations : FALLBACK_LOCATIONS;
  }

  function buildCatalogEntries(catalog = getCatalog(), locations = getLocations()) {
    const entries = [];

    catalog.forEach((category) => {
      const label = String(category.label || '').trim();
      const shortLabel = String(category.shortLabel || '').trim();
      const subservices = Array.isArray(category.subservices) ? category.subservices : [];
      if (!label) return;

      entries.push({
        kind: 'category',
        title: label,
        query: label,
        category: label,
        subtitle: `${subservices.length} services`,
        icon: category.icon || 'fa-solid fa-briefcase',
        terms: [label, shortLabel, ...subservices]
      });

      subservices.forEach((service) => {
        const serviceLabel = String(service || '').trim();
        if (!serviceLabel) return;
        entries.push({
          kind: 'service',
          title: serviceLabel,
          query: serviceLabel,
          service: serviceLabel,
          category: label,
          subtitle: label,
          icon: category.icon || 'fa-solid fa-briefcase',
          terms: [serviceLabel, label, shortLabel]
        });
      });
    });

    locations.forEach((location) => {
      const province = String(location.province || '').trim();
      (Array.isArray(location.cities) ? location.cities : []).forEach((city) => {
        const cityLabel = String(city || '').trim();
        if (!cityLabel) return;
        entries.push({
          kind: 'location',
          title: cityLabel,
          query: cityLabel,
          city: cityLabel,
          province,
          subtitle: province ? `Location • ${province}` : 'Location',
          icon: 'fa-solid fa-location-dot',
          terms: [cityLabel, province]
        });
      });
      if (province) {
        entries.push({
          kind: 'location',
          title: province,
          query: province,
          province,
          subtitle: 'Province',
          icon: 'fa-solid fa-location-dot',
          terms: [province]
        });
      }
    });

    SEARCH_ALIASES.forEach(([alias, service, category]) => {
      entries.push({
        kind: 'alias',
        title: service,
        query: service,
        service,
        category,
        subtitle: `Suggested from "${alias}"`,
        icon: 'fa-solid fa-wand-magic-sparkles',
        terms: [alias, service, category]
      });
    });

    return entries;
  }

  function scoreEntry(entry, query) {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return entry.kind === 'location' ? 8 : 12;
    const titleScore = fuzzyBonus(normalizedQuery, entry.title) * 1.1;
    const termScore = (Array.isArray(entry.terms) ? entry.terms : [])
      .reduce((best, term) => Math.max(best, fuzzyBonus(normalizedQuery, term)), 0);
    const kindBoost = entry.kind === 'service' ? 16 : entry.kind === 'alias' ? 22 : entry.kind === 'category' ? 10 : 4;
    const mixedQueryPenalty = entry.kind === 'location' && tokenize(normalizedQuery).length > 1 ? 0.54 : 1;
    return Math.round((titleScore + termScore + kindBoost) * mixedQueryPenalty);
  }

  function rankEntries(query, options = {}) {
    const limit = Number(options.limit || 10);
    const seen = new Set();
    return buildCatalogEntries(options.catalog, options.locations)
      .map((entry) => ({ ...entry, _score: scoreEntry(entry, query) }))
      .filter((entry) => !query || entry._score > 28)
      .sort((first, second) => Number(second._score || 0) - Number(first._score || 0))
      .filter((entry) => {
        const key = entry.kind === 'location'
          ? `location|${entry.title}`.toLowerCase()
          : [entry.title, entry.category || '', entry.service || entry.title || ''].join('|').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limit);
  }

  function resolveIntent(query, options = {}) {
    const matches = rankEntries(query, { ...options, limit: options.limit || 8 });
    const bestService = matches.find((item) => item.service);
    const bestCategory = matches.find((item) => item.category);
    const bestLocation = matches.find((item) => item.kind === 'location');
    return {
      query: String(query || '').trim(),
      service: bestService?.service || '',
      category: bestService?.category || bestCategory?.category || '',
      city: bestLocation?.city || '',
      province: bestLocation?.province || '',
      suggestions: matches
    };
  }

  async function refineIntentWithGroq(query, localMatches = [], options = {}) {
    if (typeof fetch !== 'function') return null;
    const endpoint = options.endpoint || '/api/search-intent';
    const candidates = Array.isArray(options.candidates)
      ? options.candidates
      : options.includeAllCandidates
        ? buildCatalogEntries()
        : localMatches;
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutMs = Number(options.timeoutMs || 1800);
    let timeoutId = 0;
    if (controller) timeoutId = root.setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller?.signal,
        body: JSON.stringify({
          query,
          candidates: candidates.slice(0, Number(options.maxCandidates || 600)).map((item) => ({
            kind: item.kind,
            title: item.title,
            service: item.service || '',
            category: item.category || '',
            city: item.city || '',
            province: item.province || '',
            subtitle: item.subtitle || ''
          })),
          categories: Array.isArray(options.categories) ? options.categories : [],
          matchingCategory: options.matchingCategory || '',
          providers: Array.isArray(options.providers) ? options.providers.slice(0, Number(options.maxProviders || 500)) : []
        })
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    } finally {
      if (timeoutId) root.clearTimeout(timeoutId);
    }
  }

  return {
    normalizeText,
    tokenize,
    buildCatalogEntries,
    rankEntries,
    resolveIntent,
    refineIntentWithGroq
  };
});
