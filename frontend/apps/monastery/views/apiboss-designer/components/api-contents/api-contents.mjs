/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";

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


const elementConnected = async (element) => {

  let inputParams = [], outputParams = [];
  traverseObject(JSON.parse(model.apis[0]["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) {
    if (node && typeof node == "object") if (node.type) {
      inputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": inputParams.length + 1 });
    }
  });
  traverseObject(JSON.parse(model.apis[0]["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) {
    if (node && typeof node == "object") if (node.type) {
      outputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": outputParams.length + 1 });
    }
  });
  let IdsOfPolicies = model.apis[0].dependencies, apikeys = [], jwtText, securityData = [];
  for (const policy of model.policies) {
    IdsOfPolicies.forEach(id => {
      if (policy.id == id) {
        apikeys.push(policy["apikey"]);
        if (policy.yesorno2 == "YES") jwtText = "This api needs a valid JWT token"
      }
    })
  }

  if(jwtText) securityData.push({"index":securityData.length + 1,"value": jwtText})
  if(apikeys && apikeys.length>0) securityData.push({"index":securityData.length + 1,"value": `The following api keys is required - ${apikeys.join(",")}`})
console.log(securityData);


  const data = {
    "description": model.apis[0]["apidescription"],
    "exposedpath": `https://<domain>${model.apis[0]["exposedpath"]}`,
    "method": model.apis[0]["method"],
    "standard": model.apis[0]["yesorno"] == "YES" ? "REST" : "NOT REST",
    "inputparams": inputParams,
    "outputparams": outputParams,
    "securitydata":securityData
  };
  if (element.getAttribute("styleBody")) data["styleBody"] = `<style>${element.getAttribute("styleBody")}</style>`;
  api_contents.setData(element.id, data);
}

function traverseObject(target, t, callback) {

  callback(target, t);
  if (typeof target === 'object') {
    for (let key in target) {
      traverseObject(target[key], key, callback);
    }
  }
}

function bindApiContents(elementid) {
  const data = {}

  for (const api of model.apis) {
    console.log(api);
    let inputParams = [], outputParams = [];

    let IdsOfPolicies = api.dependencies, apikeys = [], jwtText = false, securityData = [];

    for (const policy of model.policies) {
      IdsOfPolicies.forEach(id => {
        if (policy.id == id) {
          apikeys.push(policy["apikey"]);
          if (policy.yesorno2 == "YES") jwtText = "This api needs a valid JWT token"
        }
      })
    }

    if(jwtText) securityData.push({"index":securityData.length + 1,"value": jwtText})
    if(apikeys && apikeys.length>0) securityData.push({"index":securityData.length + 1,"value": `The following api keys is required - ${apikeys.join(",")}`});
    console.log(securityData);
    console.log(apikeys);

    traverseObject(JSON.parse(api["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) { if (node && typeof node == "object") if (node.type) { inputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": inputParams.length + 1 }); } });
    traverseObject(JSON.parse(api["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) { if (node && typeof node == "object") if (node.type) { outputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": outputParams.length + 1 }); } });
    if (api["apiname"] == elementid) {
      data["description"] = api["apidescription"];
      data["exposedpath"] = `https://<domain>${api["exposedpath"]}`;
      data["method"] = api["method"];
      if (api["yesorno"] == "YES") data["standard"] = "REST";
      else data["standard"] = "NOT REST";
      data["inputparams"] = inputParams;
      data["outputparams"] = outputParams;
      data["securitydata"] = securityData;
      break;
    }
  }

  api_contents.bindData(data, "apicontent");

}

export const api_contents = {
  trueWebComponentMode: true, elementConnected, bindApiContents
}

monkshu_component.register(
  "api-contents", `${COMPONENT_PATH}/api-contents.html`, api_contents
);