/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { text_editor } from "../text-editor/text-editor.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { APP_CONSTANTS } from "../../../../js/constants.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta),VIEW_PATH=APP_CONSTANTS.MODEL_JSON;

let model,target;

const elementConnected = async (element) => {
  model = await $$.requireJSON(VIEW_PATH);
  target = JSON.parse(model.apis[0]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];
  const data = {
    componentPath: COMPONENT_PATH, styleBody: element.getAttribute("styleBody") ?
      `<style>${element.getAttribute("styleBody")}</style>` : undefined, method: model.apis[0]["method"], exposedpath: model.apis[0]["exposedpath"]
  };
  api_details.setData(element.id, data);
}

async function elementRendered(element) {
  fetchBaseParameters(element, target);
}

function updateExposedpathandMethod(elementid) {
  const data = {};
  for (const api of model.apis) {
    if (api["apiname"] == elementid) {
      target = JSON.parse(api["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];
      data["method"] = api["method"],
        data["exposedpath"] = api["exposedpath"]
        fetchBaseParameters(api_details.getHostElementByID("apidetails"), target)
    }

  }
  const element = api_details.getHostElementByID("apidetails")
  api_details.bindData(data, element.id);
}

function toggle(element, event) {
  if (event.target.classList == "label") {
    element.classList.toggle("active");
  }
}


function fetchBaseParameters(element, target) {
  const shadowRoot = api_details.getShadowRootByHostId(element.getAttribute("id"));
  const content = shadowRoot.querySelector('#content');
  content.innerHTML ='';

  for (let key in target) {
    let child = document.createElement('div');
    child.innerHTML = `<div class="input-fields" style="padding-right: 10px" id=${target[key].type}>
    <label for="My${target[key].type}" id="my${key}" style="text-align: center; color: #444444;
   margin-left: 1.2em; ">${key}</label>
   <sub class="dataType">${target[key].type}</sub>
    ${target[key].type == "array" || target[key].type == "object" ?` <image-button img="./img/add.svg" text=${target[key].items.type} style=" width:6em; height: 100%; margin :0px 10px;"
    class=${target[key].items.type } id=${key} type="row" value=${JSON.stringify(target[key])}
    styleBody="div#button.row {flex-direction: row; justify-content: flex-start;} div#button {padding: 3px 10px;} div#button>img.row {width: 1.5em;height: 100%;} div#button>span {color: #000000; font-weight: 700; margin-left:5px}"
    color="#444444" border="0.5px solid #98CCFD" background-color="#DFF0FE" active-background-color="white" margin = "0px 10px"
    display="inline-block;" onclick='monkshu_env.components["api-details"].addMoreParameters(this, event)'></image-button>` : `<input type="text" style="margin: 0px 5px" id="My${key}" class="input-text" /></div>`}`
    content.appendChild(child);
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

function _serachParamInSchema(id) {
  const data = findAllByKey(target, id);
  return data[0];
}

function addMoreParameters(element, event) {
  if (event.composedPath()[5].classList == 'string') {
    let stringWrapper = document.createElement("div");
    stringWrapper.classList.add("wrapper-div");
    stringWrapper.style.paddingBottom = "0px";
    let inputContainer = document.createElement("div");
    inputContainer.classList.add("input-wrapper");
    inputContainer.innerHTML = `<input class="input-text" style="padding:3px;" type="text" placeholder="string"/> <img class="deleteBtn" onclick='monkshu_env.components["api-details"].deleteParameters(this, event)' src=${COMPONENT_PATH}/img/delete.svg/>`
    stringWrapper.appendChild(inputContainer);
    event.composedPath()[7].appendChild(stringWrapper);
  }
  else if (event.composedPath()[5].classList == "object") {
    let newData = _serachParamInSchema(event.composedPath()[5].id).items.properties;
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
    for (let key in newData) {
      let child = document.createElement('div');
      child.innerHTML = `<div class="input-fields" style="padding-right: 10px" id=${newData[key].type}>
      <label for="My${newData[key].type}" style="text-align: center; color: #444444;
     margin-left: 1.2em; ">${key}</label>
     <sub class="dataType">${newData[key].type}</sub>
      ${newData[key].type == "array" || newData[key].type == "object" ? `
      <image-button img="./img/add.svg" text=${newData[key].items.type} style=" width:6em; height: 100%; margin :0px 10px;"
      class=${newData[key].items.type} id=${key} type="row" value=${JSON.stringify(newData[key])}
      styleBody="div#button.row {flex-direction: row; justify-content: flex-start;} div#button {padding: 3px 10px;} div#button>img.row {width: 1.5em;height: 100%;} div#button>span {color: #000000; font-weight: 700; margin-left:5px}"
      color="#444444" border="0.5px solid #98CCFD" background-color="#DFF0FE; active-background-color="white"  margin = "0px 10px"
      display="inline-block;" onclick='monkshu_env.components["api-details"].addMoreParameters(this, event)'></image-button>` : `<input type="text" style="margin: 0px 5px" id="My${newData[key].type}" class="input-text" /></div>`}`
      wrapperDiv.appendChild(child);
    }
    event.composedPath()[7].appendChild(wrapperDiv);
  }
}



function deleteParameters(element, event) {
  if (event.composedPath()[1].classList == "array-object") {
    event.composedPath()[3].remove();
  }
  else if (event.composedPath()[1].classList == "input-wrapper") {
    event.composedPath()[2].remove();
  }
}

function getParaVal(element, obj) {
  if (element.firstChild.querySelector(":scope>input")) {
    obj[element.firstChild.querySelector(":scope>label").innerText] = element.firstChild.querySelector(":scope>input").value;
  }
  else {
    let child = element.children;
    let target = child[0].querySelector("label").innerText;
    let type = child[0].querySelector("image-button").getAttribute("text");
    // if(child[0].id.includes("array")){
    obj[`${target}`] = [];
    // }
    let newChild = Array.from(child);
    newChild.shift();
    if (newChild.length && type == "object") {
      newChild.forEach((each) => {
        let arrayParams = {};
        each.querySelectorAll(":scope>div").forEach((para) => {
          if (para.firstChild.querySelector(":scope>input")) {
            arrayParams[para.firstChild.querySelector(":scope>label").innerText] = para.firstChild.querySelector(":scope>input").value;
          }
        })
        obj[`${target}`].push(arrayParams);
      })
    }
    else if (newChild.length && type !== "object") {
      newChild.forEach((each) => {
        each.querySelectorAll(":scope>div").forEach((para) => {
          if (para.firstChild.value) {
            obj[`${target}`].push(para.firstChild.value);
          }
        })
      })
    }
  }
}

async function tryIt(element, event) {
  let thisElement = api_details.getHostElementByID("apidetails");
  const shadowRoot = api_details.getShadowRootByHost(thisElement);
  let node = shadowRoot.querySelector("#content");
  let targetNode = node;
  let reqBody = {}
  targetNode.querySelectorAll(":scope>div").forEach((para) => {
    getParaVal(para, reqBody);
  })
  let path = shadowRoot.querySelector("span#path").innerText;
  if (Object.keys(reqBody).length) {
    let resp = await apiman.rest(`http://localhost:9090${path}`, "POST", reqBody);
    text_editor.getJsonData(resp);
  }
};

export const api_details = {
  trueWebComponentMode: true, elementConnected, elementRendered, addMoreParameters, toggle, deleteParameters, _serachParamInSchema, tryIt, getParaVal, updateExposedpathandMethod
}

monkshu_component.register(
  "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);