import { util } from "/framework/js/util.mjs";
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { APP_CONSTANTS } from "../../../js/constants.mjs";

const MODULE_PATH = util.getModulePath(import.meta);

function init() {
    window.monkshu_env["ITEMS"] = items;
}

async function getItemList() {
    try {
        const result = JSON.parse(await apiman.rest(APP_CONSTANTS.API_LIST_USER_APIS, "POST", { "data": { "path": "/apps/apiboss/admin/listuserapis", } }, true));
        if (result.data && result.data.result) {
            const models = result.data.apis.map(apis => {
                const d = apis.split("/"); return d[d.length - 1];
            })
            const items = []; for (const modelName of models) items.push({
                id: modelName,
                img: util.resolveURL(`${MODULE_PATH}/../dialogs/model.svg`), label: modelName
            });
            return JSON.stringify(items);
        }
    }
    catch (err) {
    LOG.error(`User apis list fetch failed and the error is ${err}`);
    return "[]";
    }
}


export const items = { init, getItemList };