/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 import { floating_window } from "../floating-window/floating-window.mjs"
 
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

 const CONSOLE_THEME = {
    "var--window-top": "25vh", "var--window-left": "75vh", "var--window-width": "50vw",
    "var--window-height": "45vh", "var--window-background": "#DFF0FE",
    "var--window-border": "1px solid #4788C7", closeIcon: `${COMPONENT_PATH}/close.svg`
}, CONSOLE_HTML_FILE = `${COMPONENT_PATH}/code-snippet-window.html`;

async function codeSnippetWindow(element) {
    console.log(element)
    // event.stopPropagation();
    // console.log(floating_window);
    // const host = input_output_fields.getHostElement(element);
    // const shadowRoot = input_output_fields.getShadowRootByHost(host);
    const floatingWindowHTML = await $$.requireText(CONSOLE_HTML_FILE);
  
    // let result = await getFinal(shadowRoot.querySelector('#newTree'));
    await floating_window.showWindow("NodeJS", CONSOLE_THEME, floatingWindowHTML);
  }

// const https = require("https");

// https.post("https://domain.com/exposed/path", (resp)=>{

//     // The whole response has been received. Print out the result
//     resp.on("end", ()=>{
//     console.log(JSON.parse(data).explanation);
//     });
// });

export const code_snippet_window = {
    trueWebComponentMode: true, codeSnippetWindow
  }
  
  monkshu_component.register(
    "code-snippet-window",`${COMPONENT_PATH}/code-snippet-window.html`, code_snippet_window
  );