
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
import { i18n } from "./api-list.i18n.mjs";
import { util } from "/framework/js/util.mjs";
import { i18n as i18nFramework } from "/framework/js/i18n.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";


const COMPONENT_PATH = util.getModulePath(import.meta);



async function elementConnected(element) {
    Object.defineProperty(element, "value", {
        get: _ => JSON.stringify(api_list.getData(element.id).items),
        set: value => {
            const newData = api_list.getData(element.id); newData.items = _addClickHandlerToItems(JSON.parse(value), element.getAttribute("onclickHandler"));
            api_list.bindData(newData, element.id)
        }
    });
    const data = {
        items: _addClickHandlerToItems(JSON.parse(element.getAttribute("value") || await window.monkshu_env['ITEMS'].getItemList() ? await window.monkshu_env['ITEMS'].getItemList() : "[]"), element.getAttribute("onclickHandler")),
        styleBody: element.getAttribute("styleBody") ? `<style>${element.getAttribute("styleBody")}</style>` : undefined,
        label: element.getAttribute("label") || i18n.DefaultLabel[i18nFramework.getSessionLang()]
    }
    api_list.setDataByHost(element, data);
}

function _addClickHandlerToItems(items, onclick) {
    if (!onclick) return;
    for (const item of items) item.onclick = onclick;
    return items;
}
function openClicked(element, elementid) {
  window.monkshu_env.components["api-contents"].bindApiContents(elementid);
  window.monkshu_env.components["api-details"].updateExposedpathandMethod(elementid);
  window.monkshu_env.components["apiinput-apioutput"].bindApiInputOutputParameters(elementid);

}

export const api_list = { trueWebComponentMode: true, elementConnected, openClicked };
monkshu_component.register("api-list", `${COMPONENT_PATH}/api-list.html`, api_list);