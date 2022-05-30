/** 
 * Manages all communication with Rules server.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { open } from "../components/pluggable-ribbon/topribbon/open/open.mjs"
import { api400model } from "../model/api400model.mjs";
import { openserverhelper } from "./openserverhelper.mjs";

/**
 * Returns the list of models present on the server
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} adminid Server admin login ID
 * @param {string} adminpassword Server admin password
 * @returns {result: true|false, models: [array of model names on success], err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getApiclList(server, port, user, password) {
    try {   // try to get the list now
        const result = await apiman.rest(`http://${server}:${port}/admin/listAPIs`, "POST",
            { user, password }, true);
        const list = [];
        result.list.forEach(function (el) { list.push(el.substring(1));});
        result.list = list;
        return {
            result: result.result, models: result.result ? result.list : null, err: "List fetch failed at the server",
            raw_err: "Apicl list fetch failed at the server", key: "ApiclListServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }
}

/**
 * Returns the given model as an object
 * @param {string} name The model name
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} adminid Server admin login ID
 * @param {string} adminpassword Server admin password
 * @returns {result: true|false, model: Model object on success, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getApicl(name, server, port, user, password) {

    try {   // try to read the apicl now
        const result = await apiman.rest(`http://${server}:${port}/admin/getAPI`, "POST", { user, password, name }, true);
        let data = await open.apiclParser(atob(result.data).toString());
        return {
            result: result.result, model: result.result ? JSON.stringify(data) : null, err: "Apicl read failed at the server",
            name: result.result ? name : null, raw_err: "Apicl read failed at the server", key: "ApiclReadServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }

}

/**
 * Unpublishes the given model at the server (deletes it)
 * @param {string} name The model name
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} adminid Server admin login ID
 * @param {string} adminpassword Server admin password
 * @returns {result: true|false, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function unpublishModel(name, server, port, adminid, adminpassword) {
    const API_ADMIN_URL_FRAGMENT = `://${server}:${port}/apps/api400/admin`;

    const loginResult = await _loginToServer(server, port, adminid, adminpassword);
    if (!loginResult.result) return loginResult;    // failed to connect or login

    try {   // try to delete
        const result = await apiman.rest(loginResult.scheme + API_ADMIN_URL_FRAGMENT, "POST",
            { op: "delete", name }, true);
        return {
            result: result.result, err: "Mode unpublish failed at the server",
            raw_err: "Model unpublish failed at the server", key: "ModelUnpublishServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }
}

/**
 * Publishes the given model to the server
 * @param {object} model The model to publish or update
 * @param {string} name The name for the model
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} adminid Server admin login ID
 * @param {string} adminpassword Server admin password
 * @returns {result: true|false, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function publishApicl(model, name, server, port, user, password) {
    const b64Data = btoa(JSON.stringify(model, null, ' '));
    try {   // try to publish now
        return {
            result: (await apiman.rest(`http://${server}:${port}/admin/publishAPI`, "POST", { user, password, name, type: "apicl", src: b64Data }, true)).result, err: "Publishing failed at the server",
            raw_err: "Publishing failed at the server", key: "PublishServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }

}

async function _loginToServer(server, port, adminid, adminpassword) {
    const API_LOGIN_SECURE = `https://${server}:${port}/apps/monastery/login`;
    const API_LOGIN_INSECURE = `http://${server}:${port}/apps/monastery/login`;
    try {   // try secure first
        const result = await apiman.rest(API_LOGIN_SECURE, "GET", { id: adminid, pw: adminpassword }, false, true);
        if (result.result) return { result: true, scheme: "https" };
        else throw `Server secure login failed, trying insecure, ${await i18n.get(SecureConnectFailed)}`;
    } catch (err) {    // try insecure else give up
        try {
            LOG.debug(err);
            const result = await apiman.rest(API_LOGIN_INSECURE, "GET", { id: adminid, pw: adminpassword }, false, true);
            if (result.result) return { result: true, scheme: "http" };
            else return { result: false, err: "Login failed at the server", raw_err: "Login failed at the server", key: "LoginIssue" };
        } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }
    }
}

async function getModule(name) {
    let serverDetails = await openserverhelper.serverDetails();
    try {   // try to read the module now
        const result = await apiman.rest(`http://${serverDetails.server}:${serverDetails.port}/admin/getMOD`, "POST", { "user": serverDetails.adminid, "password": serverDetails.adminpassword, name }, true);
        let data = atob(result.data).toString();
        return {
            result: result.result, mod: result.result ? data : null, err: "Module read failed at the server or Not Found",key: "ModuleNotFound",

        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue", mod: "exports.execute = execute;\n\nfunction execute(env, callback){\n\ncallback();\n}\n" } }

}
async function publishModule(name, server, port, user, password) {
    try {
        let count = 0;
        let result;
        const runJsModArray = api400model.runJsMod();
        if (runJsModArray.length != 0) {
            for (let runJsMod of runJsModArray) {
                if (runJsMod[0] == "")   throw  'Module Name Not Found'             
                if (runJsMod[1] == "") runJsMod[1] = "exports.execute = execute;\n\nfunction execute(env, callback){\n\ncallback();\n}\n"
                let b64Data = btoa(runJsMod[1]);
                 result = await apiman.rest(`http://${server}:${port}/admin/publishModule`, "POST", { user, password, name: runJsMod[0], type: "js", src: b64Data }, true);
                count = result.result ? ++count : count;
            }
        }
        if (count == runJsModArray.length) return{ result:true};
        
        return {result:false, key: "FailedModule" }
    }
    catch(err) {
        return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"}
    }
}

export const serverManager = { publishApicl, unpublishModel, getApiclList, getApicl, getModule ,publishModule};