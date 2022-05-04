/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta);


const elementConnected = async (element) => {
  Object.defineProperty(element, "value", {
    get: (_) => _getValue(element),
    set: (value) => _setValue(value, element)
  });
  const data = {};
  data.values = JSON.parse(element.getAttribute("list").replace(/'/g, '\"'));
  data.text = element.getAttribute("text")
  drop_down.setData(element.id, data);

};
async function elementRendered(element) {
  if(element.getAttribute("value")){
    const shadowRoot = drop_down.getShadowRootByHostId(element.getAttribute("id"));
    shadowRoot.querySelector(`#${element.getAttribute("value")}`).setAttribute("selected", "selected");
  }
}
function _getValue(host) {
  const shadowRoot = drop_down.getShadowRootByHostId(host.getAttribute("id"));
  const value = shadowRoot.querySelector("select").value;
  return value;
};


export const drop_down = {
  trueWebComponentMode: true,
  elementConnected,
  elementRendered

};

monkshu_component.register(
  "drop-down",
  `${COMPONENT_PATH}/drop-down.html`,
  drop_down
);
