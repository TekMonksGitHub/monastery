/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";
import {publish as publishMod} from "../../../../js/publish.mjs"

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_MODEL_GET_MODEL = "GET_MODEL", 
    CONTEXT_MENU = window.monkshu_env.components["context-menu"], CONTEXT_MENU_ID = "contextmenumain",
    MSG_GET_MODEL_NAME = "GET_MODEL_NAME", MSG_RESET = "RESET", MSG_MODEL_LOAD_MODEL = "LOAD_MODEL",
    MSG_RENAME_MODEL = "RENAME_MODEL";
let IMAGE, I18N, HTML_CONTENT, MODEL_NAME;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/save.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/save.i18n.mjs`)).i18n; 
    HTML_CONTENT = await $$.requireText(`${PLUGIN_PATH}/save.html`);
    blackboard.registerListener(MSG_GET_MODEL_NAME, _=>MODEL_NAME, true);
    blackboard.registerListener(MSG_RESET, _=>MODEL_NAME=null, true);
    blackboard.registerListener(MSG_MODEL_LOAD_MODEL, message=>MODEL_NAME=_nomalizeName(message.name));
    blackboard.registerListener(MSG_RENAME_MODEL, message=>MODEL_NAME=_nomalizeName(message.name));
    return true;
}

async function clicked(element, event) {
    event.stopPropagation();
    const boundingRect = element.getBoundingClientRect(), x = boundingRect.x, y = boundingRect.bottom;
    CONTEXT_MENU.showMenu(CONTEXT_MENU_ID, HTML_CONTENT, x, y, 0, 5, _convert18NtoRenderData());
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

function saveToDisk(name) {
    if (name && name.trim() != "") MODEL_NAME = name; else MODEL_NAME = null;
    const download = blackboard.getListeners(MSG_MODEL_GET_MODEL)[0]({name: MODEL_NAME});
    util.downloadFile(download.data, download.mime, download.filename);
}

function saveToServer(name) {
    if (name && name.trim() != "") MODEL_NAME = name; else MODEL_NAME = null;
    publishMod.openDialog();
}

function htmlLoaded(hostID) {
    const shadowRoot = CONTEXT_MENU.getShadowRootByHostId(hostID), 
        inputDiskName = shadowRoot.querySelector("input#diskname"), inputServerName = shadowRoot.querySelector("input#servername");
    if ((!inputDiskName)||(!inputServerName)) return;
    inputDiskName.value = MODEL_NAME||""; inputServerName.value = MODEL_NAME||""; inputDiskName.focus();
}

function _convert18NtoRenderData() {
    const lang = i18n.getSessionLang(), retObject = {i18n:{}};
    for (const key in I18N) retObject.i18n[key] = I18N[key][lang];
    return retObject;
}

function _nomalizeName(name)  {
    const fixedName = name.endsWith(".monkruls.json") ? name.substring(0, name.length-".monkruls.json".length) : name;
    return fixedName;
}

export const save = {init, clicked, getImage, getHelpText, getDescriptiveName, saveToDisk, saveToServer, htmlLoaded}
