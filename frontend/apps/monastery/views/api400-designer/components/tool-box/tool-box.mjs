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
async function addElement( idText,value) {

text_box.addTextBox( idText, value);
}
async function addChgvarElement(idFirstBox, idSecondBox, chgvarVariable, chgvarValue) {

 text_box.addTwoTextBox( idFirstBox, idSecondBox, chgvarVariable, chgvarValue);

}
async function addSubstrElement(  variableValue, stringValue,stringIndexValue,noOfCharValue) {

  text_box.addTextBoxesForSubstr( variableValue, stringValue,stringIndexValue,noOfCharValue);
 
 }
 async function addMapElement( stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue) {

  text_box.addTextBoxesForMap( stringVariableValue,startPositionValue,noOfCharValue,repitionValue,stringFunctionValue);
 
 }
 async function addScrKeysElement(  y_coordinateValue,x_coordinateValue,keyValue) {

  text_box.addTextBoxesForScrKeys(y_coordinateValue,x_coordinateValue,keyValue,);
 
 }
 async function addScrReadElement( rowFromValue,columnFromValue,rowToValue,columnToValue) {

  text_box.addTextBoxesForScrRead(rowFromValue,columnFromValue,rowToValue,columnToValue);
 
 }
async function removeElement() {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parent = dialogShadowRoot .querySelector("div#page-contents");
  parent.removeChild(parent.lastChild);
}

export const tool_box = {
  trueWebComponentMode: true,
  elementConnected,
  addElement,
  addChgvarElement,
  addSubstrElement,
  addMapElement,
  addScrKeysElement,
  addScrReadElement,
  removeElement
};

monkshu_component.register(
  "tool-box",
  `${COMPONENT_PATH}/tool-box.html`,
  tool_box
);
