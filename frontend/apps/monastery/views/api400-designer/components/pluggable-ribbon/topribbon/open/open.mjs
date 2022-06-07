/* 
 * (C) 2020 TekMonks. All rights reserved.
 */
import { view } from "../../../../view.mjs"
import { i18n } from "/framework/js/i18n.mjs";
import { util } from "/framework/js/util.mjs";
import { blackboard } from "/framework/js/blackboard.mjs";
import { serverManager } from "../../../../js/serverManager.js";
import { page_generator } from "/framework/components/page-generator/page-generator.mjs";

let xCounter, yCounter,counter=0,dependencies=[],result = [],storeIDS={},flagNOthenYESelse=0;
let apicl={},initAPICL={},commandCounter = [],nextElseDependency=[];
;

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
        data = JSON.stringify(await apiclParser(data));
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
                const selectedModel = result.packages, readModelResult = serverManager.getApicl(selectedModel, result.server,
                    result.port, result.adminid, result.adminpassword);
                if (!pubResult.result) DIALOG.showError(dialogElement, await i18n.get(readModelResult.key));
                else blackboard.broadcastMessage(MSG_FILE_UPLOADED, {
                    name: selectedModel,
                    data: readModelResult.model
                });
            }
        });
}

async function apiclParser(data) {
    xCounter = 100;
    yCounter = 80;
    dependencies = [];
    commandCounter = [];
    initAPICL = {};
    storeIDS={};
    apicl = JSON.parse(data);
    initAPICL = _initializeAPICLIndex(JSON.parse(data));
    console.log(initAPICL);
    let modelObject;
    result = [];
    for (let key in apicl) {    
        console.log(initAPICL);    
        if (!initAPICL[key]) {
            console.log(apicl[key]);
            modelObject = await _parseCommand(apicl[key], counter++, dependencies,key);
            console.log("modelObject"); console.log(modelObject);
            console.log("modelObject length"); console.log(Object.keys(modelObject).length);
            if (Object.keys(modelObject).length>0) { result.push(modelObject); initAPICL[key] = modelObject.id; }
            
        }
        console.log(result);
    } 
    console.log("After For Loop");
    console.log(initAPICL);
    let resolvedPromises = await Promise.all(result)
    let finalCommands = _correctAPICL(resolvedPromises);
     console.log(storeIDS);
    counter=0;
    return { "apicl": [{ "commands": finalCommands, "name": "commands", "id": counter }] }
}

const _correctAPICL = function (result) {
    
    let finalAPICL = [];
    for (let key in result) {  if (Object.keys(result[key]).length>0) { finalAPICL.push(result[key]); } }
    console.log("finalAPICL"); console.log(finalAPICL); 
    return finalAPICL;
}

const _initializeAPICLIndex = function (initApicl) {
    for (let key in initApicl) {
        initApicl[key] = false;
    } 
    return initApicl;
}

const _addCommandCount = function (command) {
    commandCounter[command] = (commandCounter[command]>=1) ? ++commandCounter[command] : 1; 
    return commandCounter[command];

}

const _parseCommand = async function (command, counter, dependencies,key) {

    
    let ret = {}, nodeNameAsSubCmd = '', attr;
    let cmd = command.split(' ');
    let nodeName = cmd[0].toLowerCase();
    if (nodeName == "runjs" && _patternMatch(command, /MOD\(([^)]+)\)/, 0) != "") nodeName = "mod";
    if (nodeName == "if") nodeName = "condition";
    if (nodeName == 'chgvar') {
        let nodenameAsSubCmd = await _checkChgvarSubCommand(command);
        nodeNameAsSubCmd = nodenameAsSubCmd.toLowerCase() || nodeName;
    }
    let isThisSubCmd = (nodeNameAsSubCmd) ? true : false;
    nodeName = (nodeNameAsSubCmd) ? nodeNameAsSubCmd : nodeName;

    ret["nodeName"] = nodeName;
    

    if (nodeName == 'strapi' || nodeName == 'sndapimsg') { ret["listbox"] = await _parseStrapi(command) }
    else if (nodeName == 'scr') { ret = await _parseScr(command, isThisSubCmd,key) }
    else if (nodeName == 'rest') { ret = await _parseRest(command, isThisSubCmd) }
    else if (nodeName == 'log') { ret["log"] = await _parseLog(command) }
    else if (nodeName == 'jsonata') { ret = await _parseJsonata(command, isThisSubCmd) }
    else if (nodeName == 'dsppfm') { ret = await _parseDsppfm(command, isThisSubCmd) }
    else if (nodeName == 'chgdtaara') { ret = await _parseChgdtaara(command) }
    else if (nodeName == 'rtvdtaara') { ret = await _parseRtvdtaara(command) }
    else if (nodeName == 'qsnddtaq') { ret = await _parseQsnddtaq(command) }
    else if (nodeName == 'qrcvdtaq') { ret = await _parseQrcvdtaq(command) }
    else if (nodeName == 'call') { ret = await _parseCall(command) }
    else if (nodeName == 'runsqlprc') { ret = await _parseRunsqlprc(command) }
    else if (nodeName == 'map') { ret = await _parseMap(command, isThisSubCmd) }
    else if (nodeName == 'substr') { ret = await _parseSubstr(command, isThisSubCmd) }
   else if (nodeName == 'chgvar') { ret = await _parseChgvar(command) }
    else if (nodeName == 'runsql') { ret = await _parseRunsql(command, isThisSubCmd) }
    else if (nodeName == 'runjs') { ret = await _parseRunjs(command, isThisSubCmd) }
    else if (nodeName == 'mod') { ret = await _parseMod(command) }
    else if (nodeName == 'endapi') { ret = await _parseEndapi()}
    else if (nodeName == 'condition') { ret = await _parseIfCondition(command,key)}
    else if (nodeName == 'iftrue') { ret = await _parseIfTrue(command)}
    else if (nodeName == 'iffalse') { ret = await _parseIfFalse(command)}
    else if (nodeName == 'goto') { ret = await _parseGoto(command)}

    if (ret && ret.nodeName) { attr = await _setAttribute(ret.nodeName,key); }
    return { ...ret, ...attr };
}

const _setAttribute = async function (nodeName,key) {
    let attribute={};
    let description = nodeName.charAt(0).toUpperCase() + nodeName.slice(1).toLowerCase();
    attribute["id"] = _getUniqueID();
    if (description == 'Iftrue'||description == 'Iffalse') {  attribute["description"] = description;
    } else { attribute["description"] = `${description}${_addCommandCount(description)}`;  }
    
    storeIDS[key]=attribute.id
    dependencies.push(attribute.id);
    
    if (counter >= 2) {
        if(xCounter%1200==0 && yCounter%80 == 0){ xCounter=100;yCounter=yCounter+80};
        attribute["dependencies"] = _putDependency(dependencies[counter - 2],nodeName);
        attribute["x"] = xCounter;
        attribute["y"] = yCounter;
        xCounter = xCounter + 100
    }
    return attribute;
};

const _putDependency = function (nodeid,nodeName) {
    
    let dependencyId;
    if (nextElseDependency.length>0) {dependencyId = nextElseDependency[0];  nextElseDependency.pop(); } 
    else { 
        dependencyId = nodeid;
        if (flagNOthenYESelse!=0 && nodeName!='endapi') { dependencyId = flagNOthenYESelse; flagNOthenYESelse=0; }
    }
    
    return [`${dependencyId}`];
};

const _checkChgvarSubCommand = async function (command) {
    let subCommands = ['SCR', 'REST', 'JSONATA', 'DSPPFM', 'MAP', 'SUBSTR', 'RUNSQL', 'RUNJS'];
    let nodeName = "";
    subCommands.forEach((subCommand) => {
        if (command.includes(subCommand)) { nodeName = subCommand; }
    })
    return nodeName;
};

const _parseStrapi = async function (command) {
    return command.match(/\(([^)]+)\)/) ? JSON.stringify(command.match(/\(([^)]+)\)/)[1].split(" ").filter(Boolean)) : JSON.stringify(['']);
};

const _parseEndapi = async function () {
    let ret = {};
    ret["nodeName"] = "endapi";
    ret["description"] = "Endapi";
    return ret;
};
const _parseGoto = async function (command) {
    let ret = {};

    let gotoIndex = command.split(/\s+/)[1];
    console.log(`Goto Index : ${gotoIndex}`);

    if (gotoIndex) {
        ret["nodeName"] = "goto";
        ret["description"] = `Goto${_addCommandCount(ret["nodeName"])}`;
        let attr = await _setAttribute("goto");
        if (initAPICL[gotoIndex]!=false) {
            let position = await _findPosition(initAPICL[gotoIndex]);
            result[position].dependencies.push(attr.id);
            result.push({ ...ret, ...attr });
            return;
        }
        result.push({ ...ret, ...attr });
        let i=gotoIndex;
        do {
            console.log(apicl[i]);
            let object = await _parseCommand(apicl[i], counter++, dependencies);
            console.log(object);
            console.log(object);
            if (object && object.nodeName) { 
                result.push(object); initAPICL[i] = object.id; 
            }
            console.log(initAPICL);
        } while(apicl[i] && apicl[i++]!='ENDAPI');
    }
};

const _parseIfCondition = async function (command,key) {
    let ret = {},afterTrueCmd;
    ret["nodeName"] = "condition";
    ret["condition"] = _patternMatch(command, /COND\(([^)]+)\)/, 0);
    ret["description"] = `Condition${_addCommandCount(ret["nodeName"])}`;

    let attr = await _setAttribute("condition");
    result.push({ ...ret, ...attr });
    initAPICL[key] = attr.id; 

    let iftrue='',iffalse='';
    if(command.includes("ELSE")){
        let getThen = command.match(/THEN\(.+\)/)[0].split("ELSE")[0].trim();
        iftrue = _subStrUsingLastIndex(getThen, "THEN(", ")");
        iffalse = _subStrUsingLastIndex(command, "ELSE(", ")");
    }
    else iftrue = _subStrUsingLastIndex(command, "THEN(", ")");

    if (iftrue!='') { 
        result.push(await _parseCommand("iftrue", counter++, dependencies)); 
        afterTrueCmd = await _parseCommand(iftrue.trim(), counter++, dependencies);
        result.push(afterTrueCmd); 
    }
    xCounter=attr.x;
    yCounter=attr.y+80;
    let ModelObjectOfIffalse = await _parseCommand("iffalse", counter++, dependencies);
    ModelObjectOfIffalse.dependencies=[attr.id];

    result.push( ModelObjectOfIffalse); 
    if (iffalse.trim()!='') {  
        result.push(await _parseCommand(iffalse.trim(), counter++, dependencies)); 
    } else {
        nextElseDependency.push(ModelObjectOfIffalse.id);
    }

    // when THEN do not have GOTO and ELSE has GOTO
    if (iftrue.trim().split(" ")[0]!="GOTO" && iffalse.trim().split(" ")[0]=="GOTO" ) {
        console.log(afterTrueCmd);        
        flagNOthenYESelse = afterTrueCmd.id;        
    }

    return {};
};


const _findPosition = async function (id) {

    let pos=0;
    for (pos in result) { if (result[pos].id==id) {  return pos; } }

}

const _parseCall = async function (command) {
    let ret = {};
    ret["nodeName"] = "call";
    ret["description"] = "Call";
    let programName = _patternMatch(command, /PGM\(([^)]+)\)/, 0).split("/");
    
    ret["library"] = programName[0];
    ret["program"] = programName[1];
    
    ret["listbox"] = JSON.stringify(_patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean));
    return ret;
};

const _parseRunsqlprc = async function (command) {
    let ret = {},finalValues=[],paramAtrributes,paramType,otherParams,parameter,paramNature;
    // &INOUT&NUM:CHAR
    
    ret["nodeName"] = "runsqlprc";
    ret["description"] = "Runsqlprc";
    let procedureName = _patternMatch(command, /PRC\(([^)]+)\)/, 0).split("/");
    ret["library"] = procedureName[0];
    ret["procedure"] = procedureName[1];
    let listOfParams =  _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(" ").filter(Boolean);
    for(let param of listOfParams ){
        paramType='',parameter='',paramNature='';
      if(param.includes(":")){
            paramAtrributes=  param.split(":");
            paramType =`:${paramAtrributes[1]}`;
            otherParams = paramAtrributes[0].split("&").filter(Boolean);
            parameter = `&${otherParams[1]}`;
            paramNature= `&${otherParams[0]}` 
      }
      else parameter = param;
      finalValues.push([paramNature,parameter,paramType])
    }
    ret["listbox"] = JSON.stringify(finalValues);
    return ret;
};
const _parseRunsql = async function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    subCmdVar = (subCmdVar) ? subCmdVar : command;
    ret["nodeName"] = "runsql";
    ret["description"] = "Runsql";
    if (subCmdVar.includes("TRIM(TRUE)")) subCmdVar = subCmdVar.replace("TRIM(TRUE)", "");
    if (subCmdVar.includes("BATCH(TRUE)")) subCmdVar = subCmdVar.replace("BATCH(TRUE)", "");
    let sqlObj = _subStrUsingLastIndex(subCmdVar, "SQL(", ")")
    ret["sql"] = sqlObj;
    return ret;
};
const _parseRunjs = async function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    subCmdVar = (subCmdVar) ? subCmdVar : command;
    ret["nodeName"] = "runjs";
    ret["description"] = "Runjs";
    let jsObj = _subStrUsingLastIndex(subCmdVar, "JS(", ")");
    ret["code"] = jsObj;
    return ret;
};

const _parseLog = async function (command) {
    return command.match(/\(([^)]+)\)/) ? command.match(/\(([^)]+)\)/)[1] : "";
};
async function _parseMod(command) {
    let ret = {};
    ret["nodeName"] = "mod";
    ret["description"] = "Mod";
    ret["result"] = _patternMatch(command, /MOD\(([^)]+)\)/, 0);
    const jsData = await serverManager.getModule(_patternMatch(command, /MOD\(([^)]+)\)/, 0));
    ret["code"] = jsData.mod;
    return ret;
};


const _parseChgdtaara = async function (command) {
    let ret = {};
    ret["nodeName"] = "chgdtaara";
    ret["description"] = "Chgdtaara";
    let dataAreaName = _patternMatch(command, /DTAARA\(([^)]+)\)/, 0).split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["dropdown"] = _patternMatch(command, /TYPE\(([^)]+)\)/, 1) == "CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _patternMatch(command, /VALUE\(([^)]+)\)/, 0);
    return ret;
};

const _parseChgvar = async function (command) {
    let ret = {};
    ret["nodeName"] = "chgvar";
    ret["description"] = "Chgvar";
    ret["variable"] =_patternMatch(command, /VAR\(([^)]+)\)/, 0);
    ret["value"] = _patternMatch(command, /VALUE\(([^)]+)\)/, 0)
    return ret;
};


const _parseRtvdtaara = async function (command) {
    let ret = {};
    ret["nodeName"] = "rtvdtaara";
    ret["description"] = "Rtvdtaara";
    let dataAreaName = _patternMatch(command, /DTAARA\(([^)]+)\)/, 0).split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["dropdown"] = _patternMatch(command, /TYPE\(([^)]+)\)/, 1) == "CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _patternMatch(command, /RTNVAR\(([^)]+)\)/, 0);
    return ret ;
};

const _parseQrcvdtaq = async function (command) {
    let ret = {};
    ret["nodeName"] = "qrcvdtaq";
    ret["description"] = "Qrcvdtaq";
    let qrcvdtaqParm = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(/\s+/).filter(Boolean);
    ret["library"] = qrcvdtaqParm[0].split("/")[0];
    ret["queue"] = qrcvdtaqParm[0].split("/")[1];
    ret["wait"] = qrcvdtaqParm[1];
    ret["dropdown"] = qrcvdtaqParm[2] == "true" ? "true" : "false";
    ret["data"] = qrcvdtaqParm[3].includes("&")?qrcvdtaqParm[3]: qrcvdtaqParm.slice(3).join(" ");
    return ret;
};

const _parseQsnddtaq = async function (command) {
    let ret = {};
    ret["nodeName"] = "qsnddtaq";
    ret["description"] = "Qsnddtaq";
    let qsnddtaqParm = _patternMatch(command, /PARM\(([^)]+)\)/, 0).split(/\s+/).filter(Boolean);
    ret["libraryname"] = qsnddtaqParm[0].split("/")[0];
    ret["dataqueue"] = qsnddtaqParm[0].split("/")[1];
    ret["value"] = qsnddtaqParm[1].includes("&")?qsnddtaqParm[1]:qsnddtaqParm.slice(1).join(" ");
    return ret;
};

const _parseScr = async function (command, isThisSubCmd,key) {

    let ret = {};
    let subCmdVar, readParams, keysParams;
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    subCmdVar = (subCmdVar) ? subCmdVar : command;
    ret["session"] = _subStrUsingNextIndex(subCmdVar, "NAME(", ")");
    if (subCmdVar.includes("START")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "start";

        if (subCmdVar.includes("KEYS")) {
            let attr;
            if (ret && ret.nodeName) {  attr = await _setAttribute(ret.nodeName,key); }
            result.push({ ...ret, ...attr }); 
            initAPICL[key] = attr.id; 
            
            let cmdAfterRemoveScrStart = command.replace('START','');
            result.push(await _parseCommand(cmdAfterRemoveScrStart, counter++, dependencies));

            return {};
        }

    } else if (subCmdVar.includes("STOP")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "stop";
    } else if (subCmdVar.includes("RELEASE")) {
        ret["nodeName"] = "scrops";
        ret["description"] = "Scrops";
        ret["radiobutton"] = "release";
    } else if (subCmdVar.includes("READ")) {
        let allReads = [];
        let values;
        readParams = _subStrUsingLastIndex(subCmdVar, "READ(", ")");    
        readParams.split(':').forEach(function (value) {
            values = value.trim().split(',')
            for (let j = 0; j < 3; j++) {
                values[j] = values[j] ? values[j].trim() : '';
            }
            allReads.push(values)
        });
        ret["nodeName"] = "scrread";
        ret["description"] = "Scrread";
        ret["listbox"] = JSON.stringify(allReads);
    } else if (subCmdVar.includes("KEYS")) {
        keysParams = _patternMatch(subCmdVar, /KEYS\(([^)]+)\)/, 0);
        
        let allKeys = [];
        let values;
        keysParams.split(':').forEach(function (value) {
            values = value.trim().split(',');
            for (let j = 0; j < 3; j++) {
                values[j] = values[j] ? values[j].trim() : '';
            }
            allKeys.push(values);
        });
        ret["nodeName"] = "scrkeys";
        ret["description"] = "Scrkeys";
        ret["listbox"] = JSON.stringify(allKeys);

    }

    return ret;
};

const _parseJsonata = async function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    ret["jsonata"] = _subStrUsingNextIndex(subCmdVar, "EXPRESSION(", ")");
    ret["nodeName"] = "jsonata";
    ret["description"] = "Jsonata";
    return ret;
};
const _parseMap = async function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar, maps;
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    maps = _subStrUsingLastIndex(subCmdVar, "DO(", ")");
    let fixIndex = 0; let tuples = []; maps.split(",").forEach((tuple,i) => {
        if (tuple.match(/.+?:.+?[:.+?,?]/)) {tuples.push(tuple); fixIndex = i;}
        else tuples[fixIndex] = `${tuples[fixIndex]},${tuple}`;
    });
    let mapArr = [];
    tuples.forEach(function (value) {
        let values = value.trim().split(':');
        for (let j = 0; j < 5; j++) {
            values[j] = values[j] ? values[j].trim() : '';
        }
        mapArr.push(values);
    });
    ret["listbox"] = JSON.stringify(mapArr);
    ret["nodeName"] = "map";
    ret["description"] = "Map";
    return ret;
};

const _parseSubstr = async function (command, isThisSubCmd) {

    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    subCmdVar = (subCmdVar) ? subCmdVar : command;
    let substr = _subStrUsingLastIndex(subCmdVar, "DO(", ")").split(":");
    ret["variable"] = _subStrUsingNextIndex(command, "VAR(", ")");
    ret["string"] = substr[0];
    ret["index"] = substr[1];
    ret["noofchar"] = substr[2]
    ret["nodeName"] = "substr";
    ret["description"] = "Substr";
    return ret;
}




const _parseDsppfm = async function (command, isThisSubCmd) {
    let ret = {};
    let subCmdVar;
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        subCmdVar = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    let file = _subStrUsingNextIndex(subCmdVar, "FILE(", ")").split('/');
    ret["libraryname"] = file[0];
    ret["physical"] = file[1];
    ret["member"] = _subStrUsingLastIndex(subCmdVar, "MBR(", ")") ? _subStrUsingLastIndex(subCmdVar, "MBR(", ")") : "";
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

const _parseRest = async function (command, isThisSubCmd) {
    let ret = {};
    ret["nodeName"] = "rest";
    ret["description"] = "Rest";
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    ret["url"] = _patternMatch(command, /URL\(([^)]+)\)/, 0);
    ret["method"] = _patternMatch(command, /METHOD\(([^)]+)\)/, 0);
    ret["parameter"] = _patternMatch(command, /PARM\(([^)]+)\)/,0 );
    ret["headers"] = _patternMatch(command, /HEADERS\(([^)]+)\)/, 0);
    return ret;

};

const _parseIfTrue = async function (command) {
    let ret = {};
    ret["nodeName"] = "iftrue";
    ret["description"] = "Iftrue";
    return ret;
};

const _parseIfFalse = async function (command) {
    let ret = {};
    ret["nodeName"] = "iffalse";
    ret["description"] = "Iffalse";
    return ret;
};


const _patternMatch = function (string, pattern, slicePosition) {

    return string.match(pattern) ? string.match(pattern)[1].slice(slicePosition) : "";
}

const _getUniqueID = _ => `${Date.now()}${Math.random() * 100}`;

const _isDraggedItemAJSONFile = event => event.dataTransfer.items?.length && event.dataTransfer.items[0].kind === "file"
    && event.dataTransfer.items[0].type.toLowerCase() === "application/json";

export const open = { init, clicked, getImage, getHelpText, getDescriptiveName, allowDrop, droppedFile, apiclParser }