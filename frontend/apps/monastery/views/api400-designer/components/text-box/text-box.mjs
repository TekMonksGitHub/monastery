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
    const inputElement = _createElement(parentContainer, id, value,id);
    parentContainer.appendChild(inputElement);
    return true
  };
const placeHolder=id;
  //Creating a text box element
  const inputElement = _createElement(parentContainer, id, value,placeHolder);
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
async function addTextBoxesForSubstr(renderingParent, renderingContainer, renderingElementName, variableValue, stringValue,stringIndexValue,noOfCharValue) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[renderingElementName];
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  if (dialogShadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
    const divElement = _createDivElementForSubstr(parentContainer,variableValue, stringValue,stringIndexValue,noOfCharValue);
    parentContainer.appendChild(divElement);

    return true
  };
 
  //Creating a div element for SUBSTR
  const divElement = _createDivElementForSubstr(parentContainer,variableValue, stringValue,stringIndexValue,noOfCharValue);
  parentContainer.appendChild(divElement);
};
async function addTextBoxesForMap(renderingParent, renderingContainer,  renderingElementName, stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[renderingElementName];
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  if (dialogShadowRoot.querySelector("list-box#listbox").children.length > 1) {
    const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
    const divElement = _createDivElementForMap(parentContainer, stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue);
    parentContainer.appendChild(divElement);

    return true
  };
 
 
  const divElement = _createDivElementForMap(parentContainer, stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue);
  parentContainer.appendChild(divElement);
};

function _createElement(parentContainer, id, value,placeHolder, className,placeHolderType) {
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `${id}-${parentContainer.children.length + 1}`);
  if(placeHolderType=="static") inputElement.setAttribute("placeholder", placeHolder);
 else inputElement.setAttribute("placeholder", `${placeHolder}-${parentContainer.children.length + 1}`);
  if (value != undefined)  inputElement.setAttribute("value", `${value}`); 
  if (className != undefined)  inputElement.setAttribute("class",`${className}`); 
  return inputElement
};

function _createDivElement(parentContainer, id1, id2, chgvarVariable, chgvarValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", `${id1}`);
  const placeHolder1=id1;
  const placeHolder2=id2;
  const inputElement1 = _createElement(parentContainer, id1, chgvarVariable,placeHolder1, "variablebox");
  const inputElement2 = _createElement(parentContainer, id2, chgvarValue,placeHolder2, "valuebox");
  divElement.append(inputElement1, inputElement2);
  return divElement
}
function _createDivElementForSubstr(parentContainer,variableValue, stringValue,stringIndexValue,noOfCharValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "substrdiv");
  const inputElement1 = _createElement(parentContainer, "variable", variableValue,"Variable" ,"variablebox");
  const inputElement2 = _createElement(parentContainer, "string", stringValue,"String", "stringbox");
  const inputElement3 = _createElement(parentContainer,"index",  stringIndexValue,"String Index" ,"indexbox","static");
  const inputElement4 = _createElement(parentContainer,"count",  noOfCharValue, "Num of Char","countbox","static");
  divElement.append(inputElement1, inputElement2,inputElement3,inputElement4);
  return divElement
}
function _createDivElementForMap(parentContainer, stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "map");

  const inputElement1 = _createElement(parentContainer, "string", stringVariableValue,"String Variable", "stringbox");
  const inputElement2 = _createElement(parentContainer,"start",  startPositionValue,"Start Pos" ,"startbox","static");
  const inputElement3 = _createElement(parentContainer,"count",  noOfCharValue, "Num of Char","countbox","static");
  const inputElement4 = _createElement(parentContainer,"repetition",  repitionValue, "Repetition No","repitionbox","static");
  const inputElement5 = _createElement(parentContainer,"function",  stringFunctionValue,"String Function" ,"functionbox","static");
  divElement.append(inputElement1, inputElement2,inputElement3,inputElement4,inputElement5);
  return divElement
}
 
export const text_box = {
  trueWebComponentMode: true,
  addTextBox,
  addTwoTextBox,
  addTextBoxesForSubstr,
  addTextBoxesForMap

};

monkshu_component.register(
  "text-box",
  null,
  text_box
);
