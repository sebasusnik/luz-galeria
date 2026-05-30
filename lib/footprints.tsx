// Custom through-hole footprints for the plug-in modules. These are the female-
// header hole patterns the modules seat into. Dimensions are the most common
// reference values for the cloned modules; VERIFY WITH CALIPERS before gerbers.
// Each dimension is a named constant so calibration is a one-line edit.

const HEADER_HOLE = 1.0 // hole Ø for 2.54mm female header pins
const HEADER_PAD = 1.7 // annular pad Ø

// ---- ESP32-C3 Super Mini: 2 rows of 8, 2.54mm pitch, rows 15.24mm (0.6") apart.
export const ESP32_ROW_PITCH = 15.24
export const ESP32_PIN_PITCH = 2.54
const ESP32_PINS_PER_ROW = 8

export const Esp32SuperMiniFootprint = () => {
  const colX = ESP32_ROW_PITCH / 2
  const y0 = ((ESP32_PINS_PER_ROW - 1) * ESP32_PIN_PITCH) / 2
  const holes = []
  for (let i = 0; i < ESP32_PINS_PER_ROW; i++) {
    const y = y0 - i * ESP32_PIN_PITCH
    // left column = pins 1..8 (top to bottom)
    holes.push(
      <platedhole
        portHints={[`pin${i + 1}`]}
        pcbX={-colX}
        pcbY={y}
        shape="circle"
        holeDiameter={HEADER_HOLE}
        outerDiameter={HEADER_PAD}
      />,
    )
    // right column = pins 9..16 (top to bottom)
    holes.push(
      <platedhole
        portHints={[`pin${i + 9}`]}
        pcbX={colX}
        pcbY={y}
        shape="circle"
        holeDiameter={HEADER_HOLE}
        outerDiameter={HEADER_PAD}
      />,
    )
  }
  return (
    <footprint>
      {holes}
      <silkscreentext text="USB" fontSize={1} pcbX={0} pcbY={-y0 - 2} />
      <silkscreentext text="ANT" fontSize={1} pcbX={0} pcbY={y0 + 2} />
      <silkscreenrect width={ESP32_ROW_PITCH + 3} height={y0 * 2 + 2} pcbX={0} pcbY={0} />
    </footprint>
  )
}

// ---- MP1584 buck module: a 2-pin header on each of two opposite sides.
export const MP1584_SPAN = 16 // distance between the IN-pair and OUT-pair
export const MP1584_PAIR_PITCH = 2.54 // pitch within each 2-pin header

export const Mp1584Footprint = () => {
  const x = MP1584_SPAN / 2
  const y = MP1584_PAIR_PITCH / 2
  const mk = (pin: number, px: number, py: number) => (
    <platedhole
      portHints={[`pin${pin}`]}
      pcbX={px}
      pcbY={py}
      shape="circle"
      holeDiameter={HEADER_HOLE}
      outerDiameter={HEADER_PAD}
    />
  )
  return (
    <footprint>
      {mk(1, -x, y)}
      {mk(2, -x, -y)}
      {mk(3, x, y)}
      {mk(4, x, -y)}
      <silkscreentext text="IN" fontSize={0.9} pcbX={-x} pcbY={y + 1.6} />
      <silkscreentext text="OUT" fontSize={0.9} pcbX={x} pcbY={y + 1.6} />
      <silkscreenrect width={22} height={17} pcbX={0} pcbY={0} />
    </footprint>
  )
}

// ---- Alps EC11E rotary encoder w/ switch (vertical THT).
// tscircuit 0.0.1787 fails to resolve the KiCad footprint
// (kicad:Rotary_Encoder/RotaryEncoder_Alps_EC11E-Switch_Vertical_H20mm): it loads
// with ZERO pads, so every encoder trace silently dropped and the part was left
// unconnected. This is the same geometry transcribed from the official KiCad
// library (Y flipped to tscircuit's Y-up): signal pads C/A/B/S1/S2 + two 2.5mm
// mounting posts. Ports are named, so EncoderInput wires .A/.B/.C/.S1/.S2 directly.
const EC11_SIG_HOLE = 1.0
const EC11_SIG_PAD = 1.8
const EC11_MOUNT_HOLE = 2.5
const EC11_MOUNT_PAD = 3.2

export const Ec11Footprint = () => {
  const sig = (name: string, x: number, y: number) => (
    <platedhole
      portHints={[name]}
      pcbX={x}
      pcbY={y}
      shape="circle"
      holeDiameter={EC11_SIG_HOLE}
      outerDiameter={EC11_SIG_PAD}
    />
  )
  const mount = (name: string, x: number) => (
    <platedhole
      portHints={[name]}
      pcbX={x}
      pcbY={0}
      shape="circle"
      holeDiameter={EC11_MOUNT_HOLE}
      outerDiameter={EC11_MOUNT_PAD}
    />
  )
  return (
    <footprint>
      {sig("C", 0, 0)}
      {sig("A", -2.5, 2.5)}
      {sig("B", 2.5, 2.5)}
      {sig("S1", 7, -2.5)}
      {sig("S2", -7, -2.5)}
      {mount("MP1", -5.2)}
      {mount("MP2", 5.2)}
      <silkscreenrect width={12} height={12} pcbX={0} pcbY={0} />
    </footprint>
  )
}

// ---- Bulk electrolytic capacitor, radial THT, ~8mm can, 3.5mm lead pitch.
export const BULK_CAP_LEAD_PITCH = 3.5

export const BulkCapFootprint = () => {
  const x = BULK_CAP_LEAD_PITCH / 2
  return (
    <footprint>
      <platedhole
        portHints={["pin1", "pos"]}
        pcbX={-x}
        pcbY={0}
        shape="circle"
        holeDiameter={0.9}
        outerDiameter={1.7}
      />
      <platedhole
        portHints={["pin2", "neg"]}
        pcbX={x}
        pcbY={0}
        shape="circle"
        holeDiameter={0.9}
        outerDiameter={1.7}
      />
      <silkscreentext text="+" fontSize={1.2} pcbX={-x - 1.6} pcbY={0} />
      <silkscreencircle radius={4} pcbX={0} pcbY={0} />
    </footprint>
  )
}

// ---- IRLZ44N (logic-level N-MOSFET, TO-220), vertical THT.
// CRITICAL pinout: facing the labelled front, legs down, left-to-right is
// pin1=Gate, pin2=Drain, pin3=Source (the metal tab is also Drain). This is
// DIFFERENT from the SOT-23 AO3400 (G/S/D) the SMD version used, so MosfetDriver
// rewires accordingly. Pads named G/D/S so the wiring is unambiguous.
const TO220_PITCH = 2.54
const TO220_HOLE = 1.1
const TO220_PAD = 2.0

export const To220Footprint = () => {
  const leg = (name: string, n: number) => (
    <platedhole
      portHints={[name, `pin${n}`]}
      pcbX={(n - 2) * TO220_PITCH}
      pcbY={0}
      shape="circle"
      holeDiameter={TO220_HOLE}
      outerDiameter={TO220_PAD}
    />
  )
  return (
    <footprint>
      {leg("G", 1)}
      {leg("D", 2)}
      {leg("S", 3)}
      {/* body + tab outline (tab points +Y) */}
      <silkscreenrect width={10.2} height={4.6} pcbX={0} pcbY={4.5} />
      <silkscreentext text="G" fontSize={0.9} pcbX={-TO220_PITCH} pcbY={-1.8} />
      <silkscreentext text="D" fontSize={0.9} pcbX={0} pcbY={-1.8} />
      <silkscreentext text="S" fontSize={0.9} pcbX={TO220_PITCH} pcbY={-1.8} />
    </footprint>
  )
}

// ---- 1N5822 Schottky (3A, DO-201AD axial), horizontal THT. Cathode = banded end.
const DIODE_LEAD_PITCH = 10.16
const DIODE_HOLE = 1.0
const DIODE_PAD = 1.9

export const AxialDiodeFootprint = () => {
  const x = DIODE_LEAD_PITCH / 2
  return (
    <footprint>
      <platedhole
        portHints={["anode", "pin1", "pos"]}
        pcbX={-x}
        pcbY={0}
        shape="circle"
        holeDiameter={DIODE_HOLE}
        outerDiameter={DIODE_PAD}
      />
      <platedhole
        portHints={["cathode", "pin2", "neg"]}
        pcbX={x}
        pcbY={0}
        shape="circle"
        holeDiameter={DIODE_HOLE}
        outerDiameter={DIODE_PAD}
      />
      <silkscreenrect width={6} height={2.6} pcbX={0} pcbY={0} />
      {/* cathode band near +x lead */}
      <silkscreenline x1={2} y1={-1.3} x2={2} y2={1.3} strokeWidth={0.2} />
    </footprint>
  )
}

// ---- Axial resistor, 1/4W, ~7.62mm lead pitch (standard bend).
const RES_LEAD_PITCH = 7.62
const RES_HOLE = 0.8
const RES_PAD = 1.7

export const AxialResistorFootprint = () => {
  const x = RES_LEAD_PITCH / 2
  return (
    <footprint>
      <platedhole portHints={["pin1", "left", "anode", "pos"]} pcbX={-x} pcbY={0} shape="circle" holeDiameter={RES_HOLE} outerDiameter={RES_PAD} />
      <platedhole portHints={["pin2", "right", "cathode", "neg"]} pcbX={x} pcbY={0} shape="circle" holeDiameter={RES_HOLE} outerDiameter={RES_PAD} />
      <silkscreenrect width={4.5} height={2} pcbX={0} pcbY={0} />
    </footprint>
  )
}

// ---- Ceramic disc / film capacitor, THT, 5.08mm lead pitch (non-polarized).
const CER_LEAD_PITCH = 5.08
const CER_HOLE = 0.8
const CER_PAD = 1.7

export const CeramicCapFootprint = () => {
  const x = CER_LEAD_PITCH / 2
  return (
    <footprint>
      <platedhole portHints={["pin1", "left", "anode", "pos"]} pcbX={-x} pcbY={0} shape="circle" holeDiameter={CER_HOLE} outerDiameter={CER_PAD} />
      <platedhole portHints={["pin2", "right", "cathode", "neg"]} pcbX={x} pcbY={0} shape="circle" holeDiameter={CER_HOLE} outerDiameter={CER_PAD} />
    </footprint>
  )
}

// ---- 3mm / 5mm LED, THT. Square pad = anode (pin1), round = cathode (pin2).
const LED_LEAD_PITCH = 2.54
const LED_HOLE = 0.8
const LED_PAD = 1.7

export const ThtLedFootprint = () => {
  const x = LED_LEAD_PITCH / 2
  return (
    <footprint>
      <platedhole portHints={["anode", "pin1", "pos", "left"]} pcbX={-x} pcbY={0} shape="circle" holeDiameter={LED_HOLE} outerDiameter={LED_PAD} />
      <platedhole portHints={["cathode", "pin2", "neg", "right"]} pcbX={x} pcbY={0} shape="circle" holeDiameter={LED_HOLE} outerDiameter={LED_PAD} />
      <silkscreencircle radius={2.5} pcbX={0} pcbY={0} />
      {/* flat side marks cathode (+x) */}
      <silkscreenline x1={1.8} y1={-1.8} x2={1.8} y2={1.8} strokeWidth={0.2} />
    </footprint>
  )
}
