// Functions Descriptions
// Each color conversion function takes one or more color components (e.g., red, green, blue, hue, saturation, lightness) as input and returns an object containing the corresponding color components in the target color space.

// These functions are helpful for tasks like color correction, color grading, and color analysis in image processing and computer graphics.

// Note that these functions assume that the input color components are in the range [0, 255] or [0, 1], depending on the specific function. The output color components are typically in the same range.

// These functions provide a convenient way to work with colors in different color spaces, making it easier to perform various color-related operations.

// The code uses mathematical formulas and algorithms to perform the color conversions accurately and efficiently, taking into account the properties of different color spaces.

//Converts an RGB color to its HSV (Hue, Saturation, Value) representation.
export function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, v };
}

// Converts an RGB color to its HSL (Hue, Saturation, Lightness) representation.
export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let l = (max + min) / 2;

  let h = 0;
  let s = 0;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

// convert only hue to number rgb
function hueToRGB(p: number, q: number, t: number): number {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * 6 * t;
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}

// Converts an HSL color to its RGB representation.
export function hslToRGB(
  h: number,
  s: number,
  l: number,
): { r: number; g: number; b: number } {
  if (s === 0) {
    const r = l;
    const g = l;
    const b = l;
    return { r: r * 255, g: g * 255, b: b * 255 };
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hueToRGB(p, q, h + 1 / 3);
    const g = hueToRGB(p, q, h);
    const b = hueToRGB(p, q, h - 1 / 3);
    return { r: r * 255, g: g * 255, b: b * 255 };
  }
}

// Converts an HSV color to its RGB representation.
export function hsvToRgb(h: number, s: number, v: number) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let { r, g, b } = { r: 0, g: 0, b: 0 };

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.floor(r * 255),
    g: Math.floor(g * 255),
    b: Math.floor(b * 255),
  };
}

// Calculates the luminance of an RGB color.
export function getLuminance(r: number, g: number, b: number) {
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance;
}

// Converts an RGB color to its CIE 1931 XYZ representation.
export function rgbToXYZ(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  if (r > 0.04045) {
    r = Math.pow((r + 0.055) / 1.055, 2.4);
  } else {
    r /= 12.92;
  }

  if (g > 0.04045) {
    g = Math.pow((g + 0.055) / 1.055, 2.4);
  } else {
    g /= 12.92;
  }

  if (b > 0.04045) {
    b = Math.pow((b + 0.055) / 1.055, 2.4);
  } else {
    b /= 12.92;
  }

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  return { x: x * 100, y: y * 100, z: z * 100 };
}

// Converts a CIE 1931 XYZ color to its RGB representation.
export function xyzToRGB(x: number, y: number, z: number) {
  x /= 100;
  y /= 100;
  z /= 100;

  let r = 3.2406 * x + -1.5372 * y + -0.4986 * z;
  let g = -0.9689 * x + 1.8758 * y + 0.0415 * z;
  let b = 0.0557 * x + -0.204 * y + 1.057 * z;

  if (r > 0.0031308) {
    r = 1.055 * Math.pow(r, 0.4166666667) - 0.055;
  } else {
    r *= 12.92;
  }

  if (g > 0.0031308) {
    g = 1.055 * Math.pow(g, 0.4166666667) - 0.055;
  } else {
    g *= 12.92;
  }

  if (b > 0.0031308) {
    b = 1.055 * Math.pow(b, 0.4166666667) - 0.055;
  } else {
    b *= 12.92;
  }

  return { r: r * 255, g: g * 255, b: b * 255 };
}
