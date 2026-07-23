import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForSelector('.beranda-hero');

  const heroElement = await page.$('.beranda-hero');
  await heroElement.screenshot({ path: 'hero-screenshot.png' });

  console.log('Screenshot saved as hero-screenshot.png');
  await browser.close();
})();
