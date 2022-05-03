const fs = require("fs")
const path = require("path");

const APP_ROOT = `${path.resolve(`${__dirname}/../`)}`;
exports.doService = async jsonReq => {
  if (jsonReq.modelObject) {
    const requiredPath = APP_ROOT + "/retmodel" + "/" + jsonReq.name + ".json";
    fs.writeFile(requiredPath, JSON.stringify(jsonReq.modelObject), (err) => {
      if (err) console.log(err) ;
      else console.log("File written successfully\n")

    })
    return true;
  }
  else return false;
  

}
