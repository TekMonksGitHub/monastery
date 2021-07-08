/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

const asbModel = {}, idCache = {};
let routeCounter = 0, listenerCounter = 0, outputCounter = 0;
const MSG_NODES_MODIFIED = "NODES_MODIFIED", MSG_CONNECTORS_MODIFIED = "CONNECTORS_MODIFIED", 
    MSG_NODE_DESCRIPTION_CHANGED = "NODE_DESCRIPTION_CHANGED", MSG_ARE_NODES_CONNECTABLE = "ARE_NODES_CONNECTABLE",
    MSG_CONNECT_NODES = "CONNECT_NODES", MSG_LABEL_SHAPE = "LABEL_NODE", MSG_ADD_NODE = "ADD_NODE";

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
}

function modelNodesModified(type, nodeName, id, properties) {
    if (type == model.ADDED) return _nodeAdded(nodeName, id, properties);
    if (type == model.REMOVED) return _nodeRemoved(id);

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
    return true;
}

function nodeDescriptionChanged(_nodeName, id, description) {
    if (!idCache[id]) return; 
    asbModel[idCache[id]].description = description;
}

function _nodeAdded(nodeName, id, properties) {
    const modelProperty = idCache[id] ? idCache[id] : nodeName.endsWith("Listener") ? 
        `listener${++listenerCounter}` : nodeName.endsWith("Output") ? `output${++outputCounter}` : `route${++routeCounter}`;
    if (modelProperty.startsWith("listener")) asbModel[modelProperty] = {type: nodeName.substring(0, nodeName.length-8)};
    else if (modelProperty.startsWith("output")) asbModel[modelProperty] = {type: nodeName.substring(0, nodeName.length-6)};
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

export const model = {init, modelNodesModified, modelConnectorsModified, isConnectable, nodeDescriptionChanged, 
    ADDED: "added", REMOVED: "removed"};