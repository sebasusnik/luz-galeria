# LUZ-GALERIA v0 — layout en stripboard con VeroRoute (Windows)

Cómo pasar del diseño en tscircuit a un layout de **stripboard (Veroboard)** usando
**VeroRoute** (autorouter con chequeo de cortos/opens). Pensado para hacerlo desde Windows.

> **Contexto:** la v0 es un banco de pruebas full-DIY (todo THT) para validar firmware
> ESPHome + comportamiento (radar, encoder, dimming, buck) antes de fabricar la PCB SMD
> (v1, la que va en la caja). El netlist ya está validado en tscircuit.

## Qué hay en el repo

- `exports/luz-galeria.kicad_sch` — esquemático KiCad (para intentar importar).
- `exports/luz-galeria.netlist.txt` — **netlist legible y completo** (18 nets, cada pin). Fuente de verdad para cargar a mano.
- `exports/stripboard.svg` — plano de stripboard alternativo (generado por `scripts/stripboard_layout.mjs`, **verificado sin cortos/opens**), por si VeroRoute no convence.
- `scripts/stripboard_layout.mjs` — generador + verificador del plano (Node).
- `lib/` + `index.circuit.tsx` — el diseño tscircuit (fuente del netlist).

Regenerar los exports (si tocás el diseño):
```bash
npm i      # o bun install
npx tsci export index.circuit.tsx -f kicad_sch -o exports/luz-galeria.kicad_sch
npx tsci export index.circuit.tsx -f readable-netlist -o exports/luz-galeria.netlist.txt
node scripts/stripboard_layout.mjs   # regenera exports/stripboard.svg + verifica
```

## Paso A — Instalar VeroRoute (Windows)

1. Descargá VeroRoute de SourceForge: https://sourceforge.net/projects/veroroute/ (hay binario Windows listo).
2. (Opcional, recomendado para el path "pro") instalá **KiCad** 8+: https://www.kicad.org/download/windows/

## Paso B — Meter el netlist en VeroRoute

VeroRoute necesita la conectividad. Tres caminos, de más simple a más confiable:

1. **Import directo:** en VeroRoute, File → Import, probá con `exports/luz-galeria.kicad_sch`.
   *Puede no enganchar:* tscircuit genera el esquemático con símbolos de riel custom y formato KiCad 9; VeroRoute a veces quiere un netlist `.net` clásico.
2. **Carga manual (más seguro):** abrí `exports/luz-galeria.netlist.txt` y cargá los 18 nets a mano en VeroRoute. Son pocos y están clarísimos (`NET: nombre` → lista de pines). ~15 min.
3. **Path "pro":** abrí `exports/luz-galeria.kicad_sch` en KiCad (eeschema) → exportá un netlist `.net` → importá ese `.net` en VeroRoute (formato que sí entiende seguro).

## Paso C — Definir componentes / footprints

VeroRoute trae pasivos y semis estándar, pero los **módulos enchufables hay que armarlos** como partes custom (van sobre **headers hembra 2.54mm**):

| Componente | Footprint en la placa | Notas |
|---|---|---|
| **ESP32-C3 Super Mini** | 2×8 header, paso **2.54mm**, filas a **15.24mm (0.6")** | montaje vertical; USB hacia un borde |
| **MP1584** | 2×2 header (un par por lado), paso 2.54mm, **~16mm** entre pares | calibrar con calibre |
| **EC11 encoder** | 5 pines THT (A,C,B un lado; S1,S2 otro) + patas de montaje | **off-grid**: doblar patas a la grilla |
| **JST-XH 5p** | 1×5, paso 2.5mm | radar, off-board por cable |
| **Bornera 2/3 vías** | paso 5.0mm | entrada 24V / salida tira |
| **MOSFET** | **IRLB8721** TO-220 (G-D-S) | logic-level; pivote IRLZ44N |
| **Diodo** | **1N5822** (Schottky 3A THT) | protección polaridad inversa |
| Resistencias | axial 1/4W | 100Ω×2, 10k×5, 1k×1 |
| Caps | electrolítico 220µF/35V; cerámicos 100nF×2, 10nF×3 | |

## Paso D — Autoroute + verificar + exportar

1. Fijá board type = **Veroboard**, tamaño (la v0 entra holgada en ~65×100mm; tu placa es 65×145mm, podés recortar).
2. Corré el **autorouter**. VeroRoute maneja los **cortes de tira** solo y avisa de **cortos/opens**.
3. Revisá, ajustá a mano lo que quieras, **exportá/imprimí 1:1** para usar de guía al soldar.

## Pinout / orientación (importante)

GPIO (firmware ESPHome): **WW=GPIO10, CW=GPIO3, EncA=GPIO4, EncB=GPIO5, EncSW=GPIO6,
RadarOUT=GPIO7, UART RX=GPIO20, TX=GPIO21** (WW se movió de GPIO2 por strapping).

Conectores mirando **hacia afuera**: bornera 24V-in y salida a tira a un borde (bocas de
tornillo hacia afuera); JST del radar a otro borde (cable afuera, el módulo apunta al
ambiente); USB-C del ESP accesible desde un borde.

**Pull-ups del encoder a 3V3, NO a 5V** (los GPIO del C3 son 3.3V). MOSFET en low-side:
source→GND, drain→bornera WW/CW, gate←GPIO vía 100Ω + pulldown 10k. V+ de salida = 24V
post-diodo (toda la placa protegida).

## Si VeroRoute no convence

`exports/stripboard.svg` (o regenerar con `node scripts/stripboard_layout.mjs`) es un plano
ya verificado (0 cortos / 0 opens) sobre stripboard 36×19, listo para soldar siguiendo los
✕ (cortes) y las líneas de color (jumpers por net).
