/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {blackboard} from "/framework/js/blackboard.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const graphs = {};
const GRAPH_CONNECTABLE = true;
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_ADD_SHAPE = "ADD_SHAPE", MSG_SHAPE_CLICKED = "SHAPE_CLICKED";
const COMPONENT_PATH = `${APP_CONSTANTS.VIEW_COMPONENT_PATH}/flow-diagram/`;

function elementConnected(element) {
    let data = {};

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
	
	if (element.id) {
		if (!flow_diagram.datas) flow_diagram.datas = {}; flow_diagram.datas[element.id] = data;
	} else flow_diagram.data = data;

	blackboard.registerListener(MSG_REGISTER_SHAPE, message => registerShape(message.graphID, message.name, message.svg, message.rounded));
	blackboard.registerListener(MSG_ADD_SHAPE, message => insertNode(message.graphID, message.id, message.value, message.name, message.x, message.y, message.width, message.height));
}

async function insertNode(hostID, id, value, shapeName, x=0, y=0, width=80, height=30) {
	const graph = await _getGraph(hostID); if (!graph) return;
	const parent = graph.getDefaultParent();
	graph.getModel().beginUpdate();
	graph.insertVertex(parent, id, value, x, y, width, height, shapeName);
	graph.getModel().endUpdate();
}

async function registerShape(hostID, name, svgData, rounded=false) {
	const graph = await _getGraph(hostID); if (!graph) return;
	const style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
	style[mxConstants.STYLE_IMAGE] = svgData;
	style[mxConstants.STYLE_ROUNDED]= rounded;
	graph.getStylesheet().putCellStyle(name,style);
	return true;
}

async function _getGraph(hostID) {
	if (graphs[hostID]) return graphs[hostID];	// already done

	const containerID = "diagram";
	window.mxBasePath = `${COMPONENT_PATH}/3p/mxGraph`;
	
	await $$.require(`${window.mxBasePath}/mxClient.js`); 

	if (!mxClient.isBrowserSupported()) {mxUtils.error("Browser is not supported!", 200, false); return false;}
	mxGraphHandler.prototype.guidesEnabled = true; mxEdgeHandler.prototype.snapToTerminals = true;
	mxConnectionHandler.prototype.connectImage = new mxImage(`${COMPONENT_PATH}/connector.svg`, 16, 16);

	const shadowRoot = flow_diagram.getShadowRootByHostId(hostID);
    let container = shadowRoot.querySelector(`#${containerID}`);
    // mxGraph has issues with web components
    container = _createNonWebComponentDiagramContainer(container);

	mxEvent.disableContextMenu(container);
	graphs[hostID] = new mxGraph(container, null, "fastest"); graphs[hostID].setConnectable(GRAPH_CONNECTABLE);
	new mxRubberband(graphs[hostID]); 
	graphs[hostID].addListener(mxEvent.CLICK, (_sender, evt) => {
		const cell = evt.getProperty("cell");
		if (cell?.vertex) blackboard.broadcastMessage(MSG_SHAPE_CLICKED, {name:cell.style, id:cell.id});
	});

	return graphs[hostID];
}

function _createNonWebComponentDiagramContainer(container) {
    const diagramContainer = window.document.createElement("div"); diagramContainer.id = "diagram";
    diagramContainer.style.cssText = window.getComputedStyle(container).cssText; diagramContainer.style.visibility = "hidden";
    window.document.body.appendChild(diagramContainer);
    const rect = container.getBoundingClientRect();
    diagramContainer.style.position = "absolute";
    diagramContainer.style.top = rect.top; diagramContainer.style.left = rect.left; 
    diagramContainer.style.width = rect.width; diagramContainer.style.height = rect.height;  
    diagramContainer.style.visibility = "visible"; return diagramContainer;
}

// convert this all into a WebComponent so we can use it
export const flow_diagram = {trueWebComponentMode: true, insertNode, registerShape, elementConnected}
monkshu_component.register("flow-diagram", `${COMPONENT_PATH}/flow-diagram.html`, flow_diagram);