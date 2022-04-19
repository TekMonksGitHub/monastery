/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_drop_down";
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";
const elementConnected = async (element) => {
  const nodeID=element.getAttribute('nodeID');

  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element,nodeID),
    set: (value) => _setValue(value, element),
  });
  const data = {};
  data.values=JSON.parse(element.getAttribute("list").replace(/'/g,'\"'));
  data.text=element.getAttribute("text")
  drop_down.setData(element.id, data);

};
async function elementRendered(element) {
  console.log( dialog_box.getMemoryByContainedElement(element).retValIDs);
  const nodeID=element.getAttribute('nodeID');
  const elementArray= dialog_box.getMemoryByContainedElement(element).retValIDs;
  if(elementArray.length>0&&!elementArray.includes("dropdown")){
    elementArray.push("dropdown");
  }
  else dialog_box.getMemoryByContainedElement(element).retValIDs = ["dropdown"];
  const memory = drop_down.getMemoryByHost(DEFAULT_HOST_ID);
  if(memory[`${nodeID}`]){
 const shadowRoot = drop_down.getShadowRootByHostId(element.getAttribute("id"));
  shadowRoot.querySelector(`#${memory[nodeID]}`).setAttribute("selected","selected");
  }
}
function _getValue(host,nodeID) {
  const memory = drop_down.getMemoryByHost(DEFAULT_HOST_ID);
 // const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  //const shadowRoot = radio_button.getShadowRootByHost(host); 
    const shadowRoot = drop_down.getShadowRootByHostId(host.getAttribute("id"))
   const value=shadowRoot.querySelector("select").value;
  memory[`${nodeID}`]=value;
  console.log(memory);
  return value
};
/*function _setValue(value,host,nodeID){
  console.log(value);
  const shadowRoot = drop_down.getShadowRootByHostId(host.getAttribute("id"));
  shadowRoot.querySelector(`#${value}`).setAttribute("selected","selected");
 // const shadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
//  shadowRoot.querySelector(`#${value}`).setAttribute("selected","selected");
   //drop_down.shadowRoots.dropdown.querySelector(`#${value}`).setAttribute("selected","selected");
  //  const textBoxes = drop_down.shadowRoots.dropdown.querySelector("body").innerHTML;
  //  const templateRoot = new DOMParser().parseFromString(textBoxes, "text/html").documentElement;
  //  console.log( shadowRoot.querySelector("drop-down#dropdown").children);

  //  const element = shadowRoot.querySelector("drop-down#dropdown ");
  // element.appendChild(templateRoot);

  //  const elements = shadowRoot.querySelector("drop-down#dropdown ").getElementsByTagName('html');
  // elements[1].style.visibility = "hidden";
  // element.removeChild(elements[1]);
   //console.log( shadowRoot.querySelector("drop-down#dropdown").children);
  //router.runShadowJSScripts(templateRoot, shadowRoot);
   // element.removeChild(element.lastChild)
  //element.removeChild(element.childNodes[1]);
     //element1.remove()
  //  console.log(templateRoot);
   // console.log(textBoxes1);
     // const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  // const element = shadowRoot.querySelector(`#${value}`);
  // console.log(element);

   }*/
   


export const drop_down = {
  trueWebComponentMode: true,
  elementConnected,
  elementRendered
  
};

monkshu_component.register(
  "drop-down",
  `${COMPONENT_PATH}/drop-down.html`,
  drop_down
);
