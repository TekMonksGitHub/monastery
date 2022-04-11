/** 
 * Some algorithms for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
 import {util} from "/framework/js/util.mjs";
 let apicl = {},goto = [],nodeAlreadyAdded = [];


 /**
 * Sorts a graph into a linear list with increasing order of indexing
 * @param nodes The incoming graph to sort, the format should be {id:, dependencies:[array_of_ids]}
 * @returns The sorted graph in which they have the connection , {id:, dependencies:[array_of_ids]}
 */
function sortDependencies(nodes) { 
    console.log(nodes);
    
    const nodesToWorkOn = util.clone(nodes.commands), sortedSet = [], stopNodeIds = [], futureCurrentNode = [];
    let nextCurrentNodeId;

    for (const node of nodesToWorkOn) if ((!node.dependencies) || (!node.dependencies.length)) sortedSet.push(_arrayDelete(nodesToWorkOn, node));

    let icounter = [], dependencyCheck;
    let currentNodeId = sortedSet.slice(-1)[0].id; // last command id , to be searched in dependencies of remaininge nodes/commands
    for (let i=0;i<nodesToWorkOn.length;i++) {
        let flag=0;
        dependencyCheck = 0;
        currentNodeId = (nextCurrentNodeId ? nextCurrentNodeId : currentNodeId);
        if (stopNodeIds && stopNodeIds.length>0 && stopNodeIds.includes(currentNodeId) && futureCurrentNode && futureCurrentNode.length>0) { 
            sortedSet.push(futureCurrentNode[0]);
            currentNodeId = futureCurrentNode[0].id; 
            _arrayDelete(futureCurrentNode,futureCurrentNode[0]);  
        } 
        for (let nodeIn of nodesToWorkOn) {
            console.log("currentNodeId : ",currentNodeId, " | nodeName : " , nodeIn.nodeName," | dependencies : ",nodeIn.dependencies , " | nodeIn.id : ", nodeIn.id );
            console.log("icopunter", icounter , "dependencyCheck", dependencyCheck );
            if (nodeIn.dependencies?.includes(currentNodeId)) { 
                if(nodeIn.dependencies.length>1){
                    console.log("- more than 2 dependencies -");
                    if(stopNodeIds.indexOf(nodeIn.id) === -1) { stopNodeIds.push(nodeIn.id); }
                }
                if(flag==1) { futureCurrentNode.push(nodeIn);  icounter.push(i); }
                else { sortedSet.push(nodeIn); nextCurrentNodeId = nodeIn.id; flag=1; }
                console.log("futureCurrentNode = ",futureCurrentNode[0], "stopNodeIds = ",stopNodeIds);
                dependencyCheck = 1;
            }
        }
        if(icounter && icounter.length>0 && dependencyCheck==0 ) {
            i = icounter[0]; _arrayDelete(icounter,i);
            sortedSet.push(futureCurrentNode[0]);
            nextCurrentNodeId = futureCurrentNode[0].id; 
            _arrayDelete(futureCurrentNode,futureCurrentNode[0]);  
        }
    }
    return sortedSet;
}

const _arrayDelete = (array, element) => {if (array.includes(element)) array.splice(array.indexOf(element), 1); return element;}


/**
 * Convert the sorted dependencies into the final APICL for output
 * @param nodes The incoming sorted graph, the format should be {commands:,[array_of_command]}
 * @returns The json with collection of key value pair, { "index:" : "command" }
 */
const convertIntoAPICL = function(nodes) {
    
    apicl = {};
    for (const node of nodes) {

        console.log(node);
        console.log(node.nodeName);
        if (node.nodeName=='strapi') { apicl[node.id] = _convertForStrapi(node) }
        else if (node.nodeName=='runsql' && !nodeAlreadyAdded.includes(node.id)) { apicl[node.id] = _convertForRunsql(node) }
        else if (node.nodeName=='runjs') { apicl[node.id] = _convertForRunjs(node) }
        else if (node.nodeName=='sndapimsg') { apicl[node.id] = _convertForSndapimsg(node) }
        else if (node.nodeName=='chgvar') { _convertForChgvar(node) }
        else if (node.nodeName=='condition') { apicl[node.id] = _convertForCondition(node,nodes) }
        else if (node.nodeName=='goto' && !nodeAlreadyAdded.includes(node.id)) { apicl[node.id] = _convertForGoto(node,nodes) }
        else if (node.nodeName=='endapi') { apicl[node.id] = _convertForEndapi(node) }
        else if (node.nodeName=='chgdtaara') { apicl[node.id] = _convertForChgdtaara(node) }
        else if (node.nodeName=='call') { apicl[node.id] = _convertForCall(node) }
        else if (node.nodeName=='runsqlprc') { apicl[node.id] = _convertForRunsqlprc(node) }
     
    }
    console.log(apicl);
    console.log('Sorting Indexing');
    apicl = _sortIndexing(apicl);
    console.log(apicl);

    return apicl;
};

const _convertForStrapi = function(node) {

    let cmdString = 'STRAPI()';
    if (node.parameters && node.parameters.length!=0)
        return cmdString = cmdString.replace(`()`,`(&${node.parameters.join(' &')})`);
    else     
        return cmdString;
};

const _convertForRunsql = function(node) {

    let cmdString = `RUNSQL SQL(${node.sql||''})`;
    if(node.sql && node.sql.includes("SELECT"))
        cmdString += ` TRIM(TRUE)`;
    if(node.result && node.result!='')
        cmdString = `CHGVAR     VAR(&${node.result})   VALUE(${cmdString})`;
    return cmdString;
};

const _convertForRunjs = function(node) { return `RUNJS JS(${node.code||''})`; };

const _convertForSndapimsg = function(node) { 
    let cmdString = 'SNDAPIMSG  MSG()';
    if (node.parameters && node.parameters.length!=0)
        return cmdString.replace(`()`,`(&${node.parameters.join(' &')})`);
    else     
        return cmdString;
};

const _convertForChgvar = function(node) { 

    let count = 1;
    if (node.variables && node.variables.length>0)
        for(const variableObj of node.variables) {
            let cmdString = 'CHGVAR     VAR()   VALUE()';
            cmdString = cmdString.replace(`VAR()`,`VAR('&${variableObj[0]||''}')`);
            cmdString = cmdString.replace(`VALUE()`,`VALUE('${variableObj[1]||''}')`);
            apicl[`${node.id}_${count++}`] = cmdString;
            console.log(cmdString);
        }
};

const _convertForCondition = function(node,nodes) { 

    let nextIdentifiedNodeObj;
    let cmdString = `IF COND(${node.condition||''})`;
    for (const nodeObj of nodes) {
        if (nodeObj.dependencies && nodeObj.dependencies.length>0){
            if(nodeObj.dependencies.includes(node.id)) {
                if (nodeObj.nodeName=='iftrue') { 
                    nextIdentifiedNodeObj = _checkNodeInAllNodes(nodeObj,nodes);
                    if (nextIdentifiedNodeObj && nextIdentifiedNodeObj.nodeName=='runsql') {
                        cmdString = cmdString.concat(` THEN( ${_convertForRunsql(nextIdentifiedNodeObj)})`); 
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    }
                    else if (nextIdentifiedNodeObj && nextIdentifiedNodeObj.nodeName=='goto') {
                        cmdString = cmdString.concat(` THEN( ${_convertForGoto(nextIdentifiedNodeObj,nodes)})`); 
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    } 
                    else
                        cmdString = cmdString.concat(` THEN(${nodeObj.true||''})`); 
                }
                else if (nodeObj.nodeName=='iffalse') { 
                    nextIdentifiedNodeObj = _checkNodeInAllNodes(nodeObj,nodes);
                    if (nextIdentifiedNodeObj && nextIdentifiedNodeObj.nodeName=='runsql') {
                        cmdString = cmdString.concat(` ELSE( ${_convertForRunsql(nextIdentifiedNodeObj)})`); 
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    } else if (nextIdentifiedNodeObj && nextIdentifiedNodeObj.nodeName=='goto'){
                        cmdString = cmdString.concat(` ELSE( ${_convertForGoto(nextIdentifiedNodeObj,nodes)})`); 
                        nodeAlreadyAdded.push(nextIdentifiedNodeObj.id);
                    } 
                    else
                        cmdString = cmdString.concat(` ELSE(${nodeObj.false||''})`); 
                }
            }
        }
    }
            
    return cmdString; 
};

const _checkNodeInAllNodes = function(node,allnodes) { 
    
    if (allnodes && allnodes.length>0)
    for (const nodeObj of allnodes) {
        if (nodeObj.dependencies && nodeObj.dependencies.length>0){
            if(nodeObj.dependencies.includes(node.id)) {
                return nodeObj;
            }
        }
    }

}

const _convertForGoto = function(node,nodes) { 
    let gotoNextNode = _checkNodeInAllNodes(node,nodes);
    return `GOTO ${gotoNextNode.id||''}`; 
};

const _convertForEndapi = function(node) { 
    return `ENDAPI`; 
};

const _convertForChgdtaara = function(node) { 

    let cmdString = `CHGDTAARA DTAARA(${node.libraryname||''}/${node.dataarea||''})`.toUpperCase();
    if(node.dropdown && node.dropdown.includes("Character"))
        cmdString += ` TYPE(*CHAR)`;
    if(node.dropdown && node.dropdown.includes("Big Decimal"))
        cmdString += ` TYPE(*BIGDEC)`;
    if(node.value && node.value!='')
        cmdString += ` VALUE(&${node.value})`;
    return cmdString;
};

const _convertForCall = function(node) { 

    let cmdString = `CALL PGM(${node.library||''}/${node.program||''})`.toUpperCase();
    if (node.parameters && node.parameters.length>0)
        cmdString += ` PARM ('&${node.parameters.join("' '&")}')`;

    return cmdString;
};

const _convertForRunsqlprc = function(node) { 

    let cmdString = `RUNSQLPRC PRC(${node.library||''}/${node.procedure||''})`.toUpperCase();
    if (node.parameters && node.parameters.length>0)
        cmdString += ` PARM (&${node.parameters.join(' &')})`;

    return cmdString;
};

const _sortIndexing = function(apicl) { 

    let finalAPICL = {};
    let index = 0;
    let idIndexMapping = {};
    for (const id in apicl) {
        finalAPICL[++index] = apicl[id];
        idIndexMapping[id] = index;
    }
    return _assignIndexIfInGOTO(idIndexMapping,finalAPICL);

};

const _assignIndexIfInGOTO = function(idIndexMapping,finalAPICL) {

    let chgArr=[],index;
    let apiclString = JSON.stringify(finalAPICL);
    for (let id in idIndexMapping) {
        index = idIndexMapping[id];
        if (id.includes("_")) { chgArr = id.split("_");}
        id = (chgArr && chgArr.length>0)?chgArr[0]:id;
        apiclString = apiclString.replaceAll(id,index);
    }
        
    return JSON.parse(apiclString);
}


export const algos = {sortDependencies,convertIntoAPICL,_convertForStrapi};