import { mkdir, writeFile } from "node:fs/promises"

const TOKEN = process.env.FIGMA_TOKEN
if (!TOKEN) throw new Error("Set FIGMA_TOKEN dulu")

const FILE_KEY = "5LDAeIHnV41bE7prpKiHFJ"

// ⚠️ PLACEHOLDER NODE IDs — PERLU DIGANTI!
// Node "Satara" dan "Asha" tidak ditemukan di metadata frame BERANDA (393:158).
// Cek desain Figma dan update node-id di bawah ini dengan node-id yang benar.
const NODES = {
  "398:1411": "satara",           // Update dengan node-id banner Satara yang sebenarnya
  "398:1412": "asha-clean",       // Update dengan node-id banner Asha yang sebenarnya
}

const ids = Object.keys(NODES).join(",")
const apiUrl =
  "https://" + "api.figma.com" + "/v1/images/" + FILE_KEY +
  "?ids=" + ids + "&format=png&scale=2"

const res = await fetch(apiUrl, { headers: { "X-Figma-Token": TOKEN } })
const data = await res.json()
if (data.err) throw new Error("Figma API error: " + data.err)

await mkdir("public/ads", { recursive: true })
for (const [id, name] of Object.entries(NODES)) {
  const url = data.images[id]
  if (!url) {
    console.warn("SKIP " + name + " (" + id + "): tidak ada render — cek node-id di script")
    continue
  }
  const img = await fetch(url)
  const buf = Buffer.from(await img.arrayBuffer())
  await writeFile("public/ads/" + name + ".png", buf)
  console.log(name + ".png — " + buf.length + " bytes")
}
