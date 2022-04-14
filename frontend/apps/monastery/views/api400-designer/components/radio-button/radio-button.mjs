/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_radio_button";
const elementConnected = async (element) => {
  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element),
    set: (value) => _setValue(value, element),
  });
  // const data = {};

  // data.values=JSON.parse(element.getAttribute("list").replace(/'/g,'\"'));
  // data.text=element.getAttribute("text")
  // drop_down.setData(element.id, data);

};
async function elementRendered(element) {
  console.log(element);
  console.log( dialog_box.getMemoryByContainedElement(element).retValIDs);
  const elementArray= dialog_box.getMemoryByContainedElement(element).retValIDs;
  if(elementArray.length>0&&!elementArray.includes("radiobutton")){
    elementArray.push("radiobutton");
  }
  else dialog_box.getMemoryByContainedElement(element).retValIDs = ["radiobutton"];
  console.log(element.getAttribute("value"));
  
}
function _getValue(host) {
  
   const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
   const value=shadowRoot.querySelector('input[name="scr"]:checked').value;
  
 return value
 };



export const radio_button = {
  trueWebComponentMode: false,
  elementConnected,
  elementRendered
  
};

monkshu_component.register(
  "radio-button",
  `${COMPONENT_PATH}/radio-button.html`,
  radio_button
);
