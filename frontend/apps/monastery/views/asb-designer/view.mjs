/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {i18n} from "/framework/js/i18n.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const MODULE_PATH = util.getModulePath(import.meta);
const COMPONENTS_NEEDED_BY_THE_VIEW_PAGE = ["dialog-box", "flow-diagram", "pluggable-ribbon"];
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_ADD_SHAPE = "ADD_SHAPE", 
    MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON", MSG_SHAPE_CLICKED = "SHAPE_CLICKED", 
    MSG_SHAPE_REMOVED = "SHAPE_REMOVED", MSG_SHAPES_DISCONNECTED = "SHAPES_DISCONNECTED", 
    MSG_SHAPES_CONNECTED = "SHAPES_CONNECTED", MSG_VALIDATE_CONNECTION = "VALIDATE_FLOW_CONNECTION", 
    MSG_LABEL_CHANGED = "LABEL_CHANGED", MSG_CONNECT_SHAPES = "CONNECT_SHAPES", MSG_LABEL_SHAPE = "LABEL_SHAPE", 
    MSG_MODEL_CONNECT_NODES = "CONNECT_NODES", MSG_MODEL_LABEL_NODE = "LABEL_NODE", MSG_MODEL_ADD_NODE = "ADD_NODE", 
    MSG_MODEL_NODES_MODIFIED = "NODES_MODIFIED", MSG_MODEL_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED", 
    MSG_MODEL_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_MODEL_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    GRAPH_ID = "flowui", MODEL_OP_ADDED = "added", MODEL_OP_REMOVED = "removed";
const PAGE_GENERATOR_GRID_ITEM_CLASS = "grid-item-extension", HTML_INPUT_ELEMENTS = ["input","select"];
const ID_CACHE = {};

async function init() {
    blackboard.registerListener(MSG_SHAPE_INIT, message => blackboard.broadcastMessage(MSG_REGISTER_SHAPE, 
        {name: message.name, svg: message.svg, graphID: GRAPH_ID, rounded: true}));
    blackboard.registerListener(MSG_SHAPE_CLICKED_ON_RIBBON, message => shapeAdded(message.name, message.id));
    blackboard.registerListener(MSG_SHAPE_CLICKED, message => _shapeObjectClickedOnFlowDiagram(message.name, message.id));
    blackboard.registerListener(MSG_SHAPE_REMOVED, message => blackboard.broadcastMessage(MSG_MODEL_NODES_MODIFIED,
        {type: MODEL_OP_REMOVED, nodeName: message.name, id: message.id}));
    blackboard.registerListener(MSG_SHAPES_CONNECTED, message => blackboard.broadcastMessage(MSG_MODEL_CONNECTORS_MODIFIED,
        {type: MODEL_OP_ADDED, sourceNode: message.sourceName, targetNode: message.targetName, 
            sourceID: message.sourceID, targetID: message.targetID}));
    blackboard.registerListener(MSG_SHAPES_DISCONNECTED, message => blackboard.broadcastMessage(MSG_MODEL_CONNECTORS_MODIFIED,
        {type: MODEL_OP_REMOVED, sourceNode: message.sourceName, targetNode: message.targetName, 
            sourceID: message.sourceID, targetID: message.targetID}));
    blackboard.registerListener(MSG_VALIDATE_CONNECTION, message => _validateConnection(message), true);
    blackboard.registerListener(MSG_LABEL_CHANGED, message => blackboard.broadcastMessage(MSG_MODEL_NODE_DESCRIPTION_CHANGED,
        {nodeName: message.name, id: message.id, description: message.label}));
    blackboard.registerListener(MSG_MODEL_CONNECT_NODES, message => blackboard.broadcastMessage(MSG_CONNECT_SHAPES, 
        {graphID: GRAPH_ID, sourceid: message.sourceid, targetid: message.targetid, labelid: message.labelid, label: message.label}));
    blackboard.registerListener(MSG_MODEL_LABEL_NODE, message => blackboard.broadcastMessage(MSG_LABEL_SHAPE, 
        {graphID: GRAPH_ID, shapeid: message.shapeid, label: message.label}));
    blackboard.registerListener(MSG_MODEL_ADD_NODE, message => blackboard.broadcastMessage(MSG_ADD_SHAPE, 
        {name: message.nodeName, id: message.id, graphID: GRAPH_ID, label:message.label, x:20, y:20, width:40, height:40})); 

    for (const component of COMPONENTS_NEEDED_BY_THE_VIEW_PAGE) import (`./components/${component}/${component}.mjs`);

    const i18NForView = await import(`${MODULE_PATH}/page/i18n.mjs`); // merge the view's i18ns into the global i18n
    for (const lang in i18NForView.i18n) i18n.setI18NObject(lang, {...await i18n.getI18NObject(lang, true), ...i18NForView.i18n[lang]});
}

function shapeAdded(shapeName, id) {
    blackboard.broadcastMessage(MSG_ADD_SHAPE, {name: shapeName, id, graphID: GRAPH_ID, label:"", 
        x:20, y:20, width:40, height:40});  // add to the flow diagram
    blackboard.broadcastMessage(MSG_MODEL_NODES_MODIFIED, {type: MODEL_OP_ADDED, nodeName: shapeName, id, properties: {}}); // add to the model
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
                ID_CACHE[id] = result; const listeners = blackboard.getListeners(MSG_MODEL_NODES_MODIFIED); // inform model
                for (const listener of listeners) if (!listener({type: MODEL_OP_ADDED, nodeName: shapeName, id, properties: result})) return false;
                return true;
            }
        }
    );
}

function _validateConnection(message) {
    const validators = blackboard.getListeners(MSG_MODEL_ARE_NODES_CONNECTABLE); 
    for (const validator of validators) if (!validator({sourceName: message.sourceName, targetName: message.targetName, 
        sourceID: message.sourceID, targetID: message.targetID})) return false;
    return true;
}

export const view = {init};