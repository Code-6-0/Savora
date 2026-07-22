import { mkdir, writeFile } from "node:fs/promises"

const TOKEN = process.env.FIGMA_TOKEN
if (!TOKEN) throw new Error("Set FIGMA_TOKEN dulu")

const FILE_KEY = "5LDAeIHnV41bE7prpKiHFJ"
// urutan sesuai daftar node yang kamu kirim
const NODES = {
  "393:217": "bakery",
  "393:223": "resto",
  "393:229": "umkm",
  "393:235": "dessert",
  "393:241": "cafe",
  "393:247": "snacks",
  "393:253": "vegan",
  "393:259": "fruits",
  "393:265": "drinks",
}

const ids = Object.keys(NODES).join(",")
const res = await fetch(
  `https://api.figma.com/v1/images/${FILE_KEY}?ids=${ids}&format=jpg&scale=2`,
  { headers: { "X-Figma-Token": TOKEN } }
)
const data = await res.json()
if (data.err) throw new Error(`Figma API error: ${data.err}`)

await mkdir("public/categories", { recursive: true })
for (const [id, name] of Object.entries(NODES)) {
  const url = data.images[id]
  if (!url) { console.warn(`SKIP ${name} (${id}): tidak ada render`); continue }
  const img = await fetch(url)
  const buf = Buffer.from(await img.arrayBuffer())
  await writeFile(`public/categories/${name}.jpg`, buf)
  console.log(`${name}.jpg — ${buf.length} bytes`)
}