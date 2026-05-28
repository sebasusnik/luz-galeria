import type { ReactNode } from "react"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

// One low-side PWM channel. AO3400 modeled as a chip with explicit G/S/D pin
// labels so pin1=Gate, pin2=Source, pin3=Drain matches the real SOT-23 part
// (tscircuit's <mosfet> defaults to drain=pin1, which would mis-wire AO3400).
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
      footprint="sot23"
      pinLabels={{ pin1: "G", pin2: "S", pin3: "D" }}
      pcbX={p.pcbX}
      pcbY={p.pcbY}
    />
    <resistor name={`RG_${p.ref}`} resistance="100" footprint="0805" pcbX={p.pcbX - 4} pcbY={p.pcbY + 1.6} />
    <resistor name={`RPD_${p.ref}`} resistance="10k" footprint="0805" pcbX={p.pcbX - 4} pcbY={p.pcbY - 1.6} />

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
    <Channel ref="WW" gateNet="PWM_WW" drainNet="WW" pcbX={0} pcbY={4} />
    <Channel ref="CW" gateNet="PWM_CW" drainNet="CW" pcbX={0} pcbY={-4} />
    <silkscreentext text="WW" fontSize={0.8} pcbX={3} pcbY={4} />
    <silkscreentext text="CW" fontSize={0.8} pcbX={3} pcbY={-4} />
  </group>
)
