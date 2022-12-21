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
            "description": "echo",
            "nodeName": "api",
            "name": "Api1",
            "id": "167100034350183.1718773181056",
            "x": 210,
            "y": 50,
            "dependencies": [
                "167100035268611.011567976397195"
            ],
            "apiname": "echo",
            "apidescription": "This API allows the caller to query customers by customer name. The only required input parameter is 'customer_name'",
            "exposedpath": "/apps/apiboss/echo",
            "method": "GET",
            "backendurl": "/apis/echo.js?needsToken=false",
            "method1": "POST",
            "injected": "[[\"g\",\"h\"],[\"i\",\"j\"]]",
            "passthrough": "[[\"k\"],[\"l\"]]",
            "yesorno": "YES",
            "contentinput": "m",
            "input-output": "[\"{\\\"m\\\":{\\\"type\\\":\\\"string\\\",\\\"desc\\\":\\\"sasa\\\"}}\",\"{\\\"v\\\":{\\\"type\\\":\\\"boolean\\\",\\\"desc\\\":\\\"sa\\\"}}\"]"
        },
        {
            "description": "genjwttoken",
            "nodeName": "api",
            "name": "Api2",
            "id": "167100034590431.975116328701425",
            "x": 320,
            "y": 70,
            "dependencies": [
                "167100035650130.945507963243625"
            ],
            "apiname": "genjwttoken",
            "apidescription": "This API allows the caller to query customers by customer name.",
            "exposedpath":  "/apps/apiboss/genjwttoken",
            "method": "POST",
            "backendurl": "/apis/genjwttoken.js?needsToken=false&addsToken=sub:access&keys=jfiouf90iejw9ri32fewji910idj2fkvjdskljkeqjf",
            "method1": "POST",
            "injected": "[[\"dasd\",\"fasd\"],[\"sda\",\"dsadas\"]]",
            "passthrough": "[[\"asdsa\"],[\"fas\"]]",
            "yesorno": "NO",
            "contentinput": "dasf",
            "input-output": "[\"{\\\"das\\\":{\\\"type\\\":\\\"string\\\",\\\"desc\\\":\\\"sad\\\"}}\",\"{\\\"ds\\\":{\\\"type\\\":\\\"string\\\",\\\"desc\\\":\\\"asdas\\\"}}\"]"
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
            "apikey": "d",
            "yesorno": "NO",
            "userid": "a",
            "password": "d",
            "yesorno1": "YES",
            "jwtsubject": "sad",
            "yesorno2": "",
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
            "apikey": "dsadsa",
            "yesorno": "",
            "userid": "asd",
            "password": "das",
            "yesorno1": "",
            "jwtsubject": "asd",
            "yesorno2": "",
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
    const data = {
        "description":model.apis[0]["apidescription"],
        "exposedpath":`https://<domain>${model.apis[0]["exposedpath"]}`,
        "method":model.apis[0]["method"],
        "standard" :model.apis[0]["yesorno"]=="YES"?"REST":"NOT REST"

    };
        if (element.getAttribute("styleBody")) data["styleBody"] = `<style>${element.getAttribute("styleBody")}</style>`;
        console.log(element.id);

    api_contents.setData(element.id, data);
 }

 
function bindApiContents(element,elementid) {
    // api_contents.getShadowRootByHostId("apicontent").
    const data = {}
    console.log(data);
    console.log(elementid);

    for (const api of model.apis){
        if(api["apiname"] == elementid) {
            data["description"] = api["apidescription"];
            data["exposedpath"] = `https://<domain>${api["exposedpath"]}`;
            data["method"] = api["method"];
            console.log(api["yesorno"]);
            if(api["yesorno"]=="YES") data["standard"] = "REST";
            else data["standard"] = "NOT REST"
            break;
        }
    }
    console.log(data);
 
    api_contents.bindData( data,"apicontent");

}

export const api_contents = {
    trueWebComponentMode: true,elementConnected,bindApiContents
}

monkshu_component.register(
    "api-contents", `${COMPONENT_PATH}/api-contents.html`, api_contents
);