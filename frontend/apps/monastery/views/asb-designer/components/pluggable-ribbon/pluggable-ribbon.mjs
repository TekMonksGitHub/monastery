/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {session} from "/framework/js/session.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const API_GETFILES = APP_CONSTANTS.BACKEND+"/apps/"+APP_CONSTANTS.APP_NAME+"/getfiles";
const COMPONENT_PATH = util.getModulePath(import.meta);

async function elementConnected(element) {
    const data = await _instantiatePlugins(element);

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;

	if (element.getAttribute("ribbonTitle")) data.ribbonTitle = element.getAttribute("ribbonTitle");
	
	if (element.id) {
		if (!pluggable_ribbon.datas) pluggable_ribbon.datas = {}; pluggable_ribbon.datas[element.id] = data;
	} else pluggable_ribbon.data = data;
}

async function elementRendered(element) {
	const shadowRoot = pluggable_ribbon.getShadowRootByHostId(element.id);
	for (const pluginName in pluggable_ribbon.extensions[element.id||"null"]) // attach shadowRoots to the plugins
		pluggable_ribbon.extensions[element.id||"null"][pluginName].shadowRoot = shadowRoot;
}

async function _instantiatePlugins(element) {
	const path = `${COMPONENT_PATH}/${element.id}`.substring(APP_CONSTANTS.APP_PATH.length);
	const resp = await apiman.rest(API_GETFILES, "GET", {path}, true); if (!resp.result) return;

	const data = {plugins:[]}; pluggable_ribbon.extensions = pluggable_ribbon.extensions||{}; pluggable_ribbon.extensions[element.id||"null"] = {};
	for (const plugin of resp.entries) {
		const moduleSrc = `${COMPONENT_PATH}/${element.id}/${plugin.name}/${plugin.name}.mjs`;
		const pluginModule = (await import(moduleSrc))[plugin.name]; 

		if (pluginModule && await pluginModule.init(`${COMPONENT_PATH}/${element.id}/${plugin.name}`)) {
			pluggable_ribbon.extensions[element.id][plugin.name] = pluginModule;
			data.plugins.push({img: pluginModule.getImage(), title: pluginModule.getHelpText(session.get($$.MONKSHU_CONSTANTS.LANG_ID)), 
				id: element.id||"null", pluginName: plugin.name, name: pluginModule.getDescriptiveName(session.get($$.MONKSHU_CONSTANTS.LANG_ID))});
		} else LOG.error(`Can't initialize plugin - ${plugin.name}`);
	}
	return data;
}

// convert this all into a WebComponent so we can use it
export const pluggable_ribbon = {trueWebComponentMode: true, elementConnected, elementRendered}
monkshu_component.register("pluggable-ribbon", `${COMPONENT_PATH}/pluggable-ribbon.html`, pluggable_ribbon);