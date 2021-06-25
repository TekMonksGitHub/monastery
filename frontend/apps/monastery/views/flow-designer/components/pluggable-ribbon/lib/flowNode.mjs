/**
 * Base module for flow nodes inside pluggable ribbon 
 * (C) 2020 TekMonks. All rights reserved.
 */

import {blackboard} from "/framework/js/blackboard.mjs";

const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_ADD_SHAPE = "ADD_SHAPE", MSG_SHAPE_CLICKED = "SHAPE_CLICKED";

class FlowNode {
    DIAG_ELEMENT_ID; CONF; I18N; SHAPE_NAME; IMAGE;

    async init(shapeName, pluginName, pluginData, pluginPath) {
        this.DIAG_ELEMENT_ID = pluginData["graphID"]; this.SHAPE_NAME = shapeName;
        this.CONF = btoa(await (await fetch(`${pluginPath}/${pluginName}.json`)).json());
        this.I18N = (await import(`${pluginPath}/${pluginName}.i18n.mjs`)).i18n; 
        
        const svgSource64 = btoa(await (await fetch(`${pluginPath}/${pluginName}.svg`)).text());
        const svg = "data:image/svg+xml," + svgSource64; this.IMAGE = "data:image/svg+xml;base64," + svgSource64;
        blackboard.broadcastMessage(MSG_REGISTER_SHAPE, {graphID: this.DIAG_ELEMENT_ID, name: this.SHAPE_NAME, svg, rounded: true});
        blackboard.registerListener(MSG_SHAPE_CLICKED, message => {if (message.name==this.SHAPE_NAME) this._shapeObjectClicked(message.id)});
    }

    clicked = _ => blackboard.broadcastMessage(MSG_ADD_SHAPE, {graphID:this.DIAG_ELEMENT_ID, 
        name:this.SHAPE_NAME, value:"", x:20, y:20, width:40, height:40, id:this._getUniqueID()});

    getImage = _ => this.IMAGE;
    
    getHelpText = (lang=en) => this.I18N.HELP_TEXTS[lang];
    
    getConf() {
        const retConf = {properties:[], rules:[]};
        for (const property of this.CONF.properties) {
            const name = Object.keys(property)[0];
            const valTuple = property[name].split(":");
            const propertyToPush = {name};
            if (valTuple.length == 1 || valTuple[0].toLowerCase() == "HARDCODED") propertyToPush.hardCodedVal = true;
            else {propertyToPush.hardCodedVal = false; propertyToPush.rule = valTuple[1];}
            retConf.properties.push(propertyToPush);
        }
    
        for (const rule of Object.keys(this.CONF.rules)) {
            const ruleName = rule; const ruleTuple = this.CONF.rules[rule].split(":");
            const inputType = ruleTuple[0]; const required = ruleTuple.length > 1 ? 
                ruleTuple[1].toLowerCase() == "required" : false;
            const jsFunction = ruleTuple.length >= 3 ? ruleTuple[2] : undefined;
            const defaultValues = ruleTuple.length >= 4 ? ruleTuple.subarray[3] : undefined;
            retConf.rules.push({ruleName, inputType, required, jsFunction, defaultValues});
        }
    
        return retConf;
    }
    
    _shapeObjectClicked = id => alert(`${this.SHAPE_NAME} with ID ${id} clicked.`);
    
    _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;
}

export const flowNode = {newFlowNode:_=>new FlowNode()};