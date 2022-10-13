/* 
 * (C) 2015 TekMonks. All rights reserved.
 * See enclosed LICENSE file.
 */
const util = require("util");
const bcryptjs = require("bcryptjs");
const db = require(`${APP_CONSTANTS.LIB_DIR}/db.js`);
const getUserHash = async text => await (util.promisify(bcryptjs.hash))(text, 12);

exports.register = async (id, name, org, pwph, totpSecret, role, approved, domain) => {
	const existsID = await exports.existsID(id);
	if (existsID.result) return ({ result: false });
	const pwphHashed = await getUserHash(pwph);
	const created_at = new Date().toISOString();
	if (role == "admin") {
		const insertOrganization = await db.runCmd("INSERT INTO organizations (org_name) VALUES (?)", [org]);
		if (insertOrganization) {
			const rows = await db.getQuery("SELECT org_id FROM organizations  WHERE org_name = ? COLLATE NOCASE", [org]);
			console.log(rows[0]["org_id"]);
			if (rows && rows[0]) {
				const org_id = rows[0]["org_id"];
				let result = true;
				const noOfProducts = await db.getQuery(" SELECT COUNT(*) FROM products");
				if (noOfProducts && noOfProducts[0]["COUNT(*)"] && result) {
					for (i = 1; i <= noOfProducts[0]["COUNT(*)"]; i++) {
						result = await db.runCmd("INSERT INTO organizations_products (org_id,product_id) VALUES (?,?)", [org_id, i]);
					}
					console.log(JSON.stringify(await db.getQuery(" SELECT * FROM organizations_products")));
					return {
						result: await db.runCmd("INSERT INTO users_login (user_id, name, org_id, pwph, totpsec, role, approved, domain, created_at) VALUES (?,?,?,?,?,?,?,?,?)",
							[id, name, org_id, pwphHashed, totpSecret, role, approved ? 1 : 0, domain, created_at]), id, name, org_id, pwph: pwphHashed, totpsec: totpSecret, role, approved: approved ? 1 : 0, domain
					}
				};
			}
		}
	}

	else {
	const rows = await db.getQuery("SELECT org_id FROM organizations  WHERE org_name = ? COLLATE NOCASE", [org]);
	if (rows && rows[0]) {
		const org_id = rows[0]["org_id"];
		return {
			result: await db.runCmd("INSERT INTO users_login (user_id, name, org_id, pwph, totpsec, role, approved , domain,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
				[id, name, org_id, pwphHashed, totpSecret, role, approved ? 1 : 0, domain,created_at]), id, name, org_id, pwph: pwphHashed, totpsec: totpSecret, role, approved: approved ? 1 : 0, domain
		}

	}


}
}


exports.delete = async id => {
	const existsID = await exports.existsID(id);
	if (!existsID.result) return ({ result: false });

	return { result: await db.runCmd("DELETE FROM users_login where id = ?", [id]) };
}

exports.update = async (oldid, id, name, org, pwph, totpSecret, role, approved, domain) => {
	const pwphHashed = await getUserHash(pwph);
	return {
		result: await db.runCmd("UPDATE users_login SET id=?, name=?, org=?, pwph=?, totpsec=?, role = ?, approved = ?, domain = ? WHERE id=?",
			[id, name, org, pwphHashed, totpSecret, role, approved ? 1 : 0, oldid]), oldid, id, name, org, pwph, totpSecret, role, approved, domain
	};
}

exports.checkPWPH = async (id, pwph) => {
	const idEntry = await exports.existsID(id); if (!idEntry.result) return { result: false }; else delete idEntry.result;
	return { result: await (util.promisify(bcryptjs.compare))(pwph, idEntry.pwph), ...idEntry };
}

exports.getTOTPSec = exports.existsID = async id => {
	const rows = await db.getQuery("SELECT * FROM users_login WHERE user_id = ? COLLATE NOCASE", [id]);
	if (rows && rows.length) return { result: true, ...(rows[0]) }; else return { result: false };
}

exports.changepwph = async (id, pwph) => {
	const pwphHashed = await getUserHash(pwph);
	return { result: await db.runCmd("UPDATE users_login SET pwph = ? WHERE id = ? COLLATE NOCASE", [pwphHashed, id]) };
}

exports.getUsersForOrg = async org => {
	const users = await db.getQuery("SELECT user_id FROM users_login INNER JOIN organizations WHERE organizations.org_name = ?", [org]);
	if (users && users.length) return { result: true, users }; else return { result: false };
}

exports.getOrgsMatching = async org => {
	const orgs = await db.getQuery("SELECT org_name FROM organizations WHERE org_name = ? COLLATE NOCASE", [org]);
	if (orgs && orgs.length) return { result: true, ...(orgs[0]) }; else return { result: false, orgs: [] };
}

exports.getUsersForDomain = async domain => {
	const users = await db.getQuery("SELECT id, name, org, role, approved FROM users_login WHERE domain = ? COLLATE NOCASE", [domain]);
	if (users && users.length) return { result: true, users }; else return { result: false };
}
exports.getOrgsMatchingOnName = async org => {
	const orgs = await db.getQuery("SELECT org_name FROM organizations WHERE org_name = ? COLLATE NOCASE", [org]);
	if (orgs && orgs.length) return { result: true, ...(orgs[0]) }; else return { result: false, orgs: [] };
}

exports.getOrgForDomain = async domain => {
	const users = await db.getQuery("SELECT org FROM users_login WHERE domain = ? COLLATE NOCASE", [domain]);
	if (users && users.length) return users[0].org; else return null;
}
exports.getOrgsMatchingProducts = async org => {
	const products = await db.getQuery("SELECT product_name from products WHERE product_id IN ( SELECT product_id from organizations_products WHERE org_id = ?)", [org]);
	if (products && products.length) return { result: true, products }; else return { result: false, products: [] };
}

exports.getProducts = async _ => {
	const products = await db.getQuery("SELECT product_name from products ");
	if (products && products.length) return { result: true, products }; else return { result: false, products: [] };
}

exports.approve = async id => {
	return { result: await db.runCmd("UPDATE users_login SET approved=1 WHERE id=?", [id])}
};
