/* 
 * (C) 2020 TekMonks. All rights reserved.
 */

const path = require("path");
const API_CONSTANTS = require(`${__dirname}/lib/constants.js`);
const util = require("util");
const fs = require("fs");
const readdirAsync = util.promisify(fs.readdir);
const statAsync = util.promisify(fs.stat);


exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug("Got getfiles request for path: " + jsonReq.path);

	const fullpath = path.resolve(`${API_CONSTANTS.FRONTEND_ROOT}/${jsonReq.path}`);
	if (!API_CONSTANTS.isSubdirectory(fullpath, API_CONSTANTS.FRONTEND_ROOT)) {LOG.error(`Subdir validation failure: ${jsonReq.path}`); return CONSTANTS.FALSE_RESULT;}

	try {
		let retObj = {entries:[], result: true};
		const entries = await readdirAsync(fullpath);
		for (const entry of entries) {
			let stats = await statAsync(`${fullpath}/${entry}`);
			stats.isFile()?stats.file=true:null; stats.isDirectory()?stats.directory=true:null; stats.isBlockDevice()?stats.blockDevice=true:null;
			stats.isCharacterDevice()?stats.characterDevice=true:null; stats.isSymbolicLink()?stats.symbolicLink=true:null; stats.isFIFO()?stats.FIFO=true:null; 
			stats.isSocket()?stats.socket=true:null;

			retObj.entries.push({name: entry, path: `${jsonReq.path}/${entry}`, stats});
		}
		return retObj;
	} catch (err) {LOG.error(`Error reading path: ${fullpath}, error is: ${err}`); return CONSTANTS.FALSE_RESULT;}
}

const validateRequest = jsonReq => (jsonReq && jsonReq.path);