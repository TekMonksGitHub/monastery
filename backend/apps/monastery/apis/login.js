/**
 * Logs a user in. 
 * (C) 2015 TekMonks. All rights reserved.
 */
const totp = require(`${APP_CONSTANTS.LIB_DIR}/totp.js`);
const userid = require(`${APP_CONSTANTS.LIB_DIR}/userid.js`);
const jwttokenmanager = APIREGISTRY.getExtension("JWTTokenManager");

exports.init = _ => {
	jwttokenmanager.addListener((event, object) => {
		if (event == "token_generated") try {
			const token = ("Bearer "+object.token).toLowerCase(); 
			const logins = CLUSTER_MEMORY.get("__org_monkshu_loginapp_logins") || {};
			logins[token] = {id: object.response.id, org: object.response.org, name: object.response.name, role: object.response.role}; 
			CLUSTER_MEMORY.set("__org_monkshu_loginapp_logins", logins);
		} catch (err) {LOG.error(`Could not init home for the user with ID ${object.response.id}, name ${object.response.name}, error was: ${err}`);}

		if (event == "token_expired") {
			const logins = CLUSTER_MEMORY.get("__org_monkshu_loginapp_logins") || {};
			const token = ("Bearer "+object.token).toLowerCase();
			delete logins[token]; CLUSTER_MEMORY.set("__org_monkshu_loginapp_logins", logins);
		}
	});
}
exports.doService = async jsonReq => {
	if (!validateRequest(jsonReq)) {LOG.error("Validation failure."); return CONSTANTS.FALSE_RESULT;}
	
	LOG.debug(`Got login request for ID ${jsonReq.id}`);

	const result = await userid.checkPWPH(jsonReq.id, jsonReq.pwph); 
        let org_name, products = [];
	if (result.result && result.approved) {	// perform second factor
		result.result = totp.verifyTOTP(result.totpsec, jsonReq.otp); ; 
		if (!result.result) LOG.error(`Bad OTP given for: ${result.user_id}.`);
                else result.tokenflag = true;
	} else if (result.result && (!result.approved)) { LOG.info(`User not approved, ${result.id}.`); result.result = false; }
	else LOG.error(`Bad PWPH, given for ID: ${jsonReq.user_id}.`);

        if (result.result && result.org_id) {
	const result1 = await userid.getOrgsMatching(result.org_name);
	if (result1.result) org_name = result1.org_name;
	const result2 = await userid.getOrgsMatchingProducts(result.org_id);
	if (result2 && result2.products && result2.products.length > 0) for (let product of result2.products) products.push(product.product_name);}


if (result.tokenflag) LOG.info(`User logged in: ${result.user_id}.`); else LOG.error(`Bad login for ID: ${jsonReq.id}.`);

	if (result.result) return { result: result.result, name: result.name, id: result.user_id, "org": org_name, role: result.role, "products": products,tokenflag: result.tokenflag };
	else return CONSTANTS.FALSE_RESULT;
}

exports.getID = headers => {
	if (!headers["authorization"]) return null; const logins = CLUSTER_MEMORY.get("__org_monkshu_loginapp_logins") || {};
	return logins[headers["authorization"].toLowerCase()]?logins[headers["authorization"].toLowerCase()].id:null;
}

exports.getOrg = headers => {
	if (!headers["authorization"]) return null; const logins = CLUSTER_MEMORY.get("__org_monkshu_loginapp_logins") || {};
	return logins[headers["authorization"].toLowerCase()]?logins[headers["authorization"].toLowerCase()].org:null;
}

exports.getRole = headers => {
	if (!headers["authorization"]) return null; const logins = CLUSTER_MEMORY.get("__org_monkshu_loginapp_logins") || {};
	return logins[headers["authorization"].toLowerCase()]?logins[headers["authorization"].toLowerCase()].role:null;
}

exports.isAdmin = headers => (exports.getRole(headers))?.toLowerCase() == "admin";

const validateRequest = jsonReq => (jsonReq && jsonReq.pwph && jsonReq.otp && jsonReq.id);
