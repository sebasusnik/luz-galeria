import { headerModuleModel } from "./cad/boxes"
import { Esp32SuperMiniFootprint } from "./footprints"

type Props = { pcbX?: number; pcbY?: number; pcbRotation?: number | string }

// ESP32-C3 Super Mini on female headers. USB-C edge = -Y, PCB antenna = +Y.
// Pin map assumes the common Super Mini silk; VERIFY against the physical board.
// GPIO assignment (firmware/ESPHome): WW=IO10, CW=IO3, EncA=IO4, EncB=IO5,
// EncSW=IO6, RadarOUT=IO7, UART RX=IO20, UART TX=IO21. (WW moved off strapping
// pin GPIO2 -> GPIO10.)
export const Microcontroller = (props: Props) => (
  <group {...props}>
    <chip
      name="ESP"
      footprint={<Esp32SuperMiniFootprint />}
      pinLabels={{
        pin1: "5V",
        pin2: "GND",
        pin3: "V3V3",
        pin4: "IO4",
        pin5: "IO3",
        pin6: "IO2",
        pin7: "IO1",
        pin8: "IO0",
        pin9: "IO5",
        pin10: "IO6",
        pin11: "IO7",
        pin12: "IO8",
        pin13: "IO9",
        pin14: "IO10",
        pin15: "IO20",
        pin16: "IO21",
      }}
      pcbX={0}
      pcbY={0}
      cadModel={headerModuleModel({ width: 18, depth: 26, bodyH: 4, color: [0.1, 0.1, 0.12] })}
    />

    {/* 100nF decoupling at the 5V header pin (pin1 @ top-left) */}
    <capacitor name="C_ESP" capacitance="100nF" footprint="0805" pcbX={-11} pcbY={8.9} />

    {/* copper keep-out over the PCB antenna (+Y end), both layers */}
    <keepout shape="rect" width="12mm" height="6mm" pcbX={0} pcbY={12.5} layer="top" />
    <keepout shape="rect" width="12mm" height="6mm" pcbX={0} pcbY={12.5} layer="bottom" />

    <trace from=".ESP > .5V" to="net.V5" thickness="0.5mm" />
    <trace from=".ESP > .GND" to="net.GND" thickness="0.5mm" />
    <trace from=".ESP > .V3V3" to="net.V3V3" />
    <trace from=".C_ESP > .pin1" to="net.V5" />
    <trace from=".C_ESP > .pin2" to="net.GND" />

    <trace from=".ESP > .IO10" to="net.PWM_WW" />
    <trace from=".ESP > .IO3" to="net.PWM_CW" />
    <trace from=".ESP > .IO4" to="net.ENC_A" />
    <trace from=".ESP > .IO5" to="net.ENC_B" />
    <trace from=".ESP > .IO6" to="net.ENC_SW" />
    <trace from=".ESP > .IO7" to="net.RDR_OUT" />
    <trace from=".ESP > .IO20" to="net.RDR_TX" />
    <trace from=".ESP > .IO21" to="net.RDR_RX" />
  </group>
)
