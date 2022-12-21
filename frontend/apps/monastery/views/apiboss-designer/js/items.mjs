import { util } from "/framework/js/util.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { APP_CONSTANTS } from "../../../js/constants.mjs";
import { serverManager } from "./serverManager.js";

const MODULE_PATH = util.getModulePath(import.meta);

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

function init() {
    window.monkshu_env["ITEMS"] = items;
}

async function getItemList() {
    try {
        // const serverDetails = JSON.parse(await apiman.rest(APP_CONSTANTS.API_GETAPPCONFIG, "POST", {}, true));

        // // const loginResult = await serverManager.loginToServer(serverDetails.host, serverDetails.port, serverDetails.adminid,serverDetails.adminpassword);
        // // if (!loginResult.result) return loginResult;    // failed to connect or login
        // console.log(serverDetails);
        // const result = JSON.parse(await apiman.rest(`http://${serverDetails.host}:${serverDetails.port}/apps/apiboss/admin/listuserapis`, "POST", { "data": { "path": "/apps/apiboss/admin/listuserapis", } }, true));
        // console.log(result);
        // if (result.data && result.data.result) {
        //     const models = result.data.apis.map(apis => {
        //         const d = apis.split("/"); return d[d.length - 1];
        //     })

        //     const methods = result.data.apisvalue.map(value => {
        //         const urlParams = new URLSearchParams(value.split("?")[1]);
        //         // console.log(urlParams);
        //         // console.log(urlParams.has('method'));
        //         if (!urlParams.has('method')) return "GET";
        //         else return urlParams.get('method');

        //     })
        //     console.log(methods);
        const items = [];
        for (const api of model.apis){
            items.push({
                id:api["apiname"],img: util.resolveURL(`${MODULE_PATH}/../dialogs/model.svg`),
                label:api["apiname"],method:api["method"]})}
            //  for (let i = 0; i < models.length; i++) items.push({
            //     id: models[i],
            //      label: models[i], method: methods[i]
            // });
            console.log(items);
            return JSON.stringify(items);
        // }
    }
    catch (err) {
        LOG.error(`User apis list fetch failed and the error is ${err}`);
        return "[]";
    }
}


export const items = { init, getItemList };