import Jimp from "jimp";
import { rgbToHsv, hsvToRgb, getLuminance } from "./convert.ts";
import Calculate from "./calculate.ts";
import Curves from "./curve.ts";
import { ImageData } from "canvas";
import cv, { Mat } from "opencv-ts";

class Adjustment {
//fixed
// # ## Brightness
// # Simple brightness adjustment
// #
// # ### Arguments
// # Range is -100 to 100. Values < 0 will darken image while values > 0 will brighten.
static async changeAndSaveBrightnessLoop(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value > 100 || value < -100) {
    throw new Error('value must be between 100 or -100');
  }
  // for image brigthnes value from -100 to 100
  // const brightnessFactor = Math.floor((value / 100) * 255);
  // console.log(brightnessFactor);
  try {
    const image = await Jimp.read(inputImagePath);
    const { data, width, height } = image.bitmap;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    let src = cv.matFromImageData(imageData)
    let dst: Mat = new cv.Mat()
    let alpha = 1 + value / 200
    let beta = 0
    cv.convertScaleAbs(src, dst, alpha, beta)
    new Jimp({
      width: dst.cols,
      height: dst.rows,
      data: Buffer.from(dst.data),
    }).write(outputImagePath);
   

  } catch (error) {
    console.error('Error:', error);
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
static async changeAndSaveContrast(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value > 100 || value < -100) {
    throw new Error('value must be between -100 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const { data, width, height } = image.bitmap;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    let src = cv.matFromImageData(imageData)
    let dst: Mat = new cv.Mat()
    let alpha = 1 + (value / 100)
    let beta = 128 - alpha * 128
   cv.convertScaleAbs(src, dst, alpha, beta)
    new Jimp({
      width: dst.cols,
      height: dst.rows,
      data: Buffer.from(dst.data),
    }).write(outputImagePath);
   
    console.log(`Success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

//fixed
//using hsv technique value is -100 to 100
static async changeAndSaveSaturationHSV(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  value /= 200
  try {
    const image = await Jimp.read(inputImagePath);

    const { data, width, height } = image.bitmap;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    let src = cv.matFromImageData(imageData)
    let hsvImage = new cv.Mat();
    cv.cvtColor(src, hsvImage, cv.COLOR_BGR2HSV);
    // Loop through each pixel and adjust the saturation channel
    for (let i = 0; i < hsvImage.rows; i++) {
      for (let j = 0; j < hsvImage.cols; j++) {
        hsvImage.ucharPtr(i, j)[1] = Math.max(0, Math.min(255, hsvImage.ucharPtr(i, j)[1] * (1 + value)));
      }
    }
    let dst = new cv.Mat();
    cv.cvtColor(hsvImage, dst, cv.COLOR_HSV2BGR);
    new Jimp({
      width: dst.cols,
      height: dst.rows,
      data: Buffer.from(dst.data),
    }).write(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error('Error:', error);
  }
}



static async changeAndSaveHighlight(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < -100 || value > 100) {
    throw new Error("value value must be between -100 and 100");
  }
  try {
    value /= 800
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    const { data, width, height } = image.bitmap;
    const imageData = new ImageData(new Uint8ClampedArray(data), width, height);
    let src = cv.matFromImageData(imageData)
    let labImage = new cv.Mat()
    cv.cvtColor(src, labImage, cv.COLOR_BGR2Lab);
    for (let i = 0; i < labImage.rows; i++) {
      for (let j = 0; j < labImage.cols; j++) {
        labImage.ucharPtr(i, j)[0] = Math.max(0, Math.min(255, labImage.ucharPtr(i, j)[0] * (1 + value)));
      }
    }
    let dst = new cv.Mat();
    cv.cvtColor(labImage, dst, cv.COLOR_Lab2BGR);
    new Jimp({
      width: dst.cols,
      height: dst.rows,
      data: Buffer.from(dst.data),
    }).write(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

//fixed
// value from -100 to 100
static async changeAndSaveExposure(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < -100 || value > 100) {
    throw new Error('Exposure value must be between -100 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const exposureFactor = Math.pow(2, value / 30.5);
    console.log(exposureFactor)

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        r = Math.min(255, Math.max(0, Math.floor(r * exposureFactor)));
        g = Math.min(255, Math.max(0, Math.floor(g * exposureFactor)));
        b = Math.min(255, Math.max(0, Math.floor(b * exposureFactor)));

  
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
    console.error('Error:', error);
  }
}

//from caman js
// exposure
// value from -100 to 100
static async changeAndSaveExposureV2(
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

    const p = Math.abs(value) / 100;

    let ctrl1 = [0, 255 * p];
    let ctrl2 = [255 - (255 * p), 255];
    console.log(ctrl1)
    if (value < 0) {
      ctrl1 = ctrl1.reverse();
      ctrl2 = ctrl2.reverse();
    }
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let data = Curves.curvesToRgbf('rgb', [0, 0], ctrl1, ctrl2, [255, 255])({"r": r, "g": g, "b": b})
        r = Math.min(255, data.r)
        g = Math.min(255, data.g)
        b = Math.min(255, data.b)
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



// value from -100 to 100
// ## for sharpness using loop to applying the changes to buffer data
static async changeAndSaveSharpness(
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

    let sharpenKernel: number[][];
    value /= 50
    if (value === 0) {
      // If the value is 0, no change to the image
      sharpenKernel = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
    } else if (value > 0) {
      // If the value is positive, apply sharpening
      sharpenKernel = [ 
        [0, -0.5, 0],
        [-0.5, 3, -0.5],
        [0, -0.5, 0]
    ];
    } else {
      // If the value is negative, apply smoothing (blurring)
      sharpenKernel = [
        [0.1, 0.1, 0.1],
        [0.1, 0.2, 0.1],
        [0.1, 0.1, 0.1]
      ];
    }

    // Get the image data as a Buffer
    let imageData: Buffer = image.bitmap.data;

    // Width and height of the image
    const width: number = image.bitmap.width;
    const height: number = image.bitmap.height;
    // Apply the custom convolution filter to sharpen the image
    for (let i =0; i< Math.abs(value); i++) {
      let data = Calculate.convolution(imageData, sharpenKernel, width, height);
      imageData = data
    }
    image.bitmap.data = imageData
    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error("Error:", error);
  }
}

//for now the clarity is still using same technique with sharpness but without using loop
// because clarity is just changing the color/contrast inside the middle of raw buffer
// value from -100 to 100
static async changeAndSaveClarity(
  inputImagePath: string,
  outputImagePath: string,
  value: number
) {
  if (value < -100 || value > 100) {
    throw new Error("Exposure value must be between -100 and 100");
  }
  value
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    let clarityKernel: number[][];
    value /= 80
    if (value === 0) {
      // If the value is 0, no change to the image
      clarityKernel = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
      ];
    } else if (value > 0) {
      // If the value is positive, apply clarity
      clarityKernel = [ 
        [0 , -0.5, 0 + Math.abs(value) / 5],
        [-0.5 + Math.abs(value) / 50, 2.9, -0.5  + Math.abs(value) / 50],
        [0, -0.5, 0]
    ];
    } else {
      // If the value is negative, apply smoothing (blurring)
      clarityKernel = [
        [0.1, 0.1, 0.1],
        [0.1, 0.19 + Math.abs(value) / 50, 0.1],
        [0.1, 0.1, 0.1]
      ];
    }

    // Get the image data as a Buffer
    let imageData: Buffer = image.bitmap.data;

    // Width and height of the image
    const width: number = image.bitmap.width;
    const height: number = image.bitmap.height;
    // Apply the custom convolution filter to sharpen the image
    let data = Calculate.convolution(imageData, clarityKernel, width, height);
    imageData = data
    image.bitmap.data = imageData
    await image.writeAsync(outputImagePath);
    console.log(`Success`);
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
static async changeAndSaveSaturationRGB(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    if (value > 100 || value < -100) {
      throw new Error('value must be between 100 or -100');
    }

    // untuk menambah saturation dengan dikalikan dengan standar value untuk saturation
    const saturationCorrection = value * -0.01;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        let { r, g, b, a } = color;
        // mencari maximal value dari pixel r g b
        const max = Math.max(r, g, b);
        // jika pixel tidak sama dengan angka terbesar dari di antar r g b
        // maka pixel ditambah angkah maximal dari di antara r g b maka pixel tersebut di tambah hasil dari angak maximal dikurang pixel yang di kali dengan standard value dari saturasi correction
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
    console.error('Error:', error);
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
static async changeAndSaveVibrance(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    if (value > 100 || value < -100) {
      throw new Error('value must be between 100 or -100');
    }

    const vibranceCorrection = value * -1;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;

        // Calculate the maximum color value among red, green, and blue
        const max = Math.max(r, g, b);

        // Calculate the average color value
        const avg = (r + g + b) / 3;

        // Calculate the vibrance adjustment amount
        const amt =
          (((Math.abs(max - avg) * 2) / 255) * vibranceCorrection) / 100;

        // Apply vibrance adjustment to each color channel if pixel
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
    console.error('Error:', error);
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
static async changeAndSaveGreyScale(
  inputImagePath: string,
  outputImagePath: string,
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // get luminance of r g b pixel
        const avgRgb = getLuminance(r, g, b);

        // change the r gb pixel value with luminance to change it to grayscale
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
    console.error('Error:', error);
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
static async changeAndSaveHue(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    if (value > 100 || value < 0) {
      throw new Error('value must be between 0 or 100');
    }

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        // console.log(color)
        let hsv = rgbToHsv(r, g, b);
        hsv.h *= 100;
        hsv.h += value;
        hsv.h = hsv.h % 100;
        hsv.h /= 100;
        let data = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const newColor = Jimp.rgbaToInt(data.r, data.g, data.b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

//fixed
// # ## Gamma
// # Adjusts the gamma of the image.
// #
// # ### Arguments
// # Range is from 0 to infinity, although sane values are from 0 to 4 or 5.
// # Values between 0 and 1 will lessen the contrast while values greater than 1 will increase it.
static async changeAndSaveGamma(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value > 10 || value < 0) {
    throw new Error('value must be between 0 and 10');
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
    console.error('Error:', error);
  }
}


// ## Highlight
// value from -100 to 100
static calculateBrightness(r: number, g: number, b: number) {
  //  Calculate brightness as the weighted sum of color channels
  let brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness;
}

static clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

static isWhite(r: number, g: number, b : number) {
  const treshold = 170;
  if (r >= treshold && g >= treshold && b >= treshold){
    return true
  }
  
  return false
}

//fixed
// value param -50 to 50
static async changeAndSaveWhites(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value > 100 || value < -100) {
    throw new Error('value must be between -100 and 100');
  }
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let luminance = Adjustment.calculateBrightness(r,g,b)
        if (luminance > 200) {
          if (Adjustment.isWhite(r,g,b)) {
          
            r = Adjustment.clamp(r + (value / 5), 0, 255);
            g = Adjustment.clamp(g +  (value / 5), 0, 255);
            b = Adjustment.clamp(b +  (value / 5), 0, 255);
            const newColor = Jimp.rgbaToInt(r, g, b, a);
  
            image.setPixelColor(newColor, x, y);
          }
        }
        
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

//fixed
// # ## Invert
// # Inverts all colors in the image by subtracting each color channel value from 255. No arguments.
static async changeAndSaveInvert(
  inputImagePath: string,
  outputImagePath: string,
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
    console.error('Error:', error);
  }
}

//fixed
// # ## Sepia
// # Applies an adjustable sepia filter to the image.
// #
// # ### Arguments
// # Assumes adjustment is between 0 and 100, which represents how much the sepia filter is applied.
static async changeAndSaveSepia(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < 0 || value > 100) {
    throw new Error('value value must be between 0 and 100');
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
        r = Math.min(
          255,
          r * (1 - 0.607 * normalizedvalue) +
            g * (0.769 * normalizedvalue) +
            b * (0.189 * normalizedvalue),
        );
        g = Math.min(
          255,
          r * (0.349 * normalizedvalue) +
            g * (1 - 0.314 * normalizedvalue) +
            b * (0.168 * normalizedvalue),
        );
        b = Math.min(
          255,
          r * (0.272 * normalizedvalue) +
            g * (0.534 * normalizedvalue) +
            b * (1 - 0.869 * normalizedvalue),
        );

        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

//fixed
// # ## Noise
// # Adds noise to the image on a scale from 1 - 100. However, the scale isn't constrained, so you
// # can specify a value > 100 if you want a LOT of noise.
static async changeAndSaveNoise(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < 0 || value > 100) {
    throw new Error('value value must be between 0 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const adjust = Math.abs(value) * 2.55;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        let { r, g, b, a } = color;
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
    console.error('Error:', error);
  }
}



//fixed
// # ## Clip
// # Clips a color to max values when it falls outside of the specified range.
// #
// # ### Arguments
// # Supplied value should be between 0 and 100.
static async changeAndSaveClip(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < 0 || value > 100) {
    throw new Error('value value must be between 0 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    const adjust = Math.abs(value) * 2.55;
    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));
        let { r, g, b, a } = color;
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
    console.error('Error:', error);
  }
}

//fixed
// param value -100 to 100
static async changeAndSaveTemperature(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < -100 || value > 100) {
    throw new Error('value value must be between -100 and 100');
  }
 
  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        let red = r + value;
        let blue = b - value;
        r = Math.min(255, Math.max(0, red));
        b = Math.min(255, Math.max(0, blue));
        const newColor = Jimp.rgbaToInt(r, g, b, a);

        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// ## tint
// value from -100 to 100
static async changeAndSaveTint(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < -100 || value > 100) {
    throw new Error('value value must be between -100 and 100');
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
    console.error('Error:', error);
  }
}

// fixed
//param value -50 to 50
static async changeAndSaveShadow(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < -50 || value > 50) {
    throw new Error('value value must be between -100 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);
    const maxFactor = 200;

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const pixel = image.getPixelColor(x, y);
        const color = Jimp.intToRGBA(pixel);
        let { r, g, b, a } = color;
        const brightness = Adjustment.calculateBrightness(r, g, b);
        if (brightness < maxFactor) {
          r = Adjustment.clamp(r - value, 0, 255);
          g = Adjustment.clamp(g - value, 0, 255);
          b = Adjustment.clamp(b - value, 0, 255);
          
        }
        const newColor = Jimp.rgbaToInt(r, g, b, a);
        image.setPixelColor(newColor, x, y);
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error('Error:', error);
  }
}



static isBlacks(r: number, g: number, b : number) {
  const treshold = 170;
  if (r <= treshold && g <= treshold && b <= treshold){
    return true
  }
  
  return false
}

//fixed
// ## value param -50 to 50
static async changeAndSaveBlacks(
  inputImagePath: string,
  outputImagePath: string,
  value: number,
) {
  if (value < -50 || value > 50) {
    throw new Error('value value must be between -100 and 100');
  }

  try {
    // Read the input image using Jimp
    const image = await Jimp.read(inputImagePath);

    for (let x = 0; x < image.bitmap.width; x++) {
      for (let y = 0; y < image.bitmap.height; y++) {
        const color = Jimp.intToRGBA(image.getPixelColor(x, y));

        let { r, g, b, a } = color;
        
        let luminance = Adjustment.calculateBrightness(r,g,b)
        if (luminance < 170) {
          if (Adjustment.isBlacks(r,g,b)) {
          
            r = Adjustment.clamp(r - value, 0, 255);
            g = Adjustment.clamp(g - value, 0, 255);
            b = Adjustment.clamp(b - value, 0, 255);
            const newColor = Jimp.rgbaToInt(r, g, b, a);
  
            image.setPixelColor(newColor, x, y);
          }
        }
      }
    }

    await image.writeAsync(outputImagePath);
    console.log(`Success`);
  } catch (error) {
    console.error('Error:', error);
  }
}

}

export default Adjustment;