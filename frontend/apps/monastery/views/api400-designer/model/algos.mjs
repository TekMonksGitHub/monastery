/** 
 * Some algorithms for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";

/**
 * Sorts a graph into a linear list with increasing order of indexing
 * @param nodes The incoming graph to sort, the format should be {id:, dependencies:[array_of_ids]}
 * @returns The sorted graph in which they have the connection , {id:, dependencies:[array_of_ids]}
 */
function sortDependencies(nodes) { 

    const nodesToWorkOn = util.clone(nodes.commands), sortedSet = [];

    for (const node of nodesToWorkOn) if ((!node.dependencies) || (!node.dependencies.length)) sortedSet.push(_arrayDelete(nodesToWorkOn, node));

    let currentNodeId = sortedSet.slice(-1)[0].id; // last command id , to be searched in dependencies of remaininge nodes/commands
    for (let i=0;i<nodesToWorkOn.length;i++) {
        for (let nodeIn of nodesToWorkOn) {
            if (nodeIn.dependencies?.includes(currentNodeId)) { sortedSet.push(nodeIn); currentNodeId = nodeIn.id; }
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
function convertIntoAPICL(nodes) { 

    console.log("convertIntoAPICL");

    
    for (const node of nodes) {
        console.log(CONSTANTS);
        console.log(node);
        console.log("./commands/"+node.nodeName+".js");
        
        let cmd = require("commands/"+node.nodeName+".js").convertCmd(node);
        console.log(cmd);
    }

}


export const algos = {sortDependencies,convertIntoAPICL};