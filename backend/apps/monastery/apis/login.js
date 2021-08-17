/**
 * (C) 2020 TekMonks. All rights reserved.
 *
 * Monastery login
 */
const fspromises = require("fs").promises; 
const cryptMod = require(CONSTANTS.LIBDIR+"/crypt.js");
const LOGIN_REG_DISTM_KEY = "__org_monkshu_loginregistry_key";
const USERS_JSON = `${APP_CONSTANTS.MONASTERY.CONF_DIR}/users.json`;

exports.doService = async jsonReq => {
	if (jsonReq && (!jsonReq.op)) jsonReq.op = "login";
	if (!validateRequest(jsonReq)) {LOG.error(`Bad login request ${jsonReq?JSON.stringify(jsonReq):"null"}.`); return CONSTANTS.FALSE_RESULT;}

	const loginReg = CLUSTER_MEMORY.get(LOGIN_REG_DISTM_KEY) || JSON.parse(await fspromises.readFile(USERS_JSON));
	if (!CLUSTER_MEMORY.get(LOGIN_REG_DISTM_KEY)) CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);

	let result = false;
	if (jsonReq.op.toLowerCase() == "add") result = await _addUser(jsonReq.id, jsonReq.pw, jsonReq.org, jsonReq.name, jsonReq.role, loginReg);
	else if (jsonReq.op.toLowerCase() == "delete") result = await _deleteUser(jsonReq.id, loginReg);
	else if (jsonReq.op.toLowerCase() == "login") result = _loginUser(jsonReq.id, jsonReq.pw, loginReg);
	else if (jsonReq.op.toLowerCase() == "changepw") result = await _changeUserPw(jsonReq.id, jsonReq.oldpw, jsonReq.newpw, loginReg);
	else {LOG.error(`Unkown ID operation in request: ${jsonReq?JSON.stringify(jsonReq):"null"}.`); return CONSTANTS.FALSE_RESULT;};

	if (result) return {result:result, ...loginReg[jsonReq.id]}; else return CONSTANTS.FALSE_RESULT;
}

const _loginUser = (id, pw, loginReg) => (loginReg[id] && cryptMod.decrypt(loginReg[id].pw) == pw);

async function _addUser(id, pw, org, name, role, loginReg) {
	if (loginReg[id]) {LOG.error(`ID ${id} to be added already exists.`); return false;} else loginReg[id] = {pw: cryptMod.encrypt(pw), org, name, role};
	await fspromises.writeFile(USERS_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

async function _deleteUser(id, loginReg) {
	if (!loginReg[id]) {LOG.error(`ID ${id} to be deleted doesn't exist.`); return false;} else delete loginReg[id];
	await fspromises.writeFile(USERS_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

async function _changeUserPw(id, oldpw, newpw, loginReg) {
	if (!_loginUser(id, oldpw, loginReg)) {LOG.error(`ID ${id}, bad old password for change request.`); return false;}
	loginReg[id].pw = cryptMod.encrypt(newpw);
	await fspromises.writeFile(USERS_JSON, JSON.stringify(loginReg, null, 4));
	CLUSTER_MEMORY.set(LOGIN_REG_DISTM_KEY, loginReg);
	return true;
}

const validateRequest = jsonReq => jsonReq && jsonReq.id && ( 
	(jsonReq.op.toLowerCase() == "login" && jsonReq.pw) || 
	jsonReq.op.toLowerCase() == "delete" ||
	(jsonReq.op.toLowerCase() == "changepw" && jsonReq.oldpw && jsonReq.newpw) ||
	(jsonReq.op.toLowerCase() == "add" && jsonReq.org && jsonReq.pw && jsonReq.name && jsonReq.role) );