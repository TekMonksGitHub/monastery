/** 
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);

async function elementConnected(element) {
    const data = {};
	const rows = element.getAttribute("rows")||6;
	const columns = element.getAttribute("columns")||2;
	data.rows = []; data.columns = []; for (let j = 0; j < columns; j++) data.columns.push(' ');
	for (let i = 0; i < rows; i++) {
		const columnsNew = []; data.rows.push(columnsNew);
		for (let j = 0; j < columns; j++) columnsNew.push(' ');
	}

	Object.defineProperty(element, "value", {get: _=>_getSpreadSheetAsCSV(element.id), set: value=>_setSpreadSheetFromCSV(value, element.id)});

	$$.require(`${COMPONENT_PATH}/3p/papaparse.min.js`);	// we need this to export and import data as CSV

	if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;

	if (element.id) {
		if (!spread_sheet.datas) spread_sheet.datas = {}; spread_sheet.datas[element.id] = data;
	} else spread_sheet.data = data;
}

function elementRendered(element) {
	if (element.getAttribute("value")) _setSpreadSheetFromCSV(element.getAttribute("value"), element.id);
}

function _getSpreadSheetAsCSV(id) {
	const _isEmptyArray = array => {for (const cell of array) if (cell.trim() != '') return false; return true;}
	const shadowRoot = spread_sheet.getShadowRootByHostId(id), rows = shadowRoot.querySelectorAll("tr");
	const csvObject = []; for (const row of rows) {
		const column = Array.prototype.slice.call(row.children).map(e => e.innerHTML);
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

function _setSpreadSheetFromCSV(value, id) {
	const csvArrayOfArrays = Papa.parse(value, {header: false, skipEmptyLines: true}).data;
	const shadowRoot = spread_sheet.getShadowRootByHostId(id), rows = Array.prototype.slice.call(shadowRoot.querySelectorAll("tr"));
	for (const [rowNumber, row] of rows.entries()) {
		const column = Array.prototype.slice.call(row.children);
		for (const [colNumber, tdElement] of column.entries()) 
			if (csvArrayOfArrays[rowNumber] && csvArrayOfArrays[rowNumber][colNumber]) tdElement.innerHTML = csvArrayOfArrays[rowNumber][colNumber];
	}
	return true;
}

// convert this all into a WebComponent so we can use it
export const spread_sheet = {trueWebComponentMode: true, elementConnected, elementRendered}
monkshu_component.register("spread-sheet", `${COMPONENT_PATH}/spread-sheet.html`, spread_sheet);