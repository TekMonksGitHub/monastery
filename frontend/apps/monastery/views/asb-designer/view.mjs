/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {model} from "./model/model.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const MODULE_PATH = `${import.meta.url.substring(0,import.meta.url.lastIndexOf("/"))}`;
const COMPONENTS_NEEDED_BY_THE_VIEW_PAGE = ["dialog-box", "flow-diagram", "pluggable-ribbon"];
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_ADD_SHAPE = "ADD_SHAPE", 
    MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON", MSG_SHAPE_CLICKED = "SHAPE_CLICKED", GRAPH_ID = "flowui";
const PAGE_GENERATOR_GRID_ITEM_CLASS = "grid-item-extension", HTML_INPUT_ELEMENTS = ["input","select"];
const ID_CACHE = {};

async function init() {
    blackboard.registerListener(MSG_SHAPE_INIT, message => blackboard.broadcastMessage(MSG_REGISTER_SHAPE, 
        {...message, graphID: GRAPH_ID, rounded: true}));
    blackboard.registerListener(MSG_SHAPE_CLICKED_ON_RIBBON, message => blackboard.broadcastMessage(MSG_ADD_SHAPE, 
        {...message, graphID: GRAPH_ID, value:"", x:20, y:20, width:40, height:40}));
    blackboard.registerListener(MSG_SHAPE_CLICKED, message => _shapeObjectClickedOnFlowDiagram(message.name, message.id));

    for (const component of COMPONENTS_NEEDED_BY_THE_VIEW_PAGE) import (`./components/${component}/${component}.mjs`);

    const i18NForView = await import(`${MODULE_PATH}/page/i18n.mjs`); // merge the view's i18ns into the global i18n
    for (const lang in i18NForView.i18n) i18n.setI18NObject(lang, {...await i18n.getI18NObject(lang, true), ...i18NForView.i18n[lang]});
}

async function _shapeObjectClickedOnFlowDiagram(shapeName, id) {
    const pageFile = new URL(`${MODULE_PATH}/dialogs/dialog_${shapeName}.page`);
    let html = await page_generator.getHTML(pageFile);

    const savedDialogProperties = ID_CACHE[id]||{};
    // figure out IDs for all input items on the dialog and fill their defaults, if saved previously
    const dom = new DOMParser().parseFromString(html, "text/html"), items = dom.getElementsByClassName(PAGE_GENERATOR_GRID_ITEM_CLASS);
    const idsNeeded = []; for (const item of items) for (const child of item.childNodes) if (
        HTML_INPUT_ELEMENTS.includes(child.nodeName.toLowerCase()) && child.id ) {
            idsNeeded.push(child.id); 
            if (savedDialogProperties[child.id]) child.setAttribute("value", savedDialogProperties[child.id]);
    }
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    window.monkshu_env.components["dialog-box"].showDialog(`${MODULE_PATH}/dialogs/dialogPropertiesBottom.json`, 
        html, null, idsNeeded, (typeOfClose, result) => { if (typeOfClose == "submit") {
                ID_CACHE[id] = result;
                return model.modelModified(shapeName, id, result); 
            }
        }
    );
}

export const view = {init};