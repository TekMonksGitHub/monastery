/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import {util} from "/framework/js/util.mjs";
import {application} from "../../../../../../js/application.mjs";

const PLUGIN_PATH = util.getModulePath(import.meta);
let IMAGE, I18N;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/exit.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/exit.i18n.mjs`)).i18n; 
    return true;
}

const clicked = _=> application.exit();

const getImage = _ => IMAGE;

const getHelpText = (lang=en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang=en) => I18N.DESCRIPTIVE_NAME[lang];

export const exit = {init, clicked, getImage, getHelpText, getDescriptiveName}