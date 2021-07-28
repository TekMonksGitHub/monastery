/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);

/**
 * 
 * @param hostID The host ID of the context-menu element which should be used to display this menu
 * @param menuItems The object of menuitmes of format -> {"text to display":function() {function called when clicked}}
 * @param x The X coordinates (pageX) where to display the menu
 * @param y The Y coordinates (pageY) where to display the menu
 * @param data Any additional data to pass to the HTML renderer
 */
async function showMenu(hostID, menuItems, x, y, data) {
	const memory = context_menu.getMemory(hostID); memory.menuFunctions = {};
	let functionIndex = 0; const formattedMenuItems = []; for (const menuText in menuItems) {
		memory.menuFunctions[functionIndex] = {function: menuItems[menuText]};
		formattedMenuItems.push({displayText:menuText, functionID: functionIndex++});
	}

	const cloneData = {...data}; delete cloneData.styleBody;
	const dataForMenu = {items:formattedMenuItems, ...cloneData, styleBody:`<style>ul {top:${x}; left:${y};}\n${data.styleBody||""}</style>`};
	_displayMenu(hostID); context_menu.bindData(dataForMenu, hostID);
}

function menuClicked(containedElement, functionIndex) {
	const memory = context_menu.getMemoryByContainedElement(containedElement);
	memory.menuFunctions[functionIndex].function();
	_hideMenu(containedElement);
}

const _displayMenu = hostID => context_menu.getHostElementByID(hostID).style.display = "block";
const _hideMenu = containedElement => context_menu.getHostElement(containedElement).style.display = "none";

// convert this all into a WebComponent so we can use it
export const context_menu = {trueWebComponentMode: true, showMenu, menuClicked}
monkshu_component.register("context-menu", `${COMPONENT_PATH}/context-menu.html`, context_menu);