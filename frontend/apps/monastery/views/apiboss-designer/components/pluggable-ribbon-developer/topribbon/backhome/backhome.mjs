/* 
 * (C) 2020 TekMonks. All rights reserved.
 */

import {util} from "/framework/js/util.mjs";
import {router} from "/framework/js/router.mjs";

const PLUGIN_PATH = util.getModulePath(import.meta);
let IMAGE, I18N;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/backhome.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/backhome.i18n.mjs`)).i18n; 
    return true;
}

async function clicked() {
 router.loadPage(`${APP_CONSTANTS.MAIN_HTML}?view=apiboss-designer`);
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];




export const backhome = {init, clicked, getImage, getHelpText, getDescriptiveName}