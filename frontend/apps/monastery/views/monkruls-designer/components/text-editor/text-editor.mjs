/** 
 * Text editor component
 * (C) 2019 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";
import {monkshu_component} from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
let CONF;

async function elementPrerender(host) {
	if (!CONF) CONF = await $$.requireJSON(`${COMPONENT_PATH}/conf/texteditor.json`);

	Object.defineProperty(host, "value", {get: _=>_getValue(host), set: value=>_setValue(value, host)});
	Object.defineProperty(host, "readOnly", {get: _=>_getReadOnly(host), set: value=>_setReadOnly(value, host)});

	const data = { componentPath: COMPONENT_PATH, styleBody:host.getAttribute("styleBody")?
		`<style>${host.getAttribute("styleBody")}</style>`:undefined, 
		showToolbar:host.getAttribute("showToolbar")?.toLowerCase() == "false"?undefined:true,
		showToolbarLoadButton:host.getAttribute("showToolbarLoadButton")?.toLowerCase() == "false"?undefined:true,
		showToolbarSaveButton:host.getAttribute("showToolbarSaveButton")?.toLowerCase() == "false"?undefined:true };

	text_editor.setDataByHost(host, data);
}

async function elementRendered(host) {
	const editorMode = host.getAttribute("editormode")?.toLowerCase()||"javascript",
		readOnly = host.getAttribute("readonly")!=null?true:false, 
		autofocus = host.getAttribute("takefocus")!=null?true:false,
		p3Libs = [...CONF.P3_LIBS_CORE, ...CONF[`P3_LIBS_${editorMode.toUpperCase()}`]], shadowRoot = text_editor.getShadowRootByHost(host);
	shadowRoot.head = shadowRoot.firstElementChild;
	for (const p3lib of p3Libs) await $$.require(`${COMPONENT_PATH}/${p3lib}`, shadowRoot);	// load all the libs we need
	delete shadowRoot.head;
	
	setTimeout(_=>{	// apparently we need timeout for CM to load properly
		const editorElement = text_editor.getShadowRootByHost(host).querySelector("textarea#texteditor");
		const cm = CodeMirror(cmElement => editorElement.parentNode.replaceChild(cmElement, editorElement), 
			{lineNumbers:true, gutter:true, lineWrapping:true, styleActiveLine: true, styleActiveSelected: true, 
				mode: editorMode == "text" ? undefined : editorMode, lint: {selfContain: true}, 
				gutters: ["CodeMirror-lint-markers"], matchBrackets: true, readOnly, autofocus}); 
		text_editor.getMemoryByHost(host).editor = cm; cm.setSize("100%", "100%"); 

		if (host.getAttribute("value")) _setValue(host.getAttribute("value"), host);
	}, 10);
}

async function open(element) {
	const host = text_editor.getHostElement(element);
	const mime = host.getAttribute("uploadMime")||(host.getAttribute("editormode")?`text/${host.getAttribute("editormode")}`:"text/javascript");
	try {
		const contents = (await util.uploadAFile(mime)).data;
		if (contents) _setValue(contents, text_editor.getHostElement(element));
	} catch (err) {LOG.error(`Error uploading file, ${err}`);}
}

async function save(element) {
	const host = text_editor.getHostElement(element);
	const mime = host.getAttribute("downloadMime")||(host.getAttribute("editormode")?`text/${host.getAttribute("editormode")}`:"text/javascript");
	const contents = _getValue(host);
	util.downloadFile(contents, mime, decodeURIComponent(host.getAttribute("downloadfilename"))||"code.txt");
}

function _getValue(host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	const value = cm?.getDoc().getValue(); return value||"";
}

function _setValue(value, host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	if (!cm?.getDoc()) return; else cm.getDoc().setValue(value);
}

function _getReadOnly(host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	return cm.getOption("readOnly");
}

function _setReadOnly(value, host) {
	const cm = text_editor.getMemoryByHost(host).editor;
	return cm.setOption("readOnly", value);
}

// convert this all into a WebComponent so we can use it
export const text_editor = {trueWebComponentMode: true, elementPrerender, elementRendered, open, save}
monkshu_component.register("text-editor", `${COMPONENT_PATH}/text-editor.html`, text_editor);