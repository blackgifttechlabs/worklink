(function providerUiBootstrap() {
  const getIsEmbedded = (searchParams) => {
    if (searchParams instanceof URLSearchParams) return searchParams.get('embed') === '1';
    return new URLSearchParams(window.location.search).get('embed') === '1';
  };

  const SPECIALIST_CATEGORIES = Array.isArray(window.WorkLinkUpServiceCatalog) && window.WorkLinkUpServiceCatalog.length
    ? window.WorkLinkUpServiceCatalog
    : [];

  const ZIMBABWE_PROVINCES = [
    'Bulawayo',
    'Harare',
    'Manicaland',
    'Mashonaland Central',
    'Mashonaland East',
    'Mashonaland West',
    'Masvingo',
    'Matabeleland North',
    'Matabeleland South',
    'Midlands'
  ];

  const ZIMBABWE_LOCATION_GROUPS = [
    {
      province: 'Harare',
      city: 'Harare',
      type: 'City',
      aliases: ['Harare CBD', 'Salisbury'],
      areas: ['Avenues', 'Avondale', 'Belvedere', 'Borrowdale', 'Budiriro', 'Chisipite', 'Dzivarasekwa', 'Eastlea', 'Glen Lorne', 'Glen Norah', 'Glen View', 'Greendale', 'Hatfield', 'Highfield', 'Kambuzuma', 'Kuwadzana', 'Mabelreign', 'Mbare', 'Marlborough', 'Milton Park', 'Mount Pleasant', 'Newlands', 'Southerton', 'Tynwald', 'Waterfalls', 'Westgate', 'Warren Park']
    },
    { province: 'Harare', city: 'Chitungwiza', type: 'City', aliases: ['Zengeza', 'Seke'], areas: ['Unit A', 'Unit C', 'Unit D', 'Unit F', 'Unit J', 'Unit K', 'Unit L', 'Makoni', 'Manyame Park', 'St Marys', 'Zengeza 1', 'Zengeza 2', 'Zengeza 3', 'Zengeza 4'] },
    { province: 'Harare', city: 'Epworth', type: 'Town', areas: ['Domboramwari', 'Overspill', 'Magada', 'Solani', 'Stopover'] },
    { province: 'Harare', city: 'Ruwa', type: 'Town', areas: ['Damofalls', 'Fairview', 'Chipukutu Park', 'Ruwa Local Board', 'Zimre Park'] },
    { province: 'Harare', city: 'Norton', type: 'Town', areas: ['Katanga', 'Knowe', 'Maridale', 'Ngoni', 'Twinlakes'] },
    { province: 'Bulawayo', city: 'Bulawayo', type: 'City', aliases: ['City of Kings'], areas: ['Ascot', 'Barbourfields', 'Bellevue', 'Burnside', 'Cowdray Park', 'Emganwini', 'Entumbane', 'Hillside', 'Ilanda', 'Khumalo', 'Lobengula', 'Luveve', 'Magwegwe', 'Makokoba', 'Mahatshula', 'Mpopoma', 'Nkulumane', 'North End', 'Pumula', 'Queens Park', 'Richmond', 'Sizinda', 'Thorngrove', 'Tshabalala', 'Waterford'] },
    { province: 'Manicaland', city: 'Mutare', type: 'City', areas: ['Dangamvura', 'Fairbridge Park', 'Fern Valley', 'Florida', 'Hobhouse', 'Murambi', 'Palmerston', 'Sakubva', 'Weirmouth', 'Yeovil'] },
    { province: 'Manicaland', city: 'Rusape', type: 'Town', areas: ['Mabvazuva', 'Magamba', 'Tsanzaguru', 'Vengere'] },
    { province: 'Manicaland', city: 'Chipinge', type: 'Town', areas: ['Checheche', 'Gaza', 'Jersey', 'Mount Selinda'] },
    { province: 'Manicaland', city: 'Chimanimani', type: 'Town', areas: ['Bridal Veil', 'Cashel', 'Ngangu'] },
    { province: 'Manicaland', city: 'Nyanga', type: 'Town', areas: ['Juliasdale', 'Rochdale', 'Troutbeck'] },
    { province: 'Manicaland', city: 'Buhera', type: 'District', areas: ['Birchenough Bridge', 'Murambinda', 'Nyashanu'] },
    { province: 'Manicaland', city: 'Penhalonga', type: 'Town', areas: ['Tsvingwe', 'Old West'] },
    { province: 'Mashonaland Central', city: 'Bindura', type: 'Town', areas: ['Aerodrome', 'Chipadze', 'Chiwaridzo', 'Town Centre'] },
    { province: 'Mashonaland Central', city: 'Mazowe', type: 'Town', areas: ['Concession', 'Glendale', 'Mazowe Mine'] },
    { province: 'Mashonaland Central', city: 'Shamva', type: 'Town', areas: ['Madziwa', 'Shamva Mine'] },
    { province: 'Mashonaland Central', city: 'Mount Darwin', type: 'Town', aliases: ['Mt Darwin'], areas: ['Dotito', 'Kandeya'] },
    { province: 'Mashonaland Central', city: 'Guruve', type: 'Town', areas: ['Kachuta', 'Mushumbi Pools'] },
    { province: 'Mashonaland Central', city: 'Rushinga', type: 'Town', areas: ['Marymount', 'Rusambo'] },
    { province: 'Mashonaland Central', city: 'Centenary', type: 'Town', areas: ['Muzarabani', 'St Alberts'] },
    { province: 'Mashonaland Central', city: 'Mvurwi', type: 'Town', areas: ['Forestry', 'Town Centre'] },
    { province: 'Mashonaland East', city: 'Marondera', type: 'Town', areas: ['Cherutombo', 'Dombotombo', 'Nyameni', 'Ruzawi'] },
    { province: 'Mashonaland East', city: 'Chivhu', type: 'Town', areas: ['Gomba', 'Highview', 'Manyene'] },
    { province: 'Mashonaland East', city: 'Murehwa', type: 'Town', aliases: ['Murewa'], areas: ['Dombwe', 'Macheke', 'Murewa Centre'] },
    { province: 'Mashonaland East', city: 'Mutoko', type: 'Town', areas: ['All Souls', 'Nyamuzuwe', 'Nyamapanda'] },
    { province: 'Mashonaland East', city: 'Wedza', type: 'Town', aliases: ['Hwedza'], areas: ['Makwiro', 'Mt St Marys'] },
    { province: 'Mashonaland East', city: 'Goromonzi', type: 'District', areas: ['Arcturus', 'Domboshava', 'Juru', 'Ruwa', 'Shamva Road'] },
    { province: 'Mashonaland East', city: 'Seke', type: 'District', areas: ['Dema', 'Mahusekwa', 'Manyame'] },
    { province: 'Mashonaland West', city: 'Chinhoyi', type: 'Town', areas: ['Brundish', 'Cold Stream', 'Gadzema', 'Hunyani', 'Mpata'] },
    { province: 'Mashonaland West', city: 'Kadoma', type: 'City', areas: ['Chemukute', 'Ingezi', 'Rimuka', 'Waverley'] },
    { province: 'Mashonaland West', city: 'Chegutu', type: 'Town', areas: ['Chinengundu', 'Kaguvi', 'Pfupajena', 'Rifle Range'] },
    { province: 'Mashonaland West', city: 'Karoi', type: 'Town', areas: ['Chikangwe', 'Chiedza', 'Tengwe'] },
    { province: 'Mashonaland West', city: 'Kariba', type: 'Town', areas: ['Mahombekombe', 'Nyamhunga', 'Siavonga Border'] },
    { province: 'Mashonaland West', city: 'Banket', type: 'Town', areas: ['Dzikiti', 'Kuwadzana Banket'] },
    { province: 'Mashonaland West', city: 'Mhangura', type: 'Town', areas: ['Doma', 'Mhangura Mine'] },
    { province: 'Mashonaland West', city: 'Zvimba', type: 'District', areas: ['Murombedzi', 'Raffingora', 'Trelawney'] },
    {
      province: 'Masvingo',
      city: 'Masvingo',
      type: 'City',
      aliases: ['Masvingo City', 'Fort Victoria'],
      areas: ['Rujeko A', 'Rujeko B', 'Rujeko C', 'Pangolin', 'Majange', 'Siski', 'Sisk', 'Mucheke', 'Runyararo West', 'Rhodene', 'Clipsham', 'Victoria Ranch', 'Target Kopje', 'Morningside', 'Eastvale', 'Industrial Area', 'Zimre Park']
    },
    { province: 'Masvingo', city: 'Chivi', type: 'District', aliases: ['Chivi District'], areas: ['Chivi Growth Point', 'Mhandamabwe', 'Ngundu', 'Chibi', 'Makamure', 'Madamombe', 'Denga', 'Nyaningwe', 'Takavarasha', 'Sese'] },
    { province: 'Masvingo', city: 'Chiredzi', type: 'Town', areas: ['Buffalo Range', 'Hippo Valley', 'Tshovani', 'Triangle'] },
    { province: 'Masvingo', city: 'Gutu', type: 'District', areas: ['Mpandawana', 'Chatsworth', 'Mupandawana', 'Serima'] },
    { province: 'Masvingo', city: 'Bikita', type: 'District', areas: ['Bikita Minerals', 'Nyika', 'Gutu Road'] },
    { province: 'Masvingo', city: 'Zaka', type: 'District', areas: ['Jerera', 'Jichidza', 'Rupiri'] },
    { province: 'Masvingo', city: 'Mwenezi', type: 'District', areas: ['Rutenga', 'Neshuro', 'Sarahuru'] },
    { province: 'Masvingo', city: 'Mashava', type: 'Town', areas: ['King Mine', 'Temeraire'] },
    { province: 'Matabeleland North', city: 'Victoria Falls', type: 'City', areas: ['Chinotimba', 'Mkhosana', 'Town Centre'] },
    { province: 'Matabeleland North', city: 'Hwange', type: 'Town', areas: ['Baobab', 'Empumalanga', 'Lwendulu'] },
    { province: 'Matabeleland North', city: 'Lupane', type: 'Town', areas: ['Lupane Centre', 'Lupane State University'] },
    { province: 'Matabeleland North', city: 'Binga', type: 'Town', areas: ['Binga Centre', 'Siabuwa'] },
    { province: 'Matabeleland North', city: 'Tsholotsho', type: 'District', areas: ['Dlamini', 'Sipepa'] },
    { province: 'Matabeleland North', city: 'Nkayi', type: 'District', areas: ['Nkayi Centre', 'Sivalo'] },
    { province: 'Matabeleland North', city: 'Dete', type: 'Town', areas: ['Cross Dete', 'Hwange National Park'] },
    { province: 'Matabeleland South', city: 'Gwanda', type: 'Town', areas: ['Jahunda', 'Phakama', 'Spitzkop North'] },
    { province: 'Matabeleland South', city: 'Beitbridge', type: 'Town', areas: ['Dulivhadzimu', 'Mashavire', 'Tshitaudze'] },
    { province: 'Matabeleland South', city: 'Plumtree', type: 'Town', areas: ['Dingumuzi', 'Mathendele'] },
    { province: 'Matabeleland South', city: 'Esigodini', type: 'Town', areas: ['Habane', 'How Mine'] },
    { province: 'Matabeleland South', city: 'Filabusi', type: 'Town', areas: ['Avoca', 'Fort Rixon'] },
    { province: 'Matabeleland South', city: 'Kezi', type: 'District', areas: ['Maphisa', 'Matobo', 'Whitewater'] },
    { province: 'Matabeleland South', city: 'West Nicholson', type: 'Town', areas: ['Colleen Bawn', 'Vumbachikwe'] },
    { province: 'Midlands', city: 'Gweru', type: 'City', areas: ['Ascot', 'Athlone', 'Mkoba 1', 'Mkoba 2', 'Mkoba 6', 'Mkoba 14', 'Nashville', 'Senga', 'Southdowns', 'Woodlands'] },
    { province: 'Midlands', city: 'Kwekwe', type: 'City', areas: ['Amaveni', 'Mbizo', 'Newtown', 'Redcliff', 'Torwood'] },
    { province: 'Midlands', city: 'Redcliff', type: 'Town', areas: ['Rutendo', 'Torwood'] },
    { province: 'Midlands', city: 'Zvishavane', type: 'Town', areas: ['Eastlea', 'Highlands', 'Mandava', 'Maglas'] },
    { province: 'Midlands', city: 'Shurugwi', type: 'Town', areas: ['Makusha', 'Peak Mine'] },
    { province: 'Midlands', city: 'Mvuma', type: 'Town', areas: ['Athens Mine', 'Fairfields'] },
    { province: 'Midlands', city: 'Gokwe', type: 'Town', areas: ['Gokwe Centre', 'Nembudziya', 'Sanyati'] },
    { province: 'Midlands', city: 'Mberengwa', type: 'District', areas: ['Buchwa', 'Mataga', 'Mberengwa Centre'] },
    { province: 'Midlands', city: 'Lalapanzi', type: 'Town', areas: ['Lalapanzi Mine', 'Somabhula'] }
  ];

  const SOUTHERN_AFRICAN_LANGUAGES = [
    'Afrikaans',
    'Bemba',
    'Chichewa',
    'English',
    'French',
    'Herero',
    'Kalanga',
    'Khoekhoegowab',
    'Kikongo',
    'Kinyarwanda',
    'Lingala',
    'Lozi',
    'Lunda',
    'Luvale',
    'Ndau',
    'Ndebele',
    'Northern Sotho',
    'Nyanja',
    'Oshiwambo',
    'Portuguese',
    'Sena',
    'Sesotho',
    'Setswana',
    'Shona',
    'Siswati',
    'Tshivenda',
    'Xitsonga',
    'Tumbuka',
    'Xhosa',
    'Zulu'
  ];

  function getBase() {
    if (typeof getBasePath === 'function') return getBasePath();
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  function buildSearchResultsHref(query = '', options = {}) {
    const base = typeof options.base === 'string' ? options.base : getBase();
    const params = new URLSearchParams();
    const category = String(options.category || '').trim();
    const service = String(options.service || '').trim();
    const rating = Number(options.rating || 0);
    const searchQuery = String(query || service || category || '').trim();
    if (searchQuery) params.set('query', searchQuery);
    if (category) params.set('category', category);
    if (service) params.set('service', service);
    if (rating) params.set('rating', String(rating));
    const queryString = params.toString();
    return `${base}pages/search-results.html${queryString ? `?${queryString}` : ''}`;
  }

  function goToSearchResults(query = '', options = {}) {
    window.location.href = buildSearchResultsHref(query, options);
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setButtonLoading(button, isLoading) {
    if (!(button instanceof HTMLElement)) return;
    button.classList.toggle('is-loading', Boolean(isLoading));
    if (button instanceof HTMLButtonElement) {
      button.disabled = Boolean(isLoading);
    }
  }

  function initializeOptionalSections(container = document) {
    const toggles = container.querySelectorAll('.account-setup-optional-toggle');
    toggles.forEach((toggle) => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        if (!(content instanceof HTMLElement)) return;
        const isExpanded = content.classList.contains('is-expanded');
        content.classList.toggle('is-expanded', !isExpanded);
        toggle.classList.toggle('is-expanded', !isExpanded);
      });
    });
  }

  function showSuccessToast(message = 'Profile completed', delay = 900) {
    try {
      const existing = document.querySelector('.wl-success-toast');
      if (existing) existing.remove();
      const el = document.createElement('div');
      el.className = 'wl-success-toast';
      el.textContent = message;
      Object.assign(el.style, {
        position: 'fixed',
        left: '50%',
        top: '20px',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        color: '#0b0b0b',
        padding: '10px 14px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
        zIndex: 2300,
        fontWeight: 700,
        transition: 'opacity 0.24s ease'
      });
      document.body.appendChild(el);
      window.setTimeout(() => {
        el.style.opacity = '0';
        window.setTimeout(() => el.remove(), 240);
      }, Number(delay) || 900);
    } catch (e) {
      // ignore
    }
  }

  function readSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function setSessionFlag(key, value = '1') {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function clearSessionFlag(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function getStoredAccount() {
    try {
      const raw = localStorage.getItem('softgiggles_account');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function waitForAuthHelper(timeoutMs = 10000) {
    return new Promise((resolve) => {
      if (window.softGigglesAuth) {
        resolve(window.softGigglesAuth);
        return;
      }

      const startedAt = Date.now();
      const intervalId = window.setInterval(() => {
        if (window.softGigglesAuth || Date.now() - startedAt >= timeoutMs) {
          window.clearInterval(intervalId);
          resolve(window.softGigglesAuth || null);
        }
      }, 120);
    });
  }

  function getCategoryConfig(label) {
    return SPECIALIST_CATEGORIES.find((category) => category.label === label) || SPECIALIST_CATEGORIES[0];
  }

  function getAllSubservices() {
    return SPECIALIST_CATEGORIES.flatMap((category) => Array.isArray(category.subservices) ? category.subservices : []);
  }

  function getSubservicesForCategory(categoryLabel = '') {
    const category = getCategoryConfig(categoryLabel);
    return Array.isArray(category?.subservices) ? category.subservices : [];
  }

  function buildSubserviceOptionsMarkup(categoryLabel = '', selectedValue = '', placeholder = 'Choose a service') {
    const subservices = getSubservicesForCategory(categoryLabel);
    return buildSelectOptions(subservices, selectedValue, placeholder);
  }

  function normalizeTypeaheadTerm(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  function uniqueTypeaheadItems(items = [], keyGetter = (item) => item.label) {
    const seen = new Set();
    return items.filter((item) => {
      const key = normalizeTypeaheadTerm(keyGetter(item));
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function buildLocationTypeaheadItems() {
    const items = ZIMBABWE_LOCATION_GROUPS.flatMap((group) => {
      const city = String(group.city || '').trim();
      const province = String(group.province || '').trim();
      const aliases = Array.isArray(group.aliases) ? group.aliases : [];
      const baseTerms = [city, province, group.type, aliases].flat().filter(Boolean);
      const cityItem = {
        kind: 'city',
        label: city,
        detail: `${group.type || 'Location'} • ${province}`,
        city,
        province,
        area: '',
        terms: baseTerms
      };
      const areaItems = (Array.isArray(group.areas) ? group.areas : []).map((area) => ({
        kind: 'area',
        label: `${area}, ${city}`,
        detail: province,
        city,
        province,
        area,
        terms: [area, city, province, aliases].flat().filter(Boolean)
      }));
      const aliasItems = aliases.map((alias) => ({
        kind: 'alias',
        label: alias,
        detail: `${city} • ${province}`,
        city,
        province,
        area: '',
        terms: [alias, city, province]
      }));
      return [cityItem, ...aliasItems, ...areaItems];
    });

    return uniqueTypeaheadItems(items, (item) => `${item.label}_${item.city}_${item.province}`);
  }

  const LOCATION_TYPEAHEAD_ITEMS = buildLocationTypeaheadItems();

  function scoreTypeaheadItem(item, query) {
    const normalizedQuery = normalizeTypeaheadTerm(query);
    if (!normalizedQuery) return item.kind === 'city' || item.kind === 'category' ? 20 : 8;
    const terms = uniqueTypeaheadItems(
      [item.label, item.detail, item.city, item.province, item.area, item.category, item.service, item.terms].flat()
        .filter(Boolean)
        .map((term) => ({ label: String(term) }))
    ).map((entry) => normalizeTypeaheadTerm(entry.label));

    let score = 0;
    terms.forEach((term) => {
      if (!term) return;
      if (term === normalizedQuery) score = Math.max(score, 120);
      else if (term.startsWith(normalizedQuery)) score = Math.max(score, 86);
      else if (term.includes(normalizedQuery)) score = Math.max(score, 54);
      else if (normalizedQuery.split(' ').every((part) => term.includes(part))) score = Math.max(score, 38);
    });

    if (item.kind === 'city' || item.kind === 'service') score += 6;
    return score;
  }

  function getTypeaheadSuggestions(items, query, limit = 24) {
    return items
      .map((item, index) => ({
        ...item,
        index,
        score: scoreTypeaheadItem(item, query)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, limit);
  }

  function findExactTypeaheadItem(items, value) {
    const normalized = normalizeTypeaheadTerm(value);
    if (!normalized) return null;
    return items.find((item) => [
      item.label,
      item.city,
      item.area,
      `${item.area || ''} ${item.city || ''}`,
      `${item.area || ''}, ${item.city || ''}`,
      item.service,
      item.category
    ].some((term) => normalizeTypeaheadTerm(term) === normalized)) || null;
  }

  function buildServiceTypeaheadItems() {
    const items = SPECIALIST_CATEGORIES.flatMap((category) => {
      const categoryLabel = String(category.label || '').trim();
      const shortLabel = String(category.shortLabel || '').trim();
      const subservices = Array.isArray(category.subservices) ? category.subservices : [];
      const categoryItem = {
        kind: 'category',
        label: categoryLabel,
        detail: `${subservices.length} services`,
        category: categoryLabel,
        service: '',
        icon: category.icon || 'fa-solid fa-briefcase',
        terms: [categoryLabel, shortLabel, subservices].flat().filter(Boolean)
      };
      const serviceItems = subservices.map((service) => ({
        kind: 'service',
        label: String(service || '').trim(),
        detail: categoryLabel,
        category: categoryLabel,
        service: String(service || '').trim(),
        icon: category.icon || 'fa-solid fa-briefcase',
        terms: [service, categoryLabel, shortLabel]
      }));
      return [categoryItem, ...serviceItems];
    });

    return uniqueTypeaheadItems(items, (item) => `${item.label}_${item.category}`);
  }

  const SERVICE_TYPEAHEAD_ITEMS = buildServiceTypeaheadItems();

  function normalizeProviderServiceItem(item = {}) {
    if (typeof item === 'string') {
      const exact = findExactTypeaheadItem(SERVICE_TYPEAHEAD_ITEMS, item);
      return normalizeProviderServiceItem(exact || { service: item, label: item });
    }

    const rawService = String(item.service || item.specialty || item.name || item.label || item.category || '').trim();
    const service = rawService || String(item.primaryCategory || '').trim();
    if (!service) return null;
    const category = String(item.category || item.primaryCategory || getCategoryBySubservice(service)?.label || service).trim();
    return {
      category,
      service
    };
  }

  function normalizeProviderServiceList(services = []) {
    const source = Array.isArray(services) ? services : [];
    const seen = new Set();
    return source
      .map((item) => normalizeProviderServiceItem(item))
      .filter((item) => {
        if (!item) return false;
        const key = `${normalizeTypeaheadTerm(item.category)}_${normalizeTypeaheadTerm(item.service)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function getProviderServiceList(provider = {}, fallbackService = '') {
    const explicitServices = normalizeProviderServiceList(provider.services || provider.serviceList || []);
    if (explicitServices.length) return explicitServices;
    return normalizeProviderServiceList([
      {
        category: provider.primaryCategory || '',
        service: provider.specialty || provider.title || fallbackService || provider.primaryCategory || ''
      }
    ]);
  }

  function getServiceListLabel(providerOrServices = {}, limit = 3) {
    const services = Array.isArray(providerOrServices)
      ? normalizeProviderServiceList(providerOrServices)
      : getProviderServiceList(providerOrServices);
    if (!services.length) return '';
    const labels = services.map((item) => item.service || item.category).filter(Boolean);
    const visible = labels.slice(0, limit).join(', ');
    return labels.length > limit ? `${visible} +${labels.length - limit} more` : visible;
  }

  function syncPrimaryServiceFields(form, services = []) {
    if (!(form instanceof HTMLFormElement)) return;
    const firstService = normalizeProviderServiceList(services)[0] || null;
    const serviceName = firstService?.service || '';
    const categoryName = firstService?.category || '';
    const categoryField = form.querySelector('[data-provider-service-category]');
    const specialtyField = form.querySelector('[data-provider-service-name]');
    const titleField = form.querySelector('[data-provider-service-title]');
    if (categoryField instanceof HTMLInputElement) categoryField.value = categoryName;
    if (specialtyField instanceof HTMLInputElement) specialtyField.value = serviceName;
    if (titleField instanceof HTMLInputElement) {
      titleField.value = getServiceListLabel(services) || serviceName;
    }
  }

  function renderSetupTypeaheadList(host, items, emptyText = 'No matches found') {
    if (!(host instanceof HTMLElement)) return;
    host.innerHTML = items.length
      ? items.map((item, index) => `
        <button type="button" class="account-typeahead-option" data-typeahead-index="${index}">
          <span class="account-typeahead-main">${escapeHtml(item.label)}</span>
          <span class="account-typeahead-detail">${escapeHtml(item.detail || '')}</span>
        </button>
      `).join('')
      : `<div class="account-typeahead-empty">${escapeHtml(emptyText)}</div>`;
  }

  function bindSetupTypeahead({ input, list, items, hiddenFields, emptyText, onSelect }) {
    if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement)) {
      return {
        getSelection: () => null,
        setInvalid: () => {}
      };
    }

    let currentItems = [];
    let selectedItem = null;

    function syncHidden(item) {
      Object.entries(hiddenFields || {}).forEach(([fieldKey, selector]) => {
        const field = input.form?.querySelector(selector);
        if (field instanceof HTMLInputElement) {
          field.value = item ? String(item[fieldKey] || '') : '';
        }
      });
    }

    function showSuggestions(query = input.value) {
      currentItems = getTypeaheadSuggestions(items, query, 26);
      renderSetupTypeaheadList(list, currentItems, emptyText);
      list.hidden = false;
      list.classList.add('is-open');
    }

    function hideSuggestions() {
      list.hidden = true;
      list.classList.remove('is-open');
    }

    function selectItem(item) {
      if (!item) return;
      selectedItem = item;
      input.value = item.label;
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
      syncHidden(item);
      if (typeof onSelect === 'function') onSelect(item);
      hideSuggestions();
    }

    input.addEventListener('focus', () => showSuggestions());
    input.addEventListener('input', () => {
      selectedItem = null;
      input.classList.remove('is-valid');
      syncHidden(null);
      showSuggestions();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !list.hidden && currentItems[0]) {
        event.preventDefault();
        selectItem(currentItems[0]);
      }
      if (event.key === 'Escape') hideSuggestions();
    });
    input.addEventListener('blur', () => {
      window.setTimeout(() => {
        const exact = selectedItem || findExactTypeaheadItem(items, input.value);
        if (exact) {
          selectItem(exact);
        } else {
          hideSuggestions();
        }
      }, 140);
    });

    list.addEventListener('pointerdown', (event) => {
      const button = event.target.closest('[data-typeahead-index]');
      if (!(button instanceof HTMLElement)) return;
      event.preventDefault();
      selectItem(currentItems[Number(button.getAttribute('data-typeahead-index') || -1)]);
    });

    const existing = findExactTypeaheadItem(items, input.value);
    if (existing) selectItem(existing);

    return {
      getSelection: () => selectedItem || findExactTypeaheadItem(items, input.value),
      setInvalid: (invalid) => {
        input.classList.toggle('is-invalid', Boolean(invalid));
        input.classList.toggle('is-valid', !invalid && Boolean(input.value.trim()));
      }
    };
  }

  function bindServiceMultiPicker({ input, list, chipHost, initialServices, emptyText = 'No service found', onChange }) {
    if (!(input instanceof HTMLInputElement) || !(list instanceof HTMLElement) || !(chipHost instanceof HTMLElement)) {
      return {
        getSelections: () => [],
        setInvalid: () => {}
      };
    }

    let currentItems = [];
    let selectedServices = normalizeProviderServiceList(initialServices);

    function hideSuggestions() {
      list.hidden = true;
      list.classList.remove('is-open');
    }

    function showSuggestions(query = input.value) {
      currentItems = getTypeaheadSuggestions(SERVICE_TYPEAHEAD_ITEMS, query, 26);
      renderSetupTypeaheadList(list, currentItems, emptyText);
      list.hidden = false;
      list.classList.add('is-open');
    }

    function emitChange() {
      if (typeof onChange === 'function') onChange(selectedServices.slice());
    }

    function renderChips() {
      chipHost.innerHTML = selectedServices.length
        ? selectedServices.map((item, index) => `
          <span class="account-service-chip">
            <span>${escapeHtml(item.service)}</span>
            <small>${escapeHtml(item.category)}</small>
            <button type="button" data-remove-service="${index}" aria-label="Remove ${escapeHtml(item.service)}"><i class="fa-solid fa-xmark"></i></button>
          </span>
        `).join('')
        : '<span class="account-service-chip-empty">No services added yet.</span>';
      chipHost.classList.toggle('is-empty', !selectedServices.length);
      input.classList.toggle('is-valid', Boolean(selectedServices.length));
    }

    function addService(item) {
      const normalized = normalizeProviderServiceItem(item);
      if (!normalized) return;
      selectedServices = normalizeProviderServiceList([...selectedServices, normalized]);
      input.value = '';
      input.classList.remove('is-invalid');
      hideSuggestions();
      renderChips();
      emitChange();
    }

    input.addEventListener('focus', () => showSuggestions());
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      showSuggestions();
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        const exact = findExactTypeaheadItem(SERVICE_TYPEAHEAD_ITEMS, input.value);
        const nextItem = exact || currentItems[0];
        if (nextItem) {
          event.preventDefault();
          addService(nextItem);
        }
      }
      if (event.key === 'Escape') hideSuggestions();
    });
    input.addEventListener('blur', () => {
      window.setTimeout(() => {
        const exact = findExactTypeaheadItem(SERVICE_TYPEAHEAD_ITEMS, input.value);
        if (exact) addService(exact);
        else hideSuggestions();
      }, 140);
    });

    list.addEventListener('pointerdown', (event) => {
      const button = event.target.closest('[data-typeahead-index]');
      if (!(button instanceof HTMLElement)) return;
      event.preventDefault();
      addService(currentItems[Number(button.getAttribute('data-typeahead-index') || -1)]);
    });

    chipHost.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-service]');
      if (!(button instanceof HTMLElement)) return;
      const index = Number(button.getAttribute('data-remove-service') || -1);
      if (index < 0) return;
      selectedServices.splice(index, 1);
      selectedServices = normalizeProviderServiceList(selectedServices);
      renderChips();
      emitChange();
    });

    renderChips();
    emitChange();

    return {
      getSelections: () => selectedServices.slice(),
      setInvalid: (invalid) => {
        input.classList.toggle('is-invalid', Boolean(invalid));
        chipHost.classList.toggle('is-invalid', Boolean(invalid));
      }
    };
  }

  function resolveMediaSrc(value, fallback = '') {
    const source = String(value || '').trim();
    if (!source) return fallback ? resolveMediaSrc(fallback) : `${getBase()}images/logo/logo.jpg`;
    if (/^(data:|https?:|blob:|\/)/.test(source)) return source;
    return `${getBase()}${source}`;
  }

  function buildWhatsAppLink(number, providerName = '') {
    const digits = String(number || '').replace(/[^0-9]/g, '');
    const text = providerName ? `Hi ${providerName}, I found you on WorkLinkUp.` : 'Hi, I found you on WorkLinkUp.';
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }

  function buildProviderHandle(name) {
    return `@${String(name || 'provider').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;
  }

  function normalizeProvider(provider) {
    const services = getProviderServiceList(provider);
    const provinceSlug = provider.provinceSlug || slugify(provider.province || 'harare');
    const specialty = provider.specialty || services[0]?.service || 'Specialist';
    const primaryCategory = provider.primaryCategory || services[0]?.category || getCategoryConfig('').label;
    const city = provider.city || provider.address || provider.province || '';
    return {
      ...provider,
      provinceSlug,
      specialty,
      primaryCategory,
      services,
      city,
      averageRating: Number(provider.averageRating || 4.7),
      reviewCount: Number(provider.reviewCount || 0),
      completedJobs: Number(provider.completedJobs || 0),
      bio: provider.bio || 'WorkLinkUp specialist ready to help.',
      title: provider.title || getServiceListLabel(services) || specialty,
      languages: Array.isArray(provider.languages) ? provider.languages : [],
      skills: Array.isArray(provider.skills) ? provider.skills : [],
      workExperience: Array.isArray(provider.workExperience) ? provider.workExperience : [],
      education: Array.isArray(provider.education) ? provider.education : [],
      certifications: Array.isArray(provider.certifications) ? provider.certifications : [],
      portfolioLinks: Array.isArray(provider.portfolioLinks) ? provider.portfolioLinks : [],
      professionalDocuments: Array.isArray(provider.professionalDocuments) ? provider.professionalDocuments : [],
      username: provider.username || '',
      profileImageData: provider.profileImageData || getCategoryConfig(primaryCategory).image,
      bannerImageData: provider.bannerImageData || 'images/sections/findme.avif',
      profileUrl: `${getBase()}pages/provider-profile.html?uid=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provinceSlug)}`,
      messageUrl: `${getBase()}pages/messages.html?provider=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provinceSlug)}`
    };
  }

  function createCircleCardsMarkup(base, isLoop = false) {
    const cards = SPECIALIST_CATEGORIES.map((category) => `
      <a href="${buildSearchResultsHref(category.label, { base, category: category.label })}" class="category-circle specialist-category-chip" data-category-chip="${category.label}">
        <div class="category-circle-img">
          ${category.image
            ? `<img src="${escapeHtml(resolveMediaSrc(category.image))}" alt="${escapeHtml(category.label)}" loading="lazy" decoding="async" />`
            : `<span class="category-circle-icon" aria-hidden="true"><i class="${escapeHtml(category.icon || 'fa-solid fa-briefcase')}"></i></span>`}
        </div>
        <span>${escapeHtml(category.shortLabel || category.label)}</span>
      </a>
    `).join('');

    return isLoop ? `${cards}${cards}` : cards;
  }

  function buildCategoryDirectoryMarkup(base, categories = []) {
    return categories.map((category) => {
      const services = Array.isArray(category.subservices) ? category.subservices : [];
      return `
        <a href="${typeof buildWorkLinkUpSpecialistsHref === 'function'
          ? buildWorkLinkUpSpecialistsHref(category.label, { base, category: category.label, query: category.label })
          : buildSearchResultsHref(category.label, { base, category: category.label })}" class="category-circle categories-directory-circle">
          <div class="category-circle-img">
            ${category.image
              ? `<img src="${escapeHtml(resolveMediaSrc(category.image))}" alt="${escapeHtml(category.label)}" loading="lazy" decoding="async" />`
              : `<span class="category-circle-icon" aria-hidden="true"><i class="${escapeHtml(category.icon || 'fa-solid fa-briefcase')}"></i></span>`}
          </div>
          <span>${escapeHtml(category.shortLabel || category.label)}</span>
          <small>${services.length} service${services.length === 1 ? '' : 's'}</small>
        </a>
      `;
    }).join('');
  }

  function getCategoryBySubservice(serviceLabel = '') {
    const normalized = String(serviceLabel || '').trim().toLowerCase();
    if (!normalized) return SPECIALIST_CATEGORIES[0];
    return SPECIALIST_CATEGORIES.find((category) => category.subservices.some((service) => service.toLowerCase() === normalized))
      || SPECIALIST_CATEGORIES.find((category) => category.label.toLowerCase() === normalized)
      || SPECIALIST_CATEGORIES[0];
  }

  async function getProviders() {
    const authHelper = await waitForAuthHelper();
    if (!authHelper || typeof authHelper.listProviders !== 'function') return [];
    try {
      const remoteProviders = await authHelper.listProviders();
      return remoteProviders.map(normalizeProvider);
    } catch (error) {
      return [];
    }
  }

  async function getProviderByIdentity(uid, provinceSlug) {
    const authHelper = await waitForAuthHelper();
    if (authHelper && typeof authHelper.getProviderProfileByUid === 'function') {
      try {
        const remoteProvider = await authHelper.getProviderProfileByUid(uid, provinceSlug);
        if (remoteProvider) return normalizeProvider(remoteProvider);
      } catch (error) {
        // Fall back to samples below.
      }
    }

    return null;
  }

  function normalizeMessageContact(contact = {}) {
    const uid = String(contact.uid || '').trim();
    const province = String(contact.province || contact.providerProvince || '').trim();
    const city = String(contact.city || contact.address || '').trim();
    const primaryCategory = String(contact.primaryCategory || '').trim();
    const specialty = String(contact.specialty || '').trim();
    const isProvider = Boolean(
      contact.providerProfileComplete
      || specialty
      || primaryCategory
      || contact.providerPublicId
      || contact.whatsappNumber
    );
    const provinceSlug = String(
      contact.provinceSlug
      || contact.providerProvinceSlug
      || slugify(province || city || '')
    ).trim();
    const displayName = String(
      contact.displayName
      || contact.name
      || contact.providerPublicId
      || 'WorkLinkUp user'
    ).trim() || 'WorkLinkUp user';

    return {
      uid,
      displayName,
      name: displayName,
      provinceSlug,
      province,
      city,
      primaryCategory,
      specialty,
      bio: String(contact.bio || '').trim(),
      isProvider,
      roleLabel: specialty || primaryCategory || (isProvider ? 'Provider' : 'Member'),
      statusLabel: city || province
        ? [city, province].filter(Boolean).join(', ')
        : (isProvider ? 'Provider on WorkLinkUp' : 'WorkLinkUp member'),
      profileImageData: String(
        contact.profileImageData
        || (isProvider ? getCategoryConfig(primaryCategory).image : '')
      ).trim(),
      providerPublicId: String(contact.providerPublicId || '').trim()
    };
  }

  async function getPostsForProvider(uid, provinceSlug) {
    const authHelper = await waitForAuthHelper();
    if (authHelper && typeof authHelper.listProviderPosts === 'function') {
      try {
        const remotePosts = await authHelper.listProviderPosts(uid, provinceSlug);
        if (remotePosts.length) return remotePosts;
      } catch (error) {
        // Fall back to sample posts below.
      }
    }

    return [];
  }

  function buildServiceFilterMarkup(selectedCategory, selectedSubservice) {
    return SPECIALIST_CATEGORIES.map((category) => {
      const isOpen = selectedCategory === category.label || category.subservices.includes(selectedSubservice);
      return `
      <div class="service-filter-group">
        <button
          type="button"
          class="service-filter-toggle ${selectedCategory === category.label || category.subservices.includes(selectedSubservice) ? 'is-active' : ''}"
          data-filter-group="${escapeHtml(category.label)}"
          aria-expanded="${isOpen ? 'true' : 'false'}"
          title="${escapeHtml(category.label)}"
        >
          <span class="service-filter-toggle-main">
            <i class="${escapeHtml(category.icon)} service-filter-toggle-icon" aria-hidden="true"></i>
            <span class="service-filter-toggle-label">${escapeHtml(category.label)}</span>
          </span>
          <i class="fa-solid fa-chevron-down service-filter-toggle-chevron" aria-hidden="true"></i>
        </button>
        <div class="service-filter-links" ${isOpen ? '' : 'hidden'}>
          <button type="button" class="${selectedCategory === category.label && !selectedSubservice ? 'is-active' : ''}" data-filter-category="${escapeHtml(category.label)}">All ${escapeHtml(category.label)}</button>
          ${category.subservices.map((service) => `
            <button type="button" class="${selectedSubservice === service ? 'is-active' : ''}" data-filter-subservice="${escapeHtml(service)}" data-parent-category="${escapeHtml(category.label)}">
              ${escapeHtml(service)}
            </button>
          `).join('')}
        </div>
      </div>
    `;
    }).join('');
  }

  function buildProviderSearchText(provider = {}) {
    const languages = Array.isArray(provider.languages) ? provider.languages.map((entry) => entry?.name || '').join(' ') : '';
    const skills = Array.isArray(provider.skills) ? provider.skills.map((entry) => entry?.name || '').join(' ') : '';
    const services = getProviderServiceList(provider).flatMap((item) => [item.service, item.category]).join(' ');
    return [
      provider.displayName,
      provider.username,
      provider.title,
      provider.primaryCategory,
      provider.specialty,
      services,
      provider.city,
      provider.province,
      provider.address,
      provider.bio,
      languages,
      skills
    ].join(' ').toLowerCase();
  }

  function scoreProviderMatch(provider, queryText = '') {
    const query = String(queryText || '').trim().toLowerCase();
    if (!query) return 0;

    const name = String(provider.displayName || '').toLowerCase();
    const username = String(provider.username || '').toLowerCase();
    const title = String(provider.title || '').toLowerCase();
    const category = String(provider.primaryCategory || '').toLowerCase();
    const specialty = String(provider.specialty || '').toLowerCase();
    const serviceTerms = getProviderServiceList(provider).flatMap((item) => [
      String(item.service || '').toLowerCase(),
      String(item.category || '').toLowerCase()
    ]);
    const city = String(provider.city || '').toLowerCase();
    const province = String(provider.province || '').toLowerCase();
    const address = String(provider.address || '').toLowerCase();
    const haystack = buildProviderSearchText(provider);

    let score = 0;
    if (name === query || username === query) score += 120;
    if (name.startsWith(query) || username.startsWith(query)) score += 80;
    if (specialty === query || title === query) score += 75;
    if (specialty.startsWith(query) || title.startsWith(query)) score += 52;
    if (category === query) score += 48;
    if (serviceTerms.some((value) => value === query)) score += 78;
    if (serviceTerms.some((value) => value.startsWith(query))) score += 54;
    if (serviceTerms.some((value) => value.includes(query))) score += 34;
    if (city === query || province === query) score += 46;
    if (address.includes(query)) score += 24;
    if (haystack.includes(query)) score += 18;
    return score;
  }

  function sortProvidersForSearch(providers, queryText = '') {
    const query = String(queryText || '').trim();
    return providers.slice().sort((first, second) => {
      const scoreDiff = scoreProviderMatch(second, query) - scoreProviderMatch(first, query);
      if (scoreDiff !== 0) return scoreDiff;
      const ratingDiff = Number(second.averageRating || 0) - Number(first.averageRating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return String(first.displayName || '').localeCompare(String(second.displayName || ''));
    });
  }

  function filterProviders(providers, state) {
    const filtered = providers.filter((provider) => {
      const providerServices = getProviderServiceList(provider);
      const categoryMatch = !state.category || provider.primaryCategory === state.category || providerServices.some((item) => item.category === state.category);
      const subserviceQuery = String(state.subservice || '').toLowerCase();
      const subserviceMatch = !state.subservice || providerServices.some((item) => String(item.service || '').toLowerCase().includes(subserviceQuery));
      const ratingMatch = !state.rating || Number(provider.averageRating || 0) >= state.rating;
      const searchHaystack = buildProviderSearchText(provider);
      const searchMatch = !state.search || searchHaystack.includes(state.search.toLowerCase());
      return categoryMatch && subserviceMatch && ratingMatch && searchMatch;
    });
    return sortProvidersForSearch(filtered, state.search);
  }

  function renderProviderCards(host, providers) {
    if (!host) return;
    if (!providers.length) {
      host.innerHTML = '';
      return;
    }

    host.innerHTML = providers.map((provider) => {
      const serviceLabel = getServiceListLabel(provider) || provider.specialty || provider.primaryCategory || 'Specialist';
      return `
      <article class="specialist-card">
        <div class="specialist-card-banner" style="background-image: linear-gradient(180deg, rgba(12, 24, 48, 0.18) 0%, rgba(12, 24, 48, 0.82) 100%), url('${escapeHtml(resolveMediaSrc(provider.bannerImageData, 'images/sections/findme.avif'))}');">
          <div class="specialist-card-availability">
            <span class="specialist-card-availability-label">Available</span>
            <span class="specialist-card-rating">${Number(provider.averageRating || 0).toFixed(1)} ★</span>
          </div>
          <img class="specialist-card-avatar" src="${escapeHtml(resolveMediaSrc(provider.profileImageData, 'images/logo/logo.jpg'))}" alt="${escapeHtml(provider.displayName)} profile image" />
          <div class="specialist-card-banner-copy">
            <h3>${escapeHtml(provider.displayName)}</h3>
            <p>${escapeHtml(serviceLabel)}</p>
          </div>
        </div>
        <div class="specialist-card-body">
          <div class="specialist-card-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(provider.address || `${provider.city}, ${provider.province}`)}</span>
          </div>
          <div class="specialist-card-facts">
            <div class="specialist-card-fact">
              <i class="fa-solid fa-screwdriver-wrench"></i>
              <span><strong>Services:</strong> ${escapeHtml(serviceLabel)}</span>
            </div>
            <div class="specialist-card-fact">
              <i class="fa-regular fa-clock"></i>
              <span><strong>Experience:</strong> ${escapeHtml(provider.experience || 'Experienced')}</span>
            </div>
          </div>
          <p class="specialist-card-bio">${escapeHtml(provider.bio)}</p>
          <div class="specialist-actions">
            <a href="${escapeHtml(buildWhatsAppLink(provider.whatsappNumber, provider.displayName))}" class="provider-contact-btn whatsapp-btn" target="_blank" rel="noreferrer">
              <i class="fa-brands fa-whatsapp"></i>
              <span class="specialist-action-label specialist-action-label-whatsapp">WhatsApp</span>
            </a>
            <a href="${escapeHtml(provider.profileUrl)}" class="specialists-view-btn">
              <i class="fa-regular fa-id-badge"></i>
              <span>View Profile</span>
            </a>
          </div>
        </div>
      </article>
    `;
    }).join('');
  }

  function buildFindMoreButtonMarkup(label = 'Find More') {
    return `
      <button class="animated-button specialists-find-more-btn" type="button" data-find-more-trigger>
        <svg xmlns="http://www.w3.org/2000/svg" class="arr-2" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
        <span class="text">${escapeHtml(label)}</span>
        <span class="circle"></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="arr-1" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
        </svg>
      </button>
    `;
  }

  function buildSpecialistCardSkeletons(count = 4) {
    return Array.from({ length: count }, () => `
      <article class="specialist-card specialist-card-skeleton-card" aria-hidden="true">
        <div class="specialist-card-banner specialist-card-skeleton-banner">
          <div class="specialist-card-skeleton-pill provider-skeleton-block"></div>
          <div class="specialist-card-skeleton-avatar provider-skeleton-block"></div>
          <div class="specialist-card-banner-copy">
            <span class="specialist-card-skeleton-line is-name provider-skeleton-line"></span>
            <span class="specialist-card-skeleton-line is-role provider-skeleton-line"></span>
          </div>
        </div>
        <div class="specialist-card-body">
          <div class="specialist-card-skeleton-inline provider-skeleton-line"></div>
          <div class="specialist-card-skeleton-stack">
            <span class="specialist-card-skeleton-line provider-skeleton-line"></span>
            <span class="specialist-card-skeleton-line short provider-skeleton-line"></span>
          </div>
          <div class="specialist-card-skeleton-stack">
            <span class="specialist-card-skeleton-line provider-skeleton-line"></span>
            <span class="specialist-card-skeleton-line short provider-skeleton-line"></span>
          </div>
          <div class="specialist-card-skeleton-copy">
            <span class="specialist-card-skeleton-line provider-skeleton-line"></span>
            <span class="specialist-card-skeleton-line provider-skeleton-line"></span>
            <span class="specialist-card-skeleton-line short provider-skeleton-line"></span>
          </div>
          <div class="specialist-card-skeleton-actions">
            <span class="specialist-card-skeleton-button provider-skeleton-block"></span>
            <span class="specialist-card-skeleton-button provider-skeleton-block"></span>
          </div>
        </div>
      </article>
    `).join('');
  }

  function buildProviderInviteLink(serviceText = '') {
    const target = new URL(`${getBase()}pages/account.html`, window.location.origin);
    target.searchParams.set('setup', '1');
    if (serviceText) target.searchParams.set('service', serviceText);
    return `${target.pathname}${target.search}`;
  }

  function buildEmptyStateMarkup(serviceText = '') {
    const label = serviceText || 'this service';
    const inviteLink = buildProviderInviteLink(label);
    const shareText = `I searched for ${label} on WorkLinkUp and there are no specialists listed yet. If you know someone who offers this service, invite them to join: ${window.location.origin}${inviteLink}`;
    return `
      <div class="specialists-empty specialists-empty-rich">
        <div class="specialists-empty-icon"><i class="fa-regular fa-compass"></i></div>
        <h3>No specialists yet for ${escapeHtml(label)}</h3>
        <p>We could not find a provider for this search yet. Share WorkLinkUp with someone who offers ${escapeHtml(label)} so they can list themselves and start getting discovered here.</p>
        <div class="specialists-empty-actions">
          <a href="${escapeHtml(inviteLink)}" class="provider-profile-action">List this service</a>
          <button type="button" class="provider-profile-action secondary" data-empty-share="${escapeHtml(shareText)}">
            <i class="fa-solid fa-share-nodes"></i>
            <span>Share with a provider</span>
          </button>
        </div>
      </div>
    `;
  }

  function buildSuggestedProvidersMarkup(items = [], duplicate = false) {
    const cards = items.map((provider) => `
      <article class="specialists-suggested-card">
        <a href="${escapeHtml(provider.profileUrl)}" class="specialists-suggested-card-link">
          <img src="${escapeHtml(resolveMediaSrc(provider.profileImageData, 'images/logo/logo.jpg'))}" alt="${escapeHtml(provider.displayName)}" class="specialists-suggested-avatar" />
          <strong>${escapeHtml(provider.displayName)}</strong>
          <span class="specialists-suggested-meta">${escapeHtml(getServiceListLabel(provider, 2) || provider.specialty || provider.title || provider.primaryCategory || 'Specialist')}</span>
          <span class="specialists-suggested-place">${escapeHtml(provider.city || provider.address || provider.province || 'Available on WorkLinkUp')}</span>
        </a>
        <a href="${escapeHtml(provider.profileUrl)}" class="specialists-suggested-action">View</a>
      </article>
    `).join('');

    return duplicate ? `${cards}${cards}` : cards;
  }

  function getSuggestedProviders(allProviders = [], filteredProviders = [], state = {}) {
    const activeCategory = state.category || getCategoryBySubservice(state.subservice).label;
    const activeQuery = state.search || state.subservice || '';
    const prioritized = [
      ...sortProvidersForSearch(filteredProviders, activeQuery),
      ...sortProvidersForSearch(
        allProviders.filter((provider) => {
          if (filteredProviders.some((item) => item.uid === provider.uid)) return false;
          if (activeCategory && (provider.primaryCategory === activeCategory || getProviderServiceList(provider).some((item) => item.category === activeCategory))) return true;
          return activeQuery ? scoreProviderMatch(provider, activeQuery) > 0 : true;
        }),
        activeQuery
      )
    ];

    return prioritized
      .filter((provider, index, list) => provider?.uid && list.findIndex((item) => item.uid === provider.uid) === index)
      .slice(0, 10);
  }

  function buildSearchSuggestionLabel(provider = {}) {
    const city = provider.city || provider.province || '';
    const service = getServiceListLabel(provider, 2) || provider.specialty || provider.title || provider.primaryCategory || 'Specialist';
    return [provider.displayName, service, city].filter(Boolean).join(' • ');
  }

  function buildSearchResultQuery(provider = {}) {
    const preferred = String(getProviderServiceList(provider)[0]?.service || provider.specialty || provider.title || provider.primaryCategory || '').trim();
    if (preferred) return preferred;
    return String(provider.displayName || '').trim();
  }

  function buildRelatedServicesMarkup(items = [], duplicate = false) {
    const cards = items.map((item) => `
      <a href="${buildSearchResultsHref(item.label, { service: item.label })}" class="specialists-related-card">
        <strong>${escapeHtml(item.label)}</strong>
        <span>${escapeHtml(item.address)}</span>
      </a>
    `).join('');

    return duplicate ? `${cards}${cards}` : cards;
  }

  function buildSuggestedCategoriesMarkup(items = [], duplicate = false) {
    const cards = items.map((category) => {
      const href = buildSearchResultsHref(category.label, { category: category.label });
      const summary = (category.subservices || []).slice(0, 2).join(' • ') || `${(category.subservices || []).length} services`;
      const imageSrc = resolveMediaSrc(category.image || 'images/logo/logo.jpg');

      return `
        <article class="specialists-suggested-card specialists-suggested-category-card">
          <a href="${escapeHtml(href)}" class="specialists-suggested-card-link">
            <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(category.label)}" class="specialists-suggested-avatar" loading="lazy" decoding="async" />
            <strong>${escapeHtml(category.shortLabel || category.label)}</strong>
            <span class="specialists-suggested-meta">${escapeHtml(summary)}</span>
          </a>
          <a href="${escapeHtml(href)}" class="specialists-suggested-action">Explore</a>
        </article>
      `;
    }).join('');

    return duplicate ? `${cards}${cards}` : cards;
  }

  async function readImageAsBase64(file, options = {}) {
    if (!file) return '';
    const {
      maxWidth = 1280,
      maxHeight = 1280,
      quality = 0.82,
      outputType = 'image/jpeg'
    } = options;

    const sourceDataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read that image.'));
      reader.readAsDataURL(file);
    });

    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error('Could not process that image.'));
      nextImage.src = sourceDataUrl;
    });

    const widthRatio = maxWidth / image.width;
    const heightRatio = maxHeight / image.height;
    const ratio = Math.min(1, widthRatio, heightRatio);
    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) return sourceDataUrl;
    context.drawImage(image, 0, 0, targetWidth, targetHeight);
    const encoded = canvas.toDataURL(outputType, quality);
    if (outputType === 'image/avif' && !String(encoded || '').startsWith('data:image/avif')) {
      return canvas.toDataURL('image/webp', quality);
    }
    return encoded;
  }

  async function readFileAsDataUrl(file) {
    if (!file) return '';
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Could not read that file.'));
      reader.readAsDataURL(file);
    });
  }

  function ensureOnboardingModal(base) {
    if (document.getElementById('provider-onboarding-overlay')) return;

    document.body.insertAdjacentHTML('beforeend', `
      <div class="provider-onboarding-overlay" id="provider-onboarding-overlay" hidden>
        <div class="provider-onboarding-modal">
          <a href="${base}pages/help.html" class="provider-onboarding-help" aria-label="Help">
            <i class="fa-regular fa-circle-question"></i>
          </a>
          <button type="button" class="provider-onboarding-close" aria-label="Close onboarding">×</button>
          <div class="provider-onboarding-head">
            <h2>Complete your provider profile</h2>
            <p>Add the basics first, then your service details, then the images clients will recognize.</p>
            <div class="provider-onboarding-progressbar">
              <span data-onboarding-progress-fill></span>
            </div>
            <div class="provider-onboarding-progress-meta">
              <strong data-onboarding-progress-label>Step 1 of 4</strong>
              <div class="provider-onboarding-progress-dots">
                <span class="is-active" data-onboarding-dot="0"></span>
                <span data-onboarding-dot="1"></span>
                <span data-onboarding-dot="2"></span>
                <span data-onboarding-dot="3"></span>
              </div>
            </div>
          </div>
          <form class="provider-onboarding-form" id="provider-onboarding-form">
            <div class="provider-onboarding-steps">
              <section class="provider-onboarding-step is-active" data-onboarding-step="0">
                <span class="provider-onboarding-step-tag">Step 1</span>
                <h3>Basic details</h3>
                <p>These are the first things people use to identify and contact you.</p>
                <div class="provider-onboarding-grid">
                  <div class="provider-onboarding-row">
                    <label for="provider-full-name">Full name</label>
                    <input id="provider-full-name" name="fullName" type="text" placeholder="Tinashe Moyo" required />
                  </div>
                  <div class="provider-onboarding-row">
                    <label for="provider-whatsapp">WhatsApp number</label>
                    <input id="provider-whatsapp" name="whatsappNumber" type="tel" placeholder="+263 77 123 4567" required />
                  </div>
                  <div class="provider-onboarding-row">
                    <label for="provider-province">Province</label>
                    <select id="provider-province" name="province" required>
                      ${ZIMBABWE_PROVINCES.map((province) => `<option value="${province}">${province}</option>`).join('')}
                    </select>
                  </div>
                </div>
              </section>
              <section class="provider-onboarding-step" data-onboarding-step="1">
                <span class="provider-onboarding-step-tag">Step 2</span>
                <h3>Where you work</h3>
                <p>Keep the location simple so clients know the area you cover.</p>
                <div class="provider-onboarding-grid">
                  <div class="provider-onboarding-row">
                    <label for="provider-city">City / suburb</label>
                    <input id="provider-city" name="city" type="text" placeholder="Avondale, Harare" required />
                  </div>
                  <div class="provider-onboarding-row provider-onboarding-row-span">
                    <label for="provider-address">Address or service area</label>
                    <input id="provider-address" name="address" type="text" placeholder="Serves Harare north and CBD" required />
                  </div>
                  <div class="provider-onboarding-row">
                    <label for="provider-experience">Experience</label>
                    <input id="provider-experience" name="experience" type="text" placeholder="4 years" required />
                  </div>
                </div>
              </section>
              <section class="provider-onboarding-step" data-onboarding-step="2">
                <span class="provider-onboarding-step-tag">Step 3</span>
                <h3>What you do</h3>
                <p>Choose the category people should find you under and describe your specialty clearly.</p>
                <div class="provider-onboarding-grid">
                  <div class="provider-onboarding-row">
                    <label for="provider-category">Main category</label>
                    <select id="provider-category" name="primaryCategory" required>
                      ${SPECIALIST_CATEGORIES.map((category) => `<option value="${category.label}">${category.label}</option>`).join('')}
                    </select>
                  </div>
                  <div class="provider-onboarding-row">
                    <label for="provider-specialty">Specialty</label>
                    <select id="provider-specialty" name="specialty" data-onboarding-specialty required>
                      ${buildSubserviceOptionsMarkup(SPECIALIST_CATEGORIES[0]?.label || '', '', 'Choose a service')}
                    </select>
                  </div>
                  <div class="provider-onboarding-row provider-onboarding-row-span">
                    <label for="provider-bio">Short bio</label>
                    <textarea id="provider-bio" name="bio" placeholder="What kind of work do you do best?" required></textarea>
                  </div>
                </div>
              </section>
              <section class="provider-onboarding-step" data-onboarding-step="3">
                <span class="provider-onboarding-step-tag">Step 4</span>
                <h3>Your images</h3>
                <p>Add a clear profile photo and a banner image. They will be stored in base64 and rendered from your provider profile.</p>
                <div class="provider-onboarding-media-grid">
                  <label class="provider-onboarding-upload-card">
                    <span class="provider-onboarding-upload-preview provider-onboarding-upload-preview-avatar" data-profile-image-preview></span>
                    <strong>Profile image</strong>
                    <span>Square image for your avatar</span>
                    <input type="file" id="provider-profile-image" accept="image/*" />
                  </label>
                  <label class="provider-onboarding-upload-card">
                    <span class="provider-onboarding-upload-preview provider-onboarding-upload-preview-banner" data-banner-image-preview></span>
                    <strong>Banner image</strong>
                    <span>Wide image for your profile and specialist card</span>
                    <input type="file" id="provider-banner-image" accept="image/*" />
                  </label>
                </div>
              </section>
            </div>
            <div class="provider-onboarding-footer">
              <div class="provider-onboarding-note">You can update this later from your account.</div>
              <div class="provider-onboarding-actions">
                <button type="button" class="provider-onboarding-back" hidden>Back</button>
                <button type="button" class="provider-onboarding-next">Next</button>
                <button type="submit" class="provider-onboarding-submit" hidden><span>Save Profile</span></button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `);
  }

  function updateUploadPreview(target, imageData, mode) {
    if (!target) return;
    const src = resolveMediaSrc(imageData, mode === 'avatar' ? 'images/logo/logo.jpg' : 'images/sections/findme.avif');
    target.innerHTML = `<img src="${escapeHtml(src)}" alt="" />`;
  }

  async function setupOnboarding() {
    const base = getBase();
    ensureOnboardingModal(base);

    const overlay = document.getElementById('provider-onboarding-overlay');
    const form = document.getElementById('provider-onboarding-form');
    if (!overlay || !form) return;

    const closeBtn = overlay.querySelector('.provider-onboarding-close');
    const nextBtn = overlay.querySelector('.provider-onboarding-next');
    const backBtn = overlay.querySelector('.provider-onboarding-back');
    const submitBtn = overlay.querySelector('.provider-onboarding-submit');
    const steps = Array.from(overlay.querySelectorAll('.provider-onboarding-step'));
    const dots = Array.from(overlay.querySelectorAll('[data-onboarding-dot]'));
    const progressFill = overlay.querySelector('[data-onboarding-progress-fill]');
    const progressLabel = overlay.querySelector('[data-onboarding-progress-label]');
    const profilePreview = overlay.querySelector('[data-profile-image-preview]');
    const bannerPreview = overlay.querySelector('[data-banner-image-preview]');
    const profileInput = overlay.querySelector('#provider-profile-image');
    const bannerInput = overlay.querySelector('#provider-banner-image');
    const uploadState = {
      profileImageData: '',
      bannerImageData: ''
    };
    let activeStep = 0;

    function getField(name) {
      return form.elements.namedItem(name);
    }

    function syncSteps() {
      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === activeStep);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index <= activeStep);
      });

      const progressPercent = ((activeStep + 1) / steps.length) * 100;
      if (progressFill instanceof HTMLElement) progressFill.style.width = `${progressPercent}%`;
      if (progressLabel instanceof HTMLElement) progressLabel.textContent = `Step ${activeStep + 1} of ${steps.length}`;
      if (backBtn instanceof HTMLElement) backBtn.hidden = activeStep === 0;
      if (nextBtn instanceof HTMLElement) nextBtn.hidden = activeStep === steps.length - 1;
      if (submitBtn instanceof HTMLElement) submitBtn.hidden = activeStep !== steps.length - 1;
    }

    function validateActiveStep() {
      const currentStep = steps[activeStep];
      if (!(currentStep instanceof HTMLElement)) return true;
      const fields = Array.from(currentStep.querySelectorAll('input[required], select[required], textarea[required]'));
      for (const field of fields) {
        if (field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement) {
          if (!field.reportValidity()) return false;
        }
      }
      return true;
    }

    function resetFileInputs() {
      if (profileInput instanceof HTMLInputElement) profileInput.value = '';
      if (bannerInput instanceof HTMLInputElement) bannerInput.value = '';
    }

    function openOnboarding(prefill = {}) {
      const fullNameField = getField('fullName');
      const whatsappField = getField('whatsappNumber');
      const provinceField = getField('province');
      const cityField = getField('city');
      const addressField = getField('address');
      const experienceField = getField('experience');
      const categoryField = getField('primaryCategory');
      const specialtyField = getField('specialty');
      const bioField = getField('bio');

      if (fullNameField) fullNameField.value = prefill.displayName || prefill.name || '';
      if (whatsappField) whatsappField.value = prefill.whatsappNumber || prefill.phone || '';
      if (provinceField) provinceField.value = prefill.province || prefill.providerProvince || 'Harare';
      if (cityField) cityField.value = prefill.city || '';
      if (addressField) addressField.value = prefill.address || '';
      if (experienceField) experienceField.value = prefill.experience || '';
      if (categoryField) categoryField.value = prefill.primaryCategory || SPECIALIST_CATEGORIES[0].label;
      if (categoryField instanceof HTMLSelectElement && specialtyField instanceof HTMLSelectElement) {
        specialtyField.innerHTML = buildSubserviceOptionsMarkup(categoryField.value, prefill.specialty || '', 'Choose a service');
      } else if (specialtyField) {
        specialtyField.value = prefill.specialty || '';
      }
      if (bioField) bioField.value = prefill.bio || '';
      uploadState.profileImageData = String(prefill.profileImageData || '').trim();
      uploadState.bannerImageData = String(prefill.bannerImageData || '').trim();
      updateUploadPreview(profilePreview, uploadState.profileImageData, 'avatar');
      updateUploadPreview(bannerPreview, uploadState.bannerImageData, 'banner');
      resetFileInputs();
      activeStep = 0;
      syncSteps();
      overlay.hidden = false;
      document.body.classList.add('provider-onboarding-open');
    }

    function closeOnboarding() {
      overlay.hidden = true;
      document.body.classList.remove('provider-onboarding-open');
    }

    closeBtn?.addEventListener('click', closeOnboarding);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeOnboarding();
    });

    nextBtn?.addEventListener('click', () => {
      if (!validateActiveStep()) return;
      activeStep = Math.min(activeStep + 1, steps.length - 1);
      syncSteps();
    });

    backBtn?.addEventListener('click', () => {
      activeStep = Math.max(activeStep - 1, 0);
      syncSteps();
    });

    form.querySelector('select[name="primaryCategory"]')?.addEventListener('change', (event) => {
      const categoryField = event.currentTarget;
      const specialtyField = form.querySelector('[data-onboarding-specialty]');
      if (!(categoryField instanceof HTMLSelectElement) || !(specialtyField instanceof HTMLSelectElement)) return;
      specialtyField.innerHTML = buildSubserviceOptionsMarkup(categoryField.value, '', 'Choose a service');
    });

    profileInput?.addEventListener('change', async () => {
      const file = profileInput.files?.[0];
      if (!file) return;
      try {
        uploadState.profileImageData = await readImageAsBase64(file, {
          maxWidth: 720,
          maxHeight: 720,
          quality: 0.84
        });
        updateUploadPreview(profilePreview, uploadState.profileImageData, 'avatar');
      } catch (error) {
        window.alert(error.message || 'Could not process that profile image.');
      }
    });

    bannerInput?.addEventListener('change', async () => {
      const file = bannerInput.files?.[0];
      if (!file) return;
      try {
        uploadState.bannerImageData = await readImageAsBase64(file, {
          maxWidth: 1600,
          maxHeight: 900,
          quality: 0.82
        });
        updateUploadPreview(bannerPreview, uploadState.bannerImageData, 'banner');
      } catch (error) {
        window.alert(error.message || 'Could not process that banner image.');
      }
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!validateActiveStep()) return;
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.saveProviderProfile !== 'function') return;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      // attach images only if available (make images optional)
      if (uploadState.profileImageData) payload.profileImageData = uploadState.profileImageData;
      if (uploadState.bannerImageData) payload.bannerImageData = uploadState.bannerImageData;

      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }
      try {
        const saved = await authHelper.saveProviderProfile(payload);
        // show success message, close onboarding, then redirect to provider profile
        showSuccessToast('Profile completed — redirecting…', 1000);
        closeOnboarding();
        const base = getBase();
        const redirectUrl = saved && saved.uid ? `${base}pages/provider-profile.html?uid=${encodeURIComponent(saved.uid)}&province=${encodeURIComponent(saved.provinceSlug || '')}` : `${base}pages/provider-profile.html`;
        window.setTimeout(() => window.location.href = redirectUrl, 1000);
      } catch (error) {
        window.alert(error.message || 'Could not save your provider profile.');
      } finally {
        if (submitBtn instanceof HTMLButtonElement) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('is-loading');
        }
      }
    });

    async function maybePromptOnboarding() {
      return;
    }

    syncSteps();
    window.addEventListener('softgiggles-auth-changed', maybePromptOnboarding);
    window.addEventListener('worklinkup:prompt-onboarding', maybePromptOnboarding);
    maybePromptOnboarding();
  }

  async function renderSpecialistsPage() {
    const page = document.querySelector('[data-specialists-page]');
    if (!page) return;

    const base = getBase();
    const params = new URLSearchParams(window.location.search);
    const categoriesHost = page.querySelector('[data-specialist-categories]');
    const sidebarHost = page.querySelector('[data-specialist-sidebar]');
    const sidebarLayout = page.querySelector('[data-specialists-layout]');
    const mainColumn = page.querySelector('.specialists-main');
    const sidebarToggle = page.querySelector('[data-specialists-sidebar-toggle]');
    const mobileSheet = document.querySelector('[data-specialists-sheet]');
    const mobileSheetBody = document.querySelector('[data-specialists-sheet-body]');
    const mobileRatingSheet = document.querySelector('[data-specialists-rating-sheet]');
    const mobileRatingOptions = Array.from(document.querySelectorAll('[data-specialists-rating-sheet] [data-rating-filter]'));
    const resultsHost = page.querySelector('[data-specialists-results]');
    const totalHost = page.querySelector('[data-specialists-total]');
    const resultsTitleHost = page.querySelector('[data-specialists-results-title]');
    const resultsActionsHost = page.querySelector('[data-specialists-results-actions]');
    const relatedShell = page.querySelector('[data-specialists-related-shell]');
    const relatedHost = page.querySelector('[data-specialists-related]');
    const relatedKickerHost = page.querySelector('.specialists-related-kicker');
    const relatedTitleHost = page.querySelector('.specialists-related-head h3');
    const suggestedAllBtn = page.querySelector('[data-specialists-suggested-all]');
    const searchInput = page.querySelector('[data-specialists-search]');
    const searchIcon = searchInput?.closest('.search-bar')?.querySelector('.search-icon');
    const ratingButtons = Array.from(page.querySelectorAll('[data-rating-filter]'));
    const filterBtn = page.querySelector('[data-open-specialists-sheet]');
    const ratingSheetBtn = page.querySelector('[data-open-specialists-rating-sheet]');
    const sheetCloseBtn = page.querySelector('[data-close-specialists-sheet]');
    const ratingSheetCloseBtn = page.querySelector('[data-close-specialists-rating-sheet]');
    const currentCategory = params.get('category') || '';
    const searchQueryParam = params.get('query') || '';
    const initialSubservice = params.get('service') || '';
    const initialResultsMode = params.get('results') === '1';
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const providers = [];
    let renderRequestId = 0;
    let sidebarUserToggled = false;
    let sidebarCollapsed = Boolean(initialResultsMode || searchQueryParam || initialSubservice);
    const state = {
      category: currentCategory,
      subservice: initialSubservice,
      rating: 0,
      search: searchQueryParam,
      resultsMode: initialResultsMode || Boolean(searchQueryParam || initialSubservice)
    };

    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = searchQueryParam;
    }

    function isResultsMode() {
      return Boolean(state.resultsMode || state.search || state.subservice);
    }

    function getActiveSearchLabel() {
      return state.search || state.subservice || state.category || 'specialists';
    }

    function syncUrl() {
      const nextUrl = new URL(window.location.href);
      if (state.category) nextUrl.searchParams.set('category', state.category);
      else nextUrl.searchParams.delete('category');
      if (state.search) {
        nextUrl.searchParams.set('query', state.search);
        nextUrl.searchParams.set('results', '1');
      } else {
        nextUrl.searchParams.delete('query');
        if (!state.subservice && !state.resultsMode) nextUrl.searchParams.delete('results');
      }
      if (state.subservice) nextUrl.searchParams.set('service', state.subservice);
      else nextUrl.searchParams.delete('service');
      if (state.resultsMode) nextUrl.searchParams.set('results', '1');
      window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
    }

    function renderCategoryRail() {
      if (!categoriesHost) return;
      categoriesHost.innerHTML = createCircleCardsMarkup(base, true);
      categoriesHost.querySelectorAll('[data-category-chip]').forEach((chip) => {
        chip.classList.toggle('is-active', chip.getAttribute('data-category-chip') === state.category);
      });
      if (typeof window.initScrollableRails === 'function') window.initScrollableRails(page);
    }

    function renderFilters() {
      const markup = buildServiceFilterMarkup(state.category, state.subservice);
      if (sidebarHost) sidebarHost.innerHTML = markup;
      if (mobileSheetBody) mobileSheetBody.innerHTML = markup;
    }

    function syncSidebarToggleControl() {
      if (!(sidebarToggle instanceof HTMLElement)) return;
      sidebarToggle.setAttribute('aria-label', sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      sidebarToggle.innerHTML = `<i class="fa-solid ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}"></i>`;
    }

    function bindFilterInteractions(scope) {
      if (!scope) return;

      scope.querySelectorAll('[data-filter-group]').forEach((button) => {
        button.addEventListener('click', () => {
          const links = button.nextElementSibling;
          const isOpen = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', String(!isOpen));
          if (links) links.hidden = isOpen;
        });
      });

      scope.querySelectorAll('[data-filter-category]').forEach((button) => {
        button.addEventListener('click', () => {
          const category = button.getAttribute('data-filter-category') || '';
          goToSearchResults(category, { category, rating: state.rating });
        });
      });

      scope.querySelectorAll('[data-filter-subservice]').forEach((button) => {
        button.addEventListener('click', () => {
          const category = button.getAttribute('data-parent-category') || state.category;
          const service = button.getAttribute('data-filter-subservice') || '';
          goToSearchResults(service, { category, service, rating: state.rating });
        });
      });
    }

    function goToCurrentSearchResults(overrides = {}) {
      const category = typeof overrides.category === 'string' ? overrides.category : state.category;
      const service = typeof overrides.service === 'string' ? overrides.service : state.subservice;
      const rating = Object.prototype.hasOwnProperty.call(overrides, 'rating') ? Number(overrides.rating || 0) : state.rating;
      const query = typeof overrides.query === 'string'
        ? overrides.query
        : state.search || service || category;
      if (!query && !category && !service && !rating) return;
      goToSearchResults(query, { category, service, rating });
    }

    function renderRelatedServices(filteredProviders) {
      if (!(relatedShell instanceof HTMLElement) || !(relatedHost instanceof HTMLElement)) return;

      if (!filteredProviders.length) {
        const suggestedProviders = getSuggestedProviders(providers, [], state);
        if (!suggestedProviders.length) {
          relatedShell.hidden = true;
          relatedHost.innerHTML = '';
          return;
        }

        relatedShell.hidden = false;
        if (relatedKickerHost instanceof HTMLElement) relatedKickerHost.textContent = 'Suggested profiles';
        if (relatedTitleHost instanceof HTMLElement) relatedTitleHost.textContent = 'Try another specialist';
        relatedHost.innerHTML = buildSuggestedProvidersMarkup(suggestedProviders, suggestedProviders.length > 4);
        if (typeof window.initScrollableRails === 'function') window.initScrollableRails(page);
        return;
      }

      const suggestedProviders = getSuggestedProviders(providers, filteredProviders, state);
      if (!suggestedProviders.length) {
        relatedShell.hidden = true;
        relatedHost.innerHTML = '';
        return;
      }

      relatedShell.hidden = false;
      if (relatedKickerHost instanceof HTMLElement) relatedKickerHost.textContent = 'Suggested for you';
      if (relatedTitleHost instanceof HTMLElement) relatedTitleHost.textContent = 'More specialists you can explore';
      relatedHost.innerHTML = buildSuggestedProvidersMarkup(suggestedProviders, suggestedProviders.length > 4);
      if (typeof window.initScrollableRails === 'function') window.initScrollableRails(page);
    }

    function renderResultsActions() {
      if (!resultsActionsHost) return;
      resultsActionsHost.innerHTML = '';
    }

    function applyUiMode(filteredCount = 0) {
      const focused = isResultsMode();
      page.classList.toggle('is-results-mode', focused);
      if (sidebarLayout instanceof HTMLElement) {
        if (!sidebarUserToggled) {
          sidebarCollapsed = focused;
        }
        sidebarLayout.classList.toggle('is-sidebar-collapsed', sidebarCollapsed);
      }
      syncSidebarToggleControl();
      if (resultsTitleHost instanceof HTMLElement) {
        resultsTitleHost.textContent = focused
          ? `Results for "${getActiveSearchLabel()}"`
          : 'Available Specialists';
      }
      if (totalHost) {
        totalHost.textContent = focused
          ? `${filteredCount} result${filteredCount === 1 ? '' : 's'}`
          : `${filteredCount} specialist${filteredCount === 1 ? '' : 's'}`;
      }
      renderResultsActions();
    }

    async function update({ showSkeleton = false } = {}) {
      syncUrl();
      const filtered = filterProviders(providers, state);
      renderFilters();
      bindFilterInteractions(sidebarHost);
      bindFilterInteractions(mobileSheetBody);
      applyUiMode(filtered.length);
      renderRelatedServices(filtered);

      const requestId = ++renderRequestId;
      if (showSkeleton && resultsHost) {
        resultsHost.innerHTML = buildSpecialistCardSkeletons(Math.max(4, Math.min(filtered.length || 4, 6)));
      }

      await new Promise((resolve) => window.setTimeout(resolve, showSkeleton ? 520 : 0));
      if (requestId !== renderRequestId) return;

      if (!filtered.length) {
        if (resultsHost) resultsHost.innerHTML = buildEmptyStateMarkup(getActiveSearchLabel());
      } else {
        renderProviderCards(resultsHost, filtered);
      }

      resultsHost?.querySelector('[data-empty-share]')?.addEventListener('click', async (event) => {
        const shareText = event.currentTarget.getAttribute('data-empty-share') || '';
        const shareUrl = `${window.location.origin}${buildProviderInviteLink(getActiveSearchLabel())}`;
        if (navigator.share) {
          try {
            await navigator.share({
              title: `Looking for ${getActiveSearchLabel()} on WorkLinkUp`,
              text: shareText,
              url: shareUrl
            });
            return;
          } catch (error) {
            // Fall back to WhatsApp link below.
          }
        }
        window.open(buildWhatsAppShareLink(shareText), '_blank', 'noopener,noreferrer');
      });

      page.querySelectorAll('[data-category-chip]').forEach((chip) => {
        chip.classList.toggle('is-active', chip.getAttribute('data-category-chip') === state.category);
      });

      ratingButtons.forEach((button) => {
        button.classList.toggle('is-active', Number(button.getAttribute('data-rating-filter') || 0) === state.rating);
      });
      mobileRatingOptions.forEach((button) => {
        button.classList.toggle('is-active', Number(button.getAttribute('data-rating-filter') || 0) === state.rating);
      });
    }

    renderCategoryRail();
    renderFilters();
    bindFilterInteractions(sidebarHost);
    bindFilterInteractions(mobileSheetBody);
    applyUiMode(0);

    categoriesHost?.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-category-chip]');
      if (!(chip instanceof HTMLElement)) return;
      event.preventDefault();
      const category = chip.getAttribute('data-category-chip') || '';
      goToCurrentSearchResults({ query: category, category, service: '' });
    });

    ratingButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const ratingValue = Number(button.getAttribute('data-rating-filter') || 0);
        const nextRating = state.rating === ratingValue ? 0 : ratingValue;
        goToCurrentSearchResults({ rating: nextRating });
      });
    });

    mobileRatingOptions.forEach((button) => {
      button.addEventListener('click', () => {
        const ratingValue = Number(button.getAttribute('data-rating-filter') || 0);
        goToCurrentSearchResults({ rating: ratingValue });
      });
    });

    searchInput?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      goToCurrentSearchResults({ query: searchInput.value.trim(), service: '' });
    });

    searchInput?.addEventListener('change', () => {
      goToCurrentSearchResults({ query: searchInput.value.trim(), service: '' });
    });

    if (searchIcon instanceof HTMLElement) {
      searchIcon.setAttribute('role', 'button');
      searchIcon.setAttribute('tabindex', '0');
      searchIcon.addEventListener('click', () => {
        goToCurrentSearchResults({ query: searchInput instanceof HTMLInputElement ? searchInput.value.trim() : '', service: '' });
      });
      searchIcon.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        goToCurrentSearchResults({ query: searchInput instanceof HTMLInputElement ? searchInput.value.trim() : '', service: '' });
      });
    }

    filterBtn?.addEventListener('click', () => {
      if (!mobileSheet) return;
      mobileSheet.hidden = false;
    });

    ratingSheetBtn?.addEventListener('click', () => {
      if (!mobileRatingSheet) return;
      mobileRatingSheet.hidden = false;
    });

    sheetCloseBtn?.addEventListener('click', () => {
      if (mobileSheet) mobileSheet.hidden = true;
    });

    ratingSheetCloseBtn?.addEventListener('click', () => {
      if (mobileRatingSheet) mobileRatingSheet.hidden = true;
    });

    mobileSheet?.addEventListener('click', (event) => {
      if (event.target.closest('.providers-mobile-sheet-backdrop')) {
        mobileSheet.hidden = true;
      }
    });

    mobileRatingSheet?.addEventListener('click', (event) => {
      if (event.target.closest('.providers-mobile-sheet-backdrop')) {
        mobileRatingSheet.hidden = true;
      }
    });

    sidebarToggle?.addEventListener('click', () => {
      if (!(sidebarLayout instanceof HTMLElement)) return;
      sidebarUserToggled = true;
      sidebarCollapsed = !sidebarCollapsed;
      sidebarLayout.classList.toggle('is-sidebar-collapsed', sidebarCollapsed);
      syncSidebarToggleControl();
    });

    suggestedAllBtn?.addEventListener('click', () => {
      state.category = '';
      state.subservice = '';
      state.search = '';
      state.rating = 0;
      state.resultsMode = false;
      sidebarUserToggled = false;
      sidebarCollapsed = false;
      if (searchInput instanceof HTMLInputElement) searchInput.value = '';
      update({ showSkeleton: true });
    });

    mobileQuery.addEventListener('change', renderCategoryRail);

    try {
      if (page instanceof HTMLElement) page.classList.add('is-loading');
      const remoteProviders = await getProviders();
      providers.splice(0, providers.length, ...remoteProviders);
      update({ showSkeleton: true });
    } finally {
      if (page instanceof HTMLElement) page.classList.remove('is-loading');
    }

    if (mainColumn instanceof HTMLElement) {
      mainColumn.style.minHeight = 'calc(100vh - 88px)';
    }
  }

  function renderCategoriesPage() {
    const page = document.querySelector('[data-categories-page]');
    if (!page) return;

    const searchInput = page.querySelector('[data-categories-search]');
    const resultsCount = page.querySelector('[data-categories-count]');
    const grid = page.querySelector('[data-categories-grid]');
    const empty = page.querySelector('[data-categories-empty]');
    const cards = Array.from(page.querySelectorAll('[data-category-card]'));
    const params = new URLSearchParams(window.location.search);
    let query = String(params.get('q') || '').trim();

    if (searchInput instanceof HTMLInputElement) {
      searchInput.autocomplete = 'off';
      searchInput.spellcheck = false;
      searchInput.setAttribute('autocapitalize', 'off');
      searchInput.setAttribute('aria-autocomplete', 'none');
    }

    cards.forEach((card) => {
      const label = String(card.getAttribute('data-category-label') || '').trim();
      const category = SPECIALIST_CATEGORIES.find((item) => item.label === label);
      const searchableText = [
        label,
        category?.shortLabel || '',
        ...(Array.isArray(category?.subservices) ? category.subservices : [])
      ].join(' ').toLowerCase();
      card.setAttribute('data-category-search', searchableText);
      if (card instanceof HTMLAnchorElement) {
        card.href = typeof buildWorkLinkUpSpecialistsHref === 'function'
          ? buildWorkLinkUpSpecialistsHref(label, { category: label, query: label })
          : buildSearchResultsHref(label, { category: label });
      }
    });

    function syncUrl() {
      const nextUrl = new URL(window.location.href);
      if (query) nextUrl.searchParams.set('q', query);
      else nextUrl.searchParams.delete('q');
      window.history.replaceState({}, '', `${nextUrl.pathname}${nextUrl.search}`);
    }

    function render() {
      const normalized = query.toLowerCase();
      let visibleCount = 0;
      if (searchInput instanceof HTMLInputElement) {
        searchInput.value = query;
      }
      cards.forEach((card) => {
        const haystack = String(card.getAttribute('data-category-search') || '').trim();
        const matches = !normalized || haystack.includes(normalized);
        card.hidden = !matches;
        if (matches) visibleCount += 1;
      });
      if (resultsCount instanceof HTMLElement) {
        resultsCount.textContent = `${visibleCount} categor${visibleCount === 1 ? 'y' : 'ies'}`;
      }
      if (empty instanceof HTMLElement) {
        empty.hidden = visibleCount > 0;
      }
      syncUrl();
    }

    searchInput?.addEventListener('input', () => {
      query = searchInput.value.trim();
      render();
    });

    render();
  }

  function buildProviderWorkSkeleton(count = 4) {
    return Array.from({ length: count }, () => '<article class="provider-gallery-skeleton" aria-hidden="true"></article>').join('');
  }

  function buildProviderWorkEmptyState() {
    return `
      <div class="provider-gallery-empty">
        <i class="fa-regular fa-image"></i>
        <p>No previous work yet. Completed jobs will appear here.</p>
      </div>
    `;
  }

  function preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve('');
        return;
      }

      const image = new Image();
      image.onload = () => resolve(src);
      image.onerror = () => resolve(src);
      image.src = src;
    });
  }

  function buildWhatsAppShareLink(text) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  function getProviderDialogElements() {
    const overlay = document.querySelector('[data-provider-dialog-overlay]');
    const body = document.querySelector('[data-provider-dialog-body]');
    const closeBtn = document.querySelector('[data-provider-dialog-close]');
    return { overlay, body, closeBtn };
  }

  function closeProviderDialog() {
    const { overlay, body } = getProviderDialogElements();
    if (overlay instanceof HTMLElement) overlay.hidden = true;
    if (body instanceof HTMLElement) body.innerHTML = '';
    document.body.classList.remove('provider-dialog-open');
  }

  function openProviderDialog(markup, onReady) {
    const { overlay, body, closeBtn } = getProviderDialogElements();
    if (!(overlay instanceof HTMLElement) || !(body instanceof HTMLElement)) return;
    body.innerHTML = markup;
    overlay.hidden = false;
    document.body.classList.add('provider-dialog-open');

    closeBtn?.addEventListener('click', closeProviderDialog, { once: true });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeProviderDialog();
    }, { once: true });

    if (typeof onReady === 'function') onReady(body);
  }

  async function openProfileEditor(provider, onSaved) {
    const authHelper = await waitForAuthHelper();
    if (!authHelper || typeof authHelper.updateProviderProfile !== 'function') return;

    openProviderDialog(`
      <div class="provider-dialog-card provider-dialog-card-editor">
        <h3>Edit your profile</h3>
        <p>Update the details finders see on your artisan profile.</p>
        <form class="provider-editor-form" data-provider-editor-form>
          <div class="provider-editor-scroll">
            <section class="provider-editor-section">
              <div class="provider-editor-section-head">
                <strong>Identity</strong>
                <span>Name and contact details</span>
              </div>
              <div class="provider-editor-grid">
                <label><span>Full name</span><input name="fullName" type="text" value="${escapeHtml(provider.displayName || '')}" required /></label>
                <label><span>WhatsApp number</span><input name="whatsappNumber" type="tel" value="${escapeHtml(provider.whatsappNumber || '')}" required /></label>
              </div>
            </section>

            <section class="provider-editor-section">
              <div class="provider-editor-section-head">
                <strong>Location</strong>
                <span>Where clients can find you</span>
              </div>
              <div class="provider-editor-grid">
                <label><span>Province</span>
                  <select name="province" required>
                    ${ZIMBABWE_PROVINCES.map((provinceName) => `<option value="${provinceName}" ${provinceName === provider.province ? 'selected' : ''}>${provinceName}</option>`).join('')}
                  </select>
                </label>
                <label><span>City / suburb</span><input name="city" type="text" value="${escapeHtml(provider.city || '')}" required /></label>
                <label class="provider-editor-span"><span>Address</span><input name="address" type="text" value="${escapeHtml(provider.address || '')}" required /></label>
              </div>
            </section>

            <section class="provider-editor-section">
              <div class="provider-editor-section-head">
                <strong>Work Details</strong>
                <span>What you do and how you present it</span>
              </div>
              <div class="provider-editor-grid">
                <label><span>Experience</span><input name="experience" type="text" value="${escapeHtml(provider.experience || '')}" required /></label>
                <label><span>Category</span>
                  <select name="primaryCategory" required>
                    ${SPECIALIST_CATEGORIES.map((category) => `<option value="${category.label}" ${category.label === provider.primaryCategory ? 'selected' : ''}>${category.label}</option>`).join('')}
                  </select>
                </label>
                <label class="provider-editor-span"><span>Specialty</span>
                  <select name="specialty" data-provider-editor-specialty required>
                    ${buildSubserviceOptionsMarkup(provider.primaryCategory || SPECIALIST_CATEGORIES[0]?.label || '', provider.specialty || '', 'Choose a service')}
                  </select>
                </label>
                <label class="provider-editor-span"><span>Bio</span><textarea name="bio" required>${escapeHtml(provider.bio || '')}</textarea></label>
              </div>
            </section>

            <section class="provider-editor-section">
              <div class="provider-editor-section-head">
                <strong>Images</strong>
                <span>Update the pictures shown on your profile</span>
              </div>
              <div class="provider-editor-grid">
                <label><span>Profile image</span><input type="file" name="profileImageFile" accept="image/*" /></label>
                <label><span>Banner image</span><input type="file" name="bannerImageFile" accept="image/*" /></label>
              </div>
            </section>
          </div>
          <div class="provider-editor-actions">
            <button type="button" class="provider-profile-action secondary" data-provider-dialog-cancel>Cancel</button>
            <button type="submit" class="provider-profile-action">Save Changes</button>
          </div>
        </form>
      </div>
    `, (body) => {
      const form = body.querySelector('[data-provider-editor-form]');
      const cancelBtn = body.querySelector('[data-provider-dialog-cancel]');
      const categorySelect = form?.querySelector('select[name="primaryCategory"]');
      const specialtySelect = form?.querySelector('[data-provider-editor-specialty]');
      cancelBtn?.addEventListener('click', closeProviderDialog);
      categorySelect?.addEventListener('change', () => {
        if (!(categorySelect instanceof HTMLSelectElement) || !(specialtySelect instanceof HTMLSelectElement)) return;
        specialtySelect.innerHTML = buildSubserviceOptionsMarkup(categorySelect.value, '', 'Choose a service');
      });
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const profileImageFile = formData.get('profileImageFile');
        const bannerImageFile = formData.get('bannerImageFile');
        const payload = Object.fromEntries(Array.from(formData.entries()).filter(([key]) => !key.endsWith('File')));
        payload.profileImageData = provider.profileImageData || '';
        payload.bannerImageData = provider.bannerImageData || '';

        if (profileImageFile instanceof File && profileImageFile.size) {
          payload.profileImageData = await readImageAsBase64(profileImageFile, { maxWidth: 720, maxHeight: 720, quality: 0.84 });
        }
        if (bannerImageFile instanceof File && bannerImageFile.size) {
          payload.bannerImageData = await readImageAsBase64(bannerImageFile, { maxWidth: 1600, maxHeight: 900, quality: 0.82 });
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
        try {
          await authHelper.updateProviderProfile(payload);
          closeProviderDialog();
          if (typeof onSaved === 'function') onSaved();
        } catch (error) {
          window.alert(error.message || 'Could not update your profile.');
        } finally {
          if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
        }
      });
    });
  }

  async function openPostEditor(post, onSaved) {
    const authHelper = await waitForAuthHelper();
    if (!authHelper || typeof authHelper.updateProviderPost !== 'function') return;

    openProviderDialog(`
      <div class="provider-dialog-card">
        <h3>Edit post</h3>
        <p>Update the caption or replace the image for this work post.</p>
        <form class="provider-editor-form" data-provider-post-editor-form>
          <div class="provider-post-preview provider-dialog-image-preview" data-provider-post-editor-preview>
            <img src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.avif'))}" alt="Post preview" />
          </div>
          <label><span>Caption</span><textarea name="caption" required>${escapeHtml(post.caption || '')}</textarea></label>
          <label><span>Replace image</span><input type="file" name="imageFile" accept="image/*" /></label>
          <div class="provider-editor-actions">
            <button type="button" class="provider-profile-action secondary" data-provider-dialog-cancel>Cancel</button>
            <button type="submit" class="provider-profile-action">Save Post</button>
          </div>
        </form>
      </div>
    `, (body) => {
      const form = body.querySelector('[data-provider-post-editor-form]');
      const cancelBtn = body.querySelector('[data-provider-dialog-cancel]');
      const preview = body.querySelector('[data-provider-post-editor-preview]');
      let nextImageData = post.imageData;

      cancelBtn?.addEventListener('click', closeProviderDialog);
      form?.querySelector('input[name="imageFile"]')?.addEventListener('change', async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        nextImageData = await readImageAsBase64(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 });
        if (preview instanceof HTMLElement) {
          preview.innerHTML = `<img src="${escapeHtml(nextImageData)}" alt="Post preview" />`;
        }
      });

      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
        try {
          await authHelper.updateProviderPost(post.id, {
            caption: form.querySelector('textarea[name="caption"]')?.value || '',
            imageData: nextImageData
          });
          closeProviderDialog();
          if (typeof onSaved === 'function') onSaved();
        } catch (error) {
          window.alert(error.message || 'Could not update that post.');
        } finally {
          if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
        }
      });
    });
  }

  async function renderProviderProfilePage() {
    const page = document.querySelector('[data-provider-profile-page]');
    if (!page) return;

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid') || '';
    const provinceSlug = params.get('province') || '';
    const account = getStoredAccount();
    const provider = await getProviderByIdentity(uid, provinceSlug);

    if (!provider) {
      page.innerHTML = `<div class="specialists-empty">That provider profile could not be found.</div>`;
      return;
    }

    const isOwner = Boolean(account?.loggedIn && account.uid === provider.uid);

    const banner = page.querySelector('[data-provider-banner]');
    const avatar = page.querySelector('[data-provider-avatar]');
    const handle = page.querySelector('[data-provider-handle]');
    const name = page.querySelector('[data-provider-name]');
    const title = page.querySelector('[data-provider-title]');
    const address = page.querySelector('[data-provider-address]');
    const bio = page.querySelector('[data-provider-bio]');
    const phone = page.querySelector('[data-provider-phone]');
    const phoneLink = page.querySelector('[data-provider-phone-link]');
    const postCount = page.querySelector('[data-provider-post-count]');
    const rating = page.querySelector('[data-provider-rating]');
    const jobs = page.querySelector('[data-provider-jobs]');
    const messageLink = page.querySelector('[data-provider-message-link]');
    const editProfileBtn = page.querySelector('[data-provider-edit-profile]');
    const myJobsLink = page.querySelector('[data-provider-my-jobs]');
    const documentsBtn = page.querySelector('[data-provider-documents-trigger]');
    const backBtn = page.querySelector('[data-provider-back]');
    const postGrid = page.querySelector('[data-provider-post-grid]');
    const languagesCard = page.querySelector('[data-provider-languages-card]');
    const languagesHost = page.querySelector('[data-provider-languages]');
    const skillsCard = page.querySelector('[data-provider-skills-card]');
    const skillsHost = page.querySelector('[data-provider-skills]');
    const linksCard = page.querySelector('[data-provider-links-card]');
    const linksHost = page.querySelector('[data-provider-links]');

    backBtn?.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = `${getBase()}pages/specialists.html`;
    });

    async function refreshProfile() {
      page.classList.add('is-loading');

      const [freshProvider, posts] = await Promise.all([
        getProviderByIdentity(uid, provinceSlug),
        getPostsForProvider(uid, provinceSlug)
      ]);
      if (!freshProvider) return;

      const serviceLabel = getServiceListLabel(freshProvider) || freshProvider.specialty || freshProvider.primaryCategory || 'Specialist';
      const workLabel = [freshProvider.title || serviceLabel, freshProvider.primaryCategory].filter(Boolean).join(' • ') || 'Specialist';
      const locationLabel = freshProvider.address || [freshProvider.city, freshProvider.province].filter(Boolean).join(', ') || 'Location not shared';
      const phoneNumber = String(freshProvider.whatsappNumber || '').trim();
      const bannerSrc = resolveMediaSrc(freshProvider.bannerImageData, 'images/sections/findme.avif');
      const avatarSrc = resolveMediaSrc(freshProvider.profileImageData, 'images/logo/logo.jpg');
      const postImageSources = posts.map((post) => resolveMediaSrc(post.imageData, 'images/sections/findme.avif'));

      await Promise.all([
        preloadImage(bannerSrc),
        preloadImage(avatarSrc),
        ...postImageSources.map((src) => preloadImage(src))
      ]);

      if (banner instanceof HTMLElement) {
        banner.style.backgroundImage = `linear-gradient(180deg, rgba(13, 28, 56, 0.10) 0%, rgba(13, 28, 56, 0.60) 100%), url('${bannerSrc}')`;
      }
      if (avatar instanceof HTMLImageElement) avatar.src = avatarSrc;
      if (handle instanceof HTMLElement) handle.textContent = buildProviderHandle(freshProvider.displayName);
      if (name instanceof HTMLElement) name.textContent = freshProvider.displayName;
      if (title instanceof HTMLElement) title.textContent = workLabel;
      if (address instanceof HTMLElement) address.textContent = locationLabel;
      if (bio instanceof HTMLElement) bio.textContent = freshProvider.bio || 'Available for new jobs.';
      if (phone instanceof HTMLElement) phone.textContent = phoneNumber || 'Phone not shared';
      if (phoneLink instanceof HTMLAnchorElement) {
        if (phoneNumber) {
          phoneLink.href = `tel:${phoneNumber.replace(/[^+\d]/g, '')}`;
        } else {
          phoneLink.removeAttribute('href');
        }
      }
      if (postCount instanceof HTMLElement) postCount.textContent = String(posts.length);
      if (rating instanceof HTMLElement) rating.textContent = `${freshProvider.averageRating.toFixed(1)} ★`;
      if (jobs instanceof HTMLElement) jobs.textContent = String(freshProvider.completedJobs || 0);
      if (messageLink instanceof HTMLAnchorElement) messageLink.href = freshProvider.messageUrl;
      if (messageLink instanceof HTMLElement) messageLink.hidden = isOwner;
      if (editProfileBtn instanceof HTMLButtonElement) {
        editProfileBtn.hidden = !isOwner;
        editProfileBtn.onclick = () => {
          window.location.href = `${getBase()}pages/edit-profile.html`;
        };
      }
      if (myJobsLink instanceof HTMLAnchorElement) {
        myJobsLink.hidden = !isOwner;
        myJobsLink.href = `${getBase()}pages/job-giver-profile.html`;
      }

      if (languagesCard instanceof HTMLElement && languagesHost instanceof HTMLElement) {
        const languageItems = Array.isArray(freshProvider.languages) ? freshProvider.languages : [];
        languagesCard.hidden = !languageItems.length;
        languagesHost.innerHTML = languageItems.map((entry) => `
          <span class="provider-meta-chip">${escapeHtml(entry.name)} • ${escapeHtml(entry.level)}</span>
        `).join('');
      }

      if (skillsCard instanceof HTMLElement && skillsHost instanceof HTMLElement) {
        const skillItems = Array.isArray(freshProvider.skills) ? freshProvider.skills : [];
        skillsCard.hidden = !skillItems.length;
        skillsHost.innerHTML = skillItems.map((entry) => `
          <article class="provider-profile-skill-card">
            <strong>${escapeHtml(entry.name)}</strong>
            <span>${escapeHtml(entry.level || 'Experienced')}</span>
          </article>
        `).join('');
      }

      if (linksCard instanceof HTMLElement && linksHost instanceof HTMLElement) {
        const linkItems = Array.isArray(freshProvider.portfolioLinks) ? freshProvider.portfolioLinks : [];
        linksCard.hidden = !linkItems.length;
        linksHost.innerHTML = linkItems.map((link) => `
          <a href="${escapeHtml(link)}" target="_blank" rel="noreferrer">${escapeHtml(link)}</a>
        `).join('');
      }

      if (documentsBtn instanceof HTMLButtonElement) {
        const documentItems = Array.isArray(freshProvider.professionalDocuments) ? freshProvider.professionalDocuments : [];
        documentsBtn.hidden = !documentItems.length;
        documentsBtn.onclick = () => {
          openProviderDialog(`
            <div class="provider-dialog-card provider-dialog-card-documents">
              <h3>Professional documents</h3>
              <div class="provider-document-grid">
                ${documentItems.map((documentItem) => `
                  <button type="button" class="provider-document-card" data-open-provider-document="${escapeHtml(documentItem.id || documentItem.name)}">
                    <strong>${escapeHtml(documentItem.name)}</strong>
                    <span>${escapeHtml(documentItem.kind === 'image' ? 'Image document' : 'PDF document')}</span>
                  </button>
                `).join('')}
              </div>
              <div class="provider-document-preview" data-provider-document-preview>
                <p>Select a document to view it in full.</p>
              </div>
            </div>
          `, (body) => {
            body.querySelectorAll('[data-open-provider-document]').forEach((button) => {
              button.addEventListener('click', () => {
                const key = button.getAttribute('data-open-provider-document') || '';
                const selected = documentItems.find((item) => String(item.id || item.name) === key);
                const preview = body.querySelector('[data-provider-document-preview]');
                if (!(preview instanceof HTMLElement) || !selected) return;
                preview.innerHTML = selected.kind === 'image'
                  ? `<img src="${escapeHtml(selected.data)}" alt="${escapeHtml(selected.name)}" />`
                  : `<iframe src="${escapeHtml(selected.data)}" title="${escapeHtml(selected.name)}"></iframe>`;
              });
            });
          });
        };
      }

      if (postGrid) {
        const profileShareText = `Check out ${freshProvider.displayName} on WorkLinkUp: ${window.location.href}`;
        postGrid.innerHTML = posts.length
          ? posts.map((post, index) => `
            <article class="provider-gallery-card">
              <button type="button" class="provider-post-menu-toggle" data-post-menu-toggle="${escapeHtml(post.id)}" aria-label="Post options">
                <i class="fa-solid fa-ellipsis"></i>
              </button>
              <div class="provider-post-menu" data-post-menu="${escapeHtml(post.id)}" style="transition-delay:${index * 18}ms;">
                ${isOwner ? `
                  <button type="button" data-post-view="${escapeHtml(post.id)}"><i class="fa-regular fa-eye"></i><span>View</span></button>
                  <button type="button" data-post-edit="${escapeHtml(post.id)}"><i class="fa-regular fa-pen-to-square"></i><span>Edit</span></button>
                  <button type="button" data-post-delete="${escapeHtml(post.id)}"><i class="fa-regular fa-trash-can"></i><span>Delete</span></button>
                ` : `
                  <button type="button" data-post-share="${escapeHtml(post.id)}" data-share-link="${escapeHtml(buildWhatsAppShareLink(profileShareText))}">
                    <i class="fa-brands fa-whatsapp"></i><span>Share</span>
                  </button>
                `}
              </div>
              <img src="${escapeHtml(postImageSources[index])}" alt="${escapeHtml(freshProvider.displayName)} work" />
              <div class="provider-gallery-card-copy">
                <strong>${escapeHtml(freshProvider.displayName)}</strong>
                <p>${escapeHtml(post.caption || 'Work posted by the provider.')}</p>
              </div>
            </article>
          `).join('')
          : buildProviderWorkEmptyState();
      }

      if (postGrid) {
        const closeMenus = () => {
          postGrid.querySelectorAll('[data-post-menu]').forEach((menu) => {
            menu.classList.remove('is-open');
          });
        };

        postGrid.onclick = async (event) => {
          const target = event.target instanceof Element ? event.target : null;
          if (!target) return;

          const toggle = target.closest('[data-post-menu-toggle]');
          if (toggle instanceof HTMLElement) {
            event.preventDefault();
            const postId = toggle.getAttribute('data-post-menu-toggle');
            const menu = postId ? postGrid.querySelector(`[data-post-menu="${postId}"]`) : null;
            const willOpen = Boolean(menu && !menu.classList.contains('is-open'));
            closeMenus();
            if (menu && willOpen) {
              requestAnimationFrame(() => {
                menu.classList.add('is-open');
              });
            }
            return;
          }

          const shareBtn = target.closest('[data-post-share]');
          if (shareBtn instanceof HTMLElement) {
            event.preventDefault();
            const shareLink = shareBtn.getAttribute('data-share-link') || '';
            closeMenus();
            if (shareLink) {
              window.open(shareLink, '_blank', 'noopener,noreferrer');
            }
            return;
          }

          if (!isOwner) return;

          const viewBtn = target.closest('[data-post-view]');
          if (viewBtn instanceof HTMLElement) {
            const post = posts.find((item) => item.id === viewBtn.getAttribute('data-post-view'));
            if (!post) return;
            closeMenus();
            openProviderDialog(`
              <div class="provider-dialog-card provider-dialog-card-wide">
                <img class="provider-dialog-hero-image" src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.avif'))}" alt="Work preview" />
                <div class="provider-dialog-copy">
                  <h3>${escapeHtml(freshProvider.displayName)}</h3>
                  <p>${escapeHtml(post.caption || 'Work posted by the provider.')}</p>
                </div>
              </div>
            `);
            return;
          }

          const editBtn = target.closest('[data-post-edit]');
          if (editBtn instanceof HTMLElement) {
            const post = posts.find((item) => item.id === editBtn.getAttribute('data-post-edit'));
            if (!post) return;
            closeMenus();
            openPostEditor(post, refreshProfile);
            return;
          }

          const deleteBtn = target.closest('[data-post-delete]');
          if (deleteBtn instanceof HTMLElement) {
            const post = posts.find((item) => item.id === deleteBtn.getAttribute('data-post-delete'));
            if (!post) return;
            closeMenus();
            const authHelper = await waitForAuthHelper();
            if (!authHelper || typeof authHelper.deleteProviderPost !== 'function') return;
            if (!window.confirm('Delete this post permanently?')) return;
            try {
              await authHelper.deleteProviderPost(post.id);
              refreshProfile();
            } catch (error) {
              window.alert(error.message || 'Could not delete that post.');
            }
          }
        };

        if (postGrid.__providerOutsideClickHandler) {
          document.removeEventListener('click', postGrid.__providerOutsideClickHandler);
        }
        postGrid.__providerOutsideClickHandler = (event) => {
          if (!(event.target instanceof Node)) return;
          if (!postGrid.contains(event.target)) {
            closeMenus();
          }
        };
        document.addEventListener('click', postGrid.__providerOutsideClickHandler);
      }

      requestAnimationFrame(() => {
        page.classList.remove('is-loading');
      });
    }

    refreshProfile();
  }

  function bindFileDropzone(card, input, onSelect) {
    if (!(card instanceof HTMLElement) || !(input instanceof HTMLInputElement) || typeof onSelect !== 'function') return;

    const prevent = (event) => {
      event.preventDefault();
      event.stopPropagation();
    };

    ['dragenter', 'dragover'].forEach((eventName) => {
      card.addEventListener(eventName, (event) => {
        prevent(event);
        card.classList.add('is-dragover');
      });
    });

    ['dragleave', 'dragend', 'drop'].forEach((eventName) => {
      card.addEventListener(eventName, (event) => {
        prevent(event);
        card.classList.remove('is-dragover');
      });
    });

    card.addEventListener('drop', async (event) => {
      const files = Array.from(event.dataTransfer?.files || []);
      if (!files.length) return;
      await onSelect(files[0]);
      input.value = '';
    });

    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      await onSelect(file);
      input.value = '';
    });
  }

  async function renderEditProfilePage() {
    const page = document.querySelector('[data-edit-profile-page]');
    if (!page) return;

    const account = getStoredAccount();
    if (!account?.loggedIn) {
      window.location.href = `${getBase()}pages/account.html`;
      return;
    }

    const authHelper = await waitForAuthHelper();
    if (!authHelper || typeof authHelper.saveProviderProfile !== 'function' || typeof authHelper.getUserDocument !== 'function' || typeof authHelper.getProviderProfileByUid !== 'function') {
      return;
    }

    let userDoc = await authHelper.getUserDocument(account.uid).catch(() => null) || {};
    let providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug).catch(() => null);

    if (!providerProfile && String(userDoc?.userRole || '').trim() !== 'provider') {
      window.location.href = `${getBase()}pages/account.html`;
      return;
    }

    const existingProvider = normalizeProvider(providerProfile || {
      displayName: userDoc?.name || account.name || '',
      province: userDoc?.providerProvince || 'Harare',
      username: userDoc?.username || '',
      specialty: userDoc?.specialty || ''
    });

    const providerMediaState = {
      profileImageData: existingProvider.profileImageData || '',
      bannerImageData: existingProvider.bannerImageData || '',
      professionalDocuments: Array.isArray(existingProvider.professionalDocuments) ? existingProvider.professionalDocuments.slice() : []
    };
    const existingServices = getProviderServiceList(existingProvider, userDoc?.specialty || '');

    page.innerHTML = `
      <section class="edit-profile-shell">
        <div class="edit-profile-head">
          <button type="button" class="edit-profile-back" data-edit-profile-back>
            <i class="fa-solid fa-arrow-left"></i>
            <span>Back to profile</span>
          </button>
          <div class="edit-profile-head-copy">
            <span class="account-auth-stage-kicker">Edit profile</span>
            <h1>Update everything clients see</h1>
            <p>Keep your WorkLinkUp profile current. Update your identity, services, experience, documents, and media from one page.</p>
          </div>
        </div>

        <form class="account-provider-form edit-profile-form" data-edit-profile-form novalidate>
          <div class="account-provider-grid">
            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Identity</strong>
                <span>How you appear to clients</span>
              </div>
              <div class="account-provider-fields two-col">
                <label class="account-setup-field">
                  <span>Display name</span>
                  <input type="text" name="fullName" required value="${escapeHtml(existingProvider.displayName || '')}" />
                </label>
                <label class="account-setup-field">
                  <span>Title</span>
                  <input type="text" name="title" required value="${escapeHtml(existingProvider.title || '')}" placeholder="Hair stylist, Plumber, Tutor..." />
                </label>
                <label class="account-setup-field">
                  <span>WhatsApp number</span>
                  <input type="tel" name="whatsappNumber" required value="${escapeHtml(existingProvider.whatsappNumber || '')}" placeholder="+263 77 123 4567" />
                </label>
                <label class="account-setup-field">
                  <span>Province</span>
                  <select name="province" required>${buildSelectOptions(ZIMBABWE_PROVINCES, existingProvider.province || 'Harare')}</select>
                </label>
                <label class="account-setup-field">
                  <span>City / suburb</span>
                  <input type="text" name="city" required value="${escapeHtml(existingProvider.city || '')}" />
                </label>
                <label class="account-setup-field">
                  <span>Address or service area</span>
                  <input type="text" name="address" required value="${existingProvider.address ? escapeHtml(existingProvider.address) : ''}" placeholder="City center, North suburbs, etc." />
                </label>
                <label class="account-setup-field account-typeahead-field account-setup-field-span">
                  <span>Services</span>
                  <input type="search" name="serviceSearch" value="" placeholder="Type plumber, hairdresser, cleaning..." autocomplete="off" data-provider-service-input />
                  <div class="account-typeahead-list" data-provider-service-list hidden></div>
                  <div class="account-service-chip-list" data-provider-service-chips></div>
                  <small>Add all services clients can hire you for. The first service is used as your main search category.</small>
                </label>
                <label class="account-setup-field">
                  <span>Experience</span>
                  <input type="text" name="experience" required value="${escapeHtml(existingProvider.experience || '')}" placeholder="4 years" />
                </label>
                <label class="account-setup-field">
                  <span>Username</span>
                  <input type="text" value="${escapeHtml(userDoc?.username || existingProvider.username || '')}" disabled />
                </label>
              </div>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>About</strong>
                <span>Tell clients what you do best</span>
              </div>
              <label class="account-setup-field">
                <span>About you</span>
                <textarea name="bio" required minlength="80" placeholder="Share your experience, strengths, and the work you offer.">${escapeHtml(existingProvider.bio || '')}</textarea>
              </label>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Languages</strong>
                <span>Choose the languages you work in</span>
              </div>
              <div class="account-provider-repeater" data-language-list>
                ${buildSetupRepeaterRows('language', existingProvider.languages)}
              </div>
              <button type="button" class="account-provider-add-row" data-add-language><i class="fa-solid fa-plus"></i><span>Add language</span></button>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Skills and expertise</strong>
                <span>Add the skills that help clients find you</span>
              </div>
              <div class="account-provider-repeater" data-skill-list>
                ${buildSetupRepeaterRows('skill', existingProvider.skills)}
              </div>
              <button type="button" class="account-provider-add-row" data-add-skill><i class="fa-solid fa-plus"></i><span>Add skill</span></button>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Work experience</strong>
                <span>Optional</span>
              </div>
              <div class="account-provider-repeater" data-experience-list>
                ${buildSetupRepeaterRows('experience', existingProvider.workExperience)}
              </div>
              <button type="button" class="account-provider-add-row" data-add-experience><i class="fa-solid fa-plus"></i><span>Add work experience</span></button>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Education and certifications</strong>
                <span>Optional</span>
              </div>
              <div class="account-provider-subgrid">
                <div>
                  <div class="account-provider-repeater" data-education-list>
                    ${buildSetupRepeaterRows('education', existingProvider.education)}
                  </div>
                  <button type="button" class="account-provider-add-row" data-add-education><i class="fa-solid fa-plus"></i><span>Add education</span></button>
                </div>
                <div>
                  <div class="account-provider-repeater" data-certification-list>
                    ${buildSetupRepeaterRows('certification', existingProvider.certifications)}
                  </div>
                  <button type="button" class="account-provider-add-row" data-add-certification><i class="fa-solid fa-plus"></i><span>Add certification</span></button>
                </div>
              </div>
            </section>

            <section class="account-provider-section">
              <div class="account-provider-section-head">
                <strong>Portfolio and documents</strong>
                <span>Media, website links, and professional documents</span>
              </div>
              <div class="account-provider-repeater" data-link-list>
                ${buildSetupRepeaterRows('link', existingProvider.portfolioLinks)}
              </div>
              <button type="button" class="account-provider-add-row" data-add-link><i class="fa-solid fa-plus"></i><span>Add website link</span></button>

              <div class="edit-profile-upload-grid">
                <label class="edit-profile-upload-card" data-edit-upload-card="profile">
                  <span class="account-provider-upload-preview account-provider-upload-preview-avatar edit-profile-upload-preview" data-account-profile-preview></span>
                  <strong>Profile image</strong>
                  <p>Drag and drop your profile image here, or use the device uploader below.</p>
                  <span class="edit-profile-upload-trigger">Upload from device</span>
                  <input type="file" accept="image/*" data-account-profile-file hidden />
                </label>
                <label class="edit-profile-upload-card edit-profile-upload-card-banner" data-edit-upload-card="banner">
                  <span class="account-provider-upload-preview account-provider-upload-preview-banner edit-profile-upload-preview" data-account-banner-preview></span>
                  <strong>Banner image</strong>
                  <p>Drop a wide banner here, or choose a file from your device.</p>
                  <span class="edit-profile-upload-trigger">Upload from device</span>
                  <input type="file" accept="image/*" data-account-banner-file hidden />
                </label>
              </div>

              <label class="account-provider-doc-upload">
                <span>Professional documents</span>
                <input type="file" accept="application/pdf,image/*" multiple data-account-document-files />
                <small>Upload CVs, certificates, licenses, or portfolio pages. Images are converted to AVIF, then stored in base64 for viewing later.</small>
              </label>
              <div class="account-provider-doc-list" data-account-document-list></div>
            </section>
          </div>

          <input type="hidden" name="primaryCategory" value="${escapeHtml(existingProvider.primaryCategory || '')}" data-provider-service-category />
          <input type="hidden" name="specialty" value="${escapeHtml(existingProvider.specialty || '')}" data-provider-service-name />

          <div class="account-provider-form-actions edit-profile-form-actions">
            <button type="button" class="provider-profile-action secondary" data-edit-profile-cancel>Cancel</button>
            <button type="submit" class="account-submit-btn account-submit-signup" data-account-provider-submit>
              <span class="account-btn-label">Save changes</span>
            </button>
          </div>
        </form>
      </section>
    `;

    const form = page.querySelector('[data-edit-profile-form]');
    if (!(form instanceof HTMLFormElement)) return;
    const profilePreview = page.querySelector('[data-account-profile-preview]');
    const bannerPreview = page.querySelector('[data-account-banner-preview]');
    const documentList = page.querySelector('[data-account-document-list]');
    const profileInput = page.querySelector('[data-account-profile-file]');
    const bannerInput = page.querySelector('[data-account-banner-file]');
    const documentInput = page.querySelector('[data-account-document-files]');
    const serviceInput = form.querySelector('[data-provider-service-input]');
    const serviceList = form.querySelector('[data-provider-service-list]');
    const serviceChips = form.querySelector('[data-provider-service-chips]');
    const backBtn = page.querySelector('[data-edit-profile-back]');
    const cancelBtn = page.querySelector('[data-edit-profile-cancel]');
    const profileCard = page.querySelector('[data-edit-upload-card="profile"]');
    const bannerCard = page.querySelector('[data-edit-upload-card="banner"]');

    const profileUrl = (() => {
      const url = new URL(`${getBase()}pages/provider-profile.html`, window.location.href);
      url.searchParams.set('uid', account.uid);
      url.searchParams.set('province', existingProvider.provinceSlug || userDoc?.providerProvinceSlug || account.providerProvinceSlug || '');
      return `${url.pathname}${url.search}`;
    })();

    backBtn?.addEventListener('click', () => {
      window.location.href = profileUrl;
    });
    cancelBtn?.addEventListener('click', () => {
      window.location.href = profileUrl;
    });

    updateUploadPreview(profilePreview, providerMediaState.profileImageData, 'avatar');
    updateUploadPreview(bannerPreview, providerMediaState.bannerImageData, 'banner');

    const servicePicker = bindServiceMultiPicker({
      input: serviceInput,
      list: serviceList,
      chipHost: serviceChips,
      initialServices: existingServices,
      emptyText: 'No service found',
      onChange: (services) => syncPrimaryServiceFields(form, services)
    });

    function renderDocumentList() {
      if (!(documentList instanceof HTMLElement)) return;
      documentList.innerHTML = providerMediaState.professionalDocuments.length
        ? providerMediaState.professionalDocuments.map((documentItem, index) => `
          <article class="account-provider-doc-card">
            <div>
              <strong>${escapeHtml(documentItem.name)}</strong>
              <span>${escapeHtml(documentItem.kind === 'image' ? 'Image document' : 'PDF document')}</span>
            </div>
            <button type="button" data-remove-document="${index}"><i class="fa-solid fa-xmark"></i></button>
          </article>
        `).join('')
        : '<div class="account-provider-doc-empty">No professional documents uploaded yet.</div>';
    }

    renderDocumentList();

    bindFileDropzone(profileCard, profileInput, async (file) => {
      providerMediaState.profileImageData = await readImageAsBase64(file, {
        maxWidth: 720,
        maxHeight: 720,
        quality: 0.84,
        outputType: 'image/avif'
      });
      updateUploadPreview(profilePreview, providerMediaState.profileImageData, 'avatar');
    });

    bindFileDropzone(bannerCard, bannerInput, async (file) => {
      providerMediaState.bannerImageData = await readImageAsBase64(file, {
        maxWidth: 1600,
        maxHeight: 900,
        quality: 0.82,
        outputType: 'image/avif'
      });
      updateUploadPreview(bannerPreview, providerMediaState.bannerImageData, 'banner');
    });

    documentInput?.addEventListener('change', async () => {
      const files = Array.from(documentInput.files || []);
      for (const file of files) {
        let data = '';
        let kind = 'pdf';
        if (file.type.startsWith('image/')) {
          data = await readImageAsBase64(file, {
            maxWidth: 1800,
            maxHeight: 1800,
            quality: 0.82,
            outputType: 'image/avif'
          });
          kind = 'image';
        } else {
          data = await readFileAsDataUrl(file);
        }

        providerMediaState.professionalDocuments.push({
          id: `${Date.now()}_${file.name}`,
          name: file.name,
          mimeType: data.match(/^data:([^;]+);/)?.[1] || file.type || 'application/pdf',
          kind,
          data
        });
      }
      documentInput.value = '';
      renderDocumentList();
    });

    documentList?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-remove-document]');
      if (!(button instanceof HTMLElement)) return;
      const index = Number(button.getAttribute('data-remove-document') || -1);
      if (index >= 0) {
        providerMediaState.professionalDocuments.splice(index, 1);
        renderDocumentList();
      }
    });

    function bindAddRow(selector, kind, containerSelector) {
      page.querySelector(selector)?.addEventListener('click', () => {
        const host = page.querySelector(containerSelector);
        if (!(host instanceof HTMLElement)) return;
        host.insertAdjacentHTML('beforeend', buildSetupRepeaterRows(kind, [{}]));
      });
    }

    bindAddRow('[data-add-language]', 'language', '[data-language-list]');
    bindAddRow('[data-add-skill]', 'skill', '[data-skill-list]');
    bindAddRow('[data-add-experience]', 'experience', '[data-experience-list]');
    bindAddRow('[data-add-education]', 'education', '[data-education-list]');
    bindAddRow('[data-add-certification]', 'certification', '[data-certification-list]');
    bindAddRow('[data-add-link]', 'link', '[data-link-list]');

    page.addEventListener('click', (event) => {
      const removeBtn = event.target.closest('[data-remove-row]');
      if (!(removeBtn instanceof HTMLElement)) return;
      const row = removeBtn.closest('.account-setup-repeater-row');
      row?.remove();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitBtn = form.querySelector('[data-account-provider-submit]');
      const requiredFields = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
      let hasErrors = false;

      requiredFields.forEach((field) => {
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
        const invalid = !field.value.trim();
        field.classList.toggle('is-invalid', invalid);
        hasErrors = hasErrors || invalid;
      });

      const selectedServices = servicePicker.getSelections();
      servicePicker.setInvalid(!selectedServices.length);
      hasErrors = hasErrors || !selectedServices.length;

      const languages = collectRows(form.querySelector('[data-language-list]'), '[data-repeater-row="language"]', (row) => {
        const name = String(row.querySelector('[data-language-name]')?.value || '').trim();
        const level = String(row.querySelector('[data-language-level]')?.value || '').trim();
        return name && level ? { name, level } : null;
      });
      const skills = collectRows(form.querySelector('[data-skill-list]'), '[data-repeater-row="skill"]', (row) => {
        const name = String(row.querySelector('[data-skill-name]')?.value || '').trim();
        const level = String(row.querySelector('[data-skill-level]')?.value || '').trim();
        return name ? { name, level } : null;
      });

      if (!languages.length || !skills.length || !providerMediaState.profileImageData || !providerMediaState.bannerImageData) {
        hasErrors = true;
      }

      if (hasErrors) {
        form.querySelector('.is-invalid, input[required], select[required], textarea[required]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      const workExperience = collectRows(form.querySelector('[data-experience-list]'), '[data-repeater-row="experience"]', (row) => {
        const role = String(row.querySelector('[data-exp-role]')?.value || '').trim();
        const company = String(row.querySelector('[data-exp-company]')?.value || '').trim();
        const period = String(row.querySelector('[data-exp-period]')?.value || '').trim();
        const summary = String(row.querySelector('[data-exp-summary]')?.value || '').trim();
        return role || company || summary ? { role, company, period, summary } : null;
      });
      const education = collectRows(form.querySelector('[data-education-list]'), '[data-repeater-row="education"]', (row) => {
        const school = String(row.querySelector('[data-edu-school]')?.value || '').trim();
        const qualification = String(row.querySelector('[data-edu-qualification]')?.value || '').trim();
        const period = String(row.querySelector('[data-edu-period]')?.value || '').trim();
        return school || qualification ? { school, qualification, period } : null;
      });
      const certifications = collectRows(form.querySelector('[data-certification-list]'), '[data-repeater-row="certification"]', (row) => {
        const name = String(row.querySelector('[data-cert-name]')?.value || '').trim();
        const issuer = String(row.querySelector('[data-cert-issuer]')?.value || '').trim();
        const year = String(row.querySelector('[data-cert-year]')?.value || '').trim();
        return name || issuer ? { name, issuer, year } : null;
      });
      const portfolioLinks = collectRows(form.querySelector('[data-link-list]'), '[data-repeater-row="link"]', (row) => {
        const value = String(row.querySelector('[data-link-url]')?.value || '').trim();
        return value || null;
      });

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const primaryService = selectedServices[0];
      payload.username = userDoc?.username || '';
      payload.services = selectedServices;
      payload.primaryCategory = primaryService.category;
      payload.specialty = primaryService.service || primaryService.category;
      payload.title = String(payload.title || '').trim() || getServiceListLabel(selectedServices) || payload.specialty;
      payload.languages = languages;
      payload.skills = skills;
      payload.workExperience = workExperience;
      payload.education = education;
      payload.certifications = certifications;
      payload.portfolioLinks = portfolioLinks;
      payload.profileImageData = providerMediaState.profileImageData;
      payload.bannerImageData = providerMediaState.bannerImageData;
      payload.professionalDocuments = providerMediaState.professionalDocuments;

      if (submitBtn instanceof HTMLButtonElement) setButtonLoading(submitBtn, true);
      try {
        await authHelper.saveProviderProfile(payload);
        userDoc = await authHelper.getUserDocument(account.uid).catch(() => userDoc) || userDoc;
        providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug).catch(() => providerProfile);
        const nextProvince = providerProfile?.provinceSlug || userDoc?.providerProvinceSlug || account.providerProvinceSlug || existingProvider.provinceSlug || '';
        const pendingJobBid = (() => {
          try {
            const raw = sessionStorage.getItem('worklinkup_pending_job_bid');
            return raw ? JSON.parse(raw) : null;
          } catch (storageError) {
            return null;
          }
        })();
        
        // Check if we're in embed mode (iframe or modal)
        const isEmbedded = getIsEmbedded();
        
        if (isEmbedded) {
          // Notify parent to close and redirect
          const redirectTarget = `pages/provider-profile.html?uid=${encodeURIComponent(account.uid)}&province=${encodeURIComponent(nextProvince)}`;
          if (window !== window.parent) {
            window.parent.postMessage({ type: 'worklinkup-setup-complete', redirectUrl: redirectTarget }, '*');
          } else {
            window.dispatchEvent(new CustomEvent('worklinkup:setup-complete', { detail: { redirectUrl: redirectTarget } }));
          }
          return;
        } else {
          // Navigate normally in standalone mode
          const nextUrl = pendingJobBid?.jobId
            ? new URL(`${getBase()}pages/job-posts.html`, window.location.href)
            : new URL(`${getBase()}pages/provider-profile.html`, window.location.href);
          if (pendingJobBid?.jobId) {
            nextUrl.searchParams.set('resumeJob', pendingJobBid.jobId);
          } else {
            nextUrl.searchParams.set('uid', account.uid);
            nextUrl.searchParams.set('province', nextProvince);
          }
          window.location.href = `${nextUrl.pathname}${nextUrl.search}`;
        }
      } catch (error) {
        window.alert(error.message || 'Could not save your provider profile.');
      } finally {
        if (submitBtn instanceof HTMLButtonElement) setButtonLoading(submitBtn, false);
      }
    });
  }

  async function renderPostsPage() {
    const page = document.querySelector('[data-provider-posts-page]');
    if (!page) return;

    const account = getStoredAccount();
    if (!account?.loggedIn) {
      page.innerHTML = `<div class="specialists-empty">Sign in first to manage your posts.</div>`;
      return;
    }

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;

    const profile = await authHelper.getProviderProfileByUid(account.uid, account.providerProvinceSlug);
    if (!profile) {
      page.innerHTML = `<div class="specialists-empty">Complete your provider profile first so you can start posting your work.</div>`;
      return;
    }

    const normalizedProfile = normalizeProvider(profile);
    const feedHost = page.querySelector('[data-provider-post-feed]');
    const form = page.querySelector('[data-provider-post-form]');
    const preview = page.querySelector('[data-provider-post-preview]');
    const fileInput = page.querySelector('[data-provider-post-image]');
    let previewImageData = '';

    async function refreshPosts() {
      const posts = await authHelper.listProviderPosts(normalizedProfile.uid, normalizedProfile.provinceSlug);
      feedHost.innerHTML = posts.length
        ? posts.map((post) => `
          <article class="provider-post-feed-card">
            <div class="provider-post-card-head">
              <div class="provider-post-author">
                <img src="${escapeHtml(resolveMediaSrc(normalizedProfile.profileImageData, 'images/logo/logo.jpg'))}" alt="${escapeHtml(normalizedProfile.displayName)}" />
                <div>
                  <strong>${escapeHtml(normalizedProfile.displayName)}</strong>
                  <span>${escapeHtml(normalizedProfile.specialty)}</span>
                </div>
              </div>
            </div>
            <p>${escapeHtml(post.caption || '')}</p>
            <img src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.avif'))}" alt="Provider post" />
          </article>
        `).join('')
        : `<div class="specialists-empty">Your posts will appear here once you upload your first piece of work.</div>`;
    }

    fileInput?.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      try {
        previewImageData = await readImageAsBase64(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.82
        });
        preview.innerHTML = `<img src="${escapeHtml(previewImageData)}" alt="Preview" />`;
      } catch (error) {
        window.alert(error.message || 'Could not process that image.');
      }
    });

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const caption = String(form.querySelector('[data-provider-post-caption]')?.value || '').trim();
      if (!previewImageData) {
        window.alert('Choose an image first.');
        return;
      }

      const submitBtn = form.querySelector('.provider-post-submit');
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
      try {
        await authHelper.createProviderPost({
          caption,
          imageData: previewImageData
        });
        form.reset();
        previewImageData = '';
        preview.textContent = 'Your image preview will appear here.';
        refreshPosts();
      } catch (error) {
        window.alert(error.message || 'Could not create your post.');
      } finally {
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
      }
    });

    refreshPosts();
  }

  function formatMessagesListStamp(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return '';
    const now = new Date();
    const target = new Date(timestamp);
    const sameDay = now.toDateString() === target.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay) {
      return target.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (yesterday.toDateString() === target.toDateString()) {
      return 'Yesterday';
    }
    const diffDays = Math.floor((now - target) / 86400000);
    if (diffDays < 7) {
      return target.toLocaleDateString([], { weekday: 'short' });
    }
    return target.toLocaleDateString([], { day: '2-digit', month: 'short' });
  }

  function formatMessageDayLabel(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return '';
    const now = new Date();
    const target = new Date(timestamp);
    const sameDay = now.toDateString() === target.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay) return 'Today';
    if (yesterday.toDateString() === target.toDateString()) return 'Yesterday';
    return target.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' });
  }

  function formatLastSeen(value) {
    const timestamp = Number(value || 0);
    if (!timestamp) return 'Recently active';
    const label = formatMessageDayLabel(timestamp);
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return label === 'Today'
      ? `Last seen today at ${time}`
      : label === 'Yesterday'
        ? `Last seen yesterday at ${time}`
        : `Last seen ${label} at ${time}`;
  }

  function buildInitials(value) {
    const parts = String(value || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);
    return (parts.map((part) => part.charAt(0).toUpperCase()).join('') || 'WL');
  }

  function buildMessageImageFilename(label, timestamp = Date.now()) {
    const stem = String(label || 'worklinkup-chat-image')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || 'worklinkup-chat-image';
    return `${stem}-${Number(timestamp || Date.now())}.jpg`;
  }

  function getConversationRoleLabel(profile) {
    return profile?.roleLabel || profile?.specialty || profile?.primaryCategory || 'WorkLinkUp member';
  }

  function getConversationStatusLabel(profile, lastSeenAtMs = 0) {
    if (Number(lastSeenAtMs || 0)) {
      return formatLastSeen(lastSeenAtMs);
    }

    return profile?.statusLabel || 'Recently active';
  }

  function getConversationPreviewCopy(conversation = {}) {
    const preview = String(conversation.lastMessage || '').trim();
    if (preview) return preview;
    if (conversation.lastMessageType === 'image') return 'Photo';
    if (conversation.lastMessageType === 'mixed') return 'Photo and message';
    return 'Start the conversation';
  }

  function buildMessageStatusMarkup(message, accountUid) {
    if (message.fromUid !== accountUid) return '';
    return `
      <span class="message-status ${Number(message.viewedAtMs || 0) ? 'is-viewed' : ''}" aria-label="${Number(message.viewedAtMs || 0) ? 'Viewed' : 'Sent'}">
        <i class="fa-solid fa-check-double"></i>
      </span>
    `;
  }

  function buildMessageBubbleContentMarkup(message) {
    const hasImage = Boolean(String(message.imageData || '').trim());
    const hasText = Boolean(String(message.text || '').trim());
    const imageSrc = hasImage ? resolveMediaSrc(message.imageData) : '';
    const imageLabel = `Shared image from ${message.fromName || 'WorkLinkUp chat'}`;

    return `
      ${hasImage ? `
        <button
          type="button"
          class="message-bubble-image"
          data-message-image
          data-message-image-src="${escapeHtml(imageSrc)}"
          data-message-image-name="${escapeHtml(imageLabel)}"
          aria-label="Open shared image"
        >
          <img src="${escapeHtml(imageSrc)}" alt="${escapeHtml(imageLabel)}" loading="lazy" />
        </button>
      ` : ''}
      ${hasText ? `<div class="message-bubble-text">${escapeHtml(message.text)}</div>` : ''}
    `;
  }

  function buildThreadMessagesMarkup(messages, accountUid) {
    let previousDayKey = '';
    return messages.map((message) => {
      const dayKey = formatMessageDayLabel(message.createdAtMs);
      const showDay = dayKey && dayKey !== previousDayKey;
      previousDayKey = dayKey;
      return `
        ${showDay ? `<div class="messages-day-divider"><span>${escapeHtml(dayKey)}</span></div>` : ''}
        <div class="message-row ${message.fromUid === accountUid ? 'is-mine' : 'is-theirs'}">
          <div class="message-bubble ${message.fromUid === accountUid ? 'is-mine' : 'is-theirs'} ${message.imageData ? 'has-image' : ''}">
            ${buildMessageBubbleContentMarkup(message)}
            <div class="message-bubble-meta">
              <span>${escapeHtml(new Date(Number(message.createdAtMs || 0)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))}</span>
              ${buildMessageStatusMarkup(message, accountUid)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  async function renderMessagesPage() {
    const page = document.querySelector('[data-messages-page]');
    if (!page) return;

    const account = getStoredAccount();
    if (!account?.loggedIn) {
      page.innerHTML = `<div class="specialists-empty">Sign in first to message people on WorkLinkUp.</div>`;
      return;
    }

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;

    if (typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession(account.uid, 12000).catch(() => null);
    }

    page.innerHTML = `
      <div class="messages-layout" data-messages-layout>
        <aside class="messages-sidebar">
          <div class="messages-home-head">
            <div>
              <p class="messages-home-kicker">WorkLinkUp Inbox</p>
              <h1>Messages</h1>
            </div>
            <button type="button" class="messages-home-add" data-message-clear-search aria-label="Start a new chat">
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>

          <label class="messages-search-bar">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="search" placeholder="Search people or start a new chat" data-message-search />
          </label>

          <div class="messages-filter-row" data-message-filter-row></div>
          <section class="messages-suggestions" data-message-suggestions hidden></section>
          <section class="messages-chat-list" data-chat-list></section>
        </aside>

        <section class="messages-thread">
          <div class="messages-thread-head">
            <div class="messages-thread-head-main">
              <button type="button" class="messages-thread-back" data-thread-back aria-label="Back to messages list">
                <i class="fa-solid fa-arrow-left"></i>
              </button>
              <div class="messages-thread-avatar" data-message-thread-avatar>WL</div>
              <div class="messages-thread-head-copy">
                <div class="messages-thread-name-row">
                  <strong data-message-thread-title>Messages</strong>
                  <span class="messages-verified-tick" data-message-thread-verified hidden><i class="fa-solid fa-check"></i></span>
                </div>
                <span data-message-thread-status>Select a chat to start</span>
              </div>
            </div>
            <button type="button" class="messages-thread-search-toggle" data-thread-focus-search aria-label="Search people">
              <i class="fa-solid fa-magnifying-glass"></i>
            </button>
          </div>

          <div class="messages-thread-body" data-message-thread></div>

          <form class="messages-thread-compose" data-messages-compose>
            <div class="messages-compose-main">
              <div class="messages-compose-preview" data-messages-compose-preview hidden></div>
              <div class="messages-compose-row">
                <label class="messages-attach-btn" aria-label="Attach image">
                  <input type="file" accept="image/*" data-messages-compose-file />
                  <i class="fa-regular fa-image"></i>
                </label>
                <input class="messages-compose-input" type="text" placeholder="Type a message..." data-messages-compose-input />
              </div>
            </div>
            <button type="submit" class="messages-send-btn">
              <i class="fa-solid fa-paper-plane"></i>
              <span>Send</span>
            </button>
          </form>
        </section>
      </div>

      <div class="messages-media-viewer" data-messages-media-viewer hidden>
        <div class="messages-media-viewer-panel" role="dialog" aria-modal="true" aria-label="Message image viewer">
          <div class="messages-media-viewer-bar">
            <a href="#" class="messages-media-download" data-messages-media-download download="worklinkup-chat-image.jpg">
              <i class="fa-solid fa-download"></i>
              <span>Download</span>
            </a>
            <button type="button" class="messages-media-close" data-messages-media-close aria-label="Close image viewer">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="messages-media-stage">
            <img src="" alt="Expanded message image" data-messages-media-image />
          </div>
        </div>
      </div>
    `;

    const params = new URLSearchParams(window.location.search);
    const chatList = page.querySelector('[data-chat-list]');
    const threadBody = page.querySelector('[data-message-thread]');
    const threadTitle = page.querySelector('[data-message-thread-title]');
    const threadStatus = page.querySelector('[data-message-thread-status]');
    const threadAvatar = page.querySelector('[data-message-thread-avatar]');
    const threadVerified = page.querySelector('[data-message-thread-verified]');
    const composeForm = page.querySelector('[data-messages-compose]');
    const composeInput = page.querySelector('[data-messages-compose-input]');
    const filterRow = page.querySelector('[data-message-filter-row]');
    const searchInput = page.querySelector('[data-message-search]');
    const suggestions = page.querySelector('[data-message-suggestions]');
    const clearSearchBtn = page.querySelector('[data-message-clear-search]');
    const threadBackBtn = page.querySelector('[data-thread-back]');
    const focusSearchBtn = page.querySelector('[data-thread-focus-search]');
    const composePreview = page.querySelector('[data-messages-compose-preview]');
    const composeFileInput = page.querySelector('[data-messages-compose-file]');
    const mediaViewer = page.querySelector('[data-messages-media-viewer]');
    const mediaViewerImage = page.querySelector('[data-messages-media-image]');
    const mediaViewerDownload = page.querySelector('[data-messages-media-download]');
    const mediaViewerClose = page.querySelector('[data-messages-media-close]');

    const state = {
      activePeerUid: params.get('peer') || params.get('provider') || '',
      activePeerName: 'Messages',
      activePeerProvince: params.get('province') || '',
      activePeerProfile: null,
      pendingDraft: params.get('draft') || '',
      filter: 'all',
      query: '',
      conversations: [],
      pendingImageData: '',
      pendingImageName: '',
      lastRenderedMessageId: ''
    };

    const contactDirectory = new Map();
    let contactListPromise = null;
    let searchRequestId = 0;
    let unsubscribeConversations = null;
    let unsubscribeMessages = null;
    let authSyncQueued = false;

    function setThreadOpen(isOpen) {
      page.classList.toggle('is-thread-open', Boolean(isOpen));
    }

    function setActiveConversation(peer) {
      const previousPeerUid = state.activePeerUid;
      state.activePeerUid = peer?.uid || '';
      state.activePeerName = peer?.name || 'Messages';
      state.activePeerProvince = peer?.provinceSlug || '';
      state.activePeerProfile = peer?.profile || null;
      state.lastRenderedMessageId = '';

      if (previousPeerUid !== state.activePeerUid) {
        composeForm?.reset();
        clearPendingImage();
      }

      setThreadOpen(Boolean(state.activePeerUid));

      const nextUrl = new URL(window.location.href);
      if (state.activePeerUid) {
        nextUrl.searchParams.set('peer', state.activePeerUid);
        if (state.activePeerProvince) nextUrl.searchParams.set('province', state.activePeerProvince);
        nextUrl.searchParams.delete('provider');
      } else {
        nextUrl.searchParams.delete('peer');
        nextUrl.searchParams.delete('provider');
        nextUrl.searchParams.delete('province');
      }
      window.history.replaceState({}, '', nextUrl.toString());
    }

    function stopConversationSubscription() {
      if (typeof unsubscribeConversations === 'function') {
        unsubscribeConversations();
      }
      unsubscribeConversations = null;
    }

    function stopMessagesSubscription() {
      if (typeof unsubscribeMessages === 'function') {
        unsubscribeMessages();
      }
      unsubscribeMessages = null;
    }

    function getProfileImageMarkup(profile, fallbackName) {
      const source = profile?.profileImageData ? resolveMediaSrc(profile.profileImageData, 'images/logo/logo.jpg') : '';
      return source
        ? `<img src="${escapeHtml(source)}" alt="${escapeHtml(fallbackName)} profile image" />`
        : `<span>${escapeHtml(buildInitials(fallbackName))}</span>`;
    }

    function clearPendingImage(resetInput = true) {
      state.pendingImageData = '';
      state.pendingImageName = '';
      if (composePreview instanceof HTMLElement) {
        composePreview.hidden = true;
        composePreview.innerHTML = '';
      }
      if (resetInput && composeFileInput instanceof HTMLInputElement) {
        composeFileInput.value = '';
      }
    }

    function renderComposePreview() {
      if (!(composePreview instanceof HTMLElement)) return;

      if (!state.pendingImageData) {
        composePreview.hidden = true;
        composePreview.innerHTML = '';
        return;
      }

      composePreview.hidden = false;
      composePreview.innerHTML = `
        <div class="messages-compose-preview-card">
          <img src="${escapeHtml(state.pendingImageData)}" alt="Selected message image" />
          <div class="messages-compose-preview-copy">
            <strong>${escapeHtml(state.pendingImageName || 'Photo ready')}</strong>
            <span>Will be sent with your next message</span>
          </div>
          <button type="button" class="messages-compose-preview-clear" data-messages-compose-preview-clear aria-label="Remove image">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      composePreview.querySelector('[data-messages-compose-preview-clear]')?.addEventListener('click', () => {
        clearPendingImage();
        refreshComposerState();
      });
    }

    function refreshComposerState() {
      const submitBtn = composeForm?.querySelector('.messages-send-btn');
      if (composeInput instanceof HTMLInputElement && state.pendingDraft && state.activePeerUid && !composeInput.value.trim()) {
        composeInput.value = state.pendingDraft;
      }
      const canSend = Boolean(state.activePeerUid) && Boolean(
        String(composeInput?.value || '').trim() || state.pendingImageData
      );

      if (composeInput instanceof HTMLInputElement) {
        composeInput.disabled = !state.activePeerUid;
      }

      if (composeFileInput instanceof HTMLInputElement) {
        composeFileInput.disabled = !state.activePeerUid;
      }

      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = !canSend;
      }
    }

    function scrollThreadToBottom(force = false) {
      if (!(threadBody instanceof HTMLElement)) return;
      const distanceFromBottom = threadBody.scrollHeight - threadBody.clientHeight - threadBody.scrollTop;
      if (!force && distanceFromBottom > 96) return;
      window.requestAnimationFrame(() => {
        threadBody.scrollTop = threadBody.scrollHeight;
      });
    }

    function closeMessageImageViewer() {
      if (!(mediaViewer instanceof HTMLElement)) return;
      mediaViewer.hidden = true;
      mediaViewer.classList.remove('is-visible');
      document.body.classList.remove('messages-media-viewer-open');
      if (mediaViewerImage instanceof HTMLImageElement) {
        mediaViewerImage.src = '';
      }
      if (mediaViewerDownload instanceof HTMLAnchorElement) {
        mediaViewerDownload.href = '#';
        mediaViewerDownload.download = 'worklinkup-chat-image.jpg';
      }
    }

    function openMessageImageViewer(src, label) {
      if (!(mediaViewer instanceof HTMLElement) || !(mediaViewerImage instanceof HTMLImageElement)) return;
      const safeSrc = String(src || '').trim();
      if (!safeSrc) return;

      mediaViewer.hidden = false;
      mediaViewer.classList.add('is-visible');
      document.body.classList.add('messages-media-viewer-open');
      mediaViewerImage.src = safeSrc;
      mediaViewerImage.alt = label || 'Expanded message image';

      if (mediaViewerDownload instanceof HTMLAnchorElement) {
        mediaViewerDownload.href = safeSrc;
        mediaViewerDownload.download = buildMessageImageFilename(label);
      }
    }

    function renderFilterChips() {
      const unreadCount = state.conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0);
      const chips = [
        { key: 'all', label: 'All', count: state.conversations.length },
        { key: 'unread', label: 'Unread', count: unreadCount },
        { key: 'recent', label: 'Recent', count: Math.min(state.conversations.length, 9) }
      ];

      filterRow.innerHTML = chips.map((chip) => `
        <button type="button" class="messages-filter-chip ${state.filter === chip.key ? 'is-active' : ''}" data-message-filter="${chip.key}">
          <span>${chip.label}</span>
          <strong>${chip.count}</strong>
        </button>
      `).join('');

      filterRow.querySelectorAll('[data-message-filter]').forEach((button) => {
        button.addEventListener('click', () => {
          state.filter = button.getAttribute('data-message-filter') || 'all';
          renderChatList();
          renderFilterChips();
        });
      });
    }

    async function ensureContactDirectory() {
      if (!contactListPromise) {
        contactListPromise = Promise.all([
          typeof authHelper.listUsers === 'function' ? authHelper.listUsers().catch(() => []) : [],
          getProviders().catch(() => [])
        ]).then(([users, providers]) => {
          users.forEach((user) => {
            const normalized = normalizeMessageContact(user);
            if (normalized.uid) contactDirectory.set(normalized.uid, normalized);
          });

          providers.forEach((provider) => {
            const existing = contactDirectory.get(provider.uid) || {};
            const normalized = normalizeMessageContact({
              ...existing,
              ...provider,
              uid: provider.uid,
              displayName: provider.displayName || existing.displayName || existing.name || ''
            });
            if (normalized.uid) contactDirectory.set(normalized.uid, normalized);
          });

          return Array.from(contactDirectory.values());
        });
      }
      return contactListPromise;
    }

    async function ensureContactProfile(uid, provinceSlug = '') {
      if (!uid) return null;
      if (contactDirectory.has(uid)) return contactDirectory.get(uid);

      const [userDoc, providerProfile] = await Promise.all([
        typeof authHelper.getUserDocument === 'function' ? authHelper.getUserDocument(uid).catch(() => null) : null,
        typeof authHelper.getProviderProfileByUid === 'function' ? authHelper.getProviderProfileByUid(uid, provinceSlug).catch(() => null) : null
      ]);

      const normalized = normalizeMessageContact({
        ...(userDoc || {}),
        ...(providerProfile || {}),
        uid,
        displayName: providerProfile?.displayName || userDoc?.name || ''
      });

      if (normalized.uid) {
        contactDirectory.set(normalized.uid, normalized);
        return normalized;
      }

      return null;
    }

    function getFilteredConversations() {
      return state.conversations.filter((conversation) => {
        if (state.filter === 'unread' && !Number(conversation.unreadCount || 0)) return false;
        if (state.filter === 'recent' && !Number(conversation.createdAtMs || 0)) return false;
        if (!state.query) return true;
        const haystack = `${conversation.peerName} ${conversation.lastMessage} ${conversation.profile?.roleLabel || ''} ${conversation.profile?.statusLabel || ''}`.toLowerCase();
        return haystack.includes(state.query.toLowerCase());
      });
    }

    function renderChatList() {
      const conversations = getFilteredConversations();
      chatList.innerHTML = conversations.length
        ? conversations.map((conversation) => `
          <button
            type="button"
            class="messages-chat-item ${conversation.peerUid === state.activePeerUid ? 'is-active' : ''}"
            data-chat-peer="${escapeHtml(conversation.peerUid)}"
            data-chat-province="${escapeHtml(conversation.peerProvinceSlug || '')}"
            data-chat-name="${escapeHtml(conversation.peerName)}"
          >
            <div class="messages-chat-avatar">
              ${getProfileImageMarkup(conversation.profile, conversation.peerName)}
            </div>
            <div class="messages-chat-copy">
              <div class="messages-chat-top">
                <div class="messages-chat-title">
                  <strong>${escapeHtml(conversation.peerName)}</strong>
                  ${conversation.profile?.isProvider ? '<span class="messages-verified-tick"><i class="fa-solid fa-check"></i></span>' : ''}
                </div>
                <span class="messages-chat-time">${escapeHtml(formatMessagesListStamp(conversation.createdAtMs))}</span>
              </div>
              <div class="messages-chat-role">${escapeHtml(getConversationRoleLabel(conversation.profile))}</div>
              <div class="messages-chat-preview-row">
                <div class="messages-chat-preview ${conversation.lastMessageIsMine ? 'is-mine' : ''}">
                  ${conversation.lastMessageIsMine ? buildMessageStatusMarkup({ fromUid: account.uid, viewedAtMs: conversation.lastMessageViewedAtMs }, account.uid) : ''}
                  <span>${escapeHtml(getConversationPreviewCopy(conversation))}</span>
                </div>
                ${Number(conversation.unreadCount || 0) ? `<span class="messages-chat-unread">${conversation.unreadCount}</span>` : ''}
              </div>
            </div>
          </button>
        `).join('')
        : `<div class="messages-empty messages-home-empty"><div><h2>No chats yet</h2><p>Search for someone above and start a conversation.</p></div></div>`;

      chatList.querySelectorAll('[data-chat-peer]').forEach((button) => {
        button.addEventListener('click', async () => {
          const peerUid = button.getAttribute('data-chat-peer') || '';
          const peerProvinceSlug = button.getAttribute('data-chat-province') || '';
          const peerName = button.getAttribute('data-chat-name') || 'Conversation';
          const profile = await ensureContactProfile(peerUid, peerProvinceSlug);
          setActiveConversation({
            uid: peerUid,
            provinceSlug: peerProvinceSlug || profile?.provinceSlug || '',
            name: profile?.displayName || peerName,
            profile
          });
          await refreshMessages();
        });
      });
    }

    function renderSuggestionSkeletons() {
      suggestions.hidden = false;
      suggestions.innerHTML = `
        <div class="messages-suggestions-head">
          <strong>Search results</strong>
          <span>Looking for people</span>
        </div>
        <div class="messages-suggestion-grid">
          <article class="messages-suggestion-skeleton"></article>
          <article class="messages-suggestion-skeleton"></article>
          <article class="messages-suggestion-skeleton"></article>
        </div>
      `;
    }

    async function refreshSuggestions() {
      const query = state.query.trim();
      if (!query) {
        suggestions.hidden = true;
        suggestions.innerHTML = '';
        return;
      }

      renderSuggestionSkeletons();
      const requestId = ++searchRequestId;
      const contacts = await ensureContactDirectory();
      if (requestId !== searchRequestId) return;

      const results = contacts
        .filter((contact) => contact.uid !== account.uid)
        .filter((contact) => {
          const haystack = `${contact.displayName} ${contact.roleLabel} ${contact.statusLabel} ${contact.bio || ''} ${contact.city || ''} ${contact.province || ''}`.toLowerCase();
          return haystack.includes(query.toLowerCase());
        })
        .slice(0, 6);

      suggestions.hidden = false;
      suggestions.innerHTML = `
        <div class="messages-suggestions-head">
          <strong>Search results</strong>
          <span>${results.length ? `${results.length} contact${results.length === 1 ? '' : 's'} found` : 'No people matched that search'}</span>
        </div>
        <div class="messages-suggestion-grid">
          ${results.length ? results.map((contact) => `
            <button
              type="button"
              class="messages-suggestion-card"
              data-suggestion-peer="${escapeHtml(contact.uid)}"
              data-suggestion-province="${escapeHtml(contact.provinceSlug || '')}"
            >
              <div class="messages-suggestion-avatar">
                ${getProfileImageMarkup(contact, contact.displayName)}
              </div>
              <div class="messages-suggestion-copy">
                <div class="messages-suggestion-title">
                  <strong>${escapeHtml(contact.displayName)}</strong>
                  ${contact.isProvider ? '<span class="messages-verified-tick"><i class="fa-solid fa-check"></i></span>' : ''}
                </div>
                <div class="messages-suggestion-role">${escapeHtml(getConversationRoleLabel(contact))}</div>
                <div class="messages-suggestion-meta">
                  <span><i class="fa-solid fa-briefcase"></i>${escapeHtml(getConversationRoleLabel(contact))}</span>
                  <span><i class="fa-solid fa-location-dot"></i>${escapeHtml(contact.statusLabel)}</span>
                </div>
              </div>
              <span class="messages-suggestion-cta">Message</span>
            </button>
          `).join('') : `<div class="messages-empty messages-suggestion-empty"><div><h2>No contact found</h2><p>Try a name, role, city, or service category.</p></div></div>`}
        </div>
      `;

      suggestions.querySelectorAll('[data-suggestion-peer]').forEach((button) => {
        button.addEventListener('click', async () => {
          const peerUid = button.getAttribute('data-suggestion-peer') || '';
          const peerProvinceSlug = button.getAttribute('data-suggestion-province') || '';
          const profile = await ensureContactProfile(peerUid, peerProvinceSlug);
          if (!profile) return;
          setActiveConversation({
            uid: profile.uid,
            provinceSlug: profile.provinceSlug,
            name: profile.displayName,
            profile
          });
          await refreshMessages();
          if (composeInput instanceof HTMLInputElement) composeInput.focus();
        });
      });
    }

    async function applyConversationList(conversations) {
      await ensureContactDirectory();

      const nextConversations = await Promise.all(conversations.map(async (conversation) => {
        const profile = await ensureContactProfile(conversation.peerUid, conversation.peerProvinceSlug || '');
        return {
          ...conversation,
          profile
        };
      }));

      if (state.activePeerUid && !nextConversations.some((conversation) => conversation.peerUid === state.activePeerUid)) {
        const profile = await ensureContactProfile(state.activePeerUid, state.activePeerProvince);
        nextConversations.unshift({
          conversationId: `${account.uid}__${state.activePeerUid}`,
          peerUid: state.activePeerUid,
          peerName: profile?.displayName || state.activePeerName || 'Conversation',
          peerProvinceSlug: profile?.provinceSlug || state.activePeerProvince || '',
          lastMessage: '',
          lastMessageType: 'text',
          createdAtMs: Date.now(),
          unreadCount: 0,
          lastSeenAtMs: 0,
          lastMessageIsMine: false,
          lastMessageViewedAtMs: 0,
          profile
        });
      }

      state.conversations = nextConversations;
      renderFilterChips();
      renderChatList();
      window.dispatchEvent(new CustomEvent('worklinkup-messages-badges-refresh'));
    }

    function renderThreadMessages(messages) {
      const lastSeenAtMs = messages.reduce((latest, message) => (
        message.fromUid === state.activePeerUid
          ? Math.max(latest, Number(message.createdAtMs || 0))
          : latest
      ), 0);
      const newestMessageId = messages.length ? String(messages[messages.length - 1].id || '') : '';
      const shouldForceScroll = newestMessageId !== state.lastRenderedMessageId || !state.lastRenderedMessageId;

      threadTitle.textContent = state.activePeerName || 'Conversation';
      threadStatus.textContent = getConversationStatusLabel(state.activePeerProfile, lastSeenAtMs);
      threadVerified.hidden = !state.activePeerProfile?.isProvider;
      threadAvatar.innerHTML = getProfileImageMarkup(state.activePeerProfile, state.activePeerName);
      threadBody.innerHTML = messages.length
        ? buildThreadMessagesMarkup(messages, account.uid)
        : `<div class="messages-empty"><div><h2>Start the conversation</h2><p>Send the first message to ${escapeHtml(state.activePeerName)}.</p></div></div>`;
      state.lastRenderedMessageId = newestMessageId;
      scrollThreadToBottom(shouldForceScroll);
    }

    async function startConversationSubscription() {
      stopConversationSubscription();
      if (typeof authHelper.subscribeConversations === 'function') {
        unsubscribeConversations = await authHelper.subscribeConversations((conversations) => {
          applyConversationList(conversations).catch(() => {});
        });
        return;
      }

      const conversations = await authHelper.listConversations();
      await applyConversationList(conversations);
    }

    async function refreshMessages() {
      if (!state.activePeerUid) {
        stopMessagesSubscription();
        setThreadOpen(false);
        threadTitle.textContent = 'Messages';
        threadStatus.textContent = 'Select a chat to start';
        threadAvatar.textContent = 'WL';
        threadVerified.hidden = true;
        threadBody.innerHTML = `<div class="messages-empty"><div><h2>Select a chat</h2><p>Your conversations and search results will appear on the left.</p></div></div>`;
        refreshComposerState();
        return;
      }

      const profile = await ensureContactProfile(state.activePeerUid, state.activePeerProvince);
      if (profile) {
        state.activePeerProfile = profile;
        state.activePeerName = profile.displayName;
        state.activePeerProvince = profile.provinceSlug || state.activePeerProvince;
      }

      setThreadOpen(true);
      refreshComposerState();

      stopMessagesSubscription();
      if (typeof authHelper.subscribeMessagesWithUser === 'function') {
        unsubscribeMessages = await authHelper.subscribeMessagesWithUser(state.activePeerUid, (messages) => {
          renderThreadMessages(messages);
          // update job action button when thread changes
          updateJobActionButton().catch(() => {});
          const hasUnreadIncoming = messages.some((message) => (
            message.toUid === account.uid && !Number(message.viewedAtMs || 0)
          ));
          if (hasUnreadIncoming) {
            authHelper.markConversationViewed?.(state.activePeerUid).catch(() => {});
            window.dispatchEvent(new CustomEvent('worklinkup-messages-badges-refresh'));
          }
        });
      } else {
        await authHelper.markConversationViewed?.(state.activePeerUid).catch(() => {});
        window.dispatchEvent(new CustomEvent('worklinkup-messages-badges-refresh'));
        const messages = await authHelper.listMessagesWithUser(state.activePeerUid);
        renderThreadMessages(messages);
        updateJobActionButton().catch(() => {});
      }

      scrollThreadToBottom(true);
    }

    async function ensureJobActionHost() {
      const hostSelector = '.messages-job-action-host';
      let host = page.querySelector(hostSelector);
      if (!host) {
        host = document.createElement('div');
        host.className = 'messages-job-action-host';
        // insert host above composer
        const composeEl = page.querySelector('.messages-thread-compose');
        if (composeEl && composeEl.parentNode) composeEl.parentNode.insertBefore(host, composeEl);
        else page.appendChild(host);
      }
      return host;
    }

    async function updateJobActionButton() {
      try {
        const host = await ensureJobActionHost();
        host.innerHTML = '';
        if (!state.activePeerUid) return;
        const activeJob = await authHelper.findActiveJobBetweenUsers(account.uid, state.activePeerUid).catch(() => null);
        if (!activeJob) return;
        const jobId = activeJob.jobId;
        const applicationId = activeJob.applicationId;
        const application = activeJob.application || {};
        const inProgress = Boolean(application.inProgressAtMs || (activeJob.job && activeJob.job.inProgressAtMs));
        const completed = Boolean(application.completedAtMs || (activeJob.job && activeJob.job.completedAtMs));

        if (completed) return; // nothing to show

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'messages-job-action-btn';
        btn.textContent = inProgress ? 'Mark job as finished' : 'Mark job as started';
        host.appendChild(btn);

        btn.addEventListener('click', async () => {
          btn.disabled = true;
          try {
            if (!inProgress) {
              await authHelper.markJobStarted(jobId, applicationId);
              showSuccessToast('Job started');
            } else {
              // open review modal to finish and rate
              openJobReviewModal(activeJob.job, activeJob.application);
            }
            // refresh messages & dashboard
            await refreshMessages();
            window.dispatchEvent(new CustomEvent('worklinkup-job-badges-refresh'));
            window.dispatchEvent(new CustomEvent('worklinkup-job-updated'));
          } catch (error) {
            window.alert(error.message || 'Could not update job state.');
          } finally {
            btn.disabled = false;
          }
        });
      } catch (e) {
        // ignore
      }
    }

    function openJobReviewModal(job, application) {
      try {
        const existing = document.querySelector('.job-review-modal-shell');
        if (existing) existing.remove();
        const shell = document.createElement('div');
        shell.className = 'job-review-modal-shell';
        shell.innerHTML = `
          <div class="job-review-modal-panel" role="dialog" aria-modal="true">
            <button type="button" class="job-modal-close" data-job-review-close><i class="fa-solid fa-xmark"></i></button>
            <div class="job-review-head">
              <div class="job-review-provider-icon">${getProfileImageMarkup(application.bidderProfile || {}, application.bidderName || '')}</div>
              <div>
                <strong>${escapeHtml(application.bidderName || application.bidderUid || 'Provider')}</strong>
                <div class="job-review-meta"><span>${escapeHtml(job.subcategory || job.category || '')}</span></div>
              </div>
            </div>
            <div class="job-review-body">
              <div class="job-review-stars" data-job-review-stars>
                ${[1,2,3,4,5].map((s)=>`<button type="button" class="star" data-star="${s}">&#9733;</button>`).join('')}
              </div>
              <textarea placeholder="Write a short review" data-job-review-comment></textarea>
              <div class="job-review-footer">
                <button type="button" class="btn-secondary fleece-secondary" data-job-review-close>Cancel</button>
                <button type="button" class="btn-primary" data-job-review-submit>Complete</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(shell);
        document.body.classList.add('job-modal-open');

        const closeButtons = shell.querySelectorAll('[data-job-review-close]');
        closeButtons.forEach((b) => b.addEventListener('click', () => {
          shell.remove();
          document.body.classList.remove('job-modal-open');
        }));

        let selectedRating = 0;
        shell.querySelectorAll('[data-star]').forEach((starBtn) => {
          starBtn.addEventListener('click', () => {
            selectedRating = Number(starBtn.getAttribute('data-star') || 0);
            shell.querySelectorAll('[data-star]').forEach((s)=> s.classList.toggle('is-selected', Number(s.getAttribute('data-star')) <= selectedRating));
          });
        });

        shell.querySelector('[data-job-review-submit]').addEventListener('click', async () => {
          const comment = (shell.querySelector('[data-job-review-comment]')?.value || '').trim();
          if (!selectedRating) {
            window.alert('Please choose a rating.');
            return;
          }
          try {
            await authHelper.markJobCompleted(job.id || job.jobId || '', application.id || application.applicationId || '');
            // attach review separately if supported
            await authHelper.markJobCompleted(job.id || job.jobId || '', application.id || application.applicationId || '', { rating: selectedRating, comment });
            showSuccessToast('Thanks — review saved');
            shell.remove();
            document.body.classList.remove('job-modal-open');
            await refreshMessages();
            window.dispatchEvent(new CustomEvent('worklinkup-job-badges-refresh'));
            window.dispatchEvent(new CustomEvent('worklinkup-job-updated'));
          } catch (err) {
            window.alert(err.message || 'Could not save review.');
          }
        });
      } catch (err) {
        // ignore
      }
    }

    async function refreshInboxAfterAuthSync() {
      const isEmbedded = getIsEmbedded();
      const sidebar = page.querySelector(".messages-sidebar");
      const thread = page.querySelector(".messages-thread");

      if (chatList) {
        chatList.innerHTML = Array.from({ length: 5 }).map(() => `
          <div class="messages-chat-item-skeleton">
            <div class="messages-chat-avatar-skeleton"></div>
            <div class="messages-chat-copy-skeleton">
              <div class="messages-chat-line-skeleton"></div>
              <div class="messages-chat-line-skeleton short"></div>
            </div>
          </div>
        `).join("");
      }

      if (threadBody && !state.activePeerUid) {
        threadBody.innerHTML = `
          <div class="messages-thread-skeleton">
            <div class="messages-thread-bubble-skeleton is-theirs"></div>
            <div class="messages-thread-bubble-skeleton is-mine"></div>
            <div class="messages-thread-bubble-skeleton is-theirs"></div>
          </div>
        `;
      }
      if (authSyncQueued) return;
      authSyncQueued = true;

      try {
        await startConversationSubscription();
        await refreshMessages();
        refreshSuggestions();
      } finally {
        authSyncQueued = false;
      }
    }

    searchInput?.addEventListener('input', async (event) => {
      state.query = event.target.value.trim();
      renderChatList();
      refreshSuggestions();
    });

    composeInput?.addEventListener('input', () => {
      refreshComposerState();
    });

    composeFileInput?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        clearPendingImage(false);
        renderComposePreview();
        refreshComposerState();
        return;
      }

      try {
        state.pendingImageData = await readImageAsBase64(file, {
          maxWidth: 1440,
          maxHeight: 1440,
          quality: 0.84
        });
        state.pendingImageName = file.name || 'Photo ready';
        renderComposePreview();
        refreshComposerState();
        scrollThreadToBottom(true);
      } catch (error) {
        clearPendingImage();
        window.alert(error.message || 'Could not process that image.');
      }
    });

    clearSearchBtn?.addEventListener('click', () => {
      state.query = '';
      if (searchInput instanceof HTMLInputElement) {
        searchInput.value = '';
        searchInput.focus();
      }
      renderChatList();
      refreshSuggestions();
    });

    focusSearchBtn?.addEventListener('click', () => {
      searchInput?.focus();
    });

    threadBody?.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-message-image]');
      if (!(trigger instanceof HTMLElement)) return;
      openMessageImageViewer(
        trigger.getAttribute('data-message-image-src') || '',
        trigger.getAttribute('data-message-image-name') || 'worklinkup-chat-image'
      );
    });

    mediaViewerClose?.addEventListener('click', () => {
      closeMessageImageViewer();
    });

    mediaViewer?.addEventListener('click', (event) => {
      if (event.target === mediaViewer) {
        closeMessageImageViewer();
      }
    });

    threadBackBtn?.addEventListener('click', async () => {
      setActiveConversation(null);
      await refreshMessages();
      renderChatList();
    });

    composeForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!state.activePeerUid) return;
      const text = composeInput?.value.trim() || '';
      const imageData = state.pendingImageData;
      if (!text && !imageData) return;
      const submitBtn = composeForm.querySelector('.messages-send-btn');
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
      try {
        await authHelper.sendMessageToProvider({
          toUid: state.activePeerUid,
          toProvinceSlug: state.activePeerProvince,
          toName: state.activePeerName,
          text,
          imageData
        });
        composeForm.reset();
        clearPendingImage();
        state.pendingDraft = '';
        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete('draft');
        window.history.replaceState({}, '', nextUrl.toString());
        refreshComposerState();
        scrollThreadToBottom(true);
        window.dispatchEvent(new CustomEvent('worklinkup-messages-badges-refresh'));
      } catch (error) {
        window.alert(error.message || 'Could not send message.');
      } finally {
        refreshComposerState();
      }
    });

    const handleAuthChanged = async (event) => {
      const nextUser = event?.detail?.user || null;
      if (!nextUser || nextUser.uid !== account.uid) return;
      await refreshInboxAfterAuthSync();
    };

    await startConversationSubscription();
    await refreshMessages();
    refreshSuggestions();
    refreshComposerState();

    window.addEventListener('softgiggles-auth-changed', handleAuthChanged);

    const handleViewerEscape = (event) => {
      if (event.key === 'Escape') {
        closeMessageImageViewer();
      }
    };

    window.addEventListener('keydown', handleViewerEscape);

    window.addEventListener('beforeunload', () => {
      window.removeEventListener('softgiggles-auth-changed', handleAuthChanged);
      window.removeEventListener('keydown', handleViewerEscape);
      stopConversationSubscription();
      stopMessagesSubscription();
    }, { once: true });
  }

  function buildSelectOptions(items = [], selected = '', placeholder = '') {
    const normalizedSelected = String(selected || '').trim();
    const placeholderMarkup = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
    return `${placeholderMarkup}${items.map((item) => {
      const value = String(item || '').trim();
      return `<option value="${escapeHtml(value)}" ${value === normalizedSelected ? 'selected' : ''}>${escapeHtml(value)}</option>`;
    }).join('')}`;
  }

  function buildSetupRepeaterRows(kind, items = []) {
    const safeItems = Array.isArray(items) && items.length ? items : [{}];
    return safeItems.map((item) => {
      if (kind === 'language') {
        return `
          <div class="account-setup-repeater-row" data-repeater-row="language">
            <select data-language-name>${buildSelectOptions(SOUTHERN_AFRICAN_LANGUAGES, item.name || '', 'Select language')}</select>
            <select data-language-level>${buildSelectOptions(['Basic', 'Conversational', 'Fluent', 'Native/Bilingual'], item.level || '', 'Level')}</select>
            <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove language"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      }

      if (kind === 'skill') {
        return `
          <div class="account-setup-repeater-row" data-repeater-row="skill">
            <input type="text" data-skill-name placeholder="Skill or expertise" value="${escapeHtml(String(item.name || ''))}" />
            <select data-skill-level>${buildSelectOptions(['Beginner', 'Intermediate', 'Pro'], item.level || '', 'Experience level')}</select>
            <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove skill"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      }

      if (kind === 'experience') {
        return `
          <div class="account-setup-repeater-row is-wide" data-repeater-row="experience">
            <input type="text" data-exp-role placeholder="Role or job title" value="${escapeHtml(String(item.role || ''))}" />
            <input type="text" data-exp-company placeholder="Business or client" value="${escapeHtml(String(item.company || ''))}" />
            <input type="text" data-exp-period placeholder="Period" value="${escapeHtml(String(item.period || ''))}" />
            <textarea data-exp-summary placeholder="What did you do there?">${escapeHtml(String(item.summary || ''))}</textarea>
            <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove experience"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      }

      if (kind === 'education') {
        return `
          <div class="account-setup-repeater-row is-wide" data-repeater-row="education">
            <input type="text" data-edu-school placeholder="School or institution" value="${escapeHtml(String(item.school || ''))}" />
            <input type="text" data-edu-qualification placeholder="Qualification" value="${escapeHtml(String(item.qualification || ''))}" />
            <input type="text" data-edu-period placeholder="Year or period" value="${escapeHtml(String(item.period || ''))}" />
            <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove education"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      }

      if (kind === 'certification') {
        return `
          <div class="account-setup-repeater-row" data-repeater-row="certification">
            <input type="text" data-cert-name placeholder="Certificate name" value="${escapeHtml(String(item.name || ''))}" />
            <input type="text" data-cert-issuer placeholder="Issuer" value="${escapeHtml(String(item.issuer || ''))}" />
            <input type="text" data-cert-year placeholder="Year" value="${escapeHtml(String(item.year || ''))}" />
            <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove certification"><i class="fa-solid fa-xmark"></i></button>
          </div>
        `;
      }

      return `
        <div class="account-setup-repeater-row" data-repeater-row="link">
          <input type="url" data-link-url placeholder="https://yourwebsite.com" value="${escapeHtml(String(item || ''))}" />
          <button type="button" class="account-setup-remove-row" data-remove-row aria-label="Remove link"><i class="fa-solid fa-xmark"></i></button>
        </div>
      `;
    }).join('');
  }

  function collectRows(container, rowSelector, mapper) {
    if (!(container instanceof HTMLElement)) return [];
    return Array.from(container.querySelectorAll(rowSelector))
      .map((row) => mapper(row))
      .filter(Boolean);
  }

  async function initializeAccountPageExperience(searchParams) {
    const guestStage = document.getElementById('account-guest-card');
    const setupStage = document.getElementById('account-setup-stage');
    const setupBody = document.querySelector('[data-account-setup-body]');
    const dashboard = document.getElementById('account-dashboard');
    
    // We strictly require setupStage and setupBody, but guestStage and dashboard can be safely null.
    if (!setupStage || !setupBody) return;

    const account = getStoredAccount();
    const params = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(window.location.search);
    const isEmbedded = getIsEmbedded(params);
    const isGoogleAuthFlow = Boolean(
      readSessionFlag('worklinkup_google_auth_flow')
      || readSessionFlag('worklinkup_google_redirect_pending')
      || readSessionFlag('worklinkup_google_redirect_success')
    );
    const isGoogleRedirectReturn = Boolean(
      readSessionFlag('worklinkup_google_redirect_pending')
      || readSessionFlag('worklinkup_google_redirect_success')
    );
    
    if (isEmbedded) {
      document.body.classList.add('account-embed-mode');
      if (guestStage) guestStage.hidden = true;
      if (dashboard) dashboard.hidden = true;
      setupStage.hidden = false;
      // Show a minimal loader while we check if they already have all their details
      setupBody.innerHTML = `
        <section class="account-setup-loading">
          <div class="account-setup-loading-spinner"></div>
          <h2>Checking profile...</h2>
        </section>
      `;
    }
    
    if (!isEmbedded && isGoogleRedirectReturn) {
      if (guestStage) guestStage.hidden = true;
      setupStage.hidden = false;
      if (dashboard) dashboard.hidden = true;
      setupBody.innerHTML = `
        <section class="account-setup-loading">
          <div class="account-setup-loading-spinner"></div>
          <h2>Signing you in</h2>
          <p>Finishing your Google sign-in and preparing your next step.</p>
        </section>
      `;
      window.addEventListener('softgiggles-auth-changed', () => {
        window.location.reload();
      }, { once: true });
      return;
    }
    
    if (!account?.loggedIn) {
      if (!isEmbedded) {
        if (guestStage) guestStage.hidden = false;
        setupStage.hidden = true;
        if (dashboard) dashboard.hidden = true;
        return;
      }
      window.addEventListener('softgiggles-auth-changed', () => {
        window.location.reload();
      }, { once: true });
      return;
    }

    if (guestStage) guestStage.hidden = true;
    setupStage.hidden = true;
    if (dashboard) dashboard.hidden = true;

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;

    const providerInviteService = params.get('service') || '';
    let userDoc = await authHelper.getUserDocument(account.uid).catch(() => null) || {};
    let providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug).catch(() => null);

    function fillDashboard() {
      const providerIdEl = document.getElementById('account-provider-id');
      const provinceEl = document.getElementById('account-profile-province');
      const whatsappEl = document.getElementById('account-profile-whatsapp');
      const experienceEl = document.getElementById('account-profile-experience');
      const categoryEl = document.getElementById('account-profile-category');
      const specialtyEl = document.getElementById('account-profile-specialty');
      const nameEl = document.getElementById('account-profile-name');
      const emailEl = document.getElementById('account-profile-email');
      const displayName = providerProfile?.displayName || userDoc?.name || account.name || 'WorkLinkUp User';
      const email = account.email || userDoc?.email || 'you@example.com';

      if (nameEl) nameEl.textContent = displayName;
      if (emailEl) emailEl.textContent = email;
      if (providerIdEl) providerIdEl.textContent = userDoc?.providerPublicId || providerProfile?.providerPublicId || 'Pending';
      if (provinceEl) provinceEl.textContent = userDoc?.providerProvince || providerProfile?.province || 'Not set';
      if (whatsappEl) whatsappEl.textContent = userDoc?.whatsappNumber || providerProfile?.whatsappNumber || 'Not set';
      if (experienceEl) experienceEl.textContent = userDoc?.experience || providerProfile?.experience || 'Not set';
      if (categoryEl) categoryEl.textContent = userDoc?.primaryCategory || providerProfile?.primaryCategory || 'Not set';
      if (specialtyEl) specialtyEl.textContent = getServiceListLabel(providerProfile || userDoc) || userDoc?.specialty || providerProfile?.specialty || 'Not set';
    }

    function getSetupStep() {
      // 1. Check for Username
      const hasUsername = Boolean(userDoc?.username);
      
      // 2. Check for Address / City (in userDoc or providerProfile)
      const hasAddress = Boolean(userDoc?.address || userDoc?.city || providerProfile?.address || providerProfile?.city);
      
      // 3. Check for Service / Specialty (in userDoc or providerProfile)
      const hasService = Boolean(userDoc?.specialty || providerProfile?.specialty || (providerProfile?.services && providerProfile.services.length > 0));

      // If they have all 3, the popup shouldn't even show (we skip straight to the dashboard/close)
      if (hasUsername && hasAddress && hasService) {
        return 'dashboard';
      }

      // Otherwise, route them to the missing step
      if (!hasUsername) return 'username';
      if (!userDoc?.userRole) return 'role';
      
      return 'provider'; // Missing address or service goes here
    }

    async function refreshState() {
      userDoc = await authHelper.getUserDocument(account.uid).catch(() => userDoc) || userDoc;
      providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug).catch(() => providerProfile);
    }

    async function renderCurrentStep() {
      const step = getSetupStep();
      const isGetFoundPage = /\/pages\/account\.html$/.test(window.location.pathname);
      const nextParams = new URLSearchParams();
      nextParams.set('setup', step === 'provider' ? 'provider' : '1');
      if (providerInviteService) nextParams.set('service', providerInviteService);

      if (!isEmbedded && isGetFoundPage && isGoogleAuthFlow) {
        clearSessionFlag('worklinkup_google_auth_flow');
        clearSessionFlag('worklinkup_google_redirect_pending');
        clearSessionFlag('worklinkup_google_redirect_success');

        if (step !== 'dashboard') {
          try {
            localStorage.setItem('worklinkup_pending_setup', `?${nextParams.toString()}`);
            setSessionFlag('worklinkup_show_setup_modal_once');
          } catch (error) {
            // Ignore storage issues.
          }
          window.location.replace(`${getBase()}index.html`);
          return;
        }

        const redirectUrl = String(userDoc?.userRole || '').trim() === 'provider'
          ? `${getBase()}pages/my-posts.html`
          : `${getBase()}pages/specialists.html`;
        window.location.replace(redirectUrl);
        return;
      }

      if (!isEmbedded && step !== 'dashboard') {
        try {
          localStorage.setItem('worklinkup_pending_setup', `?${nextParams.toString()}`);
        } catch (error) {
          // Ignore storage issues.
        }

        if (isGetFoundPage && typeof window.openWorkLinkUpSetupModal === 'function') {
          if (guestStage) guestStage.hidden = true;
          setupStage.hidden = true;
          if (dashboard) dashboard.hidden = true;
          if (!document.body.dataset.accountSetupModalOpen) {
            document.body.dataset.accountSetupModalOpen = '1';
            window.openWorkLinkUpSetupModal(`?${nextParams.toString()}`, {
              delayMs: 160
            });
          }
          return;
        }

        window.location.href = `${getBase()}index.html`;
        return;
      }

      if (guestStage) guestStage.hidden = true;
      setupStage.hidden = step === 'dashboard';
      if (dashboard) dashboard.hidden = step !== 'dashboard';

      if (step === 'dashboard') {
        const getProfileUrl = () => {
          if (String(userDoc?.userRole || '').trim() === 'provider') {
            const url = new URL(`${getBase()}pages/provider-profile.html`, window.location.origin);
            url.searchParams.set('uid', account.uid);
            url.searchParams.set('province', providerProfile?.provinceSlug || userDoc?.providerProvinceSlug || '');
            return url.toString();
          }
          return `${getBase()}pages/job-giver-profile.html`;
        };

        if (!isEmbedded && isGetFoundPage) {
          window.location.replace(getProfileUrl());
          return;
        }

        if (isEmbedded) {
          const redirectTarget = getProfileUrl();
          try {
            localStorage.removeItem('worklinkup_pending_setup');
          } catch (error) {
            // Ignore storage issues.
          }
          
          // INSTANTLY close the modal if they are already fully set up
          if (window !== window.parent) {
            window.parent?.postMessage({
              type: 'worklinkup-setup-complete',
              redirectUrl: redirectTarget
            }, '*');
          } else {
            window.dispatchEvent(new CustomEvent('worklinkup:setup-complete', { detail: { redirectUrl: redirectTarget } }));
          }
          return;
        }
        fillDashboard();
        return;
      }

      if (step === 'username') {
        setupBody.innerHTML = `
          <div class="account-setup-section">
            <div class="account-setup-section-item">
              <button type="button" class="account-setup-back-link" data-back-home><i class="fa-solid fa-arrow-left"></i><span>Back</span></button>
              <h2>Get your profile started</h2>
              <p>Add a username that is unique to you. This is how you'll appear to others on WorkLinkUp.</p>
            </div>
            <div class="account-setup-section-item">
              <form class="account-setup-compact-form" data-account-username-form>
                <label class="account-setup-field">
                  <span>Choose a username</span>
                  <input type="text" data-account-username-input value="${escapeHtml(userDoc?.username || '')}" placeholder="john_smith" />
                  <small>Build trust with your full name or business name. Usernames use letters, numbers, and underscores.</small>
                  <strong class="account-setup-field-message" data-account-username-message></strong>
                </label>
                <button type="submit" class="account-submit-btn account-submit-signup" data-account-username-submit disabled>
                  <span class="account-btn-label">Create my account</span>
                </button>
              </form>
            </div>
          </div>
        `;

        setupBody.querySelector('[data-back-home]')?.addEventListener('click', () => {
          window.location.href = `${getBase()}index.html`;
        });

        const usernameInput = setupBody.querySelector('[data-account-username-input]');
        const usernameMessage = setupBody.querySelector('[data-account-username-message]');
        const usernameSubmit = setupBody.querySelector('[data-account-username-submit]');
        let usernameTimer = 0;

        const validateUsername = async () => {
          if (!(usernameInput instanceof HTMLInputElement)) return false;
          const value = usernameInput.value.trim();
          if (!value) {
            usernameInput.classList.remove('is-valid');
            usernameInput.classList.add('is-invalid');
            if (usernameMessage) {
              usernameMessage.textContent = 'Choose a username before you continue.';
              usernameMessage.classList.add('is-error');
            }
            if (usernameSubmit instanceof HTMLButtonElement) usernameSubmit.disabled = true;
            return false;
          }

          const result = await authHelper.checkUsernameAvailability(value, account.uid);
          usernameInput.classList.toggle('is-invalid', !result.available);
          usernameInput.classList.toggle('is-valid', result.available);
          if (usernameMessage) {
            usernameMessage.textContent = result.available ? `@${result.normalized} is available` : (result.reason || 'That username is already taken.');
            usernameMessage.classList.toggle('is-error', !result.available);
            usernameMessage.classList.toggle('is-success', result.available);
          }
          if (usernameSubmit instanceof HTMLButtonElement) usernameSubmit.disabled = !result.available;
          return result.available;
        };

        usernameInput?.addEventListener('input', () => {
          window.clearTimeout(usernameTimer);
          usernameTimer = window.setTimeout(() => {
            validateUsername();
          }, 240);
        });

        setupBody.querySelector('[data-account-username-form]')?.addEventListener('submit', async (event) => {
          event.preventDefault();
          if (!await validateUsername()) return;
          if (!(usernameInput instanceof HTMLInputElement) || !(usernameSubmit instanceof HTMLButtonElement)) return;
          setButtonLoading(usernameSubmit, true);
          try {
            await authHelper.saveAccountSetup({
              username: usernameInput.value.trim(),
              displayName: userDoc?.name || account.name
            });
            await refreshState();
            await renderCurrentStep();
          } catch (error) {
            if (usernameMessage) {
              usernameMessage.textContent = error.message || 'Could not save that username.';
              usernameMessage.classList.add('is-error');
            }
            usernameInput.classList.add('is-invalid');
          } finally {
            setButtonLoading(usernameSubmit, false);
          }
        });

        // Initialize optional collapsible sections
        initializeOptionalSections(setupBody);

        return;
      }

      if (step === 'role') {
        setupBody.innerHTML = `
          <section class="account-setup-role-stage">
            <div class="account-setup-role-copy">
              <h2>${escapeHtml(userDoc?.username || account.name || 'WorkLinkUp user')}, your account has been created. What brings you to WorkLinkUp?</h2>
              <p>We'll tailor your experience to fit your needs.</p>
            </div>
            <div class="account-setup-role-grid">
              <button type="button" class="account-setup-role-card" data-role-card="client">
                <i class="fa-solid fa-magnifying-glass"></i>
                <strong>I am a client</strong>
                <span>I want to find providers and browse specialists.</span>
              </button>
              <button type="button" class="account-setup-role-card" data-role-card="provider">
                <i class="fa-solid fa-user-gear"></i>
                <strong>Service Provider</strong>
                <span>I want to list my services and get found by clients.</span>
              </button>
            </div>
            <div class="account-setup-role-actions">
              <button type="button" class="account-submit-btn account-submit-signup" data-role-next disabled><span class="account-btn-label">Next</span></button>
            </div>
          </section>
        `;

        let selectedRole = '';
        setupBody.querySelectorAll('[data-role-card]').forEach((card) => {
          card.addEventListener('click', () => {
            selectedRole = card.getAttribute('data-role-card') || '';
            setupBody.querySelectorAll('[data-role-card]').forEach((item) => item.classList.toggle('is-selected', item === card));
            const nextBtn = setupBody.querySelector('[data-role-next]');
            if (nextBtn instanceof HTMLButtonElement) nextBtn.disabled = !selectedRole;
          });
        });

        setupBody.querySelector('[data-role-next]')?.addEventListener('click', async (event) => {
          const nextBtn = event.currentTarget;
          if (!(nextBtn instanceof HTMLButtonElement) || !selectedRole) return;
          setButtonLoading(nextBtn, true);
          try {
            await authHelper.saveAccountSetup({
              username: userDoc?.username,
              userRole: selectedRole,
              displayName: userDoc?.name || account.name
            });
            await refreshState();
            if (selectedRole === 'client' && !isEmbedded) {
              window.location.href = `${getBase()}pages/specialists.html`;
              return;
            }
            await renderCurrentStep();
          } catch (error) {
            window.alert(error.message || 'Could not save your account type.');
          } finally {
            setButtonLoading(nextBtn, false);
          }
        });

        return;
      }

      const existingProvider = normalizeProvider(providerProfile || {
        displayName: userDoc?.name || account.name || '',
        province: userDoc?.providerProvince || 'Harare',
        username: userDoc?.username || '',
        specialty: providerInviteService || userDoc?.specialty || ''
      });
      const providerMediaState = {
        profileImageData: existingProvider.profileImageData || '',
        bannerImageData: existingProvider.bannerImageData || '',
        professionalDocuments: Array.isArray(existingProvider.professionalDocuments) ? existingProvider.professionalDocuments.slice() : []
      };
      const existingLocationValue = existingProvider.address || existingProvider.city || existingProvider.province || '';
      const existingServices = (() => {
        const savedServices = normalizeProviderServiceList(providerProfile?.services || []);
        if (savedServices.length) return savedServices;
        const fallbackService = providerInviteService || providerProfile?.specialty || userDoc?.specialty || '';
        if (!fallbackService) return [];
        return getProviderServiceList({
          primaryCategory: providerProfile?.primaryCategory || existingProvider.primaryCategory || '',
          specialty: fallbackService
        });
      })();

      setupBody.innerHTML = `
        <section class="account-provider-setup-stage">
          ${isEmbedded ? '' : `
            <div class="account-provider-setup-head">
              <span class="account-auth-stage-kicker">Service provider profile</span>
              <h2>Complete your provider account</h2>
              <p>Choose your location and the service clients should find you for. Start typing, then choose the best match.</p>
            </div>
          `}

          <form class="account-provider-form" data-account-provider-form novalidate>
            <div class="account-provider-grid provider-main-layout">
              <div class="account-provider-section-head">
                <strong>Provider details</strong>
                <span>Only these details are required now.</span>
              </div>
              <div class="account-provider-fields account-provider-minimal-fields">
                <label class="account-setup-field">
                  <span>Username</span>
                  <input type="text" value="${escapeHtml(userDoc?.username || existingProvider.username || '')}" disabled />
                  <small>Your username was already reserved for this account.</small>
                </label>
                <label class="account-setup-field account-typeahead-field">
                  <span>Location</span>
                  <input type="search" name="locationSearch" required value="${escapeHtml(existingLocationValue)}" placeholder="Type Masvingo, Rujeko, Chivi..." autocomplete="off" data-provider-location-input />
                  <div class="account-typeahead-list" data-provider-location-list hidden></div>
                  <small>Choose a city, suburb, district, or local service area in Zimbabwe.</small>
                </label>
                <label class="account-setup-field account-typeahead-field">
                  <span>Services you provide</span>
                  <input type="search" name="serviceSearch" value="" placeholder="Type plumber, hairdresser, cleaning..." autocomplete="off" data-provider-service-input />
                  <div class="account-typeahead-list" data-provider-service-list hidden></div>
                  <div class="account-service-chip-list" data-provider-service-chips></div>
                  <small>Add every service clients can hire you for. You can remove any service before saving.</small>
                </label>
              </div>
            </div>
            <input type="hidden" name="fullName" value="${escapeHtml(existingProvider.displayName || userDoc?.name || account.name || userDoc?.username || 'WorkLinkUp Provider')}" />
            <input type="hidden" name="whatsappNumber" value="${escapeHtml(existingProvider.whatsappNumber || account.phone || '')}" />
            <input type="hidden" name="province" value="${escapeHtml(existingProvider.province || '')}" data-provider-location-province />
            <input type="hidden" name="city" value="${escapeHtml(existingProvider.city || '')}" data-provider-location-city />
            <input type="hidden" name="address" value="${escapeHtml(existingProvider.address || '')}" data-provider-location-address />
            <input type="hidden" name="primaryCategory" value="${escapeHtml(existingProvider.primaryCategory || '')}" data-provider-service-category />
            <input type="hidden" name="specialty" value="${escapeHtml(existingProvider.specialty || providerInviteService || '')}" data-provider-service-name />
            <input type="hidden" name="title" value="${escapeHtml(existingProvider.title || existingProvider.specialty || providerInviteService || '')}" data-provider-service-title />
            <input type="hidden" name="experience" value="${escapeHtml(existingProvider.experience || '')}" />
            <input type="hidden" name="bio" value="${escapeHtml(existingProvider.bio || '')}" />

            <div class="account-provider-form-actions">
              <button type="submit" class="account-submit-btn account-submit-signup" data-account-provider-submit>
                <span class="account-btn-label">Complete provider account</span>
              </button>
            </div>
          </form>
        </section>
      `;

      const form = setupBody.querySelector('[data-account-provider-form]');
      if (!(form instanceof HTMLFormElement)) return;
      const profilePreview = setupBody.querySelector('[data-account-profile-preview]');
      const bannerPreview = setupBody.querySelector('[data-account-banner-preview]');
      const documentList = setupBody.querySelector('[data-account-document-list]');
      const profileInput = setupBody.querySelector('[data-account-profile-file]');
      const bannerInput = setupBody.querySelector('[data-account-banner-file]');
      const documentInput = setupBody.querySelector('[data-account-document-files]');
      const locationInput = form.querySelector('[data-provider-location-input]');
      const locationList = form.querySelector('[data-provider-location-list]');
      const serviceInput = form.querySelector('[data-provider-service-input]');
      const serviceList = form.querySelector('[data-provider-service-list]');
      const serviceChips = form.querySelector('[data-provider-service-chips]');
      const locationAddressField = form.querySelector('[data-provider-location-address]');

      const locationPicker = bindSetupTypeahead({
        input: locationInput,
        list: locationList,
        items: LOCATION_TYPEAHEAD_ITEMS,
        emptyText: 'No Zimbabwe location found',
        hiddenFields: {
          province: '[data-provider-location-province]',
          city: '[data-provider-location-city]'
        },
        onSelect: (item) => {
          if (locationAddressField instanceof HTMLInputElement) {
            locationAddressField.value = item.area ? `${item.area}, ${item.city}` : item.city;
          }
        }
      });

      const servicePicker = bindServiceMultiPicker({
        input: serviceInput,
        list: serviceList,
        chipHost: serviceChips,
        initialServices: existingServices,
        emptyText: 'No service found',
        onChange: (services) => syncPrimaryServiceFields(form, services)
      });

      updateUploadPreview(profilePreview, providerMediaState.profileImageData, 'avatar');
      updateUploadPreview(bannerPreview, providerMediaState.bannerImageData, 'banner');

      function renderDocumentList() {
        if (!(documentList instanceof HTMLElement)) return;
        documentList.innerHTML = providerMediaState.professionalDocuments.length
          ? providerMediaState.professionalDocuments.map((documentItem, index) => `
            <article class="account-provider-doc-card">
              <div>
                <strong>${escapeHtml(documentItem.name)}</strong>
                <span>${escapeHtml(documentItem.kind === 'image' ? 'Image document' : 'PDF document')}</span>
              </div>
              <button type="button" data-remove-document="${index}"><i class="fa-solid fa-xmark"></i></button>
            </article>
          `).join('')
          : '<div class="account-provider-doc-empty">No professional documents uploaded yet.</div>';
      }

      renderDocumentList();

      profileInput?.addEventListener('change', async () => {
        const file = profileInput.files?.[0];
        if (!file) return;
        providerMediaState.profileImageData = await readImageAsBase64(file, {
          maxWidth: 720,
          maxHeight: 720,
          quality: 0.84,
          outputType: 'image/avif'
        });
        updateUploadPreview(profilePreview, providerMediaState.profileImageData, 'avatar');
      });

      bannerInput?.addEventListener('change', async () => {
        const file = bannerInput.files?.[0];
        if (!file) return;
        providerMediaState.bannerImageData = await readImageAsBase64(file, {
          maxWidth: 1600,
          maxHeight: 900,
          quality: 0.82,
          outputType: 'image/avif'
        });
        updateUploadPreview(bannerPreview, providerMediaState.bannerImageData, 'banner');
      });

      documentInput?.addEventListener('change', async () => {
        const files = Array.from(documentInput.files || []);
        for (const file of files) {
          let data = '';
          let kind = 'pdf';
          if (file.type.startsWith('image/')) {
            data = await readImageAsBase64(file, {
              maxWidth: 1800,
              maxHeight: 1800,
              quality: 0.82,
              outputType: 'image/avif'
            });
            kind = 'image';
          } else {
            data = await readFileAsDataUrl(file);
          }

          providerMediaState.professionalDocuments.push({
            id: `${Date.now()}_${file.name}`,
            name: file.name,
            mimeType: data.match(/^data:([^;]+);/)?.[1] || file.type || 'application/pdf',
            kind,
            data
          });
        }
        documentInput.value = '';
        renderDocumentList();
      });

      documentList?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-remove-document]');
        if (!(button instanceof HTMLElement)) return;
        const index = Number(button.getAttribute('data-remove-document') || -1);
        if (index >= 0) {
          providerMediaState.professionalDocuments.splice(index, 1);
          renderDocumentList();
        }
      });

      function bindAddRow(selector, kind, containerSelector) {
        setupBody.querySelector(selector)?.addEventListener('click', () => {
          const host = setupBody.querySelector(containerSelector);
          if (!(host instanceof HTMLElement)) return;
          host.insertAdjacentHTML('beforeend', buildSetupRepeaterRows(kind, [{}]));
        });
      }

      bindAddRow('[data-add-language]', 'language', '[data-language-list]');
      bindAddRow('[data-add-skill]', 'skill', '[data-skill-list]');
      bindAddRow('[data-add-experience]', 'experience', '[data-experience-list]');
      bindAddRow('[data-add-education]', 'education', '[data-education-list]');
      bindAddRow('[data-add-certification]', 'certification', '[data-certification-list]');
      bindAddRow('[data-add-link]', 'link', '[data-link-list]');

      setupBody.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('[data-remove-row]');
        if (!(removeBtn instanceof HTMLElement)) return;
        const row = removeBtn.closest('.account-setup-repeater-row');
        row?.remove();
      });

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector('[data-account-provider-submit]');
        const requiredFields = Array.from(form.querySelectorAll('input[required], select[required], textarea[required]'));
        let hasErrors = false;

        requiredFields.forEach((field) => {
          if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) return;
          const invalid = !field.value.trim();
          field.classList.toggle('is-invalid', invalid);
          hasErrors = hasErrors || invalid;
        });

        const selectedLocation = locationPicker.getSelection();
        const selectedServices = servicePicker.getSelections();
        locationPicker.setInvalid(!selectedLocation);
        servicePicker.setInvalid(!selectedServices.length);
        hasErrors = hasErrors || !selectedLocation || !selectedServices.length;

        const languages = collectRows(form.querySelector('[data-language-list]'), '[data-repeater-row="language"]', (row) => {
          const name = String(row.querySelector('[data-language-name]')?.value || '').trim();
          const level = String(row.querySelector('[data-language-level]')?.value || '').trim();
          return name && level ? { name, level } : null;
        });
        const skills = collectRows(form.querySelector('[data-skill-list]'), '[data-repeater-row="skill"]', (row) => {
          const name = String(row.querySelector('[data-skill-name]')?.value || '').trim();
          const level = String(row.querySelector('[data-skill-level]')?.value || '').trim();
          return name ? { name, level } : null;
        });

        if (hasErrors) {
          form.querySelector('.is-invalid, input[required], select[required], textarea[required]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const workExperience = collectRows(form.querySelector('[data-experience-list]'), '[data-repeater-row="experience"]', (row) => {
          const role = String(row.querySelector('[data-exp-role]')?.value || '').trim();
          const company = String(row.querySelector('[data-exp-company]')?.value || '').trim();
          const period = String(row.querySelector('[data-exp-period]')?.value || '').trim();
          const summary = String(row.querySelector('[data-exp-summary]')?.value || '').trim();
          return role || company || summary ? { role, company, period, summary } : null;
        });
        const education = collectRows(form.querySelector('[data-education-list]'), '[data-repeater-row="education"]', (row) => {
          const school = String(row.querySelector('[data-edu-school]')?.value || '').trim();
          const qualification = String(row.querySelector('[data-edu-qualification]')?.value || '').trim();
          const period = String(row.querySelector('[data-edu-period]')?.value || '').trim();
          return school || qualification ? { school, qualification, period } : null;
        });
        const certifications = collectRows(form.querySelector('[data-certification-list]'), '[data-repeater-row="certification"]', (row) => {
          const name = String(row.querySelector('[data-cert-name]')?.value || '').trim();
          const issuer = String(row.querySelector('[data-cert-issuer]')?.value || '').trim();
          const year = String(row.querySelector('[data-cert-year]')?.value || '').trim();
          return name || issuer ? { name, issuer, year } : null;
        });
        const portfolioLinks = collectRows(form.querySelector('[data-link-list]'), '[data-repeater-row="link"]', (row) => {
          const value = String(row.querySelector('[data-link-url]')?.value || '').trim();
          return value || null;
        });

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        const primaryService = selectedServices[0];
        const selectedServiceName = primaryService.service || primaryService.category;
        
        const getSafeConfig = (label) => {
          return SPECIALIST_CATEGORIES.find((cat) => cat.label === label) || SPECIALIST_CATEGORIES[0] || { label: 'Specialist', image: '' };
        };

        payload.fullName = userDoc?.name || account.name || existingProvider.displayName || userDoc?.username || 'WorkLinkUp Provider';
        payload.username = userDoc?.username || '';
        payload.province = selectedLocation.province;
        payload.city = selectedLocation.city;
        payload.address = selectedLocation.area ? `${selectedLocation.area}, ${selectedLocation.city}` : selectedLocation.city;
        payload.services = selectedServices;
        payload.primaryCategory = primaryService.category;
        payload.specialty = selectedServiceName;
        payload.title = getServiceListLabel(selectedServices) || selectedServiceName;
        payload.bio = String(payload.bio || existingProvider.bio || '').trim()
          || `I provide ${selectedServiceName} services in ${payload.address}.`;
        payload.languages = languages.length ? languages : existingProvider.languages;
        payload.skills = skills.length ? skills : (existingProvider.skills.length ? existingProvider.skills : [{ name: selectedServiceName, level: 'Intermediate' }]);
        payload.workExperience = workExperience.length ? workExperience : existingProvider.workExperience;
        payload.education = education.length ? education : existingProvider.education;
        payload.certifications = certifications.length ? certifications : existingProvider.certifications;
        payload.portfolioLinks = portfolioLinks.length ? portfolioLinks : existingProvider.portfolioLinks;
        payload.profileImageData = providerMediaState.profileImageData || getSafeConfig(primaryService.category)?.image || '';
        payload.bannerImageData = providerMediaState.bannerImageData || 'images/sections/findme.avif';
        payload.professionalDocuments = providerMediaState.professionalDocuments;

        if (submitBtn instanceof HTMLButtonElement) setButtonLoading(submitBtn, true);
        try {
          await authHelper.saveProviderProfile(payload);
          showSuccessToast('Profile completed successfully!');
          await refreshState();
          window.history.replaceState({}, '', `${window.location.pathname}`);
          
          const isEmbedded = getIsEmbedded(params);
          
          if (isEmbedded) {
            const savedUid = account.uid;
            const savedProvince = providerProfile?.provinceSlug || userDoc?.providerProvinceSlug || account.providerProvinceSlug || '';
            const redirectTarget = `pages/provider-profile.html?uid=${encodeURIComponent(savedUid)}&province=${encodeURIComponent(savedProvince)}`;
            if (window !== window.parent) {
              window.parent?.postMessage({ type: 'worklinkup-setup-complete', redirectUrl: redirectTarget }, '*');
            } else {
              window.dispatchEvent(new CustomEvent('worklinkup:setup-complete', { detail: { redirectUrl: redirectTarget } }));
            }
            return;
          }
          
          const getBaseFn = typeof window.getSiteBasePath === 'function' ? window.getSiteBasePath() : '/';
          window.location.href = `${getBaseFn}pages/provider-profile.html`;
        } catch (error) {
          console.error('Provider profile save error:', error);
          window.alert(error.message || 'Could not save your provider profile.');
        } finally {
          if (submitBtn instanceof HTMLButtonElement) setButtonLoading(submitBtn, false);
        }
      });
    }

    await renderCurrentStep();
  }

  function initialize() {
    setupOnboarding();
    renderSpecialistsPage();
    renderCategoriesPage();
    renderProviderProfilePage();
    renderEditProfilePage();
    renderPostsPage();
    renderMessagesPage();
    initializeAccountPageExperience();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  window.WorkLinkUpProviders = {
    initializeAccountPageExperience
  };
})();
