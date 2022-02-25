/**
 *
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { text_box } from "../text-box/text-box.mjs";


const COMPONENT_PATH = util.getModulePath(import.meta);
const elementConnected = async (element) => {
  console.log(element);
  const data = {
    text: element.getAttribute("text"),
    onclick: element.getAttribute("onclickHandler"),
    onclickRemoveHandler: element.getAttribute("onclickRemoveHandler"),
    componentPath: COMPONENT_PATH,
    styleBody: element.getAttribute("styleBody")
      ? `<style>${element.getAttribute("styleBody")}</style>`
      : undefined,
  };

  tool_box.setData(element.id, data);
};
async function addElement(renderingParent, renderingContainer, idText) {
  
  text_box.addTextBox(
    `${renderingParent}`,
    `${renderingContainer}`,
    `${idText}`
  );
 
}
async function addChgvarElement(renderingParent, renderingContainer, idFirstBox,idSecondBox) {
  
  text_box.addTwoTextBox(
    `${renderingParent}`,
    `${renderingContainer}`,
    `${idFirstBox}`,
    `${idSecondBox}`
  );
 
}
async function removeElement(renderingParent, renderingContainer, elementName) {
  const box = window.monkshu_env.components[`${renderingParent}`];
  const shadowRoot = box.getShadowRootByHostId(box.elements[elementName].id);
  const parent = shadowRoot.querySelector(`#${renderingContainer}`);
  parent.removeChild(parent.lastChild);
}

export const tool_box = {
  trueWebComponentMode: true,
  elementConnected,
  addElement,
  addChgvarElement,
  removeElement,
};

monkshu_component.register(
  "tool-box",
  `${COMPONENT_PATH}/tool-box.html`,
  tool_box
);
/*const list_box = window.monkshu_env.components["list-box"];
  const shadowRoot = list_box.getShadowRootByHostId(
    list_box.elements.listbox.id
  );
  const text_box = window.monkshu_env.components["text-box"];
  console.log(text_box);
  const parent = shadowRoot.querySelector("#page-contents");
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `Parameter${parent.children.length+1}`);
  inputElement.setAttribute("placeholder", `Parameter${parent.children.length+1}`);
  parent.appendChild(inputElement);

 */
//const textBoxComponent = window.monkshu_env.components["text-box"];
