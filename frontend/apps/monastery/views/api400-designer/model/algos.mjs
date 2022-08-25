/** 
 * Algorithms for API400 application.
 * (C) 2022 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */

import { util } from "/framework/js/util.mjs";
let apicl = {}, laterAPICLCmd = {}, nodeAlreadyAdded = [], nodeToAddLater = [];

/**
* Sorts a graph into a linear list with increasing order of indexing
* @param nodes The incoming graph to sort, the format should be {id:, dependencies:[array_of_ids]}
* @returns The sorted graph in which they have the connection , {id:, dependencies:[array_of_ids]}
*/
function sortDependencies(nodes) {

    const nodesToWorkOn = util.clone(nodes.commands), sortedSet = [], stopNodeIds = [], futureCurrentNode = [];
    let nextCurrentNodeId, dependencyCheck, icounter = [];

    for (const node of nodesToWorkOn) if ((!node.dependencies) || (!node.dependencies.length)) sortedSet.push(_arrayDelete(nodesToWorkOn, node));

    let currentNodeId = sortedSet.slice(-1)[0].id; // last command id , to be searched in dependencies of remaininge nodes/commands
    for (let i = 0; i < nodesToWorkOn.length; i++) {
        let flag = 0;
        dependencyCheck = 0;
        currentNodeId = (nextCurrentNodeId ? nextCurrentNodeId : currentNodeId);
        if (stopNodeIds && stopNodeIds.length > 0 && stopNodeIds.includes(currentNodeId) && futureCurrentNode && futureCurrentNode.length > 0) {
            sortedSet.push(futureCurrentNode[0]);
            currentNodeId = futureCurrentNode[0].id;
            _arrayDelete(futureCurrentNode, futureCurrentNode[0]);
        }
        for (let nodeIn of nodesToWorkOn) {
            if (nodeIn.dependencies?.includes(currentNodeId)) {
                if (nodeIn.dependencies.length > 1) { // if dependencies array has more than one ids
                    if (stopNodeIds.indexOf(nodeIn.id) === -1) { stopNodeIds.push(nodeIn.id); }
                }
                if (flag == 1) { futureCurrentNode.push(nodeIn); icounter.push(i); }
                else { sortedSet.push(nodeIn); nextCurrentNodeId = nodeIn.id; flag = 1; } // normal flow case
                dependencyCheck = 1;
            }
        }
        if (icounter && icounter.length > 0 && dependencyCheck == 0) { // dependencyCheck == 0, is endapi case , endapi must not have its id in other node's dependencies
            i = icounter[0]; _arrayDelete(icounter, i);
            if (futureCurrentNode[0] && futureCurrentNode[0].id) { // in the case of true and false , after endapi , go for either case of true or false
                sortedSet.push(futureCurrentNode[0]);
                nextCurrentNodeId = futureCurrentNode[0].id;
                _arrayDelete(futureCurrentNode, futureCurrentNode[0]);
            }
        }
    }
    return sortedSet;
}

const _arrayDelete = (array, element) => { if (array.includes(element)) array.splice(array.indexOf(element), 1); return element; }


/**
 * Convert the sorted dependencies into the final APICL for output
 * @param nodes The incoming sorted graph, the format should be {commands:,[array_of_command]}
 * @returns The json with collection of key value pair, { "index:" : "command" }
 */
const convertIntoAPICL = function (nodes) {

    apicl = {}, laterAPICLCmd = {}, nodeToAddLater = [];
    let cmdString, addLaterflag;

    for (const node of nodes) {
        cmdString = '';
        addLaterflag = 0;
        if (nodeToAddLater.includes(node.id)) { addLaterflag = 1; }
        
        if (node.nodeName == 'strapi')  { cmdString = _convertForStrapi(node) }
        else if (node.nodeName == 'runsql' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForRunsql(node) }
        else if (node.nodeName == 'runjs' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForRunjs(node) }
        else if (node.nodeName == 'sndapimsg' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForSndapimsg(node) }
        else if (node.nodeName == 'chgvar' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForChgvar(node) }
        else if (node.nodeName == 'condition') { cmdString = _convertForCondition(node, nodes) }
        else if (node.nodeName == 'goto' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForGoto(node, nodes) }
        else if (node.nodeName == 'chgdtaara' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForChgdtaara(node) }
        else if (node.nodeName == 'rtvdtaara' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForRtvdtaara(node) }
        else if (node.nodeName == 'qrcvdtaq' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForQrcvdtaq(node) }
        else if (node.nodeName == 'qsnddtaq' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForQsnddtaq(node) }
        else if (node.nodeName == 'dsppfm' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForDsppfm(node) }
        else if (node.nodeName == 'log' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForLog(node) }
        else if (node.nodeName == 'call' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForCall(node) }
        else if (node.nodeName == 'runsqlprc' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForRunsqlprc(node) }
        else if (node.nodeName == 'rest' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForRest(node) }
        else if (node.nodeName == 'jsonata' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForJsonata(node) }
        else if (node.nodeName == 'map' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForMap(node) }
        else if (node.nodeName == 'scrread' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForScrread(node) }
        else if (node.nodeName == 'scrkeys' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForScrkeys(node) }
        else if (node.nodeName == 'scrops' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForScrops(node, nodes) }
        else if (node.nodeName == 'mod' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForMod(node) }
        else if (node.nodeName == 'substr' && !nodeAlreadyAdded.includes(node.id)) { cmdString = _convertForSubstr(node) }
        else if (node.nodeName == 'endapi') { cmdString = _convertForEndapi() }

        // checking for condition cases , to add the set of command after one case of condition, either true or false
        if (cmdString != '') {
            if (addLaterflag) { laterAPICLCmd[node.id] = cmdString; }
            else { apicl[node.id] = cmdString; }
        }
    }

    apicl = Object.assign(apicl, laterAPICLCmd);
    apicl = _setIndexing(apicl);
    laterAPICLCmd = {};

    return apicl;
};

/**
 * Convert the STRAPI node into apicl command
 * STRAPI : Start API
 * @param node  Command Obect for STRAPI
 * @returns STRAPI apicl command
 */
const _convertForStrapi = function (node) {

    const cmdString = 'STRAPI PARM()';
    if (node.listbox) return cmdString.replace(`()`, `(${JSON.parse(node.listbox).filter(Boolean).join(' ')})`);
    else return cmdString;
};

/**
 * Convert the RUNSQL node into apicl command
 * RUNSQL : Execute the SQL Query
 * @param node  Command Obect for RUNSQL
 * @returns RUNSQL apicl command
 */
const _convertForRunsql = function (node) {

    let cmdString = `RUNSQL SQL(${node.sql || ''})`;
    if (node.sql && node.sql.includes("SELECT"))
        cmdString += ` TRIM(TRUE)`;
    if (node.sql && node.sql.includes("INSERT") && node.sql.split("INSERT").length - 1 > 1)
        cmdString += ` BATCH(TRUE)`;
    if (node.result && node.result != '')
        cmdString = `CHGVAR  VAR(${node.result})  VALUE(${cmdString})`;
    return cmdString;
};

/**
 * Convert the RUNJS node into apicl command
 * RUNJS : Execute the Javascript Code
 * @param node  Command Obect for RUNJS
 * @returns RUNJS apicl command
 */
const _convertForRunjs = function (node) {
    if (!node.result) return `RUNJS JS(${node.code || ''})`;
    else return `CHGVAR VAR(${node.result}) VALUE(RUNJS JS(${node.code || ''}))`;
};

/**
 * Convert the SNDAPIMSG node into apicl command
 * SNDAPIMSG : Send API Messages
 * @param node  Command Obect for SNDAPIMSG
 * @returns SNDAPIMSG apicl command
 */
const _convertForSndapimsg = function (node) {

    const cmdString = 'SNDAPIMSG  MSG()';
    if (node.listbox) return cmdString.replace(`()`, `(${JSON.parse(node.listbox).filter(Boolean).join(' ')})`);
    else return cmdString;
};

/**
 * Convert the CHGVAR node into apicl command
 * CHGVAR : Change the Variable
 * @param node  Command Obect for CHGVAR
 * @returns CHGVAR apicl command
 */
const _convertForChgvar = function (node) {
    return `CHGVAR  VAR(${node.variable ? node.variable.trim() : ''})  VALUE(${node.value ? node.value.trim() : ''})`;
};

/**
 * Convert the IF COND node into apicl command
 * IF COND : Check the condtion
 * @param node Command Obect for IF COND
 * @param {*} nodes All the Commands Object
 * @returns IF COND apicl command , along with THEN and ELSE , also the next Command inside THEN and ELSE
 */
const _convertForCondition = function (node, nodes) {
    let nextIdentifiedNodeObj;
    let cmdStringArr = [];
    cmdStringArr[0] = `IF COND(${node.condition || ''})`; // add the condition command
    for (const nodeObj of nodes) {
        if (nodeObj && nodeObj.dependencies && nodeObj.dependencies.length > 0) {
            if (nodeObj.dependencies.includes(node.id)) {
                if (nodeObj.nodeName == 'iftrue' || nodeObj.nodeName == 'iffalse') {
                    const isThenElse = (nodeObj.nodeName == 'iftrue') ? `THEN` : `ELSE`;
                    nextIdentifiedNodeObj = checkNodeInAllNodes(nodeObj, nodes); // check which command to be add inside THEN and ELSE
                    if (nextIdentifiedNodeObj) {
                        let subCmdStr = '';
                        if (nextIdentifiedNodeObj.nodeName == 'runsql') { subCmdStr = _convertForRunsql(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'goto') { subCmdStr = _convertForGoto(nextIdentifiedNodeObj, nodes); _saveNextNodeIdsInFlow(nextIdentifiedNodeObj, nodes); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrops') { subCmdStr = _convertForScrops(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'runjs') { subCmdStr = _convertForRunjs(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrkeys') { subCmdStr = _convertForScrkeys(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'scrread') { subCmdStr = _convertForScrread(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'chgvar') { subCmdStr = _convertForChgvar(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'map') { subCmdStr = _convertForMap(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'jsonata') { subCmdStr = _convertForJsonata(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'rest') { subCmdStr = _convertForRest(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'runsqlprc') { subCmdStr = _convertForRunsqlprc(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'call') { subCmdStr = _convertForCall(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'log') { subCmdStr = _convertForLog(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'dsppfm') { subCmdStr = _convertForDsppfm(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'qsnddtaq') { subCmdStr = _convertForQsnddtaq(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'qrcvdtaq') { subCmdStr = _convertForQrcvdtaq(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'rtvdtaara') { subCmdStr = _convertForRtvdtaara(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'chgdtaara') { subCmdStr = _convertForChgdtaara(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'sndapimsg') { subCmdStr = _convertForSndapimsg(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'mod') { subCmdStr = _convertForMod(nextIdentifiedNodeObj); }
                        else if (nextIdentifiedNodeObj.nodeName == 'substr') { subCmdStr = _convertForSubstr(nextIdentifiedNodeObj); }

                        // add the THEN and ELSE part , also add any COMMAND inside THEN and ELSE
                        (nodeObj.nodeName == 'iftrue') ? cmdStringArr[1] = ` ${isThenElse}(${subCmdStr})` : cmdStringArr[2] = ` ${isThenElse}(${subCmdStr})`;
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    }
                    else
                        cmdStringArr = cmdStringArr.concat(` ${isThenElse}()`);
                }
            }
        }
    }

    return cmdStringArr.join(' ');
};

/**
 * Convert the GOTO node into apicl command
 * GOTO : Jump onto particular flow or command
 * @param node  Command Obect for GOTO
 * @param {*} nodes All the Commands Object
 * @returns GOTO apicl command
 */
const _convertForGoto = function (node, nodes) {
    const gotoNextNode = checkNodeInAllNodes(node, nodes); // put the id of next Command , which will be sorted with index later in _setIndexing
    return `GOTO ${gotoNextNode.id || ''}`;
};

/**
 * Convert the CHGDTAARA node into apicl command
 * CHGDTAARA : Change Data Area
 * @param node  Command Obect for CHGDTAARA
 * @returns CHGDTAARA apicl command
 */
const _convertForChgdtaara = function (node) {
    let cmdString;
    if ((node.libraryname || node.dataarea) && node.value && node.datatype) {

        if (node.libraryname && node.libraryname != '' && node.dataarea && node.dataarea != '') cmdString = `CHGDTAARA DTAARA(${node.libraryname.trim()}/${node.dataarea.trim()})`;
        else cmdString = `CHGDTAARA DTAARA(${node.libraryname ? node.libraryname.trim() : ''})`

        if (node.datatype.includes("Character")) cmdString += ` TYPE(*CHAR)`;
        else if (node.datatype.includes("BigDecimal")) cmdString += ` TYPE(*BIGDEC)`;

        return `${cmdString} VALUE(${node.value.trim()})`;
    }
    else return `CHGDTAARA DTAARA() TYPE() VALUE()`;
};

/**
 * Convert the RTVDTAARA node into apicl command
 * RTVDTAARA : Retrieve Data Area
 * @param node  Command Obect for RTVDTAARA
 * @returns RTVDTAARA apicl command
 */
const _convertForRtvdtaara = function (node) {
    let cmdString;
    if ((node.libraryname || node.dataarea) && node.value && node.datatype) {
        if (node.libraryname && node.libraryname != '' && node.dataarea && node.dataarea != '') cmdString = `RTVDTAARA DTAARA(${node.libraryname.trim()}/${node.dataarea.trim()})`;
        else cmdString = `RTVDTAARA DTAARA(${node.libraryname ? node.libraryname.trim() : ''})`

        if (node.datatype.includes("Character")) cmdString += `  TYPE(*CHAR)`;
        else if (node.datatype.includes("BigDecimal")) cmdString += `  TYPE(*BIGDEC)`;

        return `${cmdString} RTNVAR(${node.value.trim()})`;
    }
    else return `RTVDTAARA DTAARA() TYPE() RTNVAR()`;
};

/**
 * Convert the QRCVDTAQ node into apicl command
 * QRCVDTAQ : Recieve Data Queue
 * @param node  Command Obect for QRCVDTAQ
 * @returns QRCVDTAQ apicl command
 */
const _convertForQrcvdtaq = function (node) {
    if ((node.libraryname || node.dataqueue) && node.wait && node.allowpeek && node.data) {
        if (node.libraryname && node.libraryname != '' && node.dataqueue && node.dataqueue != '')
            return `QRCVDTAQ PARM(${node.libraryname.trim()}/${node.dataqueue.trim()} ${node.wait.trim()} ${node.allowpeek} ${node.data.trim()})`;
        else return `QRCVDTAQ PARM(${node.libraryname ? node.libraryname.trim() : ''} ${node.wait.trim()} ${node.allowpeek} ${node.data.trim()})`
    }
    else return `QRCVDTAQ  PARM()`
};

/**
 * Convert the QSNDDTAQ node into apicl command
 * QSNDDTAQ : Send Data Queue
 * @param node  Command Obect for QSNDDTAQ
 * @returns QSNDDTAQ apicl command
 */
const _convertForQsnddtaq = function (node) {
    if ((node.libraryname || node.dataqueue) && node.value) {
        if (node.libraryname && node.libraryname != '' && node.dataqueue && node.dataqueue != '')
            return `QSNDDTAQ PARM(${node.libraryname.trim()}/${node.dataqueue.trim()} ${node.value.trim()})`;
        else return `QSNDDTAQ PARM(${node.libraryname ? node.libraryname.trim() : ''} ${node.value.trim()})`;
    }
    else return `QSNDDTAQ PARM()`
};

/**
 * Convert the DSPPFM node into apicl command
 * DSPPFM : Display Physical File Member
 * @param node  Command Obect for DSPPFM
 * @returns DSPPFM apicl command
 */
const _convertForDsppfm = function (node) {
    if (node.libraryname && node.libraryname != '' && node.physicalfile && node.physicalfile != '')
        return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})    VALUE(DSPPFM FILE(${node.libraryname.trim()}/${node.physicalfile.trim()}) MBR(${node.member ? node.member.trim() : ''}))`;
    else return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})    VALUE(DSPPFM FILE(${node.libraryname ? node.libraryname.trim() : ''}) MBR(${node.member ? node.member.trim() : ''}))`
};

/**
 * Convert the LOG node into apicl command
 * LOG : Log out particular message or variable
 * @param node  Command Obect for LOG
 * @returns LOG apicl command
 */
const _convertForLog = function (node) {
    return `LOG MSG(${node.log ? node.log.trim() : ''})`;
};

/**
 * Convert the CALL node into apicl command
 * CALL : To Call the Program
 * @param node  Command Obect for CALL
 * @returns CALL apicl command
 */
const _convertForCall = function (node) {
    let cmdString;
    if (node.libraryname && node.libraryname != '' && node.programname && node.programname != '')
        cmdString = `CALL PGM(${node.libraryname.trim()}/${node.programname.trim()})`;
    else cmdString = `CALL PGM(${node.libraryname ? node.libraryname.trim() : ''})`;
    // to fetch and process the params , which were added dynamically
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0)
            cmdString += ` PARM(${listBoxValues.filter(Boolean).join(" ")})`;
    }
    else cmdString += ` PARM()`
    return cmdString;
};

/**
 * Convert the RUNSQLPRC node into apicl command
 * RUNSQLPRC : Execute the Stored Procedure
 * @param node  Command Obect for RUNSQLPRC
 * @returns RUNSQLPRC apicl command
 */
const _convertForRunsqlprc = function (node) {
    let cmdString;
    if (node.libraryname && node.libraryname != '' && node.procedurename && node.procedurename != '')
        cmdString = `RUNSQLPRC PRC(${node.libraryname.trim()}/${node.procedurename.trim()})`;
    else cmdString = `RUNSQLPRC PRC(${node.libraryname ? node.libraryname.trim() : ''})`;

    let paramString = '';
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0) for (let values of listBoxValues)
            if (values.some(value => value != "")) paramString += values.join("") + " ";

        cmdString += ` PARM(${paramString.trim()})`;
    }
    else cmdString += ` PARM()`
    return cmdString;
};

/**
 * Convert the REST node into apicl command
 * REST : To Call the REST URL
 * @param node  Command Obect for REST
 * @returns REST apicl command
 */
const _convertForRest = function (node) {

    let cmdString = `REST URL(${node.url ? node.url.trim() : ''}) METHOD(${node.method ? node.method.trim() : ''}) ` +
        ` HEADERS(${node.headers ? node.headers.trim() : ''}) PARM(${node.parameter ? node.parameter.trim() : ''})`;
    if (node.result)
        cmdString = `CHGVAR VAR(${node.result ? node.result.trim() : ''}) VALUE(${cmdString})`;
    return cmdString;
};

/**
 * Convert the JSONATA node into apicl command
 * JSONATA : To execute the JSONATA expression
 * @param node  Command Obect for JSONATA
 * @returns JSONATA apicl command
 */
const _convertForJsonata = function (node) {
    return `CHGVAR  VAR(${node.result ? node.result.trim() : ''})  VALUE(JSONATA EXPRESSION(${node.jsonata ? node.jsonata.trim() : ''}))`;
};

/**
 * Convert the MAP node into apicl command
 * MAP : To Extract the particular String
 * @param node  Command Obect for MAP
 * @returns MAP apicl command
 */
const _convertForMap = function (node) {
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        let mapVariables = [];
        if (listBoxValues && listBoxValues.length > 0)
            for (const variableObj of listBoxValues) {
                if (variableObj.some(value => value != "")) {
                    if (variableObj[4]) {
                        if (variableObj[0]) mapVariables.push(`${variableObj[0].trim()}:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}:${variableObj[4].trim()}`);
                        else mapVariables.push(`-:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}:${variableObj[4].trim()}`);
                    }
                    else { // in some cases we do not have string functions
                        if (variableObj[0]) mapVariables.push(`${variableObj[0].trim()}:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}`);
                        else mapVariables.push(`-:${variableObj[1].trim()}:${variableObj[2].trim()}:${variableObj[3].trim()}`);
                    }
                }
            }

        return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})   VALUE(MAP DO(${mapVariables.join(",")}))`;
    }
    else return `CHGVAR     VAR()   VALUE(MAP DO())`
};

/**
 * Convert the SCR READ node into apicl command
 * SCR READ : Screen Scrapping Read the coordinates
 * @param node  Command Obect for SCR READ
 * @returns SCR READ apicl command
 */
const _convertForScrread = function (node) {
    let readVariables = [];
    if (node.listbox) {
        let listBoxValues = JSON.parse(node.listbox);
        if (listBoxValues && listBoxValues.length > 0)
            for (const scrPropertiesObj of listBoxValues) {
                if (scrPropertiesObj.some(value => value != "")) readVariables.push(`${scrPropertiesObj[0].trim()},${scrPropertiesObj[1].trim()},${scrPropertiesObj[2].trim()},${scrPropertiesObj[3].trim()}`);
            }
        if (!node.result) return `SCR NAME(${node.session})   READ(${readVariables.join(" : ")})`;
        else return `CHGVAR     VAR(${node.result ? node.result.trim() : ''})   VALUE(SCR NAME(${node.session ? node.session.trim() : ''})   READ(${readVariables.join(" : ")}))`;
    }
    else return `SCR NAME()   READ()`;
};

/**
 * Convert the SCR KEYS node into apicl command
 * SCR KEYS : Screen Scrapping , hit the command and keys on particular coordinates
 * @param node  Command Obect for SCR KEYS
 * @returns SCR KEYS apicl command
 */
const _convertForScrkeys = function (node) {
    let keysVariables = [];
    let listBoxValues = JSON.parse(node.listbox);
    if (node.listbox) {
        if (listBoxValues && listBoxValues.length > 0)
            for (const scrPropertiesObj of listBoxValues) {
                if (scrPropertiesObj.some(value => value != "")) keysVariables.push(`${scrPropertiesObj[0].trim()},${scrPropertiesObj[1].trim()},${scrPropertiesObj[2].trim()}`);
            }
        return `SCR NAME(${node.session ? node.session : ''})   KEYS(${keysVariables.join(" : ")})`;
    }
    else return `SCR NAME()   KEYS()`
};

/**
 * Convert the SCR OPS node into apicl command
 * SCR OPS : Screen Scrapping , start , release and stop the session
 * @param node  Command Obect for SCR OPS
 * @returns SCR OPS apicl command
 */
const _convertForScrops = function (node, nodes) {
    const nextNode = checkNodeInAllNodes(node, nodes);
    if (node && node.scrops == "start" && node.pool != "" && nextNode.nodeName == "scrkeys") {
            let keys = _convertForScrkeys(nextNode).match(/KEYS\(.+\)/i)[0];
             nodes.splice(nodes.indexOf(nextNode), 1);  
             const nextNodeafterkeysnode = checkNodeInAllNodes(nextNode , nodes);  

            if(nextNodeafterkeysnode) nextNodeafterkeysnode.dependencies=[node.id];
            return `SCR NAME(${node.session ? node.session : ''}) START ${keys} POOL(${node.pool})`;;   
    }

    else return `SCR NAME(${node.session ? node.session : ''}) ${node.scrops ? node.scrops.toUpperCase() : ''}`;

};

/**
 * Convert the RUNJS MOD node into apicl command
 * RUNJS MOD : Execute the Javascript Code
 * @param node  Command Obect for RUNJS MOD
 * @returns RUNJS MOD apicl command
 */
const _convertForMod = function (node) {
    return `RUNJS MOD(${node.modulename || ''})`;
};

/**
 * Convert the SUBSTR node into apicl command
 * SUBSTR : To Extract out the Substring from a String
 * @param node  Command Obect for SUBSTR
 * @returns SUBSTR apicl command
 */
const _convertForSubstr = function (node) {
    return `CHGVAR  VAR(${node.variable ? node.variable.trim() : ''})  VALUE(SUBSTR DO(${node.string ? node.string.trim() : ''}:${node.index ? node.index.trim() : ''}:${node.noofchar ? node.noofchar.trim() : ''}))`
};

/**
 * Convert the ENDAPI node into apicl command
 * ENDAPI : To End the API
 * @param node  Command Obect for ENDAPI
 * @returns ENDAPI apicl command
 */
const _convertForEndapi = function () {
    return `ENDAPI`;
};

/**
 * To check next command node id, particularly in GOTO case
 * @param {*} nodeObj Command Object
 * @param {*} nodes All the Command's Object
 * @returns 
 */
const _saveNextNodeIdsInFlow = function (nodeObj, nodes) {
    let nextNodeObj = checkNodeInAllNodes(nodeObj, nodes);
    if (nextNodeObj && nextNodeObj.id && nextNodeObj.nodeName != 'condition') {
        nodeToAddLater.push(nextNodeObj.id);
        _saveNextNodeIdsInFlow(nextNodeObj, nodes);
    } else {
        return;
    }
};

/**
 * Fecth the node which was included in the dependencies of other node
 * @param {*} node Command Object
 * @param {*} allnodes All the Commmand's Object
 * @returns found node object
 */
const checkNodeInAllNodes = function (node, allnodes) {

    if (allnodes && allnodes.length > 0)
        for (const nodeObj of allnodes) {
            if (nodeObj && nodeObj.dependencies && nodeObj.dependencies.length > 0) {
                if (nodeObj.dependencies.includes(node.id)) {
                    return nodeObj;
                }
            }
        }
};

/**
 * Set the Indexing of the APICL
 * @param {*} apicl 
 * @returns Final converted APICL
 */
const _setIndexing = function (apicl) {

    let finalAPICL = {};
    let index = 0;
    let idIndexMapping = {};
    for (const id in apicl) {
        finalAPICL[++index] = apicl[id];
        idIndexMapping[id] = index;
    }
    return _assignIndexIfInGOTO(idIndexMapping, finalAPICL);
};

/**
 * To set the index on GOTO command
 * @param {*} idIndexMapping Array which containg all the index, based on the id
 * @param {*} finalAPICL Final APICL json , which has the index , but GOTO needs to be resolved with indexing
 * @returns APICL after fix the GOTO command
 */
const _assignIndexIfInGOTO = function (idIndexMapping, finalAPICL) {

    let chgArr = [], index;
    let apiclString = JSON.stringify(finalAPICL);
    for (let id in idIndexMapping) {
        index = idIndexMapping[id];
        if (id.includes("_")) { chgArr = id.split("_"); }
        id = (chgArr && chgArr.length > 0) ? chgArr[0] : id;
        apiclString = apiclString.replaceAll(id, index);
    }

    return JSON.parse(apiclString);
}


export const algos = { sortDependencies, convertIntoAPICL, checkNodeInAllNodes };