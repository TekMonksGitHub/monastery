/**
 * A universal drag and drop Monkshu web component. 
 * Item format is {id, img, label}. Type is "application/json/dnditem"
 * 
 * Value attribute returns or expects an array of items in the format
 * listed above.
 *  
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "./drag-drop.i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {session} from "/framework/js/session.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), DEFAULT_LABEL = i18n.DefaultLabel[session.get($$.MONKSHU_CONSTANTS.LANG_ID)];

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>JSON.stringify(drag_drop.getData(element.id).items), 
		set: value=>{
			const newData = drag_drop.getData(element.id); newData.items = JSON.parse(value);
			drag_drop.bindData(newData, element.id) } });

	const data = {items: JSON.parse(element.getAttribute("value")||"[]"), 
		styleBody: element.getAttribute("styleBody")?`<style>${element.getAttribute("styleBody")}</style>`:undefined,
		label: element.getAttribute("label")||DEFAULT_LABEL};
	drag_drop.setDataByHost(element, data);
}

function dragStarted(event, elementBeingDragged, item) {
	item.hostID = drag_drop.getHostElementID(elementBeingDragged); item.isDNDComponent = true;
	event.dataTransfer.setData("application/json/dnditem", JSON.stringify(item));
	elementBeingDragged.classList.add("beingDragged");
	event.dataTransfer.effectAllowed = "copyMove";
}

function dragOver(event) {
	event.preventDefault();
	let compatibleItem = false; for (const dataTransferItem of event.dataTransfer.items) 
		if (dataTransferItem.type == "application/json/dnditem") {compatibleItem = true; break;}
	if (compatibleItem) event.dataTransfer.dropEffect = "move";
}

function dragEnded(event, elementBeingDragged, _item) {
	event.preventDefault();
	elementBeingDragged.classList.remove("beingDragged");
}

function dropped(event, elementFromComponentDroppedInto) {
	if (event.dataTransfer.getData("application/json/dnditem") == "") return; else event.preventDefault();
	const droppedItem = JSON.parse(event.dataTransfer.getData("application/json/dnditem"));

	// drop to same component not allowed
	const inHostID = drag_drop.getHostElementID(elementFromComponentDroppedInto), outHostID = droppedItem.hostID;
	if (inHostID == outHostID) return;

	// remove from the component we are leaving, if it was one of ours
	if (outHostID && droppedItem.isDNDComponent) {
		const trimmedOutItems = [], outComponentsData = drag_drop.getData(outHostID); 
		for (const item of outComponentsData.items) if (item.id != droppedItem.id) trimmedOutItems.push(item);
		outComponentsData.items = trimmedOutItems; drag_drop.bindData(outComponentsData, outHostID);
	}
	
	// add to the component we are being dropped to
	const inComponentsData = drag_drop.getData(inHostID);
	inComponentsData.items.unshift({id: droppedItem.id, img: droppedItem.img, label: droppedItem.label});
	drag_drop.bindData(inComponentsData, inHostID);
}

export const drag_drop = {trueWebComponentMode: true, elementConnected, dragStarted, dragEnded, dragOver, dropped};
monkshu_component.register("drag-drop", `${COMPONENT_PATH}/drag-drop.html`, drag_drop);