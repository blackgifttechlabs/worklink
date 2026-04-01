// shared-header.js - injected into all pages

function getBasePath() {
  // Determine relative path based on current page location
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function getStoredAccount() {
  try {
    const raw = localStorage.getItem('softgiggles_account');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function pageNeedsProvidersUi(pathname = window.location.pathname) {
  return /\/pages\/(specialists|provider-profile|my-posts|messages|account)\.html$/.test(pathname);
}

function pageNeedsEagerAuth(pathname = window.location.pathname) {
  return /\/pages\/(specialists|provider-profile|my-posts|messages|account)\.html$/.test(pathname);
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
    : `${base}pages/account.html`;
}

function renderHeader() {
  const base = getBasePath();
  const account = getStoredAccount();
  const isLoggedIn = Boolean(account && account.loggedIn);
  const accountName = account && account.name ? account.name : 'WorkLinkUp User';
  const firstName = accountName.split(' ')[0];
  const providerProfileHref = getProviderProfileHref(base);
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
      <div class="search-bar desktop-search-bar">
        <span class="search-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input type="text" placeholder="Search gardeners, plumbers, therapists, programmers..." data-search-context="inline" />
      </div>
      <div class="header-actions">
        <a href="${base}index.html#how-it-works" class="header-how-link">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9Z"/><path d="m9 12 2 2 4-4"/></svg>
          How It Works
        </a>
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
          <a href="${isLoggedIn ? providerProfileHref : '#'}" class="account-trigger account-link" data-account-trigger="account">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${isLoggedIn ? firstName : 'Account'}
          </a>
          ${isLoggedIn ? `
            <div class="account-dropdown" aria-hidden="true">
              <div class="account-dropdown-greeting">Hi, ${accountName}</div>
              <a href="${providerProfileHref}" class="account-dropdown-item">
                <i class="fa-regular fa-user"></i>
                <span>My Profile</span>
              </a>
              <a href="${base}pages/my-posts.html" class="account-dropdown-item">
                <i class="fa-regular fa-images"></i>
                <span>My Posts</span>
              </a>
              <a href="${base}pages/messages.html" class="account-dropdown-item">
                <i class="fa-regular fa-message"></i>
                <span>Messages</span>
              </a>
              <a href="${base}pages/account.html" class="account-dropdown-item">
                <i class="fa-solid fa-sliders"></i>
                <span>Settings</span>
              </a>
              <button type="button" class="account-dropdown-logout">Log Out</button>
            </div>
          ` : ''}
        </div>
        <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
  <div class="mobile-nav-overlay" aria-hidden="true"></div>
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
        <h3 id="mobile-search-title">Search coming soon</h3>
        <p>Use these sample results for now while full WorkLinkUp search is still being built.</p>
      </div>
      <div class="mobile-search-results" id="mobile-search-results"></div>
    </div>
  </div>
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
      <div class="nav-item">
        <a href="${base}index.html" class="nav-link">Home</a>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#service-types" class="nav-link">Home Services</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle Home Services menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Repairs & Outdoor</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-tree"></i><span>Gardener</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-wrench"></i><span>Plumber</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-bolt"></i><span>Electrician</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-hammer"></i><span>Carpenter</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-screwdriver-wrench"></i><span>Handyman</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-paint-roller"></i><span>Painter</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Home Support</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-soap"></i><span>Cleaner</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-truck-ramp-box"></i><span>Moving Help</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-faucet-drip"></i><span>Water Tank Cleaning</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-fan"></i><span>Appliance Repair</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-shield-dog"></i><span>Security & Guarding</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-boxes-packing"></i><span>General Labour</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#service-types" class="nav-link">Beauty & Wellness</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle Beauty and Wellness menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Beauty</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-scissors"></i><span>Hairdresser</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-wand-magic-sparkles"></i><span>Makeup Artist</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-hand-sparkles"></i><span>Nail Technician</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-user-tie"></i><span>Barber</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-spa"></i><span>Massage Therapist</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-person-running"></i><span>Fitness Coach</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Wellness & Care</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-heart-pulse"></i><span>Therapist</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-user-nurse"></i><span>Home Care Worker</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-child-reaching"></i><span>Child Care</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-user-group"></i><span>Counsellor</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-utensils"></i><span>Meal Prep</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-graduation-cap"></i><span>Tutor</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#service-types" class="nav-link">Digital & Business</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle Digital and Business menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Tech & Office</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-laptop-code"></i><span>Programmer</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-pen-ruler"></i><span>Designer</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-camera"></i><span>Photographer</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-video"></i><span>Videographer</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-hashtag"></i><span>Social Media Manager</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-keyboard"></i><span>Virtual Assistant</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Business Support</h4>
              <ul>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-calculator"></i><span>Bookkeeper</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-file-signature"></i><span>CV Writer</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-bullhorn"></i><span>Marketing Support</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-language"></i><span>Translation</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-print"></i><span>Printing & Branding</span></a></li>
                <li><a href="${base}index.html#service-types"><i class="fa-solid fa-store"></i><span>Small Business Help</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#cities" class="nav-link">Cities</a>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#for-clients" class="nav-link">For Clients</a>
      </div>
      <div class="nav-item">
        <a href="${base}index.html#for-workers" class="nav-link promo">For Workers</a>
      </div>
    </div>
  </nav>`;
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
              <div class="account-form-row account-name-row" hidden>
                <label for="account-name">Full name</label>
                <input id="account-name" name="name" type="text" placeholder="Tinashe Moyo" />
              </div>
              <div class="account-form-row">
                <label for="account-email">Email address</label>
                <input id="account-email" name="email" type="email" placeholder="you@example.com" required />
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
          <span class="google-mark" aria-hidden="true"><span class="google-g">G</span></span>
          <span class="account-btn-label">Sign in with Google</span>
        </button>
        <p class="account-auth-switch-copy">
          <span class="account-switch-label">Joining us for the first time?</span>
          <button type="button" class="account-mode-switch">Create Account</button>
        </p>
      </div>
      <p class="account-auth-note">By continuing, you agree to our Terms and Privacy Policy.</p>
      <input type="hidden" id="account-mode" value="signin" />
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
    header { position: relative; z-index: 2; }
    .header-inner { max-width: none; width: 100%; padding: 0 28px; grid-template-columns: minmax(0, 1fr) minmax(360px, 560px) minmax(0, 1fr); gap: 18px; height: 72px; }
    .mobile-header-left { display: flex; align-items: center; gap: 14px; min-width: 0; justify-self: start; }
    .logo { align-items: center; gap: 12px; font-size: 0; white-space: nowrap; }
    .logo-image { height: 34px; width: auto; }
    .logo-wordmark { display: inline-flex; align-items: baseline; font-size: 31px; font-weight: 800; line-height: 1; letter-spacing: -0.06em; }
    .logo-work { color: #076fe5; }
    .logo-link { color: rgba(7, 111, 229, 0.42); }
    .desktop-search-bar { justify-self: center; width: 100%; max-width: 560px; }
    .search-bar { border-color: rgba(7, 111, 229, 0.14); background: rgba(255, 255, 255, 0.86); }
    .search-bar:focus-within { border-color: #076fe5; box-shadow: 0 14px 30px rgba(7, 111, 229, 0.18); }
    .search-match { color: #076fe5; background: rgba(7, 111, 229, 0.12); }
    .header-actions { justify-self: end; gap: 18px; }
    .header-actions a, .mobile-search-trigger, .mobile-menu-toggle { color: var(--text-muted); }
    .header-actions a:hover, .mobile-search-trigger:hover, .mobile-menu-toggle:hover { color: #076fe5; }
    .header-how-link { display: inline-flex; }
    .mobile-search-trigger { display: none; }
    .mobile-search-overlay[hidden] { display: none !important; }
    .mobile-search-overlay { position: fixed; inset: 0; z-index: 1750; padding: 80px 12px 16px; background: rgba(15, 23, 42, 0.18); backdrop-filter: blur(16px); opacity: 0; pointer-events: none; transition: opacity 0.24s ease; }
    .mobile-search-overlay.is-visible { opacity: 1; pointer-events: auto; }
    .mobile-search-panel { width: min(100%, 620px); margin: 0 auto; background: rgba(252, 250, 247, 0.98); border: 1px solid rgba(26, 50, 99, 0.08); border-radius: 28px; box-shadow: 0 24px 48px rgba(15, 23, 42, 0.16); overflow: hidden; transform: translateY(28px) scale(0.96); opacity: 0; transform-origin: top center; transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.24s ease; }
    .mobile-search-overlay.is-visible .mobile-search-panel { transform: translateY(0) scale(1); opacity: 1; }
    .mobile-search-head { display: flex; align-items: center; gap: 12px; padding: 14px; }
    .mobile-search-toast-bar { max-width: none; width: 100%; transform: scale(0.98); transform-origin: top center; transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1); }
    .mobile-search-overlay.is-visible .mobile-search-toast-bar { transform: scale(1); }
    .mobile-search-close { border: none; background: transparent; color: #132647; font-size: 30px; line-height: 1; padding: 0; }
    .mobile-search-copy { padding: 0 18px 10px; }
    .mobile-search-results { display: grid; gap: 10px; padding: 0 14px 16px; max-height: min(62vh, 470px); overflow-y: auto; }
    .mobile-search-result { border: 1px solid rgba(26, 50, 99, 0.08); border-radius: 18px; background: #fff; padding: 12px; }
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
    .account-auth-close { border-radius: 20px; }
    .account-auth-method-card { border-radius: 20px; }
    .account-form-row input { border-radius: 20px; }
    .account-auth-btn,
    .account-submit-btn { border-radius: 20px; }
    .account-form-inline-link { justify-self: start; border: none; background: transparent; padding: 0; color: #076fe5; font-size: 14px; font-weight: 700; }
    .account-auth-switch-copy { display: flex; align-items: center; gap: 6px; margin: 2px 0 0; text-align: left; }
    .account-switch-label { color: #64748b; }
    .account-mode-switch { border: none; background: transparent; padding: 0; color: #076fe5; font-weight: 800; }
    .account-submit-btn.account-submit-signin { background: linear-gradient(180deg, #076fe5 0%, #0558b8 100%); }
    .account-submit-btn.account-submit-signup { background: linear-gradient(180deg, #0f84ff 0%, #076fe5 100%); color: #fff; }
    .account-submit-btn.has-jimu-loader .account-btn-label { opacity: 0; }
    @media (min-width: 769px) {
      nav { position: relative; z-index: 1; }
      #site-header.desktop-nav-hidden nav { transform: translateY(calc(-100% - 8px)); opacity: 1; }
    }
    @media (max-width: 768px) {
      .header-inner { height: 60px; padding: 0 16px; grid-template-columns: minmax(0, 1fr) auto; gap: 14px; }
      .logo { gap: 8px; }
      .logo-wordmark { font-size: 22px; }
      .logo-image { height: 22px; }
      .desktop-search-bar, .header-how-link { display: none !important; }
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

function getBottomNavActiveKey() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const mapView = params.get('view') === 'map';

  if (path.endsWith('/pages/messages.html')) return 'messages';
  if (path.endsWith('/pages/provider-profile.html') || path.endsWith('/pages/account.html')) return 'profile';
  if (path.endsWith('/pages/specialists.html')) return mapView ? 'map' : 'find';
  return 'home';
}

function renderBottomNav() {
  const account = getStoredAccount();
  if (!account?.loggedIn) return '';

  const base = getBasePath();
  const activeKey = getBottomNavActiveKey();
  const providerProfileHref = getProviderProfileHref(base);
  const items = [
    { key: 'home', href: `${base}index.html`, icon: 'fa-solid fa-house', label: 'Home' },
    { key: 'find', href: `${base}pages/specialists.html`, icon: 'fa-solid fa-magnifying-glass', label: 'Find' },
    { key: 'messages', href: `${base}pages/messages.html`, icon: 'fa-regular fa-message', label: 'Messages' },
    { key: 'map', href: `${base}pages/specialists.html?view=map`, icon: 'fa-solid fa-map-location-dot', label: 'Map' },
    { key: 'profile', href: providerProfileHref, icon: 'fa-regular fa-user', label: 'Profile' }
  ];

  return `
  <div class="shared-bottom-nav" role="navigation" aria-label="Primary">
    ${items.map((item) => `
      <a href="${item.href}" class="shared-bottom-nav-link ${item.key === activeKey ? 'is-active' : ''}">
        <i class="${item.icon}"></i>
        <span>${item.label}</span>
      </a>
    `).join('')}
  </div>`;
}

function syncBottomNav() {
  const existingBottomNav = document.querySelector('.shared-bottom-nav');
  const bottomNavMarkup = renderBottomNav();

  if (bottomNavMarkup) {
    if (existingBottomNav) {
      existingBottomNav.outerHTML = bottomNavMarkup;
    } else {
      document.body.insertAdjacentHTML('beforeend', bottomNavMarkup);
    }
    document.body.classList.add('has-shared-bottom-nav');
    return;
  }

  existingBottomNav?.remove();
  document.body.classList.remove('has-shared-bottom-nav');
}

document.addEventListener('DOMContentLoaded', () => {
  injectSharedHeaderOverrides();
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = renderHeader();
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = renderFooter();
  syncBottomNav();
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
  const dropdownLogoutBtn = headerEl.querySelector('.account-dropdown-logout');
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  const desktopQuery = window.matchMedia('(min-width: 769px)');
  let lastScrollY = window.scrollY;

  function setMobileMenuState(isOpen) {
    headerEl.classList.toggle('mobile-nav-open', isOpen);
    if (menuToggle) menuToggle.setAttribute('aria-expanded', String(isOpen));
    if (overlayEl) overlayEl.setAttribute('aria-hidden', String(!isOpen));
  }

  function syncMobileNav() {
    if (!mobileQuery.matches) {
      setMobileMenuState(false);
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
    if (!desktopQuery.matches) {
      headerEl.classList.remove('desktop-nav-hidden');
      return;
    }

    if (window.scrollY <= 12) {
      headerEl.classList.remove('desktop-nav-hidden');
    }
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
        if (mobileQuery.matches) {
          event.preventDefault();
          const willOpen = !accountMenuHost.classList.contains('is-open');
          accountMenuHost.classList.toggle('is-open', willOpen);
          return;
        }
        if (trigger.classList.contains('account-link')) return;
        event.preventDefault();
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

  if (dropdownLogoutBtn) {
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
  }

  window.addEventListener('resize', () => {
    syncMobileNav();
    syncDesktopNav();
  });

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = currentScrollY - lastScrollY;

    if (desktopQuery.matches) {
      if (currentScrollY <= 12 || delta < -6) {
        headerEl.classList.remove('desktop-nav-hidden');
      } else if (delta > 6) {
        headerEl.classList.add('desktop-nav-hidden');
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  syncMobileNav();
  syncDesktopNav();

  window.addEventListener('softgiggles-auth-changed', () => {
    syncBottomNav();
  });

  window.addEventListener('storage', (event) => {
    if (event.key === 'softgiggles_account') {
      syncBottomNav();
    }
  });
});
