/** 
 * Model file for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

const EMPTY_MODEL = {rule_bundles:[], functions:[], data:[], rule_parameters: [], outputs:[], objects:[]}, DEFAULT_BUNDLE="rules";
let monkrulsModel = EMPTY_MODEL, idCache = {}, current_rule_bundle = DEFAULT_BUNDLE;
const MSG_NODES_MODIFIED = "NODES_MODIFIED", MSG_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED", 
    MSG_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    MSG_GET_MODEL = "GET_MODEL", MSG_RESET = "RESET", MSG_LOAD_MODEL = "LOAD_MODEL", 
    MSG_CONNECT_NODES = "CONNECT_NODES", MSG_ADD_NODE = "ADD_NODE", CSVLOOKUPTABLESCHEME = "csvlookuptable://", 
    CSVSCHEME = "csv://";

function init() {
    blackboard.registerListener(MSG_NODES_MODIFIED, message => modelNodesModified(message.type, message.nodeName,
        message.id, message.properties), true);
    blackboard.registerListener(MSG_CONNECTORS_MODIFIED, message => modelConnectorsModified(message.type, 
        message.sourceNode, message.targetNode, message.sourceID, message.targetID));
    blackboard.registerListener(MSG_NODE_DESCRIPTION_CHANGED, message => nodeDescriptionChanged(message.nodeName, 
        message.id, message.description));
    blackboard.registerListener(MSG_NODE_DESCRIPTION_CHANGED, message => nodeDescriptionChanged(message.nodeName, 
        message.id, message.description));
    blackboard.registerListener(MSG_ARE_NODES_CONNECTABLE, message => isConnectable(message.sourceName, 
        message.targetName, message.sourceID, message.targetID), true);
    blackboard.registerListener(MSG_GET_MODEL, _ => getModelAsFile(), true);
    blackboard.registerListener(MSG_RESET, _ => {monkrulsModel = EMPTY_MODEL, idCache = {}, current_rule_bundle = DEFAULT_BUNDLE;}, true)
    blackboard.registerListener(MSG_LOAD_MODEL, message => loadModel(message.data));
}

function loadModel(jsonModel) {
    try {monkrulsModel = JSON.parse(jsonModel)} 
    catch (err) {LOG.error(`Bad Monkruls model, error ${err}, skipping.`); return;}
    if (!(monkrulsModel.rule_bundles && monkrulsModel.functions && monkrulsModel.data && monkrulsModel.rule_parameters)) {LOG.error(`Bad Monkruls model, not in right format.`); return;}

    const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    

    // first add all the rules and bundles and decision tables
    for (const bundle of monkrulsModel.rule_bundles) for (const rule of bundle.rules) {
        const id = rule.id||_getUniqueID(), nodeName = rule.nodeName || rule.decisiontable?"decision":"rule"; 
        idCache[id] = rule; if (rule.decisiontable) rule.decisiontable = rule.decisiontable.substring(CSVSCHEME.length);
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName, id, description: rule.description, properties: {...rule}});
    }

    // add connections
    for (const bundle of monkrulsModel.rule_bundles) if (!bundle.rules.decisiontable) for (const rule of bundle.rules) if (rule.dependencies) for (const dependency of rule.dependencies) { 
        const sourceID = dependency, targetID = rule.id; 
        if (!idCache[sourceNodeID]) {LOG.error(`Bad dependency in the model ${sourceNodeKey}, skipping.`); break;}
        const sourceName = _getNodeType(sourceNodeKey), targetName = _getNodeType(targetNodeKey);
        blackboard.broadcastMessage(MSG_CONNECT_NODES, {sourceName, targetName, sourceID, targetID});
    }

    // add variables
    for (const variable of monkrulsModel.rule_parameters) {
        const id = variable.id||_getUniqueID(); idCache[id] = variable;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: variable.nodeName||"variable", id, description: variable.description, properties: {...variable}, connectable: false});
    }

    // add data
    for (const data of monkrulsModel.data) {
        const id = data.id||_getUniqueID(); idCache[id] = data;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: data.nodeName||"data", id, description: data.description, properties: {...data}, connectable: false});
    }

    // add functions
    for (const functionThis of monkrulsModel.functions) {
        const id = functionThis.id||_getUniqueID(); idCache[id] = functionThis;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: functionThis.nodeName||"functions", id, description: functionThis.description, properties: {...functionThis}, connectable: false});
    }

    // add outputs
    for (const output of monkrulsModel.outputs) {
        const id = output.id||_getUniqueID(); idCache[id] = output;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: output.nodeName||"output", id, description: output.description, properties: {...output}, connectable: false});
    }

    // add objects
    for (const object of monkrulsModel.objects) {
        const id = object.id||_getUniqueID(); idCache[id] = object;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: object.nodeName||"object", id, description: object.description, properties: {...object}, connectable: false});
    }
}

function modelNodesModified(type, nodeName, id, properties) {
    if (type == monkrulsmodel.ADDED) return _nodeAdded(nodeName, id, properties);
    if (type == monkrulsmodel.REMOVED) return _nodeRemoved(nodeName, id);
    if (type == monkrulsmodel.MODIFIED) return _nodeModified(nodeName, id, properties);

    return false;   // unknown modification
}

function modelConnectorsModified(type, sourceName, targetName, sourceID, targetID) {
    if ((!idCache[sourceID]) || (!idCache[targetID])) return;   // not connected

    if (sourceName == "rule" && targetName == "rule") { // add rules being connected here
        if (type == model.ADDED) {
            if (!idCache[targetID].dependencies) idCache[targetID].dependencies = []; 
            idCache[targetID].dependencies.push(idCache[sourceID].id);
        } else if (type == model.REMOVED && idCache[targetID]) {
            const dependencies = idCache[targetID].dependencies;
            if ((!dependencies)||(!dependencies.length)||dependencies.indexOf(idCache[sourceID].id)==-1) return;
            else dependencies.splice(dependencies.indexOf(idCache[sourceID].id), 1);
            if (dependencies.length == 0) delete idCache[targetID].dependencies;    // no longer required
        }
    }
}

function isConnectable(sourceName, targetName, sourceID, targetID) {    // are these nodes connectable
    if (sourceID == targetID) return false; // can't loop from same node to itself
    if ((sourceName != "rule")||(targetName == "rule")) return false;   // currently only rules support connections

    const targetDependencies = idCache[targetID].dependencies;
    if (targetDependencies && targetDependencies.includes(idCache[sourceID].id)) return false;   // can't reconnect same nodes again
    
    return true;
}

const nodeDescriptionChanged = (_nodeName, id, description) => {
    if (!idCache[id]) return; else idCache[id].description = description; }

const getModelAsFile = _ => {return {data: JSON.stringify(monkrulsModel, null, 4), mime: "application/json", filename: "ruls.json"}}

function _findOrCreateRuleBundle(name=current_rule_bundle) {
    for (const bundle of monkrulsModel.rule_bundles) if (bundle.name == name) return bundle;
    const newBundle = {name, rules:[]}; monkrulsModel.rule_bundles.push(newBundle); return newBundle;
}

const _findAndDeleteRuleBundle = (name=current_rule_bundle) => _arrayDelete(monkrulsModel.rule_bundles, _findOrCreateRuleBundle(name));

function _nodeAdded(nodeName, id, properties) {
    const node = idCache[id] ? idCache[id] : JSON.parse(JSON.stringify(properties)); node.nodeName = nodeName;
    if (idCache[id]) {_nodeModified(nodeName, id, properties); return;}  // node properties modified

    if (nodeName == "rule") _findOrCreateRuleBundle().rules.push(node);
    else if (nodeName == "variable") monkrulsModel.rule_parameters.push(node);
    else if (nodeName == "decision") _findOrCreateRuleBundle(properties.description).rules.push(node);
    else if (nodeName == "data") {node.name = node.description; monkrulsModel.data.push(node);}
    else if (nodeName == "functions") {node.name = node.description; monkrulsModel.functions.push(node);}
    else if (nodeName == "output") monkrulsModel.outputs.push(node);
    else if (nodeName == "object") {node.name = node.description; monkrulsModel.objects.push(node);}
    
    node.id = id; idCache[id] = node;   // transfer ID and cache the node
    
    return true;
}

function _nodeRemoved(nodeName, id) {
    if (!idCache[id]) return;   // we don't know of this node
    const node = idCache[id];

    if (nodeName == "rule") {const bundle = _findOrCreateRuleBundle(); _arrayDelete(bundle.rules, node); if (!bundle.rules.length) _findAndDeleteRuleBundle();}
    else if (nodeName == "decision") _arrayDelete(monkrulsModel.rule_bundles, _findOrCreateRuleBundle(node.description));
    else if (nodeName == "variable") _arrayDelete(monkrulsModel.rule_parameters, node);
    else if (nodeName == "data") _arrayDelete(monkrulsModel.data, node);
    else if (nodeName == "functions") _arrayDelete(monkrulsModel.functions, node);
    else if (nodeName == "functions") _arrayDelete(monkrulsModel.outputs, node);
    else if (nodeName == "object") _arrayDelete(monkrulsModel.objects, node);

    delete idCache[id]; // uncache
    return true;
}

function _nodeModified(nodeName, id, properties) {
    if (!idCache[id]) return false; // we don't know of this node
    for (const key in properties) { // transfer the new properties, CSVs need the CSV scheme added
        if (key == "decisiontable") idCache[id][key] = CSVSCHEME+_getSheetTabData(properties.decisiontable, "Rules");
        else if (key == "data" && nodeName == "data") idCache[id][key] = 
            _getSheetTabData(properties.data, "isLookupTable").toLowerCase()=="true"?CSVLOOKUPTABLESCHEME:CSVSCHEME+_getSheetTabData(properties.data, "default");
        else if (key == "data" && nodeName == "object") {
            try {idCache[id][key] = properties.type == "CSV" ? CSVSCHEME+properties.data : JSON.parse(properties.data);}
            catch (err) {idCache[id][key] = properties.data}    // most probably bad JSON
        } else idCache[id][key] = properties[key];   
    }
    return true;
}

function _getSheetTabData(sheetProperties, tabName) {
    for (const object of JSON.parse(sheetProperties)) if (object.id == tabName) return object.data;
    return null;
}

const _arrayDelete = (array, element) => {if (array.includes(element)) array.splice(array.indexOf(element), 1);}

export const monkrulsmodel = {init, loadModel, modelNodesModified, modelConnectorsModified, isConnectable, 
    nodeDescriptionChanged, getModelAsFile, ADDED: "added", REMOVED: "removed", MODIFIED: "modified"};