/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";

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

async function removeElement() {
  const dialogShadowRoot = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);
  const parent = dialogShadowRoot .querySelector("div#page-contents");
  parent.removeChild(parent.lastChild);
}

export const tool_box = {
  trueWebComponentMode: true,
  elementConnected,
  removeElement
};

monkshu_component.register(
  "tool-box",
  `${COMPONENT_PATH}/tool-box.html`,
  tool_box
);
