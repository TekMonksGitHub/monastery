/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);


const elementConnected = async (element) => {
  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element),
    set: (value) => _setValue(value, element),
  });
  const data = {};

  data.values=JSON.parse(element.getAttribute("list").replace(/'/g,'\"'));
  data.text=element.getAttribute("text")
  drop_down.setData(element.id, data);

};
async function elementRendered(element) {
  console.log( dialog_box.getMemoryByContainedElement(element).retValIDs);
  const elementArray= dialog_box.getMemoryByContainedElement(element).retValIDs;
  if(elementArray.length>0&&!elementArray.includes("dropdown")){
    elementArray.push("dropdown");
  }
  else dialog_box.getMemoryByContainedElement(element).retValIDs = ["dropdown"];
  
 
  
}



function _getValue(host) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  const value=shadowRoot.querySelector("select").value;

 return value
};



export const drop_down = {
  trueWebComponentMode: false,
  elementConnected,
  elementRendered
  
};

monkshu_component.register(
  "drop-down",
  `${COMPONENT_PATH}/drop-down.html`,
  drop_down
);
