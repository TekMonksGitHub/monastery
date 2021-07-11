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
    blackboard.registerListener(APP_CONSTANTS.MSG_OBJECT_DRAGGED, message => {     // allow dragging and dropping files
        if (_isDraggedItemAJSONFile(message)) message.dataTransfer.dropEffect = 'copy'} );  
    blackboard.registerListener(APP_CONSTANTS.MSG_OBJECT_DROPPED, message => droppedFile(message));
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

async function droppedFile(event) {
    event.preventDefault(); if (!_isDraggedItemAJSONFile(event)) return; // can't support whatever was dropped
    const file = event.dataTransfer.items[0].getAsFile(); 
    try {
        const {name, data} = await util.getFileData(file);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, {name, data});
    } catch (err) {LOG.error(`Error opening file: ${err}`);}
}

const _isDraggedItemAJSONFile = event => event.dataTransfer.items?.length && event.dataTransfer.items[0].kind === "file"
    && event.dataTransfer.items[0].type.toLowerCase() === "application/json";

export const open = {init, clicked, getImage, getHelpText, getDescriptiveName}