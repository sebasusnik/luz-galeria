// LUZ-GALERIA v0 — hole-exact stripboard layout + electrical verifier.
// Strips run horizontally (rows), along the 145mm length. I place every pin at an
// exact (col,row); the script AUTO-generates strip cuts (so no row segment mixes
// two nets) and jumpers (to fully connect each net), then VERIFIES no shorts/opens
// against the validated netlist, and renders dist/stripboard.svg.
import { writeFileSync } from "node:fs"

const COLS = 36, ROWS = 19, PX = 24, M = 110, MT = 50
const W = M * 2 + COLS * PX, H = MT + 70 + ROWS * PX
const X = (c) => M + (c - 0.5) * PX
const Y = (r) => MT + (r - 0.5) * PX

// Dedicated rail strips (whole rows, never cut): net + color.
const RAIL = { 1: "V24", 2: "V5", 3: "V3V3", 18: "GND", 19: "GND" }
const NETCOLOR = {
  GND: "#444", V24: "#d22", V5: "#e80", V3V3: "#ca0", V24RAW: "#a11",
  PWM_WW: "#08c", GATE_WW: "#0a6", WW: "#06c",
  PWM_CW: "#84c", GATE_CW: "#0a6", CW: "#a3c",
  ENC_A: "#2a8", ENC_B: "#2a8", ENC_SW: "#2a8",
  RDR_TX: "#c60", RDR_RX: "#c60", RDR_OUT: "#c60", LED: "#888",
}

// pin := [comp, pinName, col, row, net]. net null/NC* = no connection.
// OPTIMIZED v2: ESP flipped (signal column on the left, next to the radar JST),
// pull-ups hug the +3V3 rail, decoupling caps sit on the ESP 5V/GND strips, and
// MOSFET/gate/output share rows — this kills most long diagonal jumpers.
const pins = [
  // --- ESP32-C3 FLIPPED: left col4 = IO5..IO21 (signal), right col10 = pwr+IO0..IO4 ---
  ["ESP", "IO5", 4, 5, "ENC_B"], ["ESP", "IO6", 4, 6, "ENC_SW"], ["ESP", "IO7", 4, 7, "RDR_OUT"],
  ["ESP", "IO8", 4, 8, "NC4"], ["ESP", "IO9", 4, 9, "NC5"], ["ESP", "IO10", 4, 10, "PWM_WW"],
  ["ESP", "IO20", 4, 11, "RDR_TX"], ["ESP", "IO21", 4, 12, "RDR_RX"],
  ["ESP", "5V", 10, 5, "V5"], ["ESP", "GND", 10, 6, "GND"], ["ESP", "3V3", 10, 7, "V3V3"],
  ["ESP", "IO4", 10, 8, "ENC_A"], ["ESP", "IO3", 10, 9, "PWM_CW"],
  ["ESP", "IO2", 10, 10, "NC1"], ["ESP", "IO1", 10, 11, "NC2"], ["ESP", "IO0", 10, 12, "NC3"],

  // --- Radar JST: LEFT edge (col1), opening out (left); near ESP radar pins ---
  ["J_RDR", "VCC", 1, 5, "V5"], ["J_RDR", "GND", 1, 6, "GND"], ["J_RDR", "TX", 1, 7, "RDR_TX"],
  ["J_RDR", "RX", 1, 8, "RDR_RX"], ["J_RDR", "OUT", 1, 9, "RDR_OUT"],

  // --- decoupling caps ride the ESP 5V/GND strips (no jumper) ---
  ["C_ESP", "p", 13, 5, "V5"], ["C_ESP", "n", 13, 6, "GND"],
  ["C_RDR", "p", 2, 5, "V5"], ["C_RDR", "n", 2, 6, "GND"],

  // --- Encoder EC11 (off-grid approx; bend leads) ---
  ["ENC", "A", 3, 14, "ENC_A"], ["ENC", "C", 3, 15, "GND"], ["ENC", "B", 3, 16, "ENC_B"],
  ["ENC", "S2", 9, 14, "GND"], ["ENC", "S1", 9, 16, "ENC_SW"],
  ["ENC", "MP1", 6, 13, "GND"], ["ENC", "MP2", 6, 17, "GND"],

  // --- Pull-ups hug +3V3 rail (row3); cap GND pins on the row17 GND feeder ---
  ["RPU_B", "p1", 6, 5, "ENC_B"], ["RPU_B", "p2", 6, 3, "V3V3"],
  ["RPU_SW", "p1", 7, 6, "ENC_SW"], ["RPU_SW", "p2", 7, 3, "V3V3"],
  ["RPU_A", "p1", 13, 8, "ENC_A"], ["RPU_A", "p2", 13, 3, "V3V3"],
  ["C_A", "p", 12, 14, "ENC_A"], ["C_A", "n", 12, 17, "GND"],
  ["C_B", "p", 14, 16, "ENC_B"], ["C_B", "n", 14, 17, "GND"],
  ["C_SW", "p", 11, 16, "ENC_SW"], ["C_SW", "n", 11, 17, "GND"],

  // --- Power IN: J_IN (right edge, opening right) + D1 + bulk cap ---
  ["J_IN", "Vplus", 34, 5, "V24RAW"], ["J_IN", "GND", 34, 6, "GND"],
  ["D1", "an", 32, 5, "V24RAW"], ["D1", "cat", 32, 9, "V24"],
  ["C_BULK", "p", 30, 9, "V24"], ["C_BULK", "n", 30, 11, "GND"],

  // --- MP1584 (IN col20 / OUT col26) ---
  ["U_BUCK", "INp", 20, 9, "V24"], ["U_BUCK", "INn", 20, 10, "GND"],
  ["U_BUCK", "OUTp", 26, 9, "V5"], ["U_BUCK", "OUTn", 26, 10, "GND"],

  // --- Power-on LED (off the V5 OUT strip) ---
  ["R_LED", "p1", 28, 9, "V5"], ["R_LED", "p2", 28, 12, "LED"],
  ["LED", "an", 30, 12, "LED"], ["LED", "cat", 30, 14, "GND"],

  // --- MOSFET drivers (TO-220) + gate R's, rows aligned ---
  ["RG_WW", "p1", 16, 10, "PWM_WW"], ["RG_WW", "p2", 17, 12, "GATE_WW"],
  ["Q_WW", "G", 18, 12, "GATE_WW"], ["Q_WW", "D", 18, 13, "WW"], ["Q_WW", "S", 18, 14, "GND"],
  ["RPD_WW", "p1", 19, 12, "GATE_WW"], ["RPD_WW", "p2", 19, 14, "GND"],
  ["RG_CW", "p1", 23, 9, "PWM_CW"], ["RG_CW", "p2", 23, 12, "GATE_CW"],
  ["Q_CW", "G", 24, 12, "GATE_CW"], ["Q_CW", "D", 24, 13, "CW"], ["Q_CW", "S", 24, 14, "GND"],
  ["RPD_CW", "p1", 25, 12, "GATE_CW"], ["RPD_CW", "p2", 25, 14, "GND"],

  // --- Strip output: J_OUT (right edge, opening right) ---
  ["J_OUT", "Vplus", 34, 12, "V24"], ["J_OUT", "WW", 34, 13, "WW"], ["J_OUT", "CW", 34, 14, "CW"],
]

// ---------- build model ----------
const key = (c, r) => `${c},${r}`
const holeNet = new Map() // "c,r" -> net (for occupied holes)
const collisions = []
for (const [comp, pn, c, r, net] of pins) {
  const k = key(c, r)
  if (holeNet.has(k)) collisions.push(`${comp}.${pn} colisiona en ${k}`)
  holeNet.set(k, net)
}

// union-find
const parent = {}
const find = (x) => (parent[x] === undefined ? (parent[x] = x) : parent[x] === x ? x : (parent[x] = find(parent[x])))
const uni = (a, b) => { parent[find(a)] = find(b) }

const cuts = new Set() // "row:colLeft" = cut between colLeft and colLeft+1

// AUTO-CUT: on each row, between adjacent occupied holes of different nets, cut.
for (let r = 1; r <= ROWS; r++) {
  if (RAIL[r]) continue // rails never cut
  const occ = []
  for (let c = 1; c <= COLS; c++) if (holeNet.has(key(c, r))) occ.push([c, holeNet.get(key(c, r))])
  for (let i = 0; i + 1 < occ.length; i++) {
    const [c1, n1] = occ[i], [c2, n2] = occ[i + 1]
    if (n1 !== n2) cuts.add(`${r}:${Math.floor((c1 + c2) / 2)}`)
  }
}

// strips: union adjacent holes on a row unless a cut sits between them
for (let r = 1; r <= ROWS; r++)
  for (let c = 1; c < COLS; c++)
    if (!cuts.has(`${r}:${c}`)) uni(key(c, r), key(c + 1, r))

// AUTO-JUMPER: connect every net's terminals (+ its rail row) with min jumpers.
const railRowOf = (net) => Object.keys(RAIL).find((row) => RAIL[row] === net)
const nets = {}
for (const [comp, pn, c, r, net] of pins) {
  if (!net || net.startsWith("NC")) continue
  ;(nets[net] ??= []).push([c, r])
}
const jumpers = []
for (const [net, members] of Object.entries(nets)) {
  const terms = members.map(([c, r]) => ({ c, r }))
  const rr = railRowOf(net)
  if (rr) terms.push({ c: members[0][0], r: +rr, rail: true })
  // connect distinct nodes
  let reps = () => [...new Set(terms.map((t) => find(key(t.c, t.r))))]
  // tie each member to the rail (if rail net) for clarity; else chain
  if (rr) {
    for (const [c, r] of members) {
      if (find(key(c, r)) !== find(key(c, +rr))) {
        jumpers.push([c, r, c, +rr, net]); uni(key(c, r), key(c, +rr))
      }
    }
  } else {
    const ms = members
    for (let i = 1; i < ms.length; i++) {
      if (find(key(ms[0][0], ms[0][1])) !== find(key(ms[i][0], ms[i][1]))) {
        jumpers.push([ms[i][0], ms[i][1], ms[0][0], ms[0][1], net]); uni(key(ms[0][0], ms[0][1]), key(ms[i][0], ms[i][1]))
      }
    }
  }
}
// tie the two GND rails together
jumpers.push([2, 18, 2, 19, "GND"]); uni(key(2, 18), key(2, 19))

// ---------- VERIFY ----------
const nodeNets = {} // node root -> Set(nets)
for (const [comp, pn, c, r, net] of pins) {
  if (!net || net.startsWith("NC")) continue
  const root = find(key(c, r))
  ;(nodeNets[root] ??= new Set()).add(net)
}
// rails contribute their net
for (const row of Object.keys(RAIL)) (nodeNets[find(key(1, +row))] ??= new Set()).add(RAIL[row])

const shorts = Object.entries(nodeNets).filter(([, s]) => s.size > 1).map(([, s]) => [...s].join("+"))
const opens = []
for (const [net, members] of Object.entries(nets)) {
  const roots = new Set(members.map(([c, r]) => find(key(c, r))))
  const rr = railRowOf(net)
  if (rr) roots.add(find(key(1, +rr)))
  if (roots.size > 1) opens.push(`${net} (${roots.size} pedazos)`)
}
console.log(collisions.length ? "COLISIONES: " + collisions.join("; ") : "sin colisiones")
console.log(shorts.length ? "CORTOS: " + shorts.join(", ") : "0 cortos")
console.log(opens.length ? "OPENS: " + opens.join(", ") : "0 opens")
console.log(`${Object.keys(nets).length} nets, ${jumpers.length} jumpers, ${cuts.size} cortes`)

// ---------- RENDER ----------
let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="monospace"><rect width="${W}" height="${H}" fill="#fbfbf8"/>`
s += `<text x="${W / 2}" y="26" font-size="16" text-anchor="middle" font-weight="bold">LUZ-GALERIA v0 - stripboard hole-exacto (${COLS}x${ROWS} = ${(COLS * 2.54).toFixed(0)}x${(ROWS * 2.54).toFixed(0)}mm)</text>`
for (const row of Object.keys(RAIL)) {
  const col = NETCOLOR[RAIL[row]]
  s += `<rect x="${X(1) - PX / 2}" y="${Y(+row) - PX / 2}" width="${COLS * PX}" height="${PX}" fill="${col}" opacity="0.16"/>`
  s += `<text x="${M - 8}" y="${Y(+row) + 4}" font-size="12" text-anchor="end" fill="${col}" font-weight="bold">${RAIL[row]}</text>`
}
for (let r = 1; r <= ROWS; r++) {
  s += `<line x1="${X(1)}" y1="${Y(r)}" x2="${X(COLS)}" y2="${Y(r)}" stroke="#e0e0e0"/>`
  for (let c = 1; c <= COLS; c++) s += `<circle cx="${X(c)}" cy="${Y(r)}" r="1.8" fill="#c3c3c3"/>`
}
for (const ct of cuts) {
  const [r, c] = ct.split(":").map(Number)
  const cx = (X(c) + X(c + 1)) / 2, cy = Y(r)
  s += `<line x1="${cx - 4}" y1="${cy - 4}" x2="${cx + 4}" y2="${cy + 4}" stroke="#e00" stroke-width="2.2"/><line x1="${cx - 4}" y1="${cy + 4}" x2="${cx + 4}" y2="${cy - 4}" stroke="#e00" stroke-width="2.2"/>`
}
for (const [c1, r1, c2, r2, net] of jumpers) {
  s += `<line x1="${X(c1)}" y1="${Y(r1)}" x2="${X(c2)}" y2="${Y(r2)}" stroke="${NETCOLOR[net] || "#999"}" stroke-width="2" opacity="0.85"/>`
  s += `<circle cx="${X(c1)}" cy="${Y(r1)}" r="2.6" fill="${NETCOLOR[net] || "#999"}"/><circle cx="${X(c2)}" cy="${Y(r2)}" r="2.6" fill="${NETCOLOR[net] || "#999"}"/>`
}
for (const [comp, pn, c, r, net] of pins) {
  const col = net && !net.startsWith("NC") ? NETCOLOR[net] || "#333" : "#bbb"
  s += `<circle cx="${X(c)}" cy="${Y(r)}" r="4" fill="none" stroke="${col}" stroke-width="2"/>`
  s += `<text x="${X(c)}" y="${Y(r) - 6}" font-size="6.5" text-anchor="middle" fill="#333">${comp}.${pn}</text>`
}
for (let c = 1; c <= COLS; c += 5) s += `<text x="${X(c)}" y="${MT - 8}" font-size="9" text-anchor="middle" fill="#999">${c}</text>`
s += `<text x="${M}" y="${MT + ROWS * PX + 28}" font-size="11" fill="#333"><tspan fill="#e00">X</tspan>=cortar tira  |  lineas de color=jumpers (por net)  |  circulos=pines de componentes  |  rieles=tiras dedicadas</text>`
s += `<text x="${M}" y="${MT + ROWS * PX + 46}" font-size="10" fill="#777">J_RDR borde izq (cable afuera) · J_IN/J_OUT borde der (tornillos afuera) · ESP USB hacia arriba · EC11 doblar patas a la grilla</text>`
s += `</svg>`
writeFileSync("dist/stripboard.svg", s)
console.log("wrote dist/stripboard.svg", W, "x", H)
