/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

let asbModel = {}, idCache = {};
let routeCounter = 0, listenerCounter = 0, outputCounter = 0;
const MSG_NODES_MODIFIED = "NODES_MODIFIED", MSG_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED", 
    MSG_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    MSG_GET_MODEL = "GET_MODEL", MSG_RESET = "RESET", MSG_LOAD_MODEL = "LOAD_MODEL", 
    MSG_CONNECT_NODES = "CONNECT_NODES", MSG_ADD_NODE = "ADD_NODE";

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
    blackboard.registerListener(MSG_RESET, _ => {asbModel = {}; idCache = {};}, true)
    blackboard.registerListener(MSG_LOAD_MODEL, message => loadModel(message.data));
}

function loadModel(jsonModel) {
    try {asbModel = JSON.parse(jsonModel)} 
    catch (err) {LOG.error(`Bad ASB model, error ${err}, skipping.`); return;}

    const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    
    const _getNodeType = node => node.startsWith("listener") ? `${asbModel[node].type}listener` : node.startsWith("output") ?
        `${asbModel[node].type}output` : asbModel[node].type;

    for (const node in asbModel) {  // first add all the nodes
        const id = _getUniqueID(); idCache[id] = node;
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: _getNodeType(node), id, description: asbModel[node].description, properties: {...asbModel[node]}});
    }

    const _findID = node => {for (const id in idCache) if (idCache[id] == node) return id;}; // now add all the connectors
    for (const node in asbModel) if (asbModel[node].dependencies) for (const dependency of asbModel[node].dependencies) { 
        const sourceNodeKey = dependency[0], targetNodeKey = node; 
        if (!asbModel[sourceNodeKey]) {LOG.error(`Bad dependency in the model ${sourceNodeKey}, skipping.`); break;}
        const sourceName = _getNodeType(sourceNodeKey), targetName = _getNodeType(targetNodeKey);
        const sourceID = _findID(sourceNodeKey), targetID = _findID(targetNodeKey);
        blackboard.broadcastMessage(MSG_CONNECT_NODES, {sourceName, targetName, sourceID, targetID});
    }
}

function modelNodesModified(type, nodeName, id, properties) {
    if (type == model.ADDED) return _nodeAdded(nodeName, id, properties);
    if (type == model.REMOVED) return _nodeRemoved(id);
    if (type == model.MODIFIED) return _nodeModified(nodeName, id, properties);

    return false;   // unknown modification
}

function modelConnectorsModified(type, _sourceName, _targetName, sourceID, targetID) {
    if ((!idCache[sourceID]) || (!idCache[targetID])) return;   // not connected

    if (type == model.ADDED) {
        if (!asbModel[idCache[targetID]].dependencies) asbModel[idCache[targetID]].dependencies = []; 
        asbModel[idCache[targetID]].dependencies.push([idCache[sourceID]]);
    }
    else if (type == model.REMOVED && asbModel[idCache[targetID]]) {
        const dependencies = asbModel[idCache[targetID]].dependencies;
        if ((!dependencies)||(!dependencies.length)) return;    // no dependencies found.
        for (const [i,dependency] of dependencies.entries()) {
            if (dependency.includes(idCache[sourceID])) dependency.splice(dependency.indexOf(idCache[sourceID]), 1);
            if (dependency.length == 0) dependencies.splice(i, 1);  // if this is now an empty array, remove it
        }
    }
}

function isConnectable(_sourceName, _targetName, sourceID, targetID) {    // are these nodes connectable
    if (sourceID == targetID) return false; // can't loop from same node to itself

    const targetDependencies = asbModel[idCache[targetID]]?.dependencies;
    if (targetDependencies) for (const dependency of targetDependencies) if (dependency.includes(idCache[sourceID])) return false;   // can't reconnect same nodes again
    
    return true;
}

function nodeDescriptionChanged(_nodeName, id, description) {
    if (!idCache[id]) return; 
    asbModel[idCache[id]].description = description;
}

const getModelAsFile = _ => {return {data: JSON.stringify(asbModel, null, 4), mime: "application/json", filename: "pipeline_asbFlow.json"}}

function _nodeAdded(nodeName, id, properties) {
    const modelProperty = idCache[id] ? idCache[id] : nodeName.toLowerCase().endsWith("listener") ? 
        `listener${++listenerCounter}` : nodeName.toLowerCase().endsWith("output") ? `output${++outputCounter}` : `route${++routeCounter}`;
    if (modelProperty.startsWith("listener")) asbModel[modelProperty] = {type: nodeName.substring(0, nodeName.length-8).toLowerCase()};
    else if (modelProperty.startsWith("output")) asbModel[modelProperty] = {type: nodeName.substring(0, nodeName.length-6).toLowerCase()};
    else asbModel[modelProperty] = {type: nodeName.toLowerCase()};

    // listeners are message generators
    if (modelProperty.startsWith("listener")) asbModel[modelProperty].isMessageGenerator = true;

    // transfer the properties
    for (const key in properties) asbModel[modelProperty][key] = properties[key];

    // cache the property values 
    idCache[id] = modelProperty;

    return true;
}

function _nodeRemoved(id) {
    const modelProperty = idCache[id]; 
    if (modelProperty) delete asbModel[modelProperty];
    return true;
}

function _nodeModified(_nodeName, id, properties) {
    if (!idCache[id]) return false; 
    // transfer the properties
    for (const key in properties) asbModel[idCache[id]][key] = properties[key];
    return true;
}

export const model = {init, loadModel, modelNodesModified, modelConnectorsModified, isConnectable, nodeDescriptionChanged, 
    getModelAsFile, ADDED: "added", REMOVED: "removed", MODIFIED: "modified"};