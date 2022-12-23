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

// "input-output": "{\n  \"requestBody\": {\n    \"content\": {\n      \"application/json\": {\n        \"schema\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"ORGZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Origin Pincode\"\n            },\n            \"DESTZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Destination Pincode\"\n            },\n            \"DATE\": {\n              \"type\": \"string\",\n              \"desc\": \"Date of Purchase\"\n            },\n            \"OPTIONS\": {\n              \"type\": \"string\",\n              \"desc\": \"Some Options\"\n            },\n            \"SHIPMENT\": {\n              \"type\": \"array\",\n              \"desc\": \"Shipment Info\",\n              \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                  \"PIECES\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total ordered pieces\"\n                  },\n                  \"CLASS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Class of shipment service\"\n                  },\n                  \"UOM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some UOM\"\n                  },\n                  \"QUANTITY\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total Quantity of product\"\n                  },\n                  \"WEIGHT\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Weight of order\"\n                  },\n                  \"FLAGS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some Country Flag\"\n                  }\n                }\n              }\n            }\n          },\n          \"required\": [\n            \"ORGZIP\",\n            \"DESTZIP\"\n          ]\n        }\n      }\n    }\n  },\n  \"responses\": {\n    \"200\": {\n      \"description\": \"response\",\n      \"content\": {\n        \"application/json\": {\n          \"schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"result\": {\n                \"type\": \"boolean\",\n                \"desc\": \"true / false\"\n              },\n              \"CUSTOMER\": {\n                \"type\": \"object\",\n                \"desc\": \"Customer Details\",\n                \"properties\": {\n                  \"NAME\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Name of the customer\"\n                  },\n                  \"ADDRESS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Address of the customer\"\n                  },\n                  \"QUOTENUM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Quotation number of the customer\"\n                  }\n                }\n              },\n              \"DESTINATION\": {\n                \"type\": \"object\",\n                \"desc\": \"Destination Details\",\n                \"properties\": {\n                  \"ORGZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Origin Pincode\"\n                  },\n                  \"ENDZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Delivery Pincode\"\n                  },\n                  \"CITYSTATE\": {\n                    \"type\": \"string\",\n                    \"desc\": \"City and State of the destination\"\n                  },\n                  \"FUELMSG\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Fuel message that spent on the delivery\"\n                  },\n                  \"FUELCHRG\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Fuel Charges\"\n                  },\n                  \"TOTALAMOUNT\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Amount Spent in the Shipment\"\n                  }\n                }\n              },\n              \"SHIPMENT\": {\n                \"type\": \"array\",\n                \"desc\": \"Shipment Details\",\n                \"items\": {\n                  \"type\": \"object\",\n                  \"properties\": {\n                    \"PIECES\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total number of pieces\"\n                    },\n                    \"CODE\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Code\"\n                    },\n                    \"CLASS\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Shipment Class\"\n                    },\n                    \"DESCRIPTION\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Shipment description\"\n                    },\n                    \"UOM\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some UOM\"\n                    },\n                    \"QUANTITY\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Quantity\"\n                    },\n                    \"WEIGHT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Weight\"\n                    },\n                    \"FLAGS\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Country Flag\"\n                    },\n                    \"RATE\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Rate per mile\"\n                    },\n                    \"AMOUNT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total cost of shipment\"\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}"

// let randomData = {
//   "openapi": "3.0.0",
//   "servers": [
//     {
//       "description": "SwaggerHub API Auto Mocking",
//       "url": "https://virtserver.swaggerhub.com/ANKITSAXENA_1/api1/1.0.0"
//     }
//   ],
//   "info": {
//     "version": "1.0.0",
//     "title": "home-iot-api",
//     "description": "The API for the EatBacon IOT project"
//   },
//   "paths": {
//     "/partners/requestQuote": {
//       "post": {
//         "tags": [
//           "partners"
//         ],
//         "description": "get quotation",
//         "requestBody": {
//           "content": {
//             "application/json": {
//               "schema": {
//                 "type": "object",
//                 "properties": {
//                   "ORGZIP": {
//                     "type": "integer"
//                   },
//                   "DESTZIP": {
//                     "type": "integer"
//                   },
//                   "DATE": {
//                     "type": "string"
//                   },
//                   "OPTIONS": {
//                     "type": "string"
//                   },
//                   "SHIPMENT": {
//                     "type": "array",
//                     "items": {
//                       "type": "object",
//                       "properties": {
//                         "PIECES": {
//                           "type": "string"
//                         },
//                         "CLASS": {
//                           "type": "string"
//                         },
//                         "UOM": {
//                           "type": "string"
//                         },
//                         "QUANTITY": {
//                           "type": "string"
//                         },
//                         "WEIGHT": {
//                           "type": "string"
//                         },
//                         "FLAGS": {
//                           "type": "string"
//                         }
//                       }
//                     }
//                   },
//                   "TAGS": {
//                     "type": "array",
//                     "items": {
//                       "type": "string"
//                     }
//                   }
//                 },
//                 "required": [
//                   "ORGZIP",
//                   "DESTZIP"
//                 ]
//               }
//             }
//           }
//         },
//         "responses": {
//           "200": {
//             "description": "response",
//             "content": {
//               "application/json": {
//                 "schema": {
//                   "type": "object",
//                   "properties": {
//                     "result": {
//                       "type": "boolean"
//                     },
//                     "id": {
//                       "type": "string",
//                       "example": "the user id is random@gmail.com"
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         },
//         "x-swagger-router-controller": "ZWave"
//       }
//     }
//   }
// }
let model = {
  "apis": [
    {
      "description": "Bill Of Lading",
      "nodeName": "api",
      "name": "Api1",
      "id": "167100034350183.1718773181056",
      "x": 210,
      "y": 50,
      "dependencies": [
        "167100035268611.011567976397195"
      ],
      "apiname": "Bill Of Lading",
      "apidescription": "Bill of lading is a POST request  and accepts JSON for request payload.",
      "exposedpath": "/tracking/bol",
      "method": "POST",
      "backendurl": "http://10.56.2.141:3800/bol",
      "method1": "POST",
      "injected": "[[\"Authorization\",\"Bearer << JWT >>\"]]",
      "passthrough": "[[\"k\"],[\"l\"]]",
      "yesorno": "YES",
      "contentinput": "appication/json",
      "input-output": "{\n  \"requestBody\": {\n    \"content\": {\n      \"application/json\": {\n        \"schema\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"BOL\": {\n              \"type\": \"integer\",\n              \"desc\": \"Bill of Lading\"\n            }\n          },\n          \"required\": [\n            \"BOL\"\n          ]\n        }\n      }\n    }\n  },\n  \"responses\": {\n    \"200\": {\n      \"description\": \"response\",\n      \"content\": {\n        \"application/json\": {\n          \"schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"result\": {\n                \"type\": \"boolean\"\n              },\n              \"PROBILL\": {\n                \"type\": \"integer\",\n                \"desc\": \"Product Bill Number\"\n              },\n              \"BILLDATE\": {\n                \"type\": \"integer\",\n                \"desc\": \"Date of Billing\"\n              },\n              \"BOL\": {\n                \"type\": \"integer\",\n                \"desc\": \"Bill of Lading\"\n              },\n              \"ORIGIN\": {\n                \"type\": \"string\",\n                \"desc\": \"Product origin\"\n              },\n              \"SERVICECENTER\": {\n                \"type\": \"string\",\n                \"desc\": \"Service center detail\"\n              },\n              \"SERVICECENTER_ARRIVAL_DATE\": {\n                \"type\": \"integer\",\n                \"desc\": \"Product arrival date in service center\"\n              },\n              \"SERVICECENTER_ARRIVAL_TIME\": {\n                \"type\": \"integer\",\n                \"desc\": \"Product arrival time in service center\"\n              },\n              \"PCS\": {\n                \"type\": \"integer\",\n                \"desc\": \"Total pieces of the product\"\n              },\n              \"WGT\": {\n                \"type\": \"integer\",\n                \"desc\": \"Product weight\"\n              },\n              \"STATUS\": {\n                \"type\": \"string\",\n                \"desc\": \"Status of the Bill\"\n              },\n              \"DELIVERBYDATE\": {\n                \"type\": \"integer\",\n                \"desc\": \"Deliver By date\"\n              },\n              \"DELIVERBYTIME\": {\n                \"type\": \"integer\",\n                \"desc\": \"Deliver By time\"\n              },\n              \"PODDATE\": {\n                \"type\": \"integer\",\n                \"desc\": \"Proof of Delivery Date\"\n              },\n              \"PODTIME\": {\n                \"type\": \"integer\",\n                \"desc\": \"Proof of delivery time\"\n              },\n              \"PODSIGNATURE\": {\n                \"type\": \"string\",\n                \"desc\": \"Proof of Delivery Signature\"\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}\n"

    },
    {
      "description": "Request Quote",
      "nodeName": "api",
      "name": "Api2",
      "id": "167100034590431.975116328701425",
      "x": 320,
      "y": 70,
      "dependencies": [
        "167100035650130.945507963243625"
      ],
      "apiname": "Request Quote",
      "apidescription": "Requesting the quotation",
      "exposedpath": "/partner/requestquote",
      "method": "POST",
      "backendurl": "http://10.56.2.141:3800/requestquote",
      "method1": "POST",
      "injected": "[[\"Authorization\",\"Bearer << JWT >>\"]]",
      "passthrough": "[[\"asdsa\"],[\"fas\"]]",
      "yesorno": "NO",
      "contentinput": "application/json",
      "input-output": "{\n  \"requestBody\": {\n    \"content\": {\n      \"application/json\": {\n        \"schema\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"ORGZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Origin Pincode\"\n            },\n            \"DESTZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Destination Pincode\"\n            },\n            \"DATE\": {\n              \"type\": \"string\",\n              \"desc\": \"Date of Purchase\"\n            },\n            \"OPTIONS\": {\n              \"type\": \"string\",\n              \"desc\": \"Some Options\"\n            },\n            \"SHIPMENT\": {\n              \"type\": \"array\",\n              \"desc\": \"Shipment Info\",\n              \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                  \"PIECES\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total ordered pieces\"\n                  },\n                  \"CLASS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Class of shipment service\"\n                  },\n                  \"UOM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some UOM\"\n                  },\n                  \"QUANTITY\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total Quantity of product\"\n                  },\n                  \"WEIGHT\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Weight of order\"\n                  },\n                  \"FLAGS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some Country Flag\"\n                  }\n                }\n              }\n            },\n            \"TAGS\": {\n              \"type\": \"array\",\n              \"desc\": \"some tags\",\n              \"items\": {\n                \"type\": \"string\"\n              }\n            }\n          },\n          \"required\": [\n            \"ORGZIP\",\n            \"DESTZIP\"\n          ]\n        }\n      }\n    }\n  },\n  \"responses\": {\n    \"200\": {\n      \"description\": \"response\",\n      \"content\": {\n        \"application/json\": {\n          \"schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"result\": {\n                \"type\": \"boolean\",\n                \"desc\": \"true / false\"\n              },\n              \"CUSTOMER\": {\n                \"type\": \"object\",\n                \"desc\": \"Customer Details\",\n                \"properties\": {\n                  \"NAME\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Name of the customer\"\n                  },\n                  \"ADDRESS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Address of the customer\"\n                  },\n                  \"QUOTENUM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Quotation number of the customer\"\n                  }\n                }\n              },\n              \"DESTINATION\": {\n                \"type\": \"object\",\n                \"desc\": \"Destination Details\",\n                \"properties\": {\n                  \"ORGZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Origin Pincode\"\n                  },\n                  \"ENDZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Delivery Pincode\"\n                  },\n                  \"CITYSTATE\": {\n                    \"type\": \"string\",\n                    \"desc\": \"City and State of the destination\"\n                  },\n                  \"FUELMSG\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Fuel message that spent on the delivery\"\n                  },\n                  \"FUELCHRG\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Fuel Charges\"\n                  },\n                  \"TOTALAMOUNT\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Amount Spent in the Shipment\"\n                  }\n                }\n              },\n              \"SHIPMENT\": {\n                \"type\": \"array\",\n                \"desc\": \"Shipment Details\",\n                \"items\": {\n                  \"type\": \"object\",\n                  \"properties\": {\n                    \"PIECES\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total number of pieces\"\n                    },\n                    \"CODE\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Code\"\n                    },\n                    \"CLASS\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Shipment Class\"\n                    },\n                    \"DESCRIPTION\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Shipment description\"\n                    },\n                    \"UOM\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some UOM\"\n                    },\n                    \"QUANTITY\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Quantity\"\n                    },\n                    \"WEIGHT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Weight\"\n                    },\n                    \"FLAGS\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Country Flag\"\n                    },\n                    \"RATE\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Rate per mile\"\n                    },\n                    \"AMOUNT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total cost of shipment\"\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}"

    }
  ],
  "policies": [
    {
      "description": "Policy_tag1",
      "nodeName": "policy_tag",
      "name": "Policy_tag1",
      "id": "167100035268611.011567976397195",
      "x": 200,
      "y": 250,
      "apikey": "jfiouf90iejw9ri32fewji910idj2fkvjdskljkeqjf",
      "yesorno": "NO",
      "userid": "a",
      "password": "d",
      "yesorno1": "YES",
      "jwtsubject": "sad",
      "yesorno2": "YES",
      "persec": "as",
      "permin": "1",
      "perhour": "sa",
      "perday": "dsa",
      "permonth": "das",
      "peryear": "asd"
    },
    {
      "description": "Policy_tag2",
      "nodeName": "policy_tag",
      "name": "Policy_tag2",
      "id": "167100035650130.945507963243625",
      "x": 410,
      "y": 250,
      "apikey": "fheiwu98237hjief8923ydewjidw834284hwqdnejwr79389",
      "yesorno": "",
      "userid": "asd",
      "password": "das",
      "yesorno1": "",
      "jwtsubject": "asd",
      "yesorno2": "YES",
      "persec": "dsa",
      "permin": "dsa",
      "perhour": "dsa",
      "perday": "dsadas",
      "permonth": "das",
      "peryear": "asfa"
    }
  ]
}

let target = JSON.parse(model.apis[1]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];

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
  const data = findAllByKey(target, id);
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

// function getArrayParams(element, arrayObj){
//   if(element.firstChild.querySelector(":scope>input")){
//     arrayObj[element.firstChild.querySelector(":scope>label").innerText] = [element.firstChild.querySelector(":scope>input").value];
//   }
//   // return arrayObj;
// }

function getParaVal(element, obj){
  if(element.firstChild.querySelector(":scope>input")){
    // console.log(element.firstChild.querySelector(":scope>label").innerText,element.firstChild.querySelector(":scope>input").value);
    obj[element.firstChild.querySelector(":scope>label").innerText] = element.firstChild.querySelector(":scope>input").value;
  }
  else if(element.firstChild.value){
    // console.log(element.firstChild.value);
  }
  else {
    let child = element.children;
    let target = child[0].querySelector("label").innerText;
    console.log(child[0]);
    console.log(child[0].querySelector("label").innerText)
    let type = child[0].querySelector("button").innerText;
    // if(child[0].id.includes("array")){
      obj[`${target}`] = [];
    // }
    let newChild = Array.from(child);
    newChild.shift();
    if(newChild.length && type == "object"){
    newChild.forEach((each)=>{
      let arrayParams = {};
      each.querySelectorAll(":scope>div").forEach((para)=>{
        if(para.firstChild.querySelector(":scope>input")){
          arrayParams[para.firstChild.querySelector(":scope>label").innerText] = para.firstChild.querySelector(":scope>input").value;
        }
      })
      obj[`${target}`].push(arrayParams);
    })
  }
  else if (newChild.length && type!=="object"){
    newChild.forEach((each)=>{
      each.querySelectorAll(":scope>div").forEach((para)=>{
        if(para.firstChild.value){
          obj[`${target}`].push(para.firstChild.value);
        }
      })
    })
  }
}
// return obj;
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
  console.log(reqBody)
  // let name = shadowRoot.querySelector("#MyORGZIP").value;
  // let reqBody = {
  //   "name": `${name}`
  // }
  let path = model.apis[1].exposedpath;
  // for(let key in randomData.paths){
  //   path = key;
  //   break;
  // }
  console.log(`http://localhost:9090${path}`)
  if(Object.keys(reqBody).length){
    let resp = await apiman.rest(`http://localhost:9090${path}`, "POST", reqBody);
    text_editor.getJsonData(resp);
  }
};

export const api_details = {
    trueWebComponentMode: true,elementConnected,elementRendered, addMoreParameters, toggle, deleteParameters, _serachParamInSchema, tryIt, getParaVal
}

monkshu_component.register(
    "api-details", `${COMPONENT_PATH}/api-details.html`, api_details
);