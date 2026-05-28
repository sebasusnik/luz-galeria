# Proyecto: PCB para controlador de tira LED CCT con radar de presencia

## Contexto

Diseño de PCB para una luminaria controlada que va a iluminar una galería/laundry en mi casa. El sistema combina:

- Detección automática de presencia con radar mmWave (HLK-LD2410C)
- Control manual con encoder rotativo (giro → brillo, pulsar+girar → temperatura de color, click → toggle)
- Tira LED CCT (warm white + cool white) de 24V, ~16W/m, hasta 1.5m
- Integración con Home Assistant vía WiFi (firmware ESPHome)

El PCB va dentro de una caja de madera artesanal del tamaño aproximado de una pitillera. La posición de los componentes en el PCB es crítica porque la caja se va a diseñar alrededor del PCB usando el STEP file que exportes.

## Stack de firmware (referencia, no parte del PCB)

ESPHome con componentes `ld2410`, `rotary_encoder`, output `ledc` para PWM dual, light `cwww`. No tenés que escribir firmware, solo asegurar que los pines del ESP32-C3 elegidos sean compatibles.

## Componentes ya comprados (módulos físicos)

Estos son los componentes que ya tengo en mano. **No los reemplaces por equivalentes** — el diseño tiene que adaptarse a estos footprints exactos.

### 1. ESP32-C3 Super Mini

- Módulo clon genérico, footprint estándar de la comunidad
- 2 filas de 8 pines macho, pitch 2.54mm, separación entre filas ~15.24mm (confirmá el pinout/dimensions buscando "ESP32-C3 Super Mini" en el registry o documentación oficial)
- USB-C en uno de los bordes cortos
- Antena PCB en el borde opuesto al USB-C
- Lo voy a montar en **headers hembra 2.54mm** sobre el PCB principal para poder removerlo
- **Restricción de orientación**: el USB-C debe quedar accesible desde un borde del PCB principal para poder reflashear sin desarmar la caja

### 2. Módulo MP1584EN buck converter

- Módulo de ~22×17mm con 4 pads/pines: IN+, IN-, OUT+, OUT-
- Pote multivuelta de ajuste (lo calibro yo a 5V antes de montar)
- Lo monto en **headers hembra 2.54mm de 2 pines x 2** (un par por cada lado del módulo) para poder removerlo
- Función: 24V → 5V para alimentar todo lo de baja tensión

### 3. HLK-LD2410C radar mmWave

- **NO va montado sobre el PCB principal**
- Se conecta vía cable corto a un **conector JST-XH de 5 pines** en el PCB principal
- Razón: la antena del LD2410C (los dos parches dorados) tiene que mirar al ambiente sin obstrucciones, así que lo ubico en una cara distinta de la caja
- Pinout estándar del módulo: VCC (5V), GND, TX, RX, OUT

### 4. Encoder rotativo con pulsador (EC11 standard)

- Through-hole, 5 pines (A, B, C/GND común para A-B, SW, SW-GND)
- Cuerpo ~13×13mm, eje 6mm de diámetro, longitud del eje ~15mm sobre el cuerpo
- Trae tuerca + arandela para fijar la rosca a una cara externa
- **Se monta DIRECTAMENTE en el PCB principal** (through-hole)
- **Restricción de posición**: el cuerpo del encoder debe estar pegado a un borde del PCB con el eje saliendo perpendicular al plano del PCB hacia ese borde. La rosca del encoder atraviesa la cara frontal de la caja y se fija con su tuerca.

### 5. Fuente switching 24V 2A (externa)

- Fuente de pared con conector plug 2.1mm
- **No va dentro de la caja**, alimenta el PCB vía cable hasta una bornera
- Entrada al PCB: bornera de tornillo 2 vías paso 5mm

## Componentes electrónicos a comprar (los que vos diseñes en el PCB)

Estos son los que voy a comprar una vez que el diseño esté cerrado. Recomendá specs concretos.

- Bornera entrada 24V: tornillo 2 vías paso 5mm
- Bornera salida tira: tornillo 3 vías paso 5mm (V+, WW, CW)
- Conector JST-XH 5 pines (para el LD2410C)
- Headers hembra 2.54mm (para ESP32-C3 Super Mini y MP1584)
- MOSFETs SMD logic-level (sugerencia: 2x AO3400A SOT-23, 5.7A, Vgs(th) ~1V)
- Resistores SMD 0805
- Capacitores SMD 0805 + electrolítico through-hole de bulk
- Diodo Schottky de protección de polaridad inversa (sugerencia: SS34 SMA o equivalente)
- LED indicador de power on (opcional pero útil): LED 0805 + resistor limitador

## Lógica de conexionado

```
ESP32-C3 → función
─────────────────────────────────────
GPIO2    → PWM warm white (gate MOSFET 1)
GPIO3    → PWM cool white (gate MOSFET 2)
GPIO4    → Encoder pin A (interrupt, pull-up externo 10k)
GPIO5    → Encoder pin B (pull-up externo 10k)
GPIO6    → Encoder switch (pull-up externo 10k)
GPIO20   → UART RX (recibe desde TX del LD2410C)
GPIO21   → UART TX (envía hacia RX del LD2410C)
GPIO7    → LD2410C OUT (presencia, digital input)
5V       → VIN del módulo (alimentado por MP1584)
GND      → GND común
```

Si detectás conflictos con strapping pins del ESP32-C3 (GPIO2, GPIO8, GPIO9 son sensibles en boot), sugerí pinout alternativo antes de avanzar.

### Driver de tira CCT

Los dos MOSFETs hacen **low-side switching**:

- Source de cada MOSFET → GND
- Drain del MOSFET 1 → bornera WW
- Drain del MOSFET 2 → bornera CW
- Gate de cada MOSFET → GPIO PWM correspondiente del ESP32, con:
  - Resistor de gate en serie (100Ω) para limitar ringing
  - Resistor pull-down gate-a-GND (10k) para asegurar OFF durante reset del ESP32
- V+ de la bornera de salida → 24V directo desde la entrada (NO pasa por MOSFETs)

### Protecciones y desacoples

- Diodo Schottky de protección de polaridad inversa en la entrada de 24V (antes del módulo MP1584)
- Capacitor electrolítico de bulk en la entrada de 24V (recomendá valor; típicamente 100-470µF, 35V o más)
- Capacitor 100nF de desacople cerca del VCC del ESP32-C3
- Capacitor 100nF de desacople cerca del VCC del conector del LD2410C
- LED indicador de power on con resistor de ~1k a 5V (opcional pero recomendado)

## Especificaciones del PCB

### Dimensiones

- **Máximo 70×50mm**, idealmente más chico
- Forma rectangular
- Espesor estándar 1.6mm FR4

### Capas

- **2 layers** (top + bottom)
- Cobre 1oz (35µm) ambas capas
- HASL como acabado (compatible con PCB Ingeniería en Buenos Aires, donde voy a fabricar)
- Solder mask verde, silkscreen blanco

### Estrategia de capas

**TOP:**
- Todos los componentes (montaje exclusivamente en top)
- Pistas de señal y potencia
- Pistas anchas para potencia

**BOTTOM:**
- **GND plane continuo** cubriendo toda la placa
- Pistas de señal solo cuando sea estrictamente necesario para cruzar
- Stitching vías de GND distribuidas

### Vías

- Tamaño estándar: pad 0.6mm / hole 0.3mm (compatible con PCB Ingeniería)
- Vías de GND abundantes en pads de componentes que tocan tierra
- Stitching vías de GND a lo largo del perímetro y en zonas de routing denso

### Anchos de pista

- Señales digitales (PWM, UART, encoder, OUT del radar): 0.25mm (10 mil)
- 5V: 0.5mm (20 mil)
- 24V de entrada y salidas WW/CW: 1mm (40 mil) — para 2A continuos con margen
- GND en top (cuando exista): mínimo 0.5mm

### DRC

- Trace width mínimo: 0.2mm (8 mil)
- Clearance mínimo: 0.2mm (8 mil)
- Hole mínimo: 0.3mm
- Annular ring mínimo: 0.15mm

### Posición de componentes (crítico para la caja)

- **Encoder en el borde izquierdo del PCB**, eje saliendo perpendicular hacia ese borde
- **Bornera de entrada 24V y bornera de salida a tira en el borde derecho**, juntas para que los cables salgan por un único lado
- **Conector JST del LD2410C en el borde inferior** (o lateral si conviene al routing), para que el cable hacia el radar salga limpio
- **USB-C del ESP32-C3 Super Mini accesible desde un borde** (típicamente el borde donde está orientado el ESP32)
- **Agujeros de montaje M3 en las 4 esquinas** del PCB:
  - Diámetro de agujero 3.2mm (para tornillo M3 con holgura)
  - Margen 3mm desde el centro al borde del PCB
  - Keep-out de cobre de 4mm de radio alrededor de cada agujero

### Separación lógica de zonas

- **Zona de potencia** (entrada 24V, capacitor bulk, diodo, MP1584, MOSFETs, salida a tira): concentrada en un borde
- **Zona de señal/digital** (ESP32-C3, conectores de encoder y radar): concentrada en el borde opuesto
- GND plane es común a ambas zonas (sin split)
- Ninguna pista de potencia debe pasar por debajo de la antena PCB del ESP32-C3 Super Mini
- **Keep-out de cobre en ambas capas** alrededor de la antena del módulo (rectángulo de ~10×5mm fuera del borde del módulo, en la zona donde sobresale la antena)

### Silkscreen (importante)

- Etiquetas claras en borneras: `24V`, `GND`, `V+`, `WW`, `CW`
- Polaridad del capacitor electrolítico y del diodo
- Orientación de los MOSFETs (marca de pin 1)
- Pinout del conector JST del LD2410C
- Nombre y versión del proyecto en un borde: `LUZ-GALERIA v1.0`
- Mi handle (lo defino después, dejá un placeholder `@maker` por ahora)

## Lo que necesito que hagas

1. **Inicializá el proyecto tscircuit** con la estructura recomendada. Si el comando exacto cambió, consultá la documentación oficial en `https://docs.tscircuit.com` antes de improvisar.
2. **Buscá los footprints** en el registry de tscircuit (`tsci search` o equivalente):
   - Footprint del ESP32-C3 Super Mini (verificá pitch entre filas y posición del USB-C)
   - Footprint del módulo MP1584 (verificá dimensiones y pads de conexión)
   - Encoder EC11 5 pines through-hole
   - JST-XH 5 pines through-hole
   - Borneras tornillo 2 y 3 vías paso 5mm
   - AO3400 SOT-23
   - Pasivos SMD 0805
   - Diodo SS34 (SMA)
3. **Escribí el código tscircuit** estructurado en componentes funcionales:
   - `<PowerInput>` — bornera + diodo + capacitor bulk
   - `<BuckRegulator>` — slot para módulo MP1584 con headers
   - `<Microcontroller>` — slot para ESP32-C3 Super Mini con headers + caps de desacople
   - `<MosfetDriver>` — los dos canales con sus resistores
   - `<OutputTerminal>` — bornera de 3 vías a la tira
   - `<EncoderInput>` — encoder + pull-ups + caps de debounce
   - `<RadarConnector>` — JST + cap de desacople
   - Un `<App>` o board top-level que los compone
4. **Configurá las design rules** según las specs de arriba
5. **Generá outputs**:
   - Render 3D del PCB
   - Render 2D top y bottom
   - DRC report sin errores
6. **Listame las decisiones que tomaste** donde había ambigüedad antes de generar gerbers finales

## Iteración esperada

No generes gerbers ni STEP en la primera pasada. El flujo es:

1. Vos generás layout inicial → me lo mostrás (3D + 2D)
2. Yo te pido ajustes ("movele el encoder 5mm a la izquierda", "rotá el JST 90°", etc.)
3. Iteramos hasta que el layout me cierre
4. Recién ahí generamos gerbers + STEP + BOM final

## Entregables finales (cuando confirmemos el layout)

1. **Gerbers** en formato RS-274X, una capa por archivo:
   - Top copper, bottom copper
   - Top mask, bottom mask
   - Top silkscreen, bottom silkscreen
   - Board outline
2. **Drill file** Excellon (.drl)
3. **STEP file 3D** del PCB con todos los componentes montados (para diseñar la caja de madera)
4. **PDF visual** del PCB ensamblado (top y bottom) para revisar antes de mandar a fabricar
5. **BOM** con:
   - Designator
   - Valor / part number
   - Footprint
   - Cantidad por placa
   - Cantidad total para 5 placas
   - Sugerencia de dónde comprar localmente en Buenos Aires (Microelsi, Candymar, Electrocomponentes, Mercado Libre); si algo no se consigue, sugerí LCSC como fallback

## Preferencias técnicas

- TypeScript estricto
- Componentes funcionales tipo React
- Sin comentarios obvios; comentar solo donde aporte
- Si una decisión depende de algo que no aclaré, preguntá en vez de asumir
- Documentación inline del esquemático en el código (qué hace cada sección)

## Stack relevante para vos (por si te ayuda)

Soy product engineer, vivo en TypeScript + React diariamente (Winclap, side projects con tRPC/SST). Cero experiencia previa en EDA, pero entiendo bien hardware a nivel conceptual. Sentite libre de explicarme cualquier decisión de PCB que tomes, no como tutorial sino como "elegí X porque Y".

## Repo

Trabajá en el directorio actual. Creá la estructura de carpetas que necesites. Inicializá git si no está iniciado.

---

Arrancá. Primero leé la doc de tscircuit si no la tenés fresca, después preguntame cualquier duda crítica de specs antes de empezar a codear.
