/** 
 * Manages all communication with Rules server.
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {apimanager as apiman} from "/framework/js/apimanager.mjs";

/**
 * Returns the list of models present on the server
 * @param {string} server Server IP or Hostname
 * @param {string||number} port Server port
 * @param {string} adminid Server admin login ID
 * @param {string} adminpassword Server admin password
 * @returns {result: true|false, models: [array of model names on success], err: Error text on failure, raw_err: Raw error, key: Error i18n key}
 */
async function getModelList(server, port, adminid, adminpassword) {
    const API_ADMIN_URL_FRAGMENT = `://${server}:${port}/apps/monkruls/admin`;

    const loginResult = await _loginToServer(server, port, adminid, adminpassword);
    if (!loginResult.result) return loginResult;    // failed to connect or login

    try {   // try to get the list now
        const result = await apiman.rest(loginResult.scheme+API_ADMIN_URL_FRAGMENT, "POST", 
        {op: "list"}, true);
        return {result: result.result, models: result.result?result.list:null, err: "List fetch failed at the server", 
            raw_err: "Model list fetch failed at the server", key: "ModelListServerIssue"};
    } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"} }
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
 async function getModel(name, server, port, adminid, adminpassword) {
    const API_ADMIN_URL_FRAGMENT = `://${server}:${port}/apps/monkruls/admin`;

    const loginResult = await _loginToServer(server, port, adminid, adminpassword);
    if (!loginResult.result) return loginResult;    // failed to connect or login

    try {   // try to read the model now
        const result = await apiman.rest(loginResult.scheme+API_ADMIN_URL_FRAGMENT, "POST", 
        {op: "read", name}, true);
        return {result: result.result, model: result.result?result.data:null, err: "Model read failed at the server", 
            name: result.result?result.name:null, raw_err: "Model read failed at the server", key: "ModelReadServerIssue"};
    } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"} }
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
    const API_ADMIN_URL_FRAGMENT = `://${server}:${port}/apps/monkruls/admin`;

    const loginResult = await _loginToServer(server, port, adminid, adminpassword);
    if (!loginResult.result) return loginResult;    // failed to connect or login

    try {   // try to delete
        const result = await apiman.rest(loginResult.scheme+API_ADMIN_URL_FRAGMENT, "POST", 
        {op: "delete", name}, true);
        return {result: result.result, err: "Mode unpublish failed at the server", 
            raw_err: "Model unpublish failed at the server", key: "ModelUnpublishServerIssue"};
    } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"} }
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
async function publishModel(model, name, server, port, adminid, adminpassword) {
    const API_ADMIN_URL_FRAGMENT = `://${server}:${port}/apps/monkruls/admin`;

    const loginResult = await _loginToServer(server, port, adminid, adminpassword);
    if (!loginResult.result) return loginResult;    // failed to connect or login

    try {   // try to publish now
        return {result: (await apiman.rest(loginResult.scheme+API_ADMIN_URL_FRAGMENT, "POST", 
            {name, op: "update", input: model}, true)).result, err: "Publishing failed at the server", 
            raw_err: "Publishing failed at the server", key: "PublishServerIssue"};
    } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"} }
}

async function _loginToServer(server, port, adminid, adminpassword) {
    const API_LOGIN_SECURE = `https://${server}:${port}/apps/monkruls/login`;
    const API_LOGIN_INSECURE = `http://${server}:${port}/apps/monkruls/login`;

    try {   // try secure first
        const result = await apiman.rest(API_LOGIN_SECURE, "GET", {id: adminid, pw: adminpassword}, false, true);
        if (result.result) return {result: true, scheme:"https"};
        else throw `Server secure login failed, trying insecure, ${await i18n.get(SecureConnectFailed)}`;
    } catch (err)  {    // try insecure else give up
        try {
            LOG.debug(err);
            const result = await apiman.rest(API_LOGIN_INSECURE, "GET", {id: adminid, pw: adminpassword}, false, true);
            if (result.result) return {result: true, scheme:"http"};
            else return {result: false, err: "Login failed at the server", raw_err: "Login failed at the server", key: "LoginIssue"};
        } catch (err)  {return {result: false, err: "Server connection issue", raw_err: err, key: "ConnectIssue"} }
    }
}

export const serverManager = {publishModel, unpublishModel, getModelList, getModel};