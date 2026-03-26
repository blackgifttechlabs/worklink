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

function renderHeader() {
  const base = getBasePath();
  const account = getStoredAccount();
  const isLoggedIn = Boolean(account && account.loggedIn);
  const accountName = account && account.name ? account.name : 'Black Gift';
  const accountEmail = account && account.email ? account.email : 'blackgifttechlabs@gmail.com';
  return `
  <header>
    <div class="header-inner">
      <div class="mobile-header-left">
        <button class="mobile-menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M4 7h16M4 12h16M4 17h16"/>
          </svg>
        </button>
        <a href="${base}index.html" class="logo" aria-label="SoftGiggles home"><span class="logo-soft">SOFT</span><span class="logo-giggles">GIGGLES</span></a>
      </div>
      <div class="search-bar">
        <span class="search-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input type="text" placeholder="Search for products and brands" />
      </div>
      <div class="header-actions">
        <div class="account-menu-host ${isLoggedIn ? 'is-logged-in' : 'is-logged-out'}">
          <a href="${isLoggedIn ? `${base}pages/account.html` : '#'}" class="a-plus-btn account-trigger" data-account-trigger="a-plus">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
            A+ Account
          </a>
          <a href="${isLoggedIn ? `${base}pages/account.html` : '#'}" class="account-trigger account-link" data-account-trigger="account">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${isLoggedIn ? accountName.split(' ')[0] : 'Account'}
          </a>
          ${isLoggedIn ? `
            <div class="account-dropdown" aria-hidden="true">
              <div class="account-dropdown-greeting">Hi, ${accountName}</div>
              <a href="${base}pages/account.html" class="account-dropdown-item">
                <i class="fa-regular fa-user"></i>
                <span>Profile</span>
              </a>
              <a href="#" class="account-dropdown-item">
                <i class="fa-solid fa-cube"></i>
                <span>Order History</span>
              </a>
              <a href="#" class="account-dropdown-item">
                <i class="fa-solid fa-rectangle-list"></i>
                <span>A+ Account</span>
              </a>
              <a href="#" class="account-dropdown-item">
                <i class="fa-regular fa-book-open"></i>
                <span>Address Book</span>
              </a>
              <a href="#" class="account-dropdown-item">
                <i class="fa-solid fa-tag"></i>
                <span>Lay-by’s</span>
              </a>
              <a href="#" class="account-dropdown-item">
                <i class="fa-solid fa-ellipsis"></i>
                <span>More</span>
              </a>
              <button type="button" class="account-dropdown-logout">Log Out</button>
            </div>
          ` : ''}
        </div>
        <a href="${base}pages/wishlist.html">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          Wishlist
        </a>
        <a href="#" class="cart-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <span class="cart-badge">0</span>
          Cart
        </a>
      </div>
    </div>
  </header>
  <div class="mobile-search-row">
    <div class="search-bar mobile-search-bar">
      <span class="search-icon" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </span>
      <input type="text" placeholder="Search for products and brands" />
    </div>
  </div>
  <div class="mobile-nav-overlay" aria-hidden="true"></div>
  <nav id="site-nav">
    <button class="mobile-nav-close" type="button" aria-label="Close menu">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4">
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    </button>
    <div class="nav-inner">
      <div class="nav-item">
        <a href="${base}pages/toddler-boys.html" class="nav-link">Boys</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle Boys menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Baby Boy Categories</h4>
              <ul>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-baby"></i><span>Onesies and Bodysuits</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-moon"></i><span>Sleepers and Footies</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-shirt"></i><span>Rompers and Coveralls</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-icons"></i><span>Graphic Tees and Polos</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-person-walking"></i><span>Cargo Pants and Joggers</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-box-archive"></i><span>Shorts and Overalls</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>&nbsp;</h4>
              <ul>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-people-group"></i><span>Sets and Tracksuits</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-shirt"></i><span>Cardigans and Hoodies</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-cloud-bolt"></i><span>Bunting Suits and Jackets</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-socks"></i><span>Socks and Booties</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-hat-cowboy"></i><span>Beanies and Baseball Caps</span></a></li>
                <li><a href="${base}pages/toddler-boys.html"><i class="fa-solid fa-user-tie"></i><span>Bow Ties and Braces</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="${base}pages/toddler-girls.html" class="nav-link">Girls</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle Girls menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Baby Girl Categories</h4>
              <ul>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-baby"></i><span>Onesies and Bodysuits</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-moon"></i><span>Sleepers and Footies</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-shirt"></i><span>Rompers and Sunsuits</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-child-dress"></i><span>Dresses and Skirts</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-child-dress"></i><span>Leggings and Ruffle Pants</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-box-archive"></i><span>Bloomers and Diaper Covers</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>&nbsp;</h4>
              <ul>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-ribbon"></i><span>Tunics and Blouses</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-shirt"></i><span>Sweaters and Cardigans</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-snowflake"></i><span>Coats and Pram Suits</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-socks"></i><span>Socks and Tights</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-gem"></i><span>Headbands and Soft Bows</span></a></li>
                <li><a href="${base}pages/toddler-girls.html"><i class="fa-solid fa-hat-cowboy-side"></i><span>Sun Hats and Bonnets</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">School</a>
        <button class="mobile-submenu-toggle" type="button" aria-expanded="false" aria-label="Toggle School menu">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="mega-dropdown">
          <div class="mega-dropdown-inner">
            <div class="mega-col">
              <h4>Boys</h4>
              <ul>
                <li><a href="#"><i class="fa-solid fa-user-graduate"></i><span>Grey or Navy Trousers</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Shorts</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Button-Down Shirts (Short and Long Sleeve)</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Polo Shirts</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>V-Neck Sweaters and Cardigans</span></a></li>
                <li><a href="#"><i class="fa-solid fa-user-tie"></i><span>School Blazers</span></a></li>
                <li><a href="#"><i class="fa-solid fa-ribbon"></i><span>Ties</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shoe-prints"></i><span>Black or Brown Leather Shoes</span></a></li>
                <li><a href="#"><i class="fa-solid fa-person-running"></i><span>Athletic Trainers</span></a></li>
                <li><a href="#"><i class="fa-solid fa-dumbbell"></i><span>PE Shorts and Tracksuits</span></a></li>
                <li><a href="#"><i class="fa-solid fa-socks"></i><span>Crew Socks</span></a></li>
                <li><a href="#"><i class="fa-solid fa-belt"></i><span>Belts</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Girls</h4>
              <ul>
                <li><a href="#"><i class="fa-solid fa-child-dress"></i><span>Pleated Skirts and Culottes</span></a></li>
                <li><a href="#"><i class="fa-solid fa-child-dress"></i><span>Pinafores and Dresses</span></a></li>
                <li><a href="#"><i class="fa-solid fa-person-dress"></i><span>Trousers and Slacks</span></a></li>
                <li><a href="#"><i class="fa-solid fa-sun"></i><span>Gingham or Checkered Summer Dresses</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Blouses and Peter Pan Collar Shirts</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Polo Shirts</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shirt"></i><span>Cardigans and Sweaters</span></a></li>
                <li><a href="#"><i class="fa-solid fa-user-tie"></i><span>School Blazers</span></a></li>
                <li><a href="#"><i class="fa-solid fa-shoe-prints"></i><span>Black or Navy Flats (Mary Janes)</span></a></li>
                <li><a href="#"><i class="fa-solid fa-person-running"></i><span>Athletic Trainers</span></a></li>
                <li><a href="#"><i class="fa-solid fa-dumbbell"></i><span>PE Skorts and Leggings</span></a></li>
                <li><a href="#"><i class="fa-solid fa-socks"></i><span>Tights and Knee-High Socks</span></a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>General Supplies (Unisex)</h4>
              <ul>
                <li><a href="#"><i class="fa-solid fa-backpack"></i><span>Backpacks and Satchels</span></a></li>
                <li><a href="#"><i class="fa-solid fa-box"></i><span>Insulated Lunch Boxes</span></a></li>
                <li><a href="#"><i class="fa-solid fa-bottle-water"></i><span>Water Bottles</span></a></li>
                <li><a href="#"><i class="fa-solid fa-pencil"></i><span>Pencil Cases</span></a></li>
                <li><a href="#"><i class="fa-solid fa-book"></i><span>Notebooks and Exercise Books</span></a></li>
                <li><a href="#"><i class="fa-solid fa-pen-ruler"></i><span>Stationery Sets (Pens, Pencils, Erasers)</span></a></li>
                <li><a href="#"><i class="fa-solid fa-palette"></i><span>Art Smocks or Aprons</span></a></li>
                <li><a href="#"><i class="fa-solid fa-bag-shopping"></i><span>Library Bags</span></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link">Toys</a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link sale">Sale</a>
      </div>
      <div class="nav-item">
        <a href="#" class="nav-link promo">Promotions</a>
      </div>
    </div>
  </nav>`;
}

function renderAccountPanel() {
  const base = getBasePath();
  const account = getStoredAccount();
  const accountEmail = account && account.email ? account.email : 'blackgifttechlabs@gmail.com';
  return `
  <div class="account-auth-overlay" id="account-auth-overlay" hidden>
    <aside class="account-auth-panel" aria-modal="true" role="dialog" aria-labelledby="account-auth-title">
      <button type="button" class="account-auth-close" aria-label="Close account panel">×</button>
      <h2 id="account-auth-title">Log In/Register</h2>
      <div class="account-auth-hero">
        <img src="${base}images/mobilegirls.jpg" alt="SoftGiggles sign in" />
      </div>
      <div class="account-auth-copy">
        <h3 class="account-auth-heading">Welcome</h3>
        <p class="account-auth-subtext">Create an account or sign in to continue.</p>
      </div>
      <div class="account-auth-methods">
        <section class="account-auth-method-card account-method-google">
          <div class="account-method-label">Fast sign in</div>
          <button type="button" class="account-auth-btn account-google-btn">
            <span class="google-mark" aria-hidden="true"><span class="google-g">G</span></span>
            <span>Continue with Google</span>
          </button>
        </section>
        <section class="account-auth-method-card account-method-phone">
          <div class="account-method-label">Phone verification</div>
          <button type="button" class="account-auth-btn account-phone-toggle">
            <i class="fa-solid fa-mobile-screen-button"></i>
            <span>Use phone number</span>
          </button>
          <div class="account-phone-form-wrap">
            <form class="account-phone-form" id="account-phone-form">
              <button type="button" class="account-change-method">Change login method</button>
              <div class="account-form-row">
                <label for="account-phone">Phone number</label>
                <input id="account-phone" name="phone" type="tel" placeholder="+263 77 123 4567" />
              </div>
              <button type="button" class="account-submit-btn account-phone-submit" id="account-phone-submit">Send verification code</button>
              <div class="account-form-row account-code-row" hidden>
                <label for="account-phone-code">Verification code</label>
                <input id="account-phone-code" name="code" type="text" inputmode="numeric" placeholder="123456" />
              </div>
              <button type="button" class="account-submit-btn account-phone-verify" hidden>Verify code</button>
              <p class="account-auth-hint">Firebase will send an SMS code after the reCAPTCHA check.</p>
              <div id="account-recaptcha-container"></div>
            </form>
          </div>
        </section>
        <div class="account-method-divider"><span>or use email</span></div>
        <section class="account-auth-method-card account-method-email">
          <div class="account-method-label">Email and password</div>
          <button type="button" class="account-auth-btn account-email-toggle">
            <i class="fa-regular fa-envelope"></i>
            <span>Use Email</span>
          </button>
          <div class="account-email-form-wrap">
            <form class="account-email-form" id="account-email-form">
              <button type="button" class="account-change-method">Change login method</button>
              <div class="account-form-row account-name-row" hidden>
                <label for="account-name">Full name</label>
                <input id="account-name" name="name" type="text" placeholder="Black Gift" />
              </div>
              <div class="account-form-row">
                <label for="account-email">Email address</label>
                <input id="account-email" name="email" type="email" placeholder="hello@softgiggles.com" required />
              </div>
              <div class="account-form-row">
                <label for="account-password">Password</label>
                <input id="account-password" name="password" type="password" placeholder="Enter password" required />
              </div>
              <button type="submit" class="account-submit-btn">Sign In</button>
            </form>
          </div>
        </section>
      </div>
      <p class="account-auth-switch-copy">
        <span class="account-switch-label">New here?</span>
        <button type="button" class="account-mode-switch">Sign up</button>
      </p>
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
        <h4>Account</h4>
        <ul>
          <li><a href="${base}pages/account.html">My Profile</a></li>
          <li><a href="${base}pages/wishlist.html">Wishlist</a></li>
          <li><a href="#">Order History</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Things We Offer</h4>
        <ul>
          <li><a href="#">Warm baby essentials</a></li>
          <li><a href="#">School-ready outfits</a></li>
          <li><a href="#">Shoes and accessories</a></li>
          <li><a href="#">Toys and gifting picks</a></li>
          <li><a href="#">Seasonal sale deals</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Customer Services</h4>
        <ul>
          <li><a href="#">Delivery Details</a></li>
          <li><a href="#">Store Locator</a></li>
          <li><a href="#">Need Help?</a></li>
          <li><a href="#">Contact Us</a></li>
          <li><a href="#">Bulk Orders</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>About SoftGiggles</h4>
        <ul>
          <li><a href="#">About Us</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Community</a></li>
          <li><a href="#">Sitemap</a></li>
        </ul>
      </div>
      <div class="newsletter-col">
        <h4>Stay in the Loop</h4>
        <p>Join us today and get 10% off your first order.</p>
        <div class="email-form">
          <input type="email" placeholder="Enter email address" />
          <button>→</button>
        </div>
        <p style="font-size:12px;color:#666;margin-top:10px;">By subscribing you agree to our <a href="#" style="color:var(--green);">Privacy Policy</a>.</p>
      </div>
    </div>
    <div class="payment-logos" style="max-width:1400px;margin:0 auto;padding:20px 0;display:flex;gap:12px;flex-wrap:wrap;align-items:center;border-top:1px solid #333;">
      <span class="payment-logo"><img src="${base}images/logo/Ecocash-Logo.png" alt="EcoCash" /></span>
      <span class="payment-logo"><img src="${base}images/logo/Mastercard-Zimswitch.jpg" alt="Mastercard Zimswitch" /></span>
      <span class="payment-logo"><img src="${base}images/logo/logo-black.png" alt="Payment logo" /></span>
    </div>
    <div class="footer-bottom">
      <div class="footer-links">
        <a href="#">Terms &amp; Conditions</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Cookie Policy</a>
        <a href="#">Access to Information</a>
      </div>
      <div class="social-area">
        <div class="social-links">
          <a href="#" title="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="#" title="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="#" title="LinkedIn"><i class="fa-brands fa-linkedin-in"></i></a>
          <a href="#" title="YouTube"><i class="fa-brands fa-youtube"></i></a>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderCookieBanner() {
  return `
  <div class="cookie-banner" id="cookie-banner" hidden>
    <p>
      We use cookies to improve your online experience. If you continue to use our site, you are agreeing to our
      <a href="#" class="cookie-link">Cookie Policy</a>.
    </p>
    <div class="cookie-actions">
      <button type="button" class="cookie-btn cookie-accept">OK</button>
      <button type="button" class="cookie-btn cookie-decline">Decline</button>
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = renderHeader();
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = renderFooter();
  if (!document.getElementById('cookie-banner')) {
    document.body.insertAdjacentHTML('beforeend', renderCookieBanner());
  }
  if (!document.getElementById('account-auth-overlay')) {
    document.body.insertAdjacentHTML('beforeend', renderAccountPanel());
  }
  if (!document.getElementById('firebase-auth-script')) {
    const moduleScript = document.createElement('script');
    moduleScript.type = 'module';
    moduleScript.id = 'firebase-auth-script';
    moduleScript.src = `${getBasePath()}js/firebase-auth.js`;
    document.body.appendChild(moduleScript);
  }

  if (!headerEl) return;

  const menuToggle = headerEl.querySelector('.mobile-menu-toggle');
  const closeToggle = headerEl.querySelector('.mobile-nav-close');
  const navEl = headerEl.querySelector('#site-nav');
  const overlayEl = headerEl.querySelector('.mobile-nav-overlay');
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
    dropdownLogoutBtn.addEventListener('click', () => {
      if (window.softGigglesAuth && typeof window.softGigglesAuth.signOut === 'function') {
        window.softGigglesAuth.signOut();
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
});
