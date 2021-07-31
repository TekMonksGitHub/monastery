/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), MENU_BREAK_INDICATOR = "menubreak";

/**
 * Shows the given menu.
 * @param hostID The host ID of the context-menu element which should be used to display this menu
 * @param menuItems The object of menuitmes of format -> {"text to display":function() {function called when clicked}}
 * @param x The X coordinates (pageX) where to display the menu
 * @param y The Y coordinates (pageY) where to display the menu
 * @param adjustX Any adjustment to make for the menu X coordinates (e.g. shift right by 5px or -5px)
 * @param adjustY Any adjustment to make for the menu Y coordinates (e.g. shift top by 5px or -5px)
 * @param data Any additional data to pass to the HTML renderer
 */
async function showMenu(hostID, menuItems, x, y, adjustX, adjustY, data) {
	const memory = context_menu.getMemory(hostID); memory.menuFunctions = {};
	let functionIndex = 0; const formattedMenuItems = []; for (const menuText in menuItems) {
		memory.menuFunctions[functionIndex] = {function: menuItems[menuText]};
		if (menuText != MENU_BREAK_INDICATOR) formattedMenuItems.push({menuentry: {displayText:menuText, functionID: functionIndex++}});
		else formattedMenuItems.push({menubreak: true});
	}; 
	
	// add cancellation menu item
	formattedMenuItems.push({menubreak: true});
	memory.menuFunctions[functionIndex] = {function: _=>{}}; 
	formattedMenuItems.push({menuentry: {displayText:await i18n.get("Cancel"), functionID: functionIndex}});

	const positioner = context_menu.getShadowRootByHostId(hostID).querySelector("div#positioner"), 
		positionerRect = positioner.getBoundingClientRect(), yAdjusted = y-positionerRect.y+adjustY||0, xAdjusted = x-positionerRect.x+adjustX||0;
		
	const cloneData = {...data}; if (cloneData.styleBody) delete cloneData.styleBody;
	const dataForMenu = {items:formattedMenuItems, ...cloneData, styleBody:`<style>div#menu {top:${yAdjusted}px; left:${xAdjusted}px; border-width:1px}\n${data?.styleBody||""}</style>`};
	
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
export const context_menu = {trueWebComponentMode: true, showMenu, menuClicked, hideMenu}
monkshu_component.register("context-menu", `${COMPONENT_PATH}/context-menu.html`, context_menu);