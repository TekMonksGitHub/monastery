/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_FILE_UPLOADED = "FILE_UPLOADED";
let IMAGE, I18N;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/open.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/open.i18n.mjs`)).i18n; 
    return true;
}

async function clicked(_element) {
    try {
        const {name, data} = await util.uploadAFile("application/json");
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

export const open = {init, clicked, getImage, getHelpText, getDescriptiveName}