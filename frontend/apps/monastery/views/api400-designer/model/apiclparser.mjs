/** 
 * APICL Parser for API400 application.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import { serverManager } from "../js/serverManager.js"

let xCounter, yCounter, counter = 0, dependencies ,result, storeIDS, flagNOthenYESelse = 0,
    apicl, initAPICL, commandCounter, nextElseDependency ;

/**
* Convert the apicl into the final model object
* @param data The incoming apicl to convert, the format should be { "index:" : "command" }
* @returns The  api400modelobject, { "apicl": [{ "commands": finalCommands, "name": "commands", "id": counter }] }
*/
async function apiclParser(data) {
    xCounter = 100, yCounter = 80, dependencies = [], storeIDS = {}, commandCounter = [],
    result = [], nextElseDependency=[], apicl = JSON.parse(data), initAPICL = _initializeAPICLIndex(JSON.parse(data));

    for (const key in apicl) {
        if (!initAPICL[key]) {
            const modelObject = await _parseCommand(apicl[key],key);
            if (Object.keys(modelObject).length > 0) { result.push(modelObject); initAPICL[key] = modelObject.id; }
        }
    }
    const resolvedPromises = await Promise.all(result);
    const finalCommands = _correctAPICL(resolvedPromises);
    counter = 0;
    return { "apicl": [{ "commands": finalCommands, "name": "commands", "id": counter }] };
}

/**
* Convert the apicl command into the final model object of that node
* @param command  apicl command for that node
* @param counter  used to put the id of the previous node into the dependency of the next node.
* @param dependencies contains id's of the nodes
* @param key index number of the command 
* @returns modelobject, which contains nodeName, description, id, x-coordinates, y-coordinates, and other required properties for that command
*/
const _parseCommand = async function (command, key) {
     counter++;
    let ret = {}, nodeNameAsSubCmd = '', attr, cmd = command.split(' '), nodeName = cmd[0].toLowerCase();
    if (nodeName == "runjs" && _findBetweenParenthesis(command, "MOD") != "") nodeName = "mod";
    if (nodeName == "if") nodeName = "condition";
    if (nodeName == 'chgvar') {
        let nodenameAsSubCmd = await _checkChgvarSubCommand(command);
        nodeNameAsSubCmd = nodenameAsSubCmd.toLowerCase() || nodeName;
    }
    const isThisSubCmd = (nodeNameAsSubCmd) ? true : false;
    nodeName = (nodeNameAsSubCmd) ? nodeNameAsSubCmd : nodeName;

    if (nodeName == 'strapi')          { ret = await _parseStrapi(command) }
    else if (nodeName == 'runsql')     { ret = await _parseRunsql(command, isThisSubCmd) }
    else if (nodeName == 'runjs')      { ret = await _parseRunjs(command, isThisSubCmd) }
    else if (nodeName == 'sndapimsg')  { ret = await _parseSndapimsg(command) }
    else if (nodeName == 'chgvar')     { ret = await _parseChgvar(command) }
    else if (nodeName == 'condition')  { ret = await _parseIfCondition(command, key) }
    else if (nodeName == 'iftrue')     { ret = await _parseIfTrue() }
    else if (nodeName == 'iffalse')    { ret = await _parseIfFalse() }
    else if (nodeName == 'goto')       { ret = await _parseGoto(command) }
    else if (nodeName == 'chgdtaara')  { ret = await _parseChgdtaara(command) }
    else if (nodeName == 'rtvdtaara')  { ret = await _parseRtvdtaara(command) }
    else if (nodeName == 'qrcvdtaq')   { ret = await _parseQrcvdtaq(command) }
    else if (nodeName == 'qsnddtaq')   { ret = await _parseQsnddtaq(command) }
    else if (nodeName == 'dsppfm')     { ret = await _parseDsppfm(command, isThisSubCmd) }
    else if (nodeName == 'log')        { ret = await _parseLog(command) }
    else if (nodeName == 'call')       { ret = await _parseCall(command) }
    else if (nodeName == 'runsqlprc')  { ret = await _parseRunsqlprc(command) }
    else if (nodeName == 'rest')       { ret = await _parseRest(command, isThisSubCmd) }
    else if (nodeName == 'jsonata')    { ret = await _parseJsonata(command, isThisSubCmd) }
    else if (nodeName == 'map')        { ret = await _parseMap(command, isThisSubCmd) }
    else if (nodeName == 'scr')        { ret = await _parseScr(command, isThisSubCmd, key) }
    else if (nodeName == 'mod')        { ret = await _parseMod(command) }
    else if (nodeName == 'substr')     { ret = await _parseSubstr(command, isThisSubCmd) }
    else if (nodeName == 'endapi')     { ret = await _parseEndapi() }

    if (ret && ret.nodeName) { attr = await _setAttribute(ret.nodeName, key); }
    return { ...ret, ...attr };
}

/**
 * Convert the apicl command into STRAPI node 
 * STRAPI : Start API
 * @param command  apicl command for STRAPI
 * @returns STRAPI node object with required properties 
 */
const _parseStrapi = async function (command) {
    const ret = {};
    ret["listbox"] = command.match(/\(([^)]+)\)/) ? JSON.stringify(command.match(/\(([^)]+)\)/)[1].split(" ").filter(Boolean)) : JSON.stringify(['']);
    ret["nodeName"] = "strapi";
    return ret;
}

/**
 * Convert the apicl command into RUNSQL node 
 * RUNSQL : Execute the SQL Query
 * @param command  apicl command for RUNSQL
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns RUNSQL node object with required properties
 */
 const _parseRunsql = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    if (command.includes("TRIM(TRUE)")) command = command.replace("TRIM(TRUE)", "");
    if (command.includes("BATCH(TRUE)")) command = command.replace("BATCH(TRUE)", "");
    ret["sql"] = _subStrUsingLastIndex(command, "SQL(", ")");
    ret["nodeName"] = "runsql";
    return ret;
}

/**
 * Convert the apicl command into RUNJS node 
 * RUNJS : Execute the Javascript Code
 * @param command  apicl command for RUNJS
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns RUNJS node object with required properties
 */
 const _parseRunjs = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    ret["code"] = _subStrUsingLastIndex(command, "JS(", ")");
    ret["nodeName"] = "runjs";
    return ret;
}

/**
 * Convert the apicl command into SNDAPIMSG node 
 * SNDAPIMSG : Send API Messages
 * @param command  apicl command for SNDAPIMSG
 * @returns SNDAPIMSG node object with required properties
 */
 const _parseSndapimsg = async function (command) {
    const ret = {};
    ret["listbox"] = command.match(/\(([^)]+)\)/) ? JSON.stringify(command.match(/\(([^)]+)\)/)[1].split(" ").filter(Boolean)) : JSON.stringify(['']);
    ret["nodeName"] = "sndapimsg";
    return ret;
}

/**
 * Convert the apicl command into CHGVAR node 
 * CHGVAR : Change the Variable
 * @param command  apicl command for CHGVAR
 * @returns CHGVAR node object with required properties
 */
 const _parseChgvar = async function (command) {
    const ret = {};
    ret["variable"] = _findBetweenParenthesis(command, "VAR");
    ret["value"] = _findBetweenParenthesis(command, "VALUE");
    ret["nodeName"] = "chgvar"
    return ret;
}

/**
 * Convert the apicl command into  IF COND  node 
 * IF COND : Check the condtion
 * @param command  apicl command for IF COND
 * @param key index number of this command
 */
 const _parseIfCondition = async function (command, key) {
    const ret = {}; let afterTrueCmd, iftrue = '', iffalse = '';
    ret["nodeName"] = "condition";
    ret["condition"] = _findBetweenParenthesis(command, "COND");
    const attr = await _setAttribute("condition");
    result.push({ ...ret, ...attr });
    initAPICL[key] = attr.id;
    if (command.includes("ELSE")) {
        const getThen = command.match(/THEN\(.+\)/)[0].split("ELSE")[0].trim();
        iftrue = _subStrUsingLastIndex(getThen, "THEN(", ")");
        iffalse = _subStrUsingLastIndex(command, "ELSE(", ")");
    }
    else iftrue = _subStrUsingLastIndex(command, "THEN(", ")");
    if (iftrue != '') {
        result.push(await _parseCommand("iftrue"));
        afterTrueCmd = await _parseCommand(iftrue.trim());
        result.push(afterTrueCmd);
    }
    xCounter = attr.x;
    yCounter = attr.y + 80;
    let ModelObjectOfIffalse = await _parseCommand("iffalse");
    ModelObjectOfIffalse.dependencies = [attr.id];

    result.push(ModelObjectOfIffalse);
    if (iffalse.trim() != '') {
        result.push(await _parseCommand(iffalse.trim()));
    } else {
        nextElseDependency.push(ModelObjectOfIffalse.id);
    }
    // when THEN do not have GOTO and ELSE has GOTO
    if (iftrue.trim().split(" ")[0] != "GOTO" && iffalse.trim().split(" ")[0] == "GOTO") {
        flagNOthenYESelse = afterTrueCmd.id;
    }
    return {};
}

const _parseIfTrue = async function () { return { "nodeName": "iftrue" } }

const _parseIfFalse = async function () { return { "nodeName": "iffalse" } }

/**
 * Convert the apicl command into  GOTO node 
 * GOTO : Jump onto particular flow or command
 * @param command  apicl command for GOTO
 */
const _parseGoto = async function (command) {
    const ret = {}, gotoIndex = command.split(/\s+/)[1];
    if (gotoIndex) {
        ret["nodeName"] = "goto";
        const attr = await _setAttribute("goto");
        if (initAPICL[gotoIndex] != false) {
            const position = await _findPosition(initAPICL[gotoIndex]);
            result[position].dependencies.push(attr.id);
            result.push({ ...ret, ...attr });
            return;
        }
        result.push({ ...ret, ...attr });
        let i = gotoIndex;
        do {
            const object = await _parseCommand(apicl[i]);
            if (object && object.nodeName) {
                result.push(object); initAPICL[i] = object.id;
            }
        } while (apicl[i] && apicl[i++] != 'ENDAPI');
    }
}


/**
 * Convert the apicl command into CHGDTAARA node 
 * CHGDTAARA : Change Data Area
 * @param command  apicl command for CHGDTAARA
 * @returns CHGDTAARA node object with required properties
 */
 const _parseChgdtaara = async function (command) {
    const ret = {}, dataAreaName = _findBetweenParenthesis(command, "DTAARA").split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["datatype"] = _findBetweenParenthesis(command, "TYPE") == "*CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _findBetweenParenthesis(command, "VALUE");
    ret["nodeName"] = "chgdtaara"
    return ret;
}


/**
 * Convert the apicl command into RTVDTAARA node 
 * RTVDTAARA : Retrieve Data Area
 * @param command  apicl command for RTVDTAARA
 * @returns RTVDTAARA node object  with required properties
 */
const _parseRtvdtaara = async function (command) {
    const ret = {}, dataAreaName = _findBetweenParenthesis(command, "DTAARA").split("/");
    ret["libraryname"] = dataAreaName[0];
    ret["dataarea"] = dataAreaName[1];
    ret["datatype"] = _findBetweenParenthesis(command, "TYPE") == "*CHAR" ? "Character" : "BigDecimal";
    ret["value"] = _findBetweenParenthesis(command, "RTNVAR");
    ret["nodeName"] = "rtvdtaara";
    return ret;
}

/**
 * Convert the apicl command into QRCVDTAQ node 
 * QRCVDTAQ : Recieve Data Queue 
 * @param command  apicl command for QRCVDTAQ
 * @returns QRCVDTAQ node object with required properties
 */
const _parseQrcvdtaq = async function (command) {
    const ret = {}, qrcvdtaqParm = _findBetweenParenthesis(command, "PARM").split(/\s+/).filter(Boolean);
    ret["libraryname"] = qrcvdtaqParm[0].split("/")[0];
    ret["dataqueue"] = qrcvdtaqParm[0].split("/")[1];
    ret["wait"] = qrcvdtaqParm[1];
    ret["allowpeek"] = qrcvdtaqParm[2] == "true" ? "true" : "false";
    ret["data"] = qrcvdtaqParm[3].includes("&") ? qrcvdtaqParm[3] : qrcvdtaqParm.slice(3).join(" ");
    ret["nodeName"] = "qrcvdtaq";
    return ret;
}

/**
 * Convert the apicl command into QSNDDTAQ node 
 * QSNDDTAQ : Send Data Queue
 * @param command  apicl command for QSNDDTAQ
 * @returns QSNDDTAQ node object with required properties
 */
const _parseQsnddtaq = async function (command) {
    const ret = {}, qsnddtaqParm = _findBetweenParenthesis(command, "PARM").split(/\s+/).filter(Boolean);
    ret["libraryname"] = qsnddtaqParm[0].split("/")[0];
    ret["dataqueue"] = qsnddtaqParm[0].split("/")[1];
    ret["value"] = qsnddtaqParm[1].includes("&") ? qsnddtaqParm[1] : qsnddtaqParm.slice(1).join(" ");
    ret["nodeName"] = "qsnddtaq";
    return ret;
}

/**
 * Convert the apicl command into DSPPFM node 
 * DSPPFM : Display Physical File Member
 * @param command  apicl command for DSPPFM
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns DSPPFM node object with required properties
 */
const _parseDsppfm = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    const physicalFile = _subStrUsingNextIndex(command, "FILE(", ")").split('/');
    ret["libraryname"] = physicalFile[0];
    ret["physicalfile"] = physicalFile[1];
    ret["member"] = _subStrUsingLastIndex(command, "MBR(", ")") ? _subStrUsingLastIndex(command, "MBR(", ")") : "";
    ret["nodeName"] = "dsppfm";
    return ret;
}

/**
 * Convert the apicl command into LOG node 
 * LOG : Log out particular message or variable
 * @param command  apicl command for LOG
 * @returns LOG node object with required properties
 */
 const _parseLog = async function (command) {
    const ret = {};
    ret["log"] = _findBetweenParenthesis(command, "MSG");
    ret["nodeName"] = "log";
    return ret;
}

/**
 * Convert the apicl command into CALL node 
 * CALL : To Call the Program
 * @param command  apicl command for CALL
 * @returns CALL node object with required properties
 */
const _parseCall = async function (command) {
    const ret = {}, programName = _findBetweenParenthesis(command, "PGM").split("/");
    ret["libraryname"] = programName[0];
    ret["programname"] = programName[1];
    ret["listbox"] = JSON.stringify(_findBetweenParenthesis(command, "PARM").split(" ").filter(Boolean));
    ret["nodeName"] = "call";
    return ret;
}

/**
 * Convert the apicl command into RUNSQLPRC node 
 * RUNSQLPRC : Execute the Stored Procedure
 * @param command  apicl command for RUNSQLPRC
 * @returns RUNSQLPRC node object with required properties
 */
const _parseRunsqlprc = async function (command) {
    const ret = {}, finalValues = [], procedureName = _findBetweenParenthesis(command, "PRC").split("/"),
        listOfParams = _findBetweenParenthesis(command, "PARM").split(" ").filter(Boolean);
    let paramAtrributes, paramType, otherParams, parameter, paramNature;

    ret["libraryname"] = procedureName[0];
    ret["procedurename"] = procedureName[1];
    for (const param of listOfParams) {
        paramType = '', parameter = '', paramNature = '';
        if (param.includes(":")) {
            paramAtrributes = param.split(":");
            paramType = `:${paramAtrributes[1]}`;
            otherParams = paramAtrributes[0].split("&").filter(Boolean);
            parameter = `&${otherParams[1]}`;
            paramNature = `&${otherParams[0]}`
        }
        else parameter = param;
        finalValues.push([parameter,paramNature,  paramType]);
    }
    ret["listbox"] = JSON.stringify(finalValues);
    ret["nodeName"] = "runsqlprc";
    return ret;
}

/**
 * Convert the apicl command into REST node 
 * REST : To Call the REST URL
 * @param command  apicl command for REST
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not  
 * @returns REST node object with required properties
 */
const _parseRest = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    ret["url"] = _findBetweenParenthesis(command, "URL");
    ret["method"] = _findBetweenParenthesis(command, "METHOD");
    ret["parameter"] = _findBetweenParenthesis(command, "PARM");
    ret["headers"] = _findBetweenParenthesis(command, "HEADERS");
    ret["nodeName"] = "rest";
    return ret;
}

/**
 * Convert the apicl command into JSONATA node 
 * JSONATA : To execute the JSONATA expression
 * @param command  apicl command for JSONATA
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns JSONATA node object with required properties
 */
const _parseJsonata = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        // convert it as subcommand
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")");
    }
    ret["jsonata"] = _subStrUsingNextIndex(command, "EXPRESSION(", ")");
    ret["nodeName"] = "jsonata";
    return ret;
}

/**
 * Convert the apicl command into MAP node 
 * MAP : To Extract the particular String
 * @param command  apicl command for MAP
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns MAP node object with required properties
 */
 const _parseMap = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    const maps = _subStrUsingLastIndex(command, "DO(", ")");
    let fixIndex = 0, tuples = []; maps.split(",").forEach((tuple, i) => {
        if (tuple.match(/.+?:.+?[:.+?,?]/)) { tuples.push(tuple); fixIndex = i; }
        else tuples[fixIndex] = `${tuples[fixIndex]},${tuple}`;
    });
    const mapArr = [];
    tuples.forEach(function (value) {
        let values = value.trim().split(':');
        for (let j = 0; j < 5; j++) {
            values[j] = values[j] ? values[j].trim() : '';
        }
        mapArr.push(values);
    });
    ret["listbox"] = JSON.stringify(mapArr);
    ret["nodeName"] = "map";
    return ret;
}

/**
 * Convert the apicl command into RUNJS MOD node 
 * RUNJS MOD : Execute the Javascript Code
 * @param command  apicl command for RUNJS MOD
 * @returns RUNJS MOD node object with required properties
 */
async function _parseMod(command) {
    const ret = {};
    ret["modulename"] = _findBetweenParenthesis(command, "MOD");
    const jsData = await serverManager.getModule(_findBetweenParenthesis(command, "MOD")); // gets the JS code from module file (passsing module name in function)
    ret["code"] = jsData.mod;
    ret["nodeName"] = "mod";
    return ret;
}

/**
 * Convert the apicl command into the SCR READ node or SCR KEYS or SCR OPS
 * SCR READ : Screen Scrapping Read the coordinates
 * SCR KEYS : Screen Scrapping , hit the command and keys on particular coordinates
 * SCR OPS  : Screen Scrapping , start , release
 * @param command  apicl command for SCR READ OR SCR KEYS or SCR OPS
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @param key index number of this command
 * @returns SCR READ or SCR KEYS or SCR OPS node object with required properties
 */
const _parseScr = async function (command, isThisSubCmd, key) {
    const ret = {};
    if (isThisSubCmd) {
        ret["result"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    ret["session"] = _subStrUsingNextIndex(command, "NAME(", ")");
    if (command.includes("START")) {
        ret["nodeName"] = "scrops";
        ret["scrops"] = "start";
        if (command.includes("KEYS") && command.includes("POOL")) {
            let attr;
            ret["pool"] = _subStrUsingLastIndex(command, "POOL(", ")");
            if (ret && ret.nodeName) { attr = await _setAttribute(ret.nodeName, key); }
            result.push({ ...ret, ...attr });
            initAPICL[key] = attr.id;
            const cmdAfterRemoveScrStart = command.replace('START', '');
            result.push(await _parseCommand(cmdAfterRemoveScrStart.replace(cmdAfterRemoveScrStart.match(/POOL\(.+\)/i)[0],'')));
            return {};
        }
    } else if (command.includes("STOP")) {
        ret["nodeName"] = "scrops";
        ret["scrops"] = "stop";
    } else if (command.includes("RELEASE")) {
        ret["nodeName"] = "scrops";
        ret["scrops"] = "release";
    } else if (command.includes("READ")) {
        let values;
        const readParams = _subStrUsingLastIndex(command, "READ(", ")"), allReads = [];
        readParams.split(':').forEach(function (value) {
            values = value.trim().split(',');
            for (let j = 0; j < 3; j++) { values[j] = values[j] ? values[j].trim() : ''; }
            allReads.push(values);
        });
        ret["nodeName"] = "scrread";
        ret["listbox"] = JSON.stringify(allReads);
    } else if (command.includes("KEYS")) {
        const keysParams = _findBetweenParenthesis(command, "KEYS"), allKeys = [];
        let values;
        keysParams.split(':').forEach(function (value) {
            values = value.trim().split(',');
            for (let j = 0; j < 3; j++) { values[j] = values[j] ? values[j].trim() : ''; }
            allKeys.push(values);
        });
        ret["nodeName"] = "scrkeys";
        ret["listbox"] = JSON.stringify(allKeys);
    }
    return ret;
}

/**
 * Convert the apicl command into SUBSTR node 
 * SUBSTR : To Extract out the Substring from a String
 * @param command  apicl command for SUBSTR
 * @param isThisSubCmd Contains true or false to check wheather a sub command or not
 * @returns SUBSTR node with required properties
 */
const _parseSubstr = async function (command, isThisSubCmd) {
    const ret = {};
    if (isThisSubCmd) {
        ret["variable"] = _subStrUsingNextIndex(command, "VAR(", ")");
        command = _subStrUsingLastIndex(command, "VALUE(", ")")
    }
    const substr = _subStrUsingLastIndex(command, "DO(", ")").split(":");
    ret["string"] = substr[0];
    ret["index"] = substr[1];
    ret["noofchar"] = substr[2];
    ret["nodeName"] = "substr";
    return ret;
}


/**
 * Convert the apicl command into ENDAPI node 
 * ENDAPI : To End the API
 * @param command  apicl command for ENDAPI
 * @returns ENDAPI node object with required properties
 */
const _parseEndapi = async function () { return { "nodeName": "endapi" }; }

/**
 * Sets the attributes such as dependencies, X-coordinates, Y-coordinates, Unique ID to the node.
 * @param nodeName  node name of that command
 * @param key index number of this command
 * @returns an object contains dependencies, X-coordinates, Y-coordinates, UniqueID and description for that node
 */
const _setAttribute = async function (nodeName, key) {
    const attribute = {}, description = nodeName.charAt(0).toUpperCase() + nodeName.slice(1).toLowerCase();
    attribute["id"] = _getUniqueID();
    if (description == 'Iftrue' || description == 'Iffalse') { attribute["description"] = description; } 
    else { attribute["description"] = `${description}${_addCommandCount(description)}`; }
    storeIDS[key] = attribute.id
    dependencies.push(attribute.id);

    if (counter >= 2) {
        if (xCounter % 1200 == 0 && yCounter % 80 == 0) { xCounter = 100; yCounter = yCounter + 80 };
        attribute["dependencies"] = _putDependency(dependencies[counter - 2], nodeName);
        attribute["x"] = xCounter;
        attribute["y"] = yCounter;
        xCounter = xCounter + 100
    }
    return attribute;
};


/**
 * Increases the command count of the node of same type, which then used to add the count for the description of that node 
 * @param desciption  is an Description of the node
 * @returns an count of that command
 */
const _addCommandCount = function (description) { 
    commandCounter[description] = (commandCounter[description] >= 1) ? ++commandCounter[description] : 1;
    return commandCounter[description];
}

/**
 * After initiliazing initAPICL object {"key" :"false"}, which then used to store the ID's of the every node such that initAPICL object {"key" :ID}
 * @param initApicl  is an apicl 
 * @returns an object, { "index": false }
 */
const _initializeAPICLIndex = function (initApicl) { for (const key in initApicl) { initApicl[key] = false; } return initApicl; }

/**
 * removes {} in the finalCommands object
 * @param result contains model object of the every command in the apicl
 * @returns an finalCommands object 
 */
const _correctAPICL = function (result) { 

    const finalAPICL = [];
    for (const key in result) { if (Object.keys(result[key]).length > 0) { finalAPICL.push(result[key]); } }
    return finalAPICL;
}

/**
 * To store the IDs of the each node in an array and which then used to add the dependencies to the model object of the next node 
 * @param nodeid id of that node 
 * @param nodeName node name of that node
 * @returns an array of IDs
 */
const _putDependency = function (nodeid, nodeName) { 

    let dependencyId;
    if (nextElseDependency.length > 0) { dependencyId = nextElseDependency[0]; nextElseDependency.pop(); }
    else {
        dependencyId = nodeid;
        if (flagNOthenYESelse != 0 && nodeName != 'endapi') { dependencyId = flagNOthenYESelse; flagNOthenYESelse = 0; }
    }
    return [`${dependencyId}`];
};

/**
 * Used to check wheather the command is sub command or not
 * @param command  apicl command for that node
 * @returns node name 
 */
const _checkChgvarSubCommand = async function (command) { 
    const subCommands = ['SCR', 'REST', 'JSONATA', 'DSPPFM', 'MAP', 'SUBSTR', 'RUNSQL', 'RUNJS'];
    let nodeName = "";
    subCommands.forEach((subCommand) => { if (command.includes(subCommand)) { nodeName = subCommand; } })
    return nodeName;
};

/**
 * Used to find the index of the node in result array 
 * @param id  id of the node we need to find.
 * @returns position of the node 
 */
const _findPosition = async function (id) { let pos = 0; for (pos in result)  if (result[pos].id == id) return pos; }

/**
 * Used to get the substring which is in between the startStr and last match of endStr in str
 * @param str  is an main string need to work on
 * @param startStr after which the position of the substing starts
 * @param endStr before which the position of the substring ends
 * @returns an substring which is in between the startStr and last match of endStr in str
 */
const _subStrUsingLastIndex = function (str, startStr, endStr) { 
    return str.substring(str.indexOf(startStr) + startStr.length, str.lastIndexOf(endStr));
};

/**
 * Used to get the substring which is in between the startStr and first match of endStr in str
 * @param str  is an main text need to work on
 * @param startStr after which the position of the substing starts
 * @param endStr before which the position of the substring ends
 * @returns an substring which is in between the startStr and first match of endStr in str
 */
const _subStrUsingNextIndex = function (str, startStr, endStr) {
    return str.substring(str.indexOf(startStr) + startStr.length, str.indexOf(endStr));
};

const _getUniqueID = _ => `${Date.now()}${Math.random() * 100}`; // return an unique ID

const _findBetweenParenthesis = function (string, fromWord) { 
    return string.match(new RegExp(`${fromWord}\\(([^)]+)\\)`)) ? string.match(new RegExp(`${fromWord}\\(([^)]+)\\)`))[1] : "";
}

export const apiclparser = { apiclParser }