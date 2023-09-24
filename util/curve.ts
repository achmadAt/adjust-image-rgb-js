import Calculate from "./calculate.ts";

// class Curve {
//   static curveToRgbfunction(chans, ...cps) {
//     let algo, i;
//     const last = cps[cps.length - 1];

//     if (typeof last === 'function') {
//       algo = last;
//       cps.pop();
//     } else if (typeof last === 'string') {
//       algo = Calculate[last];
//       cps.pop();
//     } else {
//       algo = Calculate.bezier;
//     }

//     // If channels are in a string, split to an array
//     if (typeof chans === 'string') {
//       chans = chans.split('');
//     }
//     if (chans[0] === 'v') {
//       chans = ['r', 'g', 'b'];
//     }

//     if (cps.length < 2) {
//       // might want to give a warning now
//       throw 'Invalid number of arguments to curves filter';
//     }

//     // Generate a curve
//     const bezier = algo(cps, 0, 255);

//     // If the curve starts after x = 0, initialize it with a flat line
//     // until the curve begins.
//     const start = cps[0];
//     if (start[0] > 0) {
//       let asc, end1, j;
//       for (
//         j = 0, i = j, end1 = start[0], asc = 0 <= end1;
//         asc ? j < end1 : j > end1;
//         asc ? j++ : j--, i = j
//       ) {
//         bezier[i] = start[1];
//       }
//     }

//     // ... and the same with the end point
//     const end = cps[cps.length - 1];
//     if (end[0] < 255) {
//       let asc1, k;
//       for (
//         k = end[0], i = k, asc1 = end[0] <= 255;
//         asc1 ? k <= 255 : k >= 255;
//         asc1 ? k++ : k--, i = k
//       ) {
//         bezier[i] = end[1];
//       }
//     }

//     return function (rgba) {
//       // Now that we have the bezier curve, we do a basic hashmap lookup
//       // to find and replace color values.
//       let asc2, end2;
//       for (
//         i = 0, end2 = chans.length, asc2 = 0 <= end2;
//         asc2 ? i < end2 : i > end2;
//         asc2 ? i++ : i--
//       ) {
//         rgba[chans[i]] = bezier[rgba[chans[i]]];
//       }
//       return rgba;
//     };
//   }
// }
class Curves {
    static curvesToRgbf(chans: string | string[], ...cps: number[][]): (rgba: { [key: string]: number }) => { [key: string]: number } {
        let i;
        const last = cps[cps.length - 1];
        let algo: (cps: number[][], lowBound: number, highBound: number) => { [key: string]: number };
      
        if (typeof last === "function") {
          algo = last;
          cps.pop();
        } else if (typeof last === "string") {
          algo = Calculate[last] as (cps: number[][], lowBound: number, highBound: number) => { [key: string]: number };
          cps.pop();
        } else {
          algo = Calculate.bezier as unknown as (cps: number[][], lowBound: number, highBound: number) => { [key: string]: number }
        }
      
        if (typeof chans === "string") {
          chans = chans.split("");
        } else if (chans[0] === "v") {
          chans = ["r", "g", "b"];
        }
      
        if (cps.length < 2) {
          throw new Error("Invalid number of arguments to curves filter");
        }
      
        // Generate a curve
        const bezier = algo(cps, 0, 255);
      
        // If the curve starts after x = 0, initialize it with a flat line
        // until the curve begins.
        const start = cps[0];
        for (let i = 0; i < start[0]; i++) {
          if (start[0] > 0) {
            bezier[i] = start[1];
          }
        }
      
        // ... and the same with the end point
        const end = cps[cps.length - 1];
        for (let i = end[0]; i <= 255; i++) {
          if (end[0] < 255) {
            bezier[i] = end[1];
          }
        }
      
        return function (rgba) {
          // Now that we have the bezier curve, we do a basic hashmap lookup
          // to find and replace color values.
          let asc2, end2;
          for (
            i = 0, end2 = chans.length, asc2 = 0 <= end2;
            asc2 ? i < end2 : i > end2;
            asc2 ? i++ : i--
          ) {
            rgba[chans[i]] = bezier[rgba[chans[i]]];
          }
          return rgba;
        };
      }
}




export default Curves;