/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import { view } from "../../../../view.mjs"
import { i18n } from "/framework/js/i18n.mjs";
import { util } from "/framework/js/util.mjs";
import { blackboard } from "/framework/js/blackboard.mjs";
import { serverManager } from "../../../../js/serverManager.js";
import { page_generator } from "/framework/components/page-generator/page-generator.mjs";

let xCounter = 100, yCounter = 30;

const PLUGIN_PATH = util.getModulePath(import.meta), MSG_FILE_UPLOADED = "FILE_UPLOADED",
    CONTEXT_MENU = window.monkshu_env.components["context-menu"], CONTEXT_MENU_ID = "contextmenumain",
    DIALOG_RET_PROPS = ["name", "server", "port", "adminid", "adminpassword"],
    DIALOG = window.monkshu_env.components["dialog-box"], VIEW_PATH = `${PLUGIN_PATH}/../../../../`;
let IMAGE, I18N, saved_props;

async function init() {
    const svgSource64 = btoa(await (await fetch(`${PLUGIN_PATH}/open.svg`)).text());
    IMAGE = "data:image/svg+xml;base64," + svgSource64;
    I18N = (await import(`${PLUGIN_PATH}/open.i18n.mjs`)).i18n;
    return true;
}

async function clicked(element, event) {
    event.stopPropagation(); const lang = i18n.getSessionLang();
    const menus = {}; menus[`${I18N.NEW[lang]}`] = _ => view.reset(); menus[`${I18N.OPEN_FROM_DISK[lang]}`] = _ => _uploadFile();
    menus[`${I18N.OPEN_FROM_SERVER[lang]}`] = _ => _getFromServer();
    const boundingRect = element.getBoundingClientRect(), x = boundingRect.x, y = boundingRect.bottom;
    CONTEXT_MENU.showMenu(CONTEXT_MENU_ID, menus, x, y, 0, 5);
}

const getImage = _ => IMAGE;

const getHelpText = (lang = en) => I18N.HELP_TEXTS[lang];

const getDescriptiveName = (lang = en) => I18N.DESCRIPTIVE_NAME[lang];

const allowDrop = event => _isDraggedItemAJSONFile(event);

async function droppedFile(event) {
    event.preventDefault(); if (!_isDraggedItemAJSONFile(event)) return; // can't support whatever was dropped
    const file = event.dataTransfer.items[0].getAsFile();
    try {
        const { name, data } = await util.getFileData(file);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, { name, data });
    } catch (err) { LOG.error(`Error opening file: ${err}`); }
}

async function _uploadFile() {
    try {
        let { name, data } = await util.uploadAFile("application/json");
        data = JSON.stringify(_apiclParser(data));
        console.log(data);
        blackboard.broadcastMessage(MSG_FILE_UPLOADED, { name, data });
    } catch (err) { LOG.error(`Error opening file: ${err}`); }
}

async function _getFromServer() {
    const pageFile = util.resolveURL(`${VIEW_PATH}/dialogs/dialog_openserver.page`);

    let html = await page_generator.getHTML(new URL(pageFile));

    const dom = new DOMParser().parseFromString(html, "text/html");
    if (saved_props) for (const id in saved_props) dom.querySelector(`#${id}`).setAttribute("value", saved_props[id]);
    html = dom.documentElement.outerHTML;   // this creates HTML with default values set from the previous run

    // now show and run the dialog
    const dialogPropertiesPath = util.resolveURL(`${VIEW_PATH}/dialogs/dialogPropertiesopenserver.json`);
    DIALOG.showDialog(dialogPropertiesPath, html, null, DIALOG_RET_PROPS,
        async (typeOfClose, result) => {
            if (typeOfClose == "submit") {
                saved_props = util.clone(result, ["adminpassword"]); // don't save password, for security
                const selectedModel = result.packages, readModelResult = serverManager.getModel(selectedModel, result.server,
                    result.port, result.adminid, result.adminpassword);
                if (!pubResult.result) DIALOG.showError(dialogElement, await i18n.get(readModelResult.key));
                else blackboard.broadcastMessage(MSG_FILE_UPLOADED, {
                    name: selectedModel,
                    data: readModelResult.model
                });
            }
        });
}

const _apiclParser = function (data) {
    let dependencies = [];
    let counter = 1;
    const apicl = JSON.parse(data);
    let result = Object.keys(apicl).map(e => {
        return _parseCommand(apicl[e], counter++, dependencies);
    });

    return { "apicl": [{ "commands": result, "name": "commands", "id": counter }] }

}
const _parseCommand = function (command, counter, dependencies) {

    let ret = {}, nodeNameAsSubCmd = '';
    let cmd = command.split(' ');
    let nodeName = cmd[0].toLowerCase();

    if (nodeName == 'chgvar') {
        nodeNameAsSubCmd = _checkChgvarSubCommand(command).toLowerCase() || nodeName;
    }
    console.log(nodeNameAsSubCmd);

    let isThisSubCmd = (nodeNameAsSubCmd) ? true : false;
    nodeName = (nodeNameAsSubCmd) ? nodeNameAsSubCmd : nodeName;

    ret["nodeName"] = nodeName;
    ret["description"] = nodeName.charAt(0).toUpperCase() + nodeName.slice(1).toLowerCase();



    if (nodeName == 'strapi' || nodeName == 'sndapimsg') { ret["listbox"] = _parseStrapi(command) }
    else if (nodeName == 'scr') { ret = _parseScr(command, isThisSubCmd) }
    else if (nodeName == 'rest') { ret = _parseRest(command, isThisSubCmd) }
    else if (nodeName == 'log') { ret["log"] = _parseLog(command) }
    else if (nodeName == 'jsonata') { ret = _parseJsonata(command, isThisSubCmd) }
    else if (nodeName == 'dsppfm') { ret = _parseDsppfm(command, isThisSubCmd) }
    else if (nodeName == 'chgdtaara') { ret = _parseChgdtaara(command) }
    else if (nodeName == 'rtvdtaara') { ret = _parseRtvdtaara(command) }
    else if (nodeName == 'qsnddtaq') { ret = _parseQsnddtaq(command) }
    else if (nodeName == 'qrcvdtaq') { ret = _parseQrcvdtaq(command) }
    else if (nodeName == 'call') { ret = _parseCall(command) }
    else if (nodeName == 'runsqlprc') { ret = _parseRunsqlprc(command) }
    else if (nodeName == 'map') { ret = _parseMap(command, isThisSubCmd) }
    else if (nodeName == 'substr') { ret = _parseSubstr(command, isThisSubCmd) }
    else if (nodeName == 'chgvar') { ret = _parseChgvar(command) }
    ret["id"] = _getUniqueID();
    dependencies.push(ret.id);
    if (counter >= 2) {
        ret["dependencies"] = _putDependency(dependencies[counter - 2]);
        ret["x"] = xCounter;
        ret["y"] = yCounter;
        xCounter = xCounter + 100
    }
    return ret;
}

const _putDependency = function (counter) {
    return [`${counter}`];
};

const _checkChgvarSubCommand = function (command) {
    let subCommands = ['SCR', 'REST', 'JSONATA', 'DSPPFM', 'MAP', 'SUBSTR'];
    let nodeName = "";
    subCommands.forEach((subCommand) => {
        if (command.includes(subCommand)) { nodeName = subCommand; }
    })
    return nodeName;
};


const _parseStrapi = function (command) {
    // regex to return the string inside round braces ()
    return command.match(/\(([^)]+)\)/)[1].split(" ").filter(Boolean).map(s => s.slice(1));
};
const _parseCall = function (command) {
    //"4"    : "CALL       PGM(RVKAPOOR1/COSTCLP2)            PARM('&COST' '&QTY')",
    let ret = {};
    ret["nodeName"] = "call";
    ret["description"] = "Call";
    let programName = _patternMatch(command, /PGM\(([^)]+)\)/, 0).split("/");
    ret["library"] = programName[0];
    ret["program"] = programName[1];
    ret["listbox"] = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean).map(s => s.slice(2, s.length - 1));
    return ret
};
const _parseRunsqlprc = function (command) {
    //"3": "RUNSQLPRC  PRC(RVKAPOOR1/COSTCLP)          PARM(&COST &QTY &TCOST &FLAG)",
    let ret = {};
    ret["nodeName"] = "runsqlprc";
    ret["description"] = "Runsqlprc";
    let procedureName = _patternMatch(command, /PRC\(([^)]+)\)/, 0).split("/");
    ret["library"] = procedureName[0];
    ret["procedure"] = procedureName[1];
    ret["listbox"] = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean).map(s => s.slice(1));
    return ret
};
const _parseLog = function (command) {
    // regex to return the string inside round braces ()
    return command.match(/\(([^)]+)\)/)[1]
};

const _parseChgdtaara = function (command) {
    let ret = {};
    ret["nodeName"] = "chgdtaara";
    ret["description"] = "Chgdtaara";
    let dataAreaName = _patternMatch(command, /DTAARA\(([^)]+)\)/, 0).split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["dropdown"] = _patternMatch(command, /TYPE\(([^)]+)\)/, 1) == "CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _patternMatch(command, /VALUE\(([^)]+)\)/, 1)
    return ret
};

const _parseChgvar = function (command) {
    let ret = {};
    ret["nodeName"] = "chgvar";
    ret["description"] = "Chgvar";
    console.log( _patternMatch(command, /VALUE\(\'([^)]+)\'\)/, 0));
    ret["listbox"] = [_patternMatch(command, /VAR\(([^)]+)\)/, 1), _patternMatch(command, /VALUE\(\'([^)]+)\'\)/, 0)]
    return ret
};

const _parseRtvdtaara = function (command) {
    //    "RTVDTAARA DTAARA(A/B) TYPE(*CHAR) RTNVAR(&c)"

    let ret = {};
    ret["nodeName"] = "rtvdtaara";
    ret["description"] = "Rtvdtaara";
    let dataAreaName = _patternMatch(command, /DTAARA\(([^)]+)\)/, 0).split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["dropdown"] = _patternMatch(command, /TYPE\(([^)]+)\)/, 1) == "CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _patternMatch(command, /RTNVAR\(([^)]+)\)/, 1)
    return ret
};
const _parseQrcvdtaq = function (command) {
    //  "2": "QRCVDTAQ PARM(A/B c true &e)"

    let ret = {};
    ret["nodeName"] = "qrcvdtaq";
    ret["description"] = "Qrcvdtaq";
    let qrcvdtaqParm = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean);
    ret["library"] = qrcvdtaqParm[0].split("/")[0];
    ret["queue"] = qrcvdtaqParm[0].split("/")[1];
    ret["wait"] = qrcvdtaqParm[1];
    ret["dropdown"] = qrcvdtaqParm[2] == "true" ? "true" : "false";
    ret["data"] = qrcvdtaqParm[3].slice(1);
    return ret
};
const _parseQsnddtaq = function (command) {
    //   "2": "QSNDDTAQ PARM(C/D &e )"

    let ret = {};
    ret["nodeName"] = "qsnddtaq";
    ret["description"] = "Qsnddtaq";
    let qsnddtaqParm = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean);
    ret["libraryname"] = qsnddtaqParm[0].split("/")[0];
    ret["dataqueue"] = qsnddtaqParm[0].split("/")[1];
    ret["value"] = qsnddtaqParm[1].slice(1);
    return ret
};


const _parseScr = function (command, isThisSubCmd) {

    let ret = {};
    let subCmdVar, readParams, keysParams;
    if (isThisSubCmd) {
        // convert it as subcommand
        //CHGVAR     VAR(&val)     VALUE(SCR    NAME(SESS1)    READ(6,7,6,80))
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")").slice(1);
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }

    subCmdVar = (subCmdVar) ? subCmdVar : command;

    ret["session"] = _subStrUsingNextIndex(subCmdVar, "NAME(", ")");
    if (subCmdVar.includes("READ")) {
        readParams = _subStrUsingLastIndex(subCmdVar, "READ(", ")");
        let allReads = [];
        readParams.split(':').forEach(function (value) {
            allReads.push(value.trim().split(','));
        });

        ret["nodeName"] = "scrread";
        ret["description"] = "Scrread";
        ret["listbox"] = allReads;
    } else if (subCmdVar.includes("KEYS")) {
        keysParams = _subStrUsingLastIndex(subCmdVar, "KEYS(", ")");
        let allKeys = [];
        keysParams.split(':').forEach(function (value) {
            allKeys.push(value.trim().split(','));
        });
        ret["nodeName"] = "scrkeys";
        ret["description"] = "Scrkeys";
        ret["listbox"] = allKeys;

    } else if (subCmdVar.includes("START")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "start";
    } else if (subCmdVar.includes("STOP")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "stop";
    } else if (subCmdVar.includes("RELEASE")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "release";
    }
    return ret;
};

const _parseJsonata = function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        // "CHGVAR     VAR(&RESULT)    VALUE(JSONATA EXPRESSION(&expression))",
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")").slice(1);
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    ret["jsonata"] = _subStrUsingNextIndex(subCmdVar, "EXPRESSION(", ")");
    ret["nodeName"] = "jsonata";
    ret["description"] = "Jsonata";
    return ret;
};
const _parseMap = function (command, isThisSubCmd) {
    //"2":   "CHGVAR     VAR(&copybook)          VALUE(MAP DO(&token:0:-1:1,&lifeprofiles[0].name:40:-1:1,&lifeprofiles[1].occupationName:60:-1:1))",
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")").slice(1);
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    let maps = _subStrUsingLastIndex(subCmdVar, "DO(", ")").split(",");
    ret["listbox"] = maps.map(map => {
        const values = map.split(":");
        const result = values.map(m => {
            if (m.includes("&")) m = m.slice(1);
            if (m.includes(".")) m = m.slice(1);
            return m
        })
        return result
    })
    ret["nodeName"] = "map";
    ret["description"] = "Map";
    return ret;
};
const _parseSubstr = function (command, isThisSubCmd) {
    //"L4":  "CHGVAR     VAR(&COMP_CODE)         VALUE(SUBSTR DO(&valThisLoop:0:4))",
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    let substr = _subStrUsingLastIndex(subCmdVar, "DO(", ")").split(",");
    ret["listbox"] = substr.map(e => {
        const values = e.split(":");
        values.unshift(_subStrUsingNextIndex(command, "VAR(", ")"))
        const result = values.map(m => {
            if (m.includes("&")) m = m.slice(1);
            return m
        })
        return result
    })
    ret["nodeName"] = "substr";
    ret["description"] = "Substr";
    return ret;
};
const _parseDsppfm = function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        // "5"    : "CHGVAR     VAR(&data) VALUE(DSPPFM FILE(RVKAPOOR1/LINEOUT) MBR(LINEOUT))",
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")").slice(1);
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")");
    }

    let file = _subStrUsingNextIndex(subCmdVar, "FILE(", ")").
    ret["libraryname"] = file[0];
    ret["physical"] = file[1];
    ret["member"] = _subStrUsingLastIndex(subCmdVar, "MBR(", ")") ? _subStrUsingLastIndex(subCmdVar, "MBR(", ")"):"";
    ret["nodeName"] = "dsppfm";
    ret["description"] = "Dsppfm";
    return ret;
};
const _subStrUsingLastIndex = function (str, startStr, nextIndex) {
    return str.substring(str.indexOf(startStr) + startStr.length, str.lastIndexOf(nextIndex));
};

const _subStrUsingNextIndex = function (str, startStr, lastIndex) {
    return str.substring(str.indexOf(startStr) + startStr.length, str.indexOf(lastIndex));
};

const _parseRest = function (command, isThisSubCmd) {
    let ret = {};
    ret["nodeName"] = "rest";
    ret["description"] = "Rest";
    if (isThisSubCmd) {
        // convert it as main command
        // "2"    : "CHGVAR     VAR(&REST_RESP)    VALUE(REST  URL(http://dummy.restapiexample.com/api/v1/create) METHOD(POST) HEADERS() PARM(&REQUEST))",
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")").slice(1);
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    // if used as sub command
    //REST  URL(http://dummy.restapiexample.com/api/v1/create) METHOD(POST) HEADERS() PARM(&REQUEST)

    ret["url"] = _patternMatch(command, /URL\(([^)]+)\)/, 0);
    ret["method"] = _patternMatch(command, /METHOD\(([^)]+)\)/, 0);
    ret["parameter"] = _patternMatch(command, /PARM\(([^)]+)\)/, 1);
    ret["headers"] = _patternMatch(command, /HEADERS\(([^)]+)\)/, 0);
    return ret

};
const _patternMatch = function (string, pattern, slicePosition) {

    return string.match(pattern) ? string.match(pattern)[1].slice(slicePosition) : "";
}

const _getUniqueID = _ => `${Date.now()}${Math.random() * 100}`;

const _isDraggedItemAJSONFile = event => event.dataTransfer.items?.length && event.dataTransfer.items[0].kind === "file"
    && event.dataTransfer.items[0].type.toLowerCase() === "application/json";

export const open = { init, clicked, getImage, getHelpText, getDescriptiveName, allowDrop, droppedFile }