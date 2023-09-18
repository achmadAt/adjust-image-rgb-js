import {
    changeAndSaveBlacks,
  changeAndSaveBrightnessLoop, changeAndSaveClip, changeAndSaveContrast, changeAndSaveExposure, changeAndSaveGamma, changeAndSaveHue, changeAndSaveNoise, changeAndSaveSaturationHSV, changeAndSaveSaturationRGB, changeAndSaveSepia, changeAndSaveShadow, changeAndSaveTemperature, changeAndSaveVibrance, changeAndSaveWhites,
} from './util/adjustment.ts';
// import Jimp from "jimp";
// import { writeFile } from "fs";
changeAndSaveClip('download.png', 'img10_edited.jpg', 0);

// async function Test(path) {
//     const image = await Jimp.read(path)
//     console.log(image, "data image")
//     const pixelColor = []
//     for (let y = 0; y< image.getWidth(); y++) {
//         for (let x = 0; x < image.getHeight(); x++) {
//             const pxColor = Jimp.intToRGBA(image.getPixelColor(x, y))
//             pixelColor.push(pxColor)
//         }
//     }
//     console.log(pixelColor, "data pixel rgba")
//     // writeFile("data.json", JSON.stringify(pixelColor), (err) => {
//     //     if (err) {
//     //         console.log(err)
//     //         return;
//     //     }
//     // })
// }

// Test("img10.jpg")
