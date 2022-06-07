/** 
 * Model file for API400 application.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { algos } from "./algos.mjs";
import { util } from "/framework/js/util.mjs";
import { blackboard } from "/framework/js/blackboard.mjs";

const EMPTY_MODEL = { apicl: [] }, DEFAULT_BUNDLE = "commands";
let api400modelObj = EMPTY_MODEL, idCache = {}, current_command_bundle = DEFAULT_BUNDLE;
const MSG_NODES_MODIFIED = "NODES_MODIFIED", MSG_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED",
    MSG_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    MSG_GET_MODEL = "GET_MODEL", MSG_RESET = "RESET", MSG_LOAD_MODEL = "LOAD_MODEL",
    MSG_CONNECT_NODES = "CONNECT_NODES", MSG_ADD_NODE = "ADD_NODE" ;

function init() {

    blackboard.registerListener(MSG_NODES_MODIFIED, message => modelNodesModified(message.type, message.nodeName,
        message.id, message.properties), true);
    blackboard.registerListener(MSG_CONNECTORS_MODIFIED, message => modelConnectorsModified(message.type,
        message.sourceNode, message.targetNode, message.sourceID, message.targetID));
    blackboard.registerListener(MSG_NODE_DESCRIPTION_CHANGED, message => nodeDescriptionChanged(message.nodeName,
        message.id, message.description));
    blackboard.registerListener(MSG_ARE_NODES_CONNECTABLE, message => isConnectable(message.sourceName,
        message.targetName, message.sourceID, message.targetID), true);
    blackboard.registerListener(MSG_GET_MODEL, message => getModelAsFile(message.name), true);
    blackboard.registerListener(MSG_RESET, _ => { api400modelObj = EMPTY_MODEL, idCache = {}, current_command_bundle = DEFAULT_BUNDLE; }, true);
    blackboard.registerListener(MSG_LOAD_MODEL, message => loadModel(message.data));
}

function loadModel(jsonModel) {

    try {
        api400modelObj = JSON.parse(jsonModel);
    }
    catch (err) { LOG.error(`Bad API400 model, error ${err}, skipping.`); return; }
    if (!(api400modelObj.apicl)) { LOG.error(`Bad API400 model, not in right format.`); return; }

    // first add all the commands
    for (const apicl of api400modelObj.apicl) for (const command of apicl.commands) {
        const id = command.id || _getUniqueID(); idCache[id] = command; const clone = util.clone(command);
        const nodeName = clone.nodeName;
        blackboard.broadcastMessage(MSG_ADD_NODE, { nodeName, id, description: clone.description, properties: { ...clone }, connectable: true });
    }


    const connectNodes = (sourceID, targetID) => {
        if ((!idCache[sourceID]) || (!idCache[targetID])) { LOG.error(`Bad dependency in the model ${sourceID}, skipping.`); return; }
        const sourceName = idCache[sourceID].nodeName, targetName = idCache[targetID].nodeName;
        blackboard.broadcastMessage(MSG_CONNECT_NODES, { sourceName, targetName, sourceID, targetID });
    }

    // add connections between commands
    for (const command of api400modelObj.apicl[0].commands) 
        if (command.dependencies) for (const dependency of command.dependencies) connectNodes(dependency, command.id);

}

function modelNodesModified(type, nodeName, id, properties) {

    if (type == api400model.ADDED) return _nodeAdded(nodeName, id, properties);
    if (type == api400model.REMOVED) return _nodeRemoved(nodeName, id);
    if (type == api400model.MODIFIED) return _nodeModified(nodeName, id, properties);

    return false;   // unknown modification
}

function modelConnectorsModified(type, sourceName, targetName, sourceID, targetID) {

    if ((!idCache[sourceID]) || (!idCache[targetID])) return;   // not connected

    const addOrRemoveDependencies = (sourceNode, targetNode, type) => {

        if (type == api400model.ADDED) {
            if (!targetNode.dependencies) targetNode.dependencies = [];
            targetNode.dependencies.push(sourceNode.id);
        } else if (type == api400model.REMOVED && targetNode) {
            const dependencies = targetNode.dependencies;
            if ((!dependencies) || (!dependencies.length) || dependencies.indexOf(sourceNode.id) == -1) return;
            else _arrayDelete(dependencies, sourceNode.id);
            if (dependencies.length == 0) delete targetNode.dependencies;    // no longer required
        }
    }

    addOrRemoveDependencies(idCache[sourceID], idCache[targetID], type);    // also visually connect the nodes  
}

function isConnectable(sourceName, targetName, sourceID, targetID) {    // are these nodes connectable
    
    if (sourceID == targetID) return false;  // can't loop from same node to itself
    if (targetName == "strapi") return false; // strapi can't be target, so that it will always be first command only
    if (sourceName == "endapi") return false; // endapi can't be connect to any next command
    if (((sourceName == "condition") && !((targetName == "iftrue") || (targetName == "iffalse")))) return false; // condition can only connect to iftrue and iffalse
    if (((sourceName != "condition") && ((targetName == "iftrue") || (targetName == "iffalse")))) return false; // iftrue and iffalse , can only be connect by condition
    if ((sourceName == "goto") && (targetName == "goto")) return false; // can't connect goto to goto
    
    return true;
}

function nodeDescriptionChanged(_nodeName, id, description) {

    if (!idCache[id]) return;

    const oldNameTracksDescription = _getNameFromDescription(idCache[id].description) == idCache[id].name;
    if (idCache[id].name && oldNameTracksDescription) {
        idCache[id].name = _getNameFromDescription(description); idCache[id].description = description;
    } else idCache[id].description = description;

}

function getModel() {
    const retModel = util.clone(api400modelObj);
    retModel.apicl = algos.sortDependencies(retModel.apicl[0]);  // sort apicl commands in the order of dependencies
    const APICL = algos.convertIntoAPICL(retModel.apicl); // converting into the final APICL
    return APICL;
}

function runJsMod() {
    const api400 = util.clone(api400modelObj);
    let nameAndJsArray = []
    for (const command of api400.apicl[0].commands) {
        let nameAndJs = [];
        if (command.nodeName == "mod") {
            nameAndJs.push(command.result?command.result:'');
            nameAndJs.push(command.code);
            nameAndJsArray.push(nameAndJs)
        }

    }
    return nameAndJsArray;
}

const getModelAsFile = name => { return { data: JSON.stringify(getModel(), null, 4), mime: "application/json", filename: `${name || "api400api"}.apicl` } }

const _getUniqueID = _ => `${Date.now()}${Math.random() * 100}`;

function _findOrCreateCommand(name = current_command_bundle, forceNew) {
    if (!forceNew) for (const command of api400modelObj.apicl) if (command.name == name) return command;
    const newCommand = { name, commands: [], id: _getUniqueID() };
    api400modelObj.apicl.push(newCommand);
    return newCommand;
}

const _findAndDeleteCommand = (name = current_command_bundle) => _arrayDelete(api400modelObj.apicl[0].commands, _findOrCreateCommand(name));

function _nodeAdded(nodeName, id, properties) {
    const node = idCache[id] ? idCache[id] : JSON.parse(JSON.stringify(properties)); node.nodeName = nodeName;
    if (idCache[id]) { _nodeModified(nodeName, id, properties); return; }  // node properties modified
    const name = _getNameFromDescription(node.description);

    if (nodeName == "strapi") _findOrCreateCommand().commands.push(node);
    else if (nodeName == "runsql" || nodeName == "runjs" || nodeName == "goto" || nodeName == "chgvar" ||
            nodeName == "sndapimsg" || nodeName == "condition" || nodeName == "iftrue" || nodeName == "iffalse" ||
            nodeName == "chgdtaara" || nodeName == "rtvdtaara" || nodeName == "call" || nodeName == "runsqlprc" ||
            nodeName == "rest" || nodeName == "map" || nodeName == "scrread" || nodeName == "scrkeys" ||nodeName == "scrops" ||
            nodeName == "substr" || nodeName == "qrcvdtaq" || nodeName == "qsnddtaq" || nodeName == "dsppfm" || 
            nodeName == "log" ||nodeName == "jsonata" || nodeName == "mod" || nodeName == "endapi") {
            api400modelObj.apicl[0].commands.push(node);
    }

    node.id = id; idCache[id] = node;   // transfer ID and cache the node
    return true;
}

function _nodeRemoved(nodeName, id) {

    if (!idCache[id]) return;   // we don't know of this node
    const node = idCache[id];
  const nextTargetNode =  algos.checkNodeInAllNodes(node,api400modelObj.apicl[0].commands);
  if( nextTargetNode)  modelConnectorsModified(api400model.REMOVED,nodeName,nextTargetNode.nodeName,id,nextTargetNode.id);

    if (nodeName == "rule") { const bundle = _findOrCreateCommand(); _arrayDelete(bundle.commands, node); if (!bundle.commands.length) _findAndDeleteCommand(); }
    else if (nodeName == "strapi") _findAndDeleteCommand(node);
    else if (nodeName == "runsql") _findAndDeleteCommand(node);
    else if (nodeName == "runjs") _findAndDeleteCommand(node);
    else if (nodeName == "goto") _findAndDeleteCommand(node);
    else if (nodeName == "chgvar") _findAndDeleteCommand(node);
    else if (nodeName == "sndapimsg") _findAndDeleteCommand(node);
    else if (nodeName == "iftrue") _findAndDeleteCommand(node);
    else if (nodeName == "iffalse") _findAndDeleteCommand(node);
    else if (nodeName == "chgdtaara") _findAndDeleteCommand(node);
    else if (nodeName == "rtvdtaara") _findAndDeleteCommand(node);
    else if (nodeName == "call") _findAndDeleteCommand(node);
    else if (nodeName == "runsqlprc") _findAndDeleteCommand(node);
    else if (nodeName == "rest") _findAndDeleteCommand(node);
    else if (nodeName == "map") _findAndDeleteCommand(node);
    else if (nodeName == "scrread") _findAndDeleteCommand(node);
    else if (nodeName == "scrkeys") _findAndDeleteCommand(node);
    else if (nodeName == "scrops") _findAndDeleteCommand(node);
    else if (nodeName == "substr") _findAndDeleteCommand(node);
    else if (nodeName == "qrcvdtaq") _findAndDeleteCommand(node);
    else if (nodeName == "qsnddtaq") _findAndDeleteCommand(node);
    else if (nodeName == "dsppfm") _findAndDeleteCommand(node);
    else if (nodeName == "log") _findAndDeleteCommand(node);
    else if (nodeName == "jsonata") _findAndDeleteCommand(node);
    else if (nodeName == "mod") _findAndDeleteCommand(node);
    else if (nodeName == "endapi") _findAndDeleteCommand(node);
    else if (nodeName == "condition")  _findAndDeleteCommand(node);
    delete idCache[id]; // uncache
    return true;
}
function _nodeModified(nodeName, id, properties) {
    let parameters, variables, scrProperties = [];
    if (!idCache[id]) return false; // we don't know of this node
    for (const key in properties) { // transfer the new properties, CSVs need the CSV scheme added
        if (key.includes("listbox") && (nodeName == "strapi" || nodeName == "sndapimsg" || nodeName == "call" || nodeName == "runsqlprc")) {
            if (properties[key] != '') { parameters = properties[key]; }
        } else if (key.includes("listbox") && (nodeName == "chgvar" || nodeName == "substr" || nodeName == "map")) {
            if (properties[key] != '') { variables = properties[key]; }
        } else if (key.includes("listbox") && (nodeName == "scrread" || nodeName == "scrkeys")) {
            if (properties[key] != '') { scrProperties = properties[key]; }
        } else idCache[id][key] = properties[key];
    }
    if (parameters && parameters.length != 0) { idCache[id].listbox = parameters; }
    if (variables && variables.length != 0) { idCache[id].listbox = variables; }
    if (scrProperties && scrProperties.length != 0) { idCache[id].listbox = scrProperties; }

    return true;
}

function _getSheetTabData(sheetProperties, tabName) {
    for (const object of JSON.parse(sheetProperties)) if (object.id == tabName) return object.data;
    return null;
}

const _arrayDelete = (array, element) => {
    if (array.includes(element)) array.splice(array.indexOf(element), 1); return element;
}

const _getNameFromDescription = description => description.split(" ")[0].split("\n")[0];

const _tryJSONParse = object => { try { return JSON.parse(object) } catch (err) { return object } }

export const api400model = {
    init, loadModel, modelNodesModified, modelConnectorsModified, isConnectable,
    nodeDescriptionChanged, getModelAsFile, getModel, getModelObject, runJsMod, ADDED: "added", REMOVED: "removed", MODIFIED: "modified"
};
