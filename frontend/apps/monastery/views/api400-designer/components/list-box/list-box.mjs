/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";

/**
 * Element was rendered
 * @param element Host element
 */
async function elementRendered(element) {
  Object.defineProperty(element, "value", { get: (_) => _getValue(element, element.getAttribute("type")), set: (value) => _setValue(value, element.getAttribute("type")) });
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const noOfElements = parentContainer.children.length;
  const textBoxComponent =  window.monkshu_env.components['text-box'];

  if (element.getAttribute("value")) {
    const values = JSON.parse(element.getAttribute("value"));
    if (values && values.length) _setValue(values, element.getAttribute("type"));
  }
  else {
    if (element.getAttribute("type") == "Parameter" && noOfElements < 1) textBoxComponent.addTextBox(element.getAttribute('type'));
    else if (element.getAttribute("type") == "Message" && noOfElements < 1) textBoxComponent.addTextBox(element.getAttribute('type'));
    else if (element.getAttribute("type") == "Map" && noOfElements < 1) textBoxComponent.addTextBoxesForMap();
    else if (element.getAttribute("type") == "Keys" && noOfElements < 1) textBoxComponent.addTextBoxesForScrKeys();
    else if (element.getAttribute("type") == "Read" && noOfElements < 1) textBoxComponent.addTextBoxesForScrRead();
    else if (element.getAttribute("type") == "runsqlprc" && noOfElements < 1) textBoxComponent.addContainerForRunsqlprc();
  }
}

function _getValue(host, type) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  const textBoxContainer = shadowRoot.querySelector("#page-contents");
  return _getTextBoxValues(textBoxContainer, shadowRoot, type);
}

function _setValue(values, type) {
  const textBoxComponent =  window.monkshu_env.components['text-box'];
  if (type == "Map"){  for (const textBoxValues of values)  if (textBoxValues.some(value => value != ""))
        textBoxComponent.addTextBoxesForMap(textBoxValues);}
  else if (type == "Keys"){  for (const textBoxValues of values)  if (textBoxValues.some(value => value != ""))
        textBoxComponent.addTextBoxesForScrKeys(textBoxValues);}
  else if (type == "Read"){ for (const textBoxValues of values) if (textBoxValues.some(value => value != ""))
        textBoxComponent.addTextBoxesForScrRead(textBoxValues);}
  else if (type == "runsqlprc") {for (const textBoxValue of values) if (textBoxValue.some(value => value != ""))
        textBoxComponent.addContainerForRunsqlprc(textBoxValue[0], textBoxValue[1], textBoxValue[2]);}
  else for (const textBoxValue of values)  if (textBoxValue != '')
        textBoxComponent.addTextBox(type, textBoxValue);
}

function _getTextBoxValues(textBoxContainer, shadowRoot, type) {
  const textBoxValues = [];
  if ( type == "Map" || type == "Keys" || type == "Read" || type =="runsqlprc") {
    for (const divBox of textBoxContainer.children) {
      const Values = [];
      for (const textBox of divBox.children)  Values.push(shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value.trim());
      textBoxValues.push(Values);
    }
    return JSON.stringify(textBoxValues);
  }

  for (const textBox of textBoxContainer.children) textBoxValues.push(shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value.trim());
  return JSON.stringify(textBoxValues);
}

export const list_box = { trueWebComponentMode: false , elementRendered };
monkshu_component.register("list-box", `${COMPONENT_PATH}/list-box.html`, list_box );