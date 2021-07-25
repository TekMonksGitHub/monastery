/** 
 * Text editor component
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const P3_LIBS = [`${COMPONENT_PATH}/3p/codemirror/lib/codemirror.js`, `${COMPONENT_PATH}/3p/codemirror/addon/selection/active-line.js`,
	`${COMPONENT_PATH}/3p/codemirror/mode/javascript/javascript.js`, `${COMPONENT_PATH}/3p/codemirror/addon/edit/matchbrackets.js`,
	`${COMPONENT_PATH}/3p/codemirror/addon/lint/lint.js`, `${COMPONENT_PATH}/3p/codemirror/addon/lint/javascript-lint.js`,
	`${COMPONENT_PATH}/3p/jshint/jshint.js`]

async function elementConnected(element) {
	Object.defineProperty(element, "value", {get: _=>_getValue(element), set: value=>_setValue(value, element)});
	
	for (const p3lib of P3_LIBS) await $$.require(p3lib);

	const data = { componentPath: COMPONENT_PATH, styleBody:element.getAttribute("styleBody")?
		`<style>${element.getAttribute("styleBody")}</style>`:undefined };

	if (element.id) if (!text_editor.datas) {text_editor.datas = {}; text_editor.datas[element.id] = data;} 
	else text_editor.data = data;
}

function elementRendered(element) {
	const editorElement = text_editor.getShadowRootByHost(element).querySelector("textarea#texteditor");
	const cm = CodeMirror.fromTextArea(editorElement, {lineNumbers:true, gutter:true, lineWrapping:true,
		styleActiveLine: true, styleActiveSelected: true, mode: "javascript", lint: {selfContain: true}, 
		gutters: ["CodeMirror-lint-markers"], matchBrackets: true }); 
	text_editor.getMemoryByHost(element).editor = cm; cm.setSize("100%", "100%"); cm.setValue("");

	if (element.getAttribute("value")) _setValue(element.getAttribute("value"), element);
}

async function open(element) {
	try {
		const jsContents = (await util.uploadAFile("text/javascript")).data;
		if (jsContents) _setValue(jsContents, text_editor.getHostElement(element));
	} catch (err) {LOG.error(`Error uploading file, ${err}`);}
}

async function save(element) {
	const host = text_editor.getHostElement(element);
	const jsContents = _getValue(host);
	util.downloadFile(jsContents, "text/javascript", host.getAttribute("downloadfilename")||"code.js");
}

function _getValue(host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	const value = cm.getDoc().getValue(); return value;
}

function _setValue(value, host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	cm.getDoc().setValue(value);
}

// convert this all into a WebComponent so we can use it
export const text_editor = {trueWebComponentMode: true, elementConnected, elementRendered, open, save}
monkshu_component.register("text-editor", `${COMPONENT_PATH}/text-editor.html`, text_editor);