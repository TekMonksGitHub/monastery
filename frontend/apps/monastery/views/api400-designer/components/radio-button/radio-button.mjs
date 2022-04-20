/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);
const DEFAULT_HOST_ID = "__org_monkshu_radio_button";

const elementConnected = async (element) => {
  const nodeID = element.getAttribute("nodeID");
  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element, nodeID),
    set: (value) => _setValue(value, element),
  });

  const memory = radio_button.getMemoryByHost(DEFAULT_HOST_ID);
  if (memory[nodeID]) _setValue(memory[nodeID], element);
};
async function elementRendered(element) {
  const elementArray = dialog_box.getMemoryByContainedElement(element).retValIDs;
  if (elementArray.length > 0 && !elementArray.includes("radiobutton"))  elementArray.push("radiobutton");
  else  dialog_box.getMemoryByContainedElement(element).retValIDs = ["radiobutton"];
}
function _getValue(host, nodeID) {
  const memory = radio_button.getMemoryByHost(DEFAULT_HOST_ID);
  const shadowRoot = dialog_box.getShadowRootByContainedElement(host);
  const value = shadowRoot.querySelector('input[name="scr"]:checked').value;
  memory[nodeID] = value;
  return value;
}
function _setValue(value, host) {
  const data = {};
  if (value == "start") data.start = "checked";
  else if (value == "stop") data.stop = "checked";
  else if (value == "release") data.release = "checked";
  radio_button.setData(host.id, data);
}

export const radio_button = {
  trueWebComponentMode: false,
  elementConnected,
  elementRendered
};

monkshu_component.register(
  "radio-button",
  `${COMPONENT_PATH}/radio-button.html`,
  radio_button
);
