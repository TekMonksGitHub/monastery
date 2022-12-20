/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

 const elementConnected = async (element) => {
    const data = {componentPath: COMPONENT_PATH, styleBody:element.getAttribute("styleBody")?
    `<style>${element.getAttribute("styleBody")}</style>`:undefined};
    console.log(element);
    api_details.setData(element.id, data);
 }

 async function elementRendered(element) {
   /* const host =api_details .getHostElement(element);
    const accordion = api_details.getShadowRootByHost(host).querySelector('container-header');
    for (let i=0; i<accordion.length; i++) {
        accordion[i].addEventListener('click', function () {
          this.classList.toggle('active')
        })
      }*/

      const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
      console.log(shadowRoot);
      // const accordion = shadowRoot.querySelectorAll("div.container-header");
      // for (let i=0; i<accordion.length; i++) {
      //   accordion[i].addEventListener('click', function (e) {
      //     console.log(e);
      //     if(accordion[i].classList[0] == "container-header"){
      //       accordion[i].classList.toggle('active')
      //     }
      //   })
      //  }
       fetchApiVal(element);
    }

function toggle(element, event){
  console.log(element);
  console.log(event.target);

  if(event.target.classList == "label"){
    element.classList.toggle("active");
  }
}

let randomData = {
  "orgzip":{
    "type": "string"
  },
  "destzip":{
    "type": "string"
  },
  "date":{
    "type": "string"
  },
  "options":{
    "type": "string"
  },
  "shipment":{
    "type":"arrayofobject",
    "orgzip":{
      "type": "string"
    },
    "destzip":{
      "type": "string"
    },
    "date":{
      "type": "string"
    },
    "options":{
      "type": "string"
    },
    "shipment":{
      "type":"arrayofobject",
      "orgzip":{
        "type": "string"
      },
      "destzip":{
        "type": "string"
      },
      "date":{
        "type": "string"
      },
      "options":{
        "type": "string"
      }
    }
  },
  "tags":{
    "type": "arrayofstring",
  },
  "name":{
    "type": "arrayofstring",
  }
}

function fetchApiVal(element){
  const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
  const content = shadowRoot.querySelectorAll('.content');
console.log(shadowRoot)
console.log(content)

  for(let key in randomData){
    console.log(key);
    console.log(randomData[key].type)
    let child = document.createElement('div');
    child.id = randomData[key].type;
    child.classList.add('input-fields');
    child.innerHTML = `
    <label for="My${randomData[key].type}" style="text-align: center; color: #444444;
   margin-left: 1.2em; ">${key}</label>
   <sub class="dataType">${randomData[key].type}</sub>
    ${!randomData[key].type.includes("array") || !randomData[key].type.includes("array") ? `<input type="text" id="My${randomData[key].type}" class="input-text" />` : `<button class=${randomData[key].type} id=${key} value=${JSON.stringify(randomData[key])} onclick='monkshu_env.components["api-details"].addChild(this, event)'>${randomData[key].type.includes("array") ? randomData[key].type.replace("arrayof", "") : randomData[key].type}</button>`}`
    content[content.length-1].appendChild(child);
  }
}

function addChild(element, event){
  console.log('triggered')
  console.log(event);
  console.log(event.composedPath()[0]);
  console.log(event.composedPath()[0].classList);
  console.log(element);
  if(event.composedPath()[0].classList == 'arrayofstring'){
    let inputContainer = document.createElement("div");
    inputContainer.innerHTML = `<input type="text"/> <img onclick='monkshu_env.components["api-details"].deleteChild(this, event)' src=${COMPONENT_PATH}/img/delete.svg/>`
    event.composedPath()[1].appendChild(inputContainer);
  }
  else if(event.composedPath()[0].classList == "arrayofobject"){
    console.log('youre inside object');
    console.log(event.composedPath()[0].id);
    console.log(event.path[0].value)
    // let newData = randomData[event.composedPath()[0].id]
    let newData = JSON.parse(event.composedPath()[0].value);
    delete newData.type;
    console.log(newData);
    for(let key in newData){
      // if(key == 'type') continue;
      let child = document.createElement('div');
    child.id = newData[key].type;
    child.classList.add('input-fields');
    child.innerHTML = `
    <label for="My${newData[key].type}" style="text-align: center; color: #444444;
   margin-left: 1.2em; ">${key}</label>
   <sub class="dataType">${newData[key].type}</sub>
    ${!newData[key].type.includes("array") || !newData[key].type.includes("array") ? `<input type="text" id="My${newData[key].type}" class="input-text" />` : `<button class=${newData[key].type} id=${key} onclick='monkshu_env.components["api-details"].addChild(this, event)'>${newData[key].type.includes("array") ? newData[key].type.replace("arrayof", "") : newData[key].type}</button>`}`
    event.composedPath()[1].appendChild(child);
    }
  }
}

function deleteChild(element, event){
 console.log(event);
 console.log(element)
 event.composedPath()[1].remove();
}

export const api_details = {
    trueWebComponentMode: true,elementConnected,elementRendered, addChild, toggle, deleteChild
}

monkshu_component.register(
    "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);