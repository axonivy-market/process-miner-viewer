let sharedCanvas: HTMLCanvasElement | null = null;
let sharedCtx: CanvasRenderingContext2D | null = null;

function getSharedContext(): CanvasRenderingContext2D {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCanvas.width = sharedCanvas.height = 1;

    sharedCtx = sharedCanvas.getContext('2d', {
      willReadFrequently: true
    })!;
  }

  return sharedCtx!;
}
export type ParsedColor = {
  r: number;
  g: number;
  b: number;
  a: number;
  valid: boolean;
};

export function parseToRgba(color: string, fallback = '#47C46B'): ParsedColor {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;

  const ctx = getSharedContext();
  ctx.clearRect(0, 0, 1, 1);

  // Baseline
  ctx.fillStyle = fallback;
  ctx.fillRect(0, 0, 1, 1);
  const fallbackPixel = ctx.getImageData(0, 0, 1, 1).data;

  // Try requested color
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const pixel = ctx.getImageData(0, 0, 1, 1).data;

  const isInvalid =
    pixel[0] === fallbackPixel[0] && pixel[1] === fallbackPixel[1] && pixel[2] === fallbackPixel[2] && pixel[3] === fallbackPixel[3];

  const [r, g, b, a] = isInvalid ? fallbackPixel : pixel;

  return {
    r,
    g,
    b,
    a: a / 255,
    valid: !isInvalid
  };
}

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
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

export function hslToRgb(h: number, s: number, l: number) {
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

export function getColor(color: string, fallback: string): string {
  const parsed = parseToRgba(color, fallback);
  return parsed.valid ? color : fallback;
}

export function getLightenColor(color: string, fallback: string, amount = 0.25): string {
  const { r, g, b, a } = parseToRgba(color, fallback);
  const hsl = rgbToHsl(r, g, b);

  hsl.l = Math.min(1, hsl.l + amount);

  const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}
