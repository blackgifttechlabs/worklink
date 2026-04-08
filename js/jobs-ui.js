(function jobsUiBootstrap() {
  const CATALOG = Array.isArray(window.WorkLinkUpServiceCatalog) ? window.WorkLinkUpServiceCatalog : [];
  const FILTER_WINDOWS = {
    all: Number.POSITIVE_INFINITY,
    today: 1,
    week: 7,
    month: 31
  };

  function getBase() {
    if (typeof getBasePath === 'function') return getBasePath();
    return window.location.pathname.includes('/pages/') ? '../' : '';
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

  function setButtonLoading(button, isLoading) {
    if (!(button instanceof HTMLElement)) return;
    button.classList.toggle('is-loading', Boolean(isLoading));
    if (button instanceof HTMLButtonElement) button.disabled = Boolean(isLoading);
  }

  function waitForAuthHelper(timeoutMs = 12000) {
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

  function buildSelectOptions(items = [], selected = '', placeholder = '') {
    const normalizedSelected = String(selected || '').trim();
    const placeholderMarkup = placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : '';
    return `${placeholderMarkup}${items.map((item) => {
      const value = String(item || '').trim();
      return `<option value="${escapeHtml(value)}" ${value === normalizedSelected ? 'selected' : ''}>${escapeHtml(value)}</option>`;
    }).join('')}`;
  }

  function getCategoryConfig(label = '') {
    return CATALOG.find((category) => category.label === label) || CATALOG[0] || { label: '', subservices: [] };
  }

  function getSubservicesForCategory(label = '') {
    const category = getCategoryConfig(label);
    return Array.isArray(category.subservices) ? category.subservices : [];
  }

  function buildSubcategoryOptions(categoryLabel = '', selected = '') {
    return buildSelectOptions(getSubservicesForCategory(categoryLabel), selected, 'Optional subcategory');
  }

  async function readImageAsBase64(file, options = {}) {
    if (!file) return '';
    const {
      maxWidth = 1600,
      maxHeight = 1600,
      quality = 0.82,
      outputType = 'image/avif'
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
    const ratio = Math.min(1, maxWidth / image.width, maxHeight / image.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.width * ratio));
    canvas.height = Math.max(1, Math.round(image.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) return sourceDataUrl;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL(outputType, quality);
    if (outputType === 'image/avif' && !data.startsWith('data:image/avif')) {
      return canvas.toDataURL('image/webp', quality);
    }
    return data;
  }

  function resolveMediaSrc(value, fallback = '') {
    const source = String(value || '').trim();
    if (!source) return fallback || `${getBase()}images/logo/logo.jpg`;
    if (/^(data:|https?:|blob:|\/)/.test(source)) return source;
    return `${getBase()}${source}`;
  }

  function formatCurrency(value) {
    const amount = Number(value || 0);
    return `US$${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function formatDateLabel(timestamp) {
    const date = new Date(Number(timestamp || 0));
    return new Intl.DateTimeFormat('en-ZW', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  }

  function formatShortDate(timestamp) {
    const date = new Date(Number(timestamp || 0));
    return new Intl.DateTimeFormat('en-ZW', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  function isInFilterWindow(filterKey, timestamp) {
    const days = FILTER_WINDOWS[filterKey] ?? Number.POSITIVE_INFINITY;
    if (!Number.isFinite(days)) return true;
    const now = Date.now();
    return Number(timestamp || 0) >= now - (days * 24 * 60 * 60 * 1000);
  }

  function getSearchText(job = {}) {
    return [
      job.category,
      job.subcategory,
      job.description,
      job.address,
      job.city,
      job.ownerName
    ].join(' ').toLowerCase();
  }

  function groupJobsByDate(jobs = []) {
    const groups = new Map();
    jobs.forEach((job) => {
      const key = formatDateLabel(job.createdAtMs);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(job);
    });
    return Array.from(groups.entries());
  }

  function buildJobHref(jobId = '') {
    const url = new URL(`${getBase()}pages/job-posts.html`, window.location.href);
    if (jobId) url.searchParams.set('job', jobId);
    return `${url.pathname}${url.search}`;
  }

  function savePendingJobBid(jobId = '') {
    if (!jobId) return;
    try {
      sessionStorage.setItem('worklinkup_pending_job_bid', JSON.stringify({ jobId }));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function readPendingJobBid() {
    try {
      const raw = sessionStorage.getItem('worklinkup_pending_job_bid');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function clearPendingJobBid() {
    try {
      sessionStorage.removeItem('worklinkup_pending_job_bid');
    } catch (error) {
      // Ignore storage issues.
    }
  }

  async function ensureProviderReady(authHelper) {
    const account = getStoredAccount();
    if (!account?.loggedIn || !authHelper) {
      return { ready: false, reason: 'Please sign in first.' };
    }
    const userDoc = await authHelper.getUserDocument(account.uid).catch(() => null);
    const providerProfile = await authHelper.getProviderProfileByUid(account.uid, account.providerProvinceSlug || userDoc?.providerProvinceSlug || '').catch(() => null);
    if (!providerProfile) {
      return { ready: false, reason: 'Complete your provider profile before bidding on jobs.' };
    }
    return { ready: true, userDoc, providerProfile };
  }

  function buildJobAuthCardMarkup(scope = 'post') {
    return `
      <section class="job-auth-card" data-job-auth-card data-auth-scope="${scope}">
        <div class="job-auth-head">
          <div>
            <span class="job-auth-kicker">${scope === 'bid' ? 'Continue to bid' : 'Continue to post'}</span>
            <h3>${scope === 'bid' ? 'Sign in as a provider' : 'Create your hiring account'}</h3>
          </div>
          <div class="job-auth-mode-switch">
            <button type="button" class="is-active" data-job-auth-mode="signup">Create account</button>
            <button type="button" data-job-auth-mode="signin">Sign in</button>
          </div>
        </div>
        <div class="job-auth-id-switch">
          <button type="button" class="is-active" data-job-auth-id-mode="email">Email</button>
          <button type="button" data-job-auth-id-mode="phone">Phone</button>
        </div>
        <div class="job-auth-fields">
          <label class="job-auth-field" data-job-auth-name-row>
            <span>Full name</span>
            <input type="text" data-job-auth-name placeholder="Tinashe Moyo" />
          </label>
          <label class="job-auth-field">
            <span data-job-auth-identifier-label>Email address</span>
            <input type="text" data-job-auth-identifier placeholder="you@example.com" />
          </label>
          <label class="job-auth-field">
            <span>Password</span>
            <input type="password" data-job-auth-password placeholder="Enter password" />
          </label>
        </div>
        <p class="job-auth-note" data-job-auth-note>${scope === 'bid' ? 'Use your provider account so you can place a bid and continue chatting if chosen.' : 'Use email or phone plus a password so your job dashboard is saved to your account.'}</p>
        <button type="button" class="btn-primary job-auth-submit" data-job-auth-submit>${scope === 'bid' ? 'Continue' : 'Create account and post job'}</button>
      </section>
    `;
  }

  function bindJobAuthCard(scope, onComplete) {
    const host = document.querySelector(`[data-job-auth-card][data-auth-scope="${scope}"]`);
    if (!(host instanceof HTMLElement)) return;

    const modeButtons = Array.from(host.querySelectorAll('[data-job-auth-mode]'));
    const idModeButtons = Array.from(host.querySelectorAll('[data-job-auth-id-mode]'));
    const nameRow = host.querySelector('[data-job-auth-name-row]');
    const nameInput = host.querySelector('[data-job-auth-name]');
    const identifierInput = host.querySelector('[data-job-auth-identifier]');
    const identifierLabel = host.querySelector('[data-job-auth-identifier-label]');
    const passwordInput = host.querySelector('[data-job-auth-password]');
    const note = host.querySelector('[data-job-auth-note]');
    const submitBtn = host.querySelector('[data-job-auth-submit]');
    let authMode = 'signup';
    let idMode = 'email';

    function sync() {
      modeButtons.forEach((button) => button.classList.toggle('is-active', button.getAttribute('data-job-auth-mode') === authMode));
      idModeButtons.forEach((button) => button.classList.toggle('is-active', button.getAttribute('data-job-auth-id-mode') === idMode));
      if (nameRow instanceof HTMLElement) nameRow.hidden = authMode !== 'signup';
      if (identifierLabel instanceof HTMLElement) identifierLabel.textContent = idMode === 'phone' ? 'Phone number' : 'Email address';
      if (identifierInput instanceof HTMLInputElement) {
        identifierInput.placeholder = idMode === 'phone' ? '+263 77 123 4567' : 'you@example.com';
      }
      if (note instanceof HTMLElement) {
        note.textContent = scope === 'bid'
          ? (authMode === 'signup'
            ? 'Create a provider account with email or phone. If your service profile is not complete yet, you will finish that next.'
            : 'Sign in with your provider account to continue placing this bid.')
          : 'Use email or phone plus a password so your job dashboard is saved to your account.';
      }
      if (submitBtn instanceof HTMLElement) {
        submitBtn.textContent = scope === 'bid'
          ? (authMode === 'signup' ? 'Create provider account' : 'Sign in and continue')
          : (authMode === 'signup' ? 'Create account and post job' : 'Sign in and post job');
      }
    }

    modeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        authMode = button.getAttribute('data-job-auth-mode') || 'signup';
        sync();
      });
    });
    idModeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        idMode = button.getAttribute('data-job-auth-id-mode') || 'email';
        sync();
      });
    });

    submitBtn?.addEventListener('click', async () => {
      const authHelper = await waitForAuthHelper();
      if (!authHelper) return;
      const identifier = String(identifierInput?.value || '').trim();
      const password = String(passwordInput?.value || '').trim();
      const name = String(nameInput?.value || '').trim();
      if (!identifier || !password || (authMode === 'signup' && !name)) {
        window.alert('Fill in the required account fields first.');
        return;
      }
      setButtonLoading(submitBtn, true);
      try {
        if (authMode === 'signup') {
          await authHelper.signUpWithIdentifier(name, identifier, password, idMode, {
            userRole: scope === 'bid' ? 'provider' : 'client',
            phone: idMode === 'phone' ? identifier : ''
          });
        } else {
          await authHelper.signInWithIdentifier(identifier, password, idMode);
        }
        if (typeof authHelper.waitForAuthSession === 'function') {
          const account = getStoredAccount();
          await authHelper.waitForAuthSession(account?.uid || '', 12000).catch(() => null);
        }
        if (typeof onComplete === 'function') {
          await onComplete({
            authMode,
            idMode,
            identifier,
            name
          });
        }
      } catch (error) {
        window.alert(error.message || 'Could not complete authentication.');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });

    sync();
  }

  async function renderPostJobPage() {
    const page = document.querySelector('[data-job-post-page]');
    if (!page) return;

    const authHelper = await waitForAuthHelper();
    const account = getStoredAccount();
    const userDoc = account?.loggedIn && authHelper?.getUserDocument
      ? await authHelper.getUserDocument(account.uid).catch(() => null)
      : null;
    const clientProfile = account?.loggedIn && authHelper?.getClientProfileByUid
      ? await authHelper.getClientProfileByUid(account.uid).catch(() => null)
      : null;
    const defaultCategory = CATALOG[0]?.label || '';

    page.innerHTML = `
      <section class="job-page-shell">
        <div class="job-page-hero">
          <span class="job-page-kicker">Post a Job</span>
          <h1>Tell people what you need done.</h1>
          <p>Create a short job post, share your budget, and let providers bid for the work.</p>
          <div class="job-page-hero-actions">
            <a href="${getBase()}pages/job-posts.html" class="btn-secondary fleece-secondary">View Available Jobs</a>
          </div>
        </div>

        <form class="job-post-form" data-job-post-form>
          <div class="job-form-grid">
            <label class="job-form-field">
              <span>Job category</span>
              <select name="category" data-job-category required>${buildSelectOptions(CATALOG.map((category) => category.label), defaultCategory)}</select>
            </label>
            <label class="job-form-field">
              <span>Subcategory</span>
              <select name="subcategory" data-job-subcategory>${buildSubcategoryOptions(defaultCategory, '')}</select>
            </label>
            <label class="job-form-field is-wide">
              <span>Describe the job</span>
              <textarea name="description" required placeholder="I need someone to cut trees in my yard and remove the branches after the work is done."></textarea>
            </label>
            <label class="job-form-field">
              <span>Budget</span>
              <input type="number" name="budget" min="1" step="1" required placeholder="120" />
            </label>
            <label class="job-form-field is-wide">
              <span>Address where the job needs to be done</span>
              <textarea name="address" required placeholder="12 Mukuvisi Road, Greendale, Harare"></textarea>
            </label>
          </div>

          ${account?.loggedIn ? `
            <section class="job-post-signed-in-card">
              <strong>Posting as ${escapeHtml(clientProfile?.displayName || userDoc?.name || account.name || 'your account')}</strong>
              <span>Your job will go into your hiring dashboard after posting.</span>
            </section>
          ` : buildJobAuthCardMarkup('post')}

          <div class="job-post-form-actions">
            <button type="submit" class="btn-primary" data-job-post-submit>Post Job</button>
            <a href="${getBase()}pages/job-posts.html" class="btn-secondary fleece-secondary">View Available Jobs</a>
          </div>
        </form>
      </section>
    `;

    const form = page.querySelector('[data-job-post-form]');
    const categorySelect = page.querySelector('[data-job-category]');
    const subcategorySelect = page.querySelector('[data-job-subcategory]');
    const submitBtn = page.querySelector('[data-job-post-submit]');

    categorySelect?.addEventListener('change', () => {
      if (!(categorySelect instanceof HTMLSelectElement) || !(subcategorySelect instanceof HTMLSelectElement)) return;
      subcategorySelect.innerHTML = buildSubcategoryOptions(categorySelect.value, '');
    });

    if (!account?.loggedIn) {
      bindJobAuthCard('post', async () => {
        window.location.reload();
      });
    }

    form?.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!(form instanceof HTMLFormElement)) return;
      if (!authHelper) return;
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      if (!payload.category || !payload.description || !payload.address || !payload.budget) {
        window.alert('Fill in the job details first.');
        return;
      }

      setButtonLoading(submitBtn, true);
      try {
        let currentAccount = getStoredAccount();
        let latestUserDoc = userDoc;
        let latestClientProfile = clientProfile;

        if (currentAccount?.loggedIn && typeof authHelper.waitForAuthSession === 'function') {
          await authHelper.waitForAuthSession(currentAccount.uid, 12000).catch(() => null);
        }

        currentAccount = getStoredAccount();
        latestUserDoc = currentAccount?.loggedIn ? await authHelper.getUserDocument(currentAccount.uid).catch(() => latestUserDoc) : latestUserDoc;
        latestClientProfile = currentAccount?.loggedIn ? await authHelper.getClientProfileByUid(currentAccount.uid).catch(() => latestClientProfile) : latestClientProfile;

        const postAuthCard = page.querySelector('[data-auth-scope="post"]');
        const authMode = postAuthCard?.querySelector('[data-job-auth-mode].is-active')?.getAttribute('data-job-auth-mode') || 'signup';
        const idMode = postAuthCard?.querySelector('[data-job-auth-id-mode].is-active')?.getAttribute('data-job-auth-id-mode') || 'email';
        const identifier = String(postAuthCard?.querySelector('[data-job-auth-identifier]')?.value || '').trim();
        const password = String(postAuthCard?.querySelector('[data-job-auth-password]')?.value || '').trim();
        const name = String(postAuthCard?.querySelector('[data-job-auth-name]')?.value || '').trim();

        if (!currentAccount?.loggedIn) {
          if (!identifier || !password || (authMode === 'signup' && !name)) {
            throw new Error('Fill in the account fields so we can publish this job under your profile.');
          }
          if (authMode === 'signup') {
            await authHelper.signUpWithIdentifier(name, identifier, password, idMode, {
              userRole: 'client',
              phone: idMode === 'phone' ? identifier : ''
            });
          } else {
            await authHelper.signInWithIdentifier(identifier, password, idMode);
          }
          currentAccount = getStoredAccount();
          latestUserDoc = currentAccount?.loggedIn ? await authHelper.getUserDocument(currentAccount.uid).catch(() => null) : null;
          latestClientProfile = currentAccount?.loggedIn ? await authHelper.getClientProfileByUid(currentAccount.uid).catch(() => null) : null;
        }

        if (!currentAccount?.loggedIn) {
          throw new Error('Sign in first to post your job.');
        }

        const phoneValue = latestClientProfile?.phone || latestUserDoc?.phone || (idMode === 'phone' ? identifier : currentAccount.phone || '');
        const emailValue = latestClientProfile?.email || latestUserDoc?.email || (idMode === 'email' ? identifier : currentAccount.email || '');
        await authHelper.saveClientProfile({
          displayName: latestClientProfile?.displayName || latestUserDoc?.name || currentAccount.name || name,
          phone: phoneValue,
          email: emailValue,
          address: String(payload.address || '').trim(),
          city: String(payload.address || '').split(',')[0] || ''
        });

        await authHelper.createJobPost({
          category: payload.category,
          subcategory: payload.subcategory,
          description: payload.description,
          budget: payload.budget,
          address: payload.address
        });

        window.location.href = `${getBase()}pages/job-giver-profile.html?created=1`;
      } catch (error) {
        window.alert(error.message || 'Could not post your job.');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  async function renderJobPostsPage() {
    const page = document.querySelector('[data-job-posts-page]');
    if (!page) return;

    const authHelper = await waitForAuthHelper();
    if (!authHelper || typeof authHelper.listJobPosts !== 'function') return;

    page.innerHTML = `
      <section class="job-page-shell">
        <div class="job-page-hero">
          <span class="job-page-kicker">Available Jobs</span>
          <h1>Browse open jobs and place your bid.</h1>
          <p>Jobs are grouped by date, and you can quickly filter down to today, this week, or this month.</p>
          <div class="job-page-hero-actions">
            <a href="${getBase()}pages/post-job.html" class="btn-primary">Post Job</a>
          </div>
        </div>

        <section class="job-board-toolbar">
          <label class="job-board-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="search" placeholder="Search by category, subcategory, address, or job detail" data-job-search />
          </label>
          <div class="job-board-filters" data-job-filters>
            <button type="button" class="is-active" data-job-filter="all">All</button>
            <button type="button" data-job-filter="today">Today</button>
            <button type="button" data-job-filter="week">This Week</button>
            <button type="button" data-job-filter="month">This Month</button>
          </div>
        </section>

        <section class="job-board-groups" data-job-groups></section>
      </section>

      <div class="job-modal-shell" data-job-detail-modal hidden></div>
      <div class="job-modal-shell" data-job-bid-modal hidden></div>
      <div class="job-modal-shell" data-job-auth-modal hidden></div>
    `;

    const groupsHost = page.querySelector('[data-job-groups]');
    const searchInput = page.querySelector('[data-job-search]');
    const detailModal = page.querySelector('[data-job-detail-modal]');
    const bidModal = page.querySelector('[data-job-bid-modal]');
    const authModal = page.querySelector('[data-job-auth-modal]');
    const filterButtons = Array.from(page.querySelectorAll('[data-job-filter]'));
    const params = new URLSearchParams(window.location.search);
    let jobs = await authHelper.listJobPosts().catch(() => []);
    let activeFilter = 'all';
    let query = '';

    function closeModal(modal) {
      if (!(modal instanceof HTMLElement)) return;
      modal.hidden = true;
      modal.innerHTML = '';
      document.body.classList.remove('job-modal-open');
    }

    function openModal(modal, markup) {
      if (!(modal instanceof HTMLElement)) return;
      modal.hidden = false;
      modal.innerHTML = markup;
      document.body.classList.add('job-modal-open');
      modal.querySelectorAll('[data-job-modal-close]').forEach((button) => {
        button.addEventListener('click', () => closeModal(modal));
      });
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal);
      }, { once: true });
    }

    function getFilteredJobs() {
      return jobs.filter((job) => {
        if (!isInFilterWindow(activeFilter, job.createdAtMs)) return false;
        if (!query) return true;
        return getSearchText(job).includes(query.toLowerCase());
      });
    }

    function renderJobs() {
      const filteredJobs = getFilteredJobs();
      const grouped = groupJobsByDate(filteredJobs);
      groupsHost.innerHTML = grouped.length ? grouped.map(([label, items]) => `
        <section class="job-group">
          <div class="job-group-head">
            <h2>${escapeHtml(label)}</h2>
            <span>${items.length} job${items.length === 1 ? '' : 's'}</span>
          </div>
          <div class="job-card-grid">
            ${items.map((job) => `
              <article class="job-card">
                <div class="job-card-top">
                  <div>
                    <span class="job-card-tag">${escapeHtml(job.category)}</span>
                    ${job.subcategory ? `<span class="job-card-subtag">${escapeHtml(job.subcategory)}</span>` : ''}
                  </div>
                  <strong>${escapeHtml(formatCurrency(job.budget))}</strong>
                </div>
                <h3>${escapeHtml(job.subcategory || job.category)}</h3>
                <p>${escapeHtml(String(job.description || '').slice(0, 150))}${String(job.description || '').length > 150 ? '…' : ''}</p>
                <div class="job-card-meta">
                  <span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.address || 'Address not shared')}</span>
                  <span><i class="fa-regular fa-clock"></i>${escapeHtml(formatShortDate(job.createdAtMs))}</span>
                  <span><i class="fa-regular fa-user"></i>${Number(job.applicationCount || 0)} bid${Number(job.applicationCount || 0) === 1 ? '' : 's'}</span>
                </div>
                <div class="job-card-actions">
                  <button type="button" class="btn-secondary fleece-secondary" data-job-view-more="${escapeHtml(job.id)}">View More Detail</button>
                  <button type="button" class="btn-primary" data-job-bid="${escapeHtml(job.id)}">Accept & Bid</button>
                </div>
              </article>
            `).join('')}
          </div>
        </section>
      `).join('') : `
        <div class="specialists-empty">
          <div>
            <h2>No jobs matched that filter</h2>
            <p>Try another date filter or search term to find open work.</p>
          </div>
        </div>
      `;

      groupsHost.querySelectorAll('[data-job-view-more]').forEach((button) => {
        button.addEventListener('click', () => {
          const job = jobs.find((item) => item.id === button.getAttribute('data-job-view-more'));
          if (!job) return;
          openModal(detailModal, `
            <div class="job-modal-panel">
              <button type="button" class="job-modal-close" data-job-modal-close><i class="fa-solid fa-xmark"></i></button>
              <span class="job-card-tag">${escapeHtml(job.category)}</span>
              <h2>${escapeHtml(job.subcategory || job.category)}</h2>
              <p class="job-modal-description">${escapeHtml(job.description)}</p>
              <div class="job-modal-stats">
                <div><strong>${escapeHtml(formatCurrency(job.budget))}</strong><span>Budget</span></div>
                <div><strong>${escapeHtml(job.ownerName || 'WorkLinkUp client')}</strong><span>Posted by</span></div>
                <div><strong>${escapeHtml(formatDateLabel(job.createdAtMs))}</strong><span>Posted</span></div>
              </div>
              <div class="job-modal-address"><i class="fa-solid fa-location-dot"></i><span>${escapeHtml(job.address)}</span></div>
              <div class="job-modal-actions">
                <button type="button" class="btn-secondary fleece-secondary" data-job-modal-close>Close</button>
                <button type="button" class="btn-primary" data-job-detail-bid="${escapeHtml(job.id)}">Accept & Bid</button>
              </div>
            </div>
          `);
          detailModal.querySelector('[data-job-detail-bid]')?.addEventListener('click', () => {
            closeModal(detailModal);
            openBidFlow(job);
          });
        });
      });

      groupsHost.querySelectorAll('[data-job-bid]').forEach((button) => {
        button.addEventListener('click', () => {
          const job = jobs.find((item) => item.id === button.getAttribute('data-job-bid'));
          if (job) openBidFlow(job);
        });
      });
    }

    async function openBidFlow(job) {
      const account = getStoredAccount();
      if (!account?.loggedIn) {
        openModal(authModal, `<div class="job-modal-panel job-modal-auth-panel">${buildJobAuthCardMarkup('bid')}<button type="button" class="job-modal-close" data-job-modal-close><i class="fa-solid fa-xmark"></i></button></div>`);
        bindJobAuthCard('bid', async () => {
          const readiness = await ensureProviderReady(authHelper);
          if (!readiness.ready) {
            savePendingJobBid(job.id);
            window.alert(`${readiness.reason} You will be taken to complete it now.`);
            window.location.href = `${getBase()}pages/edit-profile.html?resumeJob=${encodeURIComponent(job.id)}`;
            return;
          }
          closeModal(authModal);
          openBidFlow(job);
        });
        return;
      }

      const readiness = await ensureProviderReady(authHelper);
      if (!readiness.ready) {
        savePendingJobBid(job.id);
        window.alert(`${readiness.reason} You will be taken to complete it now.`);
        window.location.href = `${getBase()}pages/edit-profile.html?resumeJob=${encodeURIComponent(job.id)}`;
        return;
      }

      openModal(bidModal, `
        <div class="job-modal-panel">
          <button type="button" class="job-modal-close" data-job-modal-close><i class="fa-solid fa-xmark"></i></button>
          <span class="job-card-tag">Bid for this job</span>
          <h2>${escapeHtml(job.subcategory || job.category)}</h2>
          <p class="job-modal-description">Set your bid amount. It starts from the client’s budget so you can adjust up or down before sending.</p>
          <form class="job-bid-form" data-job-bid-form>
            <label class="job-form-field">
              <span>Your bid</span>
              <input type="number" min="1" step="1" name="proposedBudget" value="${escapeHtml(String(job.budget || ''))}" required />
            </label>
            <label class="job-form-field is-wide">
              <span>Message to the client</span>
              <textarea name="message" placeholder="I can do this job this week and I have the right equipment for it."></textarea>
            </label>
            <div class="job-modal-actions">
              <button type="button" class="btn-secondary fleece-secondary" data-job-modal-close>Cancel</button>
              <button type="submit" class="btn-primary" data-job-bid-submit>Send Bid</button>
            </div>
          </form>
        </div>
      `);

      bidModal.querySelector('[data-job-bid-form]')?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!(form instanceof HTMLFormElement)) return;
        const submitBtn = form.querySelector('[data-job-bid-submit]');
        const formData = new FormData(form);
        setButtonLoading(submitBtn, true);
        try {
          await authHelper.applyToJob(job.id, {
            proposedBudget: formData.get('proposedBudget'),
            message: formData.get('message')
          });
          closeModal(bidModal);
          clearPendingJobBid();
          window.alert('Your bid was sent.');
          jobs = await authHelper.listJobPosts().catch(() => jobs);
          renderJobs();
        } catch (error) {
          window.alert(error.message || 'Could not send your bid.');
        } finally {
          setButtonLoading(submitBtn, false);
        }
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        activeFilter = button.getAttribute('data-job-filter') || 'all';
        filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
        renderJobs();
      });
    });

    searchInput?.addEventListener('input', () => {
      query = String(searchInput.value || '').trim();
      renderJobs();
    });

    renderJobs();

    const resumeJobId = params.get('resumeJob') || params.get('job') || readPendingJobBid()?.jobId || '';
    if (resumeJobId) {
      const readiness = await ensureProviderReady(authHelper);
      const job = jobs.find((item) => item.id === resumeJobId);
      if (job && readiness.ready) {
        clearPendingJobBid();
        window.setTimeout(() => openBidFlow(job), 220);
      }
    }
  }

  async function renderJobGiverProfilePage() {
    const page = document.querySelector('[data-job-giver-profile-page]');
    if (!page) return;

    const account = getStoredAccount();
    if (!account?.loggedIn) {
      page.innerHTML = `<div class="specialists-empty"><div><h2>Sign in first</h2><p>Your hiring profile and job responses will show here once you sign in.</p></div></div>`;
      return;
    }

    const authHelper = await waitForAuthHelper();
    if (!authHelper) return;
    if (typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession(account.uid, 12000).catch(() => null);
    }

    const [userDoc, clientProfile, jobs] = await Promise.all([
      authHelper.getUserDocument(account.uid).catch(() => null),
      authHelper.getClientProfileByUid(account.uid).catch(() => null),
      authHelper.listJobsForUser(account.uid).catch(() => [])
    ]);
    const profile = clientProfile || {
      displayName: userDoc?.name || account.name || 'WorkLinkUp client',
      phone: userDoc?.phone || account.phone || '',
      address: userDoc?.address || '',
      city: userDoc?.city || '',
      bio: userDoc?.bio || '',
      profileImageData: userDoc?.profileImageData || '',
      bannerImageData: userDoc?.bannerImageData || ''
    };
    const jobsWithApplications = await Promise.all(jobs.map(async (job) => ({
      ...job,
      applications: await authHelper.listJobApplications(job.id).catch(() => [])
    })));

    function renderDashboard(currentProfile, currentJobs) {
      const bannerSrc = resolveMediaSrc(currentProfile.bannerImageData, `${getBase()}images/sections/findme.avif`);
      const avatarSrc = resolveMediaSrc(currentProfile.profileImageData, `${getBase()}images/logo/logo.jpg`);
      page.innerHTML = `
        <section class="job-giver-shell">
          <section class="job-giver-hero" style="background-image: linear-gradient(180deg, rgba(9, 18, 34, 0.18) 0%, rgba(9, 18, 34, 0.74) 100%), url('${escapeHtml(bannerSrc)}');">
            <div class="job-giver-avatar">
              <img src="${escapeHtml(avatarSrc)}" alt="${escapeHtml(currentProfile.displayName || 'Profile')} image" />
            </div>
            <div class="job-giver-copy">
              <span class="job-page-kicker">Hiring Profile</span>
              <h1>${escapeHtml(currentProfile.displayName || 'WorkLinkUp client')}</h1>
              <p>${escapeHtml(currentProfile.bio || 'Post jobs, compare bids, and move the accepted deal into messages.')}</p>
              <div class="job-giver-meta">
                <span><i class="fa-solid fa-phone"></i>${escapeHtml(currentProfile.phone || 'Phone not added')}</span>
                <span><i class="fa-solid fa-location-dot"></i>${escapeHtml(currentProfile.address || currentProfile.city || 'Address not added')}</span>
              </div>
            </div>
            <div class="job-giver-actions">
              <button type="button" class="btn-secondary fleece-secondary" data-job-giver-edit>Edit Profile</button>
              <a href="${getBase()}pages/post-job.html" class="btn-primary">Post another job</a>
              <a href="${getBase()}pages/edit-profile.html" class="btn-secondary fleece-secondary">Become a provider</a>
            </div>
          </section>

          <section class="job-giver-dashboard">
            <div class="job-giver-dashboard-head">
              <div>
                <span class="job-page-kicker">Responses</span>
                <h2>Your posted jobs</h2>
              </div>
              <span>${currentJobs.length} job${currentJobs.length === 1 ? '' : 's'}</span>
            </div>
            ${currentJobs.length ? currentJobs.map((job) => `
              <article class="job-owner-card">
                <div class="job-owner-card-head">
                  <div>
                    <span class="job-card-tag">${escapeHtml(job.category)}</span>
                    ${job.subcategory ? `<span class="job-card-subtag">${escapeHtml(job.subcategory)}</span>` : ''}
                    <h3>${escapeHtml(job.subcategory || job.category)}</h3>
                  </div>
                  <strong>${escapeHtml(formatCurrency(job.budget))}</strong>
                </div>
                <p>${escapeHtml(job.description)}</p>
                <div class="job-card-meta">
                  <span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.address)}</span>
                  <span><i class="fa-regular fa-clock"></i>${escapeHtml(formatShortDate(job.createdAtMs))}</span>
                  <span><i class="fa-regular fa-user"></i>${job.applications.length} bid${job.applications.length === 1 ? '' : 's'}</span>
                </div>
                <div class="job-owner-applications">
                  ${job.applications.length ? job.applications.map((application) => `
                    <article class="job-bidder-card ${application.status === 'accepted' ? 'is-accepted' : application.status === 'rejected' ? 'is-rejected' : ''}">
                      <div class="job-bidder-main">
                        <div class="job-bidder-avatar">
                          ${application.bidderProfileImageData ? `<img src="${escapeHtml(resolveMediaSrc(application.bidderProfileImageData))}" alt="${escapeHtml(application.bidderName)}" />` : `<span>${escapeHtml((application.bidderName || 'WL').slice(0, 2).toUpperCase())}</span>`}
                        </div>
                        <div>
                          <strong>${escapeHtml(application.bidderName || 'Provider')}</strong>
                          <span>${escapeHtml(application.bidderSpecialty || application.bidderCategory || 'Provider')}</span>
                          <small>${escapeHtml(application.bidderMessage || 'No note added with this bid.')}</small>
                        </div>
                      </div>
                      <div class="job-bidder-side">
                        <strong>${escapeHtml(formatCurrency(application.proposedBudget))}</strong>
                        <span class="job-bidder-status is-${escapeHtml(application.status || 'pending')}">${escapeHtml(application.status || 'pending')}</span>
                        <div class="job-bidder-actions">
                          ${application.status === 'accepted' ? `
                            <a class="btn-primary" href="${getBase()}pages/messages.html?peer=${encodeURIComponent(application.id)}&province=${encodeURIComponent(application.bidderProvinceSlug || '')}&draft=${encodeURIComponent('I accept this deal lets continue chatting')}">Finalise deal</a>
                          ` : `
                            <button type="button" class="btn-primary" data-job-application-action="accepted" data-job-id="${escapeHtml(job.id)}" data-application-id="${escapeHtml(application.id)}">Accept</button>
                          `}
                          ${application.status !== 'rejected' ? `
                            <button type="button" class="btn-secondary fleece-secondary" data-job-application-action="rejected" data-job-id="${escapeHtml(job.id)}" data-application-id="${escapeHtml(application.id)}">Reject</button>
                          ` : ''}
                        </div>
                      </div>
                    </article>
                  `).join('') : `<div class="job-owner-empty-bids">No bids on this job yet.</div>`}
                </div>
              </article>
            `).join('') : `
              <div class="specialists-empty">
                <div>
                  <h2>No jobs posted yet</h2>
                  <p>Post your first job and providers will start bidding here.</p>
                </div>
              </div>
            `}
          </section>
        </section>

        <div class="job-modal-shell" data-job-giver-edit-modal hidden></div>
      `;

      const editModal = page.querySelector('[data-job-giver-edit-modal]');
      page.querySelector('[data-job-giver-edit]')?.addEventListener('click', () => {
        openEditModal(editModal, currentProfile);
      });

      page.querySelectorAll('[data-job-application-action]').forEach((button) => {
        button.addEventListener('click', async () => {
          const status = button.getAttribute('data-job-application-action') || '';
          const jobId = button.getAttribute('data-job-id') || '';
          const applicationId = button.getAttribute('data-application-id') || '';
          setButtonLoading(button, true);
          try {
            await authHelper.updateJobApplicationStatus(jobId, applicationId, status);
            const refreshedJobs = await Promise.all((await authHelper.listJobsForUser(account.uid).catch(() => currentJobs)).map(async (job) => ({
              ...job,
              applications: await authHelper.listJobApplications(job.id).catch(() => [])
            })));
            renderDashboard(currentProfile, refreshedJobs);
          } catch (error) {
            window.alert(error.message || 'Could not update that bid.');
          } finally {
            setButtonLoading(button, false);
          }
        });
      });
    }

    function openEditModal(modal, currentProfile) {
      if (!(modal instanceof HTMLElement)) return;
      modal.hidden = false;
      document.body.classList.add('job-modal-open');
      modal.innerHTML = `
        <div class="job-modal-panel job-giver-edit-panel">
          <button type="button" class="job-modal-close" data-job-giver-close><i class="fa-solid fa-xmark"></i></button>
          <span class="job-page-kicker">Edit hiring profile</span>
          <h2>Update the details people see when you post work</h2>
          <form class="job-giver-edit-form" data-job-giver-edit-form>
            <div class="job-form-grid">
              <label class="job-form-field">
                <span>Display name</span>
                <input type="text" name="displayName" value="${escapeHtml(currentProfile.displayName || '')}" required />
              </label>
              <label class="job-form-field">
                <span>Phone number</span>
                <input type="tel" name="phone" value="${escapeHtml(currentProfile.phone || '')}" required />
              </label>
              <label class="job-form-field is-wide">
                <span>Address</span>
                <textarea name="address" required>${escapeHtml(currentProfile.address || '')}</textarea>
              </label>
              <label class="job-form-field is-wide">
                <span>Short bio</span>
                <textarea name="bio" placeholder="I use WorkLinkUp to find trusted people for the jobs I post.">${escapeHtml(currentProfile.bio || '')}</textarea>
              </label>
            </div>

            <div class="job-giver-media-grid">
              <label class="job-media-dropzone" data-job-profile-dropzone>
                <input type="file" accept="image/*" data-job-profile-file />
                <div class="job-media-preview" data-job-profile-preview></div>
                <strong>Profile image</strong>
                <span>Drag and drop or upload from device.</span>
              </label>
              <label class="job-media-dropzone is-banner" data-job-banner-dropzone>
                <input type="file" accept="image/*" data-job-banner-file />
                <div class="job-media-preview" data-job-banner-preview></div>
                <strong>Banner image</strong>
                <span>Drag and drop or upload from device.</span>
              </label>
            </div>

            <div class="job-modal-actions">
              <button type="button" class="btn-secondary fleece-secondary" data-job-giver-close>Cancel</button>
              <button type="submit" class="btn-primary" data-job-giver-save>Save changes</button>
            </div>
          </form>
        </div>
      `;

      const form = modal.querySelector('[data-job-giver-edit-form]');
      const closeButtons = modal.querySelectorAll('[data-job-giver-close]');
      const profileFile = modal.querySelector('[data-job-profile-file]');
      const bannerFile = modal.querySelector('[data-job-banner-file]');
      const profilePreview = modal.querySelector('[data-job-profile-preview]');
      const bannerPreview = modal.querySelector('[data-job-banner-preview]');
      const nextMedia = {
        profileImageData: currentProfile.profileImageData || '',
        bannerImageData: currentProfile.bannerImageData || ''
      };

      function setPreview(host, source, fallbackLabel) {
        if (!(host instanceof HTMLElement)) return;
        host.innerHTML = source
          ? `<img src="${escapeHtml(resolveMediaSrc(source))}" alt="${escapeHtml(fallbackLabel)}" />`
          : `<span>${escapeHtml(fallbackLabel)}</span>`;
      }

      setPreview(profilePreview, nextMedia.profileImageData, 'Profile');
      setPreview(bannerPreview, nextMedia.bannerImageData, 'Banner');

      function bindDropzone(dropzone, input, kind) {
        if (!(dropzone instanceof HTMLElement) || !(input instanceof HTMLInputElement)) return;
        const applyFile = async (file) => {
          if (!file) return;
          const encoded = await readImageAsBase64(file, {
            maxWidth: kind === 'banner' ? 1800 : 900,
            maxHeight: kind === 'banner' ? 1000 : 900
          });
          if (kind === 'banner') {
            nextMedia.bannerImageData = encoded;
            setPreview(bannerPreview, encoded, 'Banner');
          } else {
            nextMedia.profileImageData = encoded;
            setPreview(profilePreview, encoded, 'Profile');
          }
        };

        input.addEventListener('change', () => applyFile(input.files?.[0]));
        dropzone.addEventListener('dragover', (event) => {
          event.preventDefault();
          dropzone.classList.add('is-dragover');
        });
        dropzone.addEventListener('dragleave', () => {
          dropzone.classList.remove('is-dragover');
        });
        dropzone.addEventListener('drop', (event) => {
          event.preventDefault();
          dropzone.classList.remove('is-dragover');
          applyFile(event.dataTransfer?.files?.[0]);
        });
      }

      bindDropzone(modal.querySelector('[data-job-profile-dropzone]'), profileFile, 'profile');
      bindDropzone(modal.querySelector('[data-job-banner-dropzone]'), bannerFile, 'banner');

      closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          modal.hidden = true;
          modal.innerHTML = '';
          document.body.classList.remove('job-modal-open');
        });
      });

      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!(form instanceof HTMLFormElement)) return;
        const submitBtn = form.querySelector('[data-job-giver-save]');
        const formData = new FormData(form);
        setButtonLoading(submitBtn, true);
        try {
          const updatedProfile = await authHelper.saveClientProfile({
            displayName: formData.get('displayName'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            city: String(formData.get('address') || '').split(',')[0] || '',
            bio: formData.get('bio'),
            profileImageData: nextMedia.profileImageData,
            bannerImageData: nextMedia.bannerImageData
          });
          modal.hidden = true;
          modal.innerHTML = '';
          document.body.classList.remove('job-modal-open');
          renderDashboard(updatedProfile, currentJobs);
        } catch (error) {
          window.alert(error.message || 'Could not update your hiring profile.');
        } finally {
          setButtonLoading(submitBtn, false);
        }
      });
    }

    renderDashboard(profile, jobsWithApplications);
  }

  function initialize() {
    renderPostJobPage();
    renderJobPostsPage();
    renderJobGiverProfilePage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
