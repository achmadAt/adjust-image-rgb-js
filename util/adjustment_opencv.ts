const loadOpenCV = require("./opencv_module.ts")
const Jimp = require("jimp")

class AdjustmentOpenCv {
  static async changeAndSaveBrightness(inputImagePath: string, outputImagePath: string, value: number) {
    let cv = await loadOpenCV()
    try {
      const image = await Jimp.read(inputImagePath);
      var src = cv.matFromImageData(image.bitmap);
      let dst = new cv.Mat();
      let alpha = 1 + value / 100; // Contrast control
      let beta = 0 + value; // Brightness control
      cv.addWeighted(src, alpha, src, 0, beta, dst);
      new Jimp({
        width: dst.cols,
        height: dst.rows,
        data: Buffer.from(dst.data),
      }).write(outputImagePath);

      src.delete();
      dst.delete();
      console.log('success');
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = AdjustmentOpenCv

