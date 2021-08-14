/** 
 * Publish rules to the rules engine.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {monkrulsmodel} from "../model/monkrulsmodel.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";
import {page_generator} from "/framework/components/page-generator/page-generator.mjs";

const MODULE_PATH = util.getModulePath(import.meta), VIEW_PATH=`${MODULE_PATH}/..`, 
    DIALOG_RET_PROPS = ["name", "server", "port", "adminid", "adminpassword"], DIALOG = window.monkshu_env.components["dialog-box"];

let saved_props;

async function openDialog() {
    let pageFile =  `${VIEW_PATH}/dialogs/dialog_publish.page`;

    let html = await page_generator.getHTML(new URL(pageFile));

    const dom = new DOMParser().parseFromString(html, "text/html");
    if (saved_props) for (const id in saved_props) dom.querySelector(`#${id}`).setAttribute("value", saved_props[id]);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = `${VIEW_PATH}/dialogs/dialogPropertiespublish.json`;
    const messageTheme = await $$.requireJSON(`${VIEW_PATH}/dialogs/dialogPropertiesPrompt.json`);
    DIALOG.showDialog(dialogPropertiesPath, html, null, DIALOG_RET_PROPS, 
        async (typeOfClose, result, dialogElement) => { if (typeOfClose == "submit") {
            saved_props = util.clone(result, ["adminpassword"]); // don't save password, for security
            const model = monkrulsmodel.getModel(); 
            const pubResult = await _publishModel(model, result.name, result.server, result.port, result.adminid, result.adminpassword);
            if (!pubResult.result) DIALOG.showError(dialogElement, await i18n.get(pubResult.key)); 
            else {DIALOG.showMessage(await i18n.get("PublishSuccess"), null, null, messageTheme, "MSG_DIALOG");  return true;}
        } });
}

async function _publishModel(input, name, server, port, adminid, adminpassword) {
    const API_LOGIN_SECURE = `https://${server}:${port}/apps/monkruls/login`;
    const API_LOGIN_INSECURE = `http://${server}:${port}/apps/monkruls/login`;
    const API_PUBLISH_SECURE = `https://${server}:${port}/apps/monkruls/admin`;
    const API_PUBLISH_INSECURE = `http://${server}:${port}/apps/monkruls/admin`;

    try {   // try secure first
        const result = await apiman.rest(API_LOGIN_SECURE, "GET", {id: adminid, pw: adminpassword}, false, true);
        if (result.result) return {result: (await apiman.rest(API_PUBLISH_SECURE, "POST", {name, op: "update", input}, true)).result, err: "Publishing failed at the server", raw_err: "Publishing failed at the server", key: "PublishServerIssue"};
        else throw `Server secure login failed, trying insecure, ${await i18n.get(PublishSecureConnectFailed)}`;
    } catch (err)  {    // try insecure else give up
        try {
            LOG.debug(err);
            const result = await apiman.rest(API_LOGIN_INSECURE, "GET", {id: adminid, pw: adminpassword}, false, true);
            if (result.result) return {result: (await apiman.rest(API_PUBLISH_INSECURE, "POST", {name, op: "update", input}, true)).result, err: "Publishing failed at the server", raw_err: "Publishing failed at the server", key: "PublishServerIssue"};
            else return {result: false, err: "Login failed at the server", raw_err: "Login failed at the server", key: "PublishLoginIssue"};
        } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "PublishConnectIssue"} }
    }
}

export const publish = {openDialog};