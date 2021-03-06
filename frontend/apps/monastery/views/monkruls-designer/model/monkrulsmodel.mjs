/** 
 * Model file for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {algos} from "./algos.mjs";
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";

const EMPTY_MODEL = {rule_bundles:[], functions:[], data:[], rule_parameters: [], outputs:[], objects:[], simulations: []}, DEFAULT_BUNDLE="rules";
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
    blackboard.registerListener(MSG_ARE_NODES_CONNECTABLE, message => isConnectable(message.sourceName, 
        message.targetName, message.sourceID, message.targetID), true);
    blackboard.registerListener(MSG_GET_MODEL, message => getModelAsFile(message.name), true);
    blackboard.registerListener(MSG_RESET, _ => {monkrulsModel = EMPTY_MODEL, idCache = {}, current_rule_bundle = DEFAULT_BUNDLE;}, true);
    blackboard.registerListener(MSG_LOAD_MODEL, message => loadModel(message.data));
}

function loadModel(jsonModel) {
    try {monkrulsModel = JSON.parse(jsonModel)} 
    catch (err) {LOG.error(`Bad Monkruls model, error ${err}, skipping.`); return;}
    if (!(monkrulsModel.rule_bundles && monkrulsModel.functions && monkrulsModel.data && monkrulsModel.rule_parameters)) {LOG.error(`Bad Monkruls model, not in right format.`); return;}

    // first add all the rules and bundles and decision tables
    for (const bundle of monkrulsModel.rule_bundles) for (const rule of bundle.rules) {
        const id = rule.id||_getUniqueID(); idCache[id] = rule; const clone = util.clone(rule);
        const nodeName = clone.nodeName || (clone.decisiontable?"decision":"rule"); 
        if (clone.decisiontable) clone.decisiontable = clone.decisiontable_raw||clone.decisiontable.substring(CSVSCHEME.length);
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName, id, description: clone.description, properties: {...clone}, connectable: true});
    }

    const connectNodes = (sourceID, targetID) => {
        if ((!idCache[sourceID])||(!idCache[targetID])) {LOG.error(`Bad dependency in the model ${sourceID}, skipping.`); return;}
        const sourceName = idCache[sourceID].nodeName, targetName = idCache[targetID].nodeName;
        blackboard.broadcastMessage(MSG_CONNECT_NODES, {sourceName, targetName, sourceID, targetID});
    }
    // add connections between rules
    for (const bundle of monkrulsModel.rule_bundles) if (!bundle.rules.decisiontable) 
        for (const rule of bundle.rules) if (rule.dependencies) for (const dependency of rule.dependencies) connectNodes(dependency, rule.id);

    // add variables
    for (const variable of monkrulsModel.rule_parameters) {
        const id = variable.id||_getUniqueID(); idCache[id] = variable;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: variable.nodeName||"variable", id, description: variable.description, properties: {...variable}, connectable: false});
    }

    // add data
    for (const data of monkrulsModel.data) {
        const id = data.id||_getUniqueID(); idCache[id] = data; const clone = util.clone(data); 
        clone.data = clone.data_raw||(clone.data.startsWith?.(CSVSCHEME)?clone.data.substring(CSVSCHEME.length):
            clone.data.startsWith?.(CSVLOOKUPTABLESCHEME)?clone.data.substring(CSVLOOKUPTABLESCHEME.length) : 
            typeof clone.data == "object" ? JSON.stringify(clone.data) : clone.data);
        if (!clone.type) { if (clone.data.startsWith?.(CSVSCHEME)||clone.data.startsWith?.(CSVLOOKUPTABLESCHEME)) clone.type = "CSV";
            else clone.type = "JSON/Javascript"; }
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: clone.nodeName||"data", id, description: clone.description, properties: {...clone}, connectable: false});
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
        const id = object.id||_getUniqueID(); idCache[id] = object; const clone = util.clone(object);
        clone.data = clone.data_raw||(clone.data.startsWith?.(CSVSCHEME)?clone.data.substring(CSVSCHEME.length):
            typeof clone.data == "object" ? JSON.stringify(clone.data) : clone.data);
        if (!clone.type) { if (clone.data.startsWith?.(CSVSCHEME)) clone.type = "CSV"; else clone.type = "JSON/Javascript"; }
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: clone.nodeName||"object", id, description: clone.description, properties: {...clone}, connectable: false});
    }

    // add simulations
    for (const simulation of monkrulsModel.simulations) {
        const id = simulation.id||_getUniqueID(); idCache[id] = simulation;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: simulation.nodeName||"simulate", id, description: simulation.description, properties: {...simulation}, connectable: false});
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

    const addOrRemoveDependencies = (sourceNode, targetNode, type) => {
        if (type == monkrulsmodel.ADDED) {
            if (!targetNode.dependencies) targetNode.dependencies = []; 
            targetNode.dependencies.push(sourceNode.id);
        } else if (type == monkrulsmodel.REMOVED && targetNode) {
            const dependencies = targetNode.dependencies;
            if ((!dependencies)||(!dependencies.length)||dependencies.indexOf(sourceNode.id)==-1) return;
            else _arrayDelete(dependencies, sourceNode.id);
            if (dependencies.length == 0) delete targetNode.dependencies;    // no longer required
        }
    }

    if (sourceName == "rule" && targetName == "rule") addOrRemoveDependencies(idCache[sourceID], idCache[targetID], type);  // rule to rule
    else {    // rule to decision or decision to rule or decision to decision, so add dependency between bundles instead
        const sourceBundle = _findRuleBundleWithThisRule(idCache[sourceID]), targetBundle = _findRuleBundleWithThisRule(idCache[targetID]);
        if ((!sourceBundle) || (!targetBundle)) {LOG.error("Rules bundle for rules being connected not found."); return;}
        addOrRemoveDependencies(sourceBundle, targetBundle, type);
        addOrRemoveDependencies(idCache[sourceID], idCache[targetID], type);    // also visually connect the rule nodes
    }
}

function isConnectable(sourceName, targetName, sourceID, targetID) {    // are these nodes connectable
    if (sourceID == targetID) return false; // can't loop from same node to itself
    if (((sourceName != "rule") && (sourceName != "decision")) || ((targetName != "rule") && 
        (targetName != "decision"))) return false;   // currently only rules and decision tables support connections

    const _checkCycles = (sourceNode, targetNode) => {
        const targetDependencies = targetNode.dependencies, sourceDependencies = sourceNode.dependencies;
        if (targetDependencies && targetDependencies.includes(sourceNode.id)) return false;   // can't reconnect same nodes again
        if (sourceDependencies && sourceDependencies.includes(targetNode.id)) return false;   // cycle
        return true;
    }

    // don't allow cycles or reconnections
    if (sourceName == "rule" && targetName == "rule") return _checkCycles(idCache[sourceID], idCache[targetID]);
    else return _checkCycles(_findRuleBundleWithThisRule(idCache[sourceID]), _findRuleBundleWithThisRule(idCache[targetID]));
}

function nodeDescriptionChanged(_nodeName, id, description) {
    if (!idCache[id]) return; 
    
    const oldNameTracksDescription = _getNameFromDescription(idCache[id].description) == idCache[id].name;
    if (idCache[id].name && oldNameTracksDescription) {
        idCache[id].name = _getNameFromDescription(description); idCache[id].description = description;
    } else idCache[id].description = description;

    // rule bundle name is alaways same as description for decision tables
    if (idCache[id].nodeName == "decision") _findRuleBundleWithThisRule(idCache[id]).name = _getNameFromDescription(description);    
}

function getModel() {
    const retModel = util.clone(monkrulsModel); 
    retModel.rule_bundles = algos.sortDependencies(retModel.rule_bundles);  // sort rule bundles in the order of dependencies
    for (const rules_bundle of retModel.rule_bundles) rules_bundle.rules = algos.sortDependencies(rules_bundle.rules);  // sort rules within a bundle in the order of dependencies
    return retModel;
}
const getModelAsFile = name => {return {data: JSON.stringify(getModel(), null, 4), mime: "application/json", filename: `${name||"rules"}.monkruls.json`}}

const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    

function _findRuleBundleWithThisRule(rule) {
    for (const bundle of monkrulsModel.rule_bundles) if (bundle.rules.includes(rule)) return bundle;
    return null;
}

function _findOrCreateRuleBundle(name=current_rule_bundle, forceNew) {
    if (!forceNew) for (const bundle of monkrulsModel.rule_bundles) if (bundle.name == name) return bundle;
    const newBundle = {name, rules:[], id:_getUniqueID()}; monkrulsModel.rule_bundles.push(newBundle); return newBundle;
}

const _findAndDeleteRuleBundle = (name=current_rule_bundle) => _arrayDelete(monkrulsModel.rule_bundles, _findOrCreateRuleBundle(name));

function _nodeAdded(nodeName, id, properties) {
    const node = idCache[id] ? idCache[id] : JSON.parse(JSON.stringify(properties)); node.nodeName = nodeName;
    if (idCache[id]) {_nodeModified(nodeName, id, properties); return;}  // node properties modified

    const name = _getNameFromDescription(node.description);

    if (nodeName == "rule") _findOrCreateRuleBundle().rules.push(node); 
    else if (nodeName == "variable") monkrulsModel.rule_parameters.push(node);
    else if (nodeName == "decision") _findOrCreateRuleBundle(name, true).rules.push(node);
    else if (nodeName == "data") {node.name = name; monkrulsModel.data.push(node);}
    else if (nodeName == "functions") {node.name = name; monkrulsModel.functions.push(node);}
    else if (nodeName == "output") monkrulsModel.outputs.push(node);
    else if (nodeName == "object") {node.name = name; monkrulsModel.objects.push(node);}
    else if (nodeName == "simulate") monkrulsModel.simulations.push(node);
    
    node.id = id; idCache[id] = node;   // transfer ID and cache the node
    
    return true;
}

function _nodeRemoved(nodeName, id) {
    if (!idCache[id]) return;   // we don't know of this node
    const node = idCache[id];

    if (nodeName == "rule") {const bundle = _findOrCreateRuleBundle(); _arrayDelete(bundle.rules, node); if (!bundle.rules.length) _findAndDeleteRuleBundle();}
    else if (nodeName == "decision") _arrayDelete(monkrulsModel.rule_bundles, _findRuleBundleWithThisRule(node));
    else if (nodeName == "variable") _arrayDelete(monkrulsModel.rule_parameters, node);
    else if (nodeName == "data") _arrayDelete(monkrulsModel.data, node);
    else if (nodeName == "functions") _arrayDelete(monkrulsModel.functions, node);
    else if (nodeName == "functions") _arrayDelete(monkrulsModel.outputs, node);
    else if (nodeName == "object") _arrayDelete(monkrulsModel.objects, node);
    else if (nodeName == "simulate") _arrayDelete(monkrulsModel.simulations, node);

    delete idCache[id]; // uncache
    return true;
}

function _nodeModified(nodeName, id, properties) {
    if (!idCache[id]) return false; // we don't know of this node
    for (const key in properties) { // transfer the new properties, CSVs need the CSV scheme added
        if (key == "decisiontable") {   // decision table must be CSV
            idCache[id][key] = CSVSCHEME+_getSheetTabData(properties.decisiontable, "Rules");
            idCache[id].decisiontable_raw = properties[key]; 
        } else if (key == "data" && nodeName == "data") {   // data sheet can be CSV or Lookup table
            idCache[id][key] = properties.type == "CSV" ? 
                (_getSheetTabData(properties.data, "isLookupTable").toLowerCase()=="true"?CSVLOOKUPTABLESCHEME:CSVSCHEME)+_getSheetTabData(properties.data, "default") :
                _tryJSONParse(properties.data);
            idCache[id].data_raw = properties[key]; 
        } else if (key == "data" && nodeName == "object") { // object sheet can be JSON or CSV
            idCache[id][key] = properties.type == "CSV" ? CSVSCHEME+properties.data : _tryJSONParse(properties.data);
            idCache[id].data_raw = properties[key]; 
        } else idCache[id][key] = properties[key];   
    }
    return true;
}

function _getSheetTabData(sheetProperties, tabName) {
    for (const object of JSON.parse(sheetProperties)) if (object.id == tabName) return object.data;
    return null;
}

const _arrayDelete = (array, element) => {if (array.includes(element)) array.splice(array.indexOf(element), 1); return element;}

const _getNameFromDescription = description => description.split(" ")[0].split("\n")[0];

const _tryJSONParse = object => { try{return JSON.parse(object)} catch (err) {return object} }

export const monkrulsmodel = {init, loadModel, modelNodesModified, modelConnectorsModified, isConnectable, 
    nodeDescriptionChanged, getModelAsFile, getModel, ADDED: "added", REMOVED: "removed", MODIFIED: "modified"};