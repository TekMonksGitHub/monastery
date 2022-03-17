import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_list_box";
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

const elementConnected = async (element) => {
  Object.defineProperty(element, "value", { get: (_) => _getValue(element),set: (value) => _setValue(value, element),});
  const data = { styleBody: element.getAttribute("styleBody") ? `<style>${element.getAttribute("styleBody")}</style>` : undefined, };

  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  if (memory.box && memory.box.length) { _setValue(memory.box,element) }
  else { memory.box = {}; }
};

async function elementRendered(element) {

  if (dialog_box.getMemoryByContainedElement(element).retValIDs.length == 0)
    dialog_box.getMemoryByContainedElement(element).retValIDs = ["listbox"];

}

function _getValue(host) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  if(shadowRoot.querySelector("list-box#listbox").children.length>1){
    {
      const textBoxContainer =shadowRoot.querySelector("div#page-contents");
      const textBoxValues = [];
  for (const textBox of textBoxContainer.children) {
    const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
    textBoxValues.push(retValue);
  }
  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  memory.box = textBoxValues;
  return textBoxValues;
    }}
    
  const textBoxContainer = list_box.shadowRoots.listbox.querySelector("#page-contents");
  const textBoxValues = [];
  for (const textBox of textBoxContainer.children) {
    const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
    textBoxValues.push(retValue);
  }
  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  memory.box = textBoxValues;
  return textBoxValues;
}

function _setValue(textBoxValues,host) {
   // removing previous elements
   list_box.shadowRoots.listbox.querySelector("#page-contents").innerHTML = '';
   for (const textBoxValue of textBoxValues) {
     window.monkshu_env.components['tool-box'].addElement('list-box','page-contents','Parameter','listbox',`${textBoxValue}`);
   }
   const shadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
    const textBoxes = list_box.shadowRoots.listbox.querySelector("body").innerHTML;
    const templateRoot = new DOMParser().parseFromString(textBoxes, "text/html").documentElement;
    shadowRoot.querySelector("list-box#listbox").appendChild(templateRoot); 
    router.runShadowJSScripts(templateRoot, shadowRoot)

}

export const list_box = {
  trueWebComponentMode: false,
  elementConnected,
  elementRendered,
};

monkshu_component.register(
  "list-box",
  `${COMPONENT_PATH}/list-box.html`,
  list_box
);
