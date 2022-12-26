/**
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { util } from "/framework/js/util.mjs";
import { monkshu_component } from "/framework/js/monkshu_component.mjs";
import { APP_CONSTANTS } from "../../../../js/constants.mjs";

const COMPONENT_PATH = util.getModulePath(import.meta),VIEW_PATH=APP_CONSTANTS.CONF_PATH;
let docData,model,serverDetails;


const elementConnected = async (element) => {

   model = await $$.requireJSON(`${VIEW_PATH}/metadata.json`),serverDetails = await $$.requireJSON(`${VIEW_PATH}/serverdetail.json`);

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


  const data = {
    "description": model.apis[0]["apidescription"],
    "exposedpath": `${serverDetails.secure ?"https":"http"}://${serverDetails.hostname}:${serverDetails.port}${model.apis[0]["exposedpath"]}`,
    "method": model.apis[0]["method"],
    "standard": model.apis[0]["yesorno"] == "YES" ? "REST" : "NOT REST",
    "inputparams": inputParams,
    "outputparams": outputParams,
    "securitydata":securityData,
    "apiname": model.apis[0]["apiname"]
  };
  if (element.getAttribute("styleBody")) data["styleBody"] = `<style>${element.getAttribute("styleBody")}</style>`;
  api_contents.setData(element.id, data);
  docData = data;
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

    traverseObject(JSON.parse(api["input-output"])["requestBody"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) { if (node && typeof node == "object") if (node.type) { inputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": inputParams.length + 1 }); } });
    traverseObject(JSON.parse(api["input-output"])["responses"]["200"]["content"]["application/json"]["schema"]["properties"], false, function (node, key) { if (node && typeof node == "object") if (node.type) { outputParams.push({ "name": key, "type": node.type, "desc": node.desc ? node.desc : "", "index": outputParams.length + 1 }); } });
    if (api["apiname"] == elementid) {
      data["description"] = api["apidescription"];
      data["exposedpath"] = `${serverDetails.secure ?"https":"http"}://${serverDetails.hostname}:${serverDetails.port}${api["exposedpath"]}`;
      data["method"] = api["method"];
      if (api["yesorno"] == "YES") data["standard"] = "REST";
      else data["standard"] = "NOT REST";
      data["inputparams"] = inputParams;
      data["outputparams"] = outputParams;
      data["securitydata"] = securityData;
      data["apiname"] = api["apiname"]
      break;
    }
  }

  api_contents.bindData(data, "apicontent");
  docData = data;

}

async function downloadPDF(){
  await $$.require(`${COMPONENT_PATH}/dist/jspdf.debug.js`);
  await $$.require(`${COMPONENT_PATH}/dist/jspdf.plugin.autotable.min.js`);
  let inputdata = [];
  let outputdata = [];
  let securitydata = [];

  docData.inputparams.forEach((data) => {
    inputdata.push([`${data.index}`, `${data.name}`, `${data.type}`, `${data.desc}`])
  })

  docData.outputparams.forEach((data) => {
    outputdata.push([`${data.index}`, `${data.name}`, `${data.type}`, `${data.desc}`])
  })

  docData.securitydata.forEach((data) => {
    securitydata.push([`${data.index}`, `${data.value}`])
  })
  let doc = new jsPDF();
  doc.autoTable({
    styles: {fontStyle: 'bold', fontSize: '15'},
    head:[{content: docData.apiname}]
  })
  doc.autoTable({
    body: [{ content: `${docData.description}` }]
  })
  doc.autoTable({
    head: [{ content: "Calling this API" }],
    body: [[`URL to call this API is ${docData.exposedpath}`], [`The HTTP action to call this API is ${docData.method}`], [`The API request and response is in ${docData.standard} standard`]]
  })
  doc.autoTable({
    head: [{ content: "The input parameters are" }],
  })
  doc.autoTable({
    columnStyles: {
        0: { cellWidth: 5 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 60 }
      },
    body: inputdata
  });
  doc.autoTable({
    head: [{ content: "The output parameters are" }]
  })
  doc.autoTable({
    columnStyles: {
        0: { cellWidth: 5 },
        1: { cellWidth: 20 },
        2: { cellWidth: 15 },
        3: { cellWidth: 60 }
      },
    body: outputdata
  });

  doc.autoTable({
    head: [{ content: "Security" }],
  })
  doc.autoTable({
    columnStyles: {
        0: { cellWidth: 5 },
        1: { cellWidth: 95 },
      },
    body: securitydata
  });
  doc.save(`${docData.apiname}.pdf`);
}

export const api_contents = {
  trueWebComponentMode: true, elementConnected, bindApiContents, downloadPDF
}

monkshu_component.register(
  "api-contents", `${COMPONENT_PATH}/api-contents.html`, api_contents
);