/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {resizable} from "./lib/resizable.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), ROW_PROP = "__org_monkshu_components_spreadsheet_rows",
	COLUMN_PROP = "__org_monkshu_components_spreadsheet_columns";

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>_getSpreadSheetAsCSV(element.id), set: value=>_setSpreadSheetFromCSV(value, element.id)});
	$$.require(`${COMPONENT_PATH}/3p/papaparse.min.js`);	// we need this to export and import data as CSV

	const data = _createElementData(element);

	if (element.id) {
		if (!spread_sheet.datas) spread_sheet.datas = {}; spread_sheet.datas[element.id] = data;
	} else spread_sheet.data = data;
}

function elementRendered(element) {
	if (element.getAttribute("value")) _setSpreadSheetFromCSV(element.getAttribute("value"), element.id);
	resizable.makeResizableTable(spread_sheet.getShadowRootByHost(element).querySelector("table#spreadsheet"),
		element.getAttribute("barstyle"));
}

function cellpastedon(element, event) {
	const hostElement = spread_sheet.getHostElement(element);
	const textPasted = event.clipboardData.getData("text"); if ((!textPasted || textPasted == "") && hostElement.getAttribute("onlyText")?.toLowerCase() == "true") return;	
	const asCSV = Papa.parse(textPasted||"", {header: false, skipEmptyLines: true}).data, isCSV = asCSV.length > 1 || asCSV[0]?.length > 1;
	if (isCSV) {_setSpreadSheetFromCSV(asCSV, spread_sheet.getHostElementID(element)); event.preventDefault();}
}

async function rowop(op, element) {
	const host = spread_sheet.getHostElement(element);
	const numOfRows = host[ROW_PROP], numOfColumns = host[COLUMN_PROP];
	const data = _createElementData(host, op=="add"?numOfRows+1:numOfRows-1, numOfColumns);
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function columnop(op, element) {
	const host = spread_sheet.getHostElement(element);
	const numOfRows = host[ROW_PROP], numOfColumns = host[COLUMN_PROP];
	const data = _createElementData(host, numOfRows, op=="add"?numOfColumns+1:numOfColumns-1);
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function open(element) {
	try {
		const csvContents = (await util.uploadAFile("text/csv")).data;
		if (csvContents) _setSpreadSheetFromCSV(csvContents, spread_sheet.getHostElement(element).id);
	} catch (err) {LOG.error(`Error uploading file, ${err}`);}
}

async function save(element) {
	const host = spread_sheet.getHostElement(element);
	const csvData = _getSpreadSheetAsCSV(host.id);
	util.downloadFile(csvData, "text/csv", host.getAttribute("downloadfilename")||"spreadsheet.csv");
}

function _getSpreadSheetAsCSV(id) {
	const _isEmptyArray = array => {for (const cell of array) if (cell.trim() != '') return false; return true;}
	const shadowRoot = spread_sheet.getShadowRootByHostId(id), rows = shadowRoot.querySelectorAll("tr");
	const csvObject = []; for (const [index, row] of rows.entries()) {
		if (index == 0) continue;	// first row is resizable headers
		const column = Array.prototype.slice.call(row.getElementsByTagName("textarea")).map(e => e.value);
		if (_isEmptyArray(column)) continue;	// skip totally empty rows
		else csvObject.push(column);
	}

	// trim away totally empty columns
	const columnsToDelete = []; for (let columnNum = 0; columnNum < csvObject[0]?.length||0; columnNum++) {
		const column = []; for (let rowNum = 0; rowNum < csvObject.length; rowNum++) column[rowNum] = csvObject[rowNum][columnNum];
		if (_isEmptyArray(column)) columnsToDelete.push(columnNum);
	}
	const csvObjectTrimmed = []; for (const rowData of csvObject) {
		const row = [];
		for (const [columnNum,column] of rowData.entries()) { if (!columnsToDelete.includes(columnNum)) row.push(column) }
		csvObjectTrimmed.push(row);
	}

	const csv = Papa.unparse(csvObjectTrimmed, {header: true, skipEmptyLines: true});
	return csv;
}

async function _setSpreadSheetFromCSV(value, id) {
	if (!value || value == "") return; const csvArrayOfArrays = typeof value === "string" ? 
		Papa.parse(value.trim(), {header: false, skipEmptyLines: true}).data : value;
	if ((!Array.isArray(csvArrayOfArrays)) || (!Array.isArray(csvArrayOfArrays[0]))) {LOG.error("Bad CSV data"); return;}	// bad CSV data
	const numOfColumnsInCSV = csvArrayOfArrays[0].length, numOfRowsInCSV = csvArrayOfArrays.length;
	const host = spread_sheet.getHostElementByID(id), data = _createElementData(host, 
		numOfRowsInCSV>host[ROW_PROP]?numOfRowsInCSV:host[ROW_PROP], numOfColumnsInCSV>host[COLUMN_PROP]?numOfColumnsInCSV:host[COLUMN_PROP]);
	await spread_sheet.bindData(data, host.id);	// adjust the sheet size to match the data

	const shadowRoot = spread_sheet.getShadowRootByHostId(id), rows = Array.prototype.slice.call(shadowRoot.querySelectorAll("tr"));
	for (let [rowNumber, row] of rows.entries()) {
		rowNumber = rowNumber - 1;	// first row is the resizable TDs.
		const column = Array.prototype.slice.call(row.children);
		for (const [colNumber, tdElement] of column.entries()) 
			if (csvArrayOfArrays[rowNumber] && csvArrayOfArrays[rowNumber][colNumber]) {
				const textarea = tdElement.getElementsByTagName("textarea")[0];
				textarea.value = csvArrayOfArrays[rowNumber][colNumber]; textarea.onchange();
			}
	}
	return true;
}

function _createElementData(element, rows=element.getAttribute("rows")||6, columns=element.getAttribute("columns")||2) {
	const data = {componentPath: COMPONENT_PATH};
	data.rows = []; data.columns = []; for (let j = 0; j < columns; j++) data.columns.push(' ');
	for (let i = 0; i < rows; i++) {
		const columnsNew = []; data.rows.push(columnsNew);
		for (let j = 0; j < columns; j++) columnsNew.push(' ');
	}
	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
	element[ROW_PROP] = parseInt(rows), element[COLUMN_PROP] = parseInt(columns);
	return data;
}

// convert this all into a WebComponent so we can use it
export const spread_sheet = {trueWebComponentMode: true, elementConnected, elementRendered, cellpastedon, 
	rowop, columnop, open, save}
monkshu_component.register("spread-sheet", `${COMPONENT_PATH}/spread-sheet.html`, spread_sheet);