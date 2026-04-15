const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Create a mock account in localStorage
  await page.addInitScript(() => {
    localStorage.setItem('softgiggles_account', JSON.stringify({
      loggedIn: true,
      uid: 'mock-user-123',
      name: 'John Doe',
      email: 'john@example.com'
    }));
  });

  const filePath = 'file://' + path.resolve('pages/job-giver-profile.html');

  // Desktop view
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(filePath);
  await page.waitForTimeout(2000); // Wait for scripts to render
  await page.screenshot({ path: 'job-giver-profile-desktop.png', fullPage: true });
  console.log('Desktop screenshot saved.');

  // Mobile view
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(filePath);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'job-giver-profile-mobile.png', fullPage: true });
  console.log('Mobile screenshot saved.');

  await browser.close();
})();
