/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

async function elementConnected(element) {
	let pageFile = await fetch(element.getAttribute("file"), {mode: "no-cors"}).then(response => response.text());

	let schemaArray = pageFile.match(/SCHEMA\s*\r?\n=+\r?\n(.+?)\r?\n=+[\r?\n]*/sm);
	let schema = (schemaArray && schemaArray.length > 1) ? schemaArray[1] : "";

	let cssClassesArray = pageFile.match(/CSS\s+CLASSES\s*\r?\n=+\r?\n(.+?)\r?\n=+[\r?\n]*/sm);
	let cssClassesRaw = (cssClassesArray && cssClassesArray.length > 1) ? cssClassesArray[1] : "";
	cssClassesRaw = cssClassesRaw.replace("CONTAINER CLASSES","containerClasses").replace("ITEM CLASSES","itemClasses").replace("PER ITEM CLASS","perItemClass");
	let cssClassesParsed = {}; let cssArrayParsed = cssClassesRaw.split("\n"); 
	if (cssClassesRaw && cssClassesRaw != "") cssArrayParsed.forEach(cssLine => {
		let cssLineParsed = cssLine.split("="); cssClassesParsed[cssLineParsed[0].trim()] = cssLineParsed[1].trim(); });
	
	let cssArray = pageFile.match(/CSS\s*\r?\n=+\r?\n(.+?)\r?\n=+[\r?\n]*/sm);
	let css = (cssArray && cssArray.length > 1) ? cssArray[1] : "";

	let layoutPlacementArray = pageFile.match(/LAYOUT\s*\r?\n=+\r?\n(.+?)\r?\n=+[\r?\n]*/sm);
	let layoutPlacement = (layoutPlacementArray && layoutPlacementArray.length > 1) ? layoutPlacementArray[1] : "";
	layoutPlacement = layoutPlacement.replace(/^[\|-\s]+$/mg, "").replace(/(?:[\t\s]*(?:\r?\n|\r)){2}/gm,"\n").trim();

	let layoutLines = layoutPlacement.split(/\r?\n/); 
	let columns = 0; let lineWithMaxColumns = -1;
	layoutLines.forEach((line, index) => {
		let colsThisLine = (line.match(/\|/g)||[0]).length-1;
		if (colsThisLine > columns) {columns = colsThisLine; lineWithMaxColumns = index;}
	});

	if (lineWithMaxColumns == -1) return;	// something is very weird

	let columnLocations = []; [...layoutLines[lineWithMaxColumns]].forEach((c,i) => {if (c=='|') columnLocations.push(i)});

	let elementsAndPlacements = [];
	layoutLines.forEach((line, row) => {
		let fStartExtract = false; let objToPush;
		columnLocations.forEach((columnLocation, column) => {
			if (line[columnLocation] == '|') {
				fStartExtract = !fStartExtract;
				if (fStartExtract) objToPush = {colStart: column};
				else {
					objToPush.colEnd = column; 
					objToPush.rowStart = row; objToPush.rowEnd = row+1;
					objToPush.element = line.substring(columnLocations[objToPush.colStart]+1, columnLocations[objToPush.colEnd]-1).trim();
					let objToModify = findObject(elementsAndPlacements, objToPush.colStart, objToPush.colEnd, row, objToPush.element);
					if (objToModify) objToModify.rowEnd = row+1; else elementsAndPlacements.push(objToPush);
					if (column < columnLocations.length) {fStartExtract = true; objToPush = {colStart: column};}
				}
			}
		});
	});

	let layoutDesignArray = pageFile.match(/LAYOUT\s*\r?\n=+\r?\n.+?\r?\n=+\r?\n(Row\s+Heights.+?Col\s+Widths.+?)\r?\n=+[\r?\n]*/sm);
	let layoutDesign = (layoutDesignArray && layoutDesignArray.length > 1) ? layoutDesignArray[1] : "";
	let rowHeightArray = layoutDesign.match(/^\s*Row\s+Heights\s+\=\s+(.+?)$/sm); 
	let rowHeights = []; if (rowHeightArray && rowHeightArray.length > 1) rowHeights = rowHeightArray[1].split(","); rowHeights.forEach((item,i) => rowHeights[i] = item.trim());
	let colWidthsArray = layoutDesign.match(/^\s*Col\s+Widths\s+\=\s+(.+?)$/sm);
	let colWidths = []; if (colWidthsArray && colWidthsArray.length > 1) colWidths = colWidthsArray[1].split(","); colWidths.forEach((item,i) => colWidths[i] = item.trim());

	let layoutObj = {rows: layoutLines.length, columns: columnLocations.length-1, rowHeights, colWidths, elementsAndPlacements};

	element.componentHTML = await generatePageHTML(element, schema, cssClassesParsed, css, element.getAttribute("css"), layoutObj);
}

async function generatePageHTML(elementParent, schema, cssParsed, cssInternal, cssHref, layoutObj) {
	if (!elementParent.webscrolls_env) elementParent.webscrolls_env = {};
	if (layoutObj.rowHeights.length < layoutObj.rows.length) layoutObj.rowHeights.push(Array(layoutObj.rows.length-layoutObj.rowHeights.length).fill("auto"));
	if (layoutObj.colWidths.length < layoutObj.columns.length) layoutObj.colWidths.push(Array(layoutObj.columns.length-layoutObj.colWidths.length).fill("auto"));

	let css = `${cssHref?`<link rel="stylesheet" type="text/css" href="${cssHref}">`:""}
	<style>
	.grid-container {
		display: grid;
		grid-template-rows: ${layoutObj.rowHeights.join(" ")};
		grid-template-columns: ${layoutObj.colWidths.join(" ")};
	}
	`;
	let html = `<div class="grid-container${cssParsed.containerClasses?" "+cssParsed.containerClasses:''}">
	`;

	for (const [i, element] of layoutObj.elementsAndPlacements.entries()) {
		css += `.item${i} {
			grid-column: ${element.colStart+1} / ${element.colEnd+1};
			grid-row: ${element.rowStart+1} / ${element.rowEnd+1};
			overflow: hidden;
		}
		`

		let htmlElement = JSON.parse(schema)[element.element]; 
		htmlElement.id = element.name || element.element; 
		html += `<div class="item${i}${cssParsed.itemClasses?" "+cssParsed.itemClasses:''}${cssParsed.perItemClass?` ${cssParsed.perItemClass}-${htmlElement.id}`:''}"><${htmlElement.html || "div"}`; 
		delete htmlElement.html; let innerHTML = htmlElement.__org_monkshu_innerHTML||''; delete htmlElement.__org_monkshu_innerHTML;
		for (const attr of Object.keys(htmlElement)) html += ` ${attr}="${await evalAttrValue(htmlElement[attr])}"`; html += `>${innerHTML}</${htmlElement.html}></div>
		`
	}

	css += cssInternal;
	css += "</style>"; html += "</div>";

	let finalHTML = css+html;

	return finalHTML;
}

async function evalAttrValue(str) {
	let val = (window[str] || str).toString();	// Mustache expects Strings only
	val = await router.expandPageData(val, session.get($$.MONKSHU_CONSTANTS.PAGE_URL), {});
	if (val.match(/url\(.+\)/)) {
		try {
			let testURL = router.decodeURL(val.trim().substring(4,val.length-1)); let response = await fetch(testURL); 
			if (response.ok) val = await response.text();
		} catch {}
	}
    return val;
}

function findObject(objectArray, colStart, colEnd, rowEnd, label) {
	for (let object of objectArray) {
		if (object.colStart == colStart && object.colEnd == colEnd && object.rowEnd == rowEnd && object.element == label)
			return object;
	}

	return null;
}

// convert this all into a WebComponent so we can use it
export const page_generator = {trueWebComponentMode: true, elementConnected}
monkshu_component.register("page-generator", null, page_generator);