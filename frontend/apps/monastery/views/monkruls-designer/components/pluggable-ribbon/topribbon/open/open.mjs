/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {view} from "../../../../view.mjs"
import {i18n} from "/framework/js/i18n.mjs";
import {util} from "/framework/js/util.mjs";
import {blackboard} from "/framework/js/blackboard.mjs";

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_FILE_UPLOADED = "FILE_UPLOADED", 
    CONTEXT_MENU = window.monkshu_env.components["context-menu"], CONTEXT_MENU_ID = "contextmenumain";
let IMAGE, I18N;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/open.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/open.i18n.mjs`)).i18n; 
    return true;
}

async function clicked(element, event) {
    event.stopPropagation(); const lang = i18n.getSessionLang();
    const boundingRect = element.getBoundingClientRect(), x = boundingRect.x, y = boundingRect.bottom;
    const menus = {}; menus[`${I18N.NEW[lang]}`] = _=>view.reset(); menus[`${I18N.OPEN_FROM_DISK[lang]}`] = _=>_uploadFile();
    CONTEXT_MENU.showMenu(CONTEXT_MENU_ID, menus, x, y, 0, 5);
}

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

const allowDrop = event => _isDraggedItemAJSONFile(event);

async function droppedFile(event) {
    event.preventDefault(); if (!_isDraggedItemAJSONFile(event)) return; // can't support whatever was dropped
    const file = event.dataTransfer.items[0].getAsFile(); 
    try {
        const {name, data} = await util.getFileData(file);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}

async function _uploadFile() {
    try {
        const {name, data} = await util.uploadAFile("application/json");
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}

const _isDraggedItemAJSONFile = event => event.dataTransfer.items?.length && event.dataTransfer.items[0].kind === "file"
    && event.dataTransfer.items[0].type.toLowerCase() === "application/json";

export const open = {init, clicked, getImage, getHelpText, getDescriptiveName, allowDrop, droppedFile}