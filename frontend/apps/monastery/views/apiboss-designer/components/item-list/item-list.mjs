/**
 * A component to hold and display a list of items.
 * Item format is {id, img, label}. 
 * 
 * Value attribute returns or expects an array of items in the format
 * listed above.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "./item-list.i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {i18n as i18nFramework} from "/framework/js/i18n.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";
import {router} from "/framework/js/router.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>JSON.stringify(item_list.getData(element.id).items), 
		set: value=>{
			const newData = item_list.getData(element.id); newData.items = _addDBLClickHandlerToItems(JSON.parse(value), element.getAttribute("ondblclickHandler"));
			item_list.bindData(newData, element.id) } });
	const data = { items: _addDBLClickHandlerToItems(JSON.parse(element.getAttribute("value")||await window.monkshu_env['ITEMS'].getItemList() ? await window.monkshu_env['ITEMS'].getItemList() : "[]"), element.getAttribute("ondblclickHandler")), 
		styleBody: element.getAttribute("styleBody")?`<style>${element.getAttribute("styleBody")}</style>`:undefined,
		label: element.getAttribute("label")||i18n.DefaultLabel[i18nFramework.getSessionLang()] }
	item_list.setDataByHost(element, data);
}

function _addDBLClickHandlerToItems(items, ondblclick) {
	if (!ondblclick) return;
	for (const item of items) item.ondblclick = ondblclick;
	return items;
}
function openClicked() {
	 router.loadPage(`${APP_CONSTANTS.DEVELOPER_HTML}?view=apiboss-designer`);
}

export const item_list = {trueWebComponentMode: true, elementConnected,openClicked};
monkshu_component.register("item-list", `${COMPONENT_PATH}/item-list.html`, item_list);