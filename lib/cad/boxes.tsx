// Simplified 3D bounding-volume models attached to components via `cadModel`.
// tscircuit's 3D pipeline renders the `model_jscad` field as a JSON "jscad plan"
// (see @tscircuit/runframe jscadPlanner): nodes like { type:"cuboid", size, center }.
// The model origin sits at the component center on the board's top surface, +Z
// pointing away from the board. We build volumes growing in +Z so they "sit" on
// the surface. These exist so the exported STEP reflects real component heights
// for designing the wooden enclosure around the board.

type Vec3 = [number, number, number]
type JscadNode = Record<string, any>

const DARK_GREY: Vec3 = [0.22, 0.23, 0.25]

const colorize = (color: Vec3, shape: JscadNode): JscadNode => ({
  type: "colorize",
  color,
  shape,
})

const union = (...shapes: JscadNode[]): JscadNode => ({ type: "union", shapes })

const cuboid = (size: Vec3, center: Vec3): JscadNode => ({
  type: "cuboid",
  size,
  center,
})

const cylinderZ = (
  radius: number,
  height: number,
  center: Vec3,
  segments = 32,
): JscadNode => ({ type: "cylinder", radius, height, center, segments })

/** A rectangular body of width(x) × depth(y) × height(z) standing on the surface. */
export const boxModel = (
  width: number,
  depth: number,
  height: number,
  opts: { color?: Vec3; z0?: number; offsetX?: number; offsetY?: number } = {},
) => {
  const { color = DARK_GREY, z0 = 0, offsetX = 0, offsetY = 0 } = opts
  return {
    jscad: colorize(
      color,
      cuboid([width, depth, height], [offsetX, offsetY, z0 + height / 2]),
    ),
  }
}

/** A vertical cylinder (e.g. electrolytic can) standing on the surface. */
export const cylinderModel = (
  radius: number,
  height: number,
  opts: { color?: Vec3; z0?: number } = {},
) => {
  const { color = DARK_GREY, z0 = 0 } = opts
  return {
    jscad: colorize(color, cylinderZ(radius, height, [0, 0, z0 + height / 2])),
  }
}

/**
 * EC11 rotary encoder: body + threaded bushing + shaft. Mounted upside-down
 * under the cabinet, so this whole stack protrudes downward where the knob hangs.
 * shaftLen = exposed shaft length above the body (~15mm per spec).
 */
export const encoderModel = (opts: {
  bodyW?: number
  bodyD?: number
  bodyH?: number
  bushingDia?: number
  bushingH?: number
  shaftDia?: number
  shaftLen?: number
} = {}) => {
  const {
    bodyW = 12.4,
    bodyD = 13.4,
    bodyH = 6.5,
    bushingDia = 7,
    bushingH = 7,
    shaftDia = 6,
    shaftLen = 15,
  } = opts
  const body = colorize([0.15, 0.16, 0.18], cuboid([bodyW, bodyD, bodyH], [0, 0, bodyH / 2]))
  const bushing = colorize(
    [0.7, 0.7, 0.72],
    cylinderZ(bushingDia / 2, bushingH, [0, 0, bodyH + bushingH / 2]),
  )
  const shaft = colorize(
    [0.85, 0.85, 0.2],
    cylinderZ(shaftDia / 2, shaftLen, [0, 0, bodyH + shaftLen / 2]),
  )
  return { jscad: union(body, bushing, shaft) }
}

/**
 * Module mounted on female headers: header standoff + the module PCB/body above.
 * standoff ~8.5mm (typical 2.54 female header height) keeps the module clear of
 * tall through-hole parts; the box must clear the full standoff + body height.
 */
export const headerModuleModel = (opts: {
  width: number
  depth: number
  bodyH?: number
  standoff?: number
  color?: Vec3
}) => {
  const { width, depth, bodyH = 4, standoff = 8.5, color = [0.1, 0.2, 0.35] } = opts
  const headers = colorize(
    [0.05, 0.05, 0.06],
    cuboid([width, depth, standoff], [0, 0, standoff / 2]),
  )
  const body = colorize(
    color as Vec3,
    cuboid([width, depth, bodyH], [0, 0, standoff + bodyH / 2]),
  )
  return { jscad: union(headers, body) }
}
