/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import { util } from "/framework/js/util.mjs";
 import { monkshu_component } from "/framework/js/monkshu_component.mjs";
 import { text_editor } from "../text-editor/text-editor.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
 
 const COMPONENT_PATH = util.getModulePath(import.meta);

 const elementConnected = async (element) => {
    const data = {componentPath: COMPONENT_PATH, styleBody:element.getAttribute("styleBody")?
    `<style>${element.getAttribute("styleBody")}</style>`:undefined};
    console.log(element);
    api_details.setData(element.id, data);
 }

 async function elementRendered(element) {
      const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
      fetchBaseParameters(element);
    }

function toggle(element, event){
  if(event.target.classList == "label"){
    element.classList.toggle("active");
  }
}

let randomData = {
  "openapi": "3.0.0",
  "servers": [
    {
      "description": "SwaggerHub API Auto Mocking",
      "url": "https://virtserver.swaggerhub.com/ANKITSAXENA_1/api1/1.0.0"
    }
  ],
  "info": {
    "version": "1.0.0",
    "title": "home-iot-api",
    "description": "The API for the EatBacon IOT project"
  },
  "paths": {
    "/partners/requestQuote": {
      "post": {
        "tags": [
          "partners"
        ],
        "description": "get quotation",
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "ORGZIP": {
                    "type": "integer"
                  },
                  "DESTZIP": {
                    "type": "integer"
                  },
                  "DATE": {
                    "type": "string"
                  },
                  "OPTIONS": {
                    "type": "string"
                  },
                  "SHIPMENT": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "PIECES": {
                          "type": "string"
                        },
                        "CLASS": {
                          "type": "string"
                        },
                        "UOM": {
                          "type": "string"
                        },
                        "QUANTITY": {
                          "type": "string"
                        },
                        "WEIGHT": {
                          "type": "string"
                        },
                        "FLAGS": {
                          "type": "string"
                        }
                      }
                    }
                  },
                  "TAGS": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "required": [
                  "ORGZIP",
                  "DESTZIP"
                ]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "boolean"
                    },
                    "id": {
                      "type": "string",
                      "example": "the user id is random@gmail.com"
                    }
                  }
                }
              }
            }
          }
        },
        "x-swagger-router-controller": "ZWave"
      }
    }
  }
}

let target = randomData["paths"]["/partners/requestQuote"]["post"]["requestBody"]["content"]["application/json"]["schema"]["properties"];

function fetchBaseParameters(element){
  const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
  const content = shadowRoot.querySelectorAll('.content');

  for(let key in target){
    console.log(key);
    console.log(target[key].type)
    let child = document.createElement('div');
    child.innerHTML = `<div class="input-fields" style="padding-right: 10px" id=${target[key].type}>
    <label for="My${target[key].type}" id="my${key}" style="text-align: center; color: #444444;
   margin-left: 1.2em; ">${key}</label>
   <sub class="dataType">${target[key].type}</sub>
    ${target[key].type == "array" || target[key].type == "object" ? `<button class=${target[key].items.type} id=${key} style="margin: 0px 5px" value=${JSON.stringify(target[key])} onclick='monkshu_env.components["api-details"].addMoreParameters(this, event)'>${target[key].items.type}</button>` : `<input type="text" style="margin: 0px 5px" id="My${key}" class="input-text" /></div>`}`
    content[content.length-1].appendChild(child);
  }
}

function findAllByKey(obj, keyToFind) {
  return Object.entries(obj)
    .reduce((acc, [key, value]) => (key === keyToFind)
      ? acc.concat(value)
      : (typeof value === 'object')
      ? acc.concat(findAllByKey(value, keyToFind))
      : acc
    , [])
}

function _serachParamInSchema(id){
  const data = findAllByKey(randomData, id);
  return data[0];
}

function addMoreParameters(element, event){
  if(event.composedPath()[0].classList == 'string'){
    let stringWrapper = document.createElement("div");
    stringWrapper.classList.add("wrapper-div");
    stringWrapper.style.paddingBottom="0px";
    let inputContainer = document.createElement("div");
    inputContainer.classList.add("input-wrapper");
    inputContainer.innerHTML = `<input class="input-text" style="padding:3px;" type="text" placeholder="string"/> <img class="deleteBtn" onclick='monkshu_env.components["api-details"].deleteParameters(this, event)' src=${COMPONENT_PATH}/img/delete.svg/>`
    stringWrapper.appendChild(inputContainer);
    event.composedPath()[2].appendChild(stringWrapper);
  }
  else if(event.composedPath()[0].classList == "object"){
    let newData = _serachParamInSchema(event.composedPath()[0].id).items.properties;
    console.log('youre inside object');
    console.log(newData);
    let wrapperDiv = document.createElement('div');
    wrapperDiv.classList.add("wrapper-div");
    let objectDiv = document.createElement("div");
    // objectDiv.style.borderBottom = "0.5px solid black";
    objectDiv.innerHTML = `<div class="array-object" style="padding-right: 15px">
    <label for="Object" style="text-align: center; color: #444444;
   margin-left: 1.2em;">Object</label>
   <img class="deleteBtn" src="${COMPONENT_PATH}/img/delete.svg" onclick='monkshu_env.components["api-details"].deleteParameters(this, event)'/>
   </div>`
    wrapperDiv.appendChild(objectDiv);
    for(let key in newData){
      console.log(key);
      console.log(newData[key].type)
      let child = document.createElement('div');
      child.innerHTML = `<div class="input-fields" style="padding-right: 10px" id=${newData[key].type}>
      <label for="My${newData[key].type}" style="text-align: center; color: #444444;
     margin-left: 1.2em; ">${key}</label>
     <sub class="dataType">${newData[key].type}</sub>
      ${newData[key].type == "array" || newData[key].type == "object" ? `<button class=${newData[key].items.type} id=${key} style="margin: 0px 5px" value=${JSON.stringify(newData[key])} onclick='monkshu_env.components["api-details"].addMoreParameters(this, event)'>${newData[key].items.type}</button>` : `<input type="text" style="margin: 0px 5px" id="My${newData[key].type}" class="input-text" /></div>`}`
      wrapperDiv.appendChild(child);
    }
    event.composedPath()[2].appendChild(wrapperDiv);
  }
}

function deleteParameters(element, event){
 console.log(event);
 console.log(element)
 if(event.composedPath()[1].classList == "array-object"){
  event.composedPath()[3].remove();
 }
 else if(event.composedPath()[1].classList == "input-wrapper"){
  event.composedPath()[2].remove();
 }
}

function getParaVal(element, obj){
  if(element.firstChild.querySelector(":scope>input")){
    // console.log(element.firstChild.querySelector(":scope>label").innerText,element.firstChild.querySelector(":scope>input").value);
    obj[element.firstChild.querySelector(":scope>label").innerText] = [element.firstChild.querySelector(":scope>input").value];
  }
  else if(element.firstChild.value){
    // console.log(element.firstChild.value);
  }
  else {
    let child = element.children;
    if(child[0].id.includes("array")){
      obj[child[0].firstChild.id.replace("my",'')] = [];
    }
    let newChild = Array.from(child);
    newChild.shift();
    if(newChild.length){
    newChild.forEach((each)=>{
      each.querySelectorAll(":scope>div").forEach((para)=>{
        getParaVal(para, obj);
      })
    })
  }
}
}

async function tryIt(element, event){
  let thisElement = api_details.getHostElementByID("apidetails");
  const shadowRoot = api_details.getShadowRootByHost(thisElement);
  let node = shadowRoot.querySelectorAll(".content");
  let targetNode = node[node.length-1];
  let reqBody={}
  targetNode.querySelectorAll(":scope>div").forEach((para)=>{
    getParaVal(para, reqBody);
  })
  let name = shadowRoot.querySelector("#MyORGZIP").value;
  // let reqBody = {
  //   "name": `${name}`
  // }
  let path;
  for(let key in randomData.paths){
    path = key;
    break;
  }
  console.log(`http://localhost:9090${path}`)
  let resp = await apiman.rest(`http://localhost:9090${path}`, "POST", reqBody);
  text_editor.getJsonData(resp);
};

export const api_details = {
    trueWebComponentMode: true,elementConnected,elementRendered, addMoreParameters, toggle, deleteParameters, _serachParamInSchema, tryIt, getParaVal
}

monkshu_component.register(
    "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);