/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { text_box } from "../text-box/text-box.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

const elementConnected = async (element) => {

  const data = {
    text: element.getAttribute("text"),
    onclick: element.getAttribute("onclickHandler"),
    onclickRemoveHandler: element.getAttribute("onclickRemoveHandler"),
    componentPath: COMPONENT_PATH,
    styleBody: element.getAttribute("styleBody")
      ? `<style>${element.getAttribute("styleBody")}</style>`
      : undefined
  };

  tool_box.setData(element.id, data);
};
async function addElement(renderingParent, renderingContainer, idText, renderingElementName, value) {

text_box.addTextBox(renderingParent, renderingContainer, idText, renderingElementName, value);
}
async function addChgvarElement(renderingParent, renderingContainer, idFirstBox, idSecondBox, renderingElementName, chgvarVariable, chgvarValue) {

 text_box.addTwoTextBox(renderingParent, renderingContainer, idFirstBox, idSecondBox, renderingElementName, chgvarVariable, chgvarValue);

}
async function addSubstrElement(renderingParent, renderingContainer,  renderingElementName,variableValue, stringValue,stringIndexValue,noOfCharValue) {

  text_box.addTextBoxesForSubstr(renderingParent, renderingContainer, renderingElementName, variableValue, stringValue,stringIndexValue,noOfCharValue);
 
 }
 async function addMapElement(renderingParent, renderingContainer,  renderingElementName, stringVariableValue,startPositionValue,noOfCharValue,stringFunctionValue,repitionValue) {

  text_box.addTextBoxesForMap(renderingParent, renderingContainer,  renderingElementName, stringVariableValue,startPositionValue,noOfCharValue,stringFunctionValue,repitionValue);
 
 }
async function removeElement(renderingParent, renderingContainer, renderingElementName) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  if (dialogShadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
    parentContainer.removeChild(parentContainer.lastChild);
    return true
  }
  const box = window.monkshu_env.components[renderingParent];
  const shadowRoot = box.shadowRoots[renderingElementName];
  const parent = shadowRoot.querySelector(`#${renderingContainer}`);
  parent.removeChild(parent.lastChild);
}

export const tool_box = {
  trueWebComponentMode: true,
  elementConnected,
  addElement,
  addChgvarElement,
  addSubstrElement,
  addMapElement,
  removeElement,
};

monkshu_component.register(
  "tool-box",
  `${COMPONENT_PATH}/tool-box.html`,
  tool_box
);
