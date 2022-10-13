/**
 * (C) 2015 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { loginmanager } from "./loginmanager.mjs";
import { router } from "/framework/js/router.mjs";
import { session } from "/framework/js/session.mjs";
import { securityguard } from "/framework/js/securityguard.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";

const APP_EXIT_FLAG = "__org_monkshu_app_exit";

async function init() {
	window.APP_CONSTANTS = (await import("./constants.mjs")).APP_CONSTANTS;
	window.LOG = (await import("/framework/js/log.mjs")).LOG;
	apiman.registerAPIKeys(APP_CONSTANTS.API_KEYS, APP_CONSTANTS.KEY_HEADER);
	if (!session.get($$.MONKSHU_CONSTANTS.LANG_ID)) session.set($$.MONKSHU_CONSTANTS.LANG_ID, "en");
	securityguard.setPermissionsMap(APP_CONSTANTS.PERMISSIONS_MAP);
	securityguard.setCurrentRole(securityguard.getCurrentRole() || APP_CONSTANTS.GUEST_ROLE);
}

async function main(page, desiredData) {
	await _addPageLoadInterceptors(); await _readConfig();
	const requesetedLocation = page || window.location.href;
	const decodedURL = new URL(page || router.decodeURL(window.location.href)), justURL = decodedURL.href.split("?")[0];
	console.log(page);
    console.log(justURL);

	if (session.get(APP_EXIT_FLAG)) {	// exit check, once exited, can't reload
		router.loadPage(APP_CONSTANTS.EXIT_HTML);	
		return;
	}
	if (justURL == APP_CONSTANTS.INDEX_HTML) router.loadPage(APP_CONSTANTS.REGISTER_HTML);
	else if (securityguard.isAllowed(justURL)) {
		if (router.getLastSessionURL() && (decodedURL.toString() == router.getLastSessionURL().toString())) router.reload();
		else router.loadPage(decodedURL.href, desiredData);
	} else router.loadPage(APP_CONSTANTS.REGISTER_HTML);

	if (session.get(APP_EXIT_FLAG)) {	// exit check, once exited, can't reload
		router.loadPage(APP_CONSTANTS.EXIT_HTML);	
		return;
	}


	// else route to what ever is requested.
	/*if (justURL == APP_CONSTANTS.INDEX_HTML) router.loadPage(APP_CONSTANTS.REGISTER_HTML);
	else if (securityguard.isAllowed(justURL)) {
		if (router.getLastSessionURL() && (decodedURL.toString() == router.getLastSessionURL().toString())) router.reload();
		else router.loadPage(decodedURL.href, desiredData);
	} else router.loadPage(APP_CONSTANTS.REGISTER_HTML);*/
}
const interceptPageLoadData = _ => router.addOnLoadPageData("*", async (data, _url) => {
	data.APP_CONSTANTS = APP_CONSTANTS;
	data.headers = await $$.requireText(APP_CONSTANTS.APP_PATH + "/conf/headers.html");
});

async function _readConfig() {
	const conf = await (await fetch(`${APP_CONSTANTS.APP_PATH}/conf/app.json`)).json();
	for (const key of Object.keys(conf)) APP_CONSTANTS[key] = conf[key];
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

export const application = { init, main, interceptPageLoadData, exit, loggedIn };
