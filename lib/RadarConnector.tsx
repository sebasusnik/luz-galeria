import { boxModel } from "./cad/boxes"
import { CeramicCapFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

const JST_XH_5 = "kicad:Connector_JST/JST_XH_B5B-XH-A_1x05_P2.50mm_Vertical"

// JST-XH 5-pin to the off-board HLK-LD2410C radar (cabled to the box's front
// wall). Pinout: VCC(5V), GND, TX, RX, OUT. Radar TX -> ESP RX (IO20),
// ESP TX (IO21) -> radar RX, radar OUT -> ESP IO7. Logic is 3.3V on both ends.
export const RadarConnector = (props: Props) => (
  <group {...props}>
    <chip
      name="J_RDR"
      footprint={JST_XH_5}
      pcbX={0}
      pcbY={0}
      pinLabels={{ pin1: "VCC", pin2: "GND", pin3: "TX", pin4: "RX", pin5: "OUT" }}
      cadModel={boxModel(14, 6, 6, { color: [0.85, 0.85, 0.88] })}
    />
    {/* 100nF decoupling at the radar VCC */}
    <capacitor name="C_RDR" capacitance="100nF" footprint={<CeramicCapFootprint />} pcbX={0} pcbY={5} />

    <silkscreentext text="VCC GND TX RX OUT" fontSize={0.7} pcbX={0} pcbY={-3} />

    <trace from=".J_RDR > .VCC" to="net.V5" thickness="0.5mm" />
    <trace from=".J_RDR > .GND" to="net.GND" />
    <trace from=".J_RDR > .TX" to="net.RDR_TX" />
    <trace from=".J_RDR > .RX" to="net.RDR_RX" />
    <trace from=".J_RDR > .OUT" to="net.RDR_OUT" />
    <trace from=".C_RDR > .pin1" to="net.V5" />
    <trace from=".C_RDR > .pin2" to="net.GND" />
  </group>
)
