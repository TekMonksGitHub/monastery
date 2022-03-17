import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { util } from "/framework/js/util.mjs";
const COMPONENT_PATH = util.getModulePath(import.meta);
import { dialog_box } from "../../../shared/components/dialog-box/dialog-box.mjs";
import { list_box } from "../list-box/list-box.mjs";

const DEFAULT_HOST_ID = "__org_monkshu_list_box";
const DIALOG_HOST_ID = "__org_monkshu_dialog_box";
async function addTextBox(renderingParent, renderingContainer,id,renderingElementName,value) {
 
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[`${renderingElementName}`];
  const shadowRoot1 = dialog_box.getShadowRootByHostId(DIALOG_HOST_ID);

  if(shadowRoot1.querySelector("list-box#listbox").children.length>1){
   {
   const parentContainer =shadowRoot1.querySelector("div#page-contents")
   const inputElement = document.createElement("input");
   inputElement.setAttribute("type", "text");
   inputElement.setAttribute("id", `${id}-${parentContainer.children.length+1}`);
   inputElement.setAttribute("placeholder", `${id}-${parentContainer.children.length+1}`);
   console.log(value);
   if(value!="undefined"){ inputElement.setAttribute("value", `${value}`);}
   parentContainer.appendChild(inputElement);

   return true;
   }; 
  }
;
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);

  //Creating a text box element
  const inputElement = document.createElement("input");
  inputElement.setAttribute("type", "text");
  inputElement.setAttribute("id", `${id}-${parentContainer.children.length+1}`);
  inputElement.setAttribute("placeholder", `${id}-${parentContainer.children.length+1}`);
  if(value!="undefined"){ inputElement.setAttribute("value", `${value}`);}
  parentContainer.appendChild(inputElement);
}
async function addTwoTextBox(renderingParent, renderingContainer,id1,id2,renderingElementName,values) {
  const parent = window.monkshu_env.components[renderingParent];
  const shadowRoot = parent.shadowRoots[`${renderingElementName}`];
  const parentContainer = shadowRoot.querySelector(`#${renderingContainer}`);

  //Creating a div element having two text box
  const divElement = document.createElement("div");
  divElement.setAttribute("class", `${id1}`);
  const inputElement1 = document.createElement("input");
  inputElement1.setAttribute("type", "text");
  inputElement1.classList.add("firstbox");
  inputElement1.setAttribute("id", `${id1}${parentContainer.children.length+1}`);
  inputElement1.setAttribute("placeholder", `${id1}${parentContainer.children.length+1}`);
 // if(values!="undefined"){ inputElement1.setAttribute("value", `${values.Variable}`);}
  const inputElement2 = document.createElement("input");
  inputElement2.setAttribute("type", "text");
  inputElement2.classList.add("secondbox");
  inputElement2.setAttribute("id", `${id2}${parentContainer.children.length+1}`);
  inputElement2.setAttribute("placeholder", `${id2}${parentContainer.children.length+1}`);
 // if(values!="undefined"){ inputElement2.setAttribute("value", `${values.Value}`);}
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
