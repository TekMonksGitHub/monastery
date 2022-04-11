/** 
 * Model file for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import {algos} from "./algos.mjs";
 import {util} from "/framework/js/util.mjs";
 import {blackboard} from "/framework/js/blackboard.mjs";
 
 const EMPTY_MODEL = {apicl:[]}, DEFAULT_BUNDLE="commands";
 let api400modelObj = EMPTY_MODEL, idCache = {}, current_rule_bundle = DEFAULT_BUNDLE;
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
     blackboard.registerListener(MSG_RESET, _ => {api400modelObj = EMPTY_MODEL, idCache = {}, current_rule_bundle = DEFAULT_BUNDLE;}, true);
     blackboard.registerListener(MSG_LOAD_MODEL, message => loadModel(message.data));
 }
 
 function loadModel(jsonModel) {
     
    console.log("loadModel");
    console.log(jsonModel);
     try {api400modelObj = JSON.parse(jsonModel)} 
     catch (err) {LOG.error(`Bad API400 model, error ${err}, skipping.`); return;}
     if (!(api400modelObj.apicl)) {LOG.error(`Bad API400 model, not in right format.`); return;}
 
    // first add all the rules and bundles and decision tables
    for (const apicl of api400modelObj.apicl) for (const command of apicl.commands) {
        const id = command.id||_getUniqueID(); idCache[id] = command; const clone = util.clone(command);
        const nodeName = clone.nodeName; 
        console.log(clone);
        blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName, id, description: clone.description, properties: {...clone}, connectable: true});
    }
    
    // first add all the rules and bundles and decision tables
     for (const bundle of api400modelObj.rule_bundles) for (const rule of bundle.commands) {
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
     for (const bundle of api400modelObj.apicl) if (!bundle.commands.decisiontable) 
         for (const command of bundle.commands) if (command.dependencies) for (const dependency of command.dependencies) connectNodes(dependency, command.id);

     

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
             if ((!dependencies)||(!dependencies.length)||dependencies.indexOf(sourceNode.id)==-1) return;
             else _arrayDelete(dependencies, sourceNode.id);
             if (dependencies.length == 0) delete targetNode.dependencies;    // no longer required
         }
     }
 
     if (sourceName == "rule" && targetName == "rule") addOrRemoveDependencies(idCache[sourceID], idCache[targetID], type);  // rule to rule
     else {    // rule to decision or decision to rule or decision to decision, so add dependency between bundles instead
         const sourceBundle = _findCommandsWithThisCommand(idCache[sourceID]), targetBundle = _findCommandsWithThisCommand(idCache[targetID]);
         if ((!sourceBundle) || (!targetBundle)) {LOG.error("Rules bundle for rules being connected not found."); return;}
         addOrRemoveDependencies(sourceBundle, targetBundle, type);
         addOrRemoveDependencies(idCache[sourceID], idCache[targetID], type);    // also visually connect the rule nodes
     }
 }
 
 function isConnectable(sourceName, targetName, sourceID, targetID) {    // are these nodes connectable
     if (sourceID == targetID) return false; 
     if(targetName =="strapi") return false;
     if(sourceName=="endapi") return false;
     if (((sourceName == "condition")&&!((targetName == "iftrue")||(targetName == "iffalse")))) return false;   
     if (((sourceName != "condition")&&((targetName == "iftrue")||(targetName == "iffalse")))) return false;  
     if((targetName == "condition")&&(idCache[targetID].dependencies)&&(sourceName != "goto")) return false;
     if((sourceName=="sndapimsg")&&(targetName!="endapi")) return false;
     return true
     
 }
 
 function nodeDescriptionChanged(_nodeName, id, description) {

    if (!idCache[id]) return; 
     
    const oldNameTracksDescription = _getNameFromDescription(idCache[id].description) == idCache[id].name;
    if (idCache[id].name && oldNameTracksDescription) {
        idCache[id].name = _getNameFromDescription(description); idCache[id].description = description;
    } else idCache[id].description = description;
 
     // rule bundle name is alaways same as description for decision tables
     if (idCache[id].nodeName == "decision") _findCommandsWithThisCommand(idCache[id]).name = _getNameFromDescription(description);    
 }
 
 function getModel() {
     const retModel = util.clone(api400modelObj); 
     retModel.apicl = algos.sortDependencies(retModel.apicl[0]);  // sort apicl commands in the order of dependencies
     const APICL = algos.convertIntoAPICL(retModel.apicl);
     return APICL;
 }
 const getModelAsFile = name => { 
     return {data: JSON.stringify(getModel(), null, 4), mime: "application/json", filename: `${name||"api400api"}.apicl`}}
 
 const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    
 
 function _findCommandsWithThisCommand(rule) {
     for (const bundle of api400modelObj.apicl) if (bundle.commands.includes(rule)) return bundle;
     return null;
 }
 
 function _findOrCreateCommand(name=current_rule_bundle, forceNew) {
     if (!forceNew) for (const bundle of api400modelObj.apicl) if (bundle.name == name) return bundle;
     const newBundle = {name, commands:[], id:_getUniqueID()}; 
     console.log(newBundle);
     api400modelObj.apicl.push(newBundle); 
     console.log(api400modelObj);
     return newBundle;
 }
 
 const _findAndDeleteCommand = (name=current_rule_bundle) => _arrayDelete(api400modelObj.rule_bundles, _findOrCreateCommand(name));
 
 function _nodeAdded(nodeName, id, properties) {
     const node = idCache[id] ? idCache[id] : JSON.parse(JSON.stringify(properties)); node.nodeName = nodeName;
     if (idCache[id]) {_nodeModified(nodeName, id, properties); return;}  // node properties modified
     console.log(nodeName, id, properties,node);
     const name = _getNameFromDescription(node.description); 
 
     if (nodeName == "rule") _findOrCreateCommand().commands.push(node); 
     else if (nodeName == "strapi") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "runsql") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "runjs") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "goto") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "chgvar") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "sndapimsg") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "condition") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "iftrue") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "iffalse") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "chgdtaara") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "rtvdtaara") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "call") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "runsqlprc") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "rest") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "map") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "substr") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "qrcvdtaq") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "dsppfm") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "log") _findOrCreateCommand().commands.push(node);
     else if (nodeName == "endapi") _findOrCreateCommand().commands.push(node);
     
     node.id = id; idCache[id] = node;   // transfer ID and cache the node
     console.log(api400modelObj);
     return true;
 }
 
 function _nodeRemoved(nodeName, id) {

    if (!idCache[id]) return;   // we don't know of this node
     const node = idCache[id];
 
     if (nodeName == "rule") {const bundle = _findOrCreateCommand(); _arrayDelete(bundle.commands, node); if (!bundle.commands.length) _findAndDeleteCommand();}
     else if (nodeName == "strapi") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "runsql") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "runjs") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "goto") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "chgvar") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "sndapimsg") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "condition") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "iftrue") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "iffalse") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "chgdtaara") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "rtvdtaara") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "call") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "runsqlprc") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "rest") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "map") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "substr") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "qrcvdtaq") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "dsppfm") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "log") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "endapi") _arrayDelete(api400modelObj.apicl[0].commands, node);

     delete idCache[id]; // uncache
     return true;
 }
 
 function _nodeModified(nodeName, id, properties) {
     console.log("_nodeModified");
     console.log(nodeName, id, properties,idCache);
     let parameters,variables = [];
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
        } else if (key.includes("listbox") && (nodeName == "strapi" || nodeName == "sndapimsg" || nodeName == "call" || nodeName == "runsqlprc")) { 
            if (properties[key]!='') { parameters = properties[key]; }
        } else if (key.includes("listbox") && (nodeName == "chgvar" || nodeName == "substr"|| nodeName == "map")) { 
            if (properties[key]!='') { variables = properties[key]; }
        } else idCache[id][key] = properties[key];   
     }
     if (parameters && parameters.length!=0) { idCache[id].parameters = parameters.filter(Boolean); }
     if (variables && variables.length!=0) { idCache[id].variables = variables; }

     return true;
 }
 
 function _getSheetTabData(sheetProperties, tabName) {
     for (const object of JSON.parse(sheetProperties)) if (object.id == tabName) return object.data;
     return null;
 }
 
 const _arrayDelete = (array, element) => {if (array.includes(element)) array.splice(array.indexOf(element), 1); return element;}
 
 const _getNameFromDescription = description => description.split(" ")[0].split("\n")[0];
 
 const _tryJSONParse = object => { try{return JSON.parse(object)} catch (err) {return object} }
 
 export const api400model = {init, loadModel, modelNodesModified, modelConnectorsModified, isConnectable, 
     nodeDescriptionChanged, getModelAsFile, getModel, ADDED: "added", REMOVED: "removed", MODIFIED: "modified"};
