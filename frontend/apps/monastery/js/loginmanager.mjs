/* 
 * (C) 2018 TekMonks. All rights reserved.
 * License: MIT - see enclosed license.txt file.
 */
import {session} from "/framework/js/session.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";
import {apimanager as apiman} from "/framework/js/apimanager.mjs";

let logoutListeners = [];

async function signin(id, pass) {
    logoutListeners = [];   // reset listeners on sign in
        
    let resp = null; try{resp = await apiman.rest(APP_CONSTANTS.API_LOGIN, "POST", {id, pw: pass}, false, true);} catch (err) {}
    if (resp && resp.result) {
        session.set(APP_CONSTANTS.USERID, resp.id); 
        session.set(APP_CONSTANTS.USERNAME, resp.name);
        session.set(APP_CONSTANTS.USERORG, resp.org);
        securityguard.setCurrentRole(resp.role);
        return true;
    } else {LOG.error(`Login failed for ${id}`); return false;}
}

async function changepassword(id, newpass) {        
    let resp = null; try{resp = await apiman.rest(APP_CONSTANTS.API_CHANGEPW, "POST", {id, newpass}, true, false);} catch (err) {}
    if (resp && resp.result) return true;
    else {LOG.error(`Password change failed for ${id}`); return false;}
}

const addLogoutListener = listener => logoutListeners.push(listener);

async function logout() {
    for (const listener of logoutListeners) await listener();

    const savedLang = session.get($$.MONKSHU_CONSTANTS.LANG_ID); 
    session.destroy(); securityguard.setCurrentRole(APP_CONSTANTS.GUEST_ROLE);
    session.set($$.MONKSHU_CONSTANTS.LANG_ID, savedLang);
}

export const loginmanager = {signin, logout, changepassword, addLogoutListener}