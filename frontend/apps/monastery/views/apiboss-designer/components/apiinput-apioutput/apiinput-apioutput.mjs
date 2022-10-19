/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

//  const elementConnected = async (element) => {
//     const data = {text: element.getAttribute("text")};
//     if (element.getAttribute("styleBody")) data.styleBody = `<style>${element.getAttribute("styleBody")}</style>`;
//     text_div.setData(element.id, data);
//  }

export const apiinput_apioutput = {
    trueWebComponentMode: true,
}

monkshu_component.register(
    "apiinput-apioutput", `${COMPONENT_PATH}/apiinput-apioutput.html`, apiinput_apioutput
);