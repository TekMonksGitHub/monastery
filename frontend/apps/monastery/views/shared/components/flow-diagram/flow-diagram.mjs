/**
 * Flow diagram component, based on the mxGraph library (https://jgraph.github.io/mxgraph/)
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const GRAPHS = {}, STYLE_CACHE = {};
const GRAPH_CONNECTABLE = true, COMPONENT_PATH = util.getModulePath(import.meta);
const MSG_REGISTER_SHAPE = "REGISTER_SHAPE", MSG_ADD_SHAPE = "ADD_SHAPE", MSG_SHAPE_CLICKED = "SHAPE_CLICKED",
	MSG_SHAPE_REMOVED = "SHAPE_REMOVED", MSG_SHAPES_DISCONNECTED = "SHAPES_DISCONNECTED", 
	MSG_SHAPES_CONNECTED = "SHAPES_CONNECTED", GRAPH_MONASTERY_ID = "__org_monkshu_monastery_id",
	MSG_VALIDATE_CONNECTION = "VALIDATE_FLOW_CONNECTION", MSG_LABEL_CHANGED = "LABEL_CHANGED",
	MSG_CONNECT_SHAPES = "CONNECT_SHAPES", MSG_LABEL_SHAPE = "LABEL_SHAPE", MSG_RESET = "RESET",
	MSG_SHAPE_MOVED = "SHAPE_MOVED";

function elementConnected(element) {
    let data = {};

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
 
	if (element.id) {
		if (!flow_diagram.datas) flow_diagram.datas = {}; flow_diagram.datas[element.id] = data;
	} else flow_diagram.data = data;

	blackboard.registerListener(MSG_REGISTER_SHAPE, message => registerShape(message.graphID, message.name, message.imgURL, message.rounded));
	blackboard.registerListener(MSG_ADD_SHAPE, message => insertNode(message.graphID, message.id, message.label, message.name, message.x, message.y, message.width, message.height, message.connectable));
	blackboard.registerListener(MSG_CONNECT_SHAPES, message => connectNodes(message.graphID, message.sourceID, message.targetID, message.labelID, message.label));
	blackboard.registerListener(MSG_LABEL_SHAPE, message => addLabel(message.graphID, message.shapeid, message.label));
	blackboard.registerListener(MSG_RESET, async message => {const graph = await _getGraph(message.graphID); if (!graph) return; graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));}, true)
}

/**
 * Inserts the given node into the given graph.
 * @param hostID The host graph ID
 * @param id The node ID
 * @param value The text to show under the node
 * @param shapeName The shape name
 * @param x Optional: X coordinates to insert at
 * @param y Optional: Y coordinates to insert at
 * @param width Optional: Width of the image, default is 80px
 * @param height Optional: Height of the image, default is 80px
 * @param connectable Optional: Is the vertex connectable
 * @returns true on success and false on error
 */
async function insertNode(hostID, id, value, shapeName, x=0, y=0, width=80, height=30, connectable=true) {
	const graph = await _getGraph(hostID); if (!graph) return false;
	const style = graph.getStylesheet().getCellStyle(shapeName); 
	if (!style[mxConstants.STYLE_IMAGE] != STYLE_CACHE[shapeName][mxConstants.STYLE_IMAGE]) 
		graph.getStylesheet().putCellStyle(shapeName,STYLE_CACHE[shapeName]);	// there is some bug in mxGraph where it forgets styles
	const parent = graph.getDefaultParent();
	const vertex = graph.insertVertex(parent, id, value, x, y, width, height, shapeName);
	vertex.setConnectable(connectable); 
	return true;
}

/**
 * Registers the given shape for the graph.
 * @param hostID The graph ID of the graph to use
 * @param name The name of the shape
 * @param imgURL The image URL
 * @param rounded Whether or not the rounded style is used
 * @returns true on success, false otherwise
 */
async function registerShape(hostID, name, imgURL, rounded=false) {
	const graph = await _getGraph(hostID); if (!graph) return;
	const style = new Object();
	style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
	style[mxConstants.STYLE_IMAGE] = imgURL;
	style[mxConstants.STYLE_ROUNDED]= rounded;
	style[mxConstants.STYLE_VERTICAL_LABEL_POSITION] = mxConstants.ALIGN_BOTTOM;
	style[mxConstants.STYLE_FONTCOLOR] = "#444444";
	style[mxConstants.STYLE_FONTSIZE] = "12";
	style[mxConstants.STYLE_WHITE_SPACE] = "nowrap";
	graph.getStylesheet().putCellStyle(name,style);
	STYLE_CACHE[name] = style;
	return true;
}

/**
 * Connects the given nodes with a directed arrow from Node1 to Node2.
 * @param hostID The graph ID of the graph to use
 * @param nodeID1 The ID of the first node, that is the source node to use
 * @param nodeID2  The ID of the target node, that is the node to point to
 * @param id Optional: The ID of the connector, this can be used to label it later
 * @param value Optional: The text to display on the edge
 * @returns true on success, false otherwise
 */
async function connectNodes(hostID, nodeID1, nodeID2, id, value) {
	const graph = await _getGraph(hostID); if (!graph) return false;
	const parent = graph.getDefaultParent(), allVertices = graph.getChildVertices(parent);
	let source, target; for (const vertex of allVertices) {
		if (vertex.id == nodeID1) source = vertex;
		if (vertex.id == nodeID2) target = vertex;
	}
	if ((!source) || (!target)) return false;	// cells not found.
	else { graph.insertEdge(parent, id, value, source, target, null); return true; }
}

/**
 * Adds a label to the given node
 * @param hostID The graph ID of the graph to use
 * @param nodeID The ID of the node to label, can be a shape or a connector
 * @param value The label 
 * @returns true on success, false otherwise
 */
async function addLabel(hostID, nodeID, value) {
	const graph = await _getGraph(hostID); if (!graph) return false;
	const cell = graph.getModel().getCell(nodeID); if (!cell) return false;	// not found
	cell.setValue(value); return true;
}

/**
 * Performs auto layout on the given graph
 * @param hostID The graph ID of the graph to use
 */
async function autoLayout(hostID) {
	const graph = await _getGraph(hostID); if (!graph) return;
    const layout = new mxHierarchicalLayout(graph); layout.execute(graph.getDefaultParent());
}

async function _getGraph(hostID) {
	if (GRAPHS[hostID]) return GRAPHS[hostID];	// already done

	window.mxLoadResources = false; window.mxBasePath = `${COMPONENT_PATH}/3p/mxGraph`; await $$.require(`${window.mxBasePath}/mxClient.js`); 

	if (!mxClient.isBrowserSupported()) {mxUtils.error("Browser is not supported!", 200, false); return false;}
	mxGraphHandler.prototype.guidesEnabled = true; mxEdgeHandler.prototype.snapToTerminals = true;
	mxConnectionHandler.prototype.connectImage = new mxImage(`${COMPONENT_PATH}/connector.svg`, 16, 16);
	mxConstants.HANDLE_FILLCOLOR = '#99ccff'; mxConstants.HANDLE_STROKECOLOR = '#99ccff';
	mxConstants.VERTEX_SELECTION_COLOR = '#99ccff'; mxConstants.VALID_COLOR = '#99ccff'; 
	mxConstants.EDGE_SELECTION_COLOR = '#ffffff'; mxConstants.DEFAULT_VALID_COLOR = '#99ccff'; 
	mxConstants.HIGHLIGHT_STROKEWIDTH = 1; 

	const shadowRoot = flow_diagram.getShadowRootByHostId(hostID), containerID = "diagram";
    const mxgraphContainer = _createNonWebComponentDiagramContainer(shadowRoot.querySelector(`#${containerID}`));

	mxEvent.disableContextMenu(mxgraphContainer);
 
	GRAPHS[hostID] = new mxGraph(mxgraphContainer, null, "fastest"); GRAPHS[hostID].setConnectable(GRAPH_CONNECTABLE);
	GRAPHS[hostID][GRAPH_MONASTERY_ID] = hostID; const graph = GRAPHS[hostID];  

	graph.popupMenuHandler.factoryMethod = (menu, cell, _evt) => { if (cell?.vertex || cell?.edge) {
		if (cell.vertex) menu.addItem('Rename', null, _=>graph.startEditingAtCell(cell) ); 
		if (cell.vertex) menu.addSeparator();
		menu.addItem('Delete', null, _=>graph.removeCells([cell]) ); 
	} };

	new mxRubberband(graph); // allows selecting multiple items using dragging rectangle
	graph.addListener(mxEvent.DOUBLE_CLICK, (sender, evt) => {	// shape is double clicked
		const cell = evt.getProperty("cell");
		if (cell?.vertex) { blackboard.broadcastMessage(MSG_SHAPE_CLICKED, { name:cell.style, id:cell.id, 
			graphID:_findGraphID(sender), label: cell.value }); evt.consume(); }
	});
	graph.addListener(mxEvent.CELLS_REMOVED, (sender, evt) => {	// shape deleted or edge deleted
		const listOfCellsRemoved = evt.getProperty("cells");
		for (const cell of listOfCellsRemoved) {
			if (cell.vertex) blackboard.broadcastMessage(	// shape deleted
				MSG_SHAPE_REMOVED, { name: cell.style, id: cell.id, graphID: _findGraphID(sender) });
			else if (cell.edge) {
				blackboard.broadcastMessage(	// arrow connecting shapes deleted
					MSG_SHAPES_DISCONNECTED, {
						sourceID: cell.source.id, sourceName: cell.source.style,
					targetName: cell.target.style, targetID: cell.target.id, graphID: _findGraphID(sender)
				});
				if (cell.source.style == "condition" && cell.target)  graph.removeCells([cell.target])				
			}
		}
	});
	graph.addListener(mxEvent.CELLS_MOVED, (sender, evt) => {	// cells moved
		const cells = evt.getProperty("cells");
		for (const cell of cells) if (cell.vertex) blackboard.broadcastMessage(	// cell moved
			MSG_SHAPE_MOVED, {name:cell.style, id:cell.id, graphID:_findGraphID(sender), 
				x: cell.getGeometry().x, y: cell.getGeometry().y} );
	});

	const mxConnectionHandlerInsertEdge = mxConnectionHandler.prototype.insertEdge;
	mxConnectionHandler.prototype.insertEdge = function(_parent, _id, _value, source, target, _style) {
		if ((!source) || (!target)) return;	// nothing to do - not a complete connection

		mxConnectionHandlerInsertEdge.apply(this, arguments);
		blackboard.broadcastMessage(MSG_SHAPES_CONNECTED, {sourceName:source.style, sourceID: source.id, 
			targetName: target.style, targetID: target.id, graphID:_findGraphID(this.graph)});
	}

	graph.connectionHandler.validateConnection = (source, target) => {	// don't allow connecting nodes which the system doesn't allow
		const validators = blackboard.getListeners(MSG_VALIDATE_CONNECTION); let validationResult = true;
		for (const validator of validators) {
			validationResult = validator({sourceName:source.style, sourceID: source.id, 
				targetName: target.style, targetID: target.id, graphID:_findGraphID(graph)});
			if (validationResult != true) break;	// validators should return true if allowed, and an error string if not
		}
		return validationResult == true?null:validationResult;	// apparently null means it is valid to mxGraph ;)
	}

	graph.addListener(mxEvent.LABEL_CHANGED, (sender, evt) => {	// label changed
		const cell = evt.getProperty("cell");
		if (cell?.vertex) blackboard.broadcastMessage(MSG_LABEL_CHANGED, { name:cell.style, id:cell.id, 
			label: cell.value, graphID:_findGraphID(sender) });
	});

	return graph;
}

/**
 * mxGraph has issues with web components, so this function creates a non-web component container, 
 * of same width, height, and x and y as this web component, attaches it to the document and returns
 * it. CSS properties are also transferred to the non-web container. Pro is we get a graph lined up 
 * exactly as this component is, but disadvantage is CSS encapsulation of web components is lost. 
 * @param container Web component container
 * @returns Non-web component container, positioned exactly the same as the incoming web component
 */
function _createNonWebComponentDiagramContainer(container) {
    const diagramContainer = window.document.createElement("div"); diagramContainer.id = "diagram";
    diagramContainer.setAttribute("style", container.getAttribute("style")); diagramContainer.style.visibility = "hidden";
    window.document.body.appendChild(diagramContainer);
    const rect = container.getBoundingClientRect();
    diagramContainer.style.position = "absolute";
    diagramContainer.style.top = `${rect.top}px`; diagramContainer.style.left = `${rect.left}px`; 
    diagramContainer.style.width = `${rect.width}px`; diagramContainer.style.height = `${rect.height}px`;  
    diagramContainer.style.visibility = "visible"; 
	new ResizeObserver(_=>{	// resize on resizing of the parent component
		const rect = container.getBoundingClientRect();
		diagramContainer.style.width = `${rect.width}px`; 
		diagramContainer.style.height = `${rect.height}px`; }).observe(container);
	const host = flow_diagram.getHostElement(container); if (host.getAttribute("mxGraphStyleBody")) {	// set style on mxGraph if provided.
		const graphStyle = window.document.createElement("style"); 
		graphStyle.innerHTML = host.getAttribute("mxGraphStyleBody");
		document.getElementsByTagName("head")[0].appendChild(graphStyle);
	}
	return diagramContainer;
}

const _findGraphID = graph => {for (const key in GRAPHS) if (GRAPHS[key][GRAPH_MONASTERY_ID] == graph[GRAPH_MONASTERY_ID]) return key; return null;}

// convert this all into a WebComponent so we can use it
export const flow_diagram = {trueWebComponentMode: true, registerShape, elementConnected, insertNode, 
	connectNodes, addLabel, autoLayout}
monkshu_component.register("flow-diagram", `${COMPONENT_PATH}/flow-diagram.html`, flow_diagram);