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
	 `${COMPONENT_PATH}/3p/jshint/jshint.js`,`${COMPONENT_PATH}/3p/codemirror/addon/lint/json-lint.js`,]
 
 async function elementConnected(element) {
	 Object.defineProperty(element, "value", {get: _=>_getValue(element), set: value=>_setValue(value, element)});
	 
	 const data = { componentPath: COMPONENT_PATH, styleBody:element.getAttribute("styleBody")?
		 `<style>${element.getAttribute("styleBody")}</style>`:undefined, 
		 showToolbar:element.getAttribute("showToolbar")?.toLowerCase() == "false"?undefined:true };
 
	 if (element.id) if (!text_editor.datas) {text_editor.datas = {}; text_editor.datas[element.id] = data;} 
	 else text_editor.data = data;
 }
 
 async function elementRendered(element) {
	 for (const p3lib of P3_LIBS) await $$.require(p3lib);	// load all the libs we need
	 setTimeout(_=>{	// apparently we need timeout for CM to load properly
		 const editorElement = text_editor.getShadowRootByHost(element).querySelector("textarea#texteditor");
		 const cm = CodeMirror(cmElement => editorElement.parentNode.replaceChild(cmElement, editorElement), 
			 {lineNumbers:true, gutter:true,  styleActiveLine: true, styleActiveSelected: true,matchBrackets:true,matchTags:true, readOnly: true, className: "readOnly" ,
				 mode: "application/ld+json", lint: {selfContain: true}, gutters: ["CodeMirror-lint-markers"], matchBrackets: true}); 
		 text_editor.getMemoryByHost(element).editor = cm; cm.setSize("100%", "100%"); 
		 let data = JSON.stringify([
			 {
			   "id": "001",
			   "user": "megan_F0x",
			   "profile":
				 {    
					 "nama":"Megan Fox",
					 "alamat":"Jl Nin aja dulu",
					 "telepon":628123456789,
					 "email":"duh@malu.co",
					 "social media": 
					   {
						 "facebook":"megan fox",
						 "twitter":"@megan_F0x"
					   }
				 },
			   "pengalaman":[
					   {
						 "perusahaan":"PT Transformer",
						 "daritahun": 2010,
						 "sampaitahun": 2011,
						 "posisi": "junior developer",
						 "promosi karir": null,
						 "listpekerjaan": [
						   {
							 "jenis": "project base",
							 "deskripsi": "front end developer",
							 "lamapekerjaan": "6 bulan",
							 "deadline bonus": true,
							 "rekan kerja": [
							   {
								 "nama": "shia lebaouf",
								 "posisi": "lead developer",
								 "contact": 
								   {
									 "telepon" : 628890066631,
									 "email": "shia@lebaouf.com",
									 "socialmedia": {
									   "facebook": "shia lebaouf",
									   "twitter": "@shia lebaouf"
									 }
								   }
							   },
							   {
								 "nama": "josh duhamel",
								 "posisi": "senior developer",
								 "contact": 
								   {
									 "telepon" : 62345667687788,
									 "email": "josh@duhamel.com",
									 "socialmedia": {
									   "facebook": "josh duhamel",
									   "twitter": "@josh duhamel"
									 }
								   }
							   }]
						   },
						   {
							 "jenis": "project base",
							 "jabatan": "web developer",
							 "lamapekerjaan": "3 bulan",
							 "deadline bonus": false,
							 "rekan kerja": [
							   {
								 "nama": "stephen amell",
								 "posisi": "lead developer",
								 "contact": 
								   {
									 "telepon" : 629485765690,
									 "email": "stephen@amell.com",
									 "socialmedia": {
									   "facebook": "stephen amell",
									   "twitter": "@stephen_amell"
									 }
								   }
							   },
							   {
								 "nama": "tyler perry",
								 "posisi": "senior developer",
								 "contact": 
								   {
									 "telepon" : 62948453666,
									 "email": "tyler@perry.com",
									 "socialmedia": {
									   "facebook": "tyler perry",
									   "twitter": "@tyler perry"
									 }
								   }
							   }]
						   }]
					   }]
			 }
		   ],null,4);
		  _setValue(data, element);
	 }, 10);
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
	 util.downloadFile(jsContents, "text/javascript", decodeURIComponent(host.getAttribute("downloadfilename"))||"code.js");
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