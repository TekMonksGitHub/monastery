/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { jsonview } from "./src/json-view.js";
import { APP_CONSTANTS } from "../../../../js/constants.mjs";


const COMPONENT_PATH = util.getModulePath(import.meta),VIEW_PATH=APP_CONSTANTS.CONF_PATH;

let model ;


async function elementRendered(element) {
  model = await $$.requireJSON(`${VIEW_PATH}/metadata.json`);
  const shadowRoot = apiinput_apioutput.getShadowRootByHostId(element.getAttribute("id"));

  let inputdata = JSON.parse(model.apis[0]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];
  let outputdata = JSON.parse(model.apis[0]["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"];

  const tree = jsonview.create(convertJsonFormat(inputdata, {}));
  jsonview.render(tree, shadowRoot.querySelector('.input-root'));
  jsonview.expand(tree);

  const tree2 = jsonview.create(convertJsonFormat(outputdata, {}));
  jsonview.render(tree2,shadowRoot.querySelector('.output-root'));
  jsonview.expand(tree2);
}

function bindApiInputOutputParameters(elementid){
  for (const api of model.apis) {
    if (api["apiname"] == elementid) {
      const shadowRoot = apiinput_apioutput.getShadowRootByHostId("treeview");
      shadowRoot.querySelector('.input-root').innerHTML="";
      shadowRoot.querySelector('.output-root').innerHTML=""
    let inputdata = JSON.parse(api["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];
    let outputdata = JSON.parse(api["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"];
    const tree = jsonview.create(convertJsonFormat(inputdata, {}));
    jsonview.render(tree, shadowRoot.querySelector('.input-root'));
    jsonview.expand(tree);
  
    const tree2 = jsonview.create(convertJsonFormat(outputdata, {}));
    jsonview.render(tree2,shadowRoot.querySelector('.output-root'));
    jsonview.expand(tree2);
    }
  }

}

function pushObjInArray (json){
  let res = {};
  for(let key in json){
    if(json[key].type !== "object" && json[key].type !== "array"){
      res[key] = json[key].type;
    } else if (json[key].type == "object") {
      res[key] = {};
      convertJsonFormat(json[key].properties, res[key]);
    } else if (json[key].type == "array") {
        if(json[key].items.type == "object") {
          res[key] = [];
          res[key].push(pushObjInArray(json[key].items.properties));
        } else {
          res[key] = [];
        }
    }
  }
  return res;
}

function convertJsonFormat(json, obj){
  for(let key in json){
    if(json[key].type !== "object" && json[key].type !== "array"){
      obj[key] = json[key].type;
    } else if (json[key].type == "object"){
      obj[key]={};
      convertJsonFormat(json[key].properties, obj[key]);
    } else if (json[key].type == "array") {
        if (json[key].items.type == "object") {
          obj[key] = [];
          obj[key].push(pushObjInArray(json[key].items.properties));
        } else {
          obj[key] = [];
        }
    }
  }
  return obj;
}


export const apiinput_apioutput = {
  trueWebComponentMode: false, elementRendered, convertJsonFormat, pushObjInArray,bindApiInputOutputParameters
}

monkshu_component.register(
  "apiinput-apioutput", `${COMPONENT_PATH}/apiinput-apioutput.html`, apiinput_apioutput
);