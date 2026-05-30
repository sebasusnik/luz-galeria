import type { ReactNode } from "react"
import { To220Footprint, AxialResistorFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

// One low-side PWM channel. IRLZ44N (logic-level N-MOSFET, TO-220) with a custom
// footprint whose pads are named G/D/S — pin1=Gate, pin2=Drain, pin3=Source, which
// is the IRLZ44N order (NOT the SOT-23 G/S/D used by the SMD version).
//   gateNet --[100R]--> gate --[10k]--> GND   (pulldown keeps it OFF at reset)
//   source -> GND,  drain -> drainNet (strip WW/CW return)
const Channel = (p: {
  ref: string
  gateNet: string
  drainNet: string
  pcbX: number
  pcbY: number
}): ReactNode => (
  // fragment (not a group): keep children positioned relative to the parent
  // group; an unpositioned nested group would get auto-placed and scattered.
  <>
    <chip
      name={`Q_${p.ref}`}
      footprint={<To220Footprint />}
      pcbX={p.pcbX}
      pcbY={p.pcbY}
    />
    <resistor name={`RG_${p.ref}`} resistance="100" footprint={<AxialResistorFootprint />} pcbX={p.pcbX} pcbY={p.pcbY - 6} />
    <resistor name={`RPD_${p.ref}`} resistance="10k" footprint={<AxialResistorFootprint />} pcbX={p.pcbX} pcbY={p.pcbY - 9} />

    <trace from={`net.${p.gateNet}`} to={`.RG_${p.ref} > .pin1`} />
    <trace from={`.RG_${p.ref} > .pin2`} to={`.Q_${p.ref} > .G`} />
    <trace from={`.RPD_${p.ref} > .pin1`} to={`.Q_${p.ref} > .G`} />
    <trace from={`.RPD_${p.ref} > .pin2`} to="net.GND" />
    <trace from={`.Q_${p.ref} > .S`} to="net.GND" thickness="1mm" />
    <trace from={`.Q_${p.ref} > .D`} to={`net.${p.drainNet}`} thickness="1mm" />
  </>
)

export const MosfetDriver = (props: Props) => (
  <group {...props}>
    <Channel ref="WW" gateNet="PWM_WW" drainNet="WW" pcbX={-6} pcbY={0} />
    <Channel ref="CW" gateNet="PWM_CW" drainNet="CW" pcbX={6} pcbY={0} />
    <silkscreentext text="WW" fontSize={0.8} pcbX={-6} pcbY={2.5} />
    <silkscreentext text="CW" fontSize={0.8} pcbX={6} pcbY={2.5} />
  </group>
)
