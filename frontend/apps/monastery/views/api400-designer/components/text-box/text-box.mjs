/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

async function addTextBox( id,  value) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  const placeHolder=id;
  //Creating a text box element
  const inputElement = _createElement(parentContainer, id, value,placeHolder);
  parentContainer.appendChild(inputElement);
  return true
}
async function addTwoTextBox( id1, id2, chgvarVariable, chgvarValue) {

  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  //Creating a div element having two text box
  const divElement = _createDivElement(parentContainer, id1, id2, chgvarVariable, chgvarValue);
  parentContainer.appendChild(divElement);
};
async function addTextBoxesForSubstr( variableValue, stringValue,stringIndexValue,noOfCharValue) {

  //Creating a div element for SUBSTR
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForSubstr(parentContainer,variableValue, stringValue,stringIndexValue,noOfCharValue);
  parentContainer.appendChild(divElement);
};
async function addTextBoxesForMap( stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForMap(parentContainer, stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue);
  parentContainer.appendChild(divElement);
};
async function addTextBoxesForScrKeys( y_coordinateValue,x_coordinateValue,keyValue) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForScrKeys(parentContainer, y_coordinateValue,x_coordinateValue,keyValue);
  parentContainer.appendChild(divElement);
};
async function addTextBoxesForScrRead(rowFromValue,columnFromValue,rowToValue,columnToValue) {
 
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer =  dialogShadowRoot.querySelector("div#page-contents");
  const divElement = _createDivElementForScrRead(parentContainer, rowFromValue,columnFromValue,rowToValue,columnToValue);
  parentContainer.appendChild(divElement);
};

function _createElement(parentContainer, id, value,placeHolder, className,placeHolderType,type) {

  const inputElement = document.createElement("input");
 if(type!=undefined) inputElement.setAttribute("type", "number"); 
 else inputElement.setAttribute("type", "text");
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
function _createDivElementForScrKeys(parentContainer, y_coordinateValue,x_coordinateValue,keyValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "scr-keys");
 
  const inputElement1 = _createElement(parentContainer,"y",  y_coordinateValue,"y-cordinate" ,"y-coordinates","static");
  const inputElement2 = _createElement(parentContainer,"x",  x_coordinateValue, "x-cordinate","x-coordinates","static");
  const inputElement3 = _createElement(parentContainer, "key", keyValue,"Key", "Keys");
  divElement.append(inputElement1, inputElement2,inputElement3);
  return divElement
}
function _createDivElementForScrRead(parentContainer, rowFromValue,columnFromValue,rowToValue,columnToValue) {
  const divElement = document.createElement("div");
  divElement.setAttribute("class", "scr-read");
  const inputElement1 = _createElement(parentContainer, "screen-row-from", rowFromValue,"Screen Row From", "rows-from","dynamic");
  const inputElement2 = _createElement(parentContainer,"screen-col-from",  columnFromValue,"Screen Col From" ,"cols-from","dynamic");
  const inputElement3 = _createElement(parentContainer,"screen-row-to",  rowToValue, "Screen Row To","rows-to","dynamic");
  const inputElement4 = _createElement(parentContainer,"screen-col-to",  columnToValue, "Screen Col To","cols-to","dynamic");
  divElement.append(inputElement1, inputElement2,inputElement3,inputElement4);
  return divElement
}
 
export const text_box = {
  trueWebComponentMode: true,
  addTextBox,
  addTwoTextBox,
  addTextBoxesForSubstr,
  addTextBoxesForScrKeys,
  addTextBoxesForMap,
  addTextBoxesForScrRead

};

monkshu_component.register(
  "text-box",
  null,
  text_box
);
