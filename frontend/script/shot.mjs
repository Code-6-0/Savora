import { chromium } from "playwright";

// pakai: node scripts/shot.mjs "<selector>" <output.jpg> [url]
const [,, selector = "body", out = "shot.jpg",
  url = "http://localhost:3000"] = process.argv;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.locator(selector).first()
  .screenshot({ path: out, type: "jpeg", quality: 70 });
await browser.close();
console.log("saved:", out);