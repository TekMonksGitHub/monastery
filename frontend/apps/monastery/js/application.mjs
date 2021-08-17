/**
 * (C) 2015 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {loginmanager} from "./loginmanager.mjs";
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

async function main(page) {
	if (session.get(APP_EXIT_FLAG)) {	// exit check, once exited, can't reload
		router.loadPage(APP_CONSTANTS.EXIT_HTML);	
		return;
	}

	if (securityguard.getCurrentRole() != APP_CONSTANTS.USER_ROLE) {
		router.loadPage(APP_CONSTANTS.LOGIN_HTML);
		return;
	}

	const location = page||window.location.href;
	router.loadPage(location);
}

function loggedIn() {
	main(APP_CONSTANTS.CHOOSER_HTML);
}

function exit() {
	loginmanager.logout();
	session.set(APP_EXIT_FLAG, true);
	router.loadPage(APP_CONSTANTS.EXIT_HTML);
}

export const application = {init, main, exit, loggedIn};