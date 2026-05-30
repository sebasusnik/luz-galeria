# Cómo mandar a fabricar la PCB (LUZ-GALERIA v1.0)

Guía para pasar del diseño tscircuit a placas físicas. Es tu primera fabricación, así que
va paso a paso, con los chequeos que importan antes de gastar plata.

## 0. Antes de generar NADA — verificaciones físicas

Estas tres cosas, si están mal, te arruinan la tanda entera. Confirmá con el componente en mano:

1. **Pinout del ESP32-C3 Super Mini.** Hay clones con el orden de pines espejado. Comprobá
   con multímetro/silk real que el mapeo de `lib/Microcontroller.tsx` coincide (lado USB:
   `5V, GND, 3V3, IO4, IO3, IO2, IO1, IO0`; otro lado: `IO5..IO10, IO20, IO21`).
2. **Tira CCT = common-anode (3 hilos: V+, WW–, CW–).** Todo el driver es low-side y asume
   esto. Si tu tira fuera common-cathode, hay que rediseñar la etapa de potencia.
3. **Diodo SS54 (5A), no SS34 (3A).** La corriente de la tira (~1.3A + inrush del bulk)
   pasa por el diodo de protección. Dale algo de cobre alrededor (SMA disipa ~0.5W).

Medí también con calibre los módulos enchufables (MP1584, headers del ESP) y ajustá las
constantes en `lib/footprints.tsx` si hace falta — están todas nombradas para editar en una línea.

## 1. Generar los archivos de fabricación

Con las dependencias instaladas (`bun install`), desde la raíz del repo:

```bash
# Gerbers + Excellon drill (paquete estándar de fabricación)
npx tsci export index.circuit.tsx -f gerbers -o exports/gerbers

# BOM (lista de materiales)
npx tsci export index.circuit.tsx -f bom -o exports/bom.csv

# Pick & place (posición de componentes)
npx tsci export index.circuit.tsx -f pnp -o exports/pnp.csv

# STEP 3D (para diseñar la caja de madera alrededor del PCB)
npx tsci export index.circuit.tsx -f step -o exports/luz-galeria.step
```

> Si algún `-f` cambió de nombre en tu versión de `tsci`, corré `npx tsci export --help`.
> Los footprints KiCad (borneras, JST) se bajan de la nube al exportar: necesitás internet
> y que el host `kicad-mod-cache.tscircuit.com` esté accesible (en este sandbox está bloqueado,
> en tu máquina no).

## 2. Revisar ANTES de mandar (gratis, te ahorra replays)

- **Abrí los gerbers en un visor** antes de fabricar: [gerbview de KiCad] o el visor online de
  tu fábrica. Mirá que: el contorno cierre, el plano de GND llegue donde debe, el keep-out de
  la antena esté limpio, y los silks (24V/GND/V+/WW/CW, polaridad del diodo y el electrolítico)
  sean legibles.
- **DRC:** confirmá que `npx tsci build index.circuit.tsx` no tira errores de reglas.
- **Chequeo de footprints custom:** imprimí los gerbers 1:1 en papel y apoyá los componentes
  físicos encima (ESP, MP1584, encoder, borneras). Que los pines caigan en los huecos. Este
  truco te salva de un footprint mal medido.

## 3. Dónde fabricar

### Opción A — Local, Buenos Aires (PCB Ingeniería)
- Pro: sin importación, soporte en español, rápido para prototipos.
- Mandá: gerbers RS-274X (una capa por archivo) + Excellon drill, en un ZIP. Especificá:
  2 capas, FR4 1.6mm, cobre 1oz, HASL, máscara verde, silk blanco.
- Confirmá sus reglas mínimas (este diseño usa trace/clearance 0.2mm, hole 0.3mm, que son
  holgadas; entran sin problema).

### Opción B — JLCPCB (China)
- Pro: baratísimo (5 placas ~USD 2 + envío), calidad excelente.
- Contra: importación (demora + posible impuesto). Subís el ZIP de gerbers, te autodetecta capas.
- Si querés que te **monten los SMD** (resistores, caps, MOSFETs, diodo), subí también el
  **BOM** y el **pick&place**, y te llega medio armada (solo soldás los THT: borneras, encoder,
  headers). Para tu primera vez, muy recomendable que monten los SMD chiquitos.

## 4. Componentes a comprar (BOM resumido)

| Designador | Valor / parte | Footprint | Dónde (BA) |
|---|---|---|---|
| J_IN | Bornera tornillo 2 vías, paso 5mm | THT | Microelsi / Candymar |
| J_OUT | Bornera tornillo 3 vías, paso 5mm | THT | Microelsi / Candymar |
| J_RDR | JST-XH 5 pines vertical | THT | Microelsi / ML |
| ESP | ESP32-C3 Super Mini + headers hembra 2×8 | módulo | ML (ya lo tenés) |
| U_BUCK | MP1584EN + headers hembra | módulo | ML (ya lo tenés) |
| ENC | Encoder EC11 con switch | THT | Microelsi / Candymar |
| Q_WW, Q_CW | AO3400A (logic-level N-MOSFET) | SOT-23 | LCSC (fallback) |
| D1 | SS54 (Schottky 5A) | SMA | LCSC / Electrocomponentes |
| C_BULK | 220µF 35V electrolítico radial | THT | Microelsi |
| RG_* | 100Ω | 0805 | local / LCSC |
| RPD_*, RPU_* | 10k | 0805 | local / LCSC |
| R_LED | 1k | 0805 | local / LCSC |
| C_ESP, C_RDR | 100nF | 0805 | local / LCSC |
| C_A/B/SW | 10nF | 0805 | local / LCSC |
| LED_PWR | LED verde | 0805 | local / LCSC |

> Comprá los pasivos SMD con un poco de exceso (vienen en tiras de 50/100 y son centavos).
> Para 5 placas: multiplicá cantidades ×5 y sumá ~20% de repuesto en 0805.

## 5. Iteración recomendada

1. Fabricá **1 tanda chica** (5 placas).
2. Armá **una sola** y validá con el firmware (`firmware/luz-galeria.yaml`).
3. Si algo falla (footprint, pinout), corregís el código y volvés a generar gerbers.
4. Recién cuando una placa anda 100%, ya tenés las otras 4 de la misma tanda como respaldo.
