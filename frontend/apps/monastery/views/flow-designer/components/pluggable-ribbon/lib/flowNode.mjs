/**
 * Base module for flow nodes inside pluggable ribbon 
 * (C) 2020 TekMonks. All rights reserved.
 */

import {blackboard} from "/framework/js/blackboard.mjs";

const MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON";

class FlowNode {
    DIAG_ELEMENT_ID; CONF; I18N; SHAPE_NAME; IMAGE;

    async init(shapeName, pluginName, pluginPath) {
        this.SHAPE_NAME = shapeName;
        this.CONF = await (await fetch(`${pluginPath}/${pluginName}.json`)).json();
        this.I18N = (await import(`${pluginPath}/${pluginName}.i18n.mjs`)).i18n; 
        
        const svgSource64 = btoa(await (await fetch(`${pluginPath}/${pluginName}.svg`)).text());
        const svg = "data:image/svg+xml," + svgSource64; this.IMAGE = "data:image/svg+xml;base64," + svgSource64;
        blackboard.broadcastMessage(MSG_SHAPE_INIT, {name: this.SHAPE_NAME, svg, rounded: true});
    }

    clicked = _ => blackboard.broadcastMessage(MSG_SHAPE_CLICKED_ON_RIBBON, {name:this.SHAPE_NAME, id:this._getUniqueID()});

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
    
    _getUniqueID = _ => `${Date.now()}${Math.random()*100}`;
}

export const newFlowNode = _ => new FlowNode();