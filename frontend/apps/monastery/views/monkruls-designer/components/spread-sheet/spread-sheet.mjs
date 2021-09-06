/** 
 * Spread sheet component. This component is dependent
 * on two other components - context-menu and dialog-box.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {i18n} from "./spread-sheet.i18n.mjs";
import {resizable} from "./lib/resizable.mjs";
import {router} from "/framework/js/router.mjs";
import {i18n as i18nFramework} from "/framework/js/i18n.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta), ROW_PROP = "__org_monkshu_components_spreadsheet_rows",
	COLUMN_PROP = "__org_monkshu_components_spreadsheet_columns", DEFAULT_TAB="default", CONTEXT_MENU_ID = "spreadsheetContextMenu",
	DIALOG = window.monkshu_env.components["dialog-box"], CONTEXT_MENU = window.monkshu_env.components["context-menu"],
	DIALOG_HOST_ID = "org_monkshu_spreadsheet_component_dialog";

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>_getValue(element), set: value=>_setValue(value, element)});
	await $$.require(`${COMPONENT_PATH}/3p/papaparse.min.js`);	// we need this to export and import data as CSV

	// first tab in the attribute is active, or default (hidden) tab is active if multiple tabs are not being used
	_setActiveTab(element, element.getAttribute("tabs") ? 
		element.getAttribute("tabs").split(",")[0].split(":")[0].trim() : DEFAULT_TAB);

	// init data and tab objects
	const rows=element.getAttribute("rows")||6, columns=element.getAttribute("columns")||2;
	const tabs = element.getAttribute("tabs"); if (tabs) for (const tabTuple of tabs.split(",")) {	// setup tabs in element attr
		const tabReadableName = tabTuple.trim().split(":")[1].trim(), tabID = tabTuple.trim().split(":")[0].trim();
		const tabObject = _getTabObject(element, tabID); tabObject[ROW_PROP] = rows; tabObject[COLUMN_PROP] = columns; tabObject.data = "";
		tabObject.name = tabReadableName; tabObject.data = ""; tabObject.id = tabID;
	} else {	// setup default tab object otherwise
		const tabObject = _getTabObject(element, DEFAULT_TAB); tabObject[ROW_PROP] = rows; tabObject[COLUMN_PROP] = columns; tabObject.data = "";
		tabObject.name = DEFAULT_TAB; tabObject.data = ""; tabObject.id = DEFAULT_TAB;
	}

	const data = await _createElementData(element, rows, columns);
	if (element.id) if (!spread_sheet.datas) {
		spread_sheet.datas = {}; spread_sheet.datas[element.id] = data; } else spread_sheet.data = data;
}

async function elementRendered(element, initialRender) {
	if (element.getAttribute("value") && initialRender) await _setValue(element.getAttribute("value"), element);

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
	const pasteAsCSV = (content, event) => {_setSpreadSheetFromCSV(content, spread_sheet.getHostElementID(element)); event.preventDefault();};
	let dialogThemeProvided = hostElement.getAttribute("dialogTheme"); if (dialogThemeProvided) dialogThemeProvided = decodeURIComponent(dialogThemeProvided); else dialogThemeProvided = "{}";
	if (isCSV) DIALOG.showConfirm(i18n.PasteWarning[i18nFramework.getSessionLang()], result => {if (result) pasteAsCSV(asCSV, event)} , 
		JSON.parse(dialogThemeProvided), DIALOG_HOST_ID);
}

async function rowop(op, element) {
	const host = spread_sheet.getHostElement(element);
	let numOfRows = parseInt(_getActiveTabObject(host)[ROW_PROP], 10); const numOfColumns = _getActiveTabObject(host)[COLUMN_PROP];
	numOfRows = op=="add"?numOfRows+1:numOfRows-1; _getActiveTabObject(host)[ROW_PROP] = numOfRows;
	const data = await _createElementData(host, numOfRows, numOfColumns);
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function columnop(op, element) {
	const host = spread_sheet.getHostElement(element);
	const numOfRows = _getActiveTabObject(host)[ROW_PROP]; let numOfColumns = parseInt(_getActiveTabObject(host)[COLUMN_PROP], 10);
	numOfColumns = op=="add"?numOfColumns+1:numOfColumns-1; _getActiveTabObject(host)[COLUMN_PROP] = numOfColumns;
	const data = await _createElementData(host, numOfRows, numOfColumns); 
	const currentData = _getSpreadSheetAsCSV(host.id); await spread_sheet.bindData(data, host.id); _setSpreadSheetFromCSV(currentData, host.id);
}

async function open(element) {
	try {
		const sheetData = (await util.uploadAFile(".csv,.json")).data;
		if (sheetData) await _setValue(sheetData, spread_sheet.getHostElement(element));
	} catch (err) {LOG.error(`Error opening file, ${err}`);}
}

async function save(element) {
	const host = spread_sheet.getHostElement(element), sheetData = _getValue(host); let isJSON = true; try{JSON.parse(sheetData)} catch (err) {isJSON=false};
	util.downloadFile(sheetData, isJSON?"application/json":"text/csv", `${decodeURIComponent(host.getAttribute("downloadfilename")||"spreadsheet")}${isJSON?".json":".csv"}`);
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

async function switchSheet(elementOrHostID, sheetID, forceReload) {
	const host = elementOrHostID instanceof Element?spread_sheet.getHostElement(elementOrHostID):spread_sheet.getHostElementByID(elementOrHostID);  	
	if (sheetID == _getActiveTab(host) && (!forceReload)) return;	// no need to switch
	_getActiveTabObject(host).data = _getSpreadSheetAsCSV(host.id);	// save active data etc.

	// set this sheet as active and switch data
	_setActiveTab(host, sheetID); await _setSpreadSheetFromCSV(_getTabObject(host, sheetID).data, host.id);	
}

async function tabMenuClicked(event, element, sheetID) {
	const host = spread_sheet.getHostElement(element);
	const _renameTab = newName => {
		const allTabs = _getAllTabs(host); if (allTabs[newName]) return;	// name already exists
		const newTabs = {}; for (const tabID in allTabs) {
			if (tabID == sheetID) {newTabs[newName] = allTabs[sheetID]; newTabs[newName].name = newName; newTabs[newName].id = newName;}
			else newTabs[tabID] = allTabs[tabID];
		}; _setAllTabs(host, newTabs);
		
		if (_getActiveTab(host) == sheetID) _setActiveTab(host, newName); reloadSheets(host);
	}
	const _editTab = _ => {
		const inputBox = element.querySelector("input#tabLabel");
		inputBox.onchange = _=>_renameTab(inputBox.value);
		inputBox.readOnly = false; inputBox.select(); 
		inputBox.addEventListener("focusout", _=>inputBox.readOnly = true);
	}
	const renameMenuItem = i18n.Rename[i18nFramework.getSessionLang()], menus = {}; menus[renameMenuItem] = _=>_editTab();
	CONTEXT_MENU.showMenu(CONTEXT_MENU_ID, menus, event.pageX, event.pageY, 2, 2);
}

const reloadSheets = host => switchSheet(host.id, _getActiveTab(host), true)

function _getValue(host) {
	const activeSheetValue = _getSpreadSheetAsCSV(host.id);
	if (host.getAttribute("needPluginValues") || Object.keys(_getAllTabs(host)).length > 1) {
		const retValue = [], shadowRoot = spread_sheet.getShadowRootByHost(host); 
		_getActiveTabObject(host).data = activeSheetValue;	// update active tab so its value is correct
		for (const tabID in _getAllTabs(host)) retValue.push({type: "tab", ..._getTabObject(host, tabID)});
		if (host.getAttribute("needPluginValues")) for (const pluginValueID of host.getAttribute("needPluginValues").split(","))
			retValue.push({type:"plugin", id: pluginValueID, data: shadowRoot.querySelector(`#${pluginValueID}`)?.value});
		return JSON.stringify(retValue, null, 4);
	} else return activeSheetValue;
}

async function _setValue(value, host) {
	const shadowRoot = spread_sheet.getShadowRootByHost(host); let isJSONValue = true; try {JSON.parse(value)} catch (err) {isJSONValue  = false;}
	if (isJSONValue) {
		const parsedObjects = JSON.parse(value), allTabs = {}; 

		// setup tabs
		for (const object of parsedObjects) if (object.type == "tab") { allTabs[object.id] = util.clone(object, ["type"]); } 
		_setAllTabs(host, allTabs); const firstTabID = Object.keys(allTabs)[0]; _setActiveTab(host, firstTabID);

		// fill in the active sheet
		await _setSpreadSheetFromCSV(allTabs[firstTabID].data, host.id);

		// plug in plugin values
		for (const object of parsedObjects) if (object.type != "tab") if (object.data && shadowRoot.querySelector(
			`#${object.id}`)) _setHTMLElementValue(shadowRoot.querySelector(`#${object.id}`), object.data); 
	} else await _setSpreadSheetFromCSV(value, host.id);
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
	const csvArrayOfArrays = value == "" ? [[]] : Array.isArray(value) ?
		value : Papa.parse(value.trim(), {header: false, skipEmptyLines: true}).data;
	if ((!Array.isArray(csvArrayOfArrays)) || (!Array.isArray(csvArrayOfArrays[0]))) {LOG.error("Bad CSV data"); return;}	// bad CSV data
	
	const numOfColumnsInCSV = csvArrayOfArrays[0].length, numOfRowsInCSV = csvArrayOfArrays.length;
	const host = spread_sheet.getHostElementByID(hostID), data = await _createElementData(host, 
		numOfRowsInCSV>_getActiveTabObject(host)[ROW_PROP]?numOfRowsInCSV:_getActiveTabObject(host)[ROW_PROP], 
		numOfColumnsInCSV>_getActiveTabObject(host)[COLUMN_PROP]?numOfColumnsInCSV:_getActiveTabObject(host)[COLUMN_PROP]);
	
	await spread_sheet.bindData(data, host.id);	// adjust the sheet size to match the data, this will call elementRendered

	// fill in the data
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
	for (const i18nKey in i18n) data.i18n[i18nKey] = i18n[i18nKey][i18nFramework.getSessionLang()];

	data.rows = []; data.columns = []; for (let j = 0; j < columns; j++) data.columns.push(' ');
	for (let i = 0; i < rows; i++) data.rows.push(' '); 
	if (host.getAttribute("styleBody")) data.styleBody = `<style>${host.getAttribute("styleBody")}</style>`;

	data.tabs = []; const allTabs = _getAllTabs(host); for (const tabID in allTabs) if (tabID != DEFAULT_TAB)
		data.tabs.push( {name: allTabs[tabID].name, id: tabID, active: tabID == _getActiveTab(host)?"true":undefined} );

	// expand toolbar plugin HTML now that data object is complete, as it may need expansion
	if (data.toolbarPluginHTML) data.toolbarPluginHTML = await router.expandPageData(data.toolbarPluginHTML, undefined, data);
	
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
function _setAllTabs(hostOrHostID, tabs) {
	const memory = spread_sheet[hostOrHostID instanceof HTMLElement ? "getMemoryByHost":"getMemory"](hostOrHostID);
	memory.tabs = util.clone(tabs);
}
function _setHTMLElementValue(element, value) {
	if (element.tagName.toLowerCase() == "input" && element.type.toLowerCase() == "checkbox") {
		if (value.toLowerCase() == "true") element.setAttribute("checked", undefined);
		element.setAttribute("value", value);
	} else if (element.tagName.toLowerCase() == "textarea") element.innerHTML = value;
	else element.setAttribute("value", value);
}

// convert this all into a WebComponent so we can use it
export const spread_sheet = {trueWebComponentMode: true, elementConnected, elementRendered, cellpastedon, 
	rowop, columnop, open, save, resizeRowInputsForLargestScroll, switchSheet, tabMenuClicked, reloadSheets}
monkshu_component.register("spread-sheet", `${COMPONENT_PATH}/spread-sheet.html`, spread_sheet);