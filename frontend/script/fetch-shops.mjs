import { mkdirSync, writeFileSync } from "node:fs";
const KEY = "5LDAeIHnV41bE7prpKiHFJ";
const NODES = {
  "427:662": "martabak",
  "427:675": "bakso-soto",
  "427:688": "bakery",
  "427:701": "chinese",
};
const token = process.env.FIGMA_TOKEN;
if (!token) { console.error("FIGMA_TOKEN belum di-set"); process.exit(1); }
mkdirSync("public/shops", { recursive: true });
const ids = Object.keys(NODES).join(",");
const res = await fetch(`https://api.figma.com/v1/images/${KEY}?ids=${encodeURIComponent(ids)}&format=png&scale=2`, { headers: { "X-Figma-Token": token } });
const { images } = await res.json();
for (const [id, name] of Object.entries(NODES)) {
  const r = await fetch(images[id]);
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(`public/shops/${name}.png`, buf);
  console.log(`${name}.png — ${buf.length} bytes`);
}
