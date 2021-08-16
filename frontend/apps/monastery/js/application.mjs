/**
 * (C) 2015 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";

const APP_EXIT_FLAG = "__org_monkshu_app_exit";

async function init() {
	window.APP_CONSTANTS = (await import ("./constants.mjs")).APP_CONSTANTS;
	window.LOG = (await import ("/framework/js/log.mjs")).LOG;
	if (!session.get($$.MONKSHU_CONSTANTS.LANG_ID)) session.set($$.MONKSHU_CONSTANTS.LANG_ID, "en");
	securityguard.setPermissionsMap(APP_CONSTANTS.PERMISSIONS_MAP);
	securityguard.setCurrentRole(securityguard.getCurrentRole() || APP_CONSTANTS.GUEST_ROLE);	
}

async function main() {
	if (session.get(APP_EXIT_FLAG)) {	// exit check, once exited, can't reload
		router.loadPage(APP_CONSTANTS.EXIT_HTML);	
		return;
	}

	const location = window.location.href;
	if (!router.isInHistory(location) || !session.get(APP_CONSTANTS.USERID)) router.loadPage(APP_CONSTANTS.MAIN_HTML);
	else router.loadPage(location);
}

function exit() {
	session.set(APP_EXIT_FLAG, true);
	router.loadPage(APP_CONSTANTS.EXIT_HTML);
}

export const application = {init, main, exit};