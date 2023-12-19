import all from './opencv_4-8-0.js'
function loadOpenCV() {
  return new Promise<any>((resolve, reject) => {
    try {
      const cv = require("./opencv_4-8-0.js");
      resolve(cv)
    } catch (error) {
      console.log(error)
      reject(error);
    }
  });
}

module.exports = loadOpenCV;