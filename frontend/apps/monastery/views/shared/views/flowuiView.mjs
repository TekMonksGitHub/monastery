/** 
 * View that implements message implementation for Flow-Diagram based views.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const IMG_SIZE = {width: 40, height: 40}, DEFAULT_DIALOG_PROPERTIES="dialogPropertiesBottom.json";
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_ADD_SHAPE = "ADD_SHAPE", 
    MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON", MSG_SHAPE_CLICKED = "SHAPE_CLICKED", 
    MSG_SHAPE_REMOVED = "SHAPE_REMOVED", MSG_SHAPES_DISCONNECTED = "SHAPES_DISCONNECTED", 
    MSG_SHAPES_CONNECTED = "SHAPES_CONNECTED", MSG_VALIDATE_CONNECTION = "VALIDATE_FLOW_CONNECTION", 
    MSG_LABEL_CHANGED = "LABEL_CHANGED", MSG_CONNECT_SHAPES = "CONNECT_SHAPES", MSG_LABEL_SHAPE = "LABEL_SHAPE", 
    MSG_MODEL_CONNECT_NODES = "CONNECT_NODES", MSG_MODEL_LABEL_NODE = "LABEL_NODE", MSG_MODEL_ADD_NODE = "ADD_NODE", 
    MSG_MODEL_NODES_MODIFIED = "NODES_MODIFIED", MSG_MODEL_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED", 
    MSG_MODEL_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_MODEL_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    MSG_MODEL_LOAD_MODEL = "LOAD_MODEL", MSG_RESET = "RESET", MSG_FILE_UPLOADED = "FILE_UPLOADED", GRAPH_ID = "flowui", MODEL_OP_ADDED = "added", 
    MODEL_OP_REMOVED = "removed", MODEL_OP_MODIFIED = "modified", MSG_SHAPE_MOVED = "SHAPE_MOVED";
const PAGE_GENERATOR_GRID_ITEM_CLASS = "grid-item-extension", HTML_INPUT_ELEMENTS = ["input","select",
    "textarea","spread-sheet","text-editor", "drag-drop","input-table","drop-down", "input-output-fields"];
let ID_CACHE = {}, CONF, VIEW_PATH;

const _generateShapeName = name => name.toLowerCase(), _generateShapeX = _ => 30, _generateShapeY = _ => 30;

async function init(viewPath) {
    VIEW_PATH = viewPath; CONF = await $$.requireJSON(`${VIEW_PATH}/conf/view.json`);

    blackboard.registerListener(MSG_SHAPE_INIT, message => blackboard.broadcastMessage(MSG_REGISTER_SHAPE, 
        {name: _generateShapeName(message.name), imgURL: message.imgURL, graphID: GRAPH_ID, rounded: true}));
    blackboard.registerListener(MSG_SHAPE_CLICKED_ON_RIBBON, message => shapeAdded(message.name, message.id, message.label, message.connectable));
    blackboard.registerListener(MSG_SHAPE_CLICKED, message => _shapeObjectClickedOnFlowDiagram(message.name, message.id, message.label));
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
        {graphID: GRAPH_ID, sourceID: message.sourceID, targetID: message.targetID, labelID: message.labelID, label: message.description}));
    blackboard.registerListener(MSG_MODEL_LABEL_NODE, message => blackboard.broadcastMessage(MSG_LABEL_SHAPE, 
        {graphID: GRAPH_ID, shapeid: message.shapeid, label: message.label}));
   
   blackboard.registerListener(MSG_MODEL_ADD_NODE, message => { ID_CACHE[message.id] = message.properties; 
        if (window.monkshu_env.NODE_REPOSITORY) window.monkshu_env.NODE_REPOSITORY.registerNode(message.description, message.nodeName);
        blackboard.broadcastMessage(MSG_ADD_SHAPE, {name: _generateShapeName(message.nodeName), id: message.id, 
            graphID: GRAPH_ID, label: message.description, x:message.properties.x||_generateShapeX(), 
            y:message.properties.y||_generateShapeY(), width:IMG_SIZE.width, height:IMG_SIZE.height, 
            connectable:true});
        
        });             
    blackboard.registerListener(MSG_FILE_UPLOADED, async message => { await reset(); blackboard.broadcastMessage(MSG_MODEL_LOAD_MODEL,
        {data: message.data, name: message.name}) });
    blackboard.registerListener(MSG_SHAPE_MOVED, message => blackboard.broadcastMessage(MSG_MODEL_NODES_MODIFIED, 
        {type: MODEL_OP_MODIFIED, nodeName: message.name, id: message.id, properties: {...(ID_CACHE[message.id]||{}), x: message.x, y: message.y}}));

    const i18NForView = await import(`${VIEW_PATH}/page/i18n.mjs`); // merge the view's i18ns into the global i18n
    for (const lang in i18NForView.i18n) i18n.setI18NObject(lang, {...await i18n.getI18NObject(lang, true), ...i18NForView.i18n[lang]});

    // import required components, and init required modules
    for (const component in CONF.components) import (`${VIEW_PATH}/${CONF.components[component]}/${component}.mjs`);
    for (const initModule in CONF.initModules) (await import(`${VIEW_PATH}/${CONF.initModules[initModule]}`))[initModule].init();
}

async function reset() {
    for (const listener of blackboard.getListeners(MSG_RESET)) await listener({graphID: GRAPH_ID}); ID_CACHE = {};
}

function shapeAdded(shapeName, id, label, connectable=true) {
    const shapeNameTweaked = _generateShapeName(shapeName);
    blackboard.broadcastMessage(MSG_ADD_SHAPE, {name: shapeNameTweaked, id, graphID: GRAPH_ID, label:label||"", 
        x:_generateShapeX(), y:_generateShapeY(), width:IMG_SIZE.width, height:IMG_SIZE.height, connectable});  // add to the flow diagram
    blackboard.broadcastMessage(MSG_MODEL_NODES_MODIFIED, {type: MODEL_OP_ADDED, nodeName: shapeNameTweaked, id, properties: {description: label}}); // add to the model
}

async function _shapeObjectClickedOnFlowDiagram(shapeName, id, shapelabel) {
    let savedDialogProperties = ID_CACHE[id]||{}, pageSelector = await _returnFirstFileThatExists([`${VIEW_PATH}/dialogs/dialog_${shapeName}.page.mjs`,
        `${VIEW_PATH}/dialogs/dialog_${shapeName}.page`]);
    let pageFile, pageModule; if (pageSelector.endsWith(".mjs")) {
        pageModule = await import(pageSelector); 
        const result = await pageModule.page.getPage(VIEW_PATH, savedDialogProperties);
        if (!result) return; const {page, dialogProperties} = result;
        pageFile = new URL(page); savedDialogProperties = dialogProperties;
    } else pageFile = new URL(pageSelector);
    
    let html = await page_generator.getHTML(pageFile, null, {description: shapelabel, uriEncodedDescription: encodeURIComponent(shapelabel)});

    // figure out IDs for all input items on the dialog and fill their defaults, if saved previously
    const dom = new DOMParser().parseFromString(html, "text/html"), items = dom.getElementsByClassName(PAGE_GENERATOR_GRID_ITEM_CLASS);
    const idsNeeded = []; for (const item of items) for (const child of item.childNodes) if (
        HTML_INPUT_ELEMENTS.includes(child.nodeName.toLowerCase()) && child.id ) {
            idsNeeded.push(child.id); 
            if (savedDialogProperties[child.id]) if (child.nodeName.toLowerCase() == "textarea") child.innerHTML = savedDialogProperties[child.id];
            else child.setAttribute("value", savedDialogProperties[child.id]);
    }
    if (pageModule && pageModule.page.dialogConnected) dom = await pageModule.page.dialogConnected(dom, savedDialogProperties);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = await _returnFirstFileThatExists([`${VIEW_PATH}/dialogs/dialogProperties${shapeName}.json`,
        `${VIEW_PATH}/dialogs/${DEFAULT_DIALOG_PROPERTIES}`]);
    window.monkshu_env.components["dialog-box"].showDialog(dialogPropertiesPath, html, null, idsNeeded, 
        async (typeOfClose, result) => { if (typeOfClose == "submit") {
                if (pageModule && pageModule.page.dialogEnded) result = await pageModule.page.dialogEnded(result);
                ID_CACHE[id] = result; const listeners = blackboard.getListeners(MSG_MODEL_NODES_MODIFIED); // inform model
                for (const listener of listeners) if (!listener({type: MODEL_OP_MODIFIED, nodeName: shapeName, id, properties: result})) return false;
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

async function _returnFirstFileThatExists(arrayOfURLs) {    // no this isn't slow, as $$.require caches files and 404s should be quick
    for (const url of arrayOfURLs) try {await $$.requireText(url); return url;} catch (err) {};
    return null;    // none of these URLs exists
}

export const flowuiView = {init, reset};