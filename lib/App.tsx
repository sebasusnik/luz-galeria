import { PowerInput } from "./PowerInput"
import { BuckRegulator } from "./BuckRegulator"
import { Microcontroller } from "./Microcontroller"
import { MosfetDriver } from "./MosfetDriver"
import { OutputTerminal } from "./OutputTerminal"
import { EncoderInput } from "./EncoderInput"
import { RadarConnector } from "./RadarConnector"

// LUZ-GALERIA v1.0 — CCT LED strip controller.
// Board mounted horizontal & upside-down under a kitchen cabinet; all parts on
// top, bottom is a continuous GND plane. Power zone right, signal zone left.
const W = 70
const H = 50
const MX = W / 2 - 3 // mounting-hole center inset from edge (3mm per spec)
const MY = H / 2 - 3

const MountingHole = ({ x, y }: { x: number; y: number }) => (
  <>
    <hole diameter="3.2mm" pcbX={x} pcbY={y} />
    <keepout shape="circle" radius="4mm" pcbX={x} pcbY={y} layer="top" />
    <keepout shape="circle" radius="4mm" pcbX={x} pcbY={y} layer="bottom" />
  </>
)

// GND stitching vias along the perimeter / dense power zone.
const StitchVia = ({ x, y }: { x: number; y: number }) => (
  <via
    fromLayer="top"
    toLayer="bottom"
    outerDiameter="0.6mm"
    holeDiameter="0.3mm"
    connectsTo="net.GND"
    pcbX={x}
    pcbY={y}
  />
)

export default () => (
  <board
    width={W}
    height={H}
    thickness="1.6mm"
    layers={2}
    material="fr4"
    minTraceWidth="0.2mm"
    minViaHoleDiameter="0.3mm"
    minViaPadDiameter="0.6mm"
    minBoardEdgeClearance="0.3mm"
    minPadEdgeToPadEdgeClearance="0.2mm"
    minTraceToPadEdgeClearance="0.2mm"
  >
    {/* ---- I/O at the SHORT edges: both terminals on -X edge (cables exit
        same narrow side), encoder on +X edge (knob alone, easy access) ---- */}
    <PowerInput pcbX={-32} pcbY={13} />
    <OutputTerminal pcbX={-32} pcbY={-3} />
    <EncoderInput pcbX={27} pcbY={0} />

    {/* ---- Interior: signal up-left, power across the middle ---- */}
    <Microcontroller pcbX={-19} pcbY={10} pcbRotation={180} />
    <RadarConnector pcbX={-4} pcbY={-22} />
    <BuckRegulator pcbX={2} pcbY={14} />
    <MosfetDriver pcbX={0} pcbY={-6} />

    {/* ---- Mounting (M3, 4 corners) ---- */}
    <MountingHole x={-MX} y={MY} />
    <MountingHole x={MX} y={MY} />
    <MountingHole x={-MX} y={-MY} />
    <MountingHole x={MX} y={-MY} />

    {/* ---- Continuous bottom GND plane + stitching ---- */}
    <copperpour
      connectsTo="net.GND"
      layer="bottom"
      boardEdgeMargin="0.5mm"
      padMargin="0.4mm"
      traceMargin="0.3mm"
    />
    <StitchVia x={0} y={22} />
    <StitchVia x={0} y={-23} />
    <StitchVia x={-15} y={-19} />
    <StitchVia x={15} y={-19} />
    <StitchVia x={15} y={6} />
    <StitchVia x={-22} y={-9} />

    {/* ---- Board identity ---- */}
    <silkscreentext text="LUZ-GALERIA v1.0" fontSize={1.6} pcbX={-2} pcbY={-23.2} />
    <silkscreentext text="@maker" fontSize={1.2} pcbX={28} pcbY={-23.2} />
  </board>
)
