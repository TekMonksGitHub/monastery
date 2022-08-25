/** 
 * Manages all communication with api400 server.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import { apimanager as apiman } from "/framework/js/apimanager.mjs";
import { api400model } from "../model/api400model.mjs";
import { openserverhelper } from "./openserverhelper.mjs";
import { apiclparser } from "../model/apiclparser.mjs"

/**
 * Returns the list of published apicls present on the server
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} user Server admin login ID
 * @param {string} password Server admin password
 * @returns {result: true|false, apicls: [array of apicl names on success], err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getApiclList(server, port, user, password) {
    try {   // try to get the list now
        let result = await apiman.rest(`http://${server}:${port}/admin/listAPIs`, "POST",{ user, password }, true);
        if (typeof result == "string") result = JSON.parse(result);
        if (result.result && result.list) result.list = result.list.map(item => item.substring(1));
        return {
            result: result.result, apicls: result.result ? result.list : null, err: "List fetch failed at the server",
            raw_err: "Apicl list fetch failed at the server", key: "ApiclListServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }
}

/**
 * Returns the given apicl as an object
 * @param {string} name The apicl name
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} user Server admin login ID
 * @param {string} password Server admin password
 * @returns {result: true|false, apicl: apicl object on success, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getApicl(name, server, port, user, password) {

    try {   // try to read the apicl now
        let data, result = await apiman.rest(`http://${server}:${port}/admin/getAPI`, "POST", { user, password, name }, true);
        if (typeof result == "string") result = JSON.parse(result);
        if (result.result && result.data) data = await apiclparser.apiclParser(atob(result.data).toString());
        return {
            result: result.result, apicl: result.result ? JSON.stringify(data) : null, err: "Apicl read failed at the server",
            name: result.result ? name : null, raw_err: "Apicl read failed at the server", key: "ApiclReadServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }

}


/**
 * Publishes the given apicl to the server
 * @param {object} apicl The apicl to publish or update
 * @param {string} name The name for the apicl
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} user Server admin login ID
 * @param {string} password Server admin password
 * @returns {result: true|false, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function publishApicl(apicl, name, server, port, user, password) {
    const b64Data = btoa(JSON.stringify(apicl, null, ' '));
    let result = await apiman.rest(`http://${server}:${port}/admin/publishAPI`, "POST", { user, password, name, type: "apicl", src: b64Data }, true);
    if (typeof result == "string") result = JSON.parse(result);
    try {   // try to publish now
        return {
            result: result.result, err: "Publishing failed at the server", raw_err: "Publishing failed at the server", key: "PublishServerIssue"
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" } }

}

/**
 * Publishes the given module to the server before publishing the apicl
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} user Server admin login ID
 * @param {string} password Server admin password
 */
async function publishModule(server, port, user, password) {
    try {
        let count = 0, result;
        const runJsModArray = api400model.getModules();
        if (runJsModArray.length != 0) {
            for (let runJsMod of runJsModArray) {
                if (runJsMod[0] == "") return { result: false, key: "FailedModule" };
                if (runJsMod[1] == "") runJsMod[1] = "exports.execute = execute;\n\nfunction execute(env, callback){\n\ncallback();\n}\n";
                const b64Data = btoa(runJsMod[1]);
                result = await apiman.rest(`http://${server}:${port}/admin/publishModule`, "POST", { user, password, name: runJsMod[0], type: "js", src: b64Data }, true);
                if (typeof result == "string") result = JSON.parse(result);
                count = result.result ? ++count : count;
            }
        }
        if (count == runJsModArray.length) return { result: true };
        if (!result.result) return { result: result.result, key: "PublishModFailed" };
        return { result: false, key: "PublishModFailed" }
    }
    catch (err) {
        return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue" }
    }
}

/**
 * Returns the  module data as an object
 * @param {string} name The module name
 * @returns {result: true|false, mod: JS data on success, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getModule(name) {
    const serverDetails = await openserverhelper.serverDetails();
    try {   // try to read the module now
        let result = await apiman.rest(`http://${serverDetails.server}:${serverDetails.port}/admin/getMOD`, "POST", { "user": serverDetails.adminid, "password": serverDetails.adminpassword, name }, true);
        if (typeof result == "string") result = JSON.parse(result);
        let data = atob(result.data).toString();
        return {
            result: result.result, mod: result.result ? data : null, err: "Module read failed at the server or Not Found", key: "ModuleNotFound",
        };
    } catch (err) { return { result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue", mod: "exports.execute = execute;\n\nfunction execute(env, callback){\n\ncallback();\n}\n" } }

}

/**
 * Unpublishes the given apicl at the server (deletes it)
 * @param {string} name The model name
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} user Server admin login ID
 * @param {string} password Server admin password
 * @returns {result: true|false, err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function unpublishApicl(name, server, port, user, password) {

    try {   // try to delete
        let result = await apiman.rest(`http://${server}:${port}/admin/deleteAPI`, "POST", { user, password, name }, true);
        if (typeof result == "string") result = JSON.parse(result);
        return {
            result: result.result, err: "apicl unpublish failed at the server",
            raw_err: "apicl unpublish failed at the server", key: "apiclUnpublishServerIssue"
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

export const serverManager = { publishApicl, unpublishApicl, getApiclList, getApicl, getModule, publishModule };