// shared-header.js - injected into all pages

if (!Array.isArray(window.WorkLinkUpServiceCatalog) || !window.WorkLinkUpServiceCatalog.length) {
  window.WorkLinkUpServiceCatalog = [
    { key: 'home-services', label: 'Home Services', icon: 'fa-solid fa-house-chimney', image: 'images/categories/homesrvices_converted.avif', subservices: ['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Handyman', 'Tiler', 'Plasterer', 'Ceiling Installer', 'Roof Repairer', 'Gutter Cleaner', 'Waterproofing Specialist', 'Damp Proofer', 'Window & Door Installer', 'Fence Builder', 'Bricklayer / Concreter', 'Floor Polisher', 'Burglar Bar Installer', 'Curtain & Blind Fitter', 'Gate & Garage Door Installer', 'Solar Panel Installer', 'Borehole Driller', 'Water Tank Installer', 'Septic Tank Services', 'Chimney Cleaner', 'Pest Control', 'Pool Cleaner & Maintenance'] },
    { key: 'gardening-landscaping', label: 'Gardening & Landscaping', icon: 'fa-solid fa-seedling', image: 'images/categories/farmer_converted.avif', subservices: ['General Gardener', 'Lawn Mower', 'Tree Feller', 'Tree Trimmer & Pruner', 'Hedge Trimmer', 'Irrigation Installer', 'Landscape Designer', 'Flower Planting', 'Vegetable Garden Setup', 'Weed Control', 'Garden Clean-Up', 'Topsoil & Sand Delivery', 'Compost Supplier'] },
    { key: 'cleaning-services', label: 'Cleaning Services', icon: 'fa-solid fa-broom', image: 'images/categories/cleaning_converted.avif', subservices: ['Domestic Worker / Housekeeper', 'Laundry & Ironing Service', 'Carpet Cleaner', 'Deep House Cleaning', 'Office Cleaning', 'Post-Construction Cleaning', 'Mattress Cleaning', 'Upholstery Cleaning', 'Window Cleaning', 'Move-in / Move-out Cleaning'] },
    { key: 'plumbing-detailed', label: 'Plumbing', icon: 'fa-solid fa-faucet-drip', image: 'images/categories/plumber_converted.avif', subservices: ['Leak Repairs', 'Blocked Drains', 'Pipe Installation', 'Geyser / Water Heater Installation', 'Toilet & Bathroom Fitting', 'Borehole Pump Repairs', 'Water Tank Plumbing', 'Irrigation Pipe Laying'] },
    { key: 'electrical-detailed', label: 'Electrical', icon: 'fa-solid fa-bolt', image: 'images/categories/electrician_converted.avif', subservices: ['Wiring & Rewiring', 'DB Board Installation', 'Prepaid Meter Installation', 'Solar System Installation', 'Inverter & Battery Setup', 'Security Lighting', 'Generator Installation & Servicing', 'CCTV & Intercom Wiring', 'Electric Fence Installation', 'Appliance Installation'] },
    { key: 'beauty-wellness', label: 'Beauty & Wellness', icon: 'fa-solid fa-spa', image: 'images/categories/beauty_converted.avif', subservices: ['Hairdresser', 'Barber', 'Makeup Artist', 'Nail Technician', 'Massage Therapist', 'Eyebrow Threading & Shaping', 'Eyelash Technician', 'Braiding & Hair Weaving', 'Loc / Dreadlock Maintenance', 'Waxing Specialist', 'Facial & Skincare Specialist', 'Body Scrub & Spa Treatments', 'Tattoo Artist', 'Piercing Specialist', 'Henna / Mehendi Artist'] },
    { key: 'clothing-textiles', label: 'Clothing & Textiles', icon: 'fa-solid fa-shirt', image: 'images/categories/clothing_converted.avif', subservices: ['Tailor / Dressmaker', 'Alterations & Repairs', 'School Uniform Maker', 'Traditional Attire Maker', 'Embroidery Specialist', 'T-shirt Printing', 'Curtain & Upholstery Sewing', 'Shoe Cobbler / Repairs', 'Shoe Polisher', 'Leather Goods Maker', 'Bag Maker & Repairs', 'Hat Maker', 'Knitting & Crochet Services'] },
    { key: 'food-catering', label: 'Food & Catering', icon: 'fa-solid fa-utensils', image: 'images/categories/catering_converted.avif', subservices: ['Private Chef', 'Event Caterer', 'Wedding Caterer', 'Food Delivery (homemade)', 'Baking & Cake Making', 'Bread Baker', 'Traditional Food Cooking (sadza, muriwo, etc.)', 'Braai / Nyama Choma Service', 'Meal Prep Service', 'Lunch Box Supplier (for offices/schools)', 'Juice & Smoothie Maker', 'Ice Cream Vendor', 'Peanut Butter Maker', 'Jam & Pickle Maker', 'Dried Fish Seller', 'Maheu / Fermented Drink Maker', 'Confectionery & Sweet Maker'] },
    { key: 'transport-logistics', label: 'Transport & Logistics', icon: 'fa-solid fa-truck-fast', image: 'images/categories/transport_converted.avif', subservices: ['Taxi / Ride-hailing Driver', 'Kombi / Minibus Driver', 'Goods Transport (truck / bakkie)', 'Motorbike Courier / Delivery', 'Bicycle Courier', 'Moving & Relocation Services', 'Car Hire / Chauffeur', 'Airport Transfer Driver', 'School Transport / Pickup', 'Tractor Hire (for farming)', 'Wheelbarrow Transport (market to home)', 'Boat / Canoe Transport (Zambezi, Lake Kariba areas)'] },
    { key: 'automotive-vehicles', label: 'Automotive & Vehicles', icon: 'fa-solid fa-car-side', image: 'images/categories/automech_converted.avif', subservices: ['Mechanic (general)', 'Auto Electrician', 'Panel Beater & Spray Painter', 'Tyre Fitting & Repair', 'Wheel Alignment', 'Car Wash', 'Interior Car Cleaning / Detailing', 'Windscreen Repair & Replacement', 'Roadside Assist / Breakdown', 'Motorcycle Mechanic', 'Bicycle Repair', 'Truck & Heavy Vehicle Mechanic', 'Fuel Delivery'] },
    { key: 'agriculture-farming', label: 'Agriculture & Farming', icon: 'fa-solid fa-tractor', image: 'images/categories/farmer_converted.avif', subservices: ['Ploughing / Tractor Operator', 'Crop Planting', 'Weeding', 'Harvesting', 'Irrigation Setup', 'Poultry Farming Consultant', 'Livestock Handler', 'Animal Dipping', 'Veterinary Services', 'Pest & Disease Control (crops)', 'Greenhouse Setup', 'Seed Supplier', 'Fertiliser Distributor', 'Grain Milling', 'Beekeeping / Honey Production', 'Fish Farming Setup', 'Mushroom Farming', 'Market Garden Supplier', 'Tobacco Grading'] },
    { key: 'construction-building', label: 'Construction & Building', icon: 'fa-solid fa-building', image: 'images/categories/construction_converted.avif', subservices: ['Architect / Drafter', 'Building Contractor', 'Quantity Surveyor', 'Bricklayer', 'Concreter', 'Steel & Structural Fabricator', 'Scaffolding Erector', 'Crane Operator', 'Demolition Specialist', 'Road & Paving Layer', 'Paving & Driveway Installer', 'Swimming Pool Builder', 'Stonemason', 'Tank Stand Builder'] },
    { key: 'security-services', label: 'Security Services', icon: 'fa-solid fa-shield-halved', image: 'images/categories/security_converted.avif', subservices: ['Security Guard', 'Alarm System Installer', 'CCTV Installation', 'Electric Fence Installer', 'Gate & Access Control Setup', 'Patrol & Response Service', 'VIP Protection / Bodyguard', 'Cash in Transit', 'Event Security', 'Dog Handler / K9 Security'] },
    { key: 'digital-business', label: 'Digital & Business', icon: 'fa-solid fa-laptop-code', image: 'images/categories/digital_converted.avif', subservices: ['Programmer / Software Developer', 'Web Designer', 'Graphic Designer', 'App Developer', 'Social Media Manager', 'Content Creator', 'Copywriter', 'Data Analyst', 'IT Support / Technician', 'Network & Wi-Fi Setup', 'Laptop & Phone Repairer', 'Printer & Copier Technician', 'CCTV & Networking Technician', 'Digital Marketing Consultant', 'E-commerce Setup', 'SEO Specialist', 'UI/UX Designer', 'Video Editor', 'Podcast Editor'] },
    { key: 'photography-videography', label: 'Photography & Videography', icon: 'fa-solid fa-camera-retro', image: 'images/categories/photographer_converted.avif', subservices: ['Wedding Photographer', 'Events Photographer', 'Brand & Corporate Shoots', 'Product Photography', 'Portrait Photography', 'School Photography', 'Videographer', 'Drone Photographer', 'Video Production', 'Photo Editing & Retouching', 'Photo Printing Services'] },
    { key: 'tutoring-education', label: 'Tutoring & Education', icon: 'fa-solid fa-graduation-cap', image: 'images/categories/tutor_converted.avif', subservices: ['Maths Tutor', 'Science Tutor', 'English Tutor', 'Shona / Ndebele Language Tutor', 'History Tutor', 'Exam Prep (O & A Level)', 'Primary School Tutor', 'Special Needs Tutor', 'Music Teacher', 'Art Teacher', 'Computer & Coding Teacher', 'Driving Instructor', 'Sign Language Instructor', 'Adult Literacy Tutor', 'University Assignment Help'] },
    { key: 'childcare-family', label: 'Childcare & Family', icon: 'fa-solid fa-children', image: 'images/categories/childcare_converted.avif', subservices: ['Babysitter', 'Nanny', 'After-school Care', 'Child Minder (daytime)', 'Au Pair', 'Special Needs Carer', 'Elderly Carer', 'Home Nurse / Caregiver', 'Disability Assistant'] },
    { key: 'health-medical', label: 'Health & Medical', icon: 'fa-solid fa-heart-pulse', image: 'images/categories/health_converted.avif', subservices: ['Nurse (private visits)', 'Home-based Care Worker', 'Physiotherapist', 'Nutritionist / Dietitian', 'Midwife', "Traditional Healer / N'anga", 'Herbalist', 'First Aid Trainer', 'Mental Health Counsellor', 'HIV Counsellor', 'Optician', 'Hearing Aid Specialist', 'Wheelchair & Mobility Aid Repairer', 'Blood Pressure & Sugar Testing (community)'] },
    { key: 'events-entertainment', label: 'Events & Entertainment', icon: 'fa-solid fa-music', image: 'images/categories/events_converted.avif', subservices: ['Event Planner / Coordinator', 'Wedding Planner', 'DJ', 'MC / Emcee', 'Live Band', 'Traditional Dancer / Mbira Player', 'Acrobat / Entertainer', 'Sound & PA System Hire', 'Tent & Chair Hire', 'Decor & Floral Arrangement', 'Bouncy Castle Hire', 'Clown / Kids Entertainer', 'Photo Booth Hire', 'Confectionery & Cake Display', 'Event Cleaning Crew'] },
    { key: 'printing-stationery', label: 'Printing & Stationery', icon: 'fa-solid fa-print', image: 'images/categories/printing_converted.avif', subservices: ['Flyer & Poster Printing', 'Business Card Printing', 'Banner & Signage Printing', 'Branded Merchandise', 'Rubber Stamp Maker', 'Booklet & Brochure Printing', 'Graduation & Certificate Printing', 'ID Badge Printing', 'Vehicle Branding / Wrapping', 'Embroidery & Uniform Branding'] },
    { key: 'furniture-metalwork', label: 'Furniture & Metalwork', icon: 'fa-solid fa-couch', image: 'images/categories/furnicher_converted.avif', subservices: ['Furniture Maker (wood)', 'Furniture Repairer / Restorer', 'Upholsterer', 'Welder', 'Metal Fabricator', 'Blacksmith', 'Aluminium Fabricator (windows, doors)', 'Mattress Maker & Repairer', 'Second-hand Furniture Dealer'] },
    { key: 'appliance-electronics-repair', label: 'Appliance & Electronics Repair', icon: 'fa-solid fa-tv', image: 'images/categories/automech_converted.avif', subservices: ['Fridge & Freezer Repair', 'Washing Machine Repair', 'TV & Electronics Repair', 'Phone Screen Replacement', 'Phone Unlocking & Flashing', 'Radio & Satellite Dish Repair', 'Generator Repair', 'Solar Equipment Repair', 'Air Conditioner Service & Repair', 'Water Pump Repair'] },
    { key: 'financial-legal-services', label: 'Financial & Legal Services', icon: 'fa-solid fa-scale-balanced', image: 'images/categories/finance_converted.avif', subservices: ['Accountant', 'Bookkeeper', 'Tax Consultant', 'Payroll Services', 'Business Registration Consultant', 'Legal Advisor / Paralegal', 'Notary Services', 'Debt Collector', 'Insurance Agent', 'Money Transfer Agent', 'Loan Facilitator (microfinance)', 'Financial Planner'] },
    { key: 'real-estate-property', label: 'Real Estate & Property', icon: 'fa-solid fa-house-user', image: 'images/categories/property_converted.avif', subservices: ['Property Agent', 'Property Manager', 'Valuer', 'Auctioneer', 'House Sitter', 'Caretaker / Estate Manager', 'Land Surveyor'] },
    { key: 'religious-community-services', label: 'Religious & Community Services', icon: 'fa-solid fa-hands-praying', image: 'images/categories/religion_converted.avif', subservices: ['Pastor / Preacher for Hire (events)', 'Church Musician / Organist', 'Funeral Director', 'Coffin Maker', 'Grave Digger', 'Mourning & Burial Support Services', 'Memorial Photographer'] },
    { key: 'animal-pet-services', label: 'Animal & Pet Services', icon: 'fa-solid fa-paw', image: '', subservices: ['Veterinarian', 'Dog Groomer', 'Dog Walker', 'Pet Sitter', 'Animal Trainer', 'Livestock Buyer / Auctioneer', 'Snake / Pest Removal Specialist', 'Poultry Vaccinator', 'Farrier (horse hoof care)'] },
    { key: 'water-environment', label: 'Water & Environment', icon: 'fa-solid fa-droplet', image: 'images/categories/water_converted.avif', subservices: ['Water Delivery (bowser / tank)', 'Borehole Drilling', 'Water Pump Installation', 'Water Treatment & Purification', 'Refuse Removal', 'Recycling Collector', 'Environmental Consultant', 'Firewood Supplier', 'Charcoal Maker & Supplier'] },
    { key: 'informal-street-level-services', label: 'Informal & Street-Level Services', icon: 'fa-solid fa-store', image: 'images/categories/informal_converted.avif', subservices: ['Shoe Polisher', 'Street Barber', 'Street Food Vendor', 'Fruit & Vegetable Seller', 'Ice Block Seller', 'Airtime & Data Vendor', 'Phone Charging Station', 'Key Cutter', 'Clothes Ironing (street)', 'Bicycle Taxi (Scotch cart / cycle)', 'Porter / Carrier (market)', 'Trolley Pusher (supermarket areas)', 'Odd Jobs / General Labour', 'Car Guard', 'Parking Attendant', 'Queue Manager', "Form Filler / Scribe (for those who can't write)", 'Photocopying & Scanning (corner shops)', 'Typist / Letter Writer'] }
  ];
}

function getWorkLinkUpServiceCatalog() {
  return Array.isArray(window.WorkLinkUpServiceCatalog) ? window.WorkLinkUpServiceCatalog : [];
}

const WORKLINKUP_CATEGORY_SHORT_LABELS = {
  'Home Services': 'Home',
  'Gardening & Landscaping': 'Gardening',
  'Cleaning Services': 'Cleaning',
  'Plumbing': 'Plumbing',
  'Electrical': 'Electrical',
  'Beauty & Wellness': 'Beauty',
  'Clothing & Textiles': 'Clothing',
  'Food & Catering': 'Catering',
  'Transport & Logistics': 'Transport',
  'Automotive & Vehicles': 'Automotive',
  'Agriculture & Farming': 'Agriculture',
  'Construction & Building': 'Construction',
  'Security Services': 'Security',
  'Digital & Business': 'Digital',
  'Photography & Videography': 'Photography',
  'Tutoring & Education': 'Tutoring',
  'Childcare & Family': 'Childcare',
  'Health & Medical': 'Health',
  'Events & Entertainment': 'Events',
  'Printing & Stationery': 'Printing',
  'Furniture & Metalwork': 'Furniture',
  'Appliance & Electronics Repair': 'Repairs',
  'Financial & Legal Services': 'Finance',
  'Real Estate & Property': 'Property',
  'Religious & Community Services': 'Religious',
  'Animal & Pet Services': 'Pets',
  'Water & Environment': 'Water',
  'Informal & Street-Level Services': 'Informal'
};

window.WorkLinkUpServiceCatalog = getWorkLinkUpServiceCatalog().map((category) => ({
  ...category,
  shortLabel: category.shortLabel || WORKLINKUP_CATEGORY_SHORT_LABELS[category.label] || category.label
}));

function getBasePath() {
  // Determine relative path based on current page location
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function findCategoryByServiceLabel(serviceLabel = '') {
  const normalized = String(serviceLabel || '').trim().toLowerCase();
  if (!normalized) return null;
  return getWorkLinkUpServiceCatalog().find((category) => {
    const services = Array.isArray(category.subservices) ? category.subservices : [];
    return services.some((service) => String(service || '').trim().toLowerCase() === normalized);
  }) || null;
}

function buildWorkLinkUpSearchHref(searchTerm = '', options = {}) {
  const base = typeof options.base === 'string' ? options.base : getBasePath();
  const params = new URLSearchParams();
  const category = String(options.category || '').trim();
  const service = String(options.service || '').trim();
  const query = String(options.query || searchTerm || '').trim();

  if (query) params.set('query', query);
  if (category) params.set('category', category);
  if (service) params.set('service', service);

  const queryString = params.toString();
  return `${base}pages/search-results.html${queryString ? `?${queryString}` : ''}`;
}

window.buildWorkLinkUpSearchHref = buildWorkLinkUpSearchHref;
// Keep the legacy name for existing callers, but route searches to the search page.
const buildWorkLinkUpSpecialistsHref = buildWorkLinkUpSearchHref;
window.buildWorkLinkUpSpecialistsHref = buildWorkLinkUpSpecialistsHref;

function getStoredAccount() {
  try {
    const raw = localStorage.getItem('softgiggles_account');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getInstallPromptUserKey() {
  const account = getStoredAccount();
  const uid = String(account?.loggedIn && account?.uid ? account.uid : 'guest').trim() || 'guest';
  return `maworks_install_prompt_state_${uid}`;
}

function readInstallPromptState() {
  try {
    const raw = localStorage.getItem(getInstallPromptUserKey());
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      clickedAt: Number(parsed?.clickedAt || 0),
      installedAt: Number(parsed?.installedAt || 0)
    };
  } catch (error) {
    return {
      clickedAt: 0,
      installedAt: 0
    };
  }
}

function writeInstallPromptState(nextState = {}) {
  const currentState = readInstallPromptState();
  const payload = {
    clickedAt: Number(nextState.clickedAt || currentState.clickedAt || 0),
    installedAt: Number(nextState.installedAt || currentState.installedAt || 0)
  };

  try {
    localStorage.setItem(getInstallPromptUserKey(), JSON.stringify(payload));
  } catch (error) {
    // Ignore storage issues and keep the prompt usable.
  }

  return payload;
}

function isRunningStandalone() {
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone
  );
}

function ensurePwaHeadAssets() {
  const base = getBasePath();
  const head = document.head;
  if (!head) return;

  const ensureLink = (selector, attributes) => {
    let node = head.querySelector(selector);
    if (!(node instanceof HTMLLinkElement)) {
      node = document.createElement('link');
      head.appendChild(node);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  };

  const ensureMeta = (selector, attributes) => {
    let node = head.querySelector(selector);
    if (!(node instanceof HTMLMetaElement)) {
      node = document.createElement('meta');
      head.appendChild(node);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  };

  ensureLink('link[rel="manifest"]', {
    rel: 'manifest',
    href: `${base}manifest.webmanifest`
  });
  ensureLink('link[rel="apple-touch-icon"]', {
    rel: 'apple-touch-icon',
    href: `${base}images/pwa/maworks-icon-180.png`
  });
  ensureMeta('meta[name="theme-color"]', {
    name: 'theme-color',
    content: '#1A3263'
  });
  ensureMeta('meta[name="apple-mobile-web-app-capable"]', {
    name: 'apple-mobile-web-app-capable',
    content: 'yes'
  });
  ensureMeta('meta[name="apple-mobile-web-app-status-bar-style"]', {
    name: 'apple-mobile-web-app-status-bar-style',
    content: 'default'
  });
  ensureMeta('meta[name="apple-mobile-web-app-title"]', {
    name: 'apple-mobile-web-app-title',
    content: 'MaWorks'
  });
}

function registerMaWorksServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (!(window.isSecureContext || ['localhost', '127.0.0.1'].includes(window.location.hostname))) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${getBasePath()}sw.js`).catch(() => {
      // Leave the site usable even when service worker registration fails.
    });
  }, { once: true });
}

ensurePwaHeadAssets();
registerMaWorksServiceWorker();

window.worklinkupInstallPrompt = window.worklinkupInstallPrompt || {
  deferredPrompt: null,
  isInstalled: isRunningStandalone() || Boolean(readInstallPromptState().installedAt),
  readState: readInstallPromptState,
  writeState: writeInstallPromptState
};

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  window.worklinkupInstallPrompt.deferredPrompt = event;
  window.dispatchEvent(new CustomEvent('worklinkup-install-available'));
});

window.addEventListener('appinstalled', () => {
  window.worklinkupInstallPrompt.isInstalled = true;
  window.worklinkupInstallPrompt.deferredPrompt = null;
  writeInstallPromptState({ installedAt: Date.now() });
  window.dispatchEvent(new CustomEvent('worklinkup-install-complete'));
});

function getJobNotificationStorageKey(uid = '') {
  return `worklinkup_job_notification_state_${String(uid || '').trim()}`;
}

function readJobNotificationState(uid = '') {
  try {
    const raw = localStorage.getItem(getJobNotificationStorageKey(uid));
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      receivedAt: Number(parsed?.receivedAt || 0),
      placedAt: Number(parsed?.placedAt || 0)
    };
  } catch (error) {
    return {
      receivedAt: 0,
      placedAt: 0
    };
  }
}

function getPlacedBidNotificationTime(bid = {}) {
  return Math.max(
    Number(bid.statusChangedAtMs || 0),
    Number(bid.updatedAtMs || 0),
    Number(bid.createdAtMs || 0)
  );
}

function pageNeedsProvidersUi(pathname = window.location.pathname) {
  return /\/pages\/(specialists|provider-profile|client-profile|my-posts|messages|account|categories|edit-profile|post-job|job-posts|job-giver-profile)\.html$/.test(pathname);
}

function hasPendingAuthBootstrapState() {
  try {
    return Boolean(
      sessionStorage.getItem('worklinkup_google_redirect_pending')
      || sessionStorage.getItem('worklinkup_google_redirect_success')
      || localStorage.getItem('worklinkup_pending_setup')
    );
  } catch (error) {
    return false;
  }
}

function pageNeedsEagerAuth(pathname = window.location.pathname) {
  return /\/pages\/(specialists|provider-profile|client-profile|my-posts|messages|account|edit-profile|post-job|job-posts|job-giver-profile)\.html$/.test(pathname)
    || (pathname.endsWith('/index.html') || pathname === '/' || pathname === '') && hasPendingAuthBootstrapState();
}

function ensureFirebaseAuthScript() {
  if (window.softGigglesAuth) {
    return Promise.resolve(window.softGigglesAuth);
  }

  if (window.__worklinkAuthPromise) {
    return window.__worklinkAuthPromise;
  }

  window.__worklinkAuthPromise = new Promise((resolve, reject) => {
    let moduleScript = document.getElementById('firebase-auth-script');

    function resolveAuthHelper() {
      if (window.softGigglesAuth) {
        resolve(window.softGigglesAuth);
        return true;
      }
      return false;
    }

    if (resolveAuthHelper()) return;

    if (!moduleScript) {
      moduleScript = document.createElement('script');
      moduleScript.type = 'module';
      moduleScript.id = 'firebase-auth-script';
      moduleScript.src = `${getBasePath()}js/firebase-auth.js`;
      document.body.appendChild(moduleScript);
    }

    moduleScript.addEventListener('load', () => {
      if (resolveAuthHelper()) return;

      const startedAt = Date.now();
      const intervalId = window.setInterval(() => {
        if (resolveAuthHelper()) {
          window.clearInterval(intervalId);
          return;
        }

        if (Date.now() - startedAt > 10000) {
          window.clearInterval(intervalId);
          reject(new Error('Auth helper did not load in time.'));
        }
      }, 120);
    }, { once: true });

    moduleScript.addEventListener('error', () => {
      reject(new Error('Could not load auth script.'));
    }, { once: true });
  });

  return window.__worklinkAuthPromise;
}

function ensureProvidersUiScript() {
  if (window.__worklinkProvidersPromise) {
    return window.__worklinkProvidersPromise;
  }

  window.__worklinkProvidersPromise = new Promise((resolve, reject) => {
    let uiScript = document.getElementById('providers-ui-script');
    if (!uiScript) {
      uiScript = document.createElement('script');
      uiScript.id = 'providers-ui-script';
      uiScript.src = `${getBasePath()}js/providers-ui.js`;
      document.body.appendChild(uiScript);
    }

    uiScript.addEventListener('load', () => resolve(true), { once: true });
    uiScript.addEventListener('error', () => reject(new Error('Could not load provider UI script.')), { once: true });
  });

  return window.__worklinkProvidersPromise;
}

window.ensureWorkLinkAuth = ensureFirebaseAuthScript;

function getProviderProfileHref(base = getBasePath()) {
  const account = getStoredAccount();
  const isLoggedIn = Boolean(account && account.loggedIn);
  return isLoggedIn && account?.providerProfileComplete && account?.uid && account?.providerProvinceSlug
    ? `${base}pages/provider-profile.html?uid=${encodeURIComponent(account.uid)}&province=${encodeURIComponent(account.providerProvinceSlug)}`
    : `${base}pages/client-profile.html`;
}

function getJobsAndBidsHref(base = getBasePath()) {
  return `${base}pages/job-giver-profile.html`;
}

function getAccountSettingsHref(base = getBasePath()) {
  return `${base}pages/account.html#account-settings`;
}

function renderAccountMenuContent({
  accountName = 'WorkLinkUp User',
  profileHref = '#',
  jobsAndBidsHref = '#',
  settingsHref = '#',
  base = getBasePath(),
  isProvider = false,
  includeBadges = false
} = {}) {
  return `
    <div class="account-dropdown-greeting">Hi, ${accountName}</div>
    <a href="${profileHref}" class="account-dropdown-item">
      <i class="fa-regular fa-user"></i>
      <span>My Profile</span>
    </a>
    <a href="${jobsAndBidsHref}" class="account-dropdown-item">
      <i class="fa-solid fa-briefcase"></i>
      <span>Jobs and Bids</span>
      ${includeBadges ? '<span class="account-dropdown-badge" data-account-jobs-badge-dropdown hidden>0</span>' : ''}
    </a>
    ${isProvider ? `
      <a href="${base}pages/my-posts.html" class="account-dropdown-item">
        <i class="fa-regular fa-images"></i>
        <span>My Posts</span>
      </a>
    ` : ''}
    <a href="${base}pages/messages.html" class="account-dropdown-item">
      <i class="fa-regular fa-message"></i>
      <span>Messages</span>
      ${includeBadges ? '<span class="account-dropdown-badge" data-account-messages-badge-dropdown hidden>0</span>' : ''}
    </a>
    <a href="${settingsHref}" class="account-dropdown-item">
      <i class="fa-solid fa-sliders"></i>
      <span>Settings</span>
    </a>
    <button type="button" class="account-dropdown-logout">Log Out</button>
  `;
}

function getMobileBottomNavActiveKey() {
  const pathname = window.location.pathname || '';
  const searchParams = new URLSearchParams(window.location.search);
  const account = getStoredAccount();
  const currentUid = String(account?.uid || '').trim();
  const viewedUid = String(searchParams.get('uid') || '').trim();

  if (
    pathname === '/'
    || pathname === ''
    || pathname.endsWith('/index.html')
  ) {
    return 'home';
  }

  if (/\/pages\/job-posts\.html$/.test(pathname)) {
    return 'jobs';
  }

  if (/\/pages\/(specialists|categories|search-results)\.html$/.test(pathname)) {
    return 'services';
  }

  if (/\/pages\/client-profile\.html$/.test(pathname)) {
    return 'profile';
  }

  if (/\/pages\/provider-profile\.html$/.test(pathname)) {
    return currentUid && viewedUid && currentUid === viewedUid ? 'profile' : 'services';
  }

  if (/\/pages\/(job-giver-profile|post-job|my-posts|messages)\.html$/.test(pathname)) {
    return 'bids';
  }

  if (/\/pages\/(account|edit-profile)\.html$/.test(pathname)) {
    return 'profile';
  }

  return '';
}

function renderMobileBottomNav(base = getBasePath()) {
  const account = getStoredAccount();
  const isLoggedIn = Boolean(account && account.loggedIn);
  const accountName = account && account.name ? account.name : 'WorkLinkUp User';
  const profileHref = getProviderProfileHref(base);
  const jobsAndBidsHref = getJobsAndBidsHref(base);
  const settingsHref = getAccountSettingsHref(base);
  const isProvider = account?.userRole === 'provider';
  const activeKey = getMobileBottomNavActiveKey();
  const navItems = [
    { key: 'home', label: 'Home', href: `${base}index.html`, icon: 'fa-solid fa-house' },
    { key: 'jobs', label: 'Jobs', href: `${base}pages/job-posts.html`, icon: 'fa-solid fa-briefcase' },
    { key: 'services', label: 'Services', href: `${base}pages/specialists.html`, icon: 'fa-solid fa-user-group' },
    { key: 'bids', label: 'Bids', href: jobsAndBidsHref, icon: 'fa-solid fa-file-signature' }
  ];

  return `
    <div class="mobile-bottom-nav-shell" role="navigation" aria-label="Mobile primary">
      <div class="mobile-bottom-nav-list">
        ${navItems.map((item) => {
          const isActive = item.key === activeKey;
          return `
            <a href="${item.href}" class="mobile-bottom-nav-link ${isActive ? 'is-active' : ''}" ${isActive ? 'aria-current="page"' : ''}>
              <i class="${item.icon}" aria-hidden="true"></i>
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
        ${isLoggedIn ? `
          <button type="button" class="mobile-bottom-nav-link ${activeKey === 'profile' ? 'is-active' : ''}" data-mobile-profile-toggle ${activeKey === 'profile' ? 'aria-current="page"' : ''} aria-haspopup="dialog" aria-expanded="false">
            <i class="fa-solid fa-user" aria-hidden="true"></i>
            <span>Profile</span>
          </button>
        ` : `
          <a href="#" class="mobile-bottom-nav-link account-guest-open ${activeKey === 'profile' ? 'is-active' : ''}" ${activeKey === 'profile' ? 'aria-current="page"' : ''}>
            <i class="fa-solid fa-user" aria-hidden="true"></i>
            <span>Profile</span>
          </a>
        `}
      </div>
      ${isLoggedIn ? `
        <div class="mobile-bottom-profile-overlay" data-mobile-profile-overlay hidden></div>
        <div class="mobile-bottom-profile-panel" data-mobile-profile-panel hidden aria-hidden="true">
          <div class="mobile-bottom-profile-card" role="dialog" aria-modal="true" aria-label="Profile menu">
            <button type="button" class="mobile-bottom-profile-close" data-mobile-profile-close aria-label="Close profile menu">
              <i class="fa-solid fa-xmark"></i>
            </button>
            ${renderAccountMenuContent({
              accountName,
              profileHref,
              jobsAndBidsHref,
              settingsHref,
              base,
              isProvider,
              includeBadges: false
            })}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderHeader() {
  const base = getBasePath();
  const isMessagesPage = /\/pages\/messages\.html$/.test(window.location.pathname);
  const account = getStoredAccount();
  const isLoggedIn = Boolean(account && account.loggedIn);
  const accountName = account && account.name ? account.name : 'WorkLinkUp User';
  const firstName = accountName.split(' ')[0];
  const profileHref = getProviderProfileHref(base);
  const jobsAndBidsHref = getJobsAndBidsHref(base);
  const settingsHref = getAccountSettingsHref(base);
  const isProvider = account?.userRole === 'provider';
  const categoryHref = (label) => buildWorkLinkUpSpecialistsHref(label, { base, category: label, query: label });
  const serviceHref = (label, categoryLabel = '') => {
    const matchedCategory = categoryLabel || findCategoryByServiceLabel(label)?.label || '';
    return buildWorkLinkUpSpecialistsHref(label, { base, category: matchedCategory, service: label, query: label });
  };
  const desktopNavLinks = `
    <a href="${base}index.html" class="nav-link">Home</a>
    <a href="${base}pages/categories.html" class="nav-link">Categories</a>
    <a href="${base}pages/specialists.html" class="nav-link">Service Providers</a>
    <a href="${base}pages/post-job.html" class="nav-link promo">Post Job</a>
  `;
  const mobileNavItems = `
      <div class="nav-item">
        <a href="${base}index.html" class="nav-link">Home</a>
      </div>
      <div class="nav-item">
        <a href="${base}pages/categories.html" class="nav-link">Categories</a>
      </div>
      <div class="nav-item">
        <a href="${base}pages/specialists.html" class="nav-link">Service Providers</a>
      </div>
      <div class="nav-item">
        <a href="${base}pages/post-job.html" class="nav-link promo">Post Job</a>
      </div>
  `;
  return `
  <header>
    <div class="header-inner">
      <div class="mobile-header-left">
        <a href="${base}index.html" class="logo" aria-label="WorkLinkUp home">
          <img src="${base}images/logo/logo.jpg" alt="WorkLinkUp" class="logo-image" />
          <span class="logo-wordmark" aria-hidden="true">
            <span class="logo-work">Work</span><span class="logo-link">Link</span>
          </span>
        </a>
      </div>
      <nav class="header-center-nav" aria-label="Primary navigation">
        ${desktopNavLinks}
      </nav>
      <div class="header-actions">
        <button class="mobile-search-trigger" type="button" aria-label="Open search">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <circle cx="11" cy="11" r="7.5"/><path d="M20 20l-4.2-4.2"/>
          </svg>
        </button>
        <div class="account-menu-host ${isLoggedIn ? 'is-logged-in' : 'is-logged-out'}">
          ${isLoggedIn ? '' : `
            <a href="#" class="a-plus-btn account-trigger" data-account-trigger="a-plus">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="4"/></svg>
              Create Profile
            </a>
          `}
          <a href="${isLoggedIn ? profileHref : '#'}" class="account-trigger account-link" data-account-trigger="account">
            <span class="account-trigger-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span class="account-job-badge" data-account-jobs-badge hidden>0</span>
            </span>
            ${isLoggedIn ? firstName : 'Account'}
          </a>
          ${isLoggedIn ? `
            <div class="account-dropdown" aria-hidden="true">
              ${renderAccountMenuContent({
                accountName,
                profileHref,
                jobsAndBidsHref,
                settingsHref,
                base,
                isProvider,
                includeBadges: true
              })}
            </div>
          ` : ''}
        </div>
        ${isMessagesPage ? '' : `
          <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
              <path d="M4 7h16M4 12h16M4 17h16"/>
            </svg>
          </button>
        `}
      </div>
    </div>
  </header>
  ${isMessagesPage ? '' : `<div class="mobile-nav-overlay" aria-hidden="true"></div>`}
  <div class="mobile-search-overlay" id="mobile-search-overlay" hidden>
    <div class="mobile-search-panel" aria-modal="true" role="dialog" aria-labelledby="mobile-search-title">
      <div class="mobile-search-head">
        <div class="search-bar mobile-search-toast-bar">
          <span class="search-icon" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </span>
          <input type="text" placeholder="Search services, trades, or people" data-search-context="overlay" />
        </div>
        <button type="button" class="mobile-search-close" aria-label="Close search">×</button>
      </div>
      <div class="mobile-search-copy">
        <h3 id="mobile-search-title">Search WorkLinkUp</h3>
        <p>Find specialists by service, provider name, or city.</p>
      </div>
      <div class="mobile-search-results" id="mobile-search-results"></div>
    </div>
  </div>
  ${isMessagesPage ? '' : `
  <nav id="site-nav">
    <button class="mobile-nav-close" type="button" aria-label="Close menu">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    </button>
    <a href="${base}index.html" class="mobile-nav-brand" aria-label="WorkLinkUp home">
      <img src="${base}images/logo/logo.jpg" alt="WorkLinkUp" class="logo-image" />
      <span class="logo-wordmark" aria-hidden="true">
        <span class="logo-work">Work</span><span class="logo-link">Link</span>
      </span>
    </a>
    <div class="nav-inner">
      ${mobileNavItems}
    </div>
  </nav>`}
  ${renderMobileBottomNav(base)}`;
}

function renderAccountPanel() {
  const base = getBasePath();
  const account = getStoredAccount();
  const accountEmail = account && account.email ? account.email : 'you@example.com';
  return `
  <div class="account-auth-overlay" id="account-auth-overlay" hidden>
    <aside class="account-auth-panel" aria-modal="true" role="dialog" aria-labelledby="account-auth-title">
      <button type="button" class="account-auth-close" aria-label="Close account panel">×</button>
      <div class="account-auth-copy">
        <div class="account-brand-lockup" aria-hidden="true">
          <img src="${base}images/logo/logo.jpg" alt="" class="account-brand-logo" />
          <span class="account-brand-wordmark">
            <span class="logo-work">Work</span><span class="logo-link">Link</span>
          </span>
        </div>
        <h2 id="account-auth-title" class="account-auth-heading">Welcome</h2>
        <p class="account-auth-subtext">Create an account or sign in to continue with WorkLinkUp.</p>
      </div>
      <div class="account-auth-methods">
        <section class="account-auth-method-card account-method-email">
          <div class="account-method-label">Sign In Options</div>
          <div class="account-email-form-wrap is-open">
            <form class="account-email-form" id="account-email-form">
              <div class="account-form-error" data-account-form-error hidden></div>
              <div class="account-form-row account-name-row" hidden>
                <label for="account-name">Full name</label>
                <input id="account-name" name="name" type="text" placeholder="Tinashe Moyo" />
              </div>
              <div class="account-auth-identifier-switch" data-account-identifier-switch>
                <button type="button" class="account-identifier-option is-active" data-account-identifier-option="email">Email</button>
                <button type="button" class="account-identifier-option" data-account-identifier-option="username">Username</button>
              </div>
              <div class="account-form-row">
                <label for="account-email" data-account-identifier-label>Email address</label>
                <input id="account-email" name="identifier" type="email" placeholder="you@example.com" required />
              </div>
              <div class="account-form-row">
                <label for="account-password">Password</label>
                <input id="account-password" name="password" type="password" placeholder="Enter password" required />
              </div>
              <button type="button" class="account-forgot-password account-form-inline-link">Forgot password?</button>
              <button type="submit" class="account-submit-btn account-submit-signin">
                <span class="account-btn-label">Sign In</span>
              </button>
            </form>
          </div>
        </section>
      </div>
      <div class="account-auth-secondary">
        <button type="button" class="account-auth-btn account-google-btn">
          <span class="google-mark" aria-hidden="true">
            <svg class="google-g" viewBox="0 0 18 18" focusable="false">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.94v2.33A9 9 0 0 0 9 18Z" />
              <path fill="#FBBC05" d="M3.95 10.71A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.71V4.96H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.04l3.01-2.33Z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.63 8.63 0 0 0 9 0 9 9 0 0 0 .94 4.96l3.01 2.33C4.66 5.16 6.65 3.58 9 3.58Z" />
            </svg>
          </span>
          <span class="account-btn-label">Sign in with Google</span>
        </button>
        <p class="account-auth-switch-copy">
          <span class="account-switch-label">Joining us for the first time?</span>
          <button type="button" class="account-mode-switch">Create Account</button>
        </p>
      </div>
      <p class="account-auth-note">By continuing, you agree to our Terms and Privacy Policy.</p>
      <input type="hidden" id="account-mode" value="signin" />
      <input type="hidden" id="account-identifier-mode" value="email" />
      <input type="hidden" id="account-stored-email" value="${accountEmail}" />
    </aside>
  </div>
  <div class="account-success-toast" id="account-success-toast" hidden>
    <div class="account-success-toast-inner">
      <i class="fa-solid fa-check"></i>
      <span>Signed in successfully</span>
    </div>
  </div>`;
}

function renderFooter() {
  const base = getBasePath();
  return `
  <footer>
    <div class="footer-inner">
      <div class="footer-col">
        <h4>For Clients</h4>
        <ul>
          <li><a href="${base}index.html#for-clients">Find someone for a job</a></li>
          <li><a href="${base}index.html#service-types">Browse service types</a></li>
          <li><a href="${base}index.html#how-it-works">See how hiring works</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>For Workers</h4>
        <ul>
          <li><a href="${base}pages/account.html">Create your profile</a></li>
          <li><a href="${base}index.html#for-workers">Show your services</a></li>
          <li><a href="${base}index.html#launch-roadmap">Follow new features</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Popular Work</h4>
        <ul>
          <li><a href="${base}index.html#service-types">Gardening</a></li>
          <li><a href="${base}index.html#service-types">Plumbing</a></li>
          <li><a href="${base}index.html#service-types">Hair & Nails</a></li>
          <li><a href="${base}index.html#service-types">Therapy & Wellness</a></li>
          <li><a href="${base}index.html#service-types">Programming & Design</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Zimbabwe Focus</h4>
        <ul>
          <li><a href="${base}index.html#cities">Harare</a></li>
          <li><a href="${base}index.html#cities">Bulawayo</a></li>
          <li><a href="${base}index.html#cities">Mutare</a></li>
          <li><a href="${base}index.html#cities">Gweru</a></li>
          <li><a href="${base}index.html#cities">Chitungwiza</a></li>
        </ul>
      </div>
      <div class="newsletter-col">
        <h4>Follow the Build</h4>
        <p>WorkLinkUp starts with profiles and discovery. Reviews, bookings, and safer payments can be added as the platform grows.</p>
        <div class="email-form">
          <input type="email" placeholder="Enter email address" />
          <button>→</button>
        </div>
        <p style="font-size:12px;color:rgba(232,226,219,0.74);margin-top:10px;">Launch updates only. By subscribing you agree to our <a href="#" style="color:var(--brand-gold);">Privacy Policy</a>.</p>
      </div>
    </div>
    <div class="work-footer-highlights">
      <span class="work-footer-highlight"><i class="fa-solid fa-location-dot"></i> Built for Zimbabwe</span>
      <span class="work-footer-highlight"><i class="fa-solid fa-user-check"></i> Local worker profiles</span>
      <span class="work-footer-highlight"><i class="fa-solid fa-briefcase"></i> Everyday jobs and skilled services</span>
    </div>
    <div class="footer-bottom">
      <div class="footer-links">
        <a href="#">Terms &amp; Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Cookie Policy</a>
        <a href="#">Community Guidelines</a>
      </div>
      <div class="social-area">
        <div class="social-links">
          <a href="#" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="#" title="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a>
        </div>
        <a href="${base}pages/admin/dashboard.html" class="footer-admin-link" title="Admin console" aria-label="Open admin console">
          <i class="fa-solid fa-key"></i>
        </a>
      </div>
    </div>
  </footer>`;
}

function renderCookieBanner() {
  return `
  <div class="cookie-banner" id="cookie-banner" hidden>
    <p>
      We use cookies to improve the WorkLinkUp experience. If you continue to use our site, you are agreeing to our
      <a href="#" class="cookie-link">Cookie Policy</a>.
    </p>
    <div class="cookie-actions">
      <button type="button" class="cookie-btn cookie-accept">OK</button>
      <button type="button" class="cookie-btn cookie-decline">Decline</button>
    </div>
  </div>`;
}

function injectSharedHeaderOverrides() {
  if (document.getElementById('worklinkup-runtime-overrides')) return;

  const style = document.createElement('style');
  style.id = 'worklinkup-runtime-overrides';
  style.textContent = `
    #site-header > header { position: relative; z-index: 2; }
    #site-header .header-inner { max-width: none; width: 100%; padding: 0 28px; display: flex !important; align-items: center; gap: 18px; height: 72px; }
    #site-header .mobile-header-left { display: flex; align-items: center; gap: 14px; min-width: 0; flex: 0 0 auto; }
    #site-header .logo { align-items: center; gap: 12px; font-size: 0; white-space: nowrap; }
    #site-header .logo-image { height: 34px; width: auto; }
    #site-header .logo-wordmark { display: inline-flex; align-items: baseline; font-size: 31px; font-weight: 800; line-height: 1; letter-spacing: -0.06em; }
    #site-header .logo-work { color: #076fe5; }
    #site-header .logo-link { color: rgba(7, 111, 229, 0.42); }
    #site-header nav.header-center-nav { min-width: 0; margin-left: auto; display: flex !important; flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: flex-end; gap: 6px; background: transparent !important; border: 0 !important; box-shadow: none !important; position: static !important; z-index: auto !important; width: auto; }
    #site-header .header-center-nav .nav-link { display: inline-flex; align-items: center; justify-content: center; padding: 10px 14px; font-size: 14px; font-weight: 700; border-radius: 999px; border-bottom: 0; }
    #site-header .header-center-nav .nav-link::after { display: none !important; }
    .search-bar { border-color: rgba(15, 23, 42, 0.10); background: rgba(255, 255, 255, 0.96); }
    .search-bar:focus-within { border-color: rgba(26, 115, 232, 0.42); box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08); }
    .search-match { color: #1a73e8; background: transparent; }
    #site-header .header-actions { display: flex !important; align-items: center; justify-content: flex-end; gap: 18px; margin-left: 24px; flex: 0 0 auto; }
    #site-header .account-menu-host { display: flex; align-items: center; gap: 14px; }
    #site-header .account-link { display: inline-flex; flex-direction: row; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; white-space: nowrap; }
    .header-actions a, .mobile-search-trigger, .mobile-menu-toggle { color: var(--text-muted); }
    .header-actions a:hover, .mobile-search-trigger:hover, .mobile-menu-toggle:hover { color: #076fe5; }
    .header-how-link { display: inline-flex; }
    .mobile-search-trigger { display: none; }
    .mobile-search-overlay[hidden] { display: none !important; }
    .mobile-search-overlay { position: fixed; inset: 0; z-index: 1750; padding: 80px 12px 16px; background: rgba(15, 23, 42, 0.18); backdrop-filter: blur(16px); opacity: 0; pointer-events: none; transition: opacity 0.24s ease; }
    .mobile-search-overlay.is-visible { opacity: 1; pointer-events: auto; }
    .mobile-search-panel { width: min(100%, 620px); margin: 0 auto; background: #fff; border: 1px solid rgba(15, 23, 42, 0.10); border-radius: 24px; box-shadow: 0 20px 44px rgba(15, 23, 42, 0.14); overflow: hidden; transform: translateY(20px) scale(0.98); opacity: 0; transform-origin: top center; transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease; }
    .mobile-search-overlay.is-visible .mobile-search-panel { transform: translateY(0) scale(1); opacity: 1; }
    .mobile-search-head { display: flex; align-items: center; gap: 12px; padding: 14px; }
    .mobile-search-toast-bar { max-width: none; width: 100%; transform: scale(0.98); transform-origin: top center; transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1); }
    .mobile-search-overlay.is-visible .mobile-search-toast-bar { transform: scale(1); }
    .mobile-search-close { border: none; background: transparent; color: #132647; font-size: 30px; line-height: 1; padding: 0; }
    .mobile-search-copy { padding: 0 18px 10px; }
    .mobile-search-results { display: grid; gap: 0; padding: 0 10px 12px; max-height: min(62vh, 470px); overflow-y: auto; }
    .mobile-search-result { border: none; border-radius: 14px; background: transparent; padding: 12px 14px; }
    body.mobile-search-open { overflow: hidden; }
    .a-plus-btn { background: #076fe5; box-shadow: 0 14px 30px rgba(7, 111, 229, 0.22); }
    .a-plus-btn:hover, .a-plus-btn:focus-visible { background: #0558b8 !important; }
    .account-auth-panel { width: min(32vw, 470px); min-width: 360px; padding: 30px 20px 24px; border-radius: 20px 0 0 20px; }
    .account-auth-copy { text-align: left; margin: 28px 0 18px; }
    .account-brand-lockup { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .account-brand-logo { width: auto; height: 26px; }
    .account-brand-wordmark { display: inline-flex; align-items: baseline; font-size: 29px; font-weight: 800; line-height: 1; letter-spacing: -0.06em; }
    .account-email-form-wrap, .account-email-form-wrap.is-open { max-height: none; opacity: 1; margin-top: 0; overflow: visible; }
    .account-auth-method-card,
    .account-auth-btn,
    .account-submit-btn,
    .account-form-row input,
    .account-inline-actions button,
    .account-google-btn,
    .account-search-result,
    .account-auth-close { border-radius: 4px; }
    .account-auth-method-card { border-radius: 4px; }
    .account-form-row input { border-radius: 4px; }
    .account-auth-btn,
    .account-submit-btn { border-radius: 4px; }
    .account-form-inline-link { justify-self: start; border: none; background: transparent; padding: 0; color: #076fe5; font-size: 14px; font-weight: 700; }
    .account-auth-switch-copy { display: flex; align-items: center; gap: 6px; margin: 2px 0 0; text-align: left; }
    .account-switch-label { color: #64748b; }
    .account-mode-switch { border: none; background: transparent; padding: 0; color: #076fe5; font-weight: 800; }
    .account-submit-btn.account-submit-signin { background: linear-gradient(180deg, #076fe5 0%, #0558b8 100%); }
    .account-submit-btn.account-submit-signup { background: linear-gradient(180deg, #0f84ff 0%, #076fe5 100%); color: #fff; }
    .account-submit-btn.has-jimu-loader .account-btn-label { opacity: 0; }
    @media (min-width: 769px) {
      #site-nav { display: none !important; }
    }
    @media (max-width: 768px) {
      #site-header .header-inner { height: 60px; padding: 0 16px; display: grid !important; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; }
      #site-header .logo { gap: 8px; }
      #site-header .logo-wordmark { font-size: 22px; }
      #site-header .logo-image { height: 22px; }
      #site-header nav.header-center-nav, #site-header .header-how-link { display: none !important; }
      #site-header .account-link { gap: 0; font-size: 0; }
      .mobile-search-trigger { display: inline-flex; }
      .header-actions { gap: 12px; }
      .header-actions a, .mobile-search-trigger, .mobile-menu-toggle { font-size: 0; gap: 0; }
      .mobile-search-overlay { padding: 68px 10px 14px; }
      .mobile-search-panel { width: calc(100vw - 20px); border-radius: 24px; }
      .mobile-search-results { max-height: calc(100vh - 220px); }
      .account-auth-panel { width: 100%; min-width: 0; padding: 24px 16px 20px; border-radius: 20px 20px 0 0; }
      .account-brand-wordmark { font-size: 24px; }
      .account-auth-switch-copy { align-items: flex-start; flex-direction: column; gap: 2px; }
    }
  `;

  document.head.appendChild(style);
}

function renderCartDrawer() {
  const base = getBasePath();
  return `
  <div class="cart-drawer-overlay" id="cart-drawer-overlay" hidden>
    <aside class="cart-drawer" aria-modal="true" role="dialog" aria-labelledby="cart-drawer-title">
      <div class="cart-drawer-header">
        <h2 id="cart-drawer-title">Shopping Cart</h2>
        <button type="button" class="cart-drawer-close" aria-label="Close cart">×</button>
      </div>
      <div class="cart-drawer-progress">
        <div class="cart-progress-track">
          <span class="cart-progress-fill"></span>
        </div>
        <p class="cart-progress-copy">Spend R 460.05 more and receive free delivery.</p>
      </div>
      <div class="cart-drawer-body" data-cart-drawer-items></div>
      <div class="cart-drawer-footer">
        <div class="cart-drawer-subtotal">
          <span>Subtotal</span>
          <strong data-cart-subtotal>R 0.00</strong>
        </div>
        <div class="cart-drawer-actions">
          <a href="${base}pages/cart.html" class="cart-drawer-view-btn">View cart</a>
          <a href="${base}pages/checkout.html" class="cart-drawer-checkout-btn">Checkout</a>
        </div>
      </div>
    </aside>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const installPromptState = window.worklinkupInstallPrompt || {};
  const installPromptDelayMs = 10000;
  const installPromptClosedForSessionKey = 'maworks_install_prompt_closed';
  const isIosSafari = /iphone|ipad|ipod/i.test(window.navigator.userAgent || '')
    && /safari/i.test(window.navigator.userAgent || '')
    && !/crios|fxios|edgios|android/i.test(window.navigator.userAgent || '');
  let installPromptDelayElapsed = false;
  let installPromptModal = null;
  let installPromptMessage = null;
  let installPromptButton = null;
  let installPromptTimerId = 0;

  function getInstallPromptModalState() {
    return typeof installPromptState.readState === 'function'
      ? installPromptState.readState()
      : { clickedAt: 0, installedAt: 0 };
  }

  function updateInstallPromptModalCopy(mode = 'default') {
    if (!(installPromptMessage instanceof HTMLElement) || !(installPromptButton instanceof HTMLButtonElement)) return;

    if (mode === 'ios') {
      installPromptMessage.innerHTML = 'Tap <strong>Share</strong> in Safari, then choose <strong>Add to Home Screen</strong> to install MaWorks.';
      installPromptButton.textContent = 'Got it';
      return;
    }

    installPromptMessage.textContent = 'Download MaWorks for faster access right from your home screen.';
    installPromptButton.textContent = 'Download App';
  }

  function hideInstallPromptModal() {
    if (!(installPromptModal instanceof HTMLElement)) return;
    installPromptModal.classList.remove('is-visible');
    window.setTimeout(() => {
      if (installPromptModal instanceof HTMLElement) {
        installPromptModal.hidden = true;
      }
    }, 360);
  }

  function canShowInstallPromptModal() {
    const state = getInstallPromptModalState();
    if (installPromptState.isInstalled || isRunningStandalone()) return false;
    if (state.clickedAt || state.installedAt) return false;
    try {
      if (sessionStorage.getItem(installPromptClosedForSessionKey) === '1') return false;
    } catch (error) {
      // Ignore storage issues.
    }
    return Boolean(installPromptState.deferredPrompt || isIosSafari);
  }

  function showInstallPromptModal() {
    if (!installPromptDelayElapsed || !canShowInstallPromptModal()) return;
    if (!(installPromptModal instanceof HTMLElement)) return;
    updateInstallPromptModalCopy(installPromptState.deferredPrompt ? 'default' : 'ios');
    installPromptModal.hidden = false;
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        installPromptModal.classList.add('is-visible');
      });
    });
  }

  function buildInstallPromptModal() {
    if (document.querySelector('[data-install-sheet]')) {
      installPromptModal = document.querySelector('[data-install-sheet]');
      installPromptMessage = installPromptModal?.querySelector('[data-install-sheet-message]') || null;
      installPromptButton = installPromptModal?.querySelector('[data-install-sheet-download]') || null;
      return;
    }

    document.body.insertAdjacentHTML('beforeend', `
      <div class="app-install-sheet" data-install-sheet hidden>
        <div class="app-install-sheet__backdrop" data-install-sheet-close></div>
        <div class="app-install-sheet__panel" role="dialog" aria-modal="true" aria-labelledby="app-install-sheet-title">
          <button type="button" class="app-install-sheet__dismiss" data-install-sheet-close aria-label="Close download app prompt">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <div class="app-install-sheet__brand">
            <img src="${getBasePath()}images/pwa/maworks-icon-192.png" alt="MaWorks logo" class="app-install-sheet__logo" />
            <div class="app-install-sheet__copy">
              <span class="app-install-sheet__eyebrow">Download App</span>
              <h3 id="app-install-sheet-title">Install MaWorks</h3>
              <p data-install-sheet-message>Download MaWorks for faster access right from your home screen.</p>
            </div>
          </div>
          <div class="app-install-sheet__actions">
            <button type="button" class="app-install-sheet__button" data-install-sheet-download>Download App</button>
          </div>
        </div>
      </div>
    `);

    installPromptModal = document.querySelector('[data-install-sheet]');
    installPromptMessage = installPromptModal?.querySelector('[data-install-sheet-message]') || null;
    installPromptButton = installPromptModal?.querySelector('[data-install-sheet-download]') || null;

    installPromptModal?.querySelectorAll('[data-install-sheet-close]').forEach((element) => {
      element.addEventListener('click', () => {
        try {
          sessionStorage.setItem(installPromptClosedForSessionKey, '1');
        } catch (error) {
          // Ignore storage issues.
        }
        hideInstallPromptModal();
      });
    });

    installPromptButton?.addEventListener('click', async () => {
      if (typeof installPromptState.writeState === 'function') {
        installPromptState.writeState({ clickedAt: Date.now() });
      }

      if (installPromptState.deferredPrompt) {
        const promptEvent = installPromptState.deferredPrompt;
        installPromptState.deferredPrompt = null;
        hideInstallPromptModal();
        try {
          await promptEvent.prompt();
          const choice = await promptEvent.userChoice.catch(() => null);
          if (choice?.outcome === 'accepted' && typeof installPromptState.writeState === 'function') {
            installPromptState.writeState({ installedAt: Date.now() });
          }
        } catch (error) {
          // Ignore prompt failures after preserving the click state.
        }
        return;
      }

      if (isIosSafari) {
        updateInstallPromptModalCopy('ios');
        return;
      }

      hideInstallPromptModal();
    });
  }

  injectSharedHeaderOverrides();
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = renderHeader();
  if (headerEl) document.body.classList.add('has-mobile-bottom-nav');
  const footerEl = document.getElementById('site-footer');
  const isHomePage = !window.location.pathname.includes('/pages/');
  if (footerEl && isHomePage) footerEl.innerHTML = renderFooter();
  if (!document.getElementById('cookie-banner')) {
    document.body.insertAdjacentHTML('beforeend', renderCookieBanner());
  }
  if (!document.getElementById('account-auth-overlay')) {
    document.body.insertAdjacentHTML('beforeend', renderAccountPanel());
  }
  if (!document.getElementById('cart-drawer-overlay')) {
    document.body.insertAdjacentHTML('beforeend', renderCartDrawer());
  }
  if (pageNeedsEagerAuth()) {
    ensureFirebaseAuthScript().catch(() => {});
  }
  if (pageNeedsProvidersUi()) {
    ensureProvidersUiScript().catch(() => {});
  }

  buildInstallPromptModal();
  installPromptTimerId = window.setTimeout(() => {
    installPromptDelayElapsed = true;
    showInstallPromptModal();
  }, installPromptDelayMs);
  window.addEventListener('worklinkup-install-available', showInstallPromptModal);
  window.addEventListener('worklinkup-install-complete', hideInstallPromptModal);
  window.addEventListener('beforeunload', () => {
    if (installPromptTimerId) window.clearTimeout(installPromptTimerId);
  }, { once: true });

  if (!headerEl) return;

  const menuToggle = headerEl.querySelector('.mobile-menu-toggle');
  const closeToggle = headerEl.querySelector('.mobile-nav-close');
  const navEl = headerEl.querySelector('#site-nav');
  const overlayEl = headerEl.querySelector('.mobile-nav-overlay');
  const mobileSearchOverlay = headerEl.querySelector('#mobile-search-overlay');
  const mobileSearchTrigger = headerEl.querySelector('.mobile-search-trigger');
  const mobileSearchClose = headerEl.querySelector('.mobile-search-close');
  const mobileSearchInput = headerEl.querySelector('.mobile-search-toast-bar input');
  const submenuToggles = headerEl.querySelectorAll('.mobile-submenu-toggle');
  const accountMenuHost = headerEl.querySelector('.account-menu-host');
  const accountTriggers = headerEl.querySelectorAll('.account-trigger');
  const accountDropdown = headerEl.querySelector('.account-dropdown');
  const accountJobsBadge = headerEl.querySelector('[data-account-jobs-badge]');
  const accountJobsBadgeDropdown = headerEl.querySelector('[data-account-jobs-badge-dropdown]');
  const accountMessagesBadgeDropdown = headerEl.querySelector('[data-account-messages-badge-dropdown]');
  const dropdownLogoutBtns = headerEl.querySelectorAll('.account-dropdown-logout');
  const mobileBottomProfileToggle = headerEl.querySelector('[data-mobile-profile-toggle]');
  const mobileBottomProfileOverlay = headerEl.querySelector('[data-mobile-profile-overlay]');
  const mobileBottomProfilePanel = headerEl.querySelector('[data-mobile-profile-panel]');
  const mobileBottomProfileClose = headerEl.querySelector('[data-mobile-profile-close]');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let accountJobsBadgeCount = 0;
  let accountPlacedJobsBadgeCount = 0;
  let accountMessagesBadgeCount = 0;
  let accountConversationBadgeUnsubscribe = null;
  let accountJobBadgeUnsubscribe = null;
  let accountJobBadgeSubscriptionUid = '';

  function setBadgeCount(badge, count = 0) {
    if (!(badge instanceof HTMLElement)) return;
    const normalizedCount = Math.max(0, Number(count || 0));
    badge.textContent = String(normalizedCount);
    badge.hidden = normalizedCount <= 0;
  }

  function renderAccountBadgeState() {
    setBadgeCount(accountJobsBadge, accountJobsBadgeCount + accountMessagesBadgeCount);
    setBadgeCount(accountJobsBadgeDropdown, accountJobsBadgeCount);
    setBadgeCount(accountMessagesBadgeDropdown, accountMessagesBadgeCount);
  }

  function stopAccountConversationBadgeSubscription() {
    if (typeof accountConversationBadgeUnsubscribe === 'function') {
      accountConversationBadgeUnsubscribe();
    }
    accountConversationBadgeUnsubscribe = null;
  }

  function stopAccountJobBadgeSubscription() {
    if (typeof accountJobBadgeUnsubscribe === 'function') {
      accountJobBadgeUnsubscribe();
    }
    accountJobBadgeUnsubscribe = null;
    accountJobBadgeSubscriptionUid = '';
  }

  function updateReceivedJobBadgeCount(applications = [], uid = '') {
    const notificationState = readJobNotificationState(uid);
    const receivedBidCount = Array.isArray(applications)
      ? applications.filter((application) => Number(application.createdAtMs || 0) > notificationState.receivedAt).length
      : 0;
    accountJobsBadgeCount = receivedBidCount + accountPlacedJobsBadgeCount;
    renderAccountBadgeState();
  }

  function updateMessageBadgeCount(conversations = []) {
    accountMessagesBadgeCount = Array.isArray(conversations)
      ? conversations.reduce((total, conversation) => total + Number(conversation.unreadCount || 0), 0)
      : 0;
    renderAccountBadgeState();
  }

  async function syncAccountMessageBadges(authHelper, currentAccount) {
    if (!authHelper || !currentAccount?.uid) {
      accountMessagesBadgeCount = 0;
      renderAccountBadgeState();
      stopAccountConversationBadgeSubscription();
      return;
    }

    if (!accountConversationBadgeUnsubscribe && typeof authHelper.subscribeConversations === 'function') {
      accountConversationBadgeUnsubscribe = await authHelper.subscribeConversations((conversations) => {
        updateMessageBadgeCount(conversations);
      }).catch(() => null);
      if (accountConversationBadgeUnsubscribe) return;
    }

    if (typeof authHelper.listConversations === 'function') {
      const conversations = await authHelper.listConversations().catch(() => []);
      updateMessageBadgeCount(conversations);
      return;
    }

    accountMessagesBadgeCount = 0;
    renderAccountBadgeState();
  }

  async function refreshAccountMessageBadges() {
    const currentAccount = getStoredAccount();
    if (!currentAccount?.loggedIn || !currentAccount?.uid) {
      accountMessagesBadgeCount = 0;
      renderAccountBadgeState();
      stopAccountConversationBadgeSubscription();
      return;
    }

    const authHelper = await ensureFirebaseAuthScript().catch(() => window.softGigglesAuth || null);
    await syncAccountMessageBadges(authHelper, currentAccount);
  }

  async function syncAccountJobBadges() {
    const currentAccount = getStoredAccount();
    if (!currentAccount?.loggedIn || !currentAccount?.uid) {
      accountJobsBadgeCount = 0;
      accountPlacedJobsBadgeCount = 0;
      accountMessagesBadgeCount = 0;
      renderAccountBadgeState();
      stopAccountConversationBadgeSubscription();
      stopAccountJobBadgeSubscription();
      return;
    }

    try {
      const authHelper = await ensureFirebaseAuthScript().catch(() => window.softGigglesAuth || null);
      if (!authHelper) {
        accountJobsBadgeCount = 0;
        accountPlacedJobsBadgeCount = 0;
        accountMessagesBadgeCount = 0;
        renderAccountBadgeState();
        return;
      }

      const [postedJobs, placedBids] = await Promise.all([
        typeof authHelper.listJobsForUser === 'function' ? authHelper.listJobsForUser(currentAccount.uid).catch(() => []) : Promise.resolve([]),
        typeof authHelper.listPlacedJobBids === 'function' ? authHelper.listPlacedJobBids(currentAccount.uid).catch(() => []) : Promise.resolve([])
      ]);

      const postedBidCounts = await Promise.all((postedJobs || []).map((job) => (
        typeof authHelper.listJobApplications === 'function'
          ? authHelper.listJobApplications(job.id).then((applications) => Array.isArray(applications) ? applications : []).catch(() => [])
          : Promise.resolve([])
      )));

      const notificationState = readJobNotificationState(currentAccount.uid);
      const receivedBidCount = postedBidCounts.reduce((total, applications) => total + (
        Array.isArray(applications)
          ? applications.filter((application) => Number(application.createdAtMs || 0) > notificationState.receivedAt).length
          : 0
      ), 0);
      const placedBidCount = Array.isArray(placedBids)
        ? placedBids.filter((bid) => getPlacedBidNotificationTime(bid) > notificationState.placedAt).length
        : 0;
      accountPlacedJobsBadgeCount = placedBidCount;
      accountJobsBadgeCount = receivedBidCount + placedBidCount;
      renderAccountBadgeState();
      if (
        typeof authHelper.subscribeReceivedJobBids === 'function'
        && accountJobBadgeSubscriptionUid !== currentAccount.uid
      ) {
        stopAccountJobBadgeSubscription();
        accountJobBadgeSubscriptionUid = currentAccount.uid;
        accountJobBadgeUnsubscribe = authHelper.subscribeReceivedJobBids(currentAccount.uid, (applications = []) => {
          updateReceivedJobBadgeCount(applications, currentAccount.uid);
        });
      }
      await syncAccountMessageBadges(authHelper, currentAccount);
    } catch (error) {
      accountJobsBadgeCount = 0;
      accountPlacedJobsBadgeCount = 0;
      renderAccountBadgeState();
    }
  }

  function setMobileMenuState(isOpen) {
    headerEl.classList.toggle('mobile-nav-open', isOpen);
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(isOpen));
    if (overlayEl) overlayEl.setAttribute('aria-hidden', String(!isOpen));
  }

  function setMobileProfilePanelState(isOpen) {
    if (!(mobileBottomProfilePanel instanceof HTMLElement) || !(mobileBottomProfileOverlay instanceof HTMLElement)) return;
    mobileBottomProfilePanel.hidden = !isOpen;
    mobileBottomProfileOverlay.hidden = !isOpen;
    mobileBottomProfilePanel.classList.toggle('is-visible', isOpen);
    mobileBottomProfileOverlay.classList.toggle('is-visible', isOpen);
    mobileBottomProfilePanel.setAttribute('aria-hidden', String(!isOpen));
    if (mobileBottomProfileToggle instanceof HTMLButtonElement) {
      mobileBottomProfileToggle.setAttribute('aria-expanded', String(isOpen));
    }
    document.body.classList.toggle('mobile-profile-popup-open', isOpen);
  }

  function syncMobileNav() {
    if (!mobileQuery.matches) {
      setMobileMenuState(false);
      setMobileProfilePanelState(false);
      closeMobileSearch(true);
      headerEl.querySelectorAll('.nav-item.mobile-submenu-open').forEach((item) => {
        item.classList.remove('mobile-submenu-open');
      });
      submenuToggles.forEach((toggle) => {
        toggle.setAttribute('aria-expanded', 'false');
      });
    }
  }

  function syncDesktopNav() {
    headerEl.classList.remove('desktop-nav-hidden');
  }

  function closeMobileSearch(immediate = false) {
    if (!mobileSearchOverlay) return;
    mobileSearchOverlay.classList.remove('is-visible');
    document.body.classList.remove('mobile-search-open');

    const finalize = () => {
      mobileSearchOverlay.hidden = true;
      if (mobileSearchInput) mobileSearchInput.value = '';
    };

    if (immediate) {
      finalize();
      return;
    }

    window.setTimeout(finalize, 220);
  }

  function openMobileSearch() {
    if (!mobileSearchOverlay) return;
    setMobileMenuState(false);
    mobileSearchOverlay.hidden = false;
    document.body.classList.add('mobile-search-open');
    requestAnimationFrame(() => {
      mobileSearchOverlay.classList.add('is-visible');
      if (mobileSearchInput) mobileSearchInput.focus();
    });
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const willOpen = !headerEl.classList.contains('mobile-nav-open');
      setMobileMenuState(willOpen);
    });
  }

  if (closeToggle) {
    closeToggle.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  }

  if (overlayEl) {
    overlayEl.addEventListener('click', () => {
      setMobileMenuState(false);
    });
  }

  if (mobileSearchTrigger && mobileSearchOverlay) {
    mobileSearchTrigger.addEventListener('click', openMobileSearch);
  }

  if (mobileSearchClose && mobileSearchOverlay) {
    mobileSearchClose.addEventListener('click', () => closeMobileSearch());
  }

  if (mobileSearchOverlay) {
    mobileSearchOverlay.addEventListener('click', (event) => {
      if (event.target === mobileSearchOverlay) {
        closeMobileSearch();
      }
    });
  }

  if (mobileBottomProfileToggle instanceof HTMLButtonElement) {
    mobileBottomProfileToggle.addEventListener('click', (event) => {
      event.preventDefault();
      if (!mobileQuery.matches) return;
      const willOpen = !(mobileBottomProfilePanel instanceof HTMLElement && mobileBottomProfilePanel.classList.contains('is-visible'));
      setMobileProfilePanelState(willOpen);
    });
  }

  if (mobileBottomProfileOverlay instanceof HTMLElement) {
    mobileBottomProfileOverlay.addEventListener('click', () => {
      setMobileProfilePanelState(false);
    });
  }

  if (mobileBottomProfileClose instanceof HTMLButtonElement) {
    mobileBottomProfileClose.addEventListener('click', () => {
      setMobileProfilePanelState(false);
    });
  }

  submenuToggles.forEach((toggle) => {
    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      const navItem = toggle.closest('.nav-item');
      if (!navItem || !mobileQuery.matches) return;
      const willOpen = !navItem.classList.contains('mobile-submenu-open');
      headerEl.querySelectorAll('.nav-item.mobile-submenu-open').forEach((item) => {
        if (item !== navItem) item.classList.remove('mobile-submenu-open');
      });
      submenuToggles.forEach((otherToggle) => {
        if (otherToggle !== toggle) otherToggle.setAttribute('aria-expanded', 'false');
      });
      navItem.classList.toggle('mobile-submenu-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });
  });

  document.addEventListener('click', (event) => {
    if (!mobileQuery.matches || !headerEl.classList.contains('mobile-nav-open')) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (navEl && navEl.contains(target)) return;
    if (menuToggle && menuToggle.contains(target)) return;
    setMobileMenuState(false);
  });

  if (accountMenuHost && accountDropdown) {
    let accountDropdownCloseTimer = null;

    const clearAccountCloseTimer = () => {
      if (!accountDropdownCloseTimer) return;
      window.clearTimeout(accountDropdownCloseTimer);
      accountDropdownCloseTimer = null;
    };

    const openAccountDropdown = () => {
      if (!accountMenuHost.classList.contains('is-logged-in')) return;
      clearAccountCloseTimer();
      accountMenuHost.classList.add('is-open');
    };

    const closeAccountDropdown = () => {
      clearAccountCloseTimer();
      accountDropdownCloseTimer = window.setTimeout(() => {
        accountMenuHost.classList.remove('is-open');
      }, 180);
    };

    accountMenuHost.addEventListener('mouseenter', openAccountDropdown);
    accountMenuHost.addEventListener('mouseleave', closeAccountDropdown);
    accountDropdown.addEventListener('mouseenter', openAccountDropdown);
    accountDropdown.addEventListener('mouseleave', closeAccountDropdown);

    accountTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        if (!accountMenuHost.classList.contains('is-logged-in')) return;
        event.preventDefault();
        if (mobileQuery.matches) {
          event.preventDefault();
          const willOpen = !accountMenuHost.classList.contains('is-open');
          accountMenuHost.classList.toggle('is-open', willOpen);
          return;
        }
        openAccountDropdown();
      });
    });

    document.addEventListener('click', (event) => {
      if (!accountMenuHost.classList.contains('is-open')) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (accountMenuHost.contains(target)) return;
      closeAccountDropdown();
    });
  }

  dropdownLogoutBtns.forEach((dropdownLogoutBtn) => {
    dropdownLogoutBtn.addEventListener('click', async () => {
      if (window.softGigglesAuth && typeof window.softGigglesAuth.signOut === 'function') {
        try {
          await window.softGigglesAuth.signOut();
        } catch (error) {
          // Fall back to local sign-out handling below.
        }
        window.location.reload();
        return;
      }
      try {
        localStorage.removeItem('softgiggles_account');
      } catch (error) {
        // Ignore storage issues.
      }
      window.location.reload();
    });
  });

  syncAccountJobBadges();
  window.addEventListener('focus', syncAccountJobBadges);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      syncAccountJobBadges();
    }
  });
  window.addEventListener('worklinkup-job-badges-refresh', syncAccountJobBadges);
  window.addEventListener('worklinkup-messages-badges-refresh', refreshAccountMessageBadges);

  window.addEventListener('resize', () => {
    syncMobileNav();
    syncDesktopNav();
  });

  syncMobileNav();
  syncDesktopNav();

  window.addEventListener('beforeunload', () => {
    stopAccountConversationBadgeSubscription();
    stopAccountJobBadgeSubscription();
  }, { once: true });
});
