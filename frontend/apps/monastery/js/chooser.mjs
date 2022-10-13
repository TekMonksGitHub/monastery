/** 
 * JS file for chooser.html
 * (C) 2020 TekMonks. All rights reserved.
 * License: See enclosed license file.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {application} from "./application.mjs";
import {router} from "/framework/js/router.mjs";
import {session} from "/framework/js/session.mjs";
import {securityguard} from "/framework/js/securityguard.mjs";
import {dialog_box} from "../views/shared/components/dialog-box/dialog-box.mjs";

const MODULE_PATH = util.getModulePath(import.meta);

async function interceptPageLoadData() {
    const views = await $$.requireJSON(`${MODULE_PATH}/../views/conf/views.json`), lang = i18n.getSessionLang();
    const data = {views:[]}; for (const view of views) {
        const item = {name: view, description: 
            (await import (`${MODULE_PATH}/../views/${view}/page/i18n.mjs`)).i18n[lang].Description};
        data.views.push(item);
    }

    router.addOnLoadPageData(util.resolveURL(`${MODULE_PATH}/../chooser.html`), pageData => Object.assign(pageData, data));
}

async function loadView(view) {
    console.log("view");
    console.log(securityguard.getCurrentRole());

    const org = new String(session.get(APP_CONSTANTS.USERORG)).toLowerCase(); 
    if (securityguard.isAllowed(view, org)) router.loadPage(`${APP_CONSTANTS.MAIN_HTML}?view=${view}`);
    else {
        const theme = await $$.requireJSON(`${MODULE_PATH}/../views/shared/resources/dialogPropertiesPrompt.json`)
        dialog_box.showMessage(await i18n.get("NotAuthorized"), "error", null, theme);
    }
}

const exitClicked = _ => application.exit();

export const chooser = {interceptPageLoadData, loadView, exitClicked};