/**
 * Base module for flow nodes inside pluggable ribbon 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

const MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON";

class FlowNode {
    DIAG_ELEMENT_ID; PLUGIN_PATH; I18N; SHAPE_NAME; IMAGE; SHAPE_CONNECTABLE; ID_MAP = {}; 

    async init(pluginName, pluginPath, connectable=true) {
        this.SHAPE_NAME = pluginName; this.PLUGIN_PATH = pluginPath; this.SHAPE_CONNECTABLE = connectable;
        this.I18N = (await import(`${pluginPath}/${pluginName}.i18n.mjs`)).i18n; 
        
        const svgSource64 = btoa(await (await fetch(`${pluginPath}/${pluginName}.svg`)).text());
        const svg = "data:image/svg+xml," + svgSource64; this.IMAGE = "data:image/svg+xml;base64," + svgSource64;
        blackboard.broadcastMessage(MSG_SHAPE_INIT, {name: this.SHAPE_NAME, imgURL: svg});
    }

    clicked = _ => this.#clicked();

    getImage = _ => this.IMAGE;
    
    getHelpText = (lang=en) => this.I18N.HELP_TEXTS[lang];

    getDescriptiveName = (lang=en) => this.I18N.DESCRIPTIVE_NAME[lang];

    geti18n = _ => this.I18N;

    releaseID = id => delete this.ID_MAP[id];

    // Private Members    
    #clicked() {
        const uniqueID = FlowNode.#getUniqueID(); this.ID_MAP[uniqueID] = this.PLUGIN_PATH;
        const NODE_REPOSITORY = window.monkshu_env.NODE_REPOSITORY;
        const name = FlowNode.#capitalizeFirstChar(this.SHAPE_NAME)+NODE_REPOSITORY.getNodeUniquePrefix(this.SHAPE_NAME);
        NODE_REPOSITORY.registerNode(name, this.SHAPE_NAME);
        blackboard.broadcastMessage(MSG_SHAPE_CLICKED_ON_RIBBON, {name:this.SHAPE_NAME, id:uniqueID, 
            connectable: this.SHAPE_CONNECTABLE, label: name});
    }

    static #getUniqueID = _ => `${Date.now()}${Math.random()*100}`;

    static #capitalizeFirstChar = s => s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
}

export const newFlowNode = _ => new FlowNode();