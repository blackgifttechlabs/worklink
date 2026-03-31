(function providerUiBootstrap() {
  const SPECIALIST_CATEGORIES = [
    {
      key: 'home-services',
      label: 'Home Services',
      image: 'images/categories/home-services.png',
      subservices: ['Gardener', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Handyman']
    },
    {
      key: 'beauty-wellness',
      label: 'Beauty & Wellness',
      image: 'images/categories/beauty-and-wellness.png',
      subservices: ['Hairdresser', 'Barber', 'Makeup Artist', 'Nail Technician', 'Massage Therapist']
    },
    {
      key: 'digital-business',
      label: 'Digital & Business',
      image: 'images/categories/business.png',
      subservices: ['Programmer', 'Designer', 'Photographer', 'Videographer', 'Social Media Manager']
    },
    {
      key: 'plumbing',
      label: 'Plumbing',
      image: 'images/categories/plumbing.png',
      subservices: ['Leak Repairs', 'Blocked Drains', 'Tank Cleaning']
    },
    {
      key: 'security-services',
      label: 'Security Services',
      image: 'images/categories/security-services.png',
      subservices: ['Guarding', 'Alarm Setup', 'Gate Monitoring']
    },
    {
      key: 'tutoring',
      label: 'Tutoring',
      image: 'images/categories/tutoring.png',
      subservices: ['Maths Tutor', 'Science Tutor', 'Exam Prep']
    },
    {
      key: 'childcare',
      label: 'Childcare',
      image: 'images/categories/childcare.png',
      subservices: ['Babysitting', 'Nanny Support', 'After-school Care']
    },
    {
      key: 'photography',
      label: 'Photography',
      image: 'images/categories/photography.png',
      subservices: ['Events', 'Brand Shoots', 'Product Photography']
    }
  ];

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

  const SAMPLE_PROVIDERS = [
    {
      uid: 'sample-rutendo',
      providerPublicId: '#3384',
      displayName: 'Rutendo Moyo',
      whatsappNumber: '+263779882110',
      city: 'Borrowdale',
      address: 'Borrowdale, Harare',
      province: 'Harare',
      provinceSlug: 'harare',
      experience: '6 years',
      primaryCategory: 'Home Services',
      specialty: 'Gardener',
      bio: 'Garden maintenance, hedge shaping, and quick clean-ups for homes and offices.',
      averageRating: 4.9,
      reviewCount: 28,
      completedJobs: 46,
      posts: [
        { id: 'rutendo-1', imageData: 'images/categories/home-services.png', caption: 'Fresh lawn cut and trimmed edges for a family home.' },
        { id: 'rutendo-2', imageData: 'images/sections/findme.png', caption: 'Weekend garden clean-up before a family event.' }
      ]
    },
    {
      uid: 'sample-ashley',
      providerPublicId: '#3385',
      displayName: 'Ashley Dube',
      whatsappNumber: '+263771110220',
      city: 'Khumalo',
      address: 'Khumalo, Bulawayo',
      province: 'Bulawayo',
      provinceSlug: 'bulawayo',
      experience: '4 years',
      primaryCategory: 'Beauty & Wellness',
      specialty: 'Nail Technician',
      bio: 'Gel, acrylic, and soft glam sets for home visits and studio appointments.',
      averageRating: 4.8,
      reviewCount: 19,
      completedJobs: 31,
      posts: [
        { id: 'ashley-1', imageData: 'images/categories/beauty-and-wellness.png', caption: 'Short nude set with chrome details.' },
        { id: 'ashley-2', imageData: 'images/categories/photography.png', caption: 'Birthday set with glitter accent nails.' }
      ]
    },
    {
      uid: 'sample-tapiwa',
      providerPublicId: '#3386',
      displayName: 'Tapiwa Muchengeti',
      whatsappNumber: '+263774220510',
      city: 'Mutare CBD',
      address: 'Mutare CBD, Manicaland',
      province: 'Manicaland',
      provinceSlug: 'manicaland',
      experience: '8 years',
      primaryCategory: 'Digital & Business',
      specialty: 'Programmer',
      bio: 'Small business websites, booking forms, and landing pages built fast.',
      averageRating: 4.7,
      reviewCount: 14,
      completedJobs: 22,
      posts: [
        { id: 'tapiwa-1', imageData: 'images/categories/business.png', caption: 'Client site refresh for a local plumbing company.' },
        { id: 'tapiwa-2', imageData: 'images/categories/plumbing.png', caption: 'Mobile-first landing page for home services leads.' }
      ]
    }
  ];

  function getBase() {
    if (typeof getBasePath === 'function') return getBasePath();
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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

  function createCircleCardsMarkup(base, isLoop = false) {
    const cards = SPECIALIST_CATEGORIES.map((category) => `
      <a href="${base}pages/specialists.html?category=${encodeURIComponent(category.label)}" class="category-circle specialist-category-chip" data-category-chip="${category.label}">
        <div class="category-circle-img">
          <img src="${base}${category.image}" alt="${category.label}" />
        </div>
        <span>${category.label}</span>
      </a>
    `).join('');

    if (!isLoop) return cards;
    return `${cards}${cards}`;
  }

  function mapSampleProvider(provider) {
    return {
      ...provider,
      profileUrl: `${getBase()}pages/provider-profile.html?uid=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provider.provinceSlug)}`,
      messageUrl: `${getBase()}pages/messages.html?provider=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provider.provinceSlug)}`,
      posts: provider.posts || []
    };
  }

  async function getProviders() {
    const authHelper = await waitForAuthHelper();
    let remoteProviders = [];

    if (authHelper && typeof authHelper.listProviders === 'function') {
      try {
        remoteProviders = await authHelper.listProviders();
      } catch (error) {
        remoteProviders = [];
      }
    }

    const merged = [...remoteProviders];
    const seenUids = new Set(remoteProviders.map((provider) => provider.uid));

    SAMPLE_PROVIDERS.forEach((provider) => {
      if (!seenUids.has(provider.uid)) merged.push(provider);
    });

    return merged.map((provider) => ({
      ...provider,
      averageRating: Number(provider.averageRating || 4.7),
      reviewCount: Number(provider.reviewCount || 0),
      completedJobs: Number(provider.completedJobs || 0),
      profileUrl: `${getBase()}pages/provider-profile.html?uid=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provider.provinceSlug || slugify(provider.province || 'harare'))}`,
      messageUrl: `${getBase()}pages/messages.html?provider=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provider.provinceSlug || slugify(provider.province || 'harare'))}`
    }));
  }

  async function getProviderByIdentity(uid, provinceSlug) {
    const authHelper = await waitForAuthHelper();
    if (authHelper && typeof authHelper.getProviderProfileByUid === 'function') {
      try {
        const remoteProvider = await authHelper.getProviderProfileByUid(uid, provinceSlug);
        if (remoteProvider) return remoteProvider;
      } catch (error) {
        // Fall back to samples below.
      }
    }

    return SAMPLE_PROVIDERS.find((provider) => provider.uid === uid) || null;
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

    return SAMPLE_PROVIDERS.find((provider) => provider.uid === uid)?.posts || [];
  }

  function injectProviderExperienceStyles() {
    if (document.getElementById('provider-experience-styles')) return;

    const style = document.createElement('style');
    style.id = 'provider-experience-styles';
    style.textContent = `
      .specialists-page { max-width: 1380px; margin: 0 auto; padding: 32px 24px 72px; }
      .specialists-topbar { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: center; }
      .specialists-search-shell { display: grid; gap: 14px; }
      .specialists-search-row { display: flex; gap: 12px; align-items: center; }
      .specialists-search-row .search-bar { max-width: none; }
      .specialists-rating-filter { display: flex; flex-wrap: wrap; gap: 10px; }
      .specialists-rating-chip, .specialists-filter-btn, .specialists-view-btn, .provider-contact-btn, .provider-message-btn, .provider-post-submit, .messages-send-btn, .provider-profile-action, .sheet-close-btn, .provider-onboarding-next, .provider-onboarding-back, .provider-onboarding-submit { min-height: 48px; border-radius: 20px; border: 1px solid rgba(26, 50, 99, 0.12); font-weight: 800; font-family: 'Google Sans', sans-serif; }
      .specialists-rating-chip { background: rgba(255,255,255,0.88); color: var(--brand-ink); padding: 0 18px; }
      .specialists-rating-chip.is-active, .specialists-filter-btn, .provider-post-submit, .messages-send-btn, .provider-onboarding-next, .provider-onboarding-submit { background: linear-gradient(180deg, #076fe5 0%, #0558b8 100%); color: #fff; border-color: transparent; }
      .specialists-filter-btn { padding: 0 18px; display: none; }
      .specialists-categories-shell { margin-top: 28px; overflow: hidden; }
      .specialists-categories-row { display: flex; gap: 16px; align-items: stretch; overflow-x: auto; padding-bottom: 8px; }
      .specialist-category-chip { min-width: 116px; }
      .specialists-layout { margin-top: 30px; display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 28px; align-items: start; }
      .specialists-sidebar, .provider-profile-aside, .messages-sidebar, .provider-post-composer, .provider-post-feed-card, .provider-profile-main, .messages-thread, .account-provider-card, .specialist-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(26, 50, 99, 0.08); border-radius: 28px; box-shadow: 0 20px 42px rgba(26, 50, 99, 0.08); }
      .specialists-sidebar { padding: 22px 18px; position: sticky; top: 108px; }
      .specialists-sidebar h2, .specialists-results-head h1, .provider-profile-main h1, .messages-empty h2, .provider-post-shell h1, .provider-onboarding-head h2 { color: var(--brand-ink); }
      .service-filter-group + .service-filter-group { margin-top: 10px; border-top: 1px solid rgba(26, 50, 99, 0.08); padding-top: 10px; }
      .service-filter-toggle { width: 100%; border: none; background: transparent; display: flex; align-items: center; justify-content: space-between; padding: 10px 0; font-size: 15px; font-weight: 800; color: var(--brand-ink); }
      .service-filter-links { display: grid; gap: 6px; padding: 2px 0 8px 0; }
      .service-filter-links[hidden] { display: none !important; }
      .service-filter-links button { border: none; background: transparent; text-align: left; color: #64748b; padding: 8px 10px; border-radius: 16px; font-size: 14px; }
      .service-filter-links button.is-active, .service-filter-links button:hover { background: rgba(7, 111, 229, 0.08); color: #076fe5; }
      .specialists-results-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 18px; }
      .specialists-results-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
      .specialist-card { padding: 18px; display: grid; gap: 16px; }
      .specialist-card-head { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
      .specialist-card h3 { font-size: 22px; font-weight: 900; color: var(--brand-ink); }
      .specialist-id-badge, .provider-meta-chip, .provider-profile-id { min-height: 32px; padding: 0 12px; border-radius: 999px; display: inline-flex; align-items: center; background: rgba(7, 111, 229, 0.08); color: #076fe5; font-size: 12px; font-weight: 800; }
      .specialist-card p { color: #64748b; line-height: 1.55; }
      .specialist-meta-row, .provider-meta-row { display: flex; flex-wrap: wrap; gap: 10px; }
      .specialists-view-btn, .provider-contact-btn, .provider-message-btn, .provider-profile-action { display: inline-flex; align-items: center; justify-content: center; padding: 0 18px; text-decoration: none; }
      .specialists-view-btn, .provider-contact-btn, .provider-post-submit, .messages-send-btn, .provider-onboarding-next, .provider-onboarding-submit { background: linear-gradient(180deg, #076fe5 0%, #0558b8 100%); color: #fff; border: none; }
      .provider-message-btn, .provider-profile-action.secondary, .provider-onboarding-back { background: rgba(255,255,255,0.94); color: var(--brand-ink); }
      .specialist-actions { display: flex; gap: 10px; flex-wrap: wrap; }
      .specialists-empty { padding: 42px 20px; text-align: center; border-radius: 28px; background: rgba(255,255,255,0.88); border: 1px dashed rgba(26, 50, 99, 0.16); color: #64748b; }
      .provider-profile-page, .provider-post-shell, .messages-page { max-width: 1380px; margin: 0 auto; padding: 32px 24px 72px; }
      .provider-profile-layout, .provider-post-layout, .messages-layout { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 28px; align-items: start; }
      .provider-profile-aside, .provider-profile-main { padding: 24px; }
      .provider-profile-aside { position: sticky; top: 108px; display: grid; gap: 18px; }
      .provider-profile-name { font-size: 28px; font-weight: 900; color: var(--brand-ink); }
      .provider-profile-grid { display: grid; gap: 14px; }
      .provider-profile-detail { padding: 16px 18px; border-radius: 22px; background: rgba(7,111,229,0.04); }
      .provider-profile-detail span { display: block; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
      .provider-profile-work-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
      .provider-work-card { border-radius: 24px; overflow: hidden; border: 1px solid rgba(26, 50, 99, 0.08); background: #fff; }
      .provider-work-card img { width: 100%; aspect-ratio: 4 / 4.5; object-fit: cover; }
      .provider-work-card p { padding: 14px; color: #475569; }
      .provider-post-layout { grid-template-columns: minmax(320px, 380px) minmax(0, 1fr); }
      .provider-post-composer, .provider-post-feed-card { padding: 22px; }
      .provider-post-composer { position: sticky; top: 108px; display: grid; gap: 16px; }
      .provider-post-preview { border-radius: 24px; overflow: hidden; border: 1px dashed rgba(26, 50, 99, 0.18); background: rgba(7,111,229,0.04); min-height: 240px; display: flex; align-items: center; justify-content: center; color: #64748b; }
      .provider-post-preview img { width: 100%; height: 100%; object-fit: cover; }
      .provider-post-composer input[type="file"], .provider-post-composer textarea, .messages-compose-input, .provider-onboarding-form input, .provider-onboarding-form select, .provider-onboarding-form textarea { width: 100%; border: 1px solid rgba(26,50,99,0.12); border-radius: 20px; background: rgba(255,255,255,0.96); padding: 14px 16px; font-family: 'Google Sans', sans-serif; }
      .provider-post-composer textarea, .provider-onboarding-form textarea { min-height: 120px; resize: vertical; }
      .provider-post-feed { display: grid; gap: 18px; }
      .provider-post-feed-card img { width: 100%; border-radius: 24px; margin-top: 16px; aspect-ratio: 4 / 4.8; object-fit: cover; }
      .provider-post-card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .provider-post-card-head strong { font-size: 18px; color: var(--brand-ink); }
      .messages-layout { min-height: calc(100vh - 220px); }
      .messages-sidebar { padding: 18px; display: grid; gap: 12px; }
      .messages-sidebar h1 { font-size: 28px; font-weight: 900; color: var(--brand-ink); }
      .messages-chat-list { display: grid; gap: 8px; }
      .messages-chat-item { width: 100%; border: none; background: transparent; padding: 14px; border-radius: 20px; text-align: left; }
      .messages-chat-item.is-active, .messages-chat-item:hover { background: rgba(7,111,229,0.08); }
      .messages-thread { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; overflow: hidden; min-height: 620px; }
      .messages-thread-head { padding: 18px 22px; border-bottom: 1px solid rgba(26, 50, 99, 0.08); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .messages-thread-body { padding: 22px; display: grid; gap: 12px; align-content: start; background: linear-gradient(180deg, rgba(7,111,229,0.02) 0%, rgba(250,185,91,0.05) 100%); overflow-y: auto; }
      .message-bubble { max-width: 74%; padding: 14px 16px; border-radius: 20px; line-height: 1.5; font-size: 15px; }
      .message-bubble.is-mine { margin-left: auto; background: #dcf6c9; color: #16302d; border-bottom-right-radius: 6px; }
      .message-bubble.is-theirs { background: #fff; color: #253858; border-bottom-left-radius: 6px; border: 1px solid rgba(26,50,99,0.08); }
      .messages-thread-compose { padding: 16px 18px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 12px; border-top: 1px solid rgba(26, 50, 99, 0.08); background: #fff; }
      .messages-empty { display: grid; place-items: center; padding: 48px 20px; text-align: center; color: #64748b; }
      .provider-onboarding-overlay[hidden] { display: none !important; }
      .provider-onboarding-overlay { position: fixed; inset: 0; z-index: 2100; background: rgba(15, 23, 42, 0.28); backdrop-filter: blur(14px); padding: 28px; }
      .provider-onboarding-modal { position: relative; width: min(980px, calc(100vw - 56px)); max-height: calc(100vh - 56px); margin: 0 auto; background: rgba(252,250,247,0.98); border-radius: 40px; border: 1px solid rgba(26,50,99,0.08); box-shadow: 0 30px 60px rgba(15,23,42,0.18); overflow: hidden; display: grid; grid-template-rows: auto minmax(0, 1fr) auto; }
      .provider-onboarding-help { position: absolute; top: 18px; left: 50%; transform: translateX(-50%); width: 42px; height: 42px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: rgba(7,111,229,0.08); color: #076fe5; }
      .provider-onboarding-close { position: absolute; top: 18px; right: 18px; width: 42px; height: 42px; border-radius: 999px; border: none; background: rgba(26,50,99,0.06); color: var(--brand-ink); font-size: 26px; }
      .provider-onboarding-head { padding: 70px 34px 20px; }
      .provider-onboarding-head p { color: #64748b; margin-top: 8px; max-width: 620px; }
      .provider-onboarding-progress { display: none; justify-content: center; gap: 8px; margin-top: 16px; }
      .provider-onboarding-progress span { width: 44px; height: 5px; border-radius: 999px; background: rgba(26,50,99,0.1); }
      .provider-onboarding-progress span.is-active { background: #076fe5; }
      .provider-onboarding-form { padding: 0 34px 24px; overflow-y: auto; }
      .provider-onboarding-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
      .provider-onboarding-step { padding: 22px; border-radius: 28px; background: rgba(255,255,255,0.9); border: 1px solid rgba(26,50,99,0.08); display: grid; gap: 14px; align-content: start; }
      .provider-onboarding-step h3 { font-size: 20px; color: var(--brand-ink); }
      .provider-onboarding-step p { color: #64748b; }
      .provider-onboarding-row { display: grid; gap: 8px; }
      .provider-onboarding-row label { font-size: 13px; font-weight: 800; color: #253858; }
      .provider-onboarding-footer { display: flex; justify-content: space-between; gap: 12px; padding: 20px 34px 28px; border-top: 1px solid rgba(26,50,99,0.08); background: rgba(252,250,247,0.94); }
      .provider-onboarding-actions { display: flex; gap: 12px; margin-left: auto; }
      .provider-onboarding-back { padding: 0 18px; }
      .provider-onboarding-next, .provider-onboarding-submit { padding: 0 22px; }
      .provider-onboarding-submit[hidden], .provider-onboarding-next[hidden], .provider-onboarding-back[hidden] { display: none !important; }
      .providers-mobile-sheet[hidden] { display: none !important; }
      .providers-mobile-sheet { position: fixed; inset: auto 0 0 0; z-index: 2050; padding: 0 10px 10px; }
      .providers-mobile-sheet-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.24); backdrop-filter: blur(10px); }
      .providers-mobile-sheet-panel { position: relative; margin: 0 auto; width: min(100%, 560px); background: rgba(252,250,247,0.98); border-radius: 28px 28px 0 0; box-shadow: 0 -24px 42px rgba(15,23,42,0.18); padding: 16px 18px 22px; max-height: 76vh; overflow-y: auto; }
      .providers-mobile-sheet-handle { width: 58px; height: 5px; border-radius: 999px; background: rgba(26,50,99,0.18); margin: 0 auto 14px; }
      @media (max-width: 980px) {
        .specialists-layout, .provider-profile-layout, .provider-post-layout, .messages-layout { grid-template-columns: 1fr; }
        .specialists-sidebar, .provider-profile-aside, .provider-post-composer, .messages-sidebar { position: static; }
        .specialists-results-grid, .provider-profile-work-grid { grid-template-columns: 1fr; }
        .provider-onboarding-modal { width: calc(100vw - 24px); max-height: calc(100vh - 16px); border-radius: 30px; }
        .provider-onboarding-steps { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .specialists-page, .provider-profile-page, .provider-post-shell, .messages-page { padding: 20px 16px 48px; }
        .specialists-topbar { grid-template-columns: 1fr; }
        .specialists-search-row { display: grid; grid-template-columns: 1fr auto; }
        .specialists-filter-btn { display: inline-flex; align-items: center; justify-content: center; }
        .specialists-sidebar { display: none; }
        .specialists-categories-shell { margin-top: 18px; }
        .specialists-categories-row.is-marquee { width: max-content; animation: specialists-marquee 22s linear infinite; overflow: visible; }
        .specialist-category-chip { min-width: 88px; padding: 6px 2px 8px; }
        .specialist-category-chip .category-circle-img { width: 70px; height: 70px; }
        .specialist-category-chip span { font-size: 12px; max-width: 78px; }
        .messages-thread { min-height: calc(100vh - 210px); }
        .provider-onboarding-overlay { padding: 0; display: grid; align-items: end; }
        .provider-onboarding-modal { width: 100%; max-height: 100vh; border-radius: 28px 28px 0 0; }
        .provider-onboarding-head { padding: 74px 20px 14px; }
        .provider-onboarding-progress { display: flex; }
        .provider-onboarding-form { padding: 0 20px 20px; }
        .provider-onboarding-steps { display: block; }
        .provider-onboarding-step { display: none; padding: 20px; border-radius: 24px; }
        .provider-onboarding-step.is-active { display: grid; }
        .provider-onboarding-footer { padding: 16px 20px 22px; }
      }
      @keyframes specialists-marquee {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
    `;
    document.head.appendChild(style);
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
            <p>Add the basics so clients can find you, trust you, and reach you quickly on WorkLinkUp.</p>
            <div class="provider-onboarding-progress">
              <span class="is-active" data-onboarding-dot="0"></span>
              <span data-onboarding-dot="1"></span>
              <span data-onboarding-dot="2"></span>
            </div>
          </div>
          <form class="provider-onboarding-form" id="provider-onboarding-form">
            <div class="provider-onboarding-steps">
              <section class="provider-onboarding-step is-active" data-onboarding-step="0">
                <h3>Who you are</h3>
                <p>Start with the details clients need first.</p>
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
              </section>
              <section class="provider-onboarding-step" data-onboarding-step="1">
                <h3>Where you work</h3>
                <p>Keep it clear and simple so the right clients can find you.</p>
                <div class="provider-onboarding-row">
                  <label for="provider-city">City / suburb</label>
                  <input id="provider-city" name="city" type="text" placeholder="Avondale, Harare" required />
                </div>
                <div class="provider-onboarding-row">
                  <label for="provider-address">Address or service area</label>
                  <input id="provider-address" name="address" type="text" placeholder="Serves Harare north and CBD" required />
                </div>
              </section>
              <section class="provider-onboarding-step" data-onboarding-step="2">
                <h3>What you do</h3>
                <p>Tell people your main service, specialty, and experience.</p>
                <div class="provider-onboarding-row">
                  <label for="provider-category">Main category</label>
                  <select id="provider-category" name="primaryCategory" required>
                    ${SPECIALIST_CATEGORIES.map((category) => `<option value="${category.label}">${category.label}</option>`).join('')}
                  </select>
                </div>
                <div class="provider-onboarding-row">
                  <label for="provider-specialty">Specialty</label>
                  <input id="provider-specialty" name="specialty" type="text" placeholder="Plumber, Nail Technician, Tutor..." required />
                </div>
                <div class="provider-onboarding-row">
                  <label for="provider-experience">Experience</label>
                  <input id="provider-experience" name="experience" type="text" placeholder="4 years" required />
                </div>
                <div class="provider-onboarding-row">
                  <label for="provider-bio">Short bio</label>
                  <textarea id="provider-bio" name="bio" placeholder="What kind of work do you do best?" required></textarea>
                </div>
              </section>
            </div>
            <div class="provider-onboarding-footer">
              <div class="provider-onboarding-note">You can update this later from your account.</div>
              <div class="provider-onboarding-actions">
                <button type="button" class="provider-onboarding-back" hidden>Back</button>
                <button type="button" class="provider-onboarding-next">Next</button>
                <button type="submit" class="provider-onboarding-submit" hidden>Save Profile</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    `);
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
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    let activeStep = 0;

    function syncSteps() {
      if (!mobileQuery.matches) {
        steps.forEach((step) => step.classList.add('is-active'));
        if (nextBtn) nextBtn.hidden = true;
        if (backBtn) backBtn.hidden = true;
        if (submitBtn) submitBtn.hidden = false;
        return;
      }

      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === activeStep);
      });
      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeStep);
      });
      if (backBtn) backBtn.hidden = activeStep === 0;
      if (nextBtn) nextBtn.hidden = activeStep === steps.length - 1;
      if (submitBtn) submitBtn.hidden = activeStep !== steps.length - 1;
    }

    function openOnboarding(prefill = {}) {
      form.fullName.value = prefill.name || '';
      form.whatsappNumber.value = prefill.whatsappNumber || prefill.phone || '';
      form.province.value = prefill.providerProvince || 'Harare';
      form.city.value = prefill.city || '';
      form.address.value = prefill.address || '';
      form.primaryCategory.value = prefill.primaryCategory || SPECIALIST_CATEGORIES[0].label;
      form.specialty.value = prefill.specialty || '';
      form.experience.value = prefill.experience || '';
      form.bio.value = prefill.bio || '';
      activeStep = 0;
      syncSteps();
      overlay.hidden = false;
      document.body.classList.add('mobile-search-open');
    }

    function closeOnboarding() {
      overlay.hidden = true;
      document.body.classList.remove('mobile-search-open');
    }

    closeBtn?.addEventListener('click', closeOnboarding);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeOnboarding();
    });
    nextBtn?.addEventListener('click', () => {
      activeStep = Math.min(activeStep + 1, steps.length - 1);
      syncSteps();
    });
    backBtn?.addEventListener('click', () => {
      activeStep = Math.max(activeStep - 1, 0);
      syncSteps();
    });
    mobileQuery.addEventListener('change', syncSteps);
    syncSteps();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.saveProviderProfile !== 'function') return;

      const formData = new FormData(form);
      submitBtn.disabled = true;
      try {
        await authHelper.saveProviderProfile(Object.fromEntries(formData.entries()));
        closeOnboarding();
        window.location.reload();
      } catch (error) {
        window.alert(error.message || 'Could not save your provider profile.');
      } finally {
        submitBtn.disabled = false;
      }
    });

    async function maybePromptOnboarding() {
      const account = getStoredAccount();
      if (!account?.loggedIn) return;
      if (account.providerProfileComplete) return;
      if (window.location.pathname.endsWith('/help.html')) return;

      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.getUserDocument !== 'function') return;

      try {
        const userDoc = await authHelper.getUserDocument(account.uid);
        if (userDoc?.providerProfileComplete) return;
        openOnboarding({
          name: userDoc?.name || account.name,
          phone: userDoc?.phone || account.phone,
          whatsappNumber: userDoc?.whatsappNumber || account.whatsappNumber,
          providerProvince: userDoc?.providerProvince || account.providerProvince,
          city: userDoc?.city || '',
          address: userDoc?.address || '',
          primaryCategory: userDoc?.primaryCategory || '',
          specialty: userDoc?.specialty || '',
          experience: userDoc?.experience || '',
          bio: userDoc?.bio || ''
        });
      } catch (error) {
        openOnboarding(account);
      }
    }

    window.addEventListener('softgiggles-auth-changed', maybePromptOnboarding);
    window.addEventListener('worklinkup:prompt-onboarding', maybePromptOnboarding);
    maybePromptOnboarding();
  }

  function buildServiceFilterMarkup(selectedCategory, selectedSubservice) {
    return SPECIALIST_CATEGORIES.map((category, index) => `
      <div class="service-filter-group">
        <button type="button" class="service-filter-toggle" data-filter-group="${category.label}" aria-expanded="${index === 0 ? 'true' : 'false'}">
          <span>${category.label}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="service-filter-links" ${index === 0 ? '' : 'hidden'}>
          <button type="button" class="${selectedCategory === category.label && !selectedSubservice ? 'is-active' : ''}" data-filter-category="${category.label}">All ${category.label}</button>
          ${category.subservices.map((service) => `
            <button type="button" class="${selectedSubservice === service ? 'is-active' : ''}" data-filter-subservice="${service}" data-parent-category="${category.label}">
              ${service}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  function filterProviders(providers, state) {
    return providers.filter((provider) => {
      const categoryMatch = !state.category || provider.primaryCategory === state.category;
      const subserviceMatch = !state.subservice || String(provider.specialty || '').toLowerCase().includes(state.subservice.toLowerCase());
      const ratingMatch = !state.rating || Number(provider.averageRating || 0) >= state.rating;
      const searchHaystack = `${provider.displayName} ${provider.primaryCategory} ${provider.specialty} ${provider.city} ${provider.province} ${provider.bio}`.toLowerCase();
      const searchMatch = !state.search || searchHaystack.includes(state.search.toLowerCase());
      return categoryMatch && subserviceMatch && ratingMatch && searchMatch;
    });
  }

  function renderProviderCards(host, providers) {
    if (!host) return;
    if (!providers.length) {
      host.innerHTML = `<div class="specialists-empty">No specialists match this filter yet. Try another category or rating.</div>`;
      return;
    }

    host.innerHTML = providers.map((provider) => `
      <article class="specialist-card">
        <div class="specialist-card-head">
          <div>
            <div class="specialist-id-badge">${provider.providerPublicId || '#0000'}</div>
            <h3>${provider.displayName}</h3>
          </div>
          <div class="provider-meta-chip">${Number(provider.averageRating || 0).toFixed(1)} ★</div>
        </div>
        <p>${provider.bio || 'WorkLinkUp specialist ready to help.'}</p>
        <div class="specialist-meta-row">
          <span class="provider-meta-chip">${provider.primaryCategory}</span>
          <span class="provider-meta-chip">${provider.specialty}</span>
          <span class="provider-meta-chip">${provider.city || provider.province}</span>
          <span class="provider-meta-chip">${provider.experience || 'Experienced'}</span>
        </div>
        <div class="specialist-actions">
          <a href="${provider.profileUrl}" class="specialists-view-btn">View Their Work</a>
          <a href="${provider.messageUrl}" class="provider-message-btn">Message</a>
        </div>
      </article>
    `).join('');
  }

  async function renderSpecialistsPage() {
    const page = document.querySelector('[data-specialists-page]');
    if (!page) return;

    const base = getBase();
    const providers = await getProviders();
    const categoriesHost = page.querySelector('[data-specialist-categories]');
    const sidebarHost = page.querySelector('[data-specialist-sidebar]');
    const mobileSheet = page.querySelector('[data-specialists-sheet]');
    const mobileSheetBody = page.querySelector('[data-specialists-sheet-body]');
    const resultsHost = page.querySelector('[data-specialists-results]');
    const totalHost = page.querySelector('[data-specialists-total]');
    const searchInput = page.querySelector('[data-specialists-search]');
    const ratingButtons = Array.from(page.querySelectorAll('[data-rating-filter]'));
    const filterBtn = page.querySelector('[data-open-specialists-sheet]');
    const sheetCloseBtn = page.querySelector('[data-close-specialists-sheet]');
    const currentCategory = new URLSearchParams(window.location.search).get('category') || '';
    const state = {
      category: currentCategory,
      subservice: '',
      rating: 0,
      search: ''
    };

    if (categoriesHost) {
      const mobileLoop = window.matchMedia('(max-width: 768px)').matches;
      categoriesHost.classList.toggle('is-marquee', mobileLoop);
      categoriesHost.innerHTML = createCircleCardsMarkup(base, mobileLoop);
    }

    function renderFilters() {
      const markup = buildServiceFilterMarkup(state.category, state.subservice);
      if (sidebarHost) sidebarHost.innerHTML = markup;
      if (mobileSheetBody) mobileSheetBody.innerHTML = markup;
    }

    function bindFilterInteractions(scope) {
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
          state.category = button.getAttribute('data-filter-category') || '';
          state.subservice = '';
          update();
          if (mobileSheet) mobileSheet.hidden = true;
        });
      });

      scope.querySelectorAll('[data-filter-subservice]').forEach((button) => {
        button.addEventListener('click', () => {
          state.category = button.getAttribute('data-parent-category') || state.category;
          state.subservice = button.getAttribute('data-filter-subservice') || '';
          update();
          if (mobileSheet) mobileSheet.hidden = true;
        });
      });
    }

    function update() {
      const filtered = filterProviders(providers, state);
      renderFilters();
      if (sidebarHost) bindFilterInteractions(sidebarHost);
      if (mobileSheetBody) bindFilterInteractions(mobileSheetBody);
      renderProviderCards(resultsHost, filtered);
      if (totalHost) totalHost.textContent = `${filtered.length} specialist${filtered.length === 1 ? '' : 's'}`;
      page.querySelectorAll('[data-category-chip]').forEach((chip) => {
        chip.classList.toggle('is-active', chip.getAttribute('data-category-chip') === state.category);
      });
      ratingButtons.forEach((button) => {
        button.classList.toggle('is-active', Number(button.getAttribute('data-rating-filter') || 0) === state.rating);
      });
    }

    categoriesHost?.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-category-chip]');
      if (!(chip instanceof HTMLElement)) return;
      event.preventDefault();
      state.category = chip.getAttribute('data-category-chip') || '';
      state.subservice = '';
      update();
    });

    ratingButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const ratingValue = Number(button.getAttribute('data-rating-filter') || 0);
        state.rating = state.rating === ratingValue ? 0 : ratingValue;
        update();
      });
    });

    searchInput?.addEventListener('input', () => {
      state.search = searchInput.value.trim();
      update();
    });

    filterBtn?.addEventListener('click', () => {
      if (!mobileSheet) return;
      mobileSheet.hidden = false;
    });

    sheetCloseBtn?.addEventListener('click', () => {
      if (mobileSheet) mobileSheet.hidden = true;
    });

    mobileSheet?.addEventListener('click', (event) => {
      const backdrop = event.target.closest('.providers-mobile-sheet-backdrop');
      if (backdrop) mobileSheet.hidden = true;
    });

    update();
  }

  async function renderProviderProfilePage() {
    const host = document.querySelector('[data-provider-profile-page]');
    if (!host) return;

    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid') || '';
    const provinceSlug = params.get('province') || '';
    const provider = await getProviderByIdentity(uid, provinceSlug);
    const posts = await getPostsForProvider(uid, provinceSlug);

    if (!provider) {
      host.innerHTML = `<div class="specialists-empty">That provider profile could not be found.</div>`;
      return;
    }

    host.innerHTML = `
      <div class="provider-profile-layout">
        <aside class="provider-profile-aside">
          <div class="provider-profile-id">${provider.providerPublicId || '#0000'}</div>
          <div class="provider-profile-name">${provider.displayName}</div>
          <div class="provider-meta-row">
            <span class="provider-meta-chip">${Number(provider.averageRating || 0).toFixed(1)} ★</span>
            <span class="provider-meta-chip">${provider.primaryCategory}</span>
            <span class="provider-meta-chip">${provider.specialty}</span>
          </div>
          <p>${provider.bio || ''}</p>
          <a href="https://wa.me/${String(provider.whatsappNumber || '').replace(/[^0-9]/g, '')}" class="provider-contact-btn" target="_blank" rel="noreferrer">${provider.whatsappNumber || 'Contact on WhatsApp'}</a>
          <a href="${getBase()}pages/messages.html?provider=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provider.provinceSlug || provinceSlug)}" class="provider-message-btn">Message Provider</a>
        </aside>
        <section class="provider-profile-main">
          <h1>${provider.displayName}</h1>
          <div class="provider-profile-grid">
            <div class="provider-profile-detail"><span>Province</span><strong>${provider.province}</strong></div>
            <div class="provider-profile-detail"><span>City / area</span><strong>${provider.city || provider.address}</strong></div>
            <div class="provider-profile-detail"><span>Experience</span><strong>${provider.experience || 'Experienced specialist'}</strong></div>
            <div class="provider-profile-detail"><span>Completed jobs</span><strong>${provider.completedJobs || 0}</strong></div>
          </div>
          <h2 style="margin-top:26px;">Previous Work</h2>
          <div class="provider-profile-work-grid">
            ${posts.length ? posts.map((post) => `
              <article class="provider-work-card">
                <img src="${post.imageData.startsWith('data:') || post.imageData.startsWith('http') ? post.imageData : `${getBase()}${post.imageData}`}" alt="${provider.displayName} work" />
                <p>${post.caption || 'Work posted by the provider.'}</p>
              </article>
            `).join('') : `<div class="specialists-empty">No work posts yet. Search coming soon, posts coming soon.</div>`}
          </div>
        </section>
      </div>
    `;
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

    const feedHost = page.querySelector('[data-provider-post-feed]');
    const form = page.querySelector('[data-provider-post-form]');
    const preview = page.querySelector('[data-provider-post-preview]');
    const fileInput = page.querySelector('[data-provider-post-image]');
    let previewImageData = '';

    async function refreshPosts() {
      const posts = await authHelper.listProviderPosts(profile.uid, profile.provinceSlug);
      feedHost.innerHTML = posts.length
        ? posts.map((post) => `
          <article class="provider-post-feed-card">
            <div class="provider-post-card-head">
              <strong>${profile.displayName}</strong>
              <span class="provider-meta-chip">${profile.providerPublicId}</span>
            </div>
            <p>${post.caption || ''}</p>
            <img src="${post.imageData.startsWith('data:') || post.imageData.startsWith('http') ? post.imageData : `${getBase()}${post.imageData}`}" alt="Provider post" />
          </article>
        `).join('')
        : `<div class="specialists-empty">Your posts will appear here once you upload your first piece of work.</div>`;
    }

    fileInput?.addEventListener('change', () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        previewImageData = String(reader.result || '');
        preview.innerHTML = `<img src="${previewImageData}" alt="Preview" />`;
      };
      reader.readAsDataURL(file);
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

  async function renderMessagesPage() {
    const page = document.querySelector('[data-messages-page]');
    if (!page) return;

    const account = getStoredAccount();
    if (!account?.loggedIn) {
      page.innerHTML = `<div class="specialists-empty">Sign in first to message providers.</div>`;
      return;
    }

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;

    const params = new URLSearchParams(window.location.search);
    const providerUid = params.get('provider') || '';
    const providerProvince = params.get('province') || '';
    const chatList = page.querySelector('[data-chat-list]');
    const threadBody = page.querySelector('[data-message-thread]');
    const threadTitle = page.querySelector('[data-message-thread-title]');
    const composeForm = page.querySelector('[data-messages-compose]');
    const composeInput = page.querySelector('[data-messages-compose-input]');
    let activePeerUid = providerUid;
    let activePeerName = 'Choose a conversation';

    async function refreshChatList() {
      const conversations = await authHelper.listConversations();
      if (providerUid && !conversations.some((conversation) => conversation.peerUid === providerUid)) {
        const provider = await getProviderByIdentity(providerUid, providerProvince);
        if (provider) {
          conversations.unshift({
            conversationId: `${account.uid}__${provider.uid}`,
            peerUid: provider.uid,
            peerName: provider.displayName,
            lastMessage: 'Start the conversation',
            createdAtMs: Date.now()
          });
        }
      }

      chatList.innerHTML = conversations.length
        ? conversations.map((conversation) => `
          <button type="button" class="messages-chat-item ${conversation.peerUid === activePeerUid ? 'is-active' : ''}" data-chat-peer="${conversation.peerUid}">
            <strong>${conversation.peerName}</strong>
            <div>${conversation.lastMessage}</div>
          </button>
        `).join('')
        : `<div class="specialists-empty">No messages yet. Start by viewing a provider profile.</div>`;

      chatList.querySelectorAll('[data-chat-peer]').forEach((button) => {
        button.addEventListener('click', () => {
          activePeerUid = button.getAttribute('data-chat-peer') || '';
          activePeerName = button.querySelector('strong')?.textContent || 'Conversation';
          refreshMessages();
          refreshChatList();
        });
      });
    }

    async function refreshMessages() {
      if (!activePeerUid) {
        threadTitle.textContent = 'Messages';
        threadBody.innerHTML = `<div class="messages-empty"><div><h2>Select a chat</h2><p>Your conversation with a provider will appear here.</p></div></div>`;
        return;
      }

      const provider = await getProviderByIdentity(activePeerUid, providerProvince);
      activePeerName = provider?.displayName || activePeerName;
      threadTitle.textContent = activePeerName;
      const messages = await authHelper.listMessagesWithUser(activePeerUid);
      threadBody.innerHTML = messages.length
        ? messages.map((message) => `
          <div class="message-bubble ${message.fromUid === account.uid ? 'is-mine' : 'is-theirs'}">${message.text}</div>
        `).join('')
        : `<div class="messages-empty"><div><h2>Start the conversation</h2><p>Send the first message to ${activePeerName}.</p></div></div>`;
      threadBody.scrollTop = threadBody.scrollHeight;
    }

    composeForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!activePeerUid) return;
      const text = composeInput?.value.trim() || '';
      if (!text) return;
      const submitBtn = composeForm.querySelector('.messages-send-btn');
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
      try {
        await authHelper.sendMessageToProvider({
          toUid: activePeerUid,
          toProvinceSlug: providerProvince,
          toName: activePeerName,
          text
        });
        composeForm.reset();
        refreshMessages();
        refreshChatList();
      } catch (error) {
        window.alert(error.message || 'Could not send message.');
      } finally {
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
      }
    });

    refreshChatList();
    refreshMessages();
  }

  async function enrichAccountPage() {
    if (!document.getElementById('account-dashboard')) return;
    const account = getStoredAccount();
    if (!account?.loggedIn) return;

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;

    try {
      const userDoc = await authHelper.getUserDocument(account.uid);
      const providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug);
      const providerIdEl = document.getElementById('account-provider-id');
      const provinceEl = document.getElementById('account-profile-province');
      const whatsappEl = document.getElementById('account-profile-whatsapp');
      const experienceEl = document.getElementById('account-profile-experience');
      const categoryEl = document.getElementById('account-profile-category');
      const specialtyEl = document.getElementById('account-profile-specialty');
      if (providerIdEl) providerIdEl.textContent = userDoc?.providerPublicId || providerProfile?.providerPublicId || 'Pending';
      if (provinceEl) provinceEl.textContent = userDoc?.providerProvince || providerProfile?.province || 'Not set';
      if (whatsappEl) whatsappEl.textContent = userDoc?.whatsappNumber || providerProfile?.whatsappNumber || 'Not set';
      if (experienceEl) experienceEl.textContent = userDoc?.experience || providerProfile?.experience || 'Not set';
      if (categoryEl) categoryEl.textContent = userDoc?.primaryCategory || providerProfile?.primaryCategory || 'Not set';
      if (specialtyEl) specialtyEl.textContent = userDoc?.specialty || providerProfile?.specialty || 'Not set';
    } catch (error) {
      // Keep the account page usable even if provider data is unavailable.
    }
  }

  function initialize() {
    injectProviderExperienceStyles();
    setupOnboarding();
    renderSpecialistsPage();
    renderProviderProfilePage();
    renderPostsPage();
    renderMessagesPage();
    enrichAccountPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
