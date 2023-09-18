class Calculate {
  static distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  static randomRange(
    min: number,
    max: number,
    getFloat: boolean = false,
  ): number {
    const rand = min + Math.random() * (max - min);
    return getFloat ? parseFloat(rand.toFixed(1)) : Math.round(rand);
  }

  static luminance(rgba: { r: number; g: number; b: number }): number {
    return 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
  }

  static bezier(
    start: [number, number],
    ctrl1: [number, number],
    ctrl2: [number, number],
    end: [number, number],
    lowBound: number = 0,
    highBound: number = 255,
  ): { [x: number]: number } {
    let controlPoints: [number, number][] = [start, ctrl1, ctrl2, end];

    if (controlPoints.length < 2) {
      throw new Error('Invalid number of arguments to bezier');
    }

    const bezier: { [x: number]: number } = {};
    const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
    const clamp = (a: number, min: number, max: number) =>
      Math.min(Math.max(a, min), max);

    for (let i = 0; i < 1000; i++) {
      const t = i / 1000;
      let prev = controlPoints;

      while (prev.length > 1) {
        const next: [number, number][] = [];

        for (let j = 0; j < prev.length - 1; j++) {
          next.push([
            lerp(prev[j][0], prev[j + 1][0], t),
            lerp(prev[j][1], prev[j + 1][1], t),
          ]);
        }

        prev = next;
      }

      bezier[Math.round(prev[0][0])] = Math.round(
        clamp(prev[0][1], lowBound, highBound),
      );
    }

    const endX = controlPoints[controlPoints.length - 1][0];
    return this.missingValues(bezier, endX);
  }

  static hermite(
    controlPoints: [number, number][],
    lowBound: number,
    highBound: number,
  ): { [x: number]: number } {
    if (controlPoints.length < 2) {
      throw new Error('Invalid number of arguments to hermite');
    }

    const ret: { [x: number]: number } = {};
    const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;
    const add = (
      a: [number, number],
      b: [number, number],
      c: [number, number],
      d: [number, number],
    ): [number, number] => [
      a[0] + b[0] + c[0] + d[0],
      a[1] + b[1] + c[1] + d[1],
    ];
    const mul = (
      a: [number, number],
      b: [number, number],
    ): [number, number] => [a[0] * b[0], a[1] * b[1]];
    const sub = (
      a: [number, number],
      b: [number, number],
    ): [number, number] => [a[0] - b[0], a[1] - b[1]];
    const clamp = (a: number, min: number, max: number) =>
      Math.min(Math.max(a, min), max);

    let count = 0;
    for (let i = 0; i < controlPoints.length - 1; i++) {
      const p0 = controlPoints[i];
      const p1 = controlPoints[i + 1];

      const pointsPerSegment = p1[0] - p0[0];
      let pointsPerStep = 1 / pointsPerSegment;

      // The last point of the last segment should reach p1
      if (i === controlPoints.length - 2) {
        pointsPerStep = 1 / (pointsPerSegment - 1);
      }

      const p = i > 0 ? controlPoints[i - 1] : p0;
      const m0 = mul(sub(p1, p), [0.5, 0.5]);

      const p2 = i < controlPoints.length - 2 ? controlPoints[i + 2] : p1;
      const m1 = mul(sub(p2, p0), [0.5, 0.5]);

      for (let j = 0; j <= pointsPerSegment; j++) {
        const t = j * pointsPerStep;

        const fac0 = 2.0 * t * t * t - 3.0 * t * t + 1.0;
        const fac1 = t * t * t - 2.0 * t * t + t;
        const fac2 = -2.0 * t * t * t + 3.0 * t * t;
        const fac3 = t * t * t - t * t;

        const pos = add(
          mul(p0, [fac0, fac0]),
          mul(m0, [fac1, fac1]),
          mul(p1, [fac2, fac2]),
          mul(m1, [fac3, fac3]),
        );

        ret[Math.round(pos[0])] = Math.round(
          clamp(pos[1], lowBound, highBound),
        );

        count += 1;
      }
    }

    // Add missing values
    const endX = controlPoints[controlPoints.length - 1][0];
    return this.missingValues(ret, endX);
  }

  static missingValues(
    values: { [x: number]: number },
    endX: number,
  ): { [x: number]: number } {
    if (Object.keys(values).length < endX + 1) {
      const ret: { [x: number]: number } = {};

      for (let i = 0; i <= endX; i++) {
        if (values[i] !== undefined) {
          ret[i] = values[i];
        } else {
          let leftCoord: [number, number] = [i - 1, ret[i - 1]];
          let rightCoord: [number, number] = [0, 0];
          for (let j = i; j <= endX; j++) {
            if (values[j] !== undefined) {
              rightCoord = [j, values[j]];
              break;
            }
          }

          ret[i] =
            leftCoord[1] +
            ((rightCoord[1] - leftCoord[1]) / (rightCoord[0] - leftCoord[0])) *
              (i - leftCoord[0]);
        }
      }

      return ret;
    }

    return values;
  }
}

export default Calculate;
