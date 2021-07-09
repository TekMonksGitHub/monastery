/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_MODEL_GET_MODEL = "GET_MODEL";
let IMAGE, I18N;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/save.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/save.i18n.mjs`)).i18n; 
    return true;
}

async function clicked(_element) {
    const download = blackboard.getListeners(MSG_MODEL_GET_MODEL)[0]({});
    util.downloadFile(download.data, download.mime, download.filename);
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

export const save = {init, clicked, getImage, getHelpText, getDescriptiveName}
