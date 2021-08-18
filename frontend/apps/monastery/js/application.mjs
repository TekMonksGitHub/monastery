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
	await _addPageLoadInterceptors(); const requesetedLocation = page||window.location.href;

	if (session.get(APP_EXIT_FLAG)) {	// exit check, once exited, can't reload
		router.loadPage(APP_CONSTANTS.EXIT_HTML);	
		return;
	}

	if (securityguard.getCurrentRole() != APP_CONSTANTS.USER_ROLE) {	// not logged in must login
		router.loadPage(APP_CONSTANTS.LOGIN_HTML);
		return;
	}
	
	if (router.decodeURL(requesetedLocation) == APP_CONSTANTS.INDEX_HTML) { // logged in, so chooser if requesting index
		router.loadPage(APP_CONSTANTS.CHOOSER_HTML);
		return;
	}

	router.loadPage(requesetedLocation);	// else route to what ever is requested.
}

function loggedIn() {
	main(APP_CONSTANTS.CHOOSER_HTML);
}

function exit() {
	loginmanager.logout();
	session.set(APP_EXIT_FLAG, true);
	router.loadPage(APP_CONSTANTS.EXIT_HTML);
}

async function _addPageLoadInterceptors() {
	const interceptors = await $$.requireJSON(`${APP_CONSTANTS.APP_PATH}/conf/pageLoadInterceptors.json`);
	for (const interceptor of interceptors) {
		const modulePath = interceptor.module, functionName = interceptor.function;
		let module = await import(`${APP_CONSTANTS.APP_PATH}/${modulePath}`); module = module[Object.keys(module)[0]];
		await (module[functionName])();
	}
}

export const application = {init, main, exit, loggedIn};