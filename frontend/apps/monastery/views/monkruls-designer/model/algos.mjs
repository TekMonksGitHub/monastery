/** 
 * Some algorithms for Monkruls application.
 * (C) 2021 TekMonks. All rights reserved.
 * License: See enclosed LICENSE file.
 */
import {util} from "/framework/js/util.mjs";

/**
 * Sorts a graph into a linear list in dependency order, using Kahn's algorithm for Topological sorting
 * @param nodes The incoming graph to sort, the format should be {id:, dependencies:[array_of_ids]}
 * @returns The sorted list as an array, or null if there are cycles in the graph
 */
function sortDependencies(nodes) { 
    const setOfNoDependencies = [], nodesToWorkOn = util.clone(nodes), sortedSet = [];
    for (const node of nodesToWorkOn) if ((!node.dependencies) || (!node.dependencies.length)) setOfNoDependencies.push(_arrayDelete(nodesToWorkOn, node));

    while (setOfNoDependencies.length) {
        const nodeToAdd = _arrayDelete(setOfNoDependencies, setOfNoDependencies[0]);
        sortedSet.push(nodeToAdd); 
        for (const node of nodesToWorkOn) {
            if (node.dependencies?.includes(nodeToAdd.id)) _arrayDelete(node.dependencies, nodeToAdd.id);
            if (!node.dependencies?.length) setOfNoDependencies.push(_arrayDelete(nodesToWorkOn, node));
        }
    }

    if (nodesToWorkOn.length) {
        LOG.error("Cycles in Topological sorting, bad dependency chart."); 
        return null; 
    } else {
        const rearrangedNodes = []; for (const node of sortedSet) for (const nodeIn of nodes) if (nodeIn.id == node.id) rearrangedNodes.push(nodeIn);
        return rearrangedNodes;
    }
}

const _arrayDelete = (array, element) => {if (array.includes(element)) array.splice(array.indexOf(element), 1); return element;}

export const algos = {sortDependencies};