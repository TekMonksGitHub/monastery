import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
import { router } from "/framework/js/router.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_list_box";
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

const elementConnected = async (element) => {
  Object.defineProperty(element, "value", { get: (_) => _getValue(element, element.getAttribute("type")), set: (value) => _setValue(value, element), });
  const data = { styleBody: element.getAttribute("styleBody") ? `<style>${element.getAttribute("styleBody")}</style>` : undefined, };

  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  if (memory.Parameter && memory.Parameter.length && element.getAttribute("type") == "Parameter") { _setValue(memory, element, element.getAttribute("type")) }
  else if (memory.Message && memory.Message.length && element.getAttribute("type") == "Message") { _setValue(memory, element, element.getAttribute("type")) }
  else if (memory.Variable && memory.Variable.length && element.getAttribute("type") == "Variable") { _setValue(memory, element, element.getAttribute("type")) }

};

async function elementRendered(element) {
  dialog_box.getMemoryByContainedElement(element).retValIDs = ["listbox"];
}

function _getValue(host, type) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  if (shadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const textBoxContainer = shadowRoot.querySelector("div#page-contents");
    return _setValuesToMemory(textBoxContainer, shadowRoot, type);
  }

  const textBoxContainer = list_box.shadowRoots.listbox.querySelector("#page-contents");
  return _setValuesToMemory(textBoxContainer, shadowRoot, type);
}

function _setValue(memory, host, type) {

  const textBoxValues = memory[`${type}`]
  // removing previous elements
  list_box.shadowRoots.listbox.querySelector("#page-contents").innerHTML = '';

  if (type == "Variable") {
    for (const textBoxValue of textBoxValues) {
      window.monkshu_env.components['tool-box'].addChgvarElement('list-box', 'page-contents', 'Variable', 'Value', 'listbox', `${textBoxValue[0]}`, `${textBoxValue[1]}`);
    }
  }
  else {
    for (const textBoxValue of textBoxValues) {
      window.monkshu_env.components['tool-box'].addElement('list-box', 'page-contents', `${type}`, 'listbox', `${textBoxValue}`);
    }
  }
  const shadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const textBoxes = list_box.shadowRoots.listbox.querySelector("body").innerHTML;
  const templateRoot = new DOMParser().parseFromString(textBoxes, "text/html").documentElement;
  shadowRoot.querySelector("list-box#listbox").appendChild(templateRoot);
  router.runShadowJSScripts(templateRoot, shadowRoot)

}
function _setValuesToMemory(textBoxContainer, shadowRoot, type) {
  const memory = list_box.getMemoryByHost(DEFAULT_HOST_ID);
  const textBoxValues = [];

  if (type == "Variable") {
    for (const divBox of textBoxContainer.children) {
      const variableValues = [];
      for (const textBox of divBox.children) {
        const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
        variableValues.push(retValue);
      }
      textBoxValues.push(variableValues);
    }
    memory[`${type}`] = textBoxValues;
    return textBoxValues;
  }

  for (const textBox of textBoxContainer.children) {
    const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
    textBoxValues.push(retValue);
  }
  memory[`${type}`] = textBoxValues;
  return textBoxValues;
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
