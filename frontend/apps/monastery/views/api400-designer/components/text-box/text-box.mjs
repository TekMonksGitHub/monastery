/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

async function addTextBox(renderingParent, renderingContainer, id, renderingElementName, value) {

  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[renderingElementName];
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);

  if (dialogShadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
    const inputElement = _createElement(parentContainer, id, value);
    parentContainer.appendChild(inputElement);
    return true
  };

  //Creating a text box element
  const inputElement = _createElement(parentContainer, id, value);
  parentContainer.appendChild(inputElement);
  return true

}
async function addTwoTextBox(renderingParent, renderingContainer, id1, id2, renderingElementName, chgvarVariable, chgvarValue) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[renderingElementName];
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  if (dialogShadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
    const divElement = _createDivElement(parentContainer, id1, id2, chgvarVariable, chgvarValue);
    parentContainer.appendChild(divElement);

    return true
  };

  //Creating a div element having two text box
  const divElement = _createDivElement(parentContainer, id1, id2, chgvarVariable, chgvarValue);
  parentContainer.appendChild(divElement);
};

function _createElement(parentContainer, id, value, className) {
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `${id}-${parentContainer.children.length + 1}`);
  inputElement.setAttribute("placeholder", `${id}-${parentContainer.children.length + 1}`);
  if (value != undefined)  inputElement.setAttribute("value", `${value}`); 
  if (className != undefined)  inputElement.setAttribute("class",`${className}`); 
  return inputElement
};

function _createDivElement(parentContainer, id1, id2, chgvarVariable, chgvarValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", `${id1}`);
  const inputElement1 = _createElement(parentContainer, id1, chgvarVariable, "firstbox");
  const inputElement2 = _createElement(parentContainer, id2, chgvarValue, "secondbox");
  divElement.append(inputElement1, inputElement2);
  return divElement
}
export const text_box = {
  trueWebComponentMode: true,
  addTextBox,
  addTwoTextBox

};

monkshu_component.register(
  "text-box",
  null,
  text_box
);
