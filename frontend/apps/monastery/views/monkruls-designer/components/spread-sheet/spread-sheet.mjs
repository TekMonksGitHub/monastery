/** 
 * Spread sheet component
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {i18n} from "./spread-sheet.i18n.mjs";
import {resizable} from "./lib/resizable.mjs";
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {context_menu} from "../context-menu/context-menu.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), ROW_PROP = "__org_monkshu_components_spreadsheet_rows",
	COLUMN_PROP = "__org_monkshu_components_spreadsheet_columns", DEFAULT_TAB="default", CONTEXT_MENU_ID = "spreadsheetContextMenu";

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>_getValue(element), set: value=>_setValue(value, element)});
	$$.require(`${COMPONENT_PATH}/3p/papaparse.min.js`);	// we need this to export and import data as CSV

	// first tab in the attribute is active, or default (hidden) tab is active if multiple tabs are not being used
	_setActiveTab(element, element.getAttribute("tabs") ? 
		element.getAttribute("tabs").split(",")[0].split(":")[0].trim() : DEFAULT_TAB);

	const data = await _createElementData(element);

	if (element.id) if (!spread_sheet.datas) {
		spread_sheet.datas = {}; spread_sheet.datas[element.id] = data; } else spread_sheet.data = data;
}

function elementRendered(element, initialRender) {
	if (element.getAttribute("value") && initialRender) _setValue(element.getAttribute("value"), element);

	// make table resizable and all elements to auto-resize when the columns are resized
	const _getAllTextAreasForThisColumn = td => {
		const columnNumberThisTD = Array.prototype.slice.call(td.parentElement.querySelectorAll("td")).indexOf(td);
		const allTRs = td.parentElement.parentElement.querySelectorAll("tr");
		const retList = []; for (const tr of allTRs) for (const [index, textarea] of Array.prototype.slice.call(tr.querySelectorAll("textarea")).entries())
			if (index == columnNumberThisTD) retList.push(textarea);
		return retList;
	}
	resizable.makeResizableTable(spread_sheet.getShadowRootByHost(element).querySelector("table#spreadsheet"),
		element.getAttribute("barstyle"), { onresize: td => {for (const textarea of _getAllTextAreasForThisColumn(td)) 
			resizeRowInputsForLargestScroll(textarea)} });
}

function cellpastedon(element, event) {
	const hostElement = spread_sheet.getHostElement(element);
	const textPasted = event.clipboardData.getData("text"); if ((!textPasted || textPasted == "") && hostElement.getAttribute("onlyText")?.toLowerCase() == "true") return;	
	const asCSV = Papa.parse(textPasted||"", {header: false, skipEmptyLines: true}).data, isCSV = asCSV.length > 1 || asCSV[0]?.length > 1;
	if (isCSV) {_setSpreadSheetFromCSV(asCSV, spread_sheet.getHostElementID(element)); event.preventDefault();}
}

async function rowop(op, element) {
	const host = spread_sheet.getHostElement(element);
	const numOfRows = _getActiveTabObject(host)[ROW_PROP], numOfColumns = _getActiveTabObject(host)[COLUMN_PROP];
	const data = await _createElementData(host, op=="add"?numOfRows+1:numOfRows-1, numOfColumns);
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function columnop(op, element) {
	const host = spread_sheet.getHostElement(element);
	const numOfRows = _getActiveTabObject(host)[ROW_PROP], numOfColumns = _getActiveTabObject(host)[COLUMN_PROP];
	const data = await _createElementData(host, numOfRows, op=="add"?numOfColumns+1:numOfColumns-1);
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function open(element) {
	try {
		const sheetData = (await util.uploadAFile(".csv,.json")).data;
		if (sheetData) _setValue(sheetData, spread_sheet.getHostElement(element));
	} catch (err) {LOG.error(`Error opening file, ${err}`);}
}

async function save(element) {
	const host = spread_sheet.getHostElement(element), sheetData = _getValue(host); let isJSON = true; try{JSON.parse(sheetData)} catch (err) {isJSON=false};
	util.downloadFile(sheetData, isJSON?"application/json":"text/csv", `${host.getAttribute("downloadfilename")||"spreadsheet"}${isJSON?".json":".csv"}`);
}

function resizeRowInputsForLargestScroll(element) {
	const _getScrollHeight = element => { const saved = element.style.height; element.style.height = "auto"; 
		const scrollHeight = element.scrollHeight; element.style.height = saved; return scrollHeight; }
	const _getLargestScrollHeight = elementList => { let largest = 0; for (const element of elementList) {
		const scrollHeightThisElement = _getScrollHeight(element);
		if (scrollHeightThisElement > largest) largest = scrollHeightThisElement;
	} return largest; }
	if (!element.parentElement.parentElement) LOG.info("Resize skipped as no grandparents found.");

	const rowElements = element.parentElement.parentElement.querySelectorAll("textarea"), largestScrollHeight = parseInt(_getLargestScrollHeight(rowElements));
	if (parseInt(element.style.height, 10) == largestScrollHeight) return;	// no change needed
	else for (const element of rowElements) element.style.height = largestScrollHeight+"px"; 
}

async function switchSheet(element, sheetID) {
	const host = spread_sheet.getHostElement(element);
	_getActiveTabObject(host).data = _getSpreadSheetAsCSV(host.id, true);

	const tabObjectNewSheet = _getTabObject(host, sheetID); _setActiveTab(host, sheetID);	// set this sheet as active
	if (!tabObjectNewSheet.data || tabObjectNewSheet.data == "") spread_sheet.bindData(	// no data, new sheet
		await _createElementData(host, tabObjectNewSheet[ROW_PROP], tabObjectNewSheet[COLUMN_PROP]), host.id);
	else _setSpreadSheetFromCSV(tabObjectNewSheet.data, host.id);	// have saved data from past, reload the sheet
}

function tabMenuClicked(event, element, sheetID) {
	context_menu.showMenu(CONTEXT_MENU_ID, {"Rename":_=>alert("Rename called")}, `${event.pageX+2}px`, `${event.pageY+2}px`);
}

function _getValue(host) {
	const activeSheetValue = _getSpreadSheetAsCSV(host.id, true), shadowRoot = spread_sheet.getShadowRootByHost(host);
	if (host.getAttribute("needPluginValues") || Object.keys(_getAllTabs(host)).length) {
		const retValue = {}; for (const tabID in _getAllTabs(host))
			retValue[tabID] = tabID == _getActiveTab(host) ? activeSheetValue : _getTabObject(host, tabID).data;
		if (host.getAttribute("needPluginValues")) for (const pluginValueID of host.getAttribute("needPluginValues").split(","))
			retValue[pluginValueID] = shadowRoot.querySelector(`#${pluginValueID}`)?.value;
		return JSON.stringify(retValue);
	} else return activeSheetValue;
}

function _setValue(value, host) {
	const shadowRoot = spread_sheet.getShadowRootByHost(host); let isJSONValue = true; try {JSON.parse(value)} catch (err) {isJSONValue  = false;}
	if (isJSONValue) {
		const parsedObject = JSON.parse(value), pluginIDs = host.getAttribute("needPluginValues")?host.getAttribute("needPluginValues").split(","):[];
		for (const key in parsedObject) if (pluginIDs.includes(key)) {
			if (shadowRoot.querySelector(`#${key}`)) shadowRoot.querySelector(`#${key}`).value = parsedObject[key] }
		else _getTabObject(host, key).data = parsedObject[key];
		
		const activeTab = _getActiveTab(host); _setSpreadSheetFromCSV(parsedObject[activeTab], host.id);
	} else _setSpreadSheetFromCSV(value, host.id);
}

function _getSpreadSheetAsCSV(hostID, dontTrim) {
	const _isEmptyArray = array => {for (const cell of array) if (cell.trim() != '') return false; return true;}
	const shadowRoot = spread_sheet.getShadowRootByHostId(hostID), rows = shadowRoot.querySelectorAll("tr");
	const csvObject = []; for (const row of rows) {
		const rowData = Array.prototype.slice.call(row.getElementsByTagName("textarea")).map(e => e.value);
		if (_isEmptyArray(rowData) && !dontTrim) continue;	// skip totally empty rows, unless don't trim was specified.
		else csvObject.push(rowData);
	}

	// trim away totally empty columns, unless don't trim was specified.
	const columnsToDelete = []; if (!dontTrim) for (let columnNum = 0; columnNum < csvObject[0]?.length||0; columnNum++) {
		const column = []; for (let rowNum = 0; rowNum < csvObject.length; rowNum++) column[rowNum] = csvObject[rowNum][columnNum];
		if (_isEmptyArray(column)) columnsToDelete.push(columnNum);
	}
	const csvObjectTrimmed = dontTrim?csvObject:[]; if (!dontTrim) for (const rowData of csvObject) {
		const row = [];
		for (const [columnNum,column] of rowData.entries()) { if (!columnsToDelete.includes(columnNum)) row.push(column) }
		csvObjectTrimmed.push(row);
	}

	const csv = Papa.unparse(csvObjectTrimmed, {header: true, skipEmptyLines: true});
	return csv;
}

async function _setSpreadSheetFromCSV(value, hostID) {	// will set data for the active sheet only
	if (!value || value == "") return; const csvArrayOfArrays = typeof value === "string" ? 
		Papa.parse(value.trim(), {header: false, skipEmptyLines: true}).data : value;
	if ((!Array.isArray(csvArrayOfArrays)) || (!Array.isArray(csvArrayOfArrays[0]))) {LOG.error("Bad CSV data"); return;}	// bad CSV data
	const numOfColumnsInCSV = csvArrayOfArrays[0].length, numOfRowsInCSV = csvArrayOfArrays.length;
	const host = spread_sheet.getHostElementByID(hostID), data = await _createElementData(host, 
		numOfRowsInCSV>_getActiveTabObject(host)[ROW_PROP]?numOfRowsInCSV:_getActiveTabObject(host)[ROW_PROP], 
		numOfColumnsInCSV>_getActiveTabObject(host)[COLUMN_PROP]?numOfColumnsInCSV:_getActiveTabObject(host)[COLUMN_PROP]);
	
	await spread_sheet.bindData(data, host.id);	// adjust the sheet size to match the data, this will called elementRendered

	const shadowRoot = spread_sheet.getShadowRootByHost(host), rows = Array.prototype.slice.call(shadowRoot.querySelectorAll("tr"));
	for (let [rowNumber, row] of rows.entries()) {
		const column = Array.prototype.slice.call(row.children);
		for (const [colNumber, tdElement] of column.entries()) if (csvArrayOfArrays[rowNumber] && csvArrayOfArrays[rowNumber][colNumber]) {
			const textarea = tdElement.getElementsByTagName("textarea")[0];
			textarea.value = csvArrayOfArrays[rowNumber][colNumber]; textarea.onchange();
		}
	}
	return true;
}

async function _createElementData(host, rows=host.getAttribute("rows")||6, columns=host.getAttribute("columns")||2) {
	const data = {componentPath: COMPONENT_PATH, i18n: {}, CONTEXT_MENU_ID,
		toolbarPluginHTML: host.getAttribute("toolbarPluginHTML")?decodeURIComponent(host.getAttribute("toolbarPluginHTML")):undefined};
	for (const i18nKey in i18n) data.i18n[i18nKey] = i18n[i18nKey][session.get($$.MONKSHU_CONSTANTS.LANG_ID)];

	data.rows = []; data.columns = []; for (let j = 0; j < columns; j++) data.columns.push(' ');
	for (let i = 0; i < rows; i++) data.rows.push(' ');
	if (host.getAttribute("styleBody")) data.styleBody = `<style>${host.getAttribute("styleBody")}</style>`;

	data.tabs = []; const tabs = host.getAttribute("tabs"); if (tabs) for (const tabTuple of tabs.split(",")) 
		data.tabs.push( {name: tabTuple.trim().split(":")[1].trim(), id: tabTuple.trim().split(":")[0].trim(), 
			active: tabTuple.trim().split(":")[0].trim() == _getActiveTab(host)?"true":undefined} );

	// expand toolbar plugin HTML now that data object is complete, as it may need expansion
	if (data.toolbarPluginHTML) data.toolbarPluginHTML = await router.expandPageData(data.toolbarPluginHTML, undefined, data);
	
	_getActiveTabObject(host)[ROW_PROP] = parseInt(rows), _getActiveTabObject(host)[COLUMN_PROP] = parseInt(columns);

	return data;
}

const _getActiveTab = hostOrHostID => spread_sheet[hostOrHostID instanceof HTMLElement ? "getMemoryByHost":"getMemory"](hostOrHostID).activeTab;
const _setActiveTab = (hostOrHostID, tab) => spread_sheet[hostOrHostID instanceof HTMLElement ? "getMemoryByHost":"getMemory"](hostOrHostID).activeTab = tab;
const _getActiveTabObject = hostOrHostID => _getTabObject(hostOrHostID, _getActiveTab(hostOrHostID));
function _getTabObject(hostOrHostID, tabID) {
	const allTabs = _getAllTabs(hostOrHostID); if (!allTabs[tabID]) allTabs[tabID] = {}; return allTabs[tabID];
}
function _getAllTabs(hostOrHostID) {
	const memory = spread_sheet[hostOrHostID instanceof HTMLElement ? "getMemoryByHost":"getMemory"](hostOrHostID);
	if (!memory.tabs) memory.tabs = {}; return memory.tabs;
}

// convert this all into a WebComponent so we can use it
export const spread_sheet = {trueWebComponentMode: true, elementConnected, elementRendered, cellpastedon, 
	rowop, columnop, open, save, resizeRowInputsForLargestScroll, switchSheet, tabMenuClicked}
monkshu_component.register("spread-sheet", `${COMPONENT_PATH}/spread-sheet.html`, spread_sheet);