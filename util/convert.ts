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

export function getLuminance(r: number, g: number, b: number) {
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance;
}

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
