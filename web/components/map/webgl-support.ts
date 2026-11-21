// MapLibre GL v5 renders with WebGL2 and throws from its constructor when
// the browser can't give it a context (hardware acceleration off, some
// remote desktops and VMs, old browsers). Thrown inside a useEffect, that
// surfaced as the app's 500 card on /map, which is also the home page.
// Legacy's Google Maps widget had no such requirement, so check first and
// show a plain message instead of an error page.
export function isWebGl2Supported(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return canvas.getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

export const NO_WEBGL_MESSAGE =
  "This browser can't draw the map because WebGL is turned off or unsupported. Turning on hardware acceleration usually fixes it.";
