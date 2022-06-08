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


const elementConnected = async (element) => {
  Object.defineProperty(element, "value", { get: (_) => _getValue(element, element.getAttribute("type")), set: (value) => _setValue(value, element.getAttribute("type")) });
};

async function elementRendered(element) {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parentContainer = dialogShadowRoot.querySelector("div#page-contents");
  const noOfElements = parentContainer.children.length;

  if (element.getAttribute("value")) {
    let values;
    if (element.getAttribute("value")) values = JSON.parse(element.getAttribute("value"));
    if (values && values.length && element.getAttribute("type") == "Parameter") _setValue(values, element.getAttribute("type"));
    else if (values && values.length && element.getAttribute("type") == "Message") _setValue(values, element.getAttribute("type"));
    else if (values && values.length && element.getAttribute("type") == "Map") _setValue(values, element.getAttribute("type"));
    else if (values && values.length && element.getAttribute("type") == "Keys") _setValue(values, element.getAttribute("type"));
    else if (values && values.length && element.getAttribute("type") == "Read") _setValue(values, element.getAttribute("type"));
    else if (values && values.length && element.getAttribute("type") == "runsqlprc") _setValue(values, element.getAttribute("type"));
  }
  else {
    if (element.getAttribute("type") == "Parameter" && noOfElements < 1) window.monkshu_env.components['text-box'].addTextBox(element.getAttribute('type'));
    else if (element.getAttribute("type") == "Message" && noOfElements < 1) window.monkshu_env.components['text-box'].addTextBox(element.getAttribute('type'));
    else if (element.getAttribute("type") == "Map" && noOfElements < 1) window.monkshu_env.components['text-box'].addTextBoxesForMap();
    else if (element.getAttribute("type") == "Keys" && noOfElements < 1) window.monkshu_env.components['text-box'].addTextBoxesForScrKeys();
    else if (element.getAttribute("type") == "Read" && noOfElements < 1) window.monkshu_env.components['text-box'].addTextBoxesForScrRead();
    else if (element.getAttribute("type") == "runsqlprc" && noOfElements < 1) window.monkshu_env.components['text-box'].addContainerForRunsqlprc();
  }
}

function _getValue(host, type) {
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  const textBoxContainer = shadowRoot.querySelector("#page-contents");
  return _getTextBoxValues(textBoxContainer, shadowRoot, type);
}

function _setValue(values, type) {

  if (type == "Map") {
    for (const textBoxValue of values) {
      if (textBoxValue.some(value => value != ""))
        window.monkshu_env.components['text-box'].addTextBoxesForMap(textBoxValue[0], textBoxValue[1], textBoxValue[2], textBoxValue[3], textBoxValue[4]);
    }
  }
  else if (type == "Keys") {
    for (const textBoxValue of values) {
      if (textBoxValue.some(value => value != ""))
        window.monkshu_env.components['text-box'].addTextBoxesForScrKeys(textBoxValue[0], textBoxValue[1], textBoxValue[2]);
    }
  }
  else if (type == "Read") {
    for (const textBoxValue of values) {
      if (textBoxValue.some(value => value != ""))
        window.monkshu_env.components['text-box'].addTextBoxesForScrRead(textBoxValue[0], textBoxValue[1], textBoxValue[2], textBoxValue[3]);
    }
  }
  else if (type == "runsqlprc") {
    for (const textBoxValue of values) {
      if (textBoxValue.some(value => value != ""))
        window.monkshu_env.components['text-box'].addContainerForRunsqlprc(textBoxValue[0], textBoxValue[1], textBoxValue[2]);
    }
  }
  else {
    for (const textBoxValue of values) {
      if (textBoxValue != '')
        window.monkshu_env.components['text-box'].addTextBox(type, textBoxValue);
    }
  }


}

function _getTextBoxValues(textBoxContainer, shadowRoot, type) {
  const textBoxValues = [];
  if ( type == "Map" || type == "Keys" || type == "Read" || type =="runsqlprc") {
    for (const divBox of textBoxContainer.children) {
      const Values = [];
      for (const textBox of divBox.children) {
        const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
        Values.push(retValue.trim());
      }
      textBoxValues.push(Values);
    }
    return JSON.stringify(textBoxValues);
  }

  for (const textBox of textBoxContainer.children) {
    const retValue = shadowRoot.querySelector(`#${textBox.getAttribute("id")}`).value;
    textBoxValues.push(retValue.trim());
  }
  return JSON.stringify(textBoxValues);
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