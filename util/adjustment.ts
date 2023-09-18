import Jimp from "jimp";
import { rgbToHsv, hsvToRgb, getLuminance } from "./convert.ts";
import Calculate from "./calculate.ts";

//fixed
// # ## Brightness
// # Simple brightness adjustment
// #
// # ### Arguments
// # Range is -100 to 100. Values < 0 will darken image while values > 0 will brighten.
export async function changeAndSaveBrightnessLoop(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value > 100 || value < -100) {
    throw new Error("value must be between 100 or -100");
  }
  // for image brigthnes value from -100 to 100
  const brightnessFactor = Math.floor((value/ 100) * 255);
  console.log(brightnessFactor);
  try {
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        r = Math.min(255, Math.max(0,r + brightnessFactor));
        g = Math.min(255, Math.max(0,g + brightnessFactor));
        b = Math.min(255, Math.max(0,b + brightnessFactor));
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
  // var canvas = document.createElement("canvas");
  // canvas.id = "hello";
  // var context = canvas.getContext("2d");
  // var img = new Image();
  // img.onload = function () {
  //   context.drawImage(img, 0, 0);
  //   var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  //   var { r, g, b } = imageData.data;
  //   for (var i = 0; i < data.length; i += 4) {
  //     r += brightness; // increase red
  //     g += brightness; // increase green
  //     b += brightness; // increase blue
  //   }
  //   context.putImageData(imageData, 0, 0);
//     var link = document.createElement("a");
//     link.download = output;
//     link.href = canvas.toDataURL("image/jpeg");
//     link.click();
//   };
//   img.src = inputImage;
// }

//fixed
//using hsv technique value is -100 to 100
export async function changeAndSaveSaturationHSV(
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

//from caman
// # ## Saturation
// # Adjusts the color saturation of the image.
// #
// # ### Arguments
// # Range is -100 to 100. Values < 0 will desaturate the image while values > 0 will saturate it.
// # **If you want to completely desaturate the image**, using the greyscale filter is highly 
// # recommended because it will yield better results.
export async function changeAndSaveSaturationRGB(
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
    
    const saturationCorrection = value * -0.01;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        const max = Math.max(r, g, b);
        if (r !== max) r += (max - r) * saturationCorrection;
        if (g !== max) g += (max - g) * saturationCorrection;
        if (b !== max) b += (max - b) * saturationCorrection;
        
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

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


// # ## Vibrance
// # Similar to saturation, but adjusts the saturation levels in a slightly smarter, more subtle way. 
// # Vibrance will attempt to boost colors that are less saturated more and boost already saturated
// # colors less, while saturation boosts all colors by the same level.
// #
// # ### Arguments
// # Range is -100 to 100. Values < 0 will desaturate the image while values > 0 will saturate it.
// # **If you want to completely desaturate the image**, using the greyscale filter is highly 
// # recommended because it will yield better results.
export async function changeAndSaveVibrance(
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
    
    const vibranceCorrection = value * -1;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        // Calculate the maximum color value among red, green, and blue
        const max = Math.max(r, g, b);

        // Calculate the average color value
        const avg = (r + g + b) / 3;

        // Calculate the vibrance adjustment amount
        const amt = ((Math.abs(max - avg) * 2 / 255) * vibranceCorrection) / 100;

        // Apply vibrance adjustment to each color channel
        if (r !== max) r += (max - r) * amt;
        if (g !== max) g += (max - g) * amt;
        if (b !== max) b += (max - b) * amt;

        // Ensure the color values stay within the 0-255 range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));


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
//from caman using luminance and to use this just call the function
// # ## Greyscale
// # An improved greyscale function that should make prettier results
// # than simply using the saturation filter to remove color. It does so by using factors
// # that directly relate to how the human eye perceves color and values. There are
// # no arguments, it simply makes the image greyscale with no in-between.
// #
// # Algorithm adopted from http://www.phpied.com/image-fun/
export async function changeAndSaveGreyScale(
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
// # ## Contrast
// # Increases or decreases the color contrast of the image.
// #
// # ### Arguments
// # Range is -100 to 100. Values < 0 will decrease contrast while values > 0 will increase contrast.
// # The contrast adjustment values are a bit sensitive. While unrestricted, sane adjustment values 
// # are usually around 5-10.
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

    const contrastFactor = Math.pow((value + 100) / 100, 2);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;

        // Apply contrast adjustment to each color channel
        r = (r / 255 - 0.5) * contrastFactor + 0.5;
        g = (g / 255 - 0.5) * contrastFactor + 0.5;
        b = (b / 255 - 0.5) * contrastFactor + 0.5;

        // Ensure the color values stay within the 0-255 range
        r = Math.min(255, Math.max(0, r * 255));
        g = Math.min(255, Math.max(0, g * 255));
        b = Math.min(255, Math.max(0, b * 255));
        
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


// # ## Hue
// # Adjusts the hue of the image. It can be used to shift the colors in an image in a uniform 
// # fashion. If you are unfamiliar with Hue, I recommend reading this 
// # [Wikipedia article](http://en.wikipedia.org/wiki/Hue).
// #
// # ### Arguments
// # Range is 0 to 100
// # Sometimes, Hue is expressed in the range of 0 to 360. If that's the terminology you're used to, 
// # think of 0 to 100 representing the percentage of Hue shift in the 0 to 360 range.
export async function changeAndSaveHue(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    if (value > 100 || value < 0) {
      throw new Error("value must be between 0 or 100");
    }

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        let hsv = rgbToHsv(r, g, b);
        hsv.h *= 100
        hsv.h += 100
        hsv.h = hsv.h % 100
        hsv.h /= 100
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

//fixed
// # ## Gamma
// # Adjusts the gamma of the image.
// #
// # ### Arguments
// # Range is from 0 to infinity, although sane values are from 0 to 4 or 5.
// # Values between 0 and 1 will lessen the contrast while values greater than 1 will increase it.
export async function changeAndSaveGamma(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value > 10 || value < 0) {
    throw new Error("value must be between 0 and 10");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);


    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;

        // Apply gamma adjustment to each color channel
        r = Math.pow(r / 255, value) * 255;
        g = Math.pow(g / 255, value) * 255;
        b = Math.pow(b / 255, value) * 255;

        // Ensure the color values stay within the 0-255 range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
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


//not fixed yet
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

//fixed
// # ## Invert
// # Inverts all colors in the image by subtracting each color channel value from 255. No arguments.
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

//fixed
// # ## Sepia
// # Applies an adjustable sepia filter to the image.
// #
// # ### Arguments
// # Assumes adjustment is between 0 and 100, which represents how much the sepia filter is applied.
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
        let { r, g, b, a } = color;
        r = Math.min(255, (r * (1 - (0.607 * normalizedvalue))) + (g * (0.769 * normalizedvalue)) + (b * (0.189 * normalizedvalue)));
        g = Math.min(255, (r * (0.349 * normalizedvalue)) + (g * (1 - (0.314 * normalizedvalue))) + (b * (0.168 * normalizedvalue)));
        b = Math.min(255, (r * (0.272 * normalizedvalue)) + (g * (0.534 * normalizedvalue)) + (b * (1 - (0.869 * normalizedvalue))));

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
// # ## Noise
// # Adds noise to the image on a scale from 1 - 100. However, the scale isn't constrained, so you 
// # can specify a value > 100 if you want a LOT of noise.
export async function changeAndSaveNoise(
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

    const adjust = Math.abs(value) * 2.55;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        let {r, g, b, a} = color;
        // Generate random noise within the specified range for each channel
        const rand = Calculate.randomRange(adjust * -1, adjust);

        // Apply noise to each color channel
        r += rand;
        g += rand;
        b += rand;

        // Ensure the color values stay within the 0-255 range
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

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
// # ## Clip
// # Clips a color to max values when it falls outside of the specified range.
// #
// # ### Arguments
// # Supplied value should be between 0 and 100.
export async function changeAndSaveClip(
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

    const adjust = Math.abs(value) * 2.55;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        let {r, g, b, a} = color;
        // Clip the color values based on the adjustment factor
        if (r > 255 - adjust) {
          r = 255;
        } else if (r < adjust) {
          r = 0;
        }

        if (g > 255 - adjust) {
          g = 255;
        } else if (g < adjust) {
          g = 0;
        }

        if (b > 255 - adjust) {
          b = 255;
        } else if (b < adjust) {
          b = 0;
        }


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

//not fixed
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

//not fixed
export async function changeAndSaveBlacks(inputImagePath: string, outputImagePath:string, value:number) {
  if (value < -100 || value > 100) {
    throw new Error("value value must be between -100 and 100");
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const normalizedvalue = (value + 100) / 100;
    console.log(normalizedvalue);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let red = (r / 255) * normalizedvalue * 255;
        let green = (g / 255) * normalizedvalue * 255
        let blue = (b / 255) * normalizedvalue * 255;
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