/** 
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

const asbModel = {}, idCache = {};
let routeCounter = 0, listenerCounter = 0, outputCounter = 0;

function modelModified(shapeName, id, properties) {
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

export const model = {modelModified};