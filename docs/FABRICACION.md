# Cómo mandar a fabricar la PCB (LUZ-GALERIA v1.0)

Guía para pasar del diseño tscircuit a placas físicas. Es tu primera fabricación, así que
va paso a paso, con los chequeos que importan antes de gastar plata.

> **Versión through-hole (THT).** Los discretos son componentes con patas
> (resistencias axiales 1/4W, MOSFET TO-220, diodo 1N5822 axial, LED 3mm, caps
> cerámicos/electrolítico), todos conseguibles en cualquier casa de electrónica de
> Buenos Aires y mucho más fáciles de soldar que SMD. Los footprints THT propios
> están en `lib/footprints.tsx`.

## 0. Antes de generar NADA — verificaciones físicas

Estas cosas, si están mal, te arruinan la tanda entera. Confirmá con el componente en mano:

1. **Pinout del ESP32-C3 Super Mini.** Hay clones con el orden de pines espejado. Comprobá
   con multímetro/silk real que el mapeo de `lib/Microcontroller.tsx` coincide (lado USB:
   `5V, GND, 3V3, IO4, IO3, IO2, IO1, IO0`; otro lado: `IO5..IO10, IO20, IO21`).
2. **Tira CCT = common-anode (3 hilos: V+, WW–, CW–).** Todo el driver es low-side y asume
   esto. Si tu tira fuera common-cathode, hay que rediseñar la etapa de potencia.
3. **Pinout del MOSFET TO-220 (IRLZ44N).** Mirándolo de FRENTE (cara con el texto, patas
   hacia abajo), de izquierda a derecha es **G – D – S** (Gate, Drain, Source; la lengüeta
   metálica también es Drain). El footprint `To220Footprint` tiene los pads nombrados G/D/S
   en ese orden. Si comprás otro MOSFET, verificá su datasheet: NO todos los TO-220 son G-D-S.
4. **El IRLZ44N es logic-level** (satura con los 3.3V del ESP). Si conseguís otro, que sea
   logic-level (Vgs(th) ~1-2V): un IRF540/IRFZ44 común NO satura bien con 3.3V.
5. **Diodo 1N5822 (Schottky 3A axial).** La corriente de la tira (~1.3A + inrush del bulk)
   pasa por el diodo de protección; el 1N5822 (3A) tiene margen de sobra.

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
- Como el diseño es 100% through-hole, acá solo encargás la placa desnuda (el montaje
  automático de JLCPCB es para SMD). Soldás todo vos, que es justamente lo que buscabas.

## 4. Componentes a comprar (BOM resumido)

| Designador | Valor / parte | Footprint | Dónde (BA) |
|---|---|---|---|
| J_IN | Bornera tornillo 2 vías, paso 5mm | THT | Microelsi / Candymar |
| J_OUT | Bornera tornillo 3 vías, paso 5mm | THT | Microelsi / Candymar |
| J_RDR | JST-XH 5 pines vertical | THT | Microelsi / ML |
| ESP | ESP32-C3 Super Mini + headers hembra 2×8 | módulo | ML (ya lo tenés) |
| U_BUCK | MP1584EN + headers hembra | módulo | ML (ya lo tenés) |
| ENC | Encoder EC11 con switch | THT | Microelsi / Candymar |
| Q_WW, Q_CW | IRLZ44N (logic-level N-MOSFET) | TO-220 | Microelsi / Candymar |
| D1 | 1N5822 (Schottky 3A axial) | DO-201 | Microelsi / Candymar |
| C_BULK | 220µF 35V electrolítico radial | THT | Microelsi |
| RG_* | 100Ω 1/4W | axial | local |
| RPD_*, RPU_* | 10k 1/4W | axial | local |
| R_LED | 1k 1/4W | axial | local |
| C_ESP, C_RDR | 100nF cerámico | THT | local |
| C_A/B/SW | 10nF cerámico | THT | local |
| LED_PWR | LED verde 3mm | THT | local |

> Cantidades para 5 placas: resistencias 100Ω ×10, 10k ×25, 1k ×5; caps 100nF ×10,
> 10nF ×15; electrolítico 220µF ×5; MOSFET ×10; diodo ×5; LED ×5. Sumá ~20% de repuesto.
> Todo se consigue local — no necesitás esperar nada de China.

## 5. Soldado (todo through-hole)

Al ser THT, es de las cosas más simples para soldar. Herramientas: soldador con punta
(idealmente con control de temperatura ~320°C), estaño 60/40 0.8mm, pinza, alicate de corte
para las patas, malta desoldadora por si te equivocás, y multímetro.

**Orden (de más bajo a más alto, para que la placa apoye plana):**
1. Resistencias axiales (acostadas) y diodo 1N5822 (¡respetá la banda = cátodo, va al lado
   marcado en el silk!).
2. Capacitores cerámicos (100nF, 10nF — no tienen polaridad).
3. LED (pata larga = ánodo; el lado plano/silk marca el cátodo) + zócalos/headers hembra.
4. MOSFETs TO-220 (parados; **G-D-S según el silk**) y cap electrolítico 220µF
   (**la pata larga = +, la banda del cuerpo = −**; respetá el `+` del silk).
5. Borneras de tornillo, JST, encoder EC11 (este se sostiene solo con sus patas de montaje).

**Calibrá el MP1584 a 5,0V ANTES de enchufarlo.** Alimentalo suelto con 24V, girá el
potenciómetro multivuelta y medí la salida. Si lo enchufás sin calibrar y quedó alto, freís el ESP.

**Antes de dar tensión:** con el multímetro en continuidad, verificá que 24V↔GND y 5V↔GND
NO estén en corto. Recién ahí enchufás los módulos, alimentás y flasheás el firmware.

## 6. Iteración recomendada

1. Fabricá **1 tanda chica** (5 placas).
2. Armá **una sola** y validá con el firmware (`firmware/luz-galeria.yaml`).
3. Si algo falla (footprint, pinout), corregís el código y volvés a generar gerbers.
4. Recién cuando una placa anda 100%, ya tenés las otras 4 de la misma tanda como respaldo.
