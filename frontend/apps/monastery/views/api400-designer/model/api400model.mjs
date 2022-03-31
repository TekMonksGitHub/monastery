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
 
     // add variables
     for (const variable of api400modelObj.rule_parameters) {
         const id = variable.id||_getUniqueID(); idCache[id] = variable;
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: variable.nodeName||"variable", id, description: variable.description, properties: {...variable}, connectable: false});
     }
 
     // add data
     for (const data of api400modelObj.data) {
         const id = data.id||_getUniqueID(); idCache[id] = data; const clone = util.clone(data); 
         clone.data = clone.data_raw||(clone.data.startsWith?.(CSVSCHEME)?clone.data.substring(CSVSCHEME.length):
             clone.data.startsWith?.(CSVLOOKUPTABLESCHEME)?clone.data.substring(CSVLOOKUPTABLESCHEME.length) : 
             typeof clone.data == "object" ? JSON.stringify(clone.data) : clone.data);
         if (!clone.type) { if (clone.data.startsWith?.(CSVSCHEME)||clone.data.startsWith?.(CSVLOOKUPTABLESCHEME)) clone.type = "CSV";
             else clone.type = "JSON/Javascript"; }
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: clone.nodeName||"data", id, description: clone.description, properties: {...clone}, connectable: false});
     }
 
     // add functions
     for (const functionThis of api400modelObj.functions) {
         const id = functionThis.id||_getUniqueID(); idCache[id] = functionThis;
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: functionThis.nodeName||"functions", id, description: functionThis.description, properties: {...functionThis}, connectable: false});
     }
 
     // add outputs
     for (const output of api400modelObj.outputs) {
         const id = output.id||_getUniqueID(); idCache[id] = output;
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: output.nodeName||"output", id, description: output.description, properties: {...output}, connectable: false});
     }
 
     // add objects
     for (const object of api400modelObj.objects) {
         const id = object.id||_getUniqueID(); idCache[id] = object; const clone = util.clone(object);
         clone.data = clone.data_raw||(clone.data.startsWith?.(CSVSCHEME)?clone.data.substring(CSVSCHEME.length):
             typeof clone.data == "object" ? JSON.stringify(clone.data) : clone.data);
         if (!clone.type) { if (clone.data.startsWith?.(CSVSCHEME)) clone.type = "CSV"; else clone.type = "JSON/Javascript"; }
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: clone.nodeName||"object", id, description: clone.description, properties: {...clone}, connectable: false});
     }
 
     // add simulations
     for (const simulation of api400modelObj.simulations) {
         const id = simulation.id||_getUniqueID(); idCache[id] = simulation;
         blackboard.broadcastMessage(MSG_ADD_NODE, {nodeName: simulation.nodeName||"simulate", id, description: simulation.description, properties: {...simulation}, connectable: false});
     }
 }
 
 function modelNodesModified(type, nodeName, id, properties) {
     console.log("modelNodesModified");
     console.log(type, nodeName, id, properties);
     if (type == api400model.ADDED) return _nodeAdded(nodeName, id, properties);
     if (type == api400model.REMOVED) return _nodeRemoved(nodeName, id);
     if (type == api400model.MODIFIED) return _nodeModified(nodeName, id, properties);
 
     return false;   // unknown modification
 }
 
 function modelConnectorsModified(type, sourceName, targetName, sourceID, targetID) {
     console.log("modelConnectorsModified");
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
         const sourceBundle = _findRuleBundleWithThisRule(idCache[sourceID]), targetBundle = _findRuleBundleWithThisRule(idCache[targetID]);
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
     console.log("nodeDescriptionChanged");
     if (!idCache[id]) return; 
     
     const oldNameTracksDescription = _getNameFromDescription(idCache[id].description) == idCache[id].name;
     if (idCache[id].name && oldNameTracksDescription) {
         idCache[id].name = _getNameFromDescription(description); idCache[id].description = description;
     } else idCache[id].description = description;
 
     // rule bundle name is alaways same as description for decision tables
     if (idCache[id].nodeName == "decision") _findRuleBundleWithThisRule(idCache[id]).name = _getNameFromDescription(description);    
 }
 
 function getModel() {
     const retModel = util.clone(api400modelObj); 
     retModel.apicl = algos.sortDependencies(retModel.apicl[0]);  // sort apicl commands in the order of dependencies
     // for (const rules_bundle of retModel.rule_bundles) rules_bundle.commands = algos.sortDependencies(rules_bundle.commands);  // sort rules within a bundle in the order of dependencies
     const APICL = algos.convertIntoAPICL(retModel.apicl);
     return APICL;
 }
 const getModelAsFile = name => { 
     return {data: JSON.stringify(getModel(), null, 4), mime: "application/json", filename: `${name||"api400api"}.apicl`}}
 
 const _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;    
 
 function _findRuleBundleWithThisRule(rule) {
     for (const bundle of api400modelObj.apicl) if (bundle.commands.includes(rule)) return bundle;
     return null;
 }
 
 function _findOrCreateRuleBundle(name=current_rule_bundle, forceNew) {
     if (!forceNew) for (const bundle of api400modelObj.apicl) if (bundle.name == name) return bundle;
     const newBundle = {name, commands:[], id:_getUniqueID()}; api400modelObj.apicl.push(newBundle); 
     console.log(newBundle);
     return newBundle;
 }
 
 const _findAndDeleteRuleBundle = (name=current_rule_bundle) => _arrayDelete(api400modelObj.rule_bundles, _findOrCreateRuleBundle(name));
 
 function _nodeAdded(nodeName, id, properties) {
     const node = idCache[id] ? idCache[id] : JSON.parse(JSON.stringify(properties)); node.nodeName = nodeName;
     if (idCache[id]) {_nodeModified(nodeName, id, properties); return;}  // node properties modified
     console.log(nodeName, id, properties,node);
     const name = _getNameFromDescription(node.description); 
 
     if (nodeName == "rule") _findOrCreateRuleBundle().commands.push(node); 
     else if (nodeName == "strapi") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "runsql") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "runjs") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "goto") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "chgvar") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "sndapimsg") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "condition") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "iftrue") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "iffalse") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "endapi") _findOrCreateRuleBundle().commands.push(node);
     else if (nodeName == "variable") api400modelObj.rule_parameters.push(node);
     else if (nodeName == "decision") _findOrCreateRuleBundle(name, true).commands.push(node);
     else if (nodeName == "data") {node.name = name; api400modelObj.data.push(node);}
     else if (nodeName == "functions") {node.name = name; api400modelObj.functions.push(node);}
     else if (nodeName == "output") api400modelObj.outputs.push(node);
     else if (nodeName == "object") {node.name = name; api400modelObj.objects.push(node);}
     else if (nodeName == "simulate") api400modelObj.simulations.push(node);
     
     node.id = id; idCache[id] = node;   // transfer ID and cache the node
     console.log(api400modelObj);
     return true;
 }
 
 function _nodeRemoved(nodeName, id) {
     console.log(api400modelObj)
     if (!idCache[id]) return;   // we don't know of this node
     const node = idCache[id];
 
     if (nodeName == "rule") {const bundle = _findOrCreateRuleBundle(); _arrayDelete(bundle.commands, node); if (!bundle.commands.length) _findAndDeleteRuleBundle();}
     else if (nodeName == "decision") _arrayDelete(api400modelObj.rule_bundles, _findRuleBundleWithThisRule(node));
     else if (nodeName == "variable") _arrayDelete(api400modelObj.rule_parameters, node);
     else if (nodeName == "data") _arrayDelete(api400modelObj.data, node);
     else if (nodeName == "functions") _arrayDelete(api400modelObj.functions, node);
     else if (nodeName == "functions") _arrayDelete(api400modelObj.outputs, node);
     else if (nodeName == "object") _arrayDelete(api400modelObj.objects, node);
     else if (nodeName == "simulate") _arrayDelete(api400modelObj.simulations, node);
     else if (nodeName == "strapi") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "runsql") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "runjs") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "goto") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "chgvar") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "sndapimsg") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "condition") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "iftrue") _arrayDelete(api400modelObj.apicl[0].commands, node);
     else if (nodeName == "iffalse") _arrayDelete(api400modelObj.apicl[0].commands, node);
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
        } else if (key.includes("listbox") && (nodeName == "strapi" || nodeName == "sndapimsg")) { 
            if (properties[key]!='') { parameters = properties[key]; }
        } else if (key.includes("listbox") && (nodeName == "chgvar" )) { 
            if (properties[key]!='') { variables = properties[key]; }
        } else idCache[id][key] = properties[key];   
     }
     if (parameters && parameters.length!=0) { idCache[id].parameters = parameters; }
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