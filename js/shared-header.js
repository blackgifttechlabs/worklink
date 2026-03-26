// shared-header.js - injected into all pages

function getBasePath() {
  // Determine relative path based on current page location
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../';
  return '';
}

function renderHeader() {
  const base = getBasePath();
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
        <a href="#" class="a-plus-btn">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" width="16" height="16"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
          A+ Account
        </a>
        <a href="#">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account
        </a>
        <a href="#">
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

function renderFooter() {
  const base = getBasePath();
  return `
  <footer>
    <div class="footer-inner">
      <div class="footer-col">
        <h4>Account</h4>
        <ul>
          <li><a href="#">My Profile</a></li>
          <li><a href="#">Wishlist</a></li>
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

document.addEventListener('DOMContentLoaded', () => {
  const headerEl = document.getElementById('site-header');
  if (headerEl) headerEl.innerHTML = renderHeader();
  const footerEl = document.getElementById('site-footer');
  if (footerEl) footerEl.innerHTML = renderFooter();

  if (!headerEl) return;

  const menuToggle = headerEl.querySelector('.mobile-menu-toggle');
  const closeToggle = headerEl.querySelector('.mobile-nav-close');
  const navEl = headerEl.querySelector('#site-nav');
  const overlayEl = headerEl.querySelector('.mobile-nav-overlay');
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

  document.addEventListener('click', (event) => {
    if (!mobileQuery.matches || !headerEl.classList.contains('mobile-nav-open')) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (navEl && navEl.contains(target)) return;
    if (menuToggle && menuToggle.contains(target)) return;
    setMobileMenuState(false);
  });

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
