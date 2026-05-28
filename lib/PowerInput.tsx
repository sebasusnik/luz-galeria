import { boxModel, cylinderModel } from "./cad/boxes"
import { BulkCapFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

const TERMINAL_2P = "kicad:TerminalBlock/TerminalBlock_MaiXu_MX126-5.0-02P_1x02_P5.00mm"

// 24V entry: screw terminal -> reverse-polarity Schottky (SS54) -> bulk cap.
// The Schottky sits in the full 24V rail, so everything downstream (buck, strip
// V+, MOSFET drains) is protected. net.V24 is the protected rail.
export const PowerInput = (props: Props) => (
  <group {...props}>
    <chip
      name="J_IN"
      footprint={TERMINAL_2P}
      pcbX={0}
      pcbY={0}
      pinLabels={{ pin1: "V24", pin2: "GND" }}
      cadModel={boxModel(11, 8.5, 10, { color: [0.05, 0.35, 0.12], offsetY: 3 })}
    />
    <diode
      name="D1"
      footprint="sma"
      pcbX={-7}
      pcbY={3}
      pcbRotation={180}
    />
    <capacitor
      name="C_BULK"
      capacitance="220uF"
      maxVoltageRating="35V"
      polarized
      footprint={<BulkCapFootprint />}
      pcbX={-7}
      pcbY={-3.5}
      cadModel={cylinderModel(4, 12, { color: [0.15, 0.15, 0.2] })}
    />

    <silkscreentext text="24V" fontSize={0.9} pcbX={-2.5} pcbY={-3.2} />
    <silkscreentext text="GND" fontSize={0.9} pcbX={2.5} pcbY={-3.2} />

    {/* terminal + -> diode anode, diode cathode -> protected V24 rail */}
    <trace from=".J_IN > .pin1" to=".D1 > .anode" thickness="1mm" />
    <trace from=".D1 > .cathode" to="net.V24" thickness="1mm" />
    <trace from=".J_IN > .pin2" to="net.GND" thickness="1mm" />
    {/* bulk cap across the protected rail */}
    <trace from=".C_BULK > .pos" to="net.V24" thickness="1mm" />
    <trace from=".C_BULK > .neg" to="net.GND" thickness="1mm" />
  </group>
)
