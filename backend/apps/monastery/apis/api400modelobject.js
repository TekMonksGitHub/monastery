const fs = require("fs")
const path = require("path");

const APP_ROOT = `${path.resolve(`${__dirname}/../`)}`;
exports.doService = async jsonReq => {
    let result;
    if (jsonReq.idOfPackageToOpen) {
        const requiredPath = APP_ROOT + "/retmodel" + "/" + jsonReq.idOfPackageToOpen + ".json";
        result = fs.readFileSync(requiredPath, { encoding: 'utf8', flag: 'r' });
    }
     
    return result;
}
