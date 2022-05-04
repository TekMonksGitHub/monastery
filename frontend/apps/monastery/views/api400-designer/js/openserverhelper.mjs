/** 
 * Opens files from the server.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {serverManager} from "./serverManager.js";
import {blackboard} from "/framework/js/blackboard.mjs";
import {apimanager as apiman} from "../../../../../framework/js/apimanager.mjs";
import { APP_CONSTANTS } from "../../../js/constants.mjs";


const MODULE_PATH = util.getModulePath(import.meta), DIALOG = window.monkshu_env.components["dialog-box"],
    MSG_FILE_UPLOADED = "FILE_UPLOADED";

function init() {
    window.monkshu_env["OPEN_SERVER_HELPER"] = openserverhelper;
}

async function connectServerClicked() {
    const server = DIALOG.getElementValue("server"), port = DIALOG.getElementValue("port"), 
        adminid = DIALOG.getElementValue("adminid"), adminpassword = DIALOG.getElementValue("adminpassword");
    const listResult = await serverManager.getModelList(server, port, adminid, adminpassword);
    if (!listResult.result) {DIALOG.showError(null, await i18n.get(listResult.key)); LOG.error("Model list fetch failed"); return;}
    else DIALOG.hideError();
    const items = []; for (const modelName of listResult.models) items.push({id: modelName, 
        img: util.resolveURL(`${MODULE_PATH}/../dialogs/model.svg`), label: modelName});
    DIALOG.getElement("packages").value = (JSON.stringify(items));
}

async function openClicked(_elementSendingTheEvent, idOfPackageToOpen) {
   const data =  await apiman.rest( APP_CONSTANTS.API_MODEL_OBJECT, "POST", { idOfPackageToOpen}, true);
        if(!data){
            DIALOG.showError(null, "Model Object fetch failed "); LOG.error("Model Object fetch failed"); return;
        }
        else{
            DIALOG.hideError();
            blackboard.broadcastMessage(MSG_FILE_UPLOADED, {idOfPackageToOpen, data});
            DIALOG.hideDialog();
        } 
     //   const server = DIALOG.getElementValue("server"), port = DIALOG.getElementValue("port"), 
       //     adminid = DIALOG.getElementValue("adminid"), adminpassword = DIALOG.getElementValue("adminpassword");
        // const modelResult = await serverManager.getModel(idOfPackageToOpen, server, port, adminid, adminpassword);
        // if (!modelResult.result) {DIALOG.showError(null, await i18n.get(modelResult.key)); LOG.error("Model fetch failed"); return;}
        // else {
        //     DIALOG.hideError();
        //     blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name: modelResult.name, data: modelResult.model});
        //     DIALOG.hideDialog();
        // }

}

export const openserverhelper = {init, connectServerClicked, openClicked};