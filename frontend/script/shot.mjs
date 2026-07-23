import { chromium } from "playwright";

// pakai: node scripts/shot.mjs "<selector>" <output.jpg> [url] [waitSelector]
const [,, selector = "body", out = "shot.jpg",
  url = "http://localhost:3000", waitSelector] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "domcontentloaded" });

// Tunggu konten muncul jika waitSelector disediakan
if (waitSelector) {
  await page.locator(waitSelector).first()
    .waitFor({ state: "visible", timeout: 30000 });
}

await page.locator(selector).first()
  .screenshot({ path: out, type: "jpeg", quality: 70 });
await browser.close();
console.log("saved:", out);