// Nav mega dropdown hover logic
document.addEventListener('DOMContentLoaded', () => {
  const SEARCH_ITEMS = [
    'Onesies and Bodysuits',
    'Sleepers and Footies',
    'Rompers and Coveralls',
    'Graphic Tees and Polos',
    'Cargo Pants and Joggers',
    'Shorts and Overalls',
    'Sets and Tracksuits',
    'Cardigans and Hoodies',
    'Bunting Suits and Jackets',
    'Socks and Booties',
    'Beanies and Baseball Caps',
    'Bow Ties and Braces',
    'Rompers and Sunsuits',
    'Dresses and Skirts',
    'Leggings and Ruffle Pants',
    'Bloomers and Diaper Covers',
    'Tunics and Blouses',
    'Sweaters and Cardigans',
    'Coats and Pram Suits',
    'Socks and Tights',
    'Headbands and Soft Bows',
    'Sun Hats and Bonnets',
    'Grey or Navy Trousers',
    'Button-Down Shirts',
    'Polo Shirts',
    'School Blazers',
    'Backpacks and Satchels',
    'Insulated Lunch Boxes',
    'Water Bottles',
    'Pencil Cases',
    'Fleece Babygrow Yellow',
    'Fleece Babygrow Natural',
    'Fleece Babygrow Light Pink',
    'Babygrow Grey',
    'Babygrow Natural',
    'Tiny winter dress',
    'Tiny winter shoes',
    'Tiny warm winter hat',
    'Toddler Girls',
    'Toddler Boys',
    'Girls Jackets',
    'Girls Shoes',
    'Boys Jackets',
    'Boys Shoes',
    'Fleece Tops',
    'Jackets',
    'Shop Dresses',
    'Shop Shoes',
    'Shop Hats',
    'Toys',
    'Sale',
    'Promotions'
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

  let searchModal = document.getElementById('search-coming-modal');
  let searchSuggestions = document.getElementById('search-suggestions');
  let activeSearchInput = null;

  if (!searchModal) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="search-coming-overlay" id="search-coming-modal" hidden>
        <div class="search-coming-dialog">
          <button type="button" class="search-coming-close" aria-label="Close search modal">×</button>
          <h3>Search coming soon</h3>
          <p>We are still building search. Suggestions are available, but full search will be live soon.</p>
        </div>
      </div>
    `);
    searchModal = document.getElementById('search-coming-modal');
  }

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

  function openSearchModal() {
    if (!searchModal) return;
    searchModal.hidden = false;
    requestAnimationFrame(() => searchModal.classList.add('is-visible'));
  }

  function closeSearchModal() {
    if (!searchModal) return;
    searchModal.classList.remove('is-visible');
    setTimeout(() => {
      searchModal.hidden = true;
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
    const matches = SEARCH_ITEMS.filter(item => item.toLowerCase().includes(query)).slice(0, 8);

    if (!query) {
      searchSuggestions.innerHTML = '';
      searchSuggestions.hidden = true;
      searchSuggestions.classList.remove('is-visible');
      return;
    }

    if (!matches.length) {
      searchSuggestions.innerHTML = `<button type="button" class="search-suggestion is-empty">No suggestions found</button>`;
    } else {
      searchSuggestions.innerHTML = matches.map(item => `
        <button type="button" class="search-suggestion" data-value="${item}">
          <span class="search-suggestion-icon">⌕</span>
          <span>${highlightMatch(item, rawQuery)}</span>
        </button>
      `).join('');
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

  document.querySelectorAll('.search-bar input').forEach(input => {
    input.addEventListener('focus', () => {
      if (input.value.trim()) renderSearchSuggestions(input);
    });

    input.addEventListener('input', () => {
      renderSearchSuggestions(input);
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        hideSearchSuggestions();
        openSearchModal();
      }
    });
  });

  if (searchSuggestions) {
    searchSuggestions.addEventListener('mousedown', (event) => {
      const button = event.target.closest('.search-suggestion');
      if (!button || button.classList.contains('is-empty')) return;
      event.preventDefault();
      const value = button.getAttribute('data-value') || '';
      if (activeSearchInput) activeSearchInput.value = value;
      hideSearchSuggestions();
      openSearchModal();
    });
  }

  if (searchModal) {
    searchModal.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target === searchModal || target.closest('.search-coming-close')) {
        closeSearchModal();
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
  const accountNameInput = document.getElementById('account-name');
  const accountModeSwitch = document.querySelector('.account-mode-switch');
  const accountChangeMethodBtns = document.querySelectorAll('.account-change-method');
  const accountModeInput = document.getElementById('account-mode');
  const accountSuccessToast = document.getElementById('account-success-toast');
  const accountHeading = document.querySelector('.account-auth-heading');
  const accountSubtext = document.querySelector('.account-auth-subtext');
  const accountSwitchLabel = document.querySelector('.account-switch-label');
  const accountSubmitBtn = document.querySelector('.account-email-form .account-submit-btn');
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

  function setButtonLoading(button, isLoading) {
    if (!button) return;
    button.classList.toggle('is-loading', isLoading);
    button.disabled = isLoading;
  }

  function syncAccountMode(mode) {
    if (!accountModeInput) return;
    accountModeInput.value = mode;
    const isSignup = mode === 'signup';
    if (accountHeading) accountHeading.textContent = isSignup ? 'Create Account' : 'Welcome';
    if (accountSubtext) {
      accountSubtext.textContent = isSignup
        ? 'Set up your SoftGiggles account to save your favourites and shop faster.'
        : 'Create an account or sign in to continue.';
    }
    if (accountSwitchLabel) accountSwitchLabel.textContent = isSignup ? 'Already have an account?' : 'New here?';
    if (accountModeSwitch) accountModeSwitch.textContent = isSignup ? 'Sign in' : 'Sign up';
    if (accountSubmitBtn) {
      accountSubmitBtn.textContent = isSignup ? 'Create Account' : 'Sign In';
      accountSubmitBtn.classList.toggle('account-submit-signup', isSignup);
      accountSubmitBtn.classList.toggle('account-submit-signin', !isSignup);
    }
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

  function applyAccountToPage() {
    const account = readAccount();
    if (!accountDashboard || !accountGuestCard) return;
    const isLoggedIn = Boolean(account && account.loggedIn);
    accountDashboard.hidden = !isLoggedIn;
    accountGuestCard.hidden = isLoggedIn;
    if (!isLoggedIn) return;

    const name = account.name || 'Black Gift';
    const email = account.email || 'blackgifttechlabs@gmail.com';
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

  function slugifyProductId(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getProductFromCard(card) {
    const title = card.querySelector('.product-info h3')?.textContent?.trim() || 'SoftGiggles product';
    const price = card.querySelector('.price')?.textContent?.trim() || '';
    const image = card.querySelector('.product-img img')?.getAttribute('src') || '';
    const category = document.querySelector('.page-header h1')?.textContent?.trim() || 'Catalog';
    return {
      id: slugifyProductId(title),
      name: title,
      price,
      image,
      category
    };
  }

  async function handleCartAction(card, button, successLabel) {
    const authHelper = getAuthHelper();
    const account = readAccount();
    if (!authHelper || !account || !account.loggedIn) {
      promptAccountSignIn();
      return;
    }

    setButtonLoading(button, true);
    try {
      const product = getProductFromCard(card);
      await authHelper.addToCart(product);
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
      const authHelper = getAuthHelper();
      if (!authHelper) return;
      setButtonLoading(accountGoogleBtn, true);
      try {
        await authHelper.signInWithGoogle();
        showAccountSuccess('Signed in successfully', () => window.location.reload());
      } catch (error) {
        window.alert(error.message || 'Google sign-in failed.');
      } finally {
        setButtonLoading(accountGoogleBtn, false);
      }
    });
  }

  if (accountEmailForm && accountModeInput) {
    accountEmailForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const authHelper = getAuthHelper();
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
        showAccountSuccess(isSignup ? 'Account created successfully' : 'Signed in successfully', () => window.location.reload());
      } catch (error) {
        window.alert(error.message || 'Email authentication failed.');
      } finally {
        setButtonLoading(accountSubmitBtn, false);
      }
    });
  }

  if (accountPhoneSubmit && accountPhoneInput) {
    accountPhoneSubmit.addEventListener('click', async () => {
      const authHelper = getAuthHelper();
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
      const authHelper = getAuthHelper();
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
      const authHelper = getAuthHelper();
      if (authHelper) {
        await authHelper.signOut();
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
      const authHelper = getAuthHelper();
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
  setMethodVisibility('all');
  applyAccountToPage();

  // Filter group collapse
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      const content = group.querySelector('.filter-group-content');
      if (content) content.style.display = content.style.display === 'none' ? '' : 'none';
    });
  });

  // Wishlist toggle
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const authHelper = getAuthHelper();
      const account = readAccount();
      if (!authHelper || !account || !account.loggedIn) {
        promptAccountSignIn();
        return;
      }
      setButtonLoading(btn, true);
      try {
        const card = btn.closest('.product-card');
        if (!card) return;
        const product = getProductFromCard(card);
        const result = await authHelper.toggleWishlist(product);
        btn.textContent = result.saved ? '♥' : '♡';
        btn.style.color = result.saved ? '#e53e3e' : '#999';
      } catch (error) {
        window.alert(error.message || 'Could not update wishlist.');
      } finally {
        setButtonLoading(btn, false);
      }
    });
  });

  document.querySelectorAll('.catalog-grid .product-card').forEach((card) => {
    const quickAddBtn = card.querySelector('.quick-add');
    const productInfo = card.querySelector('.product-info');

    if (quickAddBtn) {
      quickAddBtn.textContent = 'Add to Cart';
      quickAddBtn.dataset.defaultLabel = 'Add to Cart';
      quickAddBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, quickAddBtn, 'Added');
      });
    }

    if (productInfo && !productInfo.querySelector('.product-actions-row')) {
      const actionsRow = document.createElement('div');
      actionsRow.className = 'product-actions-row';

      const addToCartBtn = document.createElement('button');
      addToCartBtn.type = 'button';
      addToCartBtn.className = 'order-online-btn';
      addToCartBtn.textContent = 'Add to Cart';
      addToCartBtn.dataset.defaultLabel = 'Add to Cart';
      addToCartBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, addToCartBtn, 'Added');
      });

      const orderOnlineBtn = document.createElement('button');
      orderOnlineBtn.type = 'button';
      orderOnlineBtn.className = 'order-online-btn';
      orderOnlineBtn.textContent = 'Order Online';
      orderOnlineBtn.dataset.defaultLabel = 'Order Online';
      orderOnlineBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        await handleCartAction(card, orderOnlineBtn, 'Queued');
      });

      actionsRow.append(addToCartBtn, orderOnlineBtn);
      productInfo.appendChild(actionsRow);
      if (quickAddBtn) quickAddBtn.remove();
    }
  });
});
