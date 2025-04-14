/** 
 * UnPublish apicl to the api400 engine.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {serverManager} from "./serverManager.js";
import {blackboard} from "/framework/js/blackboard.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";


const MODULE_PATH = util.getModulePath(import.meta), VIEW_PATH=`${MODULE_PATH}/..`, MSG_GET_MODEL_NAME = "GET_MODEL_NAME", 
    DIALOG_RET_PROPS = ["name", "server", "port", "adminid", "adminpassword"], 
    DIALOG = window.monkshu_env.components["dialog-box"];

let saved_props;

async function openDialog() {
    let pageFile =  `${VIEW_PATH}/dialogs/dialog_unpublish.page`;

    let html = await page_generator.getHTML(new URL(pageFile), null, {modelName: blackboard.getListeners(MSG_GET_MODEL_NAME)[0]({})||""});

    const dom = new DOMParser().parseFromString(html, "text/html");
    if (saved_props) for (const id in saved_props) dom.querySelector(`#${id}`).setAttribute("value", saved_props[id]);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = `${VIEW_PATH}/dialogs/dialogPropertiesunpublish.json`;
    const messageTheme = await $$.requireJSON(`${VIEW_PATH}/dialogs/dialogPropertiesPrompt.json`);
    DIALOG.showDialog(dialogPropertiesPath, html, null, DIALOG_RET_PROPS, 
        async (typeOfClose, result, dialogElement) => { if (typeOfClose == "submit") {
            saved_props = util.clone(result, ["adminpassword"]); // don't save password, for security
           const unPubResult = await serverManager.unpublishApicl( result.name, result.server, result.port, result.adminid, result.adminpassword);
            if (!unPubResult.result) DIALOG.showError(dialogElement, await i18n.get(unPubResult.key)); 
            else {DIALOG.showMessage(await i18n.get("UnPublishSuccess"), "ok", null, messageTheme, "MSG_DIALOG");  return true;}
        } });
}

export const unpublish = {openDialog};