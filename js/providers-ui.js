(function providerUiBootstrap() {
  const SPECIALIST_CATEGORIES = [
    {
      key: 'home-services',
      label: 'Home Services',
      image: 'images/categories/home-services.jpg',
      subservices: ['Gardener', 'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Handyman']
    },
    {
      key: 'beauty-wellness',
      label: 'Beauty & Wellness',
      image: 'images/categories/beauty-and-wellness.jpg',
      subservices: ['Hairdresser', 'Barber', 'Makeup Artist', 'Nail Technician', 'Massage Therapist']
    },
    {
      key: 'digital-business',
      label: 'Digital & Business',
      image: 'images/categories/business.jpg',
      subservices: ['Programmer', 'Designer', 'Photographer', 'Videographer', 'Social Media Manager']
    },
    {
      key: 'plumbing',
      label: 'Plumbing',
      image: 'images/categories/plumbing.jpg',
      subservices: ['Leak Repairs', 'Blocked Drains', 'Tank Cleaning']
    },
    {
      key: 'security-services',
      label: 'Security Services',
      image: 'images/categories/security-services.jpg',
      subservices: ['Guarding', 'Alarm Setup', 'Gate Monitoring']
    },
    {
      key: 'tutoring',
      label: 'Tutoring',
      image: 'images/categories/tutoring.jpg',
      subservices: ['Maths Tutor', 'Science Tutor', 'Exam Prep']
    },
    {
      key: 'childcare',
      label: 'Childcare',
      image: 'images/categories/childcare.jpg',
      subservices: ['Babysitting', 'Nanny Support', 'After-school Care']
    },
    {
      key: 'photography',
      label: 'Photography',
      image: 'images/categories/photography.jpg',
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
    const provinceSlug = provider.provinceSlug || slugify(provider.province || 'harare');
    const specialty = provider.specialty || 'Specialist';
    const primaryCategory = provider.primaryCategory || getCategoryConfig('').label;
    const city = provider.city || provider.address || provider.province || '';
    return {
      ...provider,
      provinceSlug,
      specialty,
      primaryCategory,
      city,
      averageRating: Number(provider.averageRating || 4.7),
      reviewCount: Number(provider.reviewCount || 0),
      completedJobs: Number(provider.completedJobs || 0),
      bio: provider.bio || 'WorkLinkUp specialist ready to help.',
      profileImageData: provider.profileImageData || getCategoryConfig(primaryCategory).image,
      bannerImageData: provider.bannerImageData || 'images/sections/findme.png',
      profileUrl: `${getBase()}pages/provider-profile.html?uid=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provinceSlug)}`,
      messageUrl: `${getBase()}pages/messages.html?provider=${encodeURIComponent(provider.uid)}&province=${encodeURIComponent(provinceSlug)}`
    };
  }

  function createCircleCardsMarkup(base, isLoop = false) {
    const cards = SPECIALIST_CATEGORIES.map((category) => `
      <a href="${base}pages/specialists.html?category=${encodeURIComponent(category.label)}" class="category-circle specialist-category-chip" data-category-chip="${category.label}">
        <div class="category-circle-img">
          <img src="${base}${category.image}" alt="${escapeHtml(category.label)}" />
        </div>
        <span>${escapeHtml(category.label)}</span>
      </a>
    `).join('');

    return isLoop ? `${cards}${cards}` : cards;
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
    return SPECIALIST_CATEGORIES.map((category, index) => `
      <div class="service-filter-group">
        <button type="button" class="service-filter-toggle" data-filter-group="${escapeHtml(category.label)}" aria-expanded="${index === 0 ? 'true' : 'false'}">
          <span>${escapeHtml(category.label)}</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="service-filter-links" ${index === 0 ? '' : 'hidden'}>
          <button type="button" class="${selectedCategory === category.label && !selectedSubservice ? 'is-active' : ''}" data-filter-category="${escapeHtml(category.label)}">All ${escapeHtml(category.label)}</button>
          ${category.subservices.map((service) => `
            <button type="button" class="${selectedSubservice === service ? 'is-active' : ''}" data-filter-subservice="${escapeHtml(service)}" data-parent-category="${escapeHtml(category.label)}">
              ${escapeHtml(service)}
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
      const searchHaystack = `${provider.displayName} ${provider.primaryCategory} ${provider.specialty} ${provider.city} ${provider.province} ${provider.bio} ${provider.address}`.toLowerCase();
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
        <div class="specialist-card-banner" style="background-image: linear-gradient(180deg, rgba(12, 24, 48, 0.18) 0%, rgba(12, 24, 48, 0.82) 100%), url('${escapeHtml(resolveMediaSrc(provider.bannerImageData, 'images/sections/findme.png'))}');">
          <div class="specialist-card-rating">${provider.averageRating.toFixed(1)} ★</div>
          <img class="specialist-card-avatar" src="${escapeHtml(resolveMediaSrc(provider.profileImageData, 'images/logo/logo.jpg'))}" alt="${escapeHtml(provider.displayName)} profile image" />
          <div class="specialist-card-banner-copy">
            <h3>${escapeHtml(provider.displayName)}</h3>
            <p>${escapeHtml(provider.specialty)}</p>
          </div>
        </div>
        <div class="specialist-card-body">
          <div class="specialist-card-location">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(provider.address || `${provider.city}, ${provider.province}`)}</span>
          </div>
          <div class="specialist-card-tags">
            <span class="provider-meta-chip">${escapeHtml(provider.primaryCategory)}</span>
            <span class="provider-meta-chip">${escapeHtml(provider.experience || 'Experienced')}</span>
          </div>
          <p>${escapeHtml(provider.bio)}</p>
          <div class="specialist-actions">
            <a href="${escapeHtml(buildWhatsAppLink(provider.whatsappNumber, provider.displayName))}" class="provider-contact-btn whatsapp-btn" target="_blank" rel="noreferrer">
              <i class="fa-brands fa-whatsapp"></i>
              <span>WhatsApp</span>
            </a>
            <a href="${escapeHtml(provider.profileUrl)}" class="specialists-view-btn">View Their Work</a>
          </div>
        </div>
      </article>
    `).join('');
  }

  async function readImageAsBase64(file, options = {}) {
    if (!file) return '';
    const {
      maxWidth = 1280,
      maxHeight = 1280,
      quality = 0.82
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
    return canvas.toDataURL('image/jpeg', quality);
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
                    <input id="provider-specialty" name="specialty" type="text" placeholder="Plumber, Nail Technician, Tutor..." required />
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
    const src = resolveMediaSrc(imageData, mode === 'avatar' ? 'images/logo/logo.jpg' : 'images/sections/findme.png');
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
      if (specialtyField) specialtyField.value = prefill.specialty || '';
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
      if (!uploadState.profileImageData || !uploadState.bannerImageData) {
        window.alert('Add both your profile image and banner image before saving.');
        return;
      }
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.saveProviderProfile !== 'function') return;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.profileImageData = uploadState.profileImageData;
      payload.bannerImageData = uploadState.bannerImageData;

      if (submitBtn instanceof HTMLButtonElement) {
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');
      }
      try {
        await authHelper.saveProviderProfile(payload);
        closeOnboarding();
        window.location.reload();
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
      const account = getStoredAccount();
      if (!account?.loggedIn) return;
      if (window.location.pathname.endsWith('/help.html')) return;

      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.getUserDocument !== 'function') return;

      try {
        const userDoc = await authHelper.getUserDocument(account.uid);
        let providerProfile = null;
        if (typeof authHelper.getProviderProfileByUid === 'function') {
          providerProfile = await authHelper.getProviderProfileByUid(account.uid, userDoc?.providerProvinceSlug || account.providerProvinceSlug);
        }

        const hasCompletedProfile = Boolean(
          userDoc?.providerProfileComplete ||
          providerProfile?.uid ||
          providerProfile?.provinceSlug
        );

        if (hasCompletedProfile) return;

        openOnboarding({
          ...(userDoc || {}),
          ...(providerProfile || {}),
          name: userDoc?.name || account.name,
          phone: userDoc?.phone || account.phone
        });
      } catch (error) {
        openOnboarding(account);
      }
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
    const searchInput = page.querySelector('[data-specialists-search]');
    const ratingButtons = Array.from(page.querySelectorAll('[data-rating-filter]'));
    const filterBtn = page.querySelector('[data-open-specialists-sheet]');
    const ratingSheetBtn = page.querySelector('[data-open-specialists-rating-sheet]');
    const sheetCloseBtn = page.querySelector('[data-close-specialists-sheet]');
    const ratingSheetCloseBtn = page.querySelector('[data-close-specialists-rating-sheet]');
    const currentCategory = new URLSearchParams(window.location.search).get('category') || '';
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const providers = [];
    const state = {
      category: currentCategory,
      subservice: '',
      rating: 0,
      search: ''
    };

    function renderCategoryRail() {
      if (!categoriesHost) return;
      const mobileLoop = mobileQuery.matches;
      categoriesHost.classList.toggle('is-marquee', mobileLoop);
      categoriesHost.innerHTML = createCircleCardsMarkup(base, mobileLoop);
      categoriesHost.querySelectorAll('[data-category-chip]').forEach((chip) => {
        chip.classList.toggle('is-active', chip.getAttribute('data-category-chip') === state.category);
      });
    }

    function renderFilters() {
      const markup = buildServiceFilterMarkup(state.category, state.subservice);
      if (sidebarHost) sidebarHost.innerHTML = markup;
      if (mobileSheetBody) mobileSheetBody.innerHTML = markup;
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
      bindFilterInteractions(sidebarHost);
      bindFilterInteractions(mobileSheetBody);
      renderProviderCards(resultsHost, filtered);
      if (totalHost) totalHost.textContent = `${filtered.length} specialist${filtered.length === 1 ? '' : 's'}`;

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

    mobileRatingOptions.forEach((button) => {
      button.addEventListener('click', () => {
        const ratingValue = Number(button.getAttribute('data-rating-filter') || 0);
        state.rating = ratingValue;
        update();
        if (mobileRatingSheet) mobileRatingSheet.hidden = true;
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
      sidebarLayout.classList.toggle('is-sidebar-collapsed');
    });

    mobileQuery.addEventListener('change', renderCategoryRail);

    try {
      if (page instanceof HTMLElement) page.classList.add('is-loading');
      const remoteProviders = await getProviders();
      providers.splice(0, providers.length, ...remoteProviders);
      update();
    } finally {
      if (page instanceof HTMLElement) page.classList.remove('is-loading');
    }

    if (mainColumn instanceof HTMLElement) {
      mainColumn.style.minHeight = 'calc(100vh - 88px)';
    }
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
      <div class="provider-dialog-card">
        <h3>Edit your profile</h3>
        <p>Update the details finders see on your artisan profile.</p>
        <form class="provider-editor-form" data-provider-editor-form>
          <div class="provider-editor-grid">
            <label><span>Full name</span><input name="fullName" type="text" value="${escapeHtml(provider.displayName || '')}" required /></label>
            <label><span>WhatsApp number</span><input name="whatsappNumber" type="tel" value="${escapeHtml(provider.whatsappNumber || '')}" required /></label>
            <label><span>Province</span>
              <select name="province" required>
                ${ZIMBABWE_PROVINCES.map((provinceName) => `<option value="${provinceName}" ${provinceName === provider.province ? 'selected' : ''}>${provinceName}</option>`).join('')}
              </select>
            </label>
            <label><span>City / suburb</span><input name="city" type="text" value="${escapeHtml(provider.city || '')}" required /></label>
            <label class="provider-editor-span"><span>Address</span><input name="address" type="text" value="${escapeHtml(provider.address || '')}" required /></label>
            <label><span>Experience</span><input name="experience" type="text" value="${escapeHtml(provider.experience || '')}" required /></label>
            <label><span>Category</span>
              <select name="primaryCategory" required>
                ${SPECIALIST_CATEGORIES.map((category) => `<option value="${category.label}" ${category.label === provider.primaryCategory ? 'selected' : ''}>${category.label}</option>`).join('')}
              </select>
            </label>
            <label><span>Specialty</span><input name="specialty" type="text" value="${escapeHtml(provider.specialty || '')}" required /></label>
            <label class="provider-editor-span"><span>Bio</span><textarea name="bio" required>${escapeHtml(provider.bio || '')}</textarea></label>
            <label><span>Profile image</span><input type="file" name="profileImageFile" accept="image/*" /></label>
            <label><span>Banner image</span><input type="file" name="bannerImageFile" accept="image/*" /></label>
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
      cancelBtn?.addEventListener('click', closeProviderDialog);
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
            <img src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.png'))}" alt="Post preview" />
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
    const backBtn = page.querySelector('[data-provider-back]');
    const postGrid = page.querySelector('[data-provider-post-grid]');

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

      const workLabel = [freshProvider.specialty, freshProvider.primaryCategory].filter(Boolean).join(' • ') || 'Specialist';
      const locationLabel = freshProvider.address || [freshProvider.city, freshProvider.province].filter(Boolean).join(', ') || 'Location not shared';
      const phoneNumber = String(freshProvider.whatsappNumber || '').trim();
      const bannerSrc = resolveMediaSrc(freshProvider.bannerImageData, 'images/sections/findme.png');
      const avatarSrc = resolveMediaSrc(freshProvider.profileImageData, 'images/logo/logo.jpg');
      const postImageSources = posts.map((post) => resolveMediaSrc(post.imageData, 'images/sections/findme.png'));

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
        editProfileBtn.onclick = () => openProfileEditor(freshProvider, refreshProfile);
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
                <img class="provider-dialog-hero-image" src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.png'))}" alt="Work preview" />
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
            <img src="${escapeHtml(resolveMediaSrc(post.imageData, 'images/sections/findme.png'))}" alt="Provider post" />
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
          <button type="button" class="messages-chat-item ${conversation.peerUid === activePeerUid ? 'is-active' : ''}" data-chat-peer="${escapeHtml(conversation.peerUid)}">
            <strong>${escapeHtml(conversation.peerName)}</strong>
            <div>${escapeHtml(conversation.lastMessage)}</div>
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
          <div class="message-bubble ${message.fromUid === account.uid ? 'is-mine' : 'is-theirs'}">${escapeHtml(message.text)}</div>
        `).join('')
        : `<div class="messages-empty"><div><h2>Start the conversation</h2><p>Send the first message to ${escapeHtml(activePeerName)}.</p></div></div>`;
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
