import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
const COMPONENT_PATH = util.getModulePath(import.meta);

async function addTextBox(renderingParent, renderingContainer,id,renderingElementName) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[`${renderingElementName}`];
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);
  //Creating a text box element
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `${id}-${parentContainer.children.length+1}`);
  inputElement.setAttribute("placeholder", `${id}-${parentContainer.children.length+1}`);
  parentContainer.appendChild(inputElement);
}
async function addTwoTextBox(renderingParent, renderingContainer,id1,id2,renderingElementName) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[`${renderingElementName}`]
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);

  //Creating a div element having two text box
  const divElement = document.createElement("div");
  divElement.setAttribute("class", `${id1}`);
  const inputElement1 = document.createElement("input");
  inputElement1.setAttribute("type", "text");
  inputElement1.classList.add("firstbox");
  inputElement1.setAttribute("id", `${id1}${parentContainer.children.length+1}`);
  inputElement1.setAttribute("placeholder", `${id1}${parentContainer.children.length+1}`);
  const inputElement2 = document.createElement("input");
  inputElement2.setAttribute("type", "text");
  inputElement2.classList.add("secondbox");
  inputElement2.setAttribute("id", `${id2}${parentContainer.children.length+1}`);
  inputElement2.setAttribute("placeholder", `${id2}${parentContainer.children.length+1}`);
  divElement.append(inputElement1,inputElement2);
  parentContainer.appendChild(divElement);
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
