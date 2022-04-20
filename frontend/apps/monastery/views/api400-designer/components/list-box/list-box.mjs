/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
import { router } from "/framework/js/router.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_list_box";
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";


const elementConnected = async (element) => {
  Object.defineProperty(element, "value", { get: (_) => _getValue(element, element.getAttribute("type"),element.getAttribute("nodeID")), set: (value) => _setValue(value, element) });
  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  const nodeID=element.getAttribute('nodeID');
  if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Parameter")  _setValue(memory,  element.getAttribute("type"),nodeID);
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Message")  _setValue(memory,  element.getAttribute("type"),nodeID);
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Variable")  _setValue(memory, element.getAttribute("type"),nodeID); 
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Sub Strings")  _setValue(memory, element.getAttribute("type"),nodeID); 
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Map")  _setValue(memory, element.getAttribute("type"),nodeID);
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Keys")  _setValue(memory, element.getAttribute("type"),nodeID);
  else if (memory[nodeID]&& memory[nodeID].length && element.getAttribute("type") == "Read")  _setValue(memory, element.getAttribute("type"),nodeID);
};

async function elementRendered(element) {
  console.log( dialog_box.getMemoryByContainedElement(element).retValIDs);
  const elementArray= dialog_box.getMemoryByContainedElement(element).retValIDs;
  if(elementArray.length>0&&!elementArray.includes("listbox")){
    elementArray.push("listbox");
  }
  else dialog_box.getMemoryByContainedElement(element).retValIDs = ["listbox"];
  
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const noOfElements=parentContainer.children.length;
  if ( element.getAttribute("type") == "Parameter" && noOfElements<1)  window.monkshu_env.components['tool-box'].addElement('list-box', 'page-contents',element.getAttribute('type'),'listbox');
  else if ( element.getAttribute("type") == "Message" && noOfElements<1)  window.monkshu_env.components['tool-box'].addElement('list-box', 'page-contents',element.getAttribute('type'),'listbox'); 
  else if ( element.getAttribute("type") == "Variable" &&noOfElements<1) window.monkshu_env.components['tool-box'].addChgvarElement('list-box', 'page-contents', 'Variable', 'Value', 'listbox');
  else if ( element.getAttribute("type") == "Sub Strings" &&noOfElements<1) window.monkshu_env.components['tool-box'].addSubstrElement('list-box', 'page-contents', 'listbox');
  else if ( element.getAttribute("type") == "Map" &&noOfElements<1) window.monkshu_env.components['tool-box'].addMapElement('list-box', 'page-contents', 'listbox');
  else if ( element.getAttribute("type") == "Keys" &&noOfElements<1) window.monkshu_env.components['tool-box'].addScrKeysElement('list-box', 'page-contents', 'listbox');
  else if ( element.getAttribute("type") == "Read" &&noOfElements<1) window.monkshu_env.components['tool-box'].addScrReadElement('list-box', 'page-contents', 'listbox');
}

function _getValue(host, type,nodeID) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  if (shadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const textBoxContainer = shadowRoot.querySelector("div#page-contents");
    return _setValuesToMemory(textBoxContainer, shadowRoot, type,nodeID);
  }
  const textBoxContainer = list_box.shadowRoots.listbox.querySelector("#page-contents");
  return _setValuesToMemory(textBoxContainer, shadowRoot, type,nodeID);
}

function _setValue(memory, type,nodeID) {

  const textBoxValues = memory[nodeID];
  console.log(textBoxValues);
  // removing previous elements
  list_box.shadowRoots.listbox.querySelector("#page-contents").innerHTML = '';
  if (type == "Variable") {
    for (const textBoxValue of textBoxValues) {
      if(textBoxValue.some(value=>value!=""))
      window.monkshu_env.components['tool-box'].addChgvarElement('list-box', 'page-contents', 'Variable', 'Value', 'listbox', textBoxValue[0], textBoxValue[1]);
    }
  }
  else if (type == "Sub Strings") {
    for (const textBoxValue of textBoxValues) {

      if(textBoxValue.some(value=>value!=""))
      window.monkshu_env.components['tool-box'].addSubstrElement('list-box', 'page-contents','listbox',textBoxValue[0],textBoxValue[1],textBoxValue[2],textBoxValue[3] );
    }
  }
  else if (type == "Map") {
    for (const textBoxValue of textBoxValues) {
      if(textBoxValue.some(value=>value!=""))
      window.monkshu_env.components['tool-box'].addMapElement('list-box', 'page-contents','listbox',textBoxValue[0],textBoxValue[1],textBoxValue[2],textBoxValue[3],textBoxValue[4] );
    }
  }
  else if (type == "Keys") {
    for (const textBoxValue of textBoxValues) {
      if(textBoxValue.some(value=>value!=""))
      window.monkshu_env.components['tool-box'].addScrKeysElement('list-box', 'page-contents','listbox',textBoxValue[0],textBoxValue[1],textBoxValue[2]);
    }
  }
  else if (type == "Read") {
    for (const textBoxValue of textBoxValues) {
      if(textBoxValue.some(value=>value!=""))
      window.monkshu_env.components['tool-box'].addScrReadElement('list-box', 'page-contents','listbox',textBoxValue[0],textBoxValue[1],textBoxValue[2],textBoxValue[3]);
    }
  }
  else {
    for (const textBoxValue of textBoxValues) {
      if(textBoxValue!='')
      window.monkshu_env.components['tool-box'].addElement('list-box', 'page-contents', type, 'listbox', textBoxValue);
    }
  }
  const shadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const textBoxes = list_box.shadowRoots.listbox.querySelector("body").innerHTML;
  const templateRoot = new DOMParser().parseFromString(textBoxes, "text/html").documentElement;
  shadowRoot.querySelector("list-box#listbox").appendChild(templateRoot);
  router.runShadowJSScripts(templateRoot, shadowRoot);

}

function _setValuesToMemory(textBoxContainer, shadowRoot, type,nodeID) {
  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  const textBoxValues = [];
  if (type == "Variable"||type == "Sub Strings"||type == "Map"||type =="Keys"||type=="Read") {
    for (const divBox of textBoxContainer.children) {
      const Values = [];
      for (const textBox of divBox.children) {
        const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
        Values.push(retValue);
      }
      textBoxValues.push(Values);
    }
    memory[nodeID] = textBoxValues;
    return textBoxValues;
  }

  for (const textBox of textBoxContainer.children) {
    const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
    textBoxValues.push(retValue);
  }
  memory[nodeID] = textBoxValues;
  return textBoxValues;
}
export const list_box = {
  trueWebComponentMode: false,
  elementConnected,
  elementRendered
};

monkshu_component.register(
  "list-box",
  `${COMPONENT_PATH}/list-box.html`,
  list_box
);

