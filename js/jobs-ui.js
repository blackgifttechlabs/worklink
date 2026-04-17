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

  function writeJobNotificationState(uid = '', nextState = {}) {
    if (!uid) return;
    try {
      localStorage.setItem(getJobNotificationStorageKey(uid), JSON.stringify({
        receivedAt: Number(nextState.receivedAt || 0),
        placedAt: Number(nextState.placedAt || 0)
      }));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function getPlacedBidNotificationTime(bid = {}) {
    return Math.max(
      Number(bid.statusChangedAtMs || 0),
      Number(bid.updatedAtMs || 0),
      Number(bid.createdAtMs || 0)
    );
  }

  function setButtonLoading(button, isLoading) {
    if (!(button instanceof HTMLElement)) return;
    button.classList.toggle('is-loading', Boolean(isLoading));
    if (button instanceof HTMLButtonElement) button.disabled = Boolean(isLoading);
  }

  function waitForAuthHelper(timeoutMs = 12000) {
    return new Promise((resolve) => {
      if (typeof window.ensureWorkLinkAuth === 'function') {
        window.ensureWorkLinkAuth()
          .then((helper) => resolve(helper || window.softGigglesAuth || null))
          .catch(() => resolve(window.softGigglesAuth || null));
        return;
      }
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

  function buildPostJobSkeleton() {
    return `
      <section class="job-page-hero job-posts-hero job-post-create-hero job-skeleton-hero">
        <div class="job-page-hero-inner">
          <span class="job-page-kicker job-skeleton-block job-skeleton-pill"></span>
          <div class="job-skeleton-block job-skeleton-title"></div>
          <div class="job-skeleton-block job-skeleton-copy"></div>
          <div class="job-skeleton-block job-skeleton-copy short"></div>
          <div class="job-page-hero-actions">
            <span class="job-skeleton-block job-skeleton-button"></span>
          </div>
        </div>
      </section>
      <section class="job-page-shell job-post-create-shell">
        <aside class="job-post-guide job-skeleton-form" aria-hidden="true">
          <span class="job-skeleton-block job-skeleton-heading"></span>
          <span class="job-skeleton-block job-skeleton-copy"></span>
          <span class="job-skeleton-block job-skeleton-copy short"></span>
          <span class="job-skeleton-block job-skeleton-chip"></span>
        </aside>
        <section class="job-post-form job-skeleton-form">
          <div class="job-form-grid">
            <div class="job-form-field">
              <span class="job-skeleton-block job-skeleton-label"></span>
              <span class="job-skeleton-block job-skeleton-input"></span>
            </div>
            <div class="job-form-field">
              <span class="job-skeleton-block job-skeleton-label"></span>
              <span class="job-skeleton-block job-skeleton-input"></span>
            </div>
            <div class="job-form-field is-wide">
              <span class="job-skeleton-block job-skeleton-label"></span>
              <span class="job-skeleton-block job-skeleton-textarea"></span>
            </div>
            <div class="job-form-field">
              <span class="job-skeleton-block job-skeleton-label"></span>
              <span class="job-skeleton-block job-skeleton-input"></span>
            </div>
            <div class="job-form-field is-wide">
              <span class="job-skeleton-block job-skeleton-label"></span>
              <span class="job-skeleton-block job-skeleton-textarea small"></span>
            </div>
          </div>
          <div class="job-auth-card job-skeleton-auth">
            <div class="job-skeleton-auth-row">
              <span class="job-skeleton-block job-skeleton-pill"></span>
              <span class="job-skeleton-block job-skeleton-chip"></span>
            </div>
            <div class="job-skeleton-block job-skeleton-copy"></div>
            <div class="job-skeleton-block job-skeleton-copy short"></div>
          </div>
          <div class="job-post-form-actions">
            <span class="job-skeleton-block job-skeleton-button"></span>
            <span class="job-skeleton-block job-skeleton-button secondary"></span>
          </div>
        </section>
      </section>
    `;
  }

  function buildJobPostsSkeleton() {
    return `
      <section class="job-page-shell">
        <div class="job-page-hero job-skeleton-hero">
          <span class="job-page-kicker job-skeleton-block job-skeleton-pill"></span>
          <div class="job-skeleton-block job-skeleton-title"></div>
          <div class="job-skeleton-block job-skeleton-copy"></div>
          <div class="job-skeleton-block job-skeleton-copy short"></div>
          <div class="job-page-hero-actions">
            <span class="job-skeleton-block job-skeleton-button"></span>
          </div>
        </div>
        <section class="job-board-toolbar job-skeleton-toolbar">
          <span class="job-skeleton-block job-skeleton-search"></span>
          <div class="job-skeleton-toolbar-actions">
            <div class="job-skeleton-filter-row">
              <span class="job-skeleton-block job-skeleton-chip"></span>
              <span class="job-skeleton-block job-skeleton-chip"></span>
              <span class="job-skeleton-block job-skeleton-chip"></span>
              <span class="job-skeleton-block job-skeleton-chip"></span>
            </div>
            <div class="job-skeleton-filter-row">
              <span class="job-skeleton-block job-skeleton-chip"></span>
              <span class="job-skeleton-block job-skeleton-chip"></span>
            </div>
          </div>
        </section>
        <section class="job-board-groups">
          <section class="job-group">
            <div class="job-group-head">
              <div class="job-skeleton-block job-skeleton-heading"></div>
              <div class="job-skeleton-block job-skeleton-count"></div>
            </div>
            <div class="job-card-grid">
              ${Array.from({ length: 4 }).map(() => `
                <article class="job-card job-card-skeleton">
                  <div class="job-card-top">
                    <div class="job-skeleton-inline">
                      <span class="job-skeleton-block job-skeleton-pill"></span>
                      <span class="job-skeleton-block job-skeleton-pill light"></span>
                    </div>
                    <span class="job-skeleton-block job-skeleton-price"></span>
                  </div>
                  <div class="job-skeleton-block job-skeleton-card-title"></div>
                  <div class="job-skeleton-block job-skeleton-copy"></div>
                  <div class="job-skeleton-block job-skeleton-copy short"></div>
                  <div class="job-skeleton-meta">
                    <span class="job-skeleton-block job-skeleton-meta-line"></span>
                    <span class="job-skeleton-block job-skeleton-meta-line"></span>
                    <span class="job-skeleton-block job-skeleton-meta-line short"></span>
                  </div>
                  <div class="job-card-actions">
                    <span class="job-skeleton-block job-skeleton-button secondary"></span>
                    <span class="job-skeleton-block job-skeleton-button"></span>
                  </div>
                </article>
              `).join('')}
            </div>
          </section>
        </section>
      </section>
    `;
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
    const normalizedLabel = String(label || '').trim();
    if (!normalizedLabel) {
      return { label: '', subservices: [], icon: 'fa-solid fa-layer-group' };
    }
    return CATALOG.find((category) => category.label === normalizedLabel) || { label: '', subservices: [], icon: 'fa-solid fa-layer-group' };
  }

  function getSubservicesForCategory(label = '') {
    const category = getCategoryConfig(label);
    return Array.isArray(category.subservices) ? category.subservices : [];
  }

  function buildSubcategoryOptions(categoryLabel = '', selected = '') {
    return buildSelectOptions(getSubservicesForCategory(categoryLabel), selected, 'Optional subcategory');
  }

  function escapeRegExp(value) {
    return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMatch(text, query) {
    const rawText = String(text || '');
    const trimmedQuery = String(query || '').trim();
    if (!trimmedQuery) return escapeHtml(rawText);
    const matcher = new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'ig');
    return escapeHtml(rawText).replace(matcher, '<strong>$1</strong>');
  }

  function getCategoryIcon(categoryLabel = '') {
    return getCategoryConfig(categoryLabel).icon || 'fa-solid fa-layer-group';
  }

  function buildJobComboboxMarkup({ type, label, placeholder, value = '', required = false }) {
    return `
      <label class="job-form-field">
        <span>${escapeHtml(label)}</span>
        <div class="job-combobox" data-job-combobox="${escapeHtml(type)}">
          <div class="job-combobox-shell">
            <span class="job-combobox-leading" data-job-combobox-leading="${escapeHtml(type)}" aria-hidden="true">
              <i class="fa-solid fa-layer-group"></i>
            </span>
            <input
              type="text"
              class="job-combobox-input"
              data-job-combobox-input="${escapeHtml(type)}"
              placeholder="${escapeHtml(placeholder)}"
              value="${escapeHtml(value)}"
              autocomplete="off"
              spellcheck="false"
            />
            <button type="button" class="job-combobox-toggle" data-job-combobox-toggle="${escapeHtml(type)}" aria-label="Toggle ${escapeHtml(label)} suggestions">
              <i class="fa-solid fa-chevron-down"></i>
            </button>
          </div>
          <input type="hidden" name="${escapeHtml(type)}" value="${escapeHtml(value)}" data-job-hidden-field="${escapeHtml(type)}" ${required ? 'required' : ''} />
          <div class="job-combobox-menu" data-job-combobox-menu="${escapeHtml(type)}" hidden></div>
        </div>
      </label>
    `;
  }

  function showJobToast(message = 'Done', callback) {
    const toast = document.getElementById('account-success-toast');
    if (!(toast instanceof HTMLElement)) {
      if (typeof callback === 'function') callback();
      return;
    }
    const label = toast.querySelector('span');
    if (label) label.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => {
        toast.hidden = true;
        if (typeof callback === 'function') callback();
      }, 220);
    }, 1300);
  }

  function createSuggestionItemMarkup({ icon, title, subtitle = '', query = '', value = '' }) {
    return `
      <button type="button" class="job-combobox-option" data-job-option="${escapeHtml(value || title)}">
        <span class="job-combobox-option-icon" aria-hidden="true"><i class="${escapeHtml(icon || 'fa-solid fa-layer-group')}"></i></span>
        <span class="job-combobox-option-copy">
          <span class="job-combobox-option-title">${highlightMatch(title, query)}</span>
          ${subtitle ? `<span class="job-combobox-option-subtitle">${highlightMatch(subtitle, query)}</span>` : ''}
        </span>
      </button>
    `;
  }

  function bindJobCombobox(host, config) {
    if (!(host instanceof HTMLElement)) return null;
    const input = host.querySelector(`[data-job-combobox-input="${config.type}"]`);
    const hiddenInput = host.querySelector(`[data-job-hidden-field="${config.type}"]`);
    const menu = host.querySelector(`[data-job-combobox-menu="${config.type}"]`);
    const toggle = host.querySelector(`[data-job-combobox-toggle="${config.type}"]`);
    const leading = host.querySelector(`[data-job-combobox-leading="${config.type}"]`);
    if (!(input instanceof HTMLInputElement) || !(hiddenInput instanceof HTMLInputElement) || !(menu instanceof HTMLElement)) return null;

    let options = Array.isArray(config.getItems?.('')) ? config.getItems('') : [];
    let selectedValue = String(hiddenInput.value || config.value || '').trim();

    function setLeadingIcon(iconClass) {
      if (!(leading instanceof HTMLElement)) return;
      leading.innerHTML = `<i class="${escapeHtml(iconClass || 'fa-solid fa-layer-group')}"></i>`;
    }

    function closeMenu() {
      host.classList.remove('is-open');
      menu.hidden = true;
    }

    function renderOptions() {
      const query = String(input.value || '').trim();
      options = Array.isArray(config.getItems?.(query)) ? config.getItems(query) : [];
      if (!options.length) {
        menu.innerHTML = `<div class="job-combobox-empty">No matches found.</div>`;
      } else {
        menu.innerHTML = options.map((item) => createSuggestionItemMarkup({
          icon: item.icon,
          title: item.label,
          subtitle: item.subtitle,
          query,
          value: item.value
        })).join('');
      }

      menu.querySelectorAll('[data-job-option]').forEach((button) => {
        button.addEventListener('click', () => {
          const value = String(button.getAttribute('data-job-option') || '').trim();
          const match = options.find((item) => item.value === value) || options.find((item) => item.label === value) || null;
          if (!match) return;
          selectedValue = match.value;
          hiddenInput.value = match.value;
          input.value = match.label;
          setLeadingIcon(match.icon);
          closeMenu();
          if (typeof config.onSelect === 'function') config.onSelect(match);
        });
      });
    }

    function openMenu() {
      renderOptions();
      host.classList.add('is-open');
      menu.hidden = false;
    }

    input.addEventListener('focus', openMenu);
    input.addEventListener('input', () => {
      hiddenInput.value = '';
      selectedValue = '';
      setLeadingIcon(config.defaultIcon);
      openMenu();
      if (typeof config.onInput === 'function') config.onInput(String(input.value || '').trim());
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeMenu();
        return;
      }
      if (event.key === 'Enter') {
        if (!menu.hidden) {
          event.preventDefault();
          const first = menu.querySelector('[data-job-option]');
          if (first instanceof HTMLElement) {
            first.click();
            return;
          }
        }
        const exact = options.find((item) => item.label.toLowerCase() === String(input.value || '').trim().toLowerCase());
        if (exact) {
          hiddenInput.value = exact.value;
          selectedValue = exact.value;
          input.value = exact.label;
          setLeadingIcon(exact.icon);
        }
      }
    });
    toggle?.addEventListener('click', () => {
      if (host.classList.contains('is-open')) {
        closeMenu();
      } else {
        input.focus();
        openMenu();
      }
    });

    document.addEventListener('click', (event) => {
      if (!host.contains(event.target)) closeMenu();
    });

    if (selectedValue) {
      const current = (Array.isArray(config.getItems?.('')) ? config.getItems('') : []).find((item) => item.value === selectedValue || item.label === selectedValue);
      if (current) {
        input.value = current.label;
        hiddenInput.value = current.value;
        setLeadingIcon(current.icon);
      }
    } else if (config.defaultIcon) {
      setLeadingIcon(config.defaultIcon);
    }

    return {
      setItems(nextItems = [], preserveInput = false) {
        options = nextItems;
        if (!preserveInput) {
          input.value = '';
          hiddenInput.value = '';
          selectedValue = '';
        }
        renderOptions();
      },
      setValue(nextValue = '') {
        const next = (Array.isArray(config.getItems?.('')) ? config.getItems('') : []).find((item) => item.value === nextValue || item.label === nextValue);
        if (!next) return;
        selectedValue = next.value;
        hiddenInput.value = next.value;
        input.value = next.label;
        setLeadingIcon(next.icon);
      },
      clear() {
        input.value = '';
        hiddenInput.value = '';
        selectedValue = '';
        setLeadingIcon(config.defaultIcon);
      },
      setDefaultIcon(nextIcon) {
        config.defaultIcon = nextIcon;
        if (!selectedValue) setLeadingIcon(config.defaultIcon);
      },
      getValue() {
        return String(hiddenInput.value || '').trim();
      },
      getInputValue() {
        return String(input.value || '').trim();
      }
    };
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

  function getLocationSearchText(job = {}) {
    return [
      job.address,
      job.city,
      job.province
    ].join(' ').toLowerCase();
  }

  function getJobLocationOptions(jobs = []) {
    return Array.from(new Set(jobs.flatMap((job) => [
      job.city,
      job.address,
      String(job.address || '').split(',').map((part) => part.trim()).filter(Boolean)
    ]).flat().map((value) => String(value || '').trim()).filter(Boolean)))
      .sort((first, second) => first.localeCompare(second));
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

  function savePendingJobDetail(jobId = '') {
    if (!jobId) return;
    try {
      sessionStorage.setItem('worklinkup_pending_job_detail', JSON.stringify({ jobId }));
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function readPendingJobDetail() {
    try {
      const raw = sessionStorage.getItem('worklinkup_pending_job_detail');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function clearPendingJobDetail() {
    try {
      sessionStorage.removeItem('worklinkup_pending_job_detail');
    } catch (error) {
      // Ignore storage issues.
    }
  }

  async function ensureBidderReady(authHelper) {
    const account = getStoredAccount();
    if (!account?.loggedIn || !authHelper) {
      return { ready: false, reason: 'Please sign in first.' };
    }
    const userDoc = await authHelper.getUserDocument(account.uid).catch(() => null);
    const clientProfile = await authHelper.getClientProfileByUid(account.uid).catch(() => null);
    const providerProfile = await authHelper.getProviderProfileByUid(account.uid, account.providerProvinceSlug || userDoc?.providerProvinceSlug || '').catch(() => null);
    return { ready: true, userDoc, clientProfile, providerProfile };
  }

  function getGoogleIconMarkup() {
    return `
      <span class="google-mark" aria-hidden="true">
        <svg class="google-g" viewBox="0 0 18 18" focusable="false">
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.84 2.08-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.94v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.95 10.71A5.41 5.41 0 0 1 3.67 9c0-.59.1-1.16.28-1.71V4.96H.94A9 9 0 0 0 0 9c0 1.45.34 2.82.94 4.04l3.01-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.63 8.63 0 0 0 9 0 9 9 0 0 0 .94 4.96l3.01 2.33C4.66 5.16 6.65 3.58 9 3.58Z" />
        </svg>
      </span>
    `;
  }

  function buildJobAuthCardMarkup(scope = 'post') {
    return `
      <section class="job-auth-card" data-job-auth-card data-auth-scope="${scope}">
        <div class="job-auth-head">
          <div>
            <span class="job-auth-kicker">${scope === 'bid' ? 'Continue to bid' : 'Continue to post'}</span>
            <h3>${scope === 'bid' ? 'Sign in to bid for this job' : 'Create your hiring account'}</h3>
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
        ${scope === 'bid' ? `
          <div class="job-auth-actions">
            <button type="button" class="account-auth-btn account-google-btn job-auth-google-btn" data-job-google-auth>
              ${getGoogleIconMarkup()}
              <span class="account-btn-label">Continue with Google</span>
            </button>
            <div class="job-auth-divider"><span>Or continue with email or phone</span></div>
          </div>
        ` : ''}
        <button type="button" class="btn-primary job-auth-submit${scope === 'bid' ? ' account-submit-btn account-submit-signin' : ''}" data-job-auth-submit>${scope === 'bid' ? 'Continue' : 'Create account and post job'}</button>
      </section>
    `;
  }

  function bindJobAuthCard(scope, onComplete, options = {}) {
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
    const googleBtn = host.querySelector('[data-job-google-auth]');
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
            ? 'Create a quick account with email or phone so you can send your bid and keep track of it later.'
            : 'Sign in with your email or phone account to continue placing this bid.')
          : 'Use email or phone plus a password so your job dashboard is saved to your account.';
      }
      if (submitBtn instanceof HTMLElement) {
        submitBtn.textContent = scope === 'bid'
          ? (authMode === 'signup' ? 'Create account and continue' : 'Sign in and continue')
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

    googleBtn?.addEventListener('click', async () => {
      const authHelper = await waitForAuthHelper();
      if (!authHelper || typeof authHelper.signInWithGoogle !== 'function') return;
      if (options.jobId) savePendingJobDetail(options.jobId);
      setButtonLoading(googleBtn, true);
      try {
        const result = await authHelper.signInWithGoogle();
        if (result?.redirected) return;
        if (typeof authHelper.waitForAuthSession === 'function') {
          const account = getStoredAccount();
          await authHelper.waitForAuthSession(result?.user?.uid || account?.uid || '', 12000).catch(() => null);
        }
        if (typeof onComplete === 'function') {
          await onComplete({
            authMode: 'google',
            idMode: 'google',
            identifier: '',
            name: ''
          });
        }
      } catch (error) {
        window.alert(error.message || 'Could not complete Google sign in.');
      } finally {
        setButtonLoading(googleBtn, false);
      }
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
            userRole: 'client',
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

    page.innerHTML = buildPostJobSkeleton();

    const authHelper = await waitForAuthHelper();
    const account = getStoredAccount();
    const userDoc = account?.loggedIn && authHelper?.getUserDocument
      ? await authHelper.getUserDocument(account.uid).catch(() => null)
      : null;
    const clientProfile = account?.loggedIn && authHelper?.getClientProfileByUid
      ? await authHelper.getClientProfileByUid(account.uid).catch(() => null)
      : null;
    const defaultCategory = '';

    page.innerHTML = `
      <section class="job-page-hero job-posts-hero job-post-create-hero">
        <div class="job-page-hero-inner">
          <span class="job-page-kicker">Post a Job</span>
          <h1>Tell people what you need done.</h1>
          <p>Create a short job post, share your budget, and let providers bid for the work.</p>
          <div class="job-page-hero-actions">
            <a href="${getBase()}pages/job-posts.html" class="btn-secondary fleece-secondary">View Available Jobs</a>
          </div>
        </div>
      </section>

      <section class="job-page-shell job-post-create-shell">
        <aside class="job-post-guide" aria-label="Post job steps">
          <div class="job-post-guide-head">
            <strong>Post details</strong>
            <span>All providers see the same clear brief.</span>
          </div>
          <ol class="job-post-guide-list">
            <li><strong>1</strong><span>Pick a category and service.</span></li>
            <li><strong>2</strong><span>Add the work, budget, and location.</span></li>
            <li><strong>3</strong><span>Post it and review bids from your dashboard.</span></li>
          </ol>
          <a href="${getBase()}pages/job-giver-profile.html" class="job-post-guide-link">Open Jobs and Bids</a>
        </aside>

        <form class="job-post-form" data-job-post-form>
          <div class="job-form-grid">
            ${buildJobComboboxMarkup({
              type: 'category',
              label: 'Job category',
              placeholder: 'Select job category',
              value: defaultCategory,
              required: true
            })}
            ${buildJobComboboxMarkup({
              type: 'subcategory',
              label: 'Subcategory',
              placeholder: 'Optional subcategory'
            })}
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
    const submitBtn = page.querySelector('[data-job-post-submit]');
    const categoryHost = page.querySelector('[data-job-combobox="category"]');
    const subcategoryHost = page.querySelector('[data-job-combobox="subcategory"]');

    function getCategoryItems(query = '') {
      const normalizedQuery = String(query || '').trim().toLowerCase();
      return CATALOG
        .filter((category) => {
          if (!normalizedQuery) return true;
          return category.label.toLowerCase().includes(normalizedQuery)
            || category.shortLabel?.toLowerCase().includes(normalizedQuery)
            || (Array.isArray(category.subservices) && category.subservices.some((service) => service.toLowerCase().includes(normalizedQuery)));
        })
        .map((category) => ({
          value: category.label,
          label: category.label,
          subtitle: `${category.subservices.length} services`,
          icon: category.icon
        }));
    }

    function getSubcategoryItems(categoryLabel = '', query = '') {
      if (!String(categoryLabel || '').trim()) return [];
      const normalizedQuery = String(query || '').trim().toLowerCase();
      const parentCategory = getCategoryConfig(categoryLabel);
      return getSubservicesForCategory(categoryLabel)
        .filter((service) => !normalizedQuery || service.toLowerCase().includes(normalizedQuery))
        .map((service) => ({
          value: service,
          label: service,
          subtitle: parentCategory?.label || '',
          icon: getCategoryIcon(categoryLabel)
        }));
    }

    let activeCategory = defaultCategory;
    const subcategoryCombobox = bindJobCombobox(subcategoryHost, {
      type: 'subcategory',
      value: '',
      defaultIcon: 'fa-solid fa-list-ul',
      getItems: (query) => getSubcategoryItems(activeCategory, query)
    });
    const categoryCombobox = bindJobCombobox(categoryHost, {
      type: 'category',
      value: defaultCategory,
      defaultIcon: 'fa-solid fa-layer-group',
      getItems: getCategoryItems,
      onSelect: (match) => {
        activeCategory = match.value;
        subcategoryCombobox?.setDefaultIcon(getCategoryIcon(match.value));
        subcategoryCombobox?.clear();
      },
      onInput: () => {
        activeCategory = '';
        subcategoryCombobox?.setDefaultIcon('fa-solid fa-list-ul');
        subcategoryCombobox?.clear();
      }
    });
    activeCategory = categoryCombobox?.getValue() || defaultCategory;
    subcategoryCombobox?.clear();

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
      const typedCategory = categoryCombobox?.getInputValue() || '';
      const typedSubcategory = subcategoryCombobox?.getInputValue() || '';
      payload.category = String(payload.category || typedCategory).trim();
      payload.subcategory = String(payload.subcategory || typedSubcategory).trim();
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

        showJobToast('Job has been posted.', () => {
          window.location.href = `${getBase()}pages/job-giver-profile.html?created=1`;
        });
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

    page.innerHTML = buildJobPostsSkeleton();

    const authHelper = await waitForAuthHelper();

    page.innerHTML = `
      <section class="job-page-hero job-posts-hero">
        <div class="job-page-hero-inner">
          <span class="job-page-kicker job-page-kicker-jobs-count">Available jobs: <strong data-job-available-count>0</strong></span>
          <h1>Browse open jobs and place your bid.</h1>
          <p>Search by service and location, then open any job to review the details before bidding.</p>
          <div class="job-page-hero-actions">
            <a href="${getBase()}pages/post-job.html" class="btn-primary">Post Job</a>
          </div>
        </div>
      </section>

      <section class="job-page-shell job-posts-shell">
        <aside class="job-board-toolbar" aria-label="Find available jobs">
          <div class="job-board-toolbar-head">
            <strong>Find Jobs</strong>
            <span>All locations and services by default.</span>
          </div>
          <label class="job-board-search">
            <span>Service</span>
            <div class="job-board-search-box">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="search" placeholder="Category, service, or detail" data-job-search />
            </div>
          </label>
          <button type="button" class="job-board-filter-toggle" data-job-mobile-filter-toggle aria-expanded="false" aria-label="Show filters">
            <i class="fa-solid fa-sliders"></i>
          </button>
          <label class="job-board-search job-board-location-search" data-job-location-field>
            <span>Location</span>
            <div class="job-board-search-box">
              <i class="fa-solid fa-location-dot"></i>
              <input type="search" placeholder="Any location" data-job-location-search aria-autocomplete="list" aria-controls="job-location-suggestions" autocomplete="off" />
            </div>
            <div class="job-location-dropdown" id="job-location-suggestions" data-job-location-suggestions hidden></div>
            <datalist id="job-location-options" data-job-location-options></datalist>
          </label>
          <div class="job-board-toolbar-actions">
            <div class="job-board-filters" data-job-filters>
              <button type="button" class="is-active" data-job-filter="all">All</button>
              <button type="button" data-job-filter="today">Today</button>
              <button type="button" data-job-filter="week">This Week</button>
              <button type="button" data-job-filter="month">This Month</button>
            </div>
            <div class="job-board-view-toggle" data-job-view-toggle>
              <button type="button" class="is-active" data-job-view-mode="grid" aria-pressed="true" title="Show grid view">
                <i class="fa-solid fa-grip"></i>
                <span>Grid</span>
              </button>
              <button type="button" data-job-view-mode="list" aria-pressed="false" title="Show list view">
                <i class="fa-solid fa-list"></i>
                <span>List</span>
              </button>
            </div>
          </div>
        </aside>

        <section class="job-board-content">
          <section class="job-board-groups" data-job-groups></section>
        </section>
      </section>

      <div class="job-modal-shell job-detail-modal-shell" data-job-detail-modal hidden></div>
      <div class="job-modal-shell job-bid-modal-shell" data-job-bid-modal hidden></div>
      <div class="job-modal-shell job-auth-modal-shell" data-job-auth-modal hidden></div>
    `;

    const groupsHost = page.querySelector('[data-job-groups]');
    const toolbar = page.querySelector('.job-board-toolbar');
    const searchInput = page.querySelector('[data-job-search]');
    const locationSearchInput = page.querySelector('[data-job-location-search]');
    const locationOptionsHost = page.querySelector('[data-job-location-options]');
    const locationSuggestionsHost = page.querySelector('[data-job-location-suggestions]');
    const mobileFilterToggle = page.querySelector('[data-job-mobile-filter-toggle]');
    const detailModal = page.querySelector('[data-job-detail-modal]');
    const bidModal = page.querySelector('[data-job-bid-modal]');
    const authModal = page.querySelector('[data-job-auth-modal]');
    const availableCountLabel = page.querySelector('[data-job-available-count]');
    const filterButtons = Array.from(page.querySelectorAll('[data-job-filter]'));
    const viewModeButtons = Array.from(page.querySelectorAll('[data-job-view-mode]'));
    const params = new URLSearchParams(window.location.search);
    if (!authHelper || typeof authHelper.listJobPosts !== 'function') {
      groupsHost.innerHTML = `
        <div class="specialists-empty">
          <div>
            <h2>Jobs could not be loaded yet</h2>
            <p>Refresh the page in a moment and try again.</p>
          </div>
        </div>
      `;
      return;
    }
    let jobs = await authHelper.listJobPosts().catch(() => []);
    let placedBids = [];
    if (typeof authHelper.listPlacedJobBids === 'function') {
      const currentAccount = getStoredAccount();
      if (currentAccount?.loggedIn && currentAccount?.uid) {
        placedBids = await authHelper.listPlacedJobBids(currentAccount.uid).catch(() => []);
      }
    }
    let activeFilter = 'all';
    let query = String(params.get('query') || params.get('category') || params.get('service') || '').trim();
    let locationQuery = String(params.get('location') || '').trim();
    const locationOptions = getJobLocationOptions(jobs);
    let viewMode = 'grid';

    if (searchInput && query) {
      searchInput.value = query;
    }
    if (locationSearchInput && locationQuery) {
      locationSearchInput.value = locationQuery;
    }
    if (locationOptionsHost) {
      locationOptionsHost.innerHTML = locationOptions
        .map((location) => `<option value="${escapeHtml(location)}"></option>`)
        .join('');
    }

    function hideLocationSuggestions() {
      if (locationSuggestionsHost instanceof HTMLElement) {
        locationSuggestionsHost.hidden = true;
        locationSuggestionsHost.innerHTML = '';
      }
    }

    function showLocationSuggestions() {
      if (!(locationSuggestionsHost instanceof HTMLElement)) return;
      const normalizedLocation = String(locationSearchInput?.value || '').trim().toLowerCase();
      const matches = locationOptions
        .filter((location) => !normalizedLocation || location.toLowerCase().includes(normalizedLocation))
        .slice(0, 8);
      locationSuggestionsHost.innerHTML = matches.length
        ? matches.map((location) => `
          <button type="button" data-job-location-option="${escapeHtml(location)}">
            <i class="fa-solid fa-location-dot"></i>
            <span>${escapeHtml(location)}</span>
          </button>
        `).join('')
        : `<div class="job-location-empty">No matching locations yet.</div>`;
      locationSuggestionsHost.hidden = false;
      locationSuggestionsHost.querySelectorAll('[data-job-location-option]').forEach((button) => {
        button.addEventListener('pointerdown', (event) => {
          event.preventDefault();
          const value = button.getAttribute('data-job-location-option') || '';
          if (locationSearchInput instanceof HTMLInputElement) {
            locationSearchInput.value = value;
          }
          locationQuery = value.trim();
          hideLocationSuggestions();
          renderJobs();
        });
      });
    }

    function getPlacedBidJobIds() {
      return new Set(placedBids.map((bid) => String(bid.jobId || '').trim()).filter(Boolean));
    }

    function closeModal(modal) {
      if (!(modal instanceof HTMLElement)) return;
      modal.classList.remove('is-visible');
      window.setTimeout(() => {
        modal.hidden = true;
        modal.innerHTML = '';
        const hasOpenModal = Array.from(document.querySelectorAll('.job-modal-shell')).some((item) => (
          item instanceof HTMLElement && !item.hidden && item.classList.contains('is-visible')
        ));
        if (!hasOpenModal) document.body.classList.remove('job-modal-open');
      }, 240);
    }

    function openModal(modal, markup) {
      if (!(modal instanceof HTMLElement)) return;
      modal.hidden = false;
      modal.innerHTML = markup;
      document.body.classList.add('job-modal-open');
      window.requestAnimationFrame(() => {
        modal.classList.add('is-visible');
      });
      modal.querySelectorAll('[data-job-modal-close]').forEach((button) => {
        button.addEventListener('click', () => closeModal(modal));
      });
      modal.onclick = (event) => {
        if (event.target === modal) closeModal(modal);
      };
    }

    function openJobDetail(job) {
      if (!job) return;
      const hasPlacedBid = getPlacedBidJobIds().has(String(job.id || '').trim());
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
            ${hasPlacedBid
              ? `<button type="button" class="btn-secondary fleece-secondary" disabled>You already placed a bid</button>`
              : `<button type="button" class="btn-primary" data-job-detail-bid="${escapeHtml(job.id)}">Accept & Bid</button>`}
          </div>
        </div>
      `);
      detailModal.querySelector('[data-job-detail-bid]')?.addEventListener('click', () => {
        closeModal(detailModal);
        openBidFlow(job);
      });
    }

    function getFilteredJobs() {
      return jobs.filter((job) => {
        if (!isInFilterWindow(activeFilter, job.createdAtMs)) return false;
        const matchesQuery = !query || getSearchText(job).includes(query.toLowerCase());
        const matchesLocation = !locationQuery || getLocationSearchText(job).includes(locationQuery.toLowerCase());
        return matchesQuery && matchesLocation;
      });
    }

    function renderJobs() {
      const filteredJobs = getFilteredJobs();
      const currentAccount = getStoredAccount();
      const currentUid = String(currentAccount?.uid || '').trim();
      const placedBidJobIds = getPlacedBidJobIds();

      if (availableCountLabel) {
        availableCountLabel.textContent = String(filteredJobs.length);
      }
      const grouped = groupJobsByDate(filteredJobs);
      groupsHost.innerHTML = grouped.length ? grouped.map(([label, items]) => `
        <section class="job-group">
          <div class="job-group-head">
            <h2>${escapeHtml(label)}</h2>
            <span>${items.length} job${items.length === 1 ? '' : 's'}</span>
          </div>
          <div class="job-card-grid ${viewMode === 'list' ? 'is-list' : 'is-grid'}">
            ${items.map((job) => {
              const jobId = String(job.id || '').trim();
              const isAcceptedBySomeone = Boolean(job.acceptedApplicationUid);
              const isAcceptedByMe = isAcceptedBySomeone && job.acceptedApplicationUid === currentUid;
              const hasPlacedBid = placedBidJobIds.has(jobId);

              let statusLabel = '';
              let bidDisabled = false;
              let bidText = 'Accept & Bid';

              if (isAcceptedByMe) {
                statusLabel = 'Already Accepted';
                bidDisabled = true;
                bidText = 'Accepted';
              } else if (isAcceptedBySomeone) {
                statusLabel = 'Already Accepted';
                bidDisabled = true;
                bidText = 'Accepted';
              } else if (hasPlacedBid) {
                statusLabel = 'You already placed a bid';
                bidDisabled = true;
                bidText = 'Bid Sent';
              }

              return `
              <article class="job-card ${viewMode === 'list' ? 'is-list-item' : ''} ${hasPlacedBid ? 'is-bid-placed' : ''} ${isAcceptedBySomeone ? 'is-job-accepted' : ''}" data-job-card-open="${escapeHtml(jobId)}" tabindex="0">
                <div class="job-card-top">
                  <div class="job-card-tag-row">
                    <span class="job-card-tag">${escapeHtml(job.category)}</span>
                    ${job.subcategory ? `<span class="job-card-subtag">${escapeHtml(job.subcategory)}</span>` : ''}
                  </div>
                  <strong class="job-card-price">${escapeHtml(formatCurrency(job.budget))}</strong>
                </div>
                <h3>${escapeHtml(job.subcategory || job.category)}</h3>
                <div class="job-card-summary">
                  <p>${escapeHtml(String(job.description || '').slice(0, 96))}${String(job.description || '').length > 96 ? '…' : ''}</p>
                </div>
                <div class="job-card-meta">
                  <span class="job-card-meta-item is-location">
                    <i class="fa-solid fa-location-dot"></i>
                    <span class="job-card-meta-text">${escapeHtml(job.address || 'Address not shared')}</span>
                  </span>
                  <span class="job-card-meta-item is-date">
                    <i class="fa-regular fa-clock"></i>
                    <span class="job-card-meta-text job-card-meta-date">${escapeHtml(formatShortDate(job.createdAtMs))}</span>
                  </span>
                  ${currentUid && currentUid === String(job.ownerUid || '').trim() ? `
                    <span class="job-card-meta-item is-bids">
                      <i class="fa-regular fa-user"></i>
                      <span class="job-card-meta-text">${Number(job.applicationCount || 0)} bid${Number(job.applicationCount || 0) === 1 ? '' : 's'}</span>
                    </span>
                  ` : ''}
                </div>
                ${statusLabel ? `<div class="job-card-status-notice">${escapeHtml(statusLabel)}</div>` : ''}
                <div class="job-card-actions">
                  <button type="button" class="btn-secondary fleece-secondary" data-job-view-more="${escapeHtml(jobId)}">View More</button>
                  <button type="button" class="${bidDisabled ? 'btn-secondary fleece-secondary' : 'btn-primary'}" data-job-bid="${escapeHtml(jobId)}" ${bidDisabled ? 'disabled' : ''}>${escapeHtml(bidText)}</button>
                </div>
              </article>
            `;}).join('')}
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
          openJobDetail(job);
        });
      });

      groupsHost.querySelectorAll('[data-job-card-open]').forEach((card) => {
        card.addEventListener('click', (event) => {
          if (event.target instanceof HTMLElement && event.target.closest('button, a')) return;
          const job = jobs.find((item) => item.id === card.getAttribute('data-job-card-open'));
          openJobDetail(job);
        });
        card.addEventListener('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          const job = jobs.find((item) => item.id === card.getAttribute('data-job-card-open'));
          openJobDetail(job);
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
        savePendingJobDetail(job.id);
        openModal(authModal, `<div class="job-modal-panel job-modal-auth-panel">${buildJobAuthCardMarkup('bid')}<button type="button" class="job-modal-close" data-job-modal-close><i class="fa-solid fa-xmark"></i></button></div>`);
        authModal.querySelectorAll('[data-job-modal-close]').forEach((button) => {
          button.addEventListener('click', clearPendingJobDetail);
        });
        authModal.addEventListener('click', (event) => {
          if (event.target === authModal) clearPendingJobDetail();
        });
        bindJobAuthCard('bid', async () => {
          const readiness = await ensureBidderReady(authHelper);
          if (!readiness.ready) return;
          closeModal(authModal);
          clearPendingJobDetail();
          window.setTimeout(() => openJobDetail(job), 260);
        }, { jobId: job.id });
        return;
      }

      const readiness = await ensureBidderReady(authHelper);
      if (!readiness.ready) {
        window.alert(readiness.reason || 'Please sign in first.');
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
          jobs = await authHelper.listJobPosts().catch(() => jobs);
          if (typeof authHelper.listPlacedJobBids === 'function') {
            const currentAccount = getStoredAccount();
            if (currentAccount?.uid) {
              placedBids = await authHelper.listPlacedJobBids(currentAccount.uid).catch(() => placedBids);
            }
          }
          window.dispatchEvent(new CustomEvent('worklinkup-job-badges-refresh'));
          renderJobs();
          showJobToast('Job accepted, waiting for approval.');
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

    viewModeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        viewMode = button.getAttribute('data-job-view-mode') || 'grid';
        viewModeButtons.forEach((item) => {
          const isActive = item === button;
          item.classList.toggle('is-active', isActive);
          item.setAttribute('aria-pressed', String(isActive));
        });
        renderJobs();
      });
    });

    searchInput?.addEventListener('input', () => {
      query = String(searchInput.value || '').trim();
      renderJobs();
    });

    locationSearchInput?.addEventListener('input', () => {
      locationQuery = String(locationSearchInput.value || '').trim();
      showLocationSuggestions();
      renderJobs();
    });

    locationSearchInput?.addEventListener('focus', showLocationSuggestions);
    locationSearchInput?.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        hideLocationSuggestions();
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!(locationSuggestionsHost instanceof HTMLElement)) return;
      const locationField = page.querySelector('[data-job-location-field]');
      if (locationField instanceof HTMLElement && event.target instanceof Node && locationField.contains(event.target)) return;
      hideLocationSuggestions();
    });

    mobileFilterToggle?.addEventListener('click', () => {
      if (!(toolbar instanceof HTMLElement)) return;
      const isOpen = !toolbar.classList.contains('is-filter-open');
      toolbar.classList.toggle('is-filter-open', isOpen);
      mobileFilterToggle.setAttribute('aria-expanded', String(isOpen));
    });

    renderJobs();

    const pendingDetail = readPendingJobDetail();
    const detailJobId = params.get('detailJob') || params.get('openJob') || pendingDetail?.jobId || '';
    let openedPendingDetail = false;
    if (detailJobId) {
      const job = jobs.find((item) => item.id === detailJobId);
      if (job) {
        openedPendingDetail = Boolean(pendingDetail?.jobId && pendingDetail.jobId === detailJobId);
        clearPendingJobDetail();
        window.setTimeout(() => openJobDetail(job), 220);
      }
    }

    const resumeJobId = openedPendingDetail ? '' : (params.get('resumeJob') || params.get('job') || readPendingJobBid()?.jobId || '');
    if (resumeJobId) {
      const readiness = await ensureBidderReady(authHelper);
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
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    let activeTab = (requestedTab === 'jobs' || requestedTab === 'previous' || requestedTab === 'current')
      ? requestedTab
      : 'current';

    function renderDashboard(currentProfile, currentJobs) {
      const notificationState = readJobNotificationState(account.uid);
      const latestReceivedBidAt = currentJobs.reduce((latest, job) => Math.max(
        latest,
        ...(Array.isArray(job.applications) ? job.applications.map((application) => Number(application.createdAtMs || 0)) : [0])
      ), 0);

      let didUpdateNotificationState = false;
      if (activeTab === 'jobs' && latestReceivedBidAt > notificationState.receivedAt) {
        notificationState.receivedAt = latestReceivedBidAt;
        didUpdateNotificationState = true;
      }
      if (didUpdateNotificationState) {
        writeJobNotificationState(account.uid, notificationState);
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent('worklinkup-job-badges-refresh'));
        }, 0);
      }

      const receivedBidCount = currentJobs.reduce((total, job) => total + (
        Array.isArray(job.applications)
          ? job.applications.filter((application) => Number(application.createdAtMs || 0) > notificationState.receivedAt).length
          : 0
      ), 0);

      const currentJobsList = currentJobs.filter(job => job.acceptedApplicationUid && !job.completedAtMs);
      const currentCount = currentJobsList.length;

      const completedJobs = currentJobs.filter((job) => Boolean(job.completedAtMs || (Array.isArray(job.applications) && job.applications.some((a) => Boolean(a.completedAtMs)))));
      const previousCount = completedJobs.length;

      // build tab content for the active tab so we can keep template readable
      function buildCurrentJobsContent() {
        if (!currentJobsList.length) return `
          <div class="specialists-empty">
            <div>
              <h2>No active jobs</h2>
              <p>When you accept a bid on a job you posted, it will show here.</p>
            </div>
          </div>
        `;

        return currentJobsList.map((item) => {
          const isOwner = item.ownerUid === account.uid;
          const job = isOwner ? item : item.job;
          if (!job) return '';
          const acceptedApp = isOwner
            ? item.applications.find(a => a.id === item.acceptedApplicationUid)
            : item;

          const inProgress = Boolean(acceptedApp?.inProgressAtMs || job.inProgressAtMs);

          return `
            <article class="job-owner-card active-job-card">
              <div class="job-owner-card-head">
                <div>
                  <span class="job-card-tag">${escapeHtml(job.category)}</span>
                  <h3>${escapeHtml(job.subcategory || job.category)}</h3>
                </div>
                <strong>${escapeHtml(formatCurrency(isOwner ? job.budget : item.proposedBudget))}</strong>
              </div>
              <p>${escapeHtml(job.description)}</p>
              <div class="job-card-meta">
                <span><i class="fa-solid fa-location-dot"></i>${escapeHtml(job.address)}</span>
                <span><i class="fa-regular fa-clock"></i>${escapeHtml(formatShortDate(job.createdAtMs))}</span>
                <span><i class="fa-regular fa-user"></i>${isOwner ? 'Worker: ' + escapeHtml(acceptedApp?.bidderName) : 'Posted by: ' + escapeHtml(job.ownerName)}</span>
              </div>
              ${inProgress ? `<div class="job-status-notice">Job started</div>` : ''}
              <div class="job-card-actions">
                <button type="button" class="btn-primary" data-job-lifecycle-start="${escapeHtml(job.id)}" data-app-id="${escapeHtml(acceptedApp?.id || acceptedApp?.bidderUid)}" ${inProgress ? 'disabled' : ''}>Start Job</button>
                <button type="button" class="btn-primary" data-job-lifecycle-finish="${escapeHtml(job.id)}" data-app-id="${escapeHtml(acceptedApp?.id || acceptedApp?.bidderUid)}" ${!inProgress ? 'disabled' : ''}>Finish Job</button>
                <a href="${getBase()}pages/messages.html?peer=${encodeURIComponent(isOwner ? acceptedApp?.bidderUid : job.ownerUid)}" class="btn-secondary fleece-secondary">Message</a>
              </div>
            </article>
          `;
        }).join('');
      }

      function buildPreviousJobsContent() {
        if (!completedJobs.length) return `
          <div class="specialists-empty">
            <div>
              <h2>No previous jobs</h2>
              <p>Completed jobs will show here when you or a provider finish work.</p>
            </div>
          </div>
        `;

        return completedJobs.map((job) => {
          const acceptedApp = Array.isArray(job.applications) ? job.applications.find((a) => a.status === 'accepted' || Boolean(a.completedAtMs)) : null;
          const completedAt = Number(job.completedAtMs || acceptedApp?.completedAtMs || 0);
          const inProgressAt = Number(acceptedApp?.inProgressAtMs || job.inProgressAtMs || 0);
          const durationMs = completedAt && inProgressAt ? Math.max(0, completedAt - inProgressAt) : 0;
          const rating = acceptedApp?.review?.rating || acceptedApp?.rating || null;
          const comment = acceptedApp?.review?.comment || '';

          return `
            <article class="job-owner-card previous-job-card" data-previous-job-id="${escapeHtml(job.id)}">
              <div class="job-owner-card-head">
                <div>
                  <span class="job-card-tag">${escapeHtml(job.category)}</span>
                  ${job.subcategory ? `<span class="job-card-subtag">${escapeHtml(job.subcategory)}</span>` : ''}
                  <h3>${escapeHtml(job.subcategory || job.category)}</h3>
                </div>
                <div>
                  <strong>${escapeHtml(formatCurrency(job.budget))}</strong>
                </div>
              </div>
              <p>${escapeHtml(job.description)}</p>
              <div class="job-card-meta">
                <span><i class="fa-regular fa-clock"></i>${completedAt ? escapeHtml(formatShortDate(completedAt)) : 'Completed'}</span>
                ${durationMs ? `<span><i class="fa-regular fa-hourglass-half"></i>${Math.round(durationMs/60000)} min</span>` : ''}
                ${rating ? `<span><i class="fa-solid fa-star"></i> ${escapeHtml(String(rating))}</span>` : ''}
              </div>
              <div class="previous-job-summary">
                <div class="previous-job-actions">
                  <button type="button" class="btn-secondary" data-previous-toggle="${escapeHtml(job.id)}">View details</button>
                </div>
              </div>
              <div class="previous-job-details" hidden>
                <h4>Accepted Provider</h4>
                ${acceptedApp ? `
                  <div class="previous-provider">
                    <div class="avatar">${acceptedApp.bidderProfileImageData ? `<img src="${escapeHtml(resolveMediaSrc(acceptedApp.bidderProfileImageData))}" alt="${escapeHtml(acceptedApp.bidderName)}" />` : `<span>${escapeHtml((acceptedApp.bidderName || 'WL').slice(0,2).toUpperCase())}</span>`}</div>
                    <div>
                      <strong>${escapeHtml(acceptedApp.bidderName || 'Provider')}</strong>
                      <p>${escapeHtml(acceptedApp.bidderMessage || '')}</p>
                    </div>
                  </div>
                  <h4>Review</h4>
                  ${rating ? `<div class="previous-review"><strong>Rating:</strong> ${escapeHtml(String(rating))}${comment ? `<p>${escapeHtml(comment)}</p>` : ''}</div>` : `<div class="previous-review"><em>No review recorded</em></div>`}
                ` : `<div><em>No accepted application found for this job.</em></div>`}
              </div>
            </article>
          `;
        }).join('');
      }

      const tabContent = activeTab === 'current'
        ? buildCurrentJobsContent()
        : activeTab === 'jobs'
        ? (currentJobs.length ? currentJobs.map((job) => `
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
                      <strong>${escapeHtml(application.bidderName || 'WorkLinkUp user')}</strong>
                      <span>${escapeHtml(application.bidderSpecialty || application.bidderCategory || application.bidderRoleLabel || 'WorkLinkUp member')}</span>
                      <small>${escapeHtml(application.bidderMessage || 'No note added with this bid.')}</small>
                    </div>
                  </div>
                  <div class="job-bidder-side">
                    <strong>${escapeHtml(formatCurrency(application.proposedBudget))}</strong>
                    <span class="job-bidder-status is-${escapeHtml(application.status || 'pending')}">${escapeHtml(application.status || 'pending')}</span>
                    <div class="job-bidder-actions">
                      ${application.status === 'accepted' ? `
                        <a class="btn-primary" href="${getBase()}pages/messages.html?peer=${encodeURIComponent(application.bidderUid || '')}&province=${encodeURIComponent(application.bidderProvinceSlug || '')}&draft=${encodeURIComponent('I approved a job for you.')}">Open Messages</a>
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
        `)
      : buildPreviousJobsContent();

      page.innerHTML = `
        <section class="job-page-shell">
          <section class="job-giver-dashboard">
            <div class="job-giver-layout">
              <aside class="job-dashboard-tabs">
                <button type="button" class="${activeTab === 'current' ? 'is-active' : ''}" data-job-dashboard-tab="current">
                  <i class="fa-solid fa-play"></i>
                  <span>Current Jobs</span>
                  ${currentCount > 0 ? `<span class="job-dashboard-tab-badge">${currentCount}</span>` : ''}
                </button>
                <button type="button" class="${activeTab === 'jobs' ? 'is-active' : ''}" data-job-dashboard-tab="jobs">
                  <i class="fa-solid fa-briefcase"></i>
                  <span>Jobs I Posted</span>
                  ${receivedBidCount > 0 ? `<span class="job-dashboard-tab-badge">${receivedBidCount}</span>` : ''}
                </button>
                <button type="button" class="${activeTab === 'previous' ? 'is-active' : ''}" data-job-dashboard-tab="previous">
                  <i class="fa-solid fa-clock-rotate-left"></i>
                  <span>Previous Jobs</span>
                  ${previousCount > 0 ? `<span class="job-dashboard-tab-badge">${previousCount}</span>` : ''}
                </button>
              </aside>

              <div class="job-giver-main">
                <div class="job-dashboard-listing ${activeTab === 'previous' ? 'previous-jobs-host' : ''}">
                  ${tabContent}
                </div>

                <div class="job-dashboard-summary">
                  <div class="summary-card current-summary" role="region" aria-label="Current Jobs summary" ${activeTab !== 'current' ? 'hidden' : ''}>
                    <div class="summary-head">
                      <h3>Current Jobs</h3>
                      <span class="summary-badge">${currentCount}</span>
                    </div>
                    <div class="summary-body">
                      <table class="summary-table">
                        <thead>
                          <tr><th>Job</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                          ${currentJobsList.slice(0, 6).map((item) => {
                            const isOwner = item.ownerUid === account.uid;
                            const job = isOwner ? item : item.job;
                            const acceptedApp = isOwner ? item.applications.find(a => a.id === item.acceptedApplicationUid) : item;
                            const inProgress = Boolean(acceptedApp?.inProgressAtMs || job?.inProgressAtMs);
                            return `
                              <tr>
                                <td>${escapeHtml(job?.subcategory || job?.category || 'Job')}</td>
                                <td>${inProgress ? 'In Progress' : 'Accepted'}</td>
                              </tr>
                            `;
                          }).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="summary-card jobs-summary" role="region" aria-label="Jobs I Posted summary" ${activeTab !== 'jobs' ? 'hidden' : ''}>
                    <div class="summary-head">
                      <h3>Jobs I Posted</h3>
                      <span class="summary-badge">${receivedBidCount}</span>
                    </div>
                    <div class="summary-body">
                      <table class="summary-table">
                        <thead>
                          <tr><th>Job</th><th>Bids</th><th>Budget</th></tr>
                        </thead>
                        <tbody>
                          ${currentJobs.slice(0, 6).map((job) => `
                            <tr>
                              <td>${escapeHtml(job.subcategory || job.category || 'Job')}</td>
                              <td>${(Array.isArray(job.applications) ? job.applications.length : 0)}</td>
                              <td>${escapeHtml(formatCurrency(job.budget))}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="summary-card previous-summary" role="region" aria-label="Previous Jobs summary" ${activeTab !== 'previous' ? 'hidden' : ''}>
                    <div class="summary-head">
                      <h3>Previous Jobs</h3>
                      <span class="summary-badge">${previousCount}</span>
                    </div>
                    <div class="summary-body">
                      <table class="summary-table">
                        <thead>
                          <tr><th>Job</th><th>Budget</th></tr>
                        </thead>
                        <tbody>
                          ${completedJobs.slice(0, 6).map((job) => `
                            <tr>
                              <td>${escapeHtml(job.subcategory || job.category || 'Job')}</td>
                              <td>${escapeHtml(formatCurrency(job.budget))}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>
      `;

      page.querySelectorAll('[data-job-dashboard-tab]').forEach((button) => {
        button.addEventListener('click', () => {
          const tab = button.getAttribute('data-job-dashboard-tab') || 'jobs';
          activeTab = tab;
          const nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set('tab', activeTab);
          window.history.replaceState({}, '', nextUrl.toString());
          renderDashboard(currentProfile, currentJobs);
        });
      });

      page.querySelectorAll('[data-job-lifecycle-start]').forEach((button) => {
        button.addEventListener('click', async () => {
          const jobId = button.getAttribute('data-job-lifecycle-start') || '';
          const applicationId = button.getAttribute('data-app-id') || '';
          setButtonLoading(button, true);
          try {
            await authHelper.markJobStarted(jobId, applicationId);
            showJobToast('Job started');
            window.location.reload();
          } catch (error) {
            window.alert(error.message || 'Could not start job.');
            setButtonLoading(button, false);
          }
        });
      });

      page.querySelectorAll('[data-job-lifecycle-finish]').forEach((button) => {
        button.addEventListener('click', async () => {
          const jobId = button.getAttribute('data-job-lifecycle-finish') || '';
          const applicationId = button.getAttribute('data-app-id') || '';
          const job = currentJobsList.find(item => (item.id === jobId || item.jobId === jobId));
          const actualJob = job.ownerUid === account.uid ? job : job.job;
          const acceptedApp = job.ownerUid === account.uid ? job.applications.find(a => a.id === applicationId) : job;
          openJobReviewModal(actualJob, acceptedApp);
        });
      });

      page.querySelectorAll('[data-job-application-action]').forEach((button) => {
        button.addEventListener('click', async () => {
          const status = button.getAttribute('data-job-application-action') || '';
          const jobId = button.getAttribute('data-job-id') || '';
          const applicationId = button.getAttribute('data-application-id') || '';
          setButtonLoading(button, true);
          try {
            await authHelper.updateJobApplicationStatus(jobId, applicationId, status);
            window.dispatchEvent(new CustomEvent('worklinkup-job-badges-refresh'));
            const selectedJob = currentJobs.find((job) => job.id === jobId);
            const selectedApplication = selectedJob?.applications?.find((application) => application.id === applicationId) || null;
            if (status === 'accepted' && selectedApplication?.bidderUid) {
              window.location.href = `${getBase()}pages/messages.html?peer=${encodeURIComponent(selectedApplication.bidderUid)}&province=${encodeURIComponent(selectedApplication.bidderProvinceSlug || '')}&draft=${encodeURIComponent('I approved a job for you.')}`;
              return;
            }
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

      // previous job expand/collapse toggles
      page.querySelectorAll('[data-previous-toggle]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const card = btn.closest('.previous-job-card');
          if (!card) return;
          const details = card.querySelector('.previous-job-details');
          if (!details) return;
          const isHidden = details.hasAttribute('hidden');
          if (isHidden) {
            details.removeAttribute('hidden');
            btn.textContent = 'Hide details';
            card.classList.add('is-expanded');
          } else {
            details.setAttribute('hidden', '');
            btn.textContent = 'View details';
            card.classList.remove('is-expanded');
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
              <div class="job-review-provider-icon"><span>${escapeHtml((application.bidderName || 'WL').slice(0, 2).toUpperCase())}</span></div>
              <div>
                <strong>${escapeHtml(application.bidderName || application.bidderUid || 'Provider')}</strong>
                <div class="job-review-meta"><span>${escapeHtml(job.subcategory || job.category || '')}</span></div>
              </div>
            </div>
            <div class="job-review-body">
              <div class="job-review-stars" data-job-review-stars>
                ${[1, 2, 3, 4, 5].map((s) => `<button type="button" class="star" data-star="${s}">&#9733;</button>`).join('')}
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
            shell.querySelectorAll('[data-star]').forEach((s) => s.classList.toggle('is-selected', Number(s.getAttribute('data-star')) <= selectedRating));
          });
        });

        shell.querySelector('[data-job-review-submit]').addEventListener('click', async () => {
          const comment = (shell.querySelector('[data-job-review-comment]')?.value || '').trim();
          if (!selectedRating) {
            window.alert('Please choose a rating.');
            return;
          }
          try {
            // Mark as completed and save review
            await authHelper.markJobCompleted(job.id || job.jobId || '', application.id || application.applicationId || '', { rating: selectedRating, comment });
            showJobToast('Thanks — review saved');
            shell.remove();
            document.body.classList.remove('job-modal-open');
            window.location.reload();
          } catch (err) {
            window.alert(err.message || 'Could not save review.');
          }
        });
      } catch (err) {
        // ignore
      }
    }
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
