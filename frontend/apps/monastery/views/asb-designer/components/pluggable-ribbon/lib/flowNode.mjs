/**
 * Base module for flow nodes inside pluggable ribbon 
 * (C) 2020 TekMonks. All rights reserved.
 */

import {blackboard} from "/framework/js/blackboard.mjs";

const MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON";

class FlowNode {
    DIAG_ELEMENT_ID; PLUGIN_PATH; I18N; SHAPE_NAME; IMAGE; ID_MAP = {};

    async init(pluginName, pluginPath) {
        this.SHAPE_NAME = pluginName; this.PLUGIN_PATH = pluginPath;
        this.I18N = (await import(`${pluginPath}/${pluginName}.i18n.mjs`)).i18n; 
        
        const svgSource64 = btoa(await (await fetch(`${pluginPath}/${pluginName}.svg`)).text());
        const svg = "data:image/svg+xml," + svgSource64; this.IMAGE = "data:image/svg+xml;base64," + svgSource64;
        blackboard.broadcastMessage(MSG_SHAPE_INIT, {name: this.SHAPE_NAME, svg});
    }

    clicked = _ => this.#clicked();

    getImage = _ => this.IMAGE;
    
    getHelpText = (lang=en) => this.I18N.HELP_TEXTS[lang];

    geti18n = _ => this.I18N;

    releaseID = id => delete this.ID_MAP[id];

    // Private Members    
    #clicked() {
        const uniqueID = FlowNode.#getUniqueID(); this.ID_MAP[uniqueID] = this.PLUGIN_PATH;
        blackboard.broadcastMessage(MSG_SHAPE_CLICKED_ON_RIBBON, {name:this.SHAPE_NAME, id:uniqueID});
    }

    static #getUniqueID = _ => `${Date.now()}${Math.random()*100}`;
}

export const newFlowNode = _ => new FlowNode();