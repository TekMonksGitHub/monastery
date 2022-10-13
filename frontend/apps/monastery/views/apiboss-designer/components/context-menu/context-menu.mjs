/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), MENU_BREAK_INDICATOR = "menubreak";

/**
 * Element was rendered
 * @param element Host element
 */
async function elementRendered(element) {
	const data = context_menu.getData(element.id)||{}, shadowRoot = context_menu.getShadowRootByHost(element);
	if (data.htmlContent) {	// run any contained JS scripts
		const domHTMLContent = new DOMParser().parseFromString(data.htmlContent, "text/html").documentElement;
		router.runShadowJSScripts(domHTMLContent, shadowRoot);
	}
}

/**
 * Shows the given menu.
 * @param hostID The host ID of the context-menu element which should be used to display this menu
 * @param contentOrMenuItems The menuitems, can be HTML string or an object of menuitmes of format -> 
 *                  {"text to display":function() {function called when clicked}}
 * @param x The X coordinates (pageX) where to display the menu
 * @param y The Y coordinates (pageY) where to display the menu
 * @param adjustX Any adjustment to make for the menu X coordinates (e.g. shift right by 5px or -5px)
 * @param adjustY Any adjustment to make for the menu Y coordinates (e.g. shift top by 5px or -5px)
 * @param data Any additional data to pass to the HTML renderer
 */
async function showMenu(hostID, contentOrMenuItems, x, y, adjustX, adjustY, data) {
	const isMenuHTML = typeof contentOrMenuItems == "string", formattedMenuItems = []; 

	const menuObject = {}; if (!isMenuHTML) {
		const memory = context_menu.getMemory(hostID);
		memory.menuFunctions = {}; let functionIndex = 0; for (const menuText in contentOrMenuItems) {
			memory.menuFunctions[functionIndex] = {function: contentOrMenuItems[menuText]};
			if (menuText != MENU_BREAK_INDICATOR) formattedMenuItems.push({menuentry: {displayText:menuText, functionID: functionIndex++}});
			else formattedMenuItems.push({menubreak: true});
		}; 
		
		// add cancellation menu item
		formattedMenuItems.push({menubreak: true});
		memory.menuFunctions[functionIndex] = {function: _=>{}}; 
		formattedMenuItems.push({menuentry: {displayText:await i18n.get("Cancel"), functionID: functionIndex}});
		menuObject.items = formattedMenuItems;
	} else menuObject.htmlContent = await router.expandPageData(contentOrMenuItems, undefined, {...data, hostID});

	const positioner = context_menu.getShadowRootByHostId(hostID).querySelector("div#positioner"), 
		positionerRect = positioner.getBoundingClientRect(), yAdjusted = y-positionerRect.y+adjustY||0, xAdjusted = x-positionerRect.x+adjustX||0;
		
	const cloneData = {...data}; if (cloneData.styleBody) delete cloneData.styleBody; const host = context_menu.getHostElementByID(hostID);
	const styleBody = `<style>${host.getAttribute("styleBody")||""}\ndiv#menu {top:${yAdjusted}px; left:${xAdjusted}px; border-width:1px}\n${data?.styleBody||""}</style>`;
	const dataForMenu = {...menuObject, ...cloneData, styleBody};
	
	window.addEventListener("click", function(_) {window.removeEventListener("click", this); hideMenu(hostID);})
	context_menu.bindData(dataForMenu, hostID); 
}

/**
 * Called when menu clicked. Internal function don't call directly.
 * @param containedElement The contained element which caused this event
 * @param functionIndex The function index of the function to call.
 */
async function menuClicked(containedElement, functionIndex) {
	const memory = context_menu.getMemoryByContainedElement(containedElement);
	await hideMenu(context_menu.getHostElementID(containedElement));

	if (memory.menuFunctions[functionIndex]) setTimeout(_=>memory.menuFunctions[functionIndex].function(),1);	// ensures menu is hidden before action is called :)
}

/**
 * Hides the context menu
 * @param hostID The host ID of the context menu element.
 */
async function hideMenu(hostID) {
	const dataForMenu = {}; await context_menu.bindData(dataForMenu, hostID); 
}

// convert this all into a WebComponent so we can use it
export const context_menu = {trueWebComponentMode: true, showMenu, menuClicked, hideMenu, elementRendered}
monkshu_component.register("context-menu", `${COMPONENT_PATH}/context-menu.html`, context_menu);