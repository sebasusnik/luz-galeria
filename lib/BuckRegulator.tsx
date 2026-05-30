import { headerModuleModel } from "./cad/boxes"
import { Mp1584Footprint, AxialResistorFootprint, ThtLedFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

// MP1584 buck module (pre-set to 5V by the user) mounted on female headers.
// IN pair <- protected 24V, OUT pair -> 5V rail. Includes the power-on LED.
export const BuckRegulator = (props: Props) => (
  <group {...props}>
    <chip
      name="U_BUCK"
      footprint={<Mp1584Footprint />}
      pinLabels={{ pin1: "INp", pin2: "INn", pin3: "OUTp", pin4: "OUTn" }}
      pcbX={0}
      pcbY={0}
      cadModel={headerModuleModel({ width: 22, depth: 17, bodyH: 5, color: [0.1, 0.1, 0.12] })}
    />

    <resistor name="R_LED" resistance="1k" footprint={<AxialResistorFootprint />} pcbX={-3} pcbY={-12} />
    <led name="LED_PWR" color="green" footprint={<ThtLedFootprint />} pcbX={5} pcbY={-12} />
    <silkscreentext text="PWR" fontSize={0.8} pcbX={8} pcbY={-12} />

    <trace from=".U_BUCK > .INp" to="net.V24" thickness="1mm" />
    <trace from=".U_BUCK > .INn" to="net.GND" thickness="1mm" />
    <trace from=".U_BUCK > .OUTp" to="net.V5" thickness="0.5mm" />
    <trace from=".U_BUCK > .OUTn" to="net.GND" thickness="0.5mm" />

    {/* power-on indicator: 5V -> 1k -> LED -> GND */}
    <trace from="net.V5" to=".R_LED > .pin1" />
    <trace from=".R_LED > .pin2" to=".LED_PWR > .anode" />
    <trace from=".LED_PWR > .cathode" to="net.GND" />
  </group>
)
