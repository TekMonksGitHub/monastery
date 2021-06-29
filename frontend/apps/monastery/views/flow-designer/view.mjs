/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {blackboard} from "/framework/js/blackboard.mjs";

const MODULE_PATH = `${import.meta.url.substring(0,import.meta.url.lastIndexOf("/"))}`;
const COMPONENTS_NEEDED_BY_THE_VIEW_PAGE = ["dialog-box", "flow-diagram", "pluggable-ribbon"];
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_SHAPE_INIT = "SHAPE_INIT_ON_RIBBON", MSG_ADD_SHAPE = "ADD_SHAPE", 
    MSG_SHAPE_CLICKED_ON_RIBBON = "SHAPE_CLICKED_ON_RIBBON", MSG_SHAPE_CLICKED = "SHAPE_CLICKED", GRAPH_ID = "flowui";

function init() {
    blackboard.registerListener(MSG_SHAPE_INIT, message => blackboard.broadcastMessage(MSG_REGISTER_SHAPE, 
        {...message, graphID: GRAPH_ID, rounded: true}));
    blackboard.registerListener(MSG_SHAPE_CLICKED_ON_RIBBON, message => blackboard.broadcastMessage(MSG_ADD_SHAPE, 
        {...message, graphID: GRAPH_ID, value:"", x:20, y:20, width:40, height:40}));
    blackboard.registerListener(MSG_SHAPE_CLICKED, message => _shapeObjectClicked(message.name, message.id));

    for (const component of COMPONENTS_NEEDED_BY_THE_VIEW_PAGE) import (`./components/${component}/${component}.mjs`);
}

function _shapeObjectClicked(shapeName, shapeID) {
	const html = `Shape ${shapeName} clicked ${shapeID}`;
	const dialogBox = window.monkshu_env.components["dialog-box"];
	dialogBox.showDialog(`${MODULE_PATH}/page/dialogPropertiesBottom.json`, html, null, [], _=>{});
}

export const view = {init};