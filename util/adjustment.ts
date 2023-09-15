import Jimp from "jimp";
import { rgbToHsv, hsvToRgb, getLuminance } from "./convert.ts";

//fixed
export async function changeAndSaveBrightness(
  inputImagePath: string,
  outputImagePath: string,
  brightnessFactor: number
) {
  try {
    const image = await Jimp.read(inputImagePath);

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const r = image.bitmap.data[idx + 0];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];

      // Calculate the new RGB values with adjusted brightness
      image.bitmap.data[idx + 0] = Math.min(255, r * brightnessFactor);
      image.bitmap.data[idx + 1] = Math.min(255, g * brightnessFactor);
      image.bitmap.data[idx + 2] = Math.min(255, b * brightnessFactor);
    });

    await image.writeAsync(outputImagePath);
    console.log(`Image brightness changed and saved to ${outputImagePath}`);
  } catch (error) {
    console.error("Error:", error);
  }
}
//fixed
export async function changeAndSaveBrightnessLoop(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value > 100 || value < -100) {
    throw new Error("value must be between 100 or -100");
  }
  // for image brigthnes value from -100 to 100
  const brightnessDelta = Math.min(100, Math.max(-100, value));
  const brightnessFactor = 1 + brightnessDelta / 100;
  console.log(brightnessFactor);
  try {
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        r = Math.min(255, r * brightnessFactor);
        g = Math.min(255, g * brightnessFactor);
        b = Math.min(255, b * brightnessFactor);
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`sucess`);
  } catch (error) {
    console.error("Error:", error);
  }
}

//fixed
export async function changeAndSaveExposure(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < -100 || value > 100) {
    throw new Error("Exposure value must be between -100 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const exposureFactor = Math.pow(2, value / 100);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;

        r = Math.min(255, Math.max(0, Math.floor(r * exposureFactor)));
        g = Math.min(255, Math.max(0, Math.floor(g * exposureFactor)));
        b = Math.min(255, Math.max(0, Math.floor(b * exposureFactor)));

        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// export async function changeAndSaveBrightnessCanvas(
//   inputImage,
//   output,
//   brightness
// ) {
//   var canvas = document.createElement("canvas");
//   canvas.id = "hello";
//   var context = canvas.getContext("2d");
//   var img = new Image();
//   img.onload = function () {
//     context.drawImage(img, 0, 0);
//     var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
//     var { r, g, b } = imageData.data;
//     for (var i = 0; i < data.length; i += 4) {
//       r += brightness; // increase red
//       g += brightness; // increase green
//       b += brightness; // increase blue
//     }
//     context.putImageData(imageData, 0, 0);
//     var link = document.createElement("a");
//     link.download = output;
//     link.href = canvas.toDataURL("image/jpeg");
//     link.click();
//   };
//   img.src = inputImage;
// }
//fixed
export async function changeAndSaveSaturation(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    if (value > 100 || value < -100) {
      throw new Error("value must be between 100 or -100");
    }
    // const saturationDelta = Math.min(100, Math.max(-100, value));
    // const saturationFactor = saturationDelta;
    //const saturationFactor = Math.min(2, Math.max(0, value));

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        let hsv = rgbToHsv(r, g, b);
        hsv.s = Math.min(1, Math.max(0, hsv.s + value / 100));
        let data = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const newColor = Jimp.rgbaToInt(data.r, data.g, data.b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function changeAndSaveVibrance(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const vibranceFactor = value * -1;
    //const saturationFactor = Math.min(2, Math.max(0, value));

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        const maxRGB = Math.max(r, g, b);
        const avgRgb = Math.round((r + g + b) / 3);
        const absoluteMetric =
          (((Math.abs(maxRGB - avgRgb) * 2) / 255) * vibranceFactor) / 100;
        // console.log(absoluteMetric)
        r = Math.min(255, r + Math.abs((maxRGB - r) * absoluteMetric));
        g = Math.min(255, g + Math.abs((maxRGB - g) * absoluteMetric));
        b = Math.min(255, g + Math.abs((maxRGB - g) * absoluteMetric));
        // console.log(r,g,b)
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error("Error:", error);
  }
}
//fixed
export async function changeAndSaveGreyScale(
  inputImagePath: string,
  outputImagePath: string
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    // const saturationDelta = Math.min(100, Math.max(-100, value));
    // const saturationFactor = 1 + saturationDelta / 100;
    //const saturationFactor = Math.min(2, Math.max(0, value));

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        const avgRgb = getLuminance(r, g, b);

        r = avgRgb;
        g = avgRgb;
        b = avgRgb;
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

//fixed
export async function changeAndSaveContrast(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value > 100 || value < -100) {
    throw new Error("value must be between -100 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const contrastFactor = (value + 100) / 100;

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;

        r = Math.min(255, Math.max(0, Math.floor((r - 128) * contrastFactor + 128)));
        g = Math.min(255, Math.max(0, Math.floor((g - 128) * contrastFactor + 128)));
        b = Math.min(255, Math.max(0, Math.floor((b - 128) * contrastFactor + 128)));

        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

//fixed
export async function changeAndSaveWhites(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value > 100 || value < -100) {
    throw new Error("value must be between -100 and 100");
  }
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    // const whiteDelta = Math.min(100, Math.max(-100, value));
    // const whiteFactor = 1 + whiteDelta / 100;
    //const saturationFactor = Math.min(2, Math.max(0, value));

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let hsv = rgbToHsv(r, g, b);
        hsv.v = Math.min(1, Math.max(0, hsv.v + value / 100));
        let data = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const newColor = Jimp.rgbaToInt(data.r, data.g, data.b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function changeAndSaveInvert(
  inputImagePath: string,
  outputImagePath: string
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function changeAndSaveSepia(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < 0 || value > 100) {
    throw new Error("value value must be between 0 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const normalizedvalue = value / 100; // Normalize to the range [0, 1]
    console.log(normalizedvalue);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        // Apply sepia tone effect to the RGB values
        const { r, g, b } = color;
        const newR = Math.min(255, Math.floor((1 - normalizedvalue) * r + normalizedvalue * (0.393 * r + 0.769 * g + 0.189 * b)));
        const newG = Math.min(255, Math.floor((1 - normalizedvalue) * g + normalizedvalue * (0.349 * r + 0.686 * g + 0.168 * b)));
        const newB = Math.min(255, Math.floor((1 - normalizedvalue) * b + normalizedvalue * (0.272 * r + 0.534 * g + 0.131 * b)));

        const newColor = Jimp.rgbaToInt(newR, newG, newB, color.a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function changeAndSaveTemperature(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < -100 || value > 100) {
    throw new Error("value value must be between -100 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const normalizedvalue = value / 100; // Normalize to the range [0, 1]
    console.log(normalizedvalue);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let red = r + value;
        let blue = b + value;
        r = Math.min(255, Math.max(0, red));
        b = Math.min(255, Math.max(0, blue));
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function changeAndSaveShadow(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < -100 || value > 100) {
    throw new Error("value value must be between -100 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const normalizedvalue = Math.pow(2, value / 100);
    console.log(normalizedvalue);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let red = Math.pow(r / 255, normalizedvalue) * 255;
        let green = Math.pow(g / 255, normalizedvalue) * 255
        let blue = Math.pow(b / 255, normalizedvalue) * 255;
        r = Math.min(255, Math.max(0, red));
        g = Math.min(255, Math.max(0, green))
        b = Math.min(255, Math.max(0, blue));
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}
