/**
 * A floating window Monkshu web component. 
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const DEFAULT_HOST_ID = "__org_monkshu_floating_window", COMPONENT_PATH = util.getModulePath(import.meta),
	DEFAULT_THEME = {};
let _pendingRenderResolves, hostIDNum = 0;

/**
 * Shows the window
 * @param themeOrThemePath The theme path or theme data as a JSON Object
 * @param templateOrTemplateURL The HTML template path as a URL object, or a string that contains HTML
 * @param templateData Data to pass to expand the template
 * @param hostID Optional: The ID to host the custom component inside the main HTML, only needed if default ID clashes
 */
async function showWindow(themeOrThemePath, templateOrTemplateURL, templateData, hostID=_generateNewHostID()) {
	await _initWindowFramework(hostID); 
	await floating_window.bindData(await _processTheme((typeof themeOrThemePath == "string" || themeOrThemePath instanceof URL) ?
		await $$.requireJSON(themeOrThemePath) : themeOrThemePath||DEFAULT_THEME), hostID );   // bind the theme data

	const shadowRoot = floating_window.getShadowRootByHostId(hostID);
	const templateHTML = typeof templateOrTemplateURL == "string" ? (templateData ? await router.expandPageData(
		templateOrTemplateURL, undefined, templateData) : templateOrTemplateURL) : await router.loadHTML(templateOrTemplateURL, templateData, false);
	const templateRoot = new DOMParser().parseFromString(templateHTML, "text/html").documentElement;
	router.runShadowJSScripts(templateRoot, shadowRoot);
	shadowRoot.querySelector("div#windowcontent").appendChild(templateRoot);    // add window content

	document.querySelector(`#${hostID}`).style.display = "block";   // show the window
	return hostID;
}

/**
 * Hides the Window
 * @param elementOrHostID The element inside the window or ID of the window host element
 */
function hideWindow(elementOrHostID) {
	const hostID = elementOrHostID instanceof Element ? floating_window.getHostElement(elementOrHostID).id : elementOrHostID;
	const hostElement = document.querySelector(`#${hostID}`); if (!hostElement) return;	// no such window open
	const windowHostElement = floating_window.getShadowRootByHostId(hostID).querySelector("div#windowcontent");
	while (windowHostElement && windowHostElement.firstChild) windowHostElement.removeChild(windowHostElement.firstChild);  // deletes everything
	document.body.removeChild(hostElement);
}

function elementRendered(_) {
    if (_pendingRenderResolves) {_pendingRenderResolves(); _pendingRenderResolves = null;}
}

function mouseDownOnHeader(event, element) {
	let prevX, prevY; 

	const mouseMovedTracker = e => {
		e.preventDefault(); const deltaX = e.pageX - prevX, deltaY = e.pageY - prevY; prevX = e.pageX; prevY = e.pageY;
		element.parentNode.style.top = `${element.parentNode.offsetTop+deltaY}px`; 
		element.parentNode.style.left = `${element.parentNode.offsetLeft+deltaX}px`; 
	}
	const mouseupTracker = e => {
		e.preventDefault();
		document.removeEventListener("mouseup", mouseupTracker);
		document.removeEventListener("mousemove", mouseMovedTracker);
	}

	event.preventDefault(); document.addEventListener("mouseup", mouseupTracker); 
	document.addEventListener("mousemove", mouseMovedTracker); prevX = event.pageX; prevY = event.pageY;
}

function _initWindowFramework(hostID) {
	const windowWebComponent = document.createElement("floating-window"); windowWebComponent.id=hostID; 
	windowWebComponent.style.display = "none"; document.body.appendChild(windowWebComponent);
	return new Promise(resolve => _pendingRenderResolves = resolve);
} 

async function _processTheme(theme) {
	const clone = JSON.parse(await router.expandPageData(JSON.stringify(theme)));
	const cssVars = [];
	for (const key in theme) if (key.startsWith("var--")) cssVars.push(`${key.substring(3)}: ${theme[key]}`);
	if (cssVars.length || theme.styleBody)
		clone.styleBody = `<style>${(theme.styleBody||"")}\n:host{${cssVars.join("; ")}}\ndiv#window{resize:${theme.notResizable?"none":"both"};}</style>`;
	clone.componentPath = util.getModulePath(import.meta);
	return clone;
}

const _generateNewHostID = _ => DEFAULT_HOST_ID+hostIDNum++;

export const floating_window = {showWindow, trueWebComponentMode: true, hideWindow, elementRendered, mouseDownOnHeader}
monkshu_component.register("floating-window", `${COMPONENT_PATH}/floating-window.html`, floating_window);