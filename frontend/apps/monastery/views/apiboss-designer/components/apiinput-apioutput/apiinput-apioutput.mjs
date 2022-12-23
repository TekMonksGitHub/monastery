/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { jsonview } from "./src/json-view.js";

const COMPONENT_PATH = util.getModulePath(import.meta);

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
      "input-output": "{\n  \"requestBody\": {\n    \"content\": {\n      \"application/json\": {\n        \"schema\": {\n          \"type\": \"object\",\n          \"properties\": {\n            \"ORGZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Origin Pincode\"\n            },\n            \"DESTZIP\": {\n              \"type\": \"integer\",\n              \"desc\": \"Destination Pincode\"\n            },\n            \"DATE\": {\n              \"type\": \"string\",\n              \"desc\": \"Date of Purchase\"\n            },\n            \"OPTIONS\": {\n              \"type\": \"string\",\n              \"desc\": \"Some Options\"\n            },\n            \"SHIPMENT\": {\n              \"type\": \"array\",\n              \"desc\": \"Shipment Info\",\n              \"items\": {\n                \"type\": \"object\",\n                \"properties\": {\n                  \"PIECES\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total ordered pieces\"\n                  },\n                  \"CLASS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Class of shipment service\"\n                  },\n                  \"UOM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some UOM\"\n                  },\n                  \"QUANTITY\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Total Quantity of product\"\n                  },\n                  \"WEIGHT\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Weight of order\"\n                  },\n                  \"FLAGS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Some Country Flag\"\n                  }\n                }\n              }\n            }\n          },\n          \"required\": [\n            \"ORGZIP\",\n            \"DESTZIP\"\n          ]\n        }\n      }\n    }\n  },\n  \"responses\": {\n    \"200\": {\n      \"description\": \"response\",\n      \"content\": {\n        \"application/json\": {\n          \"schema\": {\n            \"type\": \"object\",\n            \"properties\": {\n              \"result\": {\n                \"type\": \"boolean\",\n                \"desc\": \"true / false\"\n              },\n              \"CUSTOMER\": {\n                \"type\": \"object\",\n                \"desc\": \"Customer Details\",\n                \"properties\": {\n                  \"NAME\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Name of the customer\"\n                  },\n                  \"ADDRESS\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Address of the customer\"\n                  },\n                  \"QUOTENUM\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Quotation number of the customer\"\n                  }\n                }\n              },\n              \"DESTINATION\": {\n                \"type\": \"object\",\n                \"desc\": \"Destination Details\",\n                \"properties\": {\n                  \"ORGZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Origin Pincode\"\n                  },\n                  \"ENDZIP\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Delivery Pincode\"\n                  },\n                  \"CITYSTATE\": {\n                    \"type\": \"string\",\n                    \"desc\": \"City and State of the destination\"\n                  },\n                  \"FUELMSG\": {\n                    \"type\": \"string\",\n                    \"desc\": \"Fuel message that spent on the delivery\"\n                  },\n                  \"FUELCHRG\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Fuel Charges\"\n                  },\n                  \"TOTALAMOUNT\": {\n                    \"type\": \"integer\",\n                    \"desc\": \"Total Amount Spent in the Shipment\"\n                  }\n                }\n              },\n              \"SHIPMENT\": {\n                \"type\": \"array\",\n                \"desc\": \"Shipment Details\",\n                \"items\": {\n                  \"type\": \"object\",\n                  \"properties\": {\n                    \"PIECES\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total number of pieces\"\n                    },\n                    \"CODE\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Code\"\n                    },\n                    \"CLASS\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Shipment Class\"\n                    },\n                    \"DESCRIPTION\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Shipment description\"\n                    },\n                    \"UOM\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some UOM\"\n                    },\n                    \"QUANTITY\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Quantity\"\n                    },\n                    \"WEIGHT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total Weight\"\n                    },\n                    \"FLAGS\": {\n                      \"type\": \"string\",\n                      \"desc\": \"Some Country Flag\"\n                    },\n                    \"RATE\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Rate per mile\"\n                    },\n                    \"AMOUNT\": {\n                      \"type\": \"integer\",\n                      \"desc\": \"Total cost of shipment\"\n                    }\n                  }\n                }\n              }\n            }\n          }\n        }\n      }\n    }\n  }\n}"

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


async function elementRendered(element) {

  const shadowRoot = apiinput_apioutput.getShadowRootByHostId(element.getAttribute("id"));
  console.log(shadowRoot);
  // const inputdata = {
  //   "givenName": "Vas",
  //   "surName": "Sudanagunta",
  //   "children": [
  //     {
  //       "givenName": "Natalia",
  //       "age": 5
  //     },
  //     {
  //       "givenName": "Aida",
  //       "age": 17
  //     }
  //   ],
  //   "address": {
  //     "state": "NY",
  //     "city": "Brooklyn",
  //     "street": "718 Marcus Garvey Ave"
  //   }
  // }
  // const outputdata= {
  //   "name": "String",
  //   "age": "Integer",
  //   "location": {
  //     "city": "String",
  //     "state": "String",
  //     "pin": "Integer",
  //     "order": [
  //       {
  //         "item": "String",
  //         "code": "Integer"
  //       }
  //     ]
  //   }
   
  // }

  let inputdata = JSON.parse(model.apis[1]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"];
  let outputdata = JSON.parse(model.apis[1]["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"];

  console.log(convertJsonFormat(inputdata, {}))

  const tree = jsonview.create(convertJsonFormat(inputdata, {}));
  jsonview.render(tree, shadowRoot.querySelector('.input-root'));
  jsonview.expand(tree);

  const tree2 = jsonview.create(convertJsonFormat(outputdata, {}));
  jsonview.render(tree2,shadowRoot.querySelector('.output-root'));
  jsonview.expand(tree2);

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
  trueWebComponentMode: false, elementRendered, convertJsonFormat, pushObjInArray
}

monkshu_component.register(
  "apiinput-apioutput", `${COMPONENT_PATH}/apiinput-apioutput.html`, apiinput_apioutput
);