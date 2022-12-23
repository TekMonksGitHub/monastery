/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {session} from "/framework/js/session.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);

async function elementConnected(element) {
    const data = await _instantiatePlugins(element);

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;

	if (element.getAttribute("ribbonTitle")) data.ribbonTitle = element.getAttribute("ribbonTitle");
	if (element.getAttribute("ribbonLogo")) data.ribbonLogo = element.getAttribute("ribbonLogo");
	
	pluggable_ribbon_home.setData(element.id, data);
}

async function elementRendered(element) {
	const shadowRoot = pluggable_ribbon_home.getShadowRootByHostId(element.id);
	for (const pluginName in pluggable_ribbon_home.extensions[element.id||"null"]) // attach shadowRoots to the plugins
		pluggable_ribbon_home.extensions[element.id||"null"][pluginName].shadowRoot = shadowRoot;
}

async function _instantiatePlugins(element) {
	let plugins; try{plugins = await $$.requireJSON(`${COMPONENT_PATH}/${element.id}/pluginreg.json`);} catch (err) {LOG.error(`Can't read plugin registry, error is ${err}`); return {};};
	const data = {plugins:[]}; pluggable_ribbon_home.extensions = pluggable_ribbon_home.extensions||{}; pluggable_ribbon_home.extensions[element.id||"null"] = {};
	
	for (const plugin of plugins) {
		const moduleSrc = `${COMPONENT_PATH}/${element.id}/${plugin}/${plugin}.mjs`;
		console.log(moduleSrc);
		const pluginModule = (await import(moduleSrc))[plugin]; 
		console.log(pluginModule);
		if (pluginModule && await pluginModule.init(`${COMPONENT_PATH}/${element.id}/${plugin}`)) {
			pluggable_ribbon_home.extensions[element.id][plugin] = pluginModule;
			const pluginObj = {img: pluginModule.getImage(), title: pluginModule.getHelpText(session.get($$.MONKSHU_CONSTANTS.LANG_ID)), 
				id: element.id||"null", pluginName: plugin, name: pluginModule.getDescriptiveName(session.get($$.MONKSHU_CONSTANTS.LANG_ID)),
				pluginCursor: pluginModule.getCursor?pluginModule.getCursor():undefined};
			if (pluginModule.customEvents) {	// plug in custom event handlers if the plugin supports it
				pluginObj.customEvents = []; for (const event of pluginModule.customEvents) 
					pluginObj.customEvents.push({event, id: element.id||"null", pluginName: plugin}); 
			}
			data.plugins.push(pluginObj);
		} else LOG.error(`Can't initialize plugin - ${plugin}`);
	}
	return data;
}

// convert this all into a WebComponent so we can use it
export const pluggable_ribbon_home = {trueWebComponentMode: true, elementConnected, elementRendered}
monkshu_component.register("pluggable-ribbon-home", `${COMPONENT_PATH}/pluggable-ribbon-home.html`, pluggable_ribbon_home);