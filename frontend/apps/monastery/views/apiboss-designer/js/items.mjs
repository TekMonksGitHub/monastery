import { util } from "/framework/js/util.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { APP_CONSTANTS } from "../../../js/constants.mjs";
import { serverManager } from "./serverManager.js";

const MODULE_PATH = util.getModulePath(import.meta);

function init() {
    window.monkshu_env["ITEMS"] = items;
}

async function getItemList() {
    try {
        const serverDetails = JSON.parse(await apiman.rest(APP_CONSTANTS.API_GETAPPCONFIG, "POST", {}, true));

        // const loginResult = await serverManager.loginToServer(serverDetails.host, serverDetails.port, serverDetails.adminid,serverDetails.adminpassword);
        // if (!loginResult.result) return loginResult;    // failed to connect or login
        console.log(serverDetails);
        const result = JSON.parse(await apiman.rest(`http://${serverDetails.host}:${serverDetails.port}/apps/apiboss/admin/listuserapis`, "POST", { "data": { "path": "/apps/apiboss/admin/listuserapis", } }, true));
        console.log(result);
        if (result.data && result.data.result) {
            const models = result.data.apis.map(apis => {
                const d = apis.split("/"); return d[d.length - 1];
            })

            const methods = result.data.apisvalue.map(value => {
                const urlParams = new URLSearchParams(value.split("?")[1]);
                // console.log(urlParams);
                // console.log(urlParams.has('method'));
                if (!urlParams.has('method')) return "GET";
                else return urlParams.get('method');

            })
            console.log(methods);
            const items = []; for (let i = 0; i < models.length; i++) items.push({
                id: models[i],
                img: util.resolveURL(`${MODULE_PATH}/../dialogs/model.svg`), label: models[i], method: methods[i]
            });
            console.log(items);
            return JSON.stringify(items);
        }
    }
    catch (err) {
        LOG.error(`User apis list fetch failed and the error is ${err}`);
        return "[]";
    }
}


export const items = { init, getItemList };