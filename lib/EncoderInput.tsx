import { encoderModel } from "./cad/boxes"
import { Ec11Footprint, AxialResistorFootprint, CeramicCapFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

// EC11 rotary encoder (vertical, soldered THT). Custom footprint (the KiCad one
// fails to resolve in this tscircuit version — see Ec11Footprint). Alps EC11E
// pads: A, B = quadrature, C = common, S1/S2 = switch, MP1/MP2 = mounting posts.
// External 10k pull-ups to 3V3 (NOT 5V — the ESP32-C3 GPIOs are 3.3V) and small
// debounce caps. C, S2 and the mounting posts go to GND.
export const EncoderInput = (props: Props) => (
  <group {...props}>
    <chip
      name="ENC"
      footprint={<Ec11Footprint />}
      pcbX={0}
      pcbY={0}
      cadModel={{
        ...encoderModel(),
        // PCB mounts upside-down under the cabinet, so the shaft physically
        // hangs DOWN. Flipping the model 180deg on X makes the render show it
        // pointing down too (matches the install orientation visually).
        rotationOffset: { x: 180, y: 0, z: 0 },
      }}
    />

    {/* support passives sit on the -X side (toward the board interior), since
        the encoder is now mounted at the right short edge of the board */}
    <resistor name="RPU_A" resistance="10k" footprint={<AxialResistorFootprint />} pcbX={-12} pcbY={9} />
    <resistor name="RPU_B" resistance="10k" footprint={<AxialResistorFootprint />} pcbX={-12} pcbY={5} />
    <resistor name="RPU_SW" resistance="10k" footprint={<AxialResistorFootprint />} pcbX={-12} pcbY={1} />

    <capacitor name="C_A" capacitance="10nF" footprint={<CeramicCapFootprint />} pcbX={-12} pcbY={-3} />
    <capacitor name="C_B" capacitance="10nF" footprint={<CeramicCapFootprint />} pcbX={-12} pcbY={-6} />
    <capacitor name="C_SW" capacitance="10nF" footprint={<CeramicCapFootprint />} pcbX={-12} pcbY={-9} />

    {/* encoder pins */}
    <trace from=".ENC > .A" to="net.ENC_A" />
    <trace from=".ENC > .B" to="net.ENC_B" />
    <trace from=".ENC > .C" to="net.GND" />
    <trace from=".ENC > .S1" to="net.ENC_SW" />
    <trace from=".ENC > .S2" to="net.GND" />
    <trace from=".ENC > .MP1" to="net.GND" />
    <trace from=".ENC > .MP2" to="net.GND" />

    {/* pull-ups to 3V3 */}
    <trace from=".RPU_A > .pin1" to="net.ENC_A" />
    <trace from=".RPU_A > .pin2" to="net.V3V3" />
    <trace from=".RPU_B > .pin1" to="net.ENC_B" />
    <trace from=".RPU_B > .pin2" to="net.V3V3" />
    <trace from=".RPU_SW > .pin1" to="net.ENC_SW" />
    <trace from=".RPU_SW > .pin2" to="net.V3V3" />

    {/* debounce caps to GND */}
    <trace from=".C_A > .pin1" to="net.ENC_A" />
    <trace from=".C_A > .pin2" to="net.GND" />
    <trace from=".C_B > .pin1" to="net.ENC_B" />
    <trace from=".C_B > .pin2" to="net.GND" />
    <trace from=".C_SW > .pin1" to="net.ENC_SW" />
    <trace from=".C_SW > .pin2" to="net.GND" />
  </group>
)
