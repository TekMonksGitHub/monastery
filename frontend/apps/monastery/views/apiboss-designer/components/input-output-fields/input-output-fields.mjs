/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { jsonview } from "./src/json-view.js";
let inputdata = {
}

const COMPONENT_PATH = util.getModulePath(import.meta);



const elementConnected = async function (element) {
  const data = {
    componentPath: COMPONENT_PATH
  };
   input_output_fields.setData(element.id,data);

}

const elementRendered = async function (element) {
 
  const shadowRoot = input_output_fields.getShadowRootByHost(element);

  
  const outputdata = {
   

  }
  const tree = jsonview.create(inputdata);
  jsonview.render(tree, shadowRoot.querySelector('div.input-root'));
  jsonview.expand(tree);


  const tree2 = jsonview.create(outputdata);
  jsonview.render(tree2, shadowRoot.querySelector('div.output-root'));
  jsonview.expand(tree2);
  // const shadowRoot1 = input_output_fields.getShadowRootByContainedElement(e);
  const container =  shadowRoot.querySelector('div.input-root');


  // const createJsonContainer = document.createElement('div');
  // createJsonContainer.cla
  // const line = shadowRoot.querySelector('div.line')
console.log(shadowRoot);
console.log(container);
container.innerHTML=`
<div class = "json-container">
<div class="line">
  <div class="empty-icon"></div>
  <div class="json-key">object</div>
  <div class="json-size" >{0}</div>
  <img src=${COMPONENT_PATH}/img/add.svg
                        onclick="monkshu_env.components['input-output-fields'].addChild(this)">
</div>
</div>
`;
shadowRoot.querySelector('div.input-root').appendChild(container);

}



function addChild(e) {
  console.log(e.parentElement);
  console.log(e.parentElement.querySelector('div.json-key').textContent);
  inputdata["object"]={"name":"string"};

  const shadowRoot = input_output_fields.getShadowRootByContainedElement(e);
  const container =  shadowRoot.querySelector('div.input-root');
  container.innerHTML='';
  const tree = jsonview.create(inputdata);
  jsonview.render(tree, shadowRoot.querySelector('div.input-root'));
  jsonview.expand(tree);

//   // const createJsonContainer = document.createElement('div');
//   // createJsonContainer.cla
//   // const line = shadowRoot.querySelector('div.line')
// console.log(e);
// console.log(shadowRoot);
// console.log(container);
// container.innerHTML=line.innerHTML+`
// <div class = "json-container">
// <div class="line">
//   <div class="empty-icon"></div>
//   <div class="json-key"><input type="text" id="MyInput" class="input-text"></div>
//   <div class="json-size" >{0}</div>
// </div>
// </div>
// `;
// shadowRoot.querySelector('div.input-root').appendChild(container);



}
// function addChild1(e) {
//   console.log(e);
//   // const shadowRoot = input_output_fields.getShadowRootByHost(host);
//   // const tree = shadowRoot.querySelector('div#input-tree');
//   // console.log(tree);
//   // const tree = document.getElementById('tree');
//   // tree.addEventListener('click', (e) => {

//   let child = document.createElement('ul');
//   child.innerHTML = `<li><span>Key : Value</span><i class="fa fa-plus-square addChild" aria-hidden="true"></i><i class="fa fa-trash deleteChild" aria-hidden="true"></i></li>`
//   e.append(child)


//   // })
// }

export const input_output_fields = {
  trueWebComponentMode: true, elementRendered,elementConnected,addChild
}

monkshu_component.register(
  "input-output-fields", `${COMPONENT_PATH}/input-output-fields.html`, input_output_fields
);