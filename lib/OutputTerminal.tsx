import { boxModel } from "./cad/boxes"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

const TERMINAL_3P = "kicad:TerminalBlock/TerminalBlock_MaiXu_MX126-5.0-03P_1x03_P5.00mm"

// Output to the CCT strip: V+ (raw protected 24V, NOT switched), WW, CW.
// WW/CW are the low-side MOSFET drains.
export const OutputTerminal = (props: Props) => (
  <group {...props}>
    {/* J_OUT rotated 270deg so pins go along Y and screw openings face -X
        (out the LEFT short edge, matching J_IN). cadModel offsetX=+5 keeps
        the body box centered on the 3-pin row mid-point. */}
    <chip
      name="J_OUT"
      footprint={TERMINAL_3P}
      pcbX={0}
      pcbY={0}
      pcbRotation={270}
      pinLabels={{ pin1: "Vplus", pin2: "WW", pin3: "CW" }}
      cadModel={boxModel(16, 8.5, 10, { color: [0.05, 0.35, 0.12], offsetX: 5, offsetY: 3 })}
    />
    <silkscreentext text="V+" fontSize={0.9} pcbX={4} pcbY={0} />
    <silkscreentext text="WW" fontSize={0.9} pcbX={4} pcbY={-5} />
    <silkscreentext text="CW" fontSize={0.9} pcbX={4} pcbY={-10} />

    <trace from=".J_OUT > .Vplus" to="net.V24" thickness="1mm" />
    <trace from=".J_OUT > .WW" to="net.WW" thickness="1mm" />
    <trace from=".J_OUT > .CW" to="net.CW" thickness="1mm" />
  </group>
)
