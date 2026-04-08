// Nav mega dropdown hover logic
document.addEventListener('DOMContentLoaded', () => {
  const SEARCH_ITEMS = [
    {
      value: 'Plumber in Harare',
      title: 'Plumber in Harare',
      subtitle: 'Home Services • Water leaks, blocked drains, fittings',
      icon: 'fa-solid fa-wrench'
    },
    {
      value: 'Gardener in Borrowdale',
      title: 'Gardener in Borrowdale',
      subtitle: 'Home Services • Lawn care, hedges, garden clean-ups',
      icon: 'fa-solid fa-seedling'
    },
    {
      value: 'Nail technician in Bulawayo',
      title: 'Nail technician in Bulawayo',
      subtitle: 'Beauty & Wellness • Acrylics, gel polish, manicures',
      icon: 'fa-solid fa-hand-sparkles'
    },
    {
      value: 'Tutor for Maths',
      title: 'Tutor for Maths',
      subtitle: 'Learning Support • Primary, O-Level, A-Level',
      icon: 'fa-solid fa-graduation-cap'
    },
    {
      value: 'Programmer for websites',
      title: 'Programmer for websites',
      subtitle: 'Digital & Business • Websites, landing pages, support',
      icon: 'fa-solid fa-laptop-code'
    },
    {
      value: 'Photographer for events',
      title: 'Photographer for events',
      subtitle: 'Creative Services • Weddings, birthdays, brand shoots',
      icon: 'fa-solid fa-camera'
    },
    {
      value: 'Cleaner in Avondale',
      title: 'Cleaner in Avondale',
      subtitle: 'Home Support • Weekly visits, deep cleaning, ironing',
      icon: 'fa-solid fa-soap'
    },
    {
      value: 'Social media manager',
      title: 'Social media manager',
      subtitle: 'Business Support • Content calendars, posting, ads',
      icon: 'fa-solid fa-hashtag'
    }
  ];

  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.querySelector('.cookie-accept');
  const cookieDecline = document.querySelector('.cookie-decline');
  const consentKey = 'softgiggles_cookie_consent';

  function hideCookieBanner() {
    if (!cookieBanner) return;
    cookieBanner.classList.add('is-hidden');
    window.setTimeout(() => {
      cookieBanner.hidden = true;
    }, 240);
  }

  function saveCookieChoice(choice) {
    try {
      localStorage.setItem(consentKey, choice);
    } catch (error) {
      // Ignore storage errors and keep the UI usable.
    }
    document.cookie = `softgiggles_cookie_consent=${choice}; path=/; max-age=31536000; SameSite=Lax`;
    hideCookieBanner();
  }

  if (cookieBanner) {
    let savedChoice = null;
    try {
      savedChoice = localStorage.getItem(consentKey);
    } catch (error) {
      savedChoice = null;
    }

    if (!savedChoice) {
      cookieBanner.hidden = false;
      window.requestAnimationFrame(() => {
        cookieBanner.classList.add('is-visible');
      });
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => saveCookieChoice('accepted'));
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => saveCookieChoice('declined'));
  }

  let searchModal = document.getElementById('mobile-search-overlay');
  let searchSuggestions = document.getElementById('search-suggestions');
  let searchModalInput = searchModal ? searchModal.querySelector('input[data-search-context="overlay"]') : null;
  let searchModalResults = document.getElementById('mobile-search-results');
  let activeSearchInput = null;

  if (!searchSuggestions) {
    document.body.insertAdjacentHTML('beforeend', `<div class="search-suggestions" id="search-suggestions" hidden></div>`);
    searchSuggestions = document.getElementById('search-suggestions');
  }

  function hideSearchSuggestions() {
    if (!searchSuggestions) return;
    searchSuggestions.hidden = true;
    searchSuggestions.innerHTML = '';
    activeSearchInput = null;
  }

  function getSearchMatches(rawQuery) {
    const query = String(rawQuery || '').trim().toLowerCase();
    const matches = SEARCH_ITEMS.filter((item) => {
      const haystack = `${item.title} ${item.subtitle}`.toLowerCase();
      return !query || haystack.includes(query);
    });
    return matches.slice(0, query ? 6 : 8);
  }

  function goToSpecialistsSearch(rawQuery) {
    const query = String(rawQuery || '').trim();
    const base = getSiteBasePath();
    const target = new URL(`${base}pages/specialists.html`, window.location.origin);
    if (query) target.searchParams.set('query', query);
    target.searchParams.set('results', '1');
    window.location.href = `${target.pathname}${target.search}`;
  }

  function buildSearchItemMarkup(item, query, className) {
    return `
      <button type="button" class="${className}" data-value="${escapeHtml(item.value)}">
        <span class="search-result-icon" aria-hidden="true"><i class="${item.icon}"></i></span>
        <span class="search-result-copy">
          <strong>${highlightMatch(item.title, query)}</strong>
          <small>${highlightMatch(item.subtitle, query)}</small>
        </span>
      </button>
    `;
  }

  function renderSearchModalResults(query = '') {
    if (!searchModalResults) return;
    const matches = getSearchMatches(query);
    searchModalResults.innerHTML = matches.length
      ? matches.map((item) => buildSearchItemMarkup(item, query, 'mobile-search-result')).join('')
      : `<div class="mobile-search-empty">No sample results found. Search is coming soon.</div>`;
  }

  function openSearchModal(prefill = '') {
    if (!searchModal) return;
    searchModal.hidden = false;
    document.body.classList.add('mobile-search-open');
    if (searchModalInput) searchModalInput.value = prefill;
    renderSearchModalResults(prefill);
    requestAnimationFrame(() => {
      searchModal.classList.add('is-visible');
      if (searchModalInput) searchModalInput.focus();
    });
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('is-visible');
    document.body.classList.remove('mobile-search-open');
    setTimeout(() => {
      searchModal.hidden = true;
      if (searchModalInput) searchModalInput.value = '';
      renderSearchModalResults('');
    }, 180);
  }

  function positionSearchSuggestions(input) {
    if (!searchSuggestions || !input) return;
    const rect = input.closest('.search-bar').getBoundingClientRect();
    searchSuggestions.style.top = `${window.scrollY + rect.bottom + 8}px`;
    searchSuggestions.style.left = `${window.scrollX + rect.left}px`;
    searchSuggestions.style.width = `${rect.width}px`;
  }

  function escapeHtml(value) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function highlightMatch(text, query) {
    const safeText = escapeHtml(text);
    if (!query) return safeText;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const start = lowerText.indexOf(lowerQuery);

    if (start === -1) return safeText;

    const end = start + query.length;
    const before = escapeHtml(text.slice(0, start));
    const match = escapeHtml(text.slice(start, end));
    const after = escapeHtml(text.slice(end));
    return `${before}<span class="search-match">${match}</span>${after}`;
  }

  function renderSearchSuggestions(input) {
    if (!searchSuggestions) return;
    const rawQuery = input.value.trim();
    const query = rawQuery.toLowerCase();
    const matches = getSearchMatches(rawQuery);

    if (!query) {
      searchSuggestions.innerHTML = '';
      searchSuggestions.hidden = true;
      searchSuggestions.classList.remove('is-visible');
      return;
    }

    if (!matches.length) {
      searchSuggestions.innerHTML = `<button type="button" class="search-suggestion is-empty">No suggestions found</button>`;
    } else {
      searchSuggestions.innerHTML = matches
        .map((item) => buildSearchItemMarkup(item, rawQuery, 'search-suggestion'))
        .join('');
    }

    positionSearchSuggestions(input);
    searchSuggestions.hidden = false;
    activeSearchInput = input;
    requestAnimationFrame(() => {
      if (searchSuggestions && !searchSuggestions.hidden) {
        searchSuggestions.classList.add('is-visible');
      }
    });
  }

  function initHomepageCategoryAutoScroll() {
    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const categoryRow = document.querySelector('.homepage-categories .category-circles');
    if (!categoryRow) return;

    const originalItems = Array.from(categoryRow.children)
      .filter((item) => item instanceof HTMLElement && !item.hasAttribute('data-cloned-marquee-item'));

    function syncMarquee() {
      categoryRow.querySelectorAll('[data-cloned-marquee-item]').forEach((item) => item.remove());
      categoryRow.classList.remove('is-auto-scroll');

      if (!mobileQuery.matches || !originalItems.length) return;

      const clones = originalItems.map((item) => {
        const clone = item.cloneNode(true);
        clone.setAttribute('data-cloned-marquee-item', 'true');
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        return clone;
      });

      categoryRow.append(...clones);
      categoryRow.classList.add('is-auto-scroll');
    }

    syncMarquee();
    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', syncMarquee);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(syncMarquee);
    }
  }

  document.querySelectorAll('.search-bar input').forEach(input => {
    const context = input.dataset.searchContext || 'inline';
    if (context === 'specialists-page') return;

    input.addEventListener('focus', () => {
      if (context === 'overlay') {
        renderSearchModalResults(input.value.trim());
        return;
      }
      if (input.value.trim()) renderSearchSuggestions(input);
    });

    input.addEventListener('input', () => {
      if (context === 'overlay') {
        renderSearchModalResults(input.value.trim());
        return;
      }
      renderSearchSuggestions(input);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (context === 'overlay') {
          goToSpecialistsSearch(input.value.trim());
          return;
        }
        hideSearchSuggestions();
        goToSpecialistsSearch(input.value.trim());
      }

      if (event.key === 'Escape' && context === 'overlay') {
        closeSearchModal();
      }
    });
  });

  initHomepageCategoryAutoScroll();

  if (searchSuggestions) {
    searchSuggestions.addEventListener('mousedown', (event) => {
      const button = event.target.closest('.search-suggestion');
      if (!button || button.classList.contains('is-empty')) return;
      event.preventDefault();
      const value = button.getAttribute('data-value') || '';
      if (activeSearchInput) activeSearchInput.value = value;
      hideSearchSuggestions();
      goToSpecialistsSearch(value);
    });
  }

  if (searchModal) {
    searchModal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === searchModal || target.closest('.mobile-search-close')) {
        closeSearchModal();
        return;
      }

      const result = target.closest('.mobile-search-result');
      if (result instanceof HTMLElement && searchModalInput) {
        const value = result.getAttribute('data-value') || '';
        goToSpecialistsSearch(value);
      }
    });
  }

  window.addEventListener('resize', () => {
    if (activeSearchInput && searchSuggestions && !searchSuggestions.hidden) {
      positionSearchSuggestions(activeSearchInput);
    }
  });

  window.addEventListener('scroll', () => {
    if (activeSearchInput && searchSuggestions && !searchSuggestions.hidden) {
      positionSearchSuggestions(activeSearchInput);
    }
  }, { passive: true });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (searchSuggestions && searchSuggestions.contains(target)) return;
    if (target instanceof HTMLElement && target.closest('.search-bar')) return;
    if (target instanceof HTMLElement && target.closest('.mobile-search-panel')) return;
    hideSearchSuggestions();
  });

  const mobileFilterToggle = document.querySelector('.mobile-filter-toggle');
  const filtersCloseBtn = document.querySelector('.filters-close-btn');
  const catalogMobileOverlay = document.querySelector('.catalog-mobile-overlay');
  const sortDropdowns = document.querySelectorAll('.sort-dropdown');

  if (mobileFilterToggle) {
    mobileFilterToggle.addEventListener('click', () => {
      document.body.classList.add('mobile-filters-open');
    });
  }

  if (filtersCloseBtn) {
    filtersCloseBtn.addEventListener('click', () => {
      document.body.classList.remove('mobile-filters-open');
    });
  }

  if (catalogMobileOverlay) {
    catalogMobileOverlay.addEventListener('click', () => {
      document.body.classList.remove('mobile-filters-open');
      sortDropdowns.forEach(dropdown => {
        dropdown.classList.remove('is-open');
        const toggle = dropdown.querySelector('button[aria-expanded]');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  sortDropdowns.forEach(dropdown => {
    const toggle = dropdown.querySelector('button[aria-expanded]');
    const options = dropdown.querySelectorAll('.mobile-sort-option, .desktop-sort-option');

    if (toggle) {
      toggle.addEventListener('click', () => {
        const willOpen = !dropdown.classList.contains('is-open');
        sortDropdowns.forEach(other => {
          if (other !== dropdown) {
            other.classList.remove('is-open');
            const otherToggle = other.querySelector('button[aria-expanded]');
            if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
          }
        });
        dropdown.classList.toggle('is-open', willOpen);
        toggle.setAttribute('aria-expanded', String(willOpen));
      });
    }

    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(item => item.classList.remove('is-active'));
        option.classList.add('is-active');
        if (toggle) {
          const label = option.textContent.trim();
          const labelSpan = toggle.querySelector('span');
          if (labelSpan) labelSpan.textContent = label;
          toggle.setAttribute('aria-expanded', 'false');
        }
        dropdown.classList.remove('is-open');
      });
    });
  });

  // Smooth image placeholder fallback
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      this.style.display = 'none';
    });
  });

  // Filter chips toggle
  document.querySelectorAll('.size-chip').forEach(chip => {
    chip.addEventListener('click', () => chip.classList.toggle('active'));
  });
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.toggle('active');
    });
  });

  // Grid toggle
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Node)) return;

    sortDropdowns.forEach(dropdown => {
      if (!dropdown.classList.contains('is-open')) return;
      if (dropdown.contains(target)) return;
      dropdown.classList.remove('is-open');
      const toggle = dropdown.querySelector('button[aria-expanded]');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const toggleBtns = document.querySelectorAll('.grid-toggle');
  const catalogGrid = document.querySelector('.catalog-grid');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view || 'grid';
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (catalogGrid) {
        catalogGrid.dataset.view = view;
      }
    });
  });

  const wishlistTrendingRow = document.querySelector('.wishlist-trending-row');
  document.querySelectorAll('.wishlist-scroll-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
      if (!wishlistTrendingRow) return;
      const direction = index === 0 ? -1 : 1;
      wishlistTrendingRow.scrollBy({
        left: direction * 260,
        behavior: 'smooth'
      });
    });
  });

  const accountStorageKey = 'softgiggles_account';
  const accountAuthOverlay = document.getElementById('account-auth-overlay');
  const accountAuthClose = document.querySelector('.account-auth-close');
  const accountAuthPanel = document.querySelector('.account-auth-panel');
  const accountLoggedOutTriggers = document.querySelectorAll('.account-menu-host.is-logged-out .account-trigger, .account-guest-open');
  const accountGoogleBtn = document.querySelector('.account-google-btn');
  const accountPhoneToggle = document.querySelector('.account-phone-toggle');
  const accountEmailToggle = document.querySelector('.account-email-toggle');
  const accountGoogleCard = document.querySelector('.account-method-google');
  const accountPhoneCard = document.querySelector('.account-method-phone');
  const accountEmailCard = document.querySelector('.account-method-email');
  const accountMethodDivider = document.querySelector('.account-method-divider');
  const accountPhoneFormWrap = document.querySelector('.account-phone-form-wrap');
  const accountPhoneInput = document.getElementById('account-phone');
  const accountPhoneSubmit = document.querySelector('.account-phone-submit');
  const accountCodeRow = document.querySelector('.account-code-row');
  const accountPhoneCode = document.getElementById('account-phone-code');
  const accountPhoneVerify = document.querySelector('.account-phone-verify');
  const accountEmailFormWrap = document.querySelector('.account-email-form-wrap');
  const accountEmailForm = document.getElementById('account-email-form');
  const accountEmailInput = document.getElementById('account-email');
  const accountNameInput = document.getElementById('account-name');
  const accountModeSwitch = document.querySelector('.account-mode-switch');
  const accountForgotPasswordBtn = document.querySelector('.account-forgot-password');
  const accountChangeMethodBtns = document.querySelectorAll('.account-change-method');
  const accountModeInput = document.getElementById('account-mode');
  const accountSuccessToast = document.getElementById('account-success-toast');
  const accountHeading = document.querySelector('.account-auth-heading');
  const accountSubtext = document.querySelector('.account-auth-subtext');
  const accountSwitchLabel = document.querySelector('.account-switch-label');
  const accountSubmitBtn = document.querySelector('.account-email-form .account-submit-btn');
  const accountSubmitBtnLabel = document.querySelector('.account-email-form .account-btn-label');
  const accountNameRow = document.querySelector('.account-name-row');
  const accountDashboard = document.getElementById('account-dashboard');
  const accountGuestCard = document.getElementById('account-guest-card');
  const accountDisplayName = document.getElementById('account-display-name');
  const accountProfileName = document.getElementById('account-profile-name');
  const accountProfileEmail = document.getElementById('account-profile-email');
  const accountPageLogout = document.querySelector('.account-side-logout');
  const accountDeleteLink = document.querySelector('.account-delete-link');
  const accountDeleteOverlay = document.getElementById('account-delete-overlay');
  const accountDeleteClose = document.querySelector('.account-delete-close');
  const accountDeleteCancel = document.querySelector('.account-delete-cancel');
  const accountDeleteConfirm = document.querySelector('.account-delete-confirm');
  const accountDeleteInput = document.getElementById('account-delete-confirmation');
  const accountDeleteLabel = document.getElementById('account-delete-label');
  const accountDeleteTargetLabel = document.getElementById('account-delete-target-label');
  const accountPageModeInput = document.getElementById('account-page-mode');
  const accountPageModeSwitch = document.querySelector('.account-page-mode-switch');
  const accountPageGoogleBtn = document.querySelector('.account-page-google-btn');
  const accountPageEmailForm = document.getElementById('account-page-email-form');
  const accountPageNameRow = document.querySelector('.account-page-name-row');
  const accountPageNameInput = document.getElementById('account-page-name');
  const accountPageEmailInput = document.getElementById('account-page-email');
  const accountPagePasswordInput = document.getElementById('account-page-password');
  const accountPageHeading = document.querySelector('.account-auth-page-heading');
  const accountPageSubtextLabel = document.querySelector('.account-auth-page-subtext-label');
  const accountPageSubmitBtn = document.querySelector('.account-page-submit-btn');
  const accountPageForgotPasswordBtn = document.querySelector('.account-page-forgot-password');
  const accountPageParams = new URLSearchParams(window.location.search);
  const isEmbeddedAccountPage = accountPageParams.get('embed') === '1';

  function readAccount() {
    try {
      const raw = localStorage.getItem(accountStorageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeAccount(account) {
    try {
      localStorage.setItem(accountStorageKey, JSON.stringify(account));
    } catch (error) {
      // Ignore storage issues to avoid blocking UI.
    }
  }

  function openAccountPanel() {
    if (!accountAuthOverlay) return;
    accountAuthOverlay.hidden = false;
    if (typeof window.ensureWorkLinkAuth === 'function') {
      window.ensureWorkLinkAuth().catch(() => {});
    }
    requestAnimationFrame(() => {
      accountAuthOverlay.classList.add('is-visible');
    });
  }

  function closeAccountPanel() {
    if (!accountAuthOverlay) return;
    accountAuthOverlay.classList.remove('is-visible');
    setTimeout(() => {
      accountAuthOverlay.hidden = true;
    }, 240);
  }

  function getAuthHelper() {
    return window.softGigglesAuth || null;
  }

  async function getAuthHelperReady() {
    const existing = getAuthHelper();
    if (existing) return existing;
    if (typeof window.ensureWorkLinkAuth === 'function') {
      try {
        return await window.ensureWorkLinkAuth();
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  function setMethodVisibility(method) {
    if (!accountGoogleCard || !accountPhoneCard || !accountEmailCard) return;

    const showAll = method === 'all';
    accountGoogleCard.classList.toggle('is-hidden', !showAll);
    accountPhoneCard.classList.toggle('is-hidden', !(showAll || method === 'phone'));
    accountEmailCard.classList.toggle('is-hidden', !(showAll || method === 'email'));

    if (accountMethodDivider) {
      accountMethodDivider.classList.toggle('is-hidden', !(showAll || method === 'email'));
    }
  }

  function showAccountSuccess(message = 'Signed in successfully', callback) {
    if (!accountSuccessToast) {
      if (typeof callback === 'function') callback();
      return;
    }
    const label = accountSuccessToast.querySelector('span');
    if (label) label.textContent = message;
    accountSuccessToast.hidden = false;
    requestAnimationFrame(() => {
      accountSuccessToast.classList.add('is-visible');
    });
    window.setTimeout(() => {
      accountSuccessToast.classList.remove('is-visible');
      window.setTimeout(() => {
        accountSuccessToast.hidden = true;
        if (typeof callback === 'function') callback();
      }, 220);
    }, 1200);
  }

  async function routeAfterAuthSuccess() {
    const authHelper = await getAuthHelperReady();
    const base = getSiteBasePath();
    const currentUrl = new URL(window.location.href);
    const accountPageUrl = new URL(`${base}pages/account.html`, window.location.origin);
    accountPageUrl.searchParams.set('setup', currentUrl.searchParams.get('setup') === 'provider' ? 'provider' : '1');
    if (currentUrl.searchParams.get('service')) {
      accountPageUrl.searchParams.set('service', currentUrl.searchParams.get('service'));
    }
    if (authHelper && typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession('', 12000).catch(() => null);
    }
    const account = readAccount();

    if (!authHelper || !account?.uid) {
      window.location.reload();
      return;
    }

    try {
      const userDoc = await authHelper.getUserDocument(account.uid);
      const providerProfile = await authHelper.getProviderProfileByUid(
        account.uid,
        userDoc?.providerProvinceSlug || account.providerProvinceSlug || ''
      ).catch(() => null);

      const needsSetup = !userDoc?.username
        || !userDoc?.userRole
        || (userDoc?.userRole === 'provider' && !Boolean(userDoc?.providerProfileComplete || providerProfile?.uid));

      if (needsSetup) {
        try {
          localStorage.setItem('worklinkup_pending_setup', accountPageUrl.search || '?setup=1');
          setSessionFlag('worklinkup_show_setup_modal_once');
        } catch (error) {
          // Ignore storage issues and fall back to home redirect.
        }
        window.location.replace(`${base}index.html`);
        return;
      }
    } catch (error) {
      try {
        localStorage.setItem('worklinkup_pending_setup', accountPageUrl.search || '?setup=1');
        setSessionFlag('worklinkup_show_setup_modal_once');
      } catch (storageError) {
        // Ignore storage issues and fall back to home redirect.
      }
      window.location.replace(`${base}index.html`);
      return;
    }

    if (window.location.pathname.endsWith('/account.html')) {
      window.location.reload();
      return;
    }

    window.location.reload();
  }

  function finalizeAuthSuccess(message) {
    showAccountSuccess(message, () => {
      closeAccountPanel();
      routeAfterAuthSuccess();
    });
  }

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.classList.toggle('is-loading', isLoading);
    button.classList.toggle('has-jimu-loader', isLoading && button.classList.contains('account-submit-btn'));
    button.disabled = isLoading;

    if (!button.classList.contains('account-submit-btn')) return;

    const loader = button.querySelector('.loader');
    if (isLoading && !loader) {
      button.insertAdjacentHTML('beforeend', `
        <div class="loader" aria-hidden="true">
          <div class="justify-content-center jimu-primary-loading"></div>
        </div>
      `);
    }

    if (!isLoading && loader) {
      loader.remove();
    }
  }

  function syncAccountMode(mode) {
    if (!accountModeInput) return;
    accountModeInput.value = mode;
    const isSignup = mode === 'signup';
    if (accountHeading) accountHeading.textContent = 'Welcome';
    if (accountSubtext) accountSubtext.textContent = 'Create an account or sign in to continue with WorkLinkUp.';
    if (accountSwitchLabel) accountSwitchLabel.textContent = isSignup ? 'Already have an account?' : 'Joining us for the first time?';
    if (accountModeSwitch) accountModeSwitch.textContent = isSignup ? 'Sign In' : 'Create Account';
    if (accountSubmitBtn) {
      accountSubmitBtn.classList.toggle('account-submit-signup', isSignup);
      accountSubmitBtn.classList.toggle('account-submit-signin', !isSignup);
    }
    if (accountSubmitBtnLabel) accountSubmitBtnLabel.textContent = isSignup ? 'Create Account' : 'Sign In';
    if (accountNameRow) {
      accountNameRow.hidden = !isSignup;
      accountNameRow.style.display = isSignup ? '' : 'none';
    }
    if (accountNameInput) {
      accountNameInput.disabled = !isSignup;
      accountNameInput.required = isSignup;
      if (!isSignup) accountNameInput.value = '';
    }
  }

  function syncAccountPageMode(mode) {
    if (!accountPageModeInput || isEmbeddedAccountPage) return;
    const isSignup = mode === 'signup';
    accountPageModeInput.value = mode;
    if (accountPageHeading) accountPageHeading.textContent = isSignup ? 'Create a new account' : 'Sign in to your account';
    if (accountPageSubtextLabel) accountPageSubtextLabel.textContent = isSignup ? 'Already have an account?' : 'New to WorkLinkUp?';
    if (accountPageNameRow) accountPageNameRow.hidden = !isSignup;
    if (accountPageNameInput) {
      accountPageNameInput.disabled = !isSignup;
      accountPageNameInput.required = isSignup;
      if (!isSignup) accountPageNameInput.value = '';
    }
    if (accountPageSubmitBtn) {
      accountPageSubmitBtn.classList.toggle('account-submit-signup', isSignup);
      accountPageSubmitBtn.classList.toggle('account-submit-signin', !isSignup);
      const label = accountPageSubmitBtn.querySelector('.account-btn-label');
      if (label) label.textContent = isSignup ? 'Create Account' : 'Sign In';
    }
    if (accountPageModeSwitch) accountPageModeSwitch.textContent = isSignup ? 'Sign in' : 'Create account';
  }

  function readSessionFlag(key) {
    try {
      return sessionStorage.getItem(key) || '';
    } catch (error) {
      return '';
    }
  }

  function clearSessionFlag(key) {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  function setSessionFlag(key, value = '1') {
    try {
      sessionStorage.setItem(key, value);
    } catch (error) {
      // Ignore storage issues.
    }
  }

  async function maybeHandleRedirectedGoogleAuth() {
    if (isEmbeddedAccountPage) return;
    const hasRedirectSuccess = readSessionFlag('worklinkup_google_redirect_success');
    if (!hasRedirectSuccess) return;
    const authHelper = await getAuthHelperReady();
    if (authHelper && typeof authHelper.waitForAuthSession === 'function') {
      await authHelper.waitForAuthSession('', 12000).catch(() => null);
    }
    clearSessionFlag('worklinkup_google_redirect_success');
    showAccountSuccess('Signed in successfully', () => {
      closeAccountPanel();
      routeAfterAuthSuccess();
    });
  }

  function openWorkLinkUpSetupModal(pendingSearch = '', options = {}) {
    const normalizedSearch = String(pendingSearch || '').trim()
      ? (String(pendingSearch).startsWith('?') ? String(pendingSearch) : `?${String(pendingSearch)}`)
      : '?setup=1';
    const delayMs = Number(options.delayMs ?? 0);
    const clearPendingOnClose = Boolean(options.clearPendingOnClose);
    const consumeOnceFlag = Boolean(options.consumeOnceFlag);
    const base = getSiteBasePath();
    const frameSrc = `${base}pages/account.html${normalizedSearch}${normalizedSearch.includes('embed=1') ? '' : `${normalizedSearch ? '&' : '?'}embed=1`}`;

    document.getElementById('pending-setup-overlay')?.remove();

    document.body.insertAdjacentHTML('beforeend', `
      <div class="pending-setup-overlay" id="pending-setup-overlay" hidden>
        <div class="pending-setup-backdrop"></div>
        <div class="pending-setup-panel" role="dialog" aria-modal="true" aria-labelledby="pending-setup-title">
          <div class="pending-setup-head">
            <div>
              <span class="pending-setup-kicker">Complete your account</span>
              <h2 id="pending-setup-title">Complete your sign up process</h2>
            </div>
            <button type="button" class="pending-setup-close" aria-label="Close setup modal">×</button>
          </div>
          <iframe class="pending-setup-frame" src="${frameSrc}" title="WorkLinkUp account setup"></iframe>
        </div>
      </div>
    `);

    const overlay = document.getElementById('pending-setup-overlay');
    const closeBtn = overlay?.querySelector('.pending-setup-close');
    let openTimer = 0;

    function closeModal(shouldClearPending = false) {
      if (!(overlay instanceof HTMLElement)) return;
      overlay.classList.remove('is-visible');
      document.body.classList.remove('pending-setup-open');
      window.setTimeout(() => {
        overlay.hidden = true;
        overlay.remove();
      }, 180);
      if (consumeOnceFlag) clearSessionFlag('worklinkup_show_setup_modal_once');
      if (shouldClearPending || clearPendingOnClose) {
        try {
          localStorage.removeItem('worklinkup_pending_setup');
        } catch (error) {
          // Ignore storage issues.
        }
      }
      if (messageHandler) {
        window.removeEventListener('message', messageHandler);
      }
    }

    if (overlay instanceof HTMLElement) {
      openTimer = window.setTimeout(() => {
        overlay.hidden = false;
        requestAnimationFrame(() => {
          overlay.classList.add('is-visible');
          document.body.classList.add('pending-setup-open');
        });
        if (consumeOnceFlag) clearSessionFlag('worklinkup_show_setup_modal_once');
      }, Math.max(0, delayMs));
    }

    closeBtn?.addEventListener('click', () => closeModal(false));
    overlay?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.classList.contains('pending-setup-backdrop')) {
        closeModal(false);
      }
    });

    const messageHandler = (event) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'worklinkup-setup-complete') {
        closeModal(true);
        if (openTimer) window.clearTimeout(openTimer);
        if (event.data?.redirectUrl) {
          window.location.href = event.data.redirectUrl;
          return;
        }
        window.location.reload();
      }
    };

    window.addEventListener('message', messageHandler);
  }

  window.openWorkLinkUpSetupModal = openWorkLinkUpSetupModal;

  function initPendingSetupModal() {
    if (!document.body.classList.contains('home-page-body')) return;
    if (!readSessionFlag('worklinkup_show_setup_modal_once')) return;

    let pendingSearch = '';
    try {
      pendingSearch = localStorage.getItem('worklinkup_pending_setup') || '';
    } catch (error) {
      pendingSearch = '';
    }

    const account = readAccount();
    if (!account?.loggedIn || !pendingSearch) return;
    openWorkLinkUpSetupModal(pendingSearch, {
      delayMs: 2000,
      consumeOnceFlag: true
    });
  }

  function applyAccountToPage() {
    if (!accountDashboard || !accountGuestCard) return;
    if (isEmbeddedAccountPage) {
      accountDashboard.hidden = true;
      accountGuestCard.hidden = true;
      return;
    }
    const account = readAccount();
    const isLoggedIn = Boolean(account && account.loggedIn);
    accountDashboard.hidden = !isLoggedIn;
    accountGuestCard.hidden = isLoggedIn;
    if (!isLoggedIn) return;

    const name = account.name || 'WorkLinkUp User';
    const email = account.email || 'you@example.com';
    if (accountDisplayName) accountDisplayName.textContent = name;
    if (accountProfileName) accountProfileName.textContent = name;
    if (accountProfileEmail) accountProfileEmail.textContent = email;
  }

  function getDeleteIdentifier(account) {
    if (!account) return { label: 'Email address', value: '' };
    const provider = String(account.provider || '');
    const phone = String(account.phone || '').trim();
    const email = String(account.email || '').trim();
    if (provider.includes('phone') || (!email && phone)) {
      return { label: 'Phone number', value: phone };
    }
    return { label: 'Email address', value: email };
  }

  function syncDeleteConfirmationState() {
    const account = readAccount();
    const expected = getDeleteIdentifier(account).value;
    const typed = String(accountDeleteInput?.value || '').trim();
    if (accountDeleteConfirm) {
      accountDeleteConfirm.disabled = !expected || typed !== expected;
    }
  }

  function openDeleteModal() {
    if (!accountDeleteOverlay) return;
    const account = readAccount();
    const target = getDeleteIdentifier(account);
    if (accountDeleteLabel) accountDeleteLabel.textContent = target.label;
    if (accountDeleteTargetLabel) accountDeleteTargetLabel.textContent = target.value || 'No identifier found';
    if (accountDeleteInput) {
      accountDeleteInput.value = '';
      accountDeleteInput.placeholder = `Type your ${target.label.toLowerCase()} exactly`;
    }
    syncDeleteConfirmationState();
    accountDeleteOverlay.hidden = false;
  }

  function closeDeleteModal() {
    if (!accountDeleteOverlay) return;
    accountDeleteOverlay.hidden = true;
  }

  function promptAccountSignIn() {
    if (accountAuthOverlay) {
      openAccountPanel();
      return;
    }
    window.alert('Please sign in first.');
  }

  const cartStorageKey = 'softgiggles_cart';
  const wishlistStorageKey = 'softgiggles_wishlist';
  const freeDeliveryThreshold = 600;

  function getSiteBasePath() {
    if (typeof getBasePath === 'function') return getBasePath();
    return window.location.pathname.includes('/pages/') ? '../' : '';
  }

  function slugifyProductId(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function readCollection(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function writeCollection(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // Ignore storage issues and keep the interface usable.
    }
  }

  function readCart() {
    return readCollection(cartStorageKey);
  }

  function writeCart(items) {
    writeCollection(cartStorageKey, items);
  }

  function readWishlist() {
    return readCollection(wishlistStorageKey);
  }

  function writeWishlist(items) {
    writeCollection(wishlistStorageKey, items);
  }

  function parsePrice(priceText) {
    const text = String(priceText || '').trim();
    const numeric = Number.parseFloat(text.replace(/[^0-9.]+/g, '')) || 0;
    const currencySymbol = text.includes('$') ? '$' : 'R';
    return { amount: numeric, currencySymbol };
  }

  function formatMoney(amount, currencySymbol = 'R') {
    return `${currencySymbol} ${Number(amount || 0).toFixed(2)}`;
  }

  function inferColour(name) {
    const colours = [
      'yellow', 'natural', 'pink', 'grey', 'gray', 'brown', 'burgundy', 'blue',
      'green', 'olive', 'charcoal', 'tan', 'teal', 'black', 'white', 'red'
    ];
    const lowerName = String(name || '').toLowerCase();
    const match = colours.find((colour) => lowerName.includes(colour));
    if (!match) return 'ASSORTED';
    return match === 'gray' ? 'GREY' : match.toUpperCase();
  }

  function syncCartBadge(count = readCart().reduce((total, item) => total + Number(item.quantity || 0), 0)) {
    document.querySelectorAll('.cart-badge').forEach((badge) => {
      badge.textContent = String(count);
    });
  }

  function getCartSummary(items = readCart()) {
    const cartItems = Array.isArray(items) ? items : [];
    const subtotal = cartItems.reduce((total, item) => total + (Number(item.amount) * Number(item.quantity || 0)), 0);
    const currencySymbol = cartItems[0]?.currencySymbol || 'R';
    const quantity = cartItems.reduce((total, item) => total + Number(item.quantity || 0), 0);
    return { items: cartItems, subtotal, currencySymbol, quantity };
  }

  function buildCartItemMarkup(item, context = 'drawer') {
    const controlsClass = context === 'page' ? 'cart-line-controls is-page' : 'cart-line-controls';
    return `
      <article class="cart-line-item" data-cart-item-id="${item.id}">
        <div class="cart-line-media">
          <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="cart-line-content">
          <div class="cart-line-head">
            <div>
              <h3>${item.name}</h3>
              <p>Colour: ${item.colour}</p>
              <p>Size: ${item.size}</p>
            </div>
            <button type="button" class="cart-line-remove" data-cart-remove="${item.id}">Remove</button>
          </div>
          <div class="${controlsClass}">
            <div class="cart-qty-control">
              <button type="button" aria-label="Decrease quantity" data-cart-qty="${item.id}" data-cart-change="-1">−</button>
              <span>${item.quantity}</span>
              <button type="button" aria-label="Increase quantity" data-cart-qty="${item.id}" data-cart-change="1">+</button>
            </div>
            <strong>${formatMoney(item.amount * item.quantity, item.currencySymbol)}</strong>
          </div>
        </div>
      </article>
    `;
  }

  function renderCartDrawer() {
    const drawerItemsHost = document.querySelector('[data-cart-drawer-items]');
    const subtotalLabel = document.querySelector('[data-cart-subtotal]');
    const progressCopy = document.querySelector('.cart-progress-copy');
    const progressFill = document.querySelector('.cart-progress-fill');
    if (!drawerItemsHost || !subtotalLabel || !progressCopy || !progressFill) return;

    const { items, subtotal, currencySymbol } = getCartSummary();
    subtotalLabel.textContent = formatMoney(subtotal, currencySymbol);

    const progressRatio = Math.min(subtotal / freeDeliveryThreshold, 1);
    progressFill.style.width = `${progressRatio * 100}%`;
    const amountRemaining = Math.max(freeDeliveryThreshold - subtotal, 0);
    progressCopy.textContent = amountRemaining > 0
      ? `Spend ${formatMoney(amountRemaining, currencySymbol)} more and receive free delivery.`
      : 'You have qualified for free delivery.';

    drawerItemsHost.innerHTML = items.length
      ? items.map((item) => buildCartItemMarkup(item, 'drawer')).join('')
      : `
        <div class="cart-empty-state">
          <div class="cart-empty-icon"><i class="fa-solid fa-bag-shopping"></i></div>
          <h3>Your cart is empty</h3>
          <p>Add a few baby essentials and they will appear here.</p>
        </div>
      `;
  }

  function renderWishlistButtons() {
    const wishlist = readWishlist();
    const wishlistIds = new Set(wishlist.map((item) => item.id));
    document.querySelectorAll('.product-card').forEach((card) => {
      const product = getProductFromCard(card);
      const button = card.querySelector('.wishlist-btn');
      if (!button) return;
      const isSaved = wishlistIds.has(product.id);
      button.innerHTML = isSaved ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
      button.classList.toggle('is-active', isSaved);
      button.setAttribute('aria-label', isSaved ? 'Remove from wishlist' : 'Add to wishlist');
    });
  }

  function renderWishlistPage() {
    const emptyState = document.querySelector('[data-wishlist-empty]');
    const listSection = document.querySelector('[data-wishlist-list]');
    const listHost = document.querySelector('[data-wishlist-items]');
    if (!emptyState || !listSection || !listHost) return;

    const base = getSiteBasePath();
    const wishlist = readWishlist();
    emptyState.hidden = wishlist.length > 0;
    listSection.hidden = wishlist.length === 0;

    listHost.innerHTML = wishlist.map((item) => `
      <article class="wishlist-product-card" data-wishlist-item-id="${item.id}">
        <a href="${base}pages/cart.html" class="wishlist-product-image">
          <img src="${item.image}" alt="${item.name}" />
        </a>
        <div class="wishlist-product-copy">
          <h3>${item.name}</h3>
          <p>Colour: ${item.colour}</p>
          <p>Size: ${item.size}</p>
          <strong>${formatMoney(item.amount, item.currencySymbol)}</strong>
          <div class="wishlist-product-actions">
            <button type="button" class="wishlist-action-btn" data-wishlist-add-cart="${item.id}">Add to cart</button>
            <button type="button" class="wishlist-secondary-btn" data-wishlist-remove="${item.id}">Remove</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  function renderCartPage() {
    const itemsHost = document.querySelector('[data-cart-page-items]');
    const summaryHost = document.querySelector('[data-cart-page-summary]');
    if (!itemsHost || !summaryHost) return;

    const { items, subtotal, currencySymbol, quantity } = getCartSummary();
    const amountRemaining = Math.max(freeDeliveryThreshold - subtotal, 0);
    const progressRatio = Math.min(subtotal / freeDeliveryThreshold, 1);

    itemsHost.innerHTML = items.length
      ? items.map((item) => buildCartItemMarkup(item, 'page')).join('')
      : `
        <div class="cart-page-empty">
          <h2>Your shopping cart is empty</h2>
          <p>Add products from the catalogue to continue shopping.</p>
          <a href="${getSiteBasePath()}index.html" class="cart-page-continue">Continue shopping</a>
        </div>
      `;

    summaryHost.innerHTML = `
      <section class="cart-summary-card">
        <div class="cart-drawer-progress cart-page-progress">
          <div class="cart-progress-track">
            <span class="cart-progress-fill" style="width:${progressRatio * 100}%"></span>
          </div>
          <p class="cart-progress-copy">${amountRemaining > 0 ? `Spend ${formatMoney(amountRemaining, currencySymbol)} more and receive free delivery.` : 'You have qualified for free delivery.'}</p>
        </div>
      </section>
      <section class="cart-summary-card">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <strong>${formatMoney(subtotal, currencySymbol)}</strong>
        </div>
        <p>Tax included. Shipping calculated at checkout.</p>
        <a href="${getSiteBasePath()}pages/checkout.html" class="cart-summary-checkout ${items.length ? '' : 'is-disabled'}">Checkout</a>
        <div class="cart-summary-safe">This is a secure checkout</div>
        <div class="cart-summary-count">${quantity} item${quantity === 1 ? '' : 's'} in cart</div>
      </section>
    `;
  }

  function renderCheckoutPage() {
    const deliveryInput = document.querySelector('[data-checkout-shipping]');
    const summaryTotal = document.querySelector('[data-checkout-total]');
    const summarySubtotal = document.querySelector('[data-checkout-subtotal]');
    const summaryShipping = document.querySelector('[data-checkout-shipping-copy]');
    const itemsHost = document.querySelector('[data-checkout-items]');
    const homePanel = document.querySelector('[data-home-delivery-panel]');
    const pickupPanel = document.querySelector('[data-pickup-panel]');
    const toggleButtons = document.querySelectorAll('[data-delivery-mode]');
    const payButton = document.querySelector('[data-pay-now]');
    if (!summaryTotal || !summarySubtotal || !summaryShipping || !itemsHost || !homePanel || !pickupPanel) return;

    const { items, subtotal, currencySymbol, quantity } = getCartSummary();
    const shippingValue = deliveryInput?.value === 'pickup' ? 0 : 0;
    const total = subtotal + shippingValue;

    summarySubtotal.textContent = `${formatMoney(subtotal, currencySymbol)} · ${quantity} item${quantity === 1 ? '' : 's'}`;
    summaryShipping.textContent = deliveryInput?.value === 'pickup' ? 'Pickup point selected' : 'Enter shipping address';
    summaryTotal.textContent = formatMoney(total, currencySymbol);
    itemsHost.innerHTML = items.map((item) => `
      <article class="checkout-order-item">
        <div class="checkout-order-media">
          <img src="${item.image}" alt="${item.name}" />
          <span>${item.quantity}</span>
        </div>
        <div class="checkout-order-copy">
          <h3>${item.name}</h3>
          <p>${item.colour} / ${item.size}</p>
        </div>
        <strong>${formatMoney(item.amount * item.quantity, item.currencySymbol)}</strong>
      </article>
    `).join('');

    toggleButtons.forEach((button) => {
      const isActive = button.dataset.deliveryMode === (deliveryInput?.value || 'delivery');
      button.classList.toggle('is-active', isActive);
    });
    homePanel.hidden = deliveryInput?.value === 'pickup';
    pickupPanel.hidden = deliveryInput?.value !== 'pickup';
    if (payButton) {
      payButton.disabled = items.length === 0;
    }
  }

  function renderCommerceUI() {
    syncCartBadge();
    renderCartDrawer();
    renderWishlistButtons();
    renderWishlistPage();
    renderCartPage();
    renderCheckoutPage();
  }

  function getProductFromCard(card) {
    const title = card.querySelector('.product-info h3')?.textContent?.trim() || 'SoftGiggles product';
    const price = card.querySelector('.price')?.textContent?.trim() || '';
    const imageValue = card.querySelector('.product-img img')?.getAttribute('src') || '';
    const category = document.querySelector('.page-header h1')?.textContent?.trim() || 'Catalog';
    const { amount, currencySymbol } = parsePrice(price);
    const image = imageValue ? new URL(imageValue, window.location.href).href : '';
    return {
      id: slugifyProductId(title),
      name: title,
      price,
      image,
      category,
      amount,
      currencySymbol,
      quantity: 1,
      size: '3-6 MTHS',
      colour: inferColour(title)
    };
  }

  async function handleCartAction(card, button, successLabel) {
    setButtonLoading(button, true);
    try {
      const product = getProductFromCard(card);
      const cart = readCart();
      const existingItem = cart.find((item) => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push(product);
      }
      writeCart(cart);
      document.dispatchEvent(new CustomEvent('softgiggles:cart-open'));
      renderCommerceUI();
      const defaultLabel = button.dataset.defaultLabel || button.textContent;
      button.textContent = successLabel;
      button.classList.add('is-added');
      window.setTimeout(() => {
        button.textContent = defaultLabel;
        button.classList.remove('is-added');
      }, 1200);
    } catch (error) {
      window.alert(error.message || 'Could not add item to cart.');
    } finally {
      setButtonLoading(button, false);
    }
  }

  function logoutAccount() {
    try {
      localStorage.removeItem(accountStorageKey);
    } catch (error) {
      // Ignore storage issues.
    }
    window.location.reload();
  }

  accountLoggedOutTriggers.forEach(trigger => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openAccountPanel();
    });
  });

  if (accountAuthClose) {
    accountAuthClose.addEventListener('click', closeAccountPanel);
  }

  if (accountAuthOverlay) {
    accountAuthOverlay.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === accountAuthOverlay) closeAccountPanel();
    });
  }

  if (accountEmailToggle && accountEmailFormWrap) {
    accountEmailToggle.addEventListener('click', () => {
      const willOpen = !accountEmailFormWrap.classList.contains('is-open');
      accountEmailFormWrap.classList.toggle('is-open', willOpen);
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      setMethodVisibility(willOpen ? 'email' : 'all');
    });
  }

  if (accountPhoneToggle && accountPhoneFormWrap) {
    accountPhoneToggle.addEventListener('click', () => {
      const willOpen = !accountPhoneFormWrap.classList.contains('is-open');
      accountPhoneFormWrap.classList.toggle('is-open', willOpen);
      if (accountEmailFormWrap) accountEmailFormWrap.classList.remove('is-open');
      setMethodVisibility(willOpen ? 'phone' : 'all');
    });
  }

  if (accountModeSwitch && accountModeInput) {
    accountModeSwitch.addEventListener('click', () => {
      const nextMode = accountModeInput.value === 'signup' ? 'signin' : 'signup';
      syncAccountMode(nextMode);
      if (accountEmailFormWrap) accountEmailFormWrap.classList.add('is-open');
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      setMethodVisibility('email');
    });
  }

  if (!isEmbeddedAccountPage && accountPageModeSwitch && accountPageModeInput) {
    accountPageModeSwitch.addEventListener('click', () => {
      const nextMode = accountPageModeInput.value === 'signup' ? 'signin' : 'signup';
      syncAccountPageMode(nextMode);
    });
  }

  if (accountForgotPasswordBtn && accountEmailInput) {
    accountForgotPasswordBtn.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper || typeof authHelper.resetPassword !== 'function') return;
      const email = accountEmailInput.value.trim();
      if (!email) {
        window.alert('Enter your email address first so we can send the reset link.');
        accountEmailInput.focus();
        return;
      }

      accountForgotPasswordBtn.disabled = true;
      try {
        await authHelper.resetPassword(email);
        showAccountSuccess('Password reset email sent');
      } catch (error) {
        window.alert(error.message || 'Could not send reset email.');
      } finally {
        accountForgotPasswordBtn.disabled = false;
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageForgotPasswordBtn && accountPageEmailInput) {
    accountPageForgotPasswordBtn.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper || typeof authHelper.resetPassword !== 'function') return;
      const email = accountPageEmailInput.value.trim();
      if (!email) {
        window.alert('Enter your email address first so we can send the reset link.');
        accountPageEmailInput.focus();
        return;
      }

      accountPageForgotPasswordBtn.disabled = true;
      try {
        await authHelper.resetPassword(email);
        showAccountSuccess('Password reset email sent');
      } catch (error) {
        window.alert(error.message || 'Could not send reset email.');
      } finally {
        accountPageForgotPasswordBtn.disabled = false;
      }
    });
  }

  accountChangeMethodBtns.forEach((button) => {
    button.addEventListener('click', () => {
      if (accountEmailFormWrap) accountEmailFormWrap.classList.remove('is-open');
      if (accountPhoneFormWrap) accountPhoneFormWrap.classList.remove('is-open');
      if (accountCodeRow) accountCodeRow.hidden = true;
      if (accountPhoneVerify) accountPhoneVerify.hidden = true;
      setMethodVisibility('all');
    });
  });

  if (accountGoogleBtn) {
    accountGoogleBtn.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountGoogleBtn, true);
      try {
        const result = await authHelper.signInWithGoogle();
        if (result?.redirected) return;
        finalizeAuthSuccess('Signed in successfully');
      } catch (error) {
        window.alert(error.message || 'Google sign-in failed.');
      } finally {
        setButtonLoading(accountGoogleBtn, false);
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageGoogleBtn) {
    accountPageGoogleBtn.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountPageGoogleBtn, true);
      try {
        const result = await authHelper.signInWithGoogle();
        if (result?.redirected) return;
        finalizeAuthSuccess('Signed in successfully');
      } catch (error) {
        window.alert(error.message || 'Google sign-in failed.');
      } finally {
        setButtonLoading(accountPageGoogleBtn, false);
      }
    });
  }

  if (accountEmailForm && accountModeInput) {
    accountEmailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      const formData = new FormData(accountEmailForm);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      const typedName = String(formData.get('name') || '').trim();
      const isSignup = accountModeInput.value === 'signup';
      setButtonLoading(accountSubmitBtn, true);

      try {
        if (isSignup) {
          await authHelper.signUpWithEmail(typedName, email, password);
        } else {
          await authHelper.signInWithEmail(email, password);
        }
        finalizeAuthSuccess(isSignup ? 'Account created successfully' : 'Signed in successfully');
      } catch (error) {
        window.alert(error.message || 'Email authentication failed.');
      } finally {
        setButtonLoading(accountSubmitBtn, false);
      }
    });
  }

  if (!isEmbeddedAccountPage && accountPageEmailForm && accountPageModeInput) {
    accountPageEmailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      const formData = new FormData(accountPageEmailForm);
      const email = String(formData.get('email') || '').trim();
      const password = String(formData.get('password') || '');
      const typedName = String(formData.get('name') || '').trim();
      const isSignup = accountPageModeInput.value === 'signup';
      setButtonLoading(accountPageSubmitBtn, true);

      try {
        if (isSignup) {
          await authHelper.signUpWithEmail(typedName, email, password);
        } else {
          await authHelper.signInWithEmail(email, password);
        }
        finalizeAuthSuccess(isSignup ? 'Account created successfully' : 'Signed in successfully');
      } catch (error) {
        window.alert(error.message || 'Email authentication failed.');
      } finally {
        setButtonLoading(accountPageSubmitBtn, false);
      }
    });
  }

  if (accountPhoneSubmit && accountPhoneInput) {
    accountPhoneSubmit.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountPhoneSubmit, true);
      try {
        await authHelper.sendPhoneCode(accountPhoneInput.value.trim());
        if (accountCodeRow) accountCodeRow.hidden = false;
        if (accountPhoneVerify) accountPhoneVerify.hidden = false;
      } catch (error) {
        window.alert(error.message || 'Could not send verification code.');
      } finally {
        setButtonLoading(accountPhoneSubmit, false);
      }
    });
  }

  if (accountPhoneVerify && accountPhoneCode) {
    accountPhoneVerify.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountPhoneVerify, true);
      try {
        await authHelper.verifyPhoneCode(accountPhoneCode.value.trim());
        showAccountSuccess('Signed in successfully', () => window.location.reload());
      } catch (error) {
        window.alert(error.message || 'Verification failed.');
      } finally {
        setButtonLoading(accountPhoneVerify, false);
      }
    });
  }

  if (accountPageLogout) {
    accountPageLogout.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (authHelper) {
        try {
          await authHelper.signOut();
        } catch (error) {
          window.alert(error.message || 'Could not log out.');
        }
        window.location.reload();
        return;
      }
      logoutAccount();
    });
  }

  if (accountDeleteLink) {
    accountDeleteLink.addEventListener('click', openDeleteModal);
  }

  if (accountDeleteInput) {
    accountDeleteInput.addEventListener('input', syncDeleteConfirmationState);
  }

  [accountDeleteClose, accountDeleteCancel].forEach((button) => {
    if (!button) return;
    button.addEventListener('click', closeDeleteModal);
  });

  if (accountDeleteOverlay) {
    accountDeleteOverlay.addEventListener('click', (event) => {
      if (event.target === accountDeleteOverlay) closeDeleteModal();
    });
  }

  if (accountDeleteConfirm) {
    accountDeleteConfirm.addEventListener('click', async () => {
      const authHelper = await getAuthHelperReady();
      if (!authHelper) return;
      setButtonLoading(accountDeleteConfirm, true);
      try {
        await authHelper.deleteProfile();
        showAccountSuccess('Profile deleted successfully', () => {
          window.location.href = '../index.html';
        });
      } catch (error) {
        window.alert(error.message || 'Profile deletion failed. You may need to sign in again before deleting your profile.');
      } finally {
        setButtonLoading(accountDeleteConfirm, false);
      }
    });
  }

  syncAccountMode('signin');
  if (!isEmbeddedAccountPage) {
    syncAccountPageMode('signup');
  }
  setMethodVisibility('all');
  applyAccountToPage();
  maybeHandleRedirectedGoogleAuth();
  initPendingSetupModal();

  // Filter group collapse
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      const content = group.querySelector('.filter-group-content');
      if (content) content.style.display = content.style.display === 'none' ? '' : 'none';
    });
  });

  const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartDrawerClose = document.querySelector('.cart-drawer-close');

  function openCartDrawer() {
    if (!cartDrawerOverlay) return;
    renderCartDrawer();
    cartDrawerOverlay.hidden = false;
    requestAnimationFrame(() => {
      cartDrawerOverlay.classList.add('is-visible');
    });
  }

  function closeCartDrawer() {
    if (!cartDrawerOverlay) return;
    cartDrawerOverlay.classList.remove('is-visible');
    window.setTimeout(() => {
      cartDrawerOverlay.hidden = true;
    }, 240);
  }

  document.querySelectorAll('.wishlist-btn').forEach((btn) => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      const card = btn.closest('.product-card');
      if (!card) return;
      const product = getProductFromCard(card);
      const wishlist = readWishlist();
      const itemIndex = wishlist.findIndex((item) => item.id === product.id);
      if (itemIndex >= 0) {
        wishlist.splice(itemIndex, 1);
      } else {
        wishlist.unshift(product);
      }
      writeWishlist(wishlist);
      renderCommerceUI();
    });
  });

  document.querySelectorAll('.product-card').forEach((card) => {
    const quickAddBtn = card.querySelector('.quick-add');
    const addBtn = card.querySelector('.add-btn');

    if (quickAddBtn) {
      quickAddBtn.textContent = 'Add to Cart';
      quickAddBtn.dataset.defaultLabel = 'Add to Cart';
      quickAddBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, quickAddBtn, 'Added');
      });
    }

    if (addBtn) {
      addBtn.dataset.defaultLabel = '+';
      addBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, addBtn, '✓');
      });
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const cartTrigger = target.closest('[data-cart-trigger]');
    if (cartTrigger) {
      event.preventDefault();
      openCartDrawer();
      return;
    }

    if (target === cartDrawerOverlay) {
      closeCartDrawer();
      return;
    }

    const qtyButton = target.closest('[data-cart-qty]');
    if (qtyButton) {
      const itemId = qtyButton.getAttribute('data-cart-qty');
      const change = Number(qtyButton.getAttribute('data-cart-change') || 0);
      const cart = readCart().map((item) => item.id === itemId ? { ...item, quantity: Math.max(1, Number(item.quantity || 1) + change) } : item);
      writeCart(cart);
      renderCommerceUI();
      return;
    }

    const removeButton = target.closest('[data-cart-remove]');
    if (removeButton) {
      const itemId = removeButton.getAttribute('data-cart-remove');
      writeCart(readCart().filter((item) => item.id !== itemId));
      renderCommerceUI();
      return;
    }

    const wishlistRemove = target.closest('[data-wishlist-remove]');
    if (wishlistRemove) {
      const itemId = wishlistRemove.getAttribute('data-wishlist-remove');
      writeWishlist(readWishlist().filter((item) => item.id !== itemId));
      renderCommerceUI();
      return;
    }

    const wishlistAddCart = target.closest('[data-wishlist-add-cart]');
    if (wishlistAddCart) {
      const itemId = wishlistAddCart.getAttribute('data-wishlist-add-cart');
      const wishlistItem = readWishlist().find((item) => item.id === itemId);
      if (!wishlistItem) return;
      const cart = readCart();
      const existingItem = cart.find((item) => item.id === itemId);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.unshift({ ...wishlistItem, quantity: 1 });
      }
      writeCart(cart);
      renderCommerceUI();
      openCartDrawer();
      return;
    }

    const deliveryToggle = target.closest('[data-delivery-mode]');
    if (deliveryToggle) {
      const deliveryInput = document.querySelector('[data-checkout-shipping]');
      if (deliveryInput) {
        deliveryInput.value = deliveryToggle.getAttribute('data-delivery-mode') || 'delivery';
        renderCheckoutPage();
      }
      return;
    }
  });

  if (cartDrawerClose) {
    cartDrawerClose.addEventListener('click', closeCartDrawer);
  }

  document.addEventListener('softgiggles:cart-open', openCartDrawer);

  renderCommerceUI();
});
