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
