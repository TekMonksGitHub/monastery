/** 
 * input table component.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { i18n } from "./input-table.i18n.mjs";
import { resizable } from "./lib/resizable.mjs";
import { i18n as i18nFramework } from "/framework/js/i18n.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";

const ROW_PROP = "__org_monkshu_components_inputtable_rows",
	COLUMN_PROP = "__org_monkshu_components_inputtable_columns", COMPONENT_PATH = util.getModulePath(import.meta);


async function elementConnected(element) {
	Object.defineProperty(element, "value", { get: _ => _getValue(element), set: value => _setValue(value, element) });
	let data;const rows = element.getAttribute("rows") || 4, columns = element.getAttribute("columns") || 2;
	const elementObject = _getelementMemory(element); elementObject[COLUMN_PROP] = columns;
	if (!elementObject[ROW_PROP]) {
		elementObject[ROW_PROP] = rows;
		data = await _createElementData(element, rows, columns);
	}

	else data = await _createElementData(element, elementObject[ROW_PROP], columns);
	data.headers1 = JSON.parse(element.getAttribute("headers1").replace(/'/g, '\"'));
	data.Header = element.getAttribute("Header");
	if (element.id) if (!input_table.datas) {
		input_table.datas = {};
	} else { input_table.data = data; }
	input_table.datas[element.id] = data;
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
	resizable.makeResizableTable(input_table.getShadowRootByHost(element).querySelector("table#inputtable"),
		element.getAttribute("barstyle"), {
			onresize: td => {
				for (const textarea of _getAllTextAreasForThisColumn(td))
					resizeRowInputsForLargestScroll(textarea)
			}
	});
}

async function rowop(op, element) {

	const host = input_table.getHostElement(element);
	let numOfRows = parseInt(_getelementMemory(host)[ROW_PROP], 10); const numOfColumns = _getelementMemory(host)[COLUMN_PROP];
	if(numOfRows<0) numOfRows = 0;
	numOfRows = op == "add" ? numOfRows + 1 : numOfRows - 1; _getelementMemory(host)[ROW_PROP] = numOfRows;
	const data = await _createElementData(host, numOfRows, numOfColumns);
	data.headers1 = JSON.parse(host.getAttribute("headers1").replace(/'/g, '\"'));
	const currentData = _getTableData(host.id); await input_table.bindData(data, host.id); _setTableData(currentData, host.id);
}



function resizeRowInputsForLargestScroll(element) {
	const _getScrollHeight = element => {
		const saved = element.style.height; element.style.height = "auto";
		const scrollHeight = element.scrollHeight; element.style.height = saved; return scrollHeight;
	}
	const _getLargestScrollHeight = elementList => {
		let largest = 0; for (const element of elementList) {
			const scrollHeightThisElement = _getScrollHeight(element);
			if (scrollHeightThisElement > largest) largest = scrollHeightThisElement;
		} return largest;
	}
	if (!element.parentElement.parentElement) LOG.info("Resize skipped as no grandparents found.");

	const rowElements = element.parentElement.parentElement.querySelectorAll("textarea"), largestScrollHeight = parseInt(_getLargestScrollHeight(rowElements));
	if (parseInt(element.style.height, 10) == largestScrollHeight) return;	// no change needed
	else for (const element of rowElements) element.style.height = largestScrollHeight + "px";
}

function _getValue(host) {

	const inputTableValue = _getTableData(host.id);
	_getelementMemory(host)[ROW_PROP] =  inputTableValue.length.toString()
	return JSON.stringify( inputTableValue);
}

async function _setValue(value, host) {
	_getelementMemory(host)[ROW_PROP] =JSON.parse(value).length.toString();
	if(_getelementMemory(host)[ROW_PROP] < 1) _getelementMemory(host)[ROW_PROP] = host.getAttribute("rows");
	await _setTableData(JSON.parse(value), host.id);
}

function _getTableData(hostID, dontTrim) {
	const _isEmptyArray = array => { for (const cell of array) if (cell.trim() != '') return false; return true; }
	const shadowRoot = input_table.getShadowRootByHostId(hostID), rows = shadowRoot.querySelectorAll(".tr");
	const tableData = []; for (const row of rows) {
		const rowData = Array.prototype.slice.call(row.getElementsByTagName("textarea")).map(e => e.value);
		if (_isEmptyArray(rowData) && !dontTrim) continue;	// skip totally empty rows, unless don't trim was specified.
		else tableData.push(rowData);
	}
	return tableData;
}

async function _setTableData(value, hostID) {
	const tableDataArrayOfArrays = value == "" ? [[]] : value;
	const host = input_table.getHostElementByID(hostID), data = await _createElementData(host,
		_getelementMemory(host)[ROW_PROP] ,
		 _getelementMemory(host)[COLUMN_PROP] );
	data.headers1 = JSON.parse(host.getAttribute("headers1").replace(/'/g, '\"'));

	await input_table.bindData(data, host.id);	// adjust the sheet size to match the data, this will call elementRendered

	// fill in the data
	const shadowRoot = input_table.getShadowRootByHost(host), rows = Array.prototype.slice.call(shadowRoot.querySelectorAll(".tr"));
	for (let [rowNumber, row] of rows.entries()) {
		const column = Array.prototype.slice.call(row.children);
		for (const [colNumber, tdElement] of column.entries()) if (tableDataArrayOfArrays[rowNumber] && tableDataArrayOfArrays[rowNumber][colNumber]) {
			const textarea = tdElement.getElementsByTagName("textarea")[0];
			textarea.value = tableDataArrayOfArrays[rowNumber][colNumber]; textarea.onchange();
		}
	}
	return true;
}

async function _createElementData(host, rows = host.getAttribute("rows") || 6, columns = host.getAttribute("columns") || 2) {
	const data = {
		componentPath: COMPONENT_PATH, i18n: {}
	};
	for (const i18nKey in i18n) data.i18n[i18nKey] = i18n[i18nKey][i18nFramework.getSessionLang()];

	data.rows = []; data.columns = []; for (let j = 0; j < columns; j++) data.columns.push(' ');
	for (let i = 0; i < rows; i++) data.rows.push(' ');
	if (host.getAttribute("styleBody")) data.styleBody = `<style>${host.getAttribute("styleBody")}</style>`;

	data.headers1 = JSON.parse(host.getAttribute("headers1").replace(/'/g, '\"'));
	data.Header = host.getAttribute("Header");

	return data;
}

const _getelementMemory = hostOrHostID => {
	const memory = input_table[hostOrHostID instanceof HTMLElement ? "getMemoryByHost" : "getMemory"](hostOrHostID)
	if (!memory.data) memory.data = {}; return memory.data;

};

// convert this all into a WebComponent so we can use it
export const input_table = {
	trueWebComponentMode: true, elementConnected, elementRendered,
	rowop, resizeRowInputsForLargestScroll
}
monkshu_component.register("input-table", `${COMPONENT_PATH}/input-table.html`, input_table);