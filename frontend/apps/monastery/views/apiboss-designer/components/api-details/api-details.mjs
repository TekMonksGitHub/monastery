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
      const accordion = shadowRoot.querySelectorAll("div.container-header");
      for (let i=0; i<accordion.length; i++) {
        accordion[i].addEventListener('click', function () {
          this.classList.toggle('active')
        })
       }
       fetchApiVal(element);
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
    "type":"arrayofobjects",
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
      "type":"arrayofobjects",
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
    "type": "arrayofstrings",
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
    ${!randomData[key].type.includes("array") || !randomData[key].type.includes("array") ? `<input type="text" id="My${randomData[key].type}" class="input-text" />` : `<button onclick="monkshu_env.components["api-details"].addChild(event, this)">${randomData[key].type.includes("array") ? randomData[key].type.replace("arrayof", "") : randomData[key].type}</button>`}`
    content[content.length-1].appendChild(child);
  }
}

function addChild(event, element){
  console.log(event);
  console.log(element);
}

export const api_details = {
    trueWebComponentMode: true,elementConnected,elementRendered
}

monkshu_component.register(
    "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);