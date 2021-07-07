/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const asbModel = {}, idCache = {};
let routeCounter = 0, listenerCounter = 0, outputCounter = 0;

function modelNodesModified(type, shapeName, id, properties) {
    if (type == model.ADDED) return _nodeAdded(shapeName, id, properties);
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

function nodeDescriptionChanged(_shapeName, id, description) {
    if (!idCache[id]) return; 
    asbModel[idCache[id]].description = description;
}

function _nodeAdded(shapeName, id, properties) {
    const modelProperty = idCache[id] ? idCache[id] : shapeName.endsWith("Listener") ? 
        `listener${++listenerCounter}` : shapeName.endsWith("Output") ? `output${++outputCounter}` : `route${++routeCounter}`;
    if (modelProperty.startsWith("listener")) asbModel[modelProperty] = {type: shapeName.substring(0, shapeName.length-8)};
    else if (modelProperty.startsWith("output")) asbModel[modelProperty] = {type: shapeName.substring(0, shapeName.length-6)};
    else asbModel[modelProperty] = {type: shapeName.toLowerCase()};

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

export const model = {modelNodesModified, modelConnectorsModified, isConnectable, nodeDescriptionChanged, 
    ADDED: "added", REMOVED: "removed"};