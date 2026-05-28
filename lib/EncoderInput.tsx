import { encoderModel } from "./cad/boxes"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

const EC11 = "kicad:Rotary_Encoder/RotaryEncoder_Alps_EC11E-Switch_Vertical_H20mm"

// EC11 rotary encoder (vertical, soldered THT). KiCad pinout: A=pin1, B=pin2,
// C(common)=pin3, switch S1=pin6/S2=pin7, mounting pegs MP=pin4/pin5.
// External 10k pull-ups to 3V3 (NOT 5V — the ESP32-C3 GPIOs are 3.3V) and small
// debounce caps. C and S2 to GND.
export const EncoderInput = (props: Props) => (
  <group {...props}>
    <chip
      name="ENC"
      footprint={EC11}
      pcbX={0}
      pcbY={0}
      cadModel={encoderModel()}
    />

    {/* support passives sit in the open area to the +X side, clear of the
        encoder body courtyard (which extends ~+15mm from pin1) */}
    <resistor name="RPU_A" resistance="10k" footprint="0805" pcbX={20} pcbY={7} />
    <resistor name="RPU_B" resistance="10k" footprint="0805" pcbX={20} pcbY={3.5} />
    <resistor name="RPU_SW" resistance="10k" footprint="0805" pcbX={20} pcbY={0} />

    <capacitor name="C_A" capacitance="10nF" footprint="0805" pcbX={23.5} pcbY={7} />
    <capacitor name="C_B" capacitance="10nF" footprint="0805" pcbX={23.5} pcbY={3.5} />
    <capacitor name="C_SW" capacitance="10nF" footprint="0805" pcbX={23.5} pcbY={0} />

    {/* encoder pins */}
    <trace from=".ENC > .A" to="net.ENC_A" />
    <trace from=".ENC > .B" to="net.ENC_B" />
    <trace from=".ENC > .C" to="net.GND" />
    <trace from=".ENC > .S1" to="net.ENC_SW" />
    <trace from=".ENC > .S2" to="net.GND" />
    <trace from=".ENC > .pin4" to="net.GND" />
    <trace from=".ENC > .pin5" to="net.GND" />

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
